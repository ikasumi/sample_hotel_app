'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { getUserBookings, cancelBooking } from '@/lib/firebase/firestore';
import { Booking } from '@/types';

export default function BookingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // 予約データの取得
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        router.push('/auth/login?redirect=/bookings');
        return;
      }
      
      try {
        const result = await getUserBookings(user.uid);
        
        if (result.success) {
          setBookings(result.bookings || []);
        } else {
          setError('予約データの取得に失敗しました');
        }
      } catch (err) {
        setError('予約データの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user, router]);

  // 予約のキャンセル
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('この予約をキャンセルしてもよろしいですか？')) {
      return;
    }
    
    setCancellingId(bookingId);
    
    try {
      const result = await cancelBooking(bookingId);
      
      if (result.success) {
        // 予約リストを更新
        setBookings(bookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' as const } 
            : booking
        ));
      } else {
        setError('予約のキャンセルに失敗しました');
      }
    } catch (err) {
      setError('予約のキャンセル中にエラーが発生しました');
    } finally {
      setCancellingId(null);
    }
  };

  // ステータスに応じたバッジの色を取得
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ステータスの日本語表示
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '予約確定';
      case 'cancelled':
        return 'キャンセル済み';
      case 'completed':
        return '宿泊済み';
      default:
        return status;
    }
  };

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

  // 予約がない場合の表示
  if (bookings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">予約履歴</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">予約がありません</h2>
          <p className="text-gray-600 mb-6">まだホテルの予約をしていません。</p>
          
          <Link
            href="/hotels"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            ホテルを探す
          </Link>
        </div>
      </div>
    );
  }

  // 予約一覧の表示
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">予約履歴</h1>
      
      <div className="space-y-6">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-40 sm:h-auto sm:w-40 mb-4 sm:mb-0 sm:mr-6">
                  <Image
                    src={booking.hotelData.images[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={booking.hotelData.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between mb-2">
                    <h2 className="text-xl font-semibold mb-1 sm:mb-0">
                      {booking.hotelData.name}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        booking.status
                      )}`}
                    >
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{booking.hotelData.address}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
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
                        チェックイン: {new Date(booking.checkIn).toLocaleDateString('ja-JP')}
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
                        チェックアウト: {new Date(booking.checkOut).toLocaleDateString('ja-JP')}
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-gray-700">{booking.guests}名</span>
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700">
                        {new Intl.NumberFormat('ja-JP', {
                          style: 'currency',
                          currency: booking.currency || 'JPY',
                          minimumFractionDigits: 0,
                        }).format(booking.totalPrice || 0)}
                      </span>
                    </div>
                  </div>
                  
                  {booking.roomType && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">部屋タイプ</h3>
                      <p className="text-gray-600">{booking.roomType.name}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      href={`/hotels/${booking.hotelId}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 text-center"
                    >
                      ホテル詳細を見る
                    </Link>
                    
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => booking.id && handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? '処理中...' : '予約をキャンセル'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}