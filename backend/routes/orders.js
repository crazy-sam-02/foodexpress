import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdminSession } from '../middleware/adminSession.js';
import { io } from '../server.js';

const router = express.Router();

// Get all orders for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log(`[Orders] Fetching orders for user: ${req.user.id}`);
    
    const orders = await Order.find({ userId: req.user.id })
      .populate('items.product')
      .sort({ orderDate: -1 });

    console.log(`[Orders] Found ${orders.length} orders for user ${req.user.id}`);
    
    // Check for orders with null products
    const ordersWithNullProducts = orders.filter(order => 
      order.items.some(item => !item.product)
    );
    
    if (ordersWithNullProducts.length > 0) {
      console.warn(`[Orders] Found ${ordersWithNullProducts.length} orders with null products:`, 
        ordersWithNullProducts.map(o => ({ id: o._id, itemsWithNullProducts: o.items.filter(i => !i.product).length }))
      );
    }

    res.json({
      success: true,
      orders: orders.map(order => ({
        id: order._id.toString(),
        userId: order.userId.toString(),
        items: order.items
          .filter(item => item.product) // Filter out items with null products
          .map(item => ({
            product: {
              _id: item.product._id.toString(),
              id: item.product._id.toString(),
              name: item.product.name || 'Unknown Product',
              description: item.product.description || '',
              price: item.product.price || 0,
              image: item.product.image || '/placeholder-image.jpg',
              category: item.product.category || 'uncategorized',
              stock: item.product.stock || 0
            },
            quantity: item.quantity
          })),
        total: order.total,
        status: order.status,
        orderDate: order.orderDate,
        deliveryAddress: order.deliveryAddress,
        notes: order.notes || '',
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber || null,
        estimatedDelivery: order.estimatedDelivery || null,
        actualDelivery: order.actualDelivery || null,
        adminNotes: order.adminNotes || '',
        statusHistory: order.statusHistory || [],
        orderAction: order.orderAction || 'none',
        discount: order.discount || 0,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get a specific order by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if the order belongs to the authenticated user
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    res.json({
      success: true,
      order: {
        id: order._id.toString(),
        userId: order.userId.toString(),
        items: order.items
          .filter(item => item.product) // Filter out items with null products
          .map(item => ({
            product: {
              _id: item.product._id.toString(),
              id: item.product._id.toString(),
              name: item.product.name || 'Unknown Product',
              description: item.product.description || '',
              price: item.product.price || 0,
              image: item.product.image || '/placeholder-image.jpg',
              category: item.product.category || 'uncategorized',
              stock: item.product.stock || 0
            },
            quantity: item.quantity
          })),
        total: order.total,
        status: order.status,
        orderDate: order.orderDate,
        deliveryAddress: order.deliveryAddress,
        notes: order.notes,
        paymentMethod: order.paymentMethod
      }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

// Create a new order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, total, deliveryAddress, notes, paymentMethod } = req.body;

    console.log('Received order request from user:', req.user);
    console.log('Order data:', { items, total, deliveryAddress, paymentMethod });

    // Validate user ID
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication failed - no user ID found'
      });
    }

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!total || total <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order total'
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required'
      });
    }

    if (!paymentMethod || !['cash', 'card', 'paypal', 'upi', 'CASH', 'CARD', 'PAYPAL', 'UPI'].includes(paymentMethod.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment method is required (cash, card, paypal, or upi)'
      });
    }

    // Validate and process items
    const processedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      // Validate product ID format
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID: ${item.product}`
        });
      }

      // Validate product exists
      const product = await Product.findById(item.product);
      if (!product) {
        console.warn(`[Order Creation] Product not found: ${item.product}`);
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}. The product may have been removed.`
        });
      }

      // Validate quantity
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product: ${product.name}`
        });
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}`
        });
      }

      processedItems.push({
        product: product._id,
        quantity: item.quantity
      });

      calculatedTotal += product.price * item.quantity;
    }

    // Add tax and shipping (8% tax, ₹499 shipping under ₹500)
    const subtotal = calculatedTotal;
    const tax = subtotal * 0.08;
    const shipping = subtotal > 500 ? 0 : 499;
    calculatedTotal = subtotal + tax + shipping;

    // Verify the total matches (with small tolerance for floating point)
    if (Math.abs(calculatedTotal - total) > 0.01) {
      console.log('Total mismatch:', { calculated: calculatedTotal, received: total });
      return res.status(400).json({
        success: false,
        message: 'Order total mismatch. Please refresh and try again.',
        details: { calculated: calculatedTotal.toFixed(2), received: total.toFixed(2) }
      });
    }

    // Create the order with explicit userId and initial status history
    const orderData = {
      userId: req.user.id,
      items: processedItems,
      total: Number(total.toFixed(2)),
      status: 'pending',
      deliveryAddress,
      notes: notes || '',
      paymentMethod: paymentMethod.toLowerCase(),
      orderDate: new Date(),
      orderAction: 'none',
      discount: 0,
      adminNotes: '',
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        updatedBy: 'system',
        notes: 'Order placed successfully'
      }]
    };

    console.log('Creating order with data:', orderData);

    const newOrder = new Order(orderData);
    await newOrder.save();

    console.log('Order saved successfully:', newOrder._id);

    // Update product stock
    for (const item of processedItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Populate the order with product details
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('items.product');

    // Emit socket event for real-time order updates (for admin dashboard)
    io.emit('newOrder', {
      orderId: populatedOrder._id.toString(),
      userId: req.user.id,
      total: populatedOrder.total,
      status: populatedOrder.status,
      orderDate: populatedOrder.orderDate
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        _id: populatedOrder._id.toString(),
        id: populatedOrder._id.toString(),
        userId: populatedOrder.userId.toString(),
        items: populatedOrder.items
          .filter(item => item.product) // Filter out items with null products
          .map(item => ({
            product: {
              _id: item.product._id.toString(),
              id: item.product._id.toString(),
              name: item.product.name || 'Unknown Product',
              description: item.product.description || '',
              price: item.product.price || 0,
              image: item.product.image || '/placeholder-image.jpg',
              category: item.product.category || 'uncategorized',
              stock: item.product.stock || 0
            },
            quantity: item.quantity
          })),
        total: populatedOrder.total,
        status: populatedOrder.status,
        orderDate: populatedOrder.orderDate,
        deliveryAddress: populatedOrder.deliveryAddress,
        notes: populatedOrder.notes,
        paymentMethod: populatedOrder.paymentMethod,
        trackingNumber: populatedOrder.trackingNumber,
        estimatedDelivery: populatedOrder.estimatedDelivery,
        actualDelivery: populatedOrder.actualDelivery,
        adminNotes: populatedOrder.adminNotes,
        statusHistory: populatedOrder.statusHistory,
        orderAction: populatedOrder.orderAction,
        discount: populatedOrder.discount,
        createdAt: populatedOrder.createdAt,
        updatedAt: populatedOrder.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Update order status (admin only)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Emit socket event for real-time updates
    io.emit('orderStatusUpdated', {
      orderId: order._id.toString(),
      status: order.status
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        id: order._id.toString(),
        status: order.status
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Get all orders (admin only) - protected by admin session
router.get('/admin/all', requireAdminSession, async (req, res) => {
  try {
    // TODO: Add admin role check middleware
    const orders = await Order.find()
      .populate('items.product')
      .populate('userId', 'username email')
      .sort({ orderDate: -1 });

    res.json({
      success: true,
      orders: orders.map(order => ({
        id: order._id.toString(),
        userId: order.userId ? order.userId._id.toString() : null,
        userName: order.userId ? order.userId.username : 'N/A',
        userEmail: order.userId ? order.userId.email : 'N/A',
        items: order.items
          .filter(item => item.product) // Filter out items with null products
          .map(item => ({
            product: {
              _id: item.product._id.toString(),
              id: item.product._id.toString(),
              name: item.product.name || 'Unknown Product',
              description: item.product.description || '',
              price: item.product.price || 0,
              image: item.product.image || '/placeholder-image.jpg',
              category: item.product.category || 'uncategorized'
            },
            quantity: item.quantity
          })),
        total: order.total,
        status: order.status,
        orderDate: order.orderDate,
        deliveryAddress: order.deliveryAddress,
        notes: order.notes,
        paymentMethod: order.paymentMethod,
        orderAction: order.orderAction,
        discount: order.discount
      }))
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Update order details (admin only)
router.patch('/admin/:id', requireAdminSession, async (req, res) => {
  try {
    const { 
      status, 
      orderAction, 
      discount, 
      trackingNumber, 
      estimatedDelivery, 
      adminNotes, 
      statusChangeNotes 
    } = req.body;
    
    console.log('[Admin] Update order request received:', { 
      id: req.params.id, 
      status, 
      orderAction, 
      discount, 
      trackingNumber, 
      estimatedDelivery,
      adminNotes 
    });

    // Validate input
    if (status && !['pending', 'confirmed', 'preparing', 'ready', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    if (discount && (isNaN(discount) || discount < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount value'
      });
    }

    if (estimatedDelivery && isNaN(Date.parse(estimatedDelivery))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid estimated delivery date'
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (orderAction) updateData.orderAction = orderAction;
    if (discount !== undefined) updateData.discount = discount;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
    if (adminNotes) updateData.adminNotes = adminNotes;

    // Set admin info for status history tracking
    if (status) {
      updateData._adminUpdatedBy = req.session?.adminUser?.email || 'admin';
      updateData._statusChangeNotes = statusChangeNotes || '';
    }

    console.log('[Admin] Updating order with data:', updateData);

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('items.product').populate('userId', 'username email');

    if (!order) {
      console.warn('[Admin] Order not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('[Admin] Order updated successfully:', order._id);

    // Emit socket event for real-time updates
    io.emit('orderUpdated', {
      orderId: order._id.toString(),
      ...updateData
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
});

// Add specific route for status updates to match frontend expectations
router.patch('/admin/:id/status', requireAdminSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log('[Admin] Update status request received:', { id, status });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.warn('[Admin] Invalid order ID format:', id);
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);
    if (!order) {
      console.warn('[Admin] Order not found for ID:', id);
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    console.log('[Admin] Order status updated successfully:', { id, status });
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('[Admin] Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

export default router;