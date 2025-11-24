'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './login-form';
import { GuestCheckoutForm } from './guest-checkout-form';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectTo?: string;
  defaultTab?: 'login' | 'guest';
}

export function AuthDialog({
  open,
  onOpenChange,
  redirectTo,
  defaultTab = 'login',
}: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  function handleSuccess() {
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Wawa Garden Bar</DialogTitle>
          <DialogDescription>
            Sign in to your account or continue as a guest
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'guest')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="guest">Guest</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <LoginForm redirectTo={redirectTo} onSuccess={handleSuccess} />
          </TabsContent>

          <TabsContent value="guest" className="mt-4">
            <GuestCheckoutForm redirectTo={redirectTo} onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
