'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

// نوع بيانات المستخدم
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function UserDetailPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isRTL } = useLanguage();
  const userId = searchParams.get('id');

  useEffect(() => {
    if (!userId) {
      setError('User ID is missing');
      setLoading(false);
      return;
    }

    // التحقق من وجود توكن المستخدم
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    // إعداد الهيدر للطلبات
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    // جلب بيانات المستخدم الحالي للتحقق من الصلاحيات
    const checkAdminStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users/me', config);
        
        if (response.data.success) {
          const currentUser = response.data.data;
          // التحقق من أن المستخدم مدير
          if (currentUser.role === 'مدير') {
            setIsAdmin(true);
            // جلب بيانات المستخدم المطلوب
            fetchUserDetails(config);
          } else {
            setError(t('accessDenied'));
            setLoading(false);
          }
        }
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        if (err.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          router.push('/login');
        } else {
          setError(err.response?.data?.error || 'Failed to check permissions');
          setLoading(false);
        }
      }
    };

    // جلب بيانات المستخدم المطلوب
    const fetchUserDetails = async (config: any) => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/users/${userId}`, config);
        
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (err: any) {
        console.error('Error fetching user details:', err);
        setError(err.response?.data?.error || 'Failed to fetch user details');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [router, t, userId]);

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return t('notAvailable');
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {t('accessDenied')}
          </Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error || 'User not found'}
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard/users')}
            sx={{ mt: 2 }}
          >
            {isRTL ? 'العودة إلى قائمة المستخدمين' : 'Back to Users List'}
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard/users')}
            sx={{ mr: 2 }}
          >
            {isRTL ? 'العودة' : 'Back'}
          </Button>
          <Typography variant="h4" component="h1">
            {t('userName')}: {user.name}
          </Typography>
        </Box>
        
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                {t('accountInfo')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('userName')}
                </Typography>
                <Typography variant="h6">
                  {user.name}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('userEmail')}
                </Typography>
                <Typography variant="h6">
                  {user.email}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('userPhoneNumber')}
                </Typography>
                <Typography variant="h6">
                  {user.phoneNumber || t('notAvailable')}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('userRoleLabel')}
                </Typography>
                <Typography variant="h6">
                  {user.role} {/* عرض الدور كما هو في قاعدة البيانات بدون ترجمة */}
                </Typography>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom color="primary">
                {t('userStatus')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('userStatus')}
                </Typography>
                <Chip 
                  label={user.isActive ? t('activeStatus') : t('inactiveStatus')} 
                  color={user.isActive ? 'success' : 'error'} 
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('userCreatedAt')}
                </Typography>
                <Typography variant="h6">
                  {formatDate(user.createdAt)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('userLastLogin')}
                </Typography>
                <Typography variant="h6">
                  {user.lastLogin ? formatDate(user.lastLogin) : t('notAvailable')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<EditIcon />}
            onClick={() => router.push(`/dashboard/users/edit?id=${user._id}`)}
          >
            {t('editButton')}
          </Button>
          <Button 
            variant="contained" 
            color="info" 
            startIcon={<KeyIcon />}
            onClick={() => router.push(`/dashboard/users/password?id=${user._id}`)}
          >
            {t('changePassword')}
          </Button>
        </Box>
      </Container>
      
      <Footer />
    </Box>
  );
}
