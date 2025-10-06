import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const ReturnsPage = () => {
  const eligibleItems = [
    "Products that arrived damaged or spoiled",
    "Incorrect items received",
    "Quality issues with fresh products",
    "Missing items from your order"
  ];

  const nonEligibleItems = [
    "Custom-made or personalized cakes and pastries",
    "Products consumed or partially consumed",
    "Items past their best-by date due to late claim",
    "Orders placed more than 24 hours ago"
  ];

  const returnSteps = [
    {
      step: 1,
      title: "Contact Us Immediately",
      description: "Reach out within 24 hours of receiving your order via phone, email, or our contact form."
    },
    {
      step: 2,
      title: "Provide Order Details",
      description: "Share your order number, photos of the issue, and description of the problem."
    },
    {
      step: 3,
      title: "Return or Exchange",
      description: "We'll arrange pickup for eligible returns or process a refund/exchange."
    },
    {
      step: 4,
      title: "Receive Refund",
      description: "Refunds are processed within 3-5 business days to your original payment method."
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <RefreshCw className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Refunds</h1>
            <p className="text-lg text-gray-600">
              We want you to be completely satisfied with your purchase. Here's our returns policy.
            </p>
          </div>

          {/* Important Notice */}
          <Alert className="mb-8 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Important: Fresh Products Policy</AlertTitle>
            <AlertDescription>
              Due to the perishable nature of our baked goods, all returns and refund requests must be made within 24 hours of delivery. Please inspect your order upon receipt.
            </AlertDescription>
          </Alert>

          {/* Return Process */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How to Request a Return or Refund</CardTitle>
              <CardDescription>Follow these simple steps to initiate a return</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {returnSteps.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Eligible Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Eligible for Returns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {eligibleItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Not Eligible for Returns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {nonEligibleItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Refund Policy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Refund Timeline</h3>
                <p className="text-gray-600">
                  Once we receive and inspect the returned item, we will process your refund within 3-5 business days. The refund will be credited to your original payment method.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Partial Refunds</h3>
                <p className="text-gray-600">
                  In some cases, we may offer partial refunds for items that have minor issues but are still usable. Our team will discuss this option with you if applicable.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Exchange Options</h3>
                <p className="text-gray-600">
                  If you prefer, we can exchange your product for a replacement or offer store credit for future purchases.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Need to initiate a return?
              </h3>
              <p className="text-gray-600 mb-4">
                Contact our customer support team and we'll help you right away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="tel:555-123-2253"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-amber-600 rounded-lg hover:bg-gray-50 transition-colors border border-amber-300"
                >
                  Call Us: (555) 123-CAKE
                </a>
                <a
                  href="mailto:hello@sweettreats.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-amber-600 rounded-lg hover:bg-gray-50 transition-colors border border-amber-300"
                >
                  Email Us
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ReturnsPage;
