
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useProducts } from '@/contexts/ProductsContext';

const CategoriesPage = () => {
  const { categories } = useProducts();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Categories</h1>
          <p className="text-gray-600">Browse our delicious selection by category</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {categories.map((category: any) => (
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
      </div>
    </Layout>
  );
};

export default CategoriesPage;
