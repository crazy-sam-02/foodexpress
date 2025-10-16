import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, fetchSignInMethodsForEmail, sendEmailVerification, reload } from 'firebase/auth';

const LoginPage = () => {
    const navigate = useNavigate();
    const { loginWithGoogle } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [pendingVerification, setPendingVerification] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState<number>(0);

    const handleEmailPasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // 1) Firebase Email/Password sign-in
            const result = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
            if (!result.user.emailVerified) {
                setPendingVerification(result.user.email || email.trim().toLowerCase());
                toast.error('Please verify your email before signing in.');
                setIsLoading(false);
                return;
            }
            const idToken = await result.user.getIdToken();

            // 2) Exchange Firebase ID token with backend to create/sync Mongo user and issue JWT
            const ok = await loginWithGoogle(idToken, result.user.displayName, result.user.email);
            if (!ok) throw new Error('Failed to create session');

            toast.success('Logged in successfully');
            navigate('/');
        } catch (error: any) {
            console.error('Login error:', error);
            switch (error?.code) {
                case 'auth/user-not-found':
                case 'auth/invalid-email':
                    toast.error('No account found with this email');
                    break;
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    toast.error('Invalid email or password');
                    break;
                default:
                    toast.error(error?.message || 'Failed to log in');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            const ok = await loginWithGoogle(idToken, result.user.displayName, result.user.email);
            if (!ok) throw new Error('Failed to create session');
            toast.success('Logged in with Google');
            navigate('/');
        } catch (error) {
            console.error('Google login error:', error);
            toast.error('Google login failed');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail) {
            toast.error('Please enter your email');
            return;
        }
        setIsLoading(true);
        try {
            // Try to send password reset email directly
            // Firebase will handle validation internally
            const actionCodeSettings = {
                url: `${window.location.origin}/login`,
                handleCodeInApp: false,
            } as const;
            
            await sendPasswordResetEmail(auth, resetEmail.trim().toLowerCase(), actionCodeSettings);
            
            toast.success('If an account with this email exists, a password reset link has been sent.');
            setIsResetOpen(false);
            setResetEmail('');
        } catch (error: any) {
            console.error('Password reset error:', error);
            const code = error?.code as string | undefined;
            switch (code) {
                case 'auth/invalid-email':
                    toast.error('Please enter a valid email address');
                    break;
                case 'auth/missing-email':
                    toast.error('Please enter your email address');
                    break;
                case 'auth/user-not-found':
                    // Firebase security: Don't reveal if user exists or not
                    toast.success('If an account with this email exists, a password reset link has been sent.');
                    setIsResetOpen(false);
                    setResetEmail('');
                    break;
                case 'auth/too-many-requests':
                    toast.error('Too many password reset attempts. Please try again later.');
                    break;
                case 'auth/operation-not-allowed':
                    toast.error('Password reset is currently disabled. Please contact support.');
                    break;
                default:
                    toast.error('Unable to send reset email. Please try again or contact support.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                        <CardDescription className="text-center">
                            Sign in to continue ordering your favorites
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full mb-4"
                            onClick={handleGoogleLogin}
                            disabled={isGoogleLoading}
                        >
                            {isGoogleLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                    Signing in with Google...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Sign in with Google
                                </div>
                            )}
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">Or sign in with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                            {pendingVerification && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900 text-sm flex items-center justify-between gap-3">
                                    <div>
                                        We sent a verification link to <strong>{pendingVerification}</strong>. Please verify and try signing in again.
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="whitespace-nowrap"
                                        disabled={resendCooldown > 0}
                                        onClick={async () => {
                                            if (!auth.currentUser) {
                                                toast.message('If you didn\'t receive the email, try logging in again to trigger resend.');
                                                return;
                                            }
                                            try {
                                                const actionCodeSettings = { url: `${window.location.origin}/login`, handleCodeInApp: false } as const;
                                                await sendEmailVerification(auth.currentUser, actionCodeSettings);
                                                toast.success('Verification email sent');
                                                setResendCooldown(60);
                                                const iv = setInterval(() => {
                                                    setResendCooldown((s) => {
                                                        if (s <= 1) { clearInterval(iv); return 0; }
                                                        return s - 1;
                                                    });
                                                }, 1000);
                                            } catch {
                                                toast.error('Failed to resend');
                                            }
                                        }}
                                    >
                                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
                                    </Button>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <button
                                        type="button"
                                        onClick={() => setIsResetOpen(true)}
                                        className="text-sm font-medium text-amber-600 hover:text-amber-700"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-amber-600 hover:bg-amber-700"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don&apos;t have an account?{' '}
                                <Link to="/register" className="text-amber-600 hover:text-amber-700 font-medium">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isResetOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-sm p-6">
                        <h2 className="text-xl font-semibold text-center mb-2">Reset Password</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                            Enter your email address and we&apos;ll send you a password reset link. 
                            If you signed up with Google, please use Google Sign-in instead.
                        </p>
                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reset-email">Email Address</Label>
                                <Input
                                    id="reset-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700" disabled={isLoading}>
                                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsResetOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthLayout>
    );
};

export default LoginPage;

