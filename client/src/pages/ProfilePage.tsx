import { useEffect, useState } from 'react';
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
import { auth, googleProvider } from '@/lib/firebase';
import { sendEmailVerification, reload, fetchSignInMethodsForEmail, EmailAuthProvider, linkWithCredential, reauthenticateWithPopup, updatePassword, reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { Navigate } from 'react-router-dom';

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, isAuthenticated, logout, isLoading } = useUser();
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [hasPasswordProvider, setHasPasswordProvider] = useState<boolean>(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLinkingPassword, setIsLinkingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Detect if current user has password provider
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!auth.currentUser?.email) return;
        const methods = await fetchSignInMethodsForEmail(auth, auth.currentUser.email);
        if (mounted) setHasPasswordProvider(methods.includes('password'));
      } catch {
        if (mounted) setHasPasswordProvider(true);
      }
    })();
    return () => { mounted = false; };
  }, []);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Sweet Street, Dessert City, DC 12345',
    bio: 'Sweet treats enthusiast who loves exploring new flavors and sharing delicious moments with friends and family.'
  });

  // Redirect if not authenticated
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
                <p className="text-amber-700">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

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

  const handleResendVerification = async () => {
    try {
      if (!auth.currentUser) return;
      setIsSendingVerification(true);
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      } as const;
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      toast({ title: 'Verification email sent', description: 'Please check your inbox' });
      try { await reload(auth.currentUser); } catch {}
    } catch (e) {
      toast({ title: 'Failed to send verification email', variant: 'destructive' });
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleCreatePassword = async () => {
    try {
      if (!auth.currentUser?.email) return;
      if (newPassword.length < 6) {
        toast({ title: 'Password too short', description: 'Minimum 6 characters', variant: 'destructive' });
        return;
      }
      if (newPassword !== confirmPassword) {
        toast({ title: 'Passwords do not match', variant: 'destructive' });
        return;
      }
      setIsLinkingPassword(true);
      // Create email credential and link to the Google-only account
      const credential = EmailAuthProvider.credential(auth.currentUser.email, newPassword);
      try {
        await linkWithCredential(auth.currentUser, credential);
      } catch (e: any) {
        if (e?.code === 'auth/requires-recent-login') {
          // Reauthenticate with Google then retry once
          await reauthenticateWithPopup(auth.currentUser, googleProvider);
          await linkWithCredential(auth.currentUser, credential);
        } else {
          throw e;
        }
      }
      toast({ title: 'Password created', description: 'You can now sign in with email & password and use password reset.' });
      setHasPasswordProvider(true);
      setNewPassword('');
      setConfirmPassword('');
      setShowCreatePassword(false);
    } catch (e) {
      toast({ title: 'Failed to set password', variant: 'destructive' });
    } finally {
      setIsLinkingPassword(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!auth.currentUser?.email) return;
      if (!currentPassword) {
        toast({ title: 'Current password required', variant: 'destructive' });
        return;
      }
      if (newPassword.length < 6) {
        toast({ title: 'Password too short', description: 'Minimum 6 characters', variant: 'destructive' });
        return;
      }
      if (newPassword !== confirmPassword) {
        toast({ title: 'Passwords do not match', variant: 'destructive' });
        return;
      }
      
      setIsChangingPassword(true);
      
      // First, reauthenticate with current password
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Then update to new password
      await updatePassword(auth.currentUser, newPassword);
      
      toast({ title: 'Password updated', description: 'Your password has been successfully changed.' });
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      console.error('Password change error:', e);
      switch (e?.code) {
        case 'auth/wrong-password':
          toast({ title: 'Incorrect current password', variant: 'destructive' });
          break;
        case 'auth/weak-password':
          toast({ title: 'Password too weak', description: 'Please choose a stronger password', variant: 'destructive' });
          break;
        default:
          toast({ title: 'Failed to update password', description: e?.message || 'Please try again', variant: 'destructive' });
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordReset = () => {
    setShowPasswordReset(true);
  };

  const handleSendPasswordReset = async () => {
    try {
      if (!auth.currentUser?.email) return;
      if (!hasPasswordProvider) {
        toast({ title: 'Cannot reset password', description: 'This account uses Google sign-in only. Create a password first.', variant: 'destructive' });
        return;
      }
      
      setIsSendingReset(true);
      
      const actionCodeSettings = {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      } as const;
      
      await sendPasswordResetEmail(auth, auth.currentUser.email, actionCodeSettings);
      toast({ title: 'Password reset email sent', description: 'Check your inbox for reset instructions.' });
      setShowPasswordReset(false); // Close the form after successful send
    } catch (e: any) {
      console.error('Password reset error:', e);
      toast({ title: 'Failed to send reset email', description: e?.message || 'Please try again', variant: 'destructive' });
    } finally {
      setIsSendingReset(false);
    }
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
              <div className="flex justify-center items-center gap-4 mt-4 flex-wrap">
                {auth.currentUser && !auth.currentUser.emailVerified && (
                  <Button 
                    onClick={handleResendVerification}
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    disabled={isSendingVerification}
                  >
                    {isSendingVerification ? 'Sending…' : 'Resend Verification Email'}
                  </Button>
                )}
                {!isEditing ? (
                  <>
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    {hasPasswordProvider ? (
                      <>
                        <Button 
                          onClick={() => setShowPasswordChange(true)}
                          variant="outline"
                          className="border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          Change Password
                        </Button>
                        <Button 
                          onClick={handlePasswordReset}
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          Reset Password
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setShowCreatePassword(true)}
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Create New Password
                      </Button>
                    )}
                  </>
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
                {/* Prompt to create password if account is Google-only */}
                {showCreatePassword && auth.currentUser && !hasPasswordProvider && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-sm mb-3">This account currently uses Google sign-in only. You can set a password to enable email/password login and password reset.</p>
                    <div className="grid gap-3 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      </div>
                      <div>
                        <Button onClick={handleCreatePassword} disabled={isLinkingPassword} className="bg-amber-600 hover:bg-amber-700">
                          {isLinkingPassword ? 'Saving…' : 'Create Password'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Password change form for users with password provider */}
                {showPasswordChange && hasPasswordProvider && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium">Change Password</h3>
                      <Button 
                        onClick={() => {
                          setShowPasswordChange(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        ✕
                      </Button>
                    </div>
                    <div className="grid gap-3 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          type="password" 
                          value={currentPassword} 
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPasswordChange">New Password</Label>
                        <Input 
                          id="newPasswordChange" 
                          type="password" 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min. 6 characters)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPasswordChange">Confirm New Password</Label>
                        <Input 
                          id="confirmPasswordChange" 
                          type="password" 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleChangePassword} 
                          disabled={isChangingPassword}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          {isChangingPassword ? 'Updating...' : 'Update Password'}
                        </Button>
                        <Button 
                          onClick={() => {
                            setShowPasswordChange(false);
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Password reset form */}
                {showPasswordReset && (
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-medium text-blue-800">Reset Password</h3>
                      <Button 
                        onClick={() => setShowPasswordReset(false)}
                        variant="ghost"
                        size="sm"
                      >
                        ✕
                      </Button>
                    </div>
                    <div className="space-y-3 max-w-md">
                      <p className="text-sm text-blue-700">
                        A password reset link will be sent to your email address: <strong>{user?.email}</strong>
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSendPasswordReset} 
                          disabled={isSendingReset}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSendingReset ? 'Sending...' : 'Send Reset Email'}
                        </Button>
                        <Button 
                          onClick={() => setShowPasswordReset(false)}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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