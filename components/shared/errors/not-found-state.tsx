import { FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface NotFoundStateProps {
  title?: string;
  message?: string;
  backLink?: string;
  backLabel?: string;
}

export function NotFoundState({
  title = 'Not Found',
  message = "We couldn't find what you're looking for.",
  backLink = '/',
  backLabel = 'Go Home',
}: NotFoundStateProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileQuestion className="h-6 w-6 text-muted-foreground" />
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{message}</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={backLink}>{backLabel}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
