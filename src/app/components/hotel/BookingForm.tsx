'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface BookingFormProps {
  hotelId: string;
  roomId?: string;
  defaultCheckIn?: Date;
  defaultCheckOut?: Date;
  defaultGuests?: number;
}

const BookingForm: React.FC<BookingFormProps> = ({
  hotelId,
  roomId,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests = 2,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [checkIn, setCheckIn] = useState<Date>(defaultCheckIn || today);
  const [checkOut, setCheckOut] = useState<Date>(defaultCheckOut || tomorrow);
  const [guests, setGuests] = useState(defaultGuests);
  const [error, setError] = useState('');
  
  // 宿泊日数を計算
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (checkIn >= checkOut) {
      setError('チェックアウト日はチェックイン日より後の日付を選択してください');
      return;
    }
    
    // ユーザーがログインしていない場合はログインページにリダイレクト
    if (!user) {
      const params = new URLSearchParams({
        redirect: `/bookings/new?hotelId=${hotelId}${roomId ? `&roomId=${roomId}` : ''}&checkIn=${checkIn.toISOString().split('T')[0]}&checkOut=${checkOut.toISOString().split('T')[0]}&guests=${guests}`,
      });
      
      router.push(`/auth/login?${params.toString()}`);
      return;
    }
    
    // 予約作成ページへ遷移
    const params = new URLSearchParams({
      hotelId,
      ...(roomId && { roomId }),
      checkIn: checkIn.toISOString().split('T')[0],
      checkOut: checkOut.toISOString().split('T')[0],
      guests: guests.toString(),
    });
    
    router.push(`/bookings/new?${params.toString()}`);
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">
            チェックイン
          </label>
          <DatePicker
            id="checkIn"
            selected={checkIn}
            onChange={(date: Date | null) => date && setCheckIn(date)}
            selectsStart
            startDate={checkIn}
            endDate={checkOut}
            minDate={today}
            dateFormat="yyyy/MM/dd"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">
            チェックアウト
          </label>
          <DatePicker
            id="checkOut"
            selected={checkOut}
            onChange={(date: Date | null) => date && setCheckOut(date)}
            selectsEnd
            startDate={checkIn}
            endDate={checkOut}
            minDate={new Date(checkIn.getTime() + 86400000)} // チェックイン日の翌日
            dateFormat="yyyy/MM/dd"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-1">
            宿泊人数
          </label>
          <select
            id="guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num}人
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
        >
          予約する
        </button>
        
        {!user && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            予約するにはログインが必要です
          </p>
        )}
      </form>
    </div>
  );
};

export default BookingForm;