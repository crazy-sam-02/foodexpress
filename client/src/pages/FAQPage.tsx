import { Layout } from '@/components/layout/Layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

const FAQPage = () => {
  const faqs = [
    {
      question: "What are your delivery hours?",
      answer: "We deliver Monday through Saturday from 6 AM to 8 PM, and Sunday from 7 AM to 6 PM. Orders are typically delivered within 2-3 hours of placement."
    },
    {
      question: "Do you offer same-day delivery?",
      answer: "Yes! Orders placed before 2 PM can be delivered the same day. For custom cakes or large orders, we recommend placing your order at least 24 hours in advance."
    },
    {
      question: "What is your cancellation policy?",
      answer: "You can cancel your order free of charge within 30 minutes of placing it. After that, cancellation fees may apply depending on the order status. Custom orders cannot be cancelled once production has begun."
    },
    {
      question: "Do you accommodate dietary restrictions?",
      answer: "Yes! We offer gluten-free, vegan, and sugar-free options for many of our products. Please check the product description or contact us for specific dietary requirements."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is confirmed, you can track it in real-time through your account under 'My Orders'. You'll receive notifications at each stage of preparation and delivery."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, UPI, and cash on delivery. All online payments are secured with industry-standard encryption."
    },
    {
      question: "Can I customize a cake?",
      answer: "Absolutely! We love creating custom cakes for your special occasions. Use our 'Custom Order' form or contact us directly to discuss your requirements."
    },
    {
      question: "What is your minimum order amount?",
      answer: "There is no minimum order amount. However, orders over ₹500 qualify for free delivery within city limits."
    },
    {
      question: "Do you offer gift wrapping?",
      answer: "Yes, we offer complimentary gift wrapping for orders over ₹2500. You can select this option during checkout."
    },
    {
      question: "How far in advance should I order a custom cake?",
      answer: "We recommend ordering custom cakes at least 3-5 days in advance to ensure availability and proper preparation time. For elaborate designs, 7 days notice is preferred."
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <MessageCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-gray-600">
              Find answers to common questions about our products, delivery, and services
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Popular Questions</CardTitle>
              <CardDescription>
                Quick answers to the most commonly asked questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Still have questions?
              </h3>
              <p className="text-gray-600 mb-4">
                Can't find the answer you're looking for? Our customer support team is here to help.
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
