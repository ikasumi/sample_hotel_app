import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import SearchForm from '@/app/components/hotel/SearchForm';
import HotelCard from '@/app/components/hotel/HotelCard';
import { searchHotels } from '@/lib/api/bookingApi';

// メタデータ
export const metadata: Metadata = {
  title: 'ホテル検索結果 | ホテル予約サイト',
  description: 'ホテルの検索結果一覧です',
};

// 検索パラメータの型定義
interface SearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
}

// サーバーコンポーネントでホテルを検索
async function searchHotelsWithParams(searchParams: SearchParams) {
  const params = {
    location: searchParams.location || '',
    checkIn: searchParams.checkIn || new Date().toISOString().split('T')[0],
    checkOut: searchParams.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: parseInt(searchParams.guests || '2', 10),
    minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice, 10) : undefined,
    maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice, 10) : undefined,
    rating: searchParams.rating ? parseFloat(searchParams.rating) : undefined,
  };

  const result = await searchHotels(params);
  return result.hotels || [];
}

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const hotels = await searchHotelsWithParams(searchParams);
  
  // 検索パラメータから日付を取得
  const checkIn = searchParams.checkIn
    ? new Date(searchParams.checkIn)
    : new Date();
  
  const checkOut = searchParams.checkOut
    ? new Date(searchParams.checkOut)
    : new Date(Date.now() + 86400000);
  
  const guests = parseInt(searchParams.guests || '2', 10);
  const location = searchParams.location || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">ホテル検索結果</h1>
        
        {location && (
          <p className="text-lg text-gray-600 mb-2">
            <span className="font-semibold">{location}</span> のホテル
          </p>
        )}
        
        <p className="text-gray-600">
          {checkIn.toLocaleDateString('ja-JP')} から {checkOut.toLocaleDateString('ja-JP')} まで・
          {guests}名
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* サイドバー（検索フィルター） */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">検索条件</h2>
            
            <SearchForm
              defaultLocation={location}
              defaultCheckIn={checkIn}
              defaultCheckOut={checkOut}
              defaultGuests={guests}
            />
            
            {/* 価格フィルター（実装予定） */}
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">価格帯</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="price-1"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="price-1" className="ml-2 text-sm text-gray-700">
                    ~¥10,000
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-2"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="price-2" className="ml-2 text-sm text-gray-700">
                    ¥10,000~¥20,000
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-3"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="price-3" className="ml-2 text-sm text-gray-700">
                    ¥20,000~¥30,000
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-4"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="price-4" className="ml-2 text-sm text-gray-700">
                    ¥30,000~
                  </label>
                </div>
              </div>
            </div>
            
            {/* 評価フィルター（実装予定） */}
            <div className="mt-6">
              <h3 className="text-md font-semibold mb-2">評価</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="rating-1"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rating-1" className="ml-2 text-sm text-gray-700">
                    4.5以上
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="rating-2"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rating-2" className="ml-2 text-sm text-gray-700">
                    4.0以上
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="rating-3"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rating-3" className="ml-2 text-sm text-gray-700">
                    3.5以上
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ（ホテル一覧） */}
        <div className="lg:col-span-3">
          {hotels.length > 0 ? (
            <div className="space-y-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} className="w-full" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">
                検索条件に一致するホテルが見つかりませんでした
              </h2>
              <p className="text-gray-600 mb-6">
                検索条件を変更して、再度お試しください。
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
              >
                トップページに戻る
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}