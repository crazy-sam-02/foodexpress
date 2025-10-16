import { Link, useLocation } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CheckEmailPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const email = params.get('email');

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Check your email</CardTitle>
            <CardDescription className="text-center">
              We sent a verification link{email ? ` to ${email}` : ''}. Please click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Didn&apos;t receive it? Check your spam folder or resend from the login page.
            </p>
            <div className="flex gap-2">
              <Button asChild className="flex-1 bg-amber-600 hover:bg-amber-700">
                <Link to="/login">Go to Login</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/register">Back to Register</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
