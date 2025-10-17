import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Pill, Stethoscope, ShieldCheck, Clock, Star, Search, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const MedicinePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart } = useCart();

  const categories = ['All', 'Pain Relief', 'Cold & Flu', 'Vitamins', 'First Aid', 'Prescription'];

  // Sample medicine data
  const medicines = [
    {
      _id: 'med-1',
      name: 'Paracetamol 500mg',
      description: 'Effective pain relief and fever reducer',
      price: 25.99,
      category: 'Pain Relief',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
      rating: 4.8,
      inStock: true,
      reviews: 124,
      tags: ['pain-relief', 'fever', 'headache'],
      requiresPrescription: false,
      manufacturer: 'HealthCorp'
    },
    {
      _id: 'med-2',
      name: 'Vitamin D3 Tablets',
      description: 'Essential vitamin D supplement for bone health',
      price: 45.50,
      category: 'Vitamins',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
      rating: 4.6,
      inStock: true,
      reviews: 89,
      tags: ['vitamins', 'supplements', 'bone-health'],
      requiresPrescription: false,
      manufacturer: 'VitaLife'
    },
    {
      _id: 'med-3',
      name: 'Cough Syrup',
      description: 'Fast-acting cough relief syrup',
      price: 35.75,
      category: 'Cold & Flu',
      image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop',
      rating: 4.4,
      inStock: true,
      reviews: 67,
      tags: ['cough', 'cold', 'flu'],
      requiresPrescription: false,
      manufacturer: 'MediCure'
    },
    {
      _id: 'med-4',
      name: 'First Aid Kit',
      description: 'Complete first aid kit for emergencies',
      price: 125.99,
      category: 'First Aid',
      image: 'https://images.unsplash.com/photo-1603398938059-e8bb4d2bb74e?w=400&h=300&fit=crop',
      rating: 4.9,
      inStock: true,
      reviews: 156,
      tags: ['first-aid', 'emergency', 'bandages'],
      requiresPrescription: false,
      manufacturer: 'SafeGuard'
    },
    {
      _id: 'med-5',
      name: 'Antibiotic Cream',
      description: 'Topical antibiotic for wound care',
      price: 18.25,
      category: 'First Aid',
      image: 'https://images.unsplash.com/photo-1585435557343-3b092031d8d8?w=400&h=300&fit=crop',
      rating: 4.7,
      inStock: true,
      reviews: 43,
      tags: ['antibiotic', 'wound-care', 'topical'],
      requiresPrescription: true,
      manufacturer: 'PharmaCare'
    },
    {
      _id: 'med-6',
      name: 'Multivitamin Gummies',
      description: 'Delicious gummy vitamins for daily nutrition',
      price: 55.99,
      category: 'Vitamins',
      image: 'https://images.unsplash.com/photo-1556909114-4f6e5d7d3a5f?w=400&h=300&fit=crop',
      rating: 4.5,
      inStock: true,
      reviews: 78,
      tags: ['vitamins', 'gummies', 'multivitamin'],
      requiresPrescription: false,
      manufacturer: 'NutriGummy'
    }
  ];

  const filteredMedicines = medicines.filter(medicine => 
    medicine.inStock &&
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'All' || medicine.category === selectedCategory)
  );

  const handleAddToCart = (medicine: any) => {
    if (medicine.requiresPrescription) {
      toast.error('This item requires a prescription. Please consult with a healthcare provider.');
      return;
    }
    
    addToCart(medicine, 1);
    toast.success(`${medicine.name} added to cart`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Heart className="h-12 w-12" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4">Medicine & Health</h1>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Your trusted source for medicines, health products, and wellness essentials. 
                Fast delivery with proper storage and handling.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Important Notice */}
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="h-6 w-6 text-orange-600" />
                <h3 className="font-semibold text-orange-800">Important Health Notice</h3>
              </div>
              <p className="text-orange-700 text-sm">
                <strong>Prescription medicines require valid prescription.</strong> Over-the-counter medicines are available for immediate purchase. 
                Always consult healthcare professionals for medical advice. This service does not replace professional medical consultation.
              </p>
            </CardContent>
          </Card>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Service Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Fast Delivery</h3>
                <p className="text-sm text-gray-600">Same-day delivery for urgent medicines</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <ShieldCheck className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Quality Assured</h3>
                <p className="text-sm text-gray-600">All medicines are properly stored and verified</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Stethoscope className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Expert Support</h3>
                <p className="text-sm text-gray-600">Pharmacist consultation available</p>
              </CardContent>
            </Card>
          </div>

          {/* Medicine Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.map((medicine) => (
              <Card key={medicine._id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={medicine.image}
                    alt={medicine.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {medicine.requiresPrescription && (
                    <Badge className="absolute top-2 right-2 bg-red-500">
                      Prescription Required
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{medicine.name}</CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {medicine.manufacturer}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{medicine.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{medicine.description}</p>
                  <Badge variant="outline" className="mb-3">
                    {medicine.category}
                  </Badge>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">
                      ₹{medicine.price}
                    </span>
                    <Button
                      onClick={() => handleAddToCart(medicine)}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      disabled={medicine.requiresPrescription}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {medicine.requiresPrescription ? 'Rx Required' : 'Add to Cart'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMedicines.length === 0 && (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No medicines found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MedicinePage;