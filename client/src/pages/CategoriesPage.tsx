
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductsContext';

const CategoriesPage = () => {
  const { categories, products, isLoading } = useProducts();

  // Since the backend now filters out medicine categories, we can use categories directly
  // But we still filter on frontend for additional safety
  const foodCategories = categories.filter(category => 
    category.productCount > 0 && // Only show categories with products
    products.some(product => 
      product.category === category.name && 
      product.productType !== 'medicine'
    )
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading categories...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Food Categories</h1>
          <p className="text-gray-600">Browse our delicious food selection by category</p>
        </div>

        {foodCategories.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No food categories available</h3>
            <p className="text-gray-600">Please check back later for our food categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {foodCategories.map((category: any) => (
            <Link key={category._id} to={`/products?category=${encodeURIComponent(category.name)}`} className="group">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-32 sm:h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform"
                  />
                </CardHeader>
                <CardContent className="p-2 sm:p-4">
                  <CardTitle className="text-sm sm:text-lg mb-1 sm:mb-2">{category.name}</CardTitle>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 hidden sm:block">{category.description}</p>
                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                    {category.productCount} items
                  </Badge>
                </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};export default CategoriesPage;
