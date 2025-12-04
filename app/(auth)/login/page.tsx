import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/shared/auth/login-form';

export const metadata: Metadata = {
  title: 'Log in / Sign up - Wawa Garden Bar',
  description: 'Log in or sign up to your account',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex flex-col items-center space-y-2">
            <Image
              src="/logo.png"
              alt="Wawa Garden Bar"
              width={120}
              height={120}
              className="h-auto w-32"
            />
            <span className="sr-only">Wawa Garden Bar</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Log in or Sign up to order
          </p>
        </div>

        {/* Auth Card */}
        <Card>
          <CardHeader>
            <CardTitle>Log in / Sign up</CardTitle>
            <CardDescription>
              Enter your phone number to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm redirectTo="/menu" />
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
