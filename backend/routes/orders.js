import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { authenticateToken } from '../middleware/auth.js';
import { io } from '../server.js';

const router = express.Router();

// Get all orders for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('items.product')
      .sort({ orderDate: -1 });

    res.json({
      success: true,
      orders: orders.map(order => ({
        id: order._id.toString(),
        userId: order.userId.toString(),
        items: order.items.map(item => ({
          product: {
            _id: item.product._id.toString(),
            id: item.product._id.toString(),
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            image: item.product.image,
            category: item.product.category,
            stock: item.product.stock
          },
          quantity: item.quantity
        })),
        total: order.total,
        status: order.status,
        orderDate: order.orderDate,
        deliveryAddress: order.deliveryAddress,
        notes: order.notes,
        paymentMethod: order.paymentMethod
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
        items: order.items.map(item => ({
          product: {
            _id: item.product._id.toString(),
            id: item.product._id.toString(),
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            image: item.product.image,
            category: item.product.category,
            stock: item.product.stock
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

    if (!paymentMethod || !['cash', 'card', 'paypal', 'upi'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment method is required'
      });
    }

    // Validate and process items
    const processedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      // Validate product exists
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`
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

    // Add tax and shipping (8% tax, $5.99 shipping under $50)
    const subtotal = calculatedTotal;
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 5.99;
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

    // Create the order with explicit userId
    const orderData = {
      userId: req.user.id,
      items: processedItems,
      total: Number(total.toFixed(2)),
      status: 'pending',
      deliveryAddress,
      notes: notes || '',
      paymentMethod,
      orderDate: new Date()
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
        id: populatedOrder._id.toString(),
        userId: populatedOrder.userId.toString(),
        items: populatedOrder.items.map(item => ({
          product: {
            _id: item.product._id.toString(),
            id: item.product._id.toString(),
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            image: item.product.image,
            category: item.product.category,
            stock: item.product.stock
          },
          quantity: item.quantity
        })),
        total: populatedOrder.total,
        status: populatedOrder.status,
        orderDate: populatedOrder.orderDate,
        deliveryAddress: populatedOrder.deliveryAddress,
        notes: populatedOrder.notes,
        paymentMethod: populatedOrder.paymentMethod
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

// Get all orders (admin only)
router.get('/admin/all', authenticateToken, async (req, res) => {
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
        userId: order.userId._id.toString(),
        userName: order.userId.username,
        userEmail: order.userId.email,
        items: order.items.map(item => ({
          product: {
            _id: item.product._id.toString(),
            id: item.product._id.toString(),
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            image: item.product.image,
            category: item.product.category
          },
          quantity: item.quantity
        })),
        total: order.total,
        status: order.status,
        orderDate: order.orderDate,
        deliveryAddress: order.deliveryAddress,
        notes: order.notes,
        paymentMethod: order.paymentMethod
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

export default router;