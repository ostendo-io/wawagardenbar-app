import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, Clock, Truck } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-6 text-center">
        <div className="container mx-auto max-w-4xl space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="Wawa Garden Bar Logo"
                width={300}
                height={300}
                priority
                className="h-auto w-64 sm:w-80"
              />
            </div>
            <h1 className="sr-only">
              Wawa Garden Bar
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Delicious food and drinks delivered to your table or door
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/menu">View Menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-background py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex justify-center">
                  <UtensilsCrossed className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-center">Dine In</CardTitle>
                <CardDescription className="text-center">
                  Scan QR code at your table and order directly
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Quick and easy ordering from your table
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex justify-center">
                  <Clock className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-center">Pickup</CardTitle>
                <CardDescription className="text-center">
                  Order ahead and pick up at your convenience
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Skip the wait, grab and go
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex justify-center">
                  <Truck className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-center">Delivery</CardTitle>
                <CardDescription className="text-center">
                  Get your favorites delivered to your door
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Fast delivery within our service area
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
