'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';

// تعريف نوع المستخدم
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  phoneNumber?: string;
}

// تعريف نوع سياق المصادقة
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

// إنشاء سياق المصادقة
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// مزود سياق المصادقة
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // تسجيل الدخول
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[AUTH] Attempting login with email:', email);
      
      const response = await axios.post('http://localhost:5000/api/users/login', {
        email,
        password
      });
      
      // طباعة الاستجابة الكاملة للتشخيص
      console.log('[AUTH] Full login response:', response.data);
      
      // التحقق من وجود التوكن في الاستجابة
      const token = response.data.token;
      
      if (token) {
        // الحصول على بيانات المستخدم من الخادم
        try {
          console.log('[AUTH] Token received, fetching user data');
          
          // استدعاء بيانات المستخدم باستخدام التوكن
          const userResponse = await axios.get('http://localhost:5000/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log('[AUTH] User data received:', userResponse.data);
          
          // التحقق من وجود بيانات المستخدم
          if (userResponse.data.success && userResponse.data.data) {
            const userData = userResponse.data.data;
            
            // حفظ بيانات المستخدم والتوكن في التخزين المحلي
            if (typeof window !== 'undefined') {
              console.log('[AUTH] Saving user and token to localStorage');
              localStorage.setItem('user', JSON.stringify(userData));
              localStorage.setItem('token', token);
              
              // التحقق من حفظ البيانات بشكل صحيح
              const savedUser = localStorage.getItem('user');
              const savedToken = localStorage.getItem('token');
              console.log('[AUTH] Saved to localStorage:', {
                userSaved: !!savedUser,
                tokenSaved: !!savedToken
              });
            }
            
            setUser(userData);
            setToken(token);
            console.log('[AUTH] Login successful, user and token set in context');
            return true;
          } else {
            console.error('[AUTH] Failed to get user data');
            setError('تم تسجيل الدخول ولكن حدثت مشكلة في الحصول على بيانات المستخدم');
            return false;
          }
        } catch (userError) {
          console.error('[AUTH] Error fetching user data:', userError);
          setError('تم تسجيل الدخول ولكن حدثت مشكلة في الحصول على بيانات المستخدم');
          return false;
        }
      } else {
        // التحقق من وجود رسالة خطأ في الاستجابة
        const errorMessage = response.data.message || response.data.error || 'فشل تسجيل الدخول';
        console.error('[AUTH] Login failed:', errorMessage);
        setError(errorMessage);
        return false;
      }
    } catch (error: any) {
      console.error('[AUTH] Login error:', error);
      console.error('[AUTH] Error response:', error.response?.data);
      setError(error.response?.data?.error || 'حدث خطأ أثناء تسجيل الدخول');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // تسجيل الخروج
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  // التحقق من المصادقة
  const checkAuth = async (): Promise<boolean> => {
    console.log('[AUTH] Checking authentication...');
    
    if (typeof window === 'undefined') {
      // إذا كان الكود يعمل على الخادم، فلا يوجد مستخدم محفوظ
      console.log('[AUTH] Running on server side, no authentication');
      setUser(null);
      setToken(null);
      return false;
    }
    
    // التحقق من وجود المستخدم في السياق أولاً
    if (user && token) {
      console.log('[AUTH] User already authenticated in context');
      return true;
    }
    
    setLoading(true);
    
    try {
      // محاولة استعادة المستخدم والتوكن من localStorage
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      console.log('[AUTH] Checking localStorage:', {
        userExists: !!savedUser,
        tokenExists: !!savedToken
      });
      
      if (!savedUser || !savedToken) {
        console.log('[AUTH] Missing user or token in localStorage');
        setUser(null);
        setToken(null);
        setLoading(false);
        return false;
      }
      
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('[AUTH] Successfully parsed user from localStorage');
        
        // التحقق من صحة بيانات المستخدم
        if (!parsedUser || !parsedUser._id || !parsedUser.email) {
          console.error('[AUTH] Invalid user data in localStorage');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
          setLoading(false);
          return false;
        }
        
        setUser(parsedUser);
        setToken(savedToken);
        console.log('[AUTH] Authentication successful from localStorage');
        setLoading(false);
        return true;
      } catch (parseError) {
        console.error('[AUTH] Error parsing user from localStorage:', parseError);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('[AUTH] Error checking authentication:', error);
      setUser(null);
      setToken(null);
      setLoading(false);
      return false;
    }
  };

  // تهيئة المصادقة عند تحميل التطبيق
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };
    
    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        checkAuth
      }}
    >
      <ClientOnly>
        {children}
      </ClientOnly>
    </AuthContext.Provider>
  );
};

// هوك استخدام سياق المصادقة
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
