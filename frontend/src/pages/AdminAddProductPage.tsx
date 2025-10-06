import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';
import { useProducts } from '@/contexts/ProductsContext';

const AdminAddProductPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addProduct, categories } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    tags: '',
    inStock: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Add the product using the context
    addProduct({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
      inStock: formData.inStock,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });

    toast({
      title: "Product Added Successfully",
      description: `${formData.name} has been added to your inventory.`,
    });

    setIsSubmitting(false);
    navigate('/admin/products');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600 mt-2">Add a new item to your bakery inventory</p>
          </div>
        </div>

        {/* Product Form */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Chocolate Fudge Cake"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inStock">Stock Status</Label>
                  <select
                    id="inStock"
                    name="inStock"
                    value={formData.inStock.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.value === 'true' }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="true">In Stock</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  type="url"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-gray-500">
                  Provide a URL to an image of your product
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="chocolate, birthday, celebration (comma-separated)"
                />
                <p className="text-sm text-gray-500">
                  Add tags separated by commas to help customers find your product
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding Product...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Add Product
                    </div>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate('/admin/products')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview Card */}
        {formData.name && (
          <Card>
            <CardHeader>
              <CardTitle>Product Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {formData.image && (
                  <img
                    src={formData.image}
                    alt={formData.name}
                    className="w-16 h-16 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{formData.name}</h3>
                  {formData.description && (
                    <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {formData.price && (
                      <span className="font-bold text-amber-600">${formData.price}</span>
                    )}
                    {formData.category && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                        {formData.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAddProductPage;