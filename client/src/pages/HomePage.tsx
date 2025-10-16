import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowRight, Heart } from 'lucide-react';
import { useProducts } from '@/contexts/ProductsContext';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';

const HomePage = () => {
  const { products = [], categories = [] } = useProducts() || {};
  const { addToCart } = useCart();

  const featuredProducts = products?.filter((p) => p?.inStock)?.slice(0, 8) || [];
  const topCategories = categories?.slice(0, 6) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-amber-900 mb-6">
              Sweet Treats Bakery
            </h1>
            <p className="text-xl text-amber-700 mb-8">
              Freshly baked goods made with love, delivered to your doorstep. 
              From celebration cakes to daily bread, we craft every item with the finest ingredients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                  Shop Now <ShoppingCart className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-amber-600 text-amber-600 hover:bg-amber-50"
                >
                  Browse Categories <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our wide range of freshly baked goods, from celebration cakes to everyday essentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCategories.length > 0 ? (
              topCategories.map((category) => (
                <Link
                  key={category?._id || category?.name}
                  to={`/products?category=${encodeURIComponent(category?.name || '')}`}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={
                          category?.image ||
                          'https://via.placeholder.com/400x250?text=No+Image'
                        }
                        alt={category?.name || 'Category'}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl text-amber-900">
                          {category?.name || 'Unnamed'}
                        </CardTitle>
                        <Badge variant="secondary">
                          {category?.productCount || 0} items
                        </Badge>
                      </div>
                      <CardDescription>
                        {category?.description || 'Explore our delicious range.'}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-full">
                No categories available.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our most popular items, loved by customers and baked fresh daily.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Card
                  key={product?._id || product?.name}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square overflow-hidden rounded-t-lg relative">
                    <img
                      src={
                        product?.image ||
                        'https://via.placeholder.com/300x300?text=No+Image'
                      }
                      alt={product?.name || 'Product'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {product?.name || 'Untitled Product'}
                      </h3>
                      <span className="text-lg font-bold text-amber-600">
                        ₹{product?.price || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product?.description || 'Delicious freshly baked item.'}
                    </p>

                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={() => addToCart && addToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-full">
                No featured products available.
              </p>
            )}
          </div>

          <div className="text-center mt-12">
            <Link to="/products">
              <Button
                variant="outline"
                size="lg"
                className="border-amber-600 text-amber-600 hover:bg-amber-50"
              >
                View All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🚚',
                title: 'Free Delivery',
                text: 'Free delivery on orders over ₹50 within the city limits.',
              },
              {
                icon: '🌱',
                title: 'Fresh Ingredients',
                text: 'We use only the finest, locally-sourced ingredients in all our products.',
              },
              {
                icon: '👨‍🍳',
                title: 'Made Fresh Daily',
                text: 'All our baked goods are made fresh every morning by our expert bakers.',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
