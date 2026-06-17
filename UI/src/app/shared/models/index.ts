export interface LoginRequest  { email: string; password: string; }
export interface LoginResponse { token: string; fullName: string; email: string; roles: string[]; }

export interface Table { id: number; number: string; capacity: number; status: string; }

export interface Category { id: number; name: string; description: string; }
export interface MenuItem  {
  id: number; name: string; description: string;
  price: number; isAvailable: boolean; imageUrl?: string;
  categoryId: number; categoryName: string;
}

export interface OrderItemRequest { menuItemId: number; quantity: number; notes?: string; }
export interface CreateOrderRequest { tableId: number; items: OrderItemRequest[]; notes?: string; }

export interface OrderItem {
  id: number; menuItemId: number; menuItemName: string;
  quantity: number; unitPrice: number; subTotal: number; notes?: string;
}
export interface Order {
  id: number; tableNumber: string; waiterName: string;
  status: number; statusName: string; notes?: string;
  totalAmount: number; createdAt: string; items: OrderItem[];
}

export interface Bill {
  id: number; orderId: number; tableNumber: string;
  subTotal: number; taxRate: number; taxAmount: number;
  totalAmount: number; isPaid: boolean;
  paymentMethod: string; paidAt?: string; createdAt: string;
}
