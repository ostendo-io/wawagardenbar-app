import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Get Socket.io client instance
 * Creates singleton connection
 */
export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    socket = io(url, {
      path: '/api/socket',
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
}

/**
 * Subscribe to order updates
 */
export function subscribeToOrders(callbacks: {
  onOrderCreated?: (order: any) => void;
  onOrderUpdated?: (data: any) => void;
  onOrderCancelled?: (data: any) => void;
}) {
  const socket = getSocket();
  
  // Join orders room
  socket.emit('orders:subscribe');

  // Set up event listeners
  if (callbacks.onOrderCreated) {
    socket.on('order:created', callbacks.onOrderCreated);
  }

  if (callbacks.onOrderUpdated) {
    socket.on('order:updated', callbacks.onOrderUpdated);
  }

  if (callbacks.onOrderCancelled) {
    socket.on('order:cancelled', callbacks.onOrderCancelled);
  }

  return () => {
    socket.emit('orders:unsubscribe');
    socket.off('order:created');
    socket.off('order:updated');
    socket.off('order:cancelled');
  };
}

/**
 * Subscribe to kitchen updates
 */
export function subscribeToKitchen(callbacks: {
  onNewOrder?: (order: any) => void;
  onOrderUpdated?: (data: any) => void;
}) {
  const socket = getSocket();
  
  // Join kitchen room
  socket.emit('kitchen:subscribe');

  // Set up event listeners
  if (callbacks.onNewOrder) {
    socket.on('kitchen:new-order', callbacks.onNewOrder);
  }

  if (callbacks.onOrderUpdated) {
    socket.on('order:updated', callbacks.onOrderUpdated);
  }

  return () => {
    socket.emit('kitchen:unsubscribe');
    socket.off('kitchen:new-order');
    socket.off('order:updated');
  };
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected || false;
}
