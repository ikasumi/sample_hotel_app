import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './config';

// 型定義
export interface SearchHistory {
  id?: string;
  userId: string;
  location: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  searchedAt?: any;
}

export interface Favorite {
  id?: string;
  userId: string;
  hotelId: string;
  hotelData: any; // ホテルデータ（Booking.com APIからのレスポンス）
  addedAt?: any;
}

export interface Booking {
  id?: string;
  userId: string;
  hotelId: string;
  hotelData: any; // ホテルデータ
  roomType?: any; // 部屋タイプ
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice?: number;
  currency?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt?: any;
}

// ドキュメントスナップショットをデータに変換するヘルパー関数
const convertDoc = <T>(doc: QueryDocumentSnapshot<DocumentData>): T => {
  return { id: doc.id, ...doc.data() } as T;
};

// 検索履歴の保存
export const saveSearchHistory = async (searchData: SearchHistory) => {
  try {
    const docRef = await addDoc(collection(db, 'searchHistory'), {
      ...searchData,
      searchedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ユーザーの検索履歴を取得
export const getUserSearchHistory = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'searchHistory'),
      where('userId', '==', userId),
      orderBy('searchedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => convertDoc<SearchHistory>(doc));
    
    return { success: true, history };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// お気に入りに追加
export const addToFavorites = async (favoriteData: Favorite) => {
  try {
    const docRef = await addDoc(collection(db, 'favorites'), {
      ...favoriteData,
      addedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// お気に入りから削除
export const removeFromFavorites = async (favoriteId: string) => {
  try {
    await deleteDoc(doc(db, 'favorites', favoriteId));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ユーザーのお気に入りを取得
export const getUserFavorites = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      orderBy('addedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const favorites = querySnapshot.docs.map(doc => convertDoc<Favorite>(doc));
    
    return { success: true, favorites };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 予約を作成（モック）
export const createBooking = async (bookingData: Booking) => {
  try {
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      status: 'confirmed',
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 予約をキャンセル
export const cancelBooking = async (bookingId: string) => {
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'cancelled'
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ユーザーの予約を取得
export const getUserBookings = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => convertDoc<Booking>(doc));
    
    return { success: true, bookings };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 予約詳細を取得
export const getBookingDetails = async (bookingId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'bookings', bookingId));
    
    if (docSnap.exists()) {
      const booking = { id: docSnap.id, ...docSnap.data() } as Booking;
      return { success: true, booking };
    } else {
      return { success: false, error: 'Booking not found' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};