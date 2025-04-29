import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getHotelById } from '@/lib/api/bookingApi';
import BookingForm from '@/app/components/hotel/BookingForm';

// 動的メタデータ
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const result = await getHotelById(params.id);
  
  if (!result.success || !result.hotel) {
    return {
      title: 'ホテルが見つかりません | ホテル予約サイト',
    };
  }
  
  return {
    title: `${result.hotel.name} | ホテル予約サイト`,
    description: result.hotel.description,
  };
}

export default async function HotelDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { checkIn?: string; checkOut?: string; guests?: string };
}) {
  const result = await getHotelById(params.id);
  
  if (!result.success || !result.hotel) {
    notFound();
  }
  
  const hotel = result.hotel;
  
  // 検索パラメータから日付を取得
  const checkIn = searchParams.checkIn
    ? new Date(searchParams.checkIn)
    : new Date();
  
  const checkOut = searchParams.checkOut
    ? new Date(searchParams.checkOut)
    : new Date(Date.now() + 86400000);
  
  const guests = parseInt(searchParams.guests || '2', 10);
  
  // 宿泊日数を計算
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/hotels"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          検索結果に戻る
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{hotel.name}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center text-yellow-500 mr-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(hotel.rating) ? 'text-yellow-500' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-lg font-medium text-gray-700">
                {hotel.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-600">
              ({hotel.reviewCount}件のレビュー)
            </span>
          </div>
          
          <div className="flex items-center text-gray-600 mb-6">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{hotel.address}</span>
          </div>
          
          {/* ホテル画像ギャラリー */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                <Image
                  src={hotel.images[0] || 'https://via.placeholder.com/600x400?text=No+Image'}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {hotel.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative h-32 md:h-38 rounded-lg overflow-hidden">
                    <Image
                      src={image || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={`${hotel.name} - 画像 ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* ホテル説明 */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">ホテル情報</h2>
            <p className="text-gray-700 mb-4">{hotel.description}</p>
            
            <h3 className="text-xl font-semibold mb-2">設備・サービス</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {hotel.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 部屋タイプ */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">部屋タイプ</h2>
            
            <div className="space-y-6">
              {hotel.rooms.map((room) => (
                <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="relative h-48 md:h-full">
                      <Image
                        src={room.images[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={room.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="p-4 md:col-span-2">
                      <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                      <p className="text-gray-700 mb-4">{room.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-gray-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="text-gray-700">最大{room.capacity}名</span>
                        </div>
                        
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                          <div key={index} className="flex items-center">
                            <svg
                              className="w-5 h-5 text-green-500 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-gray-700">{amenity}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-blue-600">
                            {new Intl.NumberFormat('ja-JP', {
                              style: 'currency',
                              currency: room.currency,
                              minimumFractionDigits: 0,
                            }).format(room.price)}
                          </span>
                          <span className="text-gray-500"> / 泊</span>
                        </div>
                        
                        <Link
                          href={`/bookings/new?hotelId=${hotel.id}&roomId=${room.id}&checkIn=${checkIn.toISOString().split('T')[0]}&checkOut=${checkOut.toISOString().split('T')[0]}&guests=${guests}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                        >
                          予約する
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* レビュー */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">レビュー</h2>
            
            <div className="space-y-6">
              {hotel.reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                        <span className="text-gray-600 font-semibold">
                          {review.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{review.userName}</h4>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <span className="font-bold mr-1">{review.rating.toFixed(1)}</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* サイドバー（予約フォーム） */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">予約</h2>
            
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">料金（1泊あたり）</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: hotel.currency,
                    minimumFractionDigits: 0,
                  }).format(hotel.price)}
                </span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">宿泊数</span>
                <span className="font-semibold">{nights}泊</span>
              </div>
              
              <div className="flex justify-between mb-2 pt-2 border-t border-gray-200">
                <span className="text-gray-700">合計</span>
                <span className="font-bold text-lg">
                  {new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: hotel.currency,
                    minimumFractionDigits: 0,
                  }).format(hotel.price * nights)}
                </span>
              </div>
            </div>
            
            <BookingForm
              hotelId={hotel.id}
              defaultCheckIn={checkIn}
              defaultCheckOut={checkOut}
              defaultGuests={guests}
            />
          </div>
        </div>
      </div>
    </div>
  );
}