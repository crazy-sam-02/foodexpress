import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Download, Upload, Trash2, Edit } from 'lucide-react';
import { useProducts } from '@/contexts/ProductsContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Category } from '@/types';

const AdminCategoriesPage = () => {
  const { toast } = useToast();
  const { categories, addCategory, updateCategory, deleteCategory, products } = useProducts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', image: '' });
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCategory(formData);
    toast({
      title: "Category Added",
      description: `${formData.name} category has been added successfully.`,
    });
    setFormData({ name: '', description: '', image: '' });
    setShowAddForm(false);
  };

  const exportData = () => {
    const data = {
      products,
      categories,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bakery-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Data Exported",
      description: "Your products and categories data has been exported to JSON.",
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.products && data.categories) {
          localStorage.setItem('bakery_products', JSON.stringify(data.products));
          localStorage.setItem('bakery_categories', JSON.stringify(data.categories));
          toast({
            title: "Data Imported",
            description: "Data imported successfully. Please refresh the page to see changes.",
          });
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name,
      description: category.description,
      image: category.image
    });
  };

  const handleSaveEdit = () => {
    if (editingCategory) {
      updateCategory(editingCategory.id, editForm);
      toast({
        title: "Category Updated",
        description: `${editForm.name} has been updated successfully.`,
      });
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = () => {
    if (deletingCategoryId) {
      deleteCategory(deletingCategoryId);
      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully.",
      });
      setDeletingCategoryId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
            <p className="text-gray-600 mt-2">Manage your product categories and data</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddForm(true)} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
            <Button onClick={exportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
                id="import-data"
              />
              <Button asChild variant="outline">
                <label htmlFor="import-data" className="cursor-pointer flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </label>
              </Button>
            </div>
          </div>
        </div>

        {/* Add Category Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Special Occasions"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL *</Label>
                    <Input
                      id="image"
                      name="image"
                      type="url"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
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
                    placeholder="Describe this category..."
                    rows={3}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                    Add Category
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id}>
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <span className="text-sm text-gray-500">{category.productCount} products</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => setDeletingCategoryId(category.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Management Info */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Current Storage:</strong> All data is stored in your browser's localStorage</p>
              <p><strong>Export:</strong> Download your products and categories as a JSON file for backup</p>
              <p><strong>Import:</strong> Upload a previously exported JSON file to restore data</p>
              <p><strong>Manual Editing:</strong> You can also manually edit the exported JSON file and import it back</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Category Name</Label>
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
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-image">Image URL</Label>
              <Input
                id="edit-image"
                type="url"
                value={editForm.image}
                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCategoryId} onOpenChange={() => setDeletingCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;