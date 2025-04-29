import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SearchForm from './components/hotel/SearchForm';
import HotelCard from './components/hotel/HotelCard';
import { searchHotels } from '@/lib/api/bookingApi';

// サーバーコンポーネントでモックデータを取得
async function getPopularHotels() {
  // 実際のAPIが実装されたら、ここでAPIを呼び出す
  const result = await searchHotels({
    location: '',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guests: 2,
  });

  return result.hotels || [];
}

export default async function Home() {
  const popularHotels = await getPopularHotels();

  return (
    <div className="flex flex-col min-h-screen">
      {/* ヒーローセクション */}
      <section className="relative h-[500px] flex items-center justify-center">
        {/* 背景画像 */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80"
            alt="ホテルの外観"
            fill
            priority
            className="object-cover brightness-50"
          />
        </div>
        
        <div className="container mx-auto px-4 z-10">
          <div className="text-center text-white mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              理想のホテルを見つけよう
            </h1>
            <p className="text-xl md:text-2xl">
              全国のホテルから最適な宿泊先を簡単に検索・予約
            </p>
          </div>
          
          <div className="max-w-xl mx-auto">
            <SearchForm className="bg-white/90 backdrop-blur-sm" />
          </div>
        </div>
      </section>

      {/* 人気のホテルセクション */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">人気のホテル</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularHotels.slice(0, 6).map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link
              href="/hotels"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
            >
              すべてのホテルを見る
            </Link>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            当サイトの特徴
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">簡単検索</h3>
              <p className="text-gray-600">
                目的地、日程、人数を入力するだけで、最適なホテルを簡単に検索できます。
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">お得な料金</h3>
              <p className="text-gray-600">
                様々なホテルの料金を比較して、最もお得な宿泊プランを見つけることができます。
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">安心予約</h3>
              <p className="text-gray-600">
                予約から宿泊まで、安心してご利用いただけるサポート体制を整えています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 目的地セクション */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            人気の目的地
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/hotels?location=東京" className="group">
              <div className="relative h-40 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8dG9reW98ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60"
                  alt="東京"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">東京</span>
                </div>
              </div>
            </Link>
            
            <Link href="/hotels?location=大阪" className="group">
              <div className="relative h-40 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1590559899731-a382839e5549?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8b3Nha2F8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60"
                  alt="大阪"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">大阪</span>
                </div>
              </div>
            </Link>
            
            <Link href="/hotels?location=京都" className="group">
              <div className="relative h-40 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8a3lvdG98ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60"
                  alt="京都"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">京都</span>
                </div>
              </div>
            </Link>
            
            <Link href="/hotels?location=沖縄" className="group">
              <div className="relative h-40 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8b2tpbmF3YXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
                  alt="沖縄"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">沖縄</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
