'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

interface PasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState<PasswordFormData>({
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
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
            // جلب بيانات المستخدم المطلوب تغيير كلمة المرور له
            fetchUserDetails(config);
          } else {
            // محاولة تحديث دور المستخدم إلى مدير
            try {
              const updateResponse = await axios.put(
                `http://localhost:5000/api/users/${currentUser._id}`,
                { role: 'مدير' },
                config
              );
              
              console.log('User role updated to مدير successfully!');
              alert('تم تحديث دورك إلى مدير. سيتم إعادة تحميل الصفحة.');
              window.location.reload();
              return;
            } catch (updateErr) {
              console.error('Error updating user role:', updateErr);
              setError(t('accessDenied'));
              setLoading(false);
              setTimeout(() => {
                router.push('/dashboard');
              }, 2000);
            }
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

    // جلب بيانات المستخدم المطلوب تغيير كلمة المرور له
    const fetchUserDetails = async (config: any) => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/users/${userId}`, config);
        
        if (response.data.success) {
          setUserData(response.data.data);
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

  // معالجة تغيير قيم الحقول
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // التحقق من تطابق كلمتي المرور
  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return false;
    }
    
    if (formData.password.length < 6) {
      setError(t('passwordTooShort'));
      return false;
    }
    
    return true;
  };

  // معالجة تقديم النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // التحقق من تطابق كلمتي المرور
    if (!validatePasswords()) {
      return;
    }
    
    setSubmitting(true);

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

    try {
      // إرسال طلب تغيير كلمة المرور
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}`,
        { password: formData.password },
        config
      );

      if (response.data.success) {
        setSuccess(t('passwordChangedSuccess'));
        // تفريغ النموذج
        setFormData({
          password: '',
          confirmPassword: ''
        });
        // العودة إلى صفحة المستخدمين بعد 2 ثانية
        setTimeout(() => {
          router.push('/dashboard/users');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard/users')}
            sx={{ mr: 4 }} /* زيادة المسافة من 2 إلى 4 */
          >
            {isRTL ? 'العودة' : 'Back'}
          </Button>
          <Typography variant="h4" component="h1">
            {t('changePassword')}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 4 }}>
            {success}
          </Alert>
        )}
        
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          {userData && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {t('userInfo')}
              </Typography>
              <Typography variant="body1">
                <strong>{t('userName')}:</strong> {userData.name}
              </Typography>
              <Typography variant="body1">
                <strong>{t('userEmail')}:</strong> {userData.email}
              </Typography>
            </Box>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('newPassword')}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('confirmPassword')}
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                  error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
                  helperText={
                    formData.confirmPassword !== '' && 
                    formData.password !== formData.confirmPassword ? 
                    t('passwordsDoNotMatch') : ''
                  }
                />
              </Grid>
              
              <Grid xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit"
                    startIcon={<KeyIcon />}
                    disabled={submitting}
                    sx={{ minWidth: 150 }}
                  >
                    {submitting ? <CircularProgress size={24} /> : t('changePassword')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
      
      <Footer />
    </Box>
  );
}
