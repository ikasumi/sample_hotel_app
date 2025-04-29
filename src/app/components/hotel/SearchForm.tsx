'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SearchFormProps {
  className?: string;
  defaultLocation?: string;
  defaultCheckIn?: Date;
  defaultCheckOut?: Date;
  defaultGuests?: number;
}

const SearchForm: React.FC<SearchFormProps> = ({
  className = '',
  defaultLocation = '',
  defaultCheckIn,
  defaultCheckOut,
  defaultGuests = 2,
}) => {
  const router = useRouter();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [location, setLocation] = useState(defaultLocation);
  const [checkIn, setCheckIn] = useState<Date>(defaultCheckIn || today);
  const [checkOut, setCheckOut] = useState<Date>(defaultCheckOut || tomorrow);
  const [guests, setGuests] = useState(defaultGuests);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!location.trim()) {
      setError('目的地を入力してください');
      return;
    }
    
    if (checkIn >= checkOut) {
      setError('チェックアウト日はチェックイン日より後の日付を選択してください');
      return;
    }
    
    // クエリパラメータの作成
    const params = new URLSearchParams();
    params.append('location', location);
    params.append('checkIn', checkIn.toISOString().split('T')[0]);
    params.append('checkOut', checkOut.toISOString().split('T')[0]);
    params.append('guests', guests.toString());
    
    // 検索ページへ遷移
    router.push(`/hotels?${params.toString()}`);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">ホテルを検索</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            目的地 / ホテル名
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="都市、地域、ホテル名など"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
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
          
          <div>
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
          検索
        </button>
      </form>
    </div>
  );
};

export default SearchForm;