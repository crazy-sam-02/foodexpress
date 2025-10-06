import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProducts } from '@/contexts/ProductsContext';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types';

const AdminProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', price: 0, category: '' });
  const { toast } = useToast();
  const { products, deleteProduct, toggleProductStock, updateProduct } = useProducts();

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'All' || product.category === selectedCategory)
  );

  const handleDeleteProduct = (productId: Number, productName: string) => {
    deleteProduct(productId);
    toast({
      title: "Product Deleted",
      description: `${productName} has been removed from inventory.`,
    });
  };

  const handleToggleStock = (productId: number, productName: string, currentStock: boolean) => {
    toggleProductStock(productId);
    toast({
      title: "Stock Updated",
      description: `${productName} is now ${!currentStock ? 'in stock' : 'out of stock'}.`,
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category
    });
  };

  const handleSaveEdit = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, editForm);
      toast({
        title: "Product Updated",
        description: `${editForm.name} has been updated successfully.`,
      });
      setEditingProduct(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600 mt-2">Manage your bakery's product inventory</p>
          </div>
          <Link to="/admin/add-product">
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'All' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${product.price}</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={product.inStock ? "default" : "destructive"}
                          className={product.inStock ? "bg-green-100 text-green-800" : ""}
                        >
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleToggleStock(product.id, product.name, product.inStock)}
                          >
                            {product.inStock ? 'Mark Out' : 'Mark In'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProductsPage;