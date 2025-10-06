import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageCircle, Clock, MapPin, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const SupportPage = () => {
  const supportChannels = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "(555) 123-CAKE",
      action: "tel:555-123-2253",
      available: "Mon-Sat: 6AM-8PM, Sun: 7AM-6PM"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "hello@sweettreats.com",
      action: "mailto:hello@sweettreats.com",
      available: "Response within 24 hours"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with us in real-time",
      contact: "Start Chat",
      action: "#",
      available: "Mon-Fri: 8AM-6PM"
    }
  ];

  const quickLinks = [
    { title: "Track Your Order", link: "/orders", icon: "📦" },
    { title: "FAQs", link: "/faq", icon: "❓" },
    { title: "Returns & Refunds", link: "/returns", icon: "↩️" },
    { title: "Contact Us", link: "/contact", icon: "📧" }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <HelpCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Customer Support</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're here to help! Choose the support channel that works best for you.
            </p>
          </div>

          {/* Support Channels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <channel.icon className="h-6 w-6 text-amber-600" />
                  </div>
                  <CardTitle>{channel.title}</CardTitle>
                  <CardDescription>{channel.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="font-semibold text-amber-600">{channel.contact}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{channel.available}</span>
                    </div>
                    <Button asChild className="w-full bg-amber-600 hover:bg-amber-700">
                      <a href={channel.action}>Contact Now</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Links */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Help Links</CardTitle>
              <CardDescription>Find quick solutions to common needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map((item, index) => (
                  <Link key={index} to={item.link}>
                    <div className="p-4 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Store Location */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-600" />
                Visit Our Store
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sweet Treats Bakery</h3>
                  <p className="text-gray-600 mb-4">
                    123 Bakery Street<br />
                    Sweet City, SC 12345
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Monday-Saturday: 6AM-8PM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Sunday: 7AM-6PM</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Button asChild className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
                    <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                      Get Directions
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SupportPage;
