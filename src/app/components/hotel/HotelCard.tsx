import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Hotel } from '@/types';

interface HotelCardProps {
  hotel: Hotel;
  className?: string;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, className = '' }) => {
  // 価格をフォーマット
  const formattedPrice = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: hotel.currency,
    minimumFractionDigits: 0,
  }).format(hotel.price);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="relative h-48 w-full">
        <Image
          src={hotel.images[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={hotel.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 truncate">{hotel.name}</h3>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center text-yellow-500 mr-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.floor(hotel.rating) ? 'text-yellow-500' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1 text-sm font-medium text-gray-700">
              {hotel.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            ({hotel.reviewCount}件のレビュー)
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{hotel.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-3">
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
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="truncate">{hotel.address}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-blue-600">{formattedPrice}</span>
            <span className="text-sm text-gray-500"> / 泊</span>
          </div>
          
          <Link
            href={`/hotels/${hotel.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            詳細を見る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;