import axios from 'axios';

// モックデータ用の型定義
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
  reviews: {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export interface SearchParams {
  location: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

// モックデータ
const mockHotels: Hotel[] = [
  {
    id: 'hotel-1',
    name: 'グランド東京ホテル',
    description: '東京の中心部に位置する豪華なホテルです。東京タワーやショッピングエリアへのアクセスも良好です。',
    address: '東京都港区芝公園4-2-8',
    city: '東京',
    country: '日本',
    rating: 4.7,
    reviewCount: 1250,
    price: 25000,
    currency: 'JPY',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461'
    ],
    amenities: ['Wi-Fi', 'プール', 'スパ', 'フィットネスセンター', 'レストラン', '駐車場'],
    latitude: 35.6585,
    longitude: 139.7454
  },
  {
    id: 'hotel-2',
    name: '京都トラディショナルイン',
    description: '京都の伝統的な雰囲気を味わえる宿。有名な観光スポットへのアクセスも良好です。',
    address: '京都府京都市東山区祇園町南側570-2',
    city: '京都',
    country: '日本',
    rating: 4.9,
    reviewCount: 890,
    price: 30000,
    currency: 'JPY',
    images: [
      'https://images.unsplash.com/photo-1601053720380-0fa6b742cc89',
      'https://images.unsplash.com/photo-1545304773-9f2f0d6e2d10',
      'https://images.unsplash.com/photo-1545304773-9f2f0d6e2d10'
    ],
    amenities: ['Wi-Fi', '温泉', '日本庭園', '伝統的な食事', '浴衣レンタル'],
    latitude: 35.0035,
    longitude: 135.7775
  },
  {
    id: 'hotel-3',
    name: '大阪ビジネスホテル',
    description: '大阪の中心部に位置するビジネスホテル。観光やビジネスに最適です。',
    address: '大阪府大阪市中央区難波5-1-60',
    city: '大阪',
    country: '日本',
    rating: 4.2,
    reviewCount: 1560,
    price: 15000,
    currency: 'JPY',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461'
    ],
    amenities: ['Wi-Fi', 'ビジネスセンター', 'レストラン', 'コンビニ'],
    latitude: 34.6684,
    longitude: 135.5022
  },
  {
    id: 'hotel-4',
    name: '沖縄リゾートホテル',
    description: '沖縄の美しいビーチに面したリゾートホテル。マリンアクティビティも充実しています。',
    address: '沖縄県那覇市おもろまち4-11-1',
    city: '沖縄',
    country: '日本',
    rating: 4.8,
    reviewCount: 2100,
    price: 35000,
    currency: 'JPY',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461'
    ],
    amenities: ['Wi-Fi', 'プール', 'ビーチアクセス', 'スパ', 'マリンスポーツ', 'レストラン'],
    latitude: 26.2124,
    longitude: 127.6809
  },
  {
    id: 'hotel-5',
    name: '北海道スキーリゾート',
    description: '北海道の雄大な自然に囲まれたスキーリゾート。冬はスキー、夏はトレッキングが楽しめます。',
    address: '北海道虻田郡倶知安町字山田204',
    city: '北海道',
    country: '日本',
    rating: 4.6,
    reviewCount: 1800,
    price: 28000,
    currency: 'JPY',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461'
    ],
    amenities: ['Wi-Fi', 'スキー場直結', '温泉', 'レストラン', 'スキーレンタル', 'スキースクール'],
    latitude: 42.8614,
    longitude: 140.6982
  }
];

// モックホテル詳細データ
const getHotelDetails = (hotelId: string): HotelDetails => {
  const hotel = mockHotels.find(h => h.id === hotelId);
  if (!hotel) {
    throw new Error('Hotel not found');
  }
  
  return {
    ...hotel,
    rooms: [
      {
        id: `${hotelId}-room-1`,
        name: 'スタンダードルーム',
        description: '快適な滞在のための基本的な設備が整ったお部屋です。',
        price: hotel.price,
        currency: hotel.currency,
        capacity: 2,
        amenities: ['エアコン', 'テレビ', '冷蔵庫', 'バスタブ'],
        images: [hotel.images[0]]
      },
      {
        id: `${hotelId}-room-2`,
        name: 'デラックスルーム',
        description: 'より広いお部屋で、追加のアメニティが提供されます。',
        price: hotel.price * 1.3,
        currency: hotel.currency,
        capacity: 2,
        amenities: ['エアコン', 'テレビ', '冷蔵庫', 'バスタブ', 'ミニバー', 'バスローブ'],
        images: [hotel.images[1] || hotel.images[0]]
      },
      {
        id: `${hotelId}-room-3`,
        name: 'スイートルーム',
        description: '最高級の設備とサービスを備えた広々としたお部屋です。',
        price: hotel.price * 2,
        currency: hotel.currency,
        capacity: 4,
        amenities: ['エアコン', 'テレビ', '冷蔵庫', 'バスタブ', 'ミニバー', 'バスローブ', 'リビングエリア', 'キッチン'],
        images: [hotel.images[2] || hotel.images[0]]
      }
    ],
    reviews: [
      {
        id: `${hotelId}-review-1`,
        userName: '田中太郎',
        rating: 4.5,
        comment: 'とても快適に過ごせました。スタッフの対応も良く、また利用したいです。',
        date: '2025-03-15'
      },
      {
        id: `${hotelId}-review-2`,
        userName: '鈴木花子',
        rating: 5.0,
        comment: '最高のホテルでした！部屋からの眺めも素晴らしく、設備も充実していました。',
        date: '2025-02-28'
      },
      {
        id: `${hotelId}-review-3`,
        userName: '佐藤健',
        rating: 4.0,
        comment: '全体的に満足しています。ただ、チェックイン時に少し時間がかかりました。',
        date: '2025-01-10'
      }
    ]
  };
};

// モックAPI関数
export const searchHotels = async (params: SearchParams): Promise<{ success: boolean; hotels?: Hotel[]; error?: string }> => {
  try {
    // 実際のAPIリクエストの代わりにモックデータを返す
    // 実際の実装では、axiosを使用してAPIリクエストを行う
    // const response = await axios.get('https://booking-api.example.com/hotels', { params });
    
    // 検索パラメータに基づいてフィルタリング（モック）
    let filteredHotels = [...mockHotels];
    
    if (params.location) {
      filteredHotels = filteredHotels.filter(hotel => 
        hotel.city.toLowerCase().includes(params.location.toLowerCase()) || 
        hotel.country.toLowerCase().includes(params.location.toLowerCase())
      );
    }
    
    if (params.minPrice) {
      filteredHotels = filteredHotels.filter(hotel => hotel.price >= params.minPrice!);
    }
    
    if (params.maxPrice) {
      filteredHotels = filteredHotels.filter(hotel => hotel.price <= params.maxPrice!);
    }
    
    if (params.rating) {
      filteredHotels = filteredHotels.filter(hotel => hotel.rating >= params.rating!);
    }
    
    // 検索結果を返す
    return { success: true, hotels: filteredHotels };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ホテル詳細を取得
export const getHotelById = async (hotelId: string): Promise<{ success: boolean; hotel?: HotelDetails; error?: string }> => {
  try {
    // 実際のAPIリクエストの代わりにモックデータを返す
    // 実際の実装では、axiosを使用してAPIリクエストを行う
    // const response = await axios.get(`https://booking-api.example.com/hotels/${hotelId}`);
    
    const hotelDetails = getHotelDetails(hotelId);
    
    return { success: true, hotel: hotelDetails };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};