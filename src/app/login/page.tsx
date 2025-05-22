'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import ClientOnly from '@/components/ClientOnly';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@safa.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'مدير', // دور المدير افتراضياً
    phoneNumber: ''
  });
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { language, t, isRTL } = useLanguage();
  const { login, user } = useAuth();
  
  // استخدام useEffect للتأكد من أننا في جانب العميل
  useEffect(() => {
    setMounted(true);
    console.log('[LOGIN] Page mounted');
    
    // التحقق من وجود توكن في localStorage
    const checkAuth = async () => {
      try {
        console.log('[LOGIN] Checking authentication state');
        
        // التحقق من وجود المستخدم في سياق المصادقة
        if (user) {
          console.log('[LOGIN] User already logged in via context, redirecting to dashboard');
          // إضافة تأخير للتوجيه لمنع التغير السريع
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
          return;
        }
        
        // التحقق من وجود توكن في localStorage
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        console.log('[LOGIN] Token exists:', !!token);
        console.log('[LOGIN] Saved user exists:', !!savedUser);
        
        if (token && savedUser) {
          console.log('[LOGIN] Found token and user in localStorage');
          // إضافة تأخير للتوجيه لمنع التغير السريع
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } else {
          console.log('[LOGIN] No valid authentication found, staying on login page');
        }
      } catch (error) {
        console.error('[LOGIN] Error checking authentication:', error);
      }
    };
    
    // تأخير التحقق من المصادقة لمنع التغير السريع في الصفحة
    setTimeout(() => {
      checkAuth();
    }, 1000);
  }, [user]);

  // وظيفة تسجيل الدخول
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('[LOGIN] Attempting login with email:', email);
      
      // التأكد من عدم وجود بيانات مستخدم قديمة في localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // استخدام دالة login من سياق المصادقة
      const success = await login(email, password);
      
      if (success) {
        console.log('[LOGIN] Login successful');
        
        // التحقق من وجود التوكن في localStorage بعد تسجيل الدخول
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        console.log('[LOGIN] After login check:', {
          tokenExists: !!token,
          userExists: !!savedUser
        });
        
        if (token && savedUser) {
          console.log('[LOGIN] Redirecting to dashboard after successful login');
          // إضافة تأخير للتوجيه لمنع التغير السريع
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } else {
          console.error('[LOGIN] Login successful but token or user not saved to localStorage');
          setError('تم تسجيل الدخول ولكن حدثت مشكلة في حفظ بيانات الجلسة');
        }
      } else {
        console.error('[LOGIN] Login failed');
        setError('حدث خطأ أثناء تسجيل الدخول');
      }
    } catch (err: any) {
      console.error('[LOGIN] Login error:', err);
      console.error('[LOGIN] Error response:', err.response?.data);
      setError(err.response?.data?.error || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  // وظيفة تسجيل مستخدم جديد
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting registration with:', registerData);
      // استخدام المسار الجديد للتسجيل كمدير
      const response = await axios.post('http://localhost:5000/api/users/register-admin', registerData);

      console.log('Registration response:', response.data);

      if (response.data.success) {
        // حفظ التوكن والمستخدم في التخزين المحلي
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data));
        }
        
        // توجيه المستخدم إلى لوحة التحكم بعد فترة قصيرة
        setTimeout(() => {
          router.push('/dashboard');
        }, 100);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || t('registerError'));
    } finally {
      setLoading(false);
    }
  };
  
  // وظيفة تغيير بيانات التسجيل
  const handleRegisterDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // تحضير محتوى التحميل
  const loadingContent = (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />
      
      <Container component="main" maxWidth="xs" sx={{ mt: 12, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            {showRegister ? isRTL ? 'تسجيل مستخدم جديد' : 'Register' : t('login')}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <ClientOnly fallback={loadingContent}>
            {!showRegister ? (
            // نموذج تسجيل الدخول
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label={t('email')}
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label={t('password')}
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  fontSize: '1.1rem',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                {loading ? t('loggingIn') : t('login')}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center', display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  color="secondary"
                  size="small"
                  onClick={() => router.push('/forgot-password')}
                  sx={{ textDecoration: 'underline' }}
                >
                  {t('forgotPassword')}
                </Button>
                <Button
                  color="primary"
                  size="small"
                  onClick={() => setShowRegister(true)}
                  sx={{ textDecoration: 'underline' }}
                >
                  {isRTL ? 'تسجيل مستخدم جديد' : 'Register New User'}
                </Button>
              </Box>
            </Box>
          ) : (
            // نموذج تسجيل مستخدم جديد
            <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="register-name"
                label={isRTL ? 'الاسم' : 'Name'}
                name="name"
                value={registerData.name}
                onChange={handleRegisterDataChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="register-email"
                label={isRTL ? 'البريد الإلكتروني' : 'Email'}
                name="email"
                type="email"
                value={registerData.email}
                onChange={handleRegisterDataChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="register-password"
                label={isRTL ? 'كلمة المرور' : 'Password'}
                name="password"
                type="password"
                value={registerData.password}
                onChange={handleRegisterDataChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                fullWidth
                id="register-phone"
                label={isRTL ? 'رقم الهاتف' : 'Phone Number'}
                name="phoneNumber"
                value={registerData.phoneNumber}
                onChange={handleRegisterDataChange}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ 
                  py: 1.5, 
                  fontSize: '1.1rem',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                {loading ? (isRTL ? 'جاري التسجيل...' : 'Registering...') : (isRTL ? 'تسجيل' : 'Register')}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  color="secondary"
                  size="small"
                  onClick={() => setShowRegister(false)}
                  sx={{ textDecoration: 'underline' }}
                >
                  {isRTL ? 'العودة إلى تسجيل الدخول' : 'Back to Login'}
                </Button>
              </Box>
            </Box>
          )}
          </ClientOnly>
        </Paper>
      </Container>
      
      <Footer />
    </Box>
  );
}
