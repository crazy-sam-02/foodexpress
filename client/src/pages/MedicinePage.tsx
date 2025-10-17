import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Pill, Stethoscope, ShieldCheck, Clock, Star, Search, Phone, PhoneCall, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Product } from '@/types';

const MedicinePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [medicines, setMedicines] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Phone ordering constants
  const PHARMACY_PHONE = "+91-9876543210";
  const WHATSAPP_NUMBER = "+919876543210";

  const categories = ['All', 'Pain Relief', 'Cold & Flu', 'Vitamins', 'First Aid', 'Prescription'];

  // Fetch medicines from backend
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/products/medicines');
        setMedicines(response.data);
      } catch (error: any) {
        console.error('Error fetching medicines:', error);
        console.error('Error response:', error.response);
        console.error('Error request:', error.request);
        console.error('Error message:', error.message);
        setError(`Failed to load medicines: ${error.message || 'Unknown error'}. Please try again later.`);
        toast.error(`Failed to load medicines: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const filteredMedicines = medicines.filter(medicine => 
    medicine.inStock &&
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'All' || medicine.category === selectedCategory)
  );

  const handlePhoneOrder = (medicine: any) => {
    const message = `Hello, I would like to order ${medicine.name} - ₹${medicine.price}. ${medicine.requiresPrescription ? 'I have a prescription.' : 'No prescription required.'}`;
    window.open(`tel:${PHARMACY_PHONE}`);
    toast.success('Calling pharmacy for order assistance...');
  };

  const handleWhatsAppOrder = (medicine: any) => {
    const message = `Hello, I would like to order ${medicine.name} - ₹${medicine.price}. ${medicine.requiresPrescription ? 'I have a prescription.' : 'No prescription required.'}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp for order...');
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
                Order by phone with expert pharmacist consultation and fast delivery.
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
                <strong>Prescription medicines require valid prescription.</strong> All orders are placed via phone or WhatsApp for safety and verification. 
                Our pharmacists will guide you through the ordering process. Always consult healthcare professionals for medical advice.
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

          {/* Phone Ordering Section */}
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-4 rounded-full">
                    <PhoneCall className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Order by Phone</h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Prefer to speak with our pharmacists directly? Call us or message us on WhatsApp to place your medicine order. 
                  Our experts will help you with prescription validation, dosage guidance, and ensure safe delivery.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
                    <Phone className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-2">Call Directly</h3>
                    <p className="text-sm text-gray-600 mb-4">Speak with our pharmacist</p>
                    <Button 
                      onClick={() => {
                        window.open(`tel:${PHARMACY_PHONE}`);
                        toast.success('Calling pharmacy...');
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call {PHARMACY_PHONE}
                    </Button>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
                    <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-800 mb-2">WhatsApp Order</h3>
                    <p className="text-sm text-gray-600 mb-4">Quick messaging service</p>
                    <Button 
                      onClick={() => {
                        const message = "Hello! I would like to inquire about medicine ordering.";
                        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                        toast.success('Opening WhatsApp...');
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message on WhatsApp
                    </Button>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Available 24/7</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Emergency medicine orders accepted round the clock. Prescription medicines require valid prescription upload via WhatsApp.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medicine Grid */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Loading medicines...</h3>
              <p className="text-gray-500">Please wait while we fetch available medicines.</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Medicines</h3>
              <p className="text-red-500 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </div>
          ) : (
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
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePhoneOrder(medicine)}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                        size="sm"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        onClick={() => handleWhatsAppOrder(medicine)}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                        size="sm"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredMedicines.length === 0 && (
              <div className="text-center py-12 col-span-full">
                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No medicines found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MedicinePage;