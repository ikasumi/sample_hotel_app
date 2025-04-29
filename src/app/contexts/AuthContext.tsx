'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { registerUser, loginUser, loginWithGoogle, logoutUser } from '@/lib/firebase/auth';
import { User as UserType } from '@/types';

// 認証コンテキストの型定義
interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  error: string | null;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

// デフォルト値を持つコンテキストを作成
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  register: async () => ({ success: false }),
  login: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  logout: async () => ({ success: false }),
  clearError: () => {},
});

// コンテキストプロバイダーコンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Firebase認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Firestoreからユーザー情報を取得
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            // Firestoreのデータを使用
            setUser({ 
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              ...userDoc.data()
            } as UserType);
          } else {
            // Firestoreにデータがない場合はFirebaseのデータを使用
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            } as UserType);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          } as UserType);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  // ユーザー登録
  const register = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await registerUser(email, password, displayName);
      
      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return { success: false, error: result.error };
      }
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'ユーザー登録中にエラーが発生しました';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // ログイン
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loginUser(email, password);
      
      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return { success: false, error: result.error };
      }
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'ログイン中にエラーが発生しました';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Googleログイン
  const googleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loginWithGoogle();
      
      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return { success: false, error: result.error };
      }
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Googleログイン中にエラーが発生しました';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // ログアウト
  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await logoutUser();
      
      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return { success: false, error: result.error };
      }
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'ログアウト中にエラーが発生しました';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // エラーをクリア
  const clearError = () => {
    setError(null);
  };

  // コンテキスト値
  const value = {
    user,
    loading,
    error,
    register,
    login,
    loginWithGoogle: googleLogin,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// カスタムフック
export const useAuth = () => useContext(AuthContext);