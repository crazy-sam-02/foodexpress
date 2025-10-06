import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Edit, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { Navigate } from 'react-router-dom';

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, isAuthenticated, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Sweet Street, Dessert City, DC 12345',
    bio: 'Sweet treats enthusiast who loves exploring new flavors and sharing delicious moments with friends and family.'
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg" alt="Profile" />
                  <AvatarFallback className="text-2xl">
                    {formData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl text-amber-800">My Profile</CardTitle>
              <div className="flex justify-center items-center gap-4 mt-4">
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSave}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      onClick={handleCancel}
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-amber-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-amber-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-amber-700 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-amber-700 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className="border-amber-200 focus:border-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-amber-700">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    className="border-amber-200 focus:border-amber-400"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}