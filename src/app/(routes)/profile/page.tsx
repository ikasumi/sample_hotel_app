'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase/config';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // ユーザー情報の初期化
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/profile');
      return;
    }
    
    setDisplayName(user.displayName || '');
    setEmail(user.email || '');
  }, [user, router]);

  // プロフィール更新
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // 名前が変更された場合のみ更新
      if (displayName !== user.displayName) {
        // Firebase Authのプロフィール更新
        await updateProfile(auth.currentUser!, {
          displayName,
        });
        
        // Firestoreのユーザー情報更新
        await updateDoc(doc(db, 'users', user.uid), {
          displayName,
        });
      }
      
      setSuccess(true);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'プロフィールの更新中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // ログアウト処理
  const handleLogout = async () => {
    setLoading(true);
    
    try {
      await logout();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'ログアウト中にエラーが発生しました');
      setLoading(false);
    }
  };

  // ユーザーがログインしていない場合のローディング表示
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">プロフィール</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {success && (
              <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                プロフィールが更新されました
              </div>
            )}
            
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {isEditing ? (
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    名前
                  </label>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    メールアドレスは変更できません
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                  >
                    {loading ? '更新中...' : '保存'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(user.displayName || '');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-300"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-4">
                  <h2 className="text-sm font-medium text-gray-500 mb-1">名前</h2>
                  <p className="text-lg">{user.displayName || '未設定'}</p>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-500 mb-1">メールアドレス</h2>
                  <p className="text-lg">{user.email}</p>
                </div>
                
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                >
                  編集
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">アカウント設定</h2>
            
            <div className="space-y-4">
              <div>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 disabled:opacity-50"
                >
                  {loading ? 'ログアウト中...' : 'ログアウト'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}