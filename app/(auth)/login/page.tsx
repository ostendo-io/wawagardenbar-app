import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/shared/auth/login-form';
import { GuestCheckoutForm } from '@/components/shared/auth/guest-checkout-form';

export const metadata: Metadata = {
  title: 'Sign In - Wawa Garden Bar',
  description: 'Sign in to your account or continue as a guest',
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
            Sign in to your account or continue as a guest
          </p>
        </div>

        {/* Auth Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Choose how you'd like to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="guest">Guest</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <LoginForm redirectTo="/menu" />
              </TabsContent>

              <TabsContent value="guest" className="mt-6">
                <GuestCheckoutForm redirectTo="/menu" />
              </TabsContent>
            </Tabs>
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
