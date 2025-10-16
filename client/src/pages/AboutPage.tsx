
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';

const AboutPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About FoodExpress</h1>
            <p className="text-xl text-gray-600">
              Delivering delicious meals since 2025
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
                alt="Our bakery"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Sweet Treats began as a small family bakery with a simple mission: to bring joy 
                to people's lives through delicious, handcrafted baked goods. What started in 
                our home kitchen has grown into a beloved local bakery.
              </p>
              <p className="text-gray-600">
                Every day, we wake up early to bake fresh bread, decorate beautiful cakes, 
                and create sweet memories for our customers. We use only the finest ingredients 
                and time-honored techniques passed down through generations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🥖</div>
                <h3 className="text-lg font-semibold mb-2">Fresh Daily</h3>
                <p className="text-gray-600">All our products are baked fresh every morning</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-lg font-semibold mb-2">Quality Ingredients</h3>
                <p className="text-gray-600">We source the finest organic and local ingredients</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="text-lg font-semibold mb-2">Family Owned</h3>
                <p className="text-gray-600">A family business built on love and tradition</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
