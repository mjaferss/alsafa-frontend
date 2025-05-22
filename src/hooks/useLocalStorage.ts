'use client';

import { useState, useEffect } from 'react';

// هوك مساعد للتعامل مع localStorage بطريقة آمنة للـ SSR
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // حالة لتخزين القيمة
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  // تحميل القيمة المخزنة من localStorage عند تحميل المكون
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);
  
  // دالة لتحديث القيمة في الحالة وفي localStorage
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  return [storedValue, setValue];
}

// هوك للتحقق مما إذا كنا في جانب العميل
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}
