// ユーザー関連の型定義
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt?: any;
}

// 認証関連の型定義
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// ホテル検索関連の型定義
export interface SearchParams {
  location: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

export interface SearchFormData {
  location: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  rooms: number;
}

// ホテル関連の型定義
export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  reviewCount: number;
  price: number;
  currency: string;
  images: string[];
  amenities: string[];
  latitude: number;
  longitude: number;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  capacity: number;
  amenities: string[];
  images: string[];
}

export interface HotelDetails extends Hotel {
  rooms: RoomType[];
  reviews: Review[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

// 予約関連の型定義
export interface Booking {
  id?: string;
  userId: string;
  hotelId: string;
  hotelData: Hotel;
  roomType?: RoomType;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice?: number;
  currency?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt?: any;
}

// お気に入り関連の型定義
export interface Favorite {
  id?: string;
  userId: string;
  hotelId: string;
  hotelData: Hotel;
  addedAt?: any;
}

// 検索履歴関連の型定義
export interface SearchHistory {
  id?: string;
  userId: string;
  location: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  searchedAt?: any;
}

// API関連の型定義
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}