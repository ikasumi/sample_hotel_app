'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { getHotelById } from '@/lib/api/bookingApi';
import { createBooking } from '@/lib/firebase/firestore';
import { HotelDetails, RoomType } from '@/types';

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const hotelId = searchParams.get('hotelId') || '';
  const roomId = searchParams.get('roomId') || '';
  const checkInParam = searchParams.get('checkIn') || '';
  const checkOutParam = searchParams.get('checkOut') || '';
  const guestsParam = searchParams.get('guests') || '2';
  
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  
  // 日付とゲスト数の設定
  const checkIn = checkInParam ? new Date(checkInParam) : new Date();
  const checkOut = checkOutParam ? new Date(checkOutParam) : new Date(Date.now() + 86400000);
  const guests = parseInt(guestsParam, 10);
  
  // 宿泊日数を計算
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  // ホテル情報の取得
  useEffect(() => {
    const fetchHotelData = async () => {
      if (!hotelId) {
        setError('ホテルIDが指定されていません');
        setLoading(false);
        return;
      }
      
      try {
        const result = await getHotelById(hotelId);
        
        if (!result.success || !result.hotel) {
          setError('ホテル情報の取得に失敗しました');
          setLoading(false);
          return;
        }
        
        setHotel(result.hotel);
        
        // 部屋IDが指定されている場合は、その部屋を選択
        if (roomId) {
          const room = result.hotel.rooms.find(r => r.id === roomId);
          if (room) {
            setSelectedRoom(room);
          } else {
            // 部屋が見つからない場合は最初の部屋を選択
            setSelectedRoom(result.hotel.rooms[0]);
          }
        } else {
          // 部屋IDが指定されていない場合は最初の部屋を選択
          setSelectedRoom(result.hotel.rooms[0]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('ホテル情報の取得中にエラーが発生しました');
        setLoading(false);
      }
    };
    
    // ユーザーがログインしていない場合はログインページにリダイレクト
    if (!user) {
      const params = new URLSearchParams({
        redirect: `/bookings/new?hotelId=${hotelId}&roomId=${roomId}&checkIn=${checkInParam}&checkOut=${checkOutParam}&guests=${guestsParam}`,
      });
      
      router.push(`/auth/login?${params.toString()}`);
      return;
    }
    
    fetchHotelData();
  }, [hotelId, roomId, checkInParam, checkOutParam, guestsParam, user, router]);

  // 部屋の選択
  const handleRoomSelect = (room: RoomType) => {
    setSelectedRoom(room);
  };

  // 予約の作成
  const handleCreateBooking = async () => {
    if (!user || !hotel || !selectedRoom) {
      return;
    }
    
    setLoading(true);
    
    try {
      // 予約データの作成
      const bookingData = {
        userId: user.uid,
        hotelId: hotel.id,
        hotelData: hotel,
        roomType: selectedRoom,
        checkIn,
        checkOut,
        guests,
        totalPrice: selectedRoom.price * nights,
        currency: selectedRoom.currency,
        status: 'confirmed' as const,
      };
      
      // 予約の作成
      const result = await createBooking(bookingData);
      
      if (result.success) {
        setBookingSuccess(true);
        setBookingId(result.id || '');
      } else {
        setError('予約の作成に失敗しました');
      }
    } catch (err) {
      setError('予約の作成中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 予約成功時の表示
  if (bookingSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
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
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">予約が完了しました</h2>
            <p className="text-gray-600">
              予約IDは <span className="font-semibold">{bookingId}</span> です
            </p>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">予約詳細</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">ホテル名</span>
                <span className="font-medium">{hotel?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">部屋タイプ</span>
                <span className="font-medium">{selectedRoom?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">チェックイン</span>
                <span className="font-medium">{checkIn.toLocaleDateString('ja-JP')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">チェックアウト</span>
                <span className="font-medium">{checkOut.toLocaleDateString('ja-JP')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">宿泊数</span>
                <span className="font-medium">{nights}泊</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">宿泊人数</span>
                <span className="font-medium">{guests}名</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-800 font-semibold">合計金額</span>
                <span className="font-bold text-blue-600">
                  {new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: selectedRoom?.currency || 'JPY',
                    minimumFractionDigits: 0,
                  }).format((selectedRoom?.price || 0) * nights)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/bookings"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 text-center"
            >
              予約一覧を見る
            </Link>
            <Link
              href="/"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300 text-center"
            >
              トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ローディング中の表示
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">エラーが発生しました</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          
          <div className="flex justify-center">
            <Link
              href="/"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ホテルが見つからない場合の表示
  if (!hotel || !selectedRoom) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">ホテル情報が見つかりません</h2>
            <p className="text-gray-600">指定されたホテルの情報を取得できませんでした。</p>
          </div>
          
          <div className="flex justify-center">
            <Link
              href="/"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 予約作成フォームの表示
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/hotels/${hotelId}`}
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
          ホテル詳細に戻る
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-6">予約の確認</h1>
          
          {/* ホテル情報 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 sm:p-6">
              <h2 className="text-2xl font-semibold mb-2">{hotel.name}</h2>
              
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
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
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
              
              <div className="grid grid-cols-2 gap-4 mb-4">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-700">
                    チェックイン: {checkIn.toLocaleDateString('ja-JP')}
                  </span>
                </div>
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-700">
                    チェックアウト: {checkOut.toLocaleDateString('ja-JP')}
                  </span>
                </div>
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-gray-700">{nights}泊</span>
                </div>
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
                  <span className="text-gray-700">{guests}名</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 部屋タイプの選択 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-4">部屋タイプの選択</h2>
              
              <div className="space-y-4">
                {hotel.rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`border rounded-lg p-4 cursor-pointer transition duration-200 ${
                      selectedRoom?.id === room.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative h-40 sm:h-auto sm:w-40 mb-4 sm:mb-0 sm:mr-4">
                        <Image
                          src={room.images[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                          alt={room.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{room.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{room.description}</p>
                        
                        <div className="flex items-center mb-2">
                          <svg
                            className="w-5 h-5 text-gray-500 mr-1"
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
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {room.amenities.slice(0, 3).map((amenity, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                        
                        <div className="font-bold text-lg text-blue-600">
                          {new Intl.NumberFormat('ja-JP', {
                            style: 'currency',
                            currency: room.currency,
                            minimumFractionDigits: 0,
                          }).format(room.price)}
                          <span className="text-sm font-normal text-gray-500"> / 泊</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center mt-4 sm:mt-0 sm:ml-4">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedRoom?.id === room.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {selectedRoom?.id === room.id && (
                            <svg
                              className="w-4 h-4 text-white"
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
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* サイドバー（予約概要） */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">予約概要</h2>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">部屋タイプ</span>
                <span className="font-semibold">{selectedRoom.name}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">料金（1泊あたり）</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: selectedRoom.currency,
                    minimumFractionDigits: 0,
                  }).format(selectedRoom.price)}
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
                    currency: selectedRoom.currency,
                    minimumFractionDigits: 0,
                  }).format(selectedRoom.price * nights)}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleCreateBooking}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
            >
              {loading ? '処理中...' : '予約を確定する'}
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              「予約を確定する」をクリックすると、利用規約とプライバシーポリシーに同意したことになります。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}