'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * مكون ClientOnly
 * يستخدم لعرض المحتوى فقط في جانب العميل، مما يمنع مشاكل Hydration
 * @param children المحتوى الذي سيتم عرضه في جانب العميل فقط
 * @param fallback محتوى بديل يعرض أثناء التحميل (اختياري)
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // إذا لم نكن في جانب العميل بعد، نعرض المحتوى البديل أو لا شيء
  if (!isClient) {
    return <>{fallback}</>;
  }

  // في جانب العميل، نعرض المحتوى الفعلي
  return <>{children}</>;
}
