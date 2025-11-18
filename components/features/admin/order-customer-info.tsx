'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, UserCheck } from 'lucide-react';

interface OrderCustomerInfoProps {
  order: any;
}

/**
 * Order customer information component
 * Displays customer contact details and delivery address
 */
export function OrderCustomerInfo({ order }: OrderCustomerInfoProps) {
  const customer = order.customer || {};
  const isGuest = !order.userId;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
          {isGuest ? (
            <Badge variant="secondary">Guest</Badge>
          ) : (
            <Badge variant="default" className="flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              Registered
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Name */}
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Name</p>
            <p className="text-sm text-muted-foreground">{customer.name || 'N/A'}</p>
          </div>
        </div>

        {/* Email */}
        {customer.email && (
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <a 
                href={`mailto:${customer.email}`}
                className="text-sm text-primary hover:underline"
              >
                {customer.email}
              </a>
            </div>
          </div>
        )}

        {/* Phone */}
        {customer.phone && (
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Phone</p>
              <a 
                href={`tel:${customer.phone}`}
                className="text-sm text-primary hover:underline"
              >
                {customer.phone}
              </a>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {order.orderType === 'delivery' && order.deliveryAddress && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Delivery Address</p>
              <p className="text-sm text-muted-foreground">
                {order.deliveryAddress.street}
                {order.deliveryAddress.apartment && `, ${order.deliveryAddress.apartment}`}
                <br />
                {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
