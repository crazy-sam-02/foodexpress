
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, ShoppingCart, Heart, Search } from 'lucide-react';
import { useProducts } from '@/contexts/ProductsContext';
import { Layout } from '@/components/layout/Layout';

const ProductsPage = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const { addToCart } = useCart();
  const { products, categories } = useProducts();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromUrl = params.get('category');
    if (categoryFromUrl) {
      // Find a matching category to ensure the case is correct
      const matchingCategory = categories.find(c => c.name.toLowerCase() === categoryFromUrl.toLowerCase());
      if (matchingCategory) setSelectedCategory(matchingCategory.name);
    }
  }, [location.search, categories]);

  const filteredProducts = products
    .filter(product => 
      product.inStock &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'All' || product.category === selectedCategory)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Products</h1>
          <p className="text-gray-600">Discover our complete range of freshly baked goods.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Results count */}
            <div className="flex items-center text-sm text-gray-600">
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.map((product: any) => (
            <Card key={product._id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-square overflow-hidden rounded-t-lg relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Badge 
                  className="absolute top-2 left-2 bg-amber-600 text-white"
                >
                  {product.category}
                </Badge>
              </div>
              <CardContent className="p-2 sm:p-4">
                <div className="flex justify-between items-start mb-1 sm:mb-2">
                  <h3 className="text-xs sm:text-base font-semibold text-gray-900 truncate">{product.name}</h3>
                  <span className="text-sm sm:text-lg font-bold text-amber-600">${product.price}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2 hidden sm:block">{product.description}</p>
                
                <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs sm:text-sm text-gray-600 ml-1">{product.rating}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">({product.reviews} reviews)</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-xs sm:text-sm h-8 sm:h-10"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add to Cart</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
    </Layout>
  );
};

export default ProductsPage;
