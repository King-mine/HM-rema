
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  origin: string;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'One Size';
  color: string;
  tags: string[];
  imageUrl: string;
  rating: number;
  stockStatus?: 'In Stock' | 'Sold Out';
  restockDate?: string;
  originalPrice?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Coupon {
  code: string;
  discount: number; // 0.1 for 10%
  description: string;
  isUsed: boolean;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
  deliveryAddress: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  clothingSize: 'XS' | 'S' | 'M' | 'L' | 'XL';
  shoeSize: string;
  avatarUrl?: string;
}

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  origins: string[];
  colors: string[];
}

export interface DeliveryDetails {
  fullName: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  deliveryMethod: 'Standard' | 'Express';
  paymentMethod: 'Credit Card' | 'PayPal' | 'Apple Pay';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

export type ViewState = 'HOME' | 'SEARCH' | 'CART' | 'CHECKOUT' | 'PROFILE' | 'SUCCESS' | 'PRODUCT_DETAILS' | 'WISHLIST' | 'SETTINGS' | 'SUPPORT' | 'TRACK_ORDER';
