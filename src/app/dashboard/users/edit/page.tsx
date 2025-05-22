'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserFormData {
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}

export default function EditUserPage() {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    role: '',
    isActive: true
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
            // جلب بيانات المستخدم المطلوب تعديله
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

    // جلب بيانات المستخدم المطلوب تعديله
    const fetchUserDetails = async (config: any) => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/users/${userId}`, config);
        
        if (response.data.success) {
          const userData = response.data.data;
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            role: userData.role || '',
            isActive: userData.isActive
          });
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // معالجة تغيير حالة النشاط
  const handleActiveChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value === 'true'
      });
    }
  };

  // معالجة تقديم النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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
      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}`,
        formData,
        config
      );

      if (response.data.success) {
        setSuccess(t('userUpdatedSuccess'));
        // العودة إلى صفحة المستخدمين بعد 2 ثانية
        setTimeout(() => {
          router.push('/dashboard/users');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.error || 'Failed to update user');
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
            {t('editUser')}
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
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('userName')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('userEmail')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('userPhoneNumber')}
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel id="role-label">{t('userRoleLabel')}</InputLabel>
                  <Select
                    labelId="role-label"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label={t('userRoleLabel')}
                    required
                  >
                    <MenuItem value="مدير">مدير</MenuItem>
                    <MenuItem value="مشرف">مشرف</MenuItem>
                    <MenuItem value="مستخدم">مستخدم</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" variant="outlined">
                  <InputLabel id="active-label">{t('userStatus')}</InputLabel>
                  <Select
                    labelId="active-label"
                    name="isActive"
                    value={formData.isActive.toString()}
                    onChange={handleActiveChange}
                    label={t('userStatus')}
                    required
                  >
                    <MenuItem value="true">{t('activeStatus')}</MenuItem>
                    <MenuItem value="false">{t('inactiveStatus')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit"
                    startIcon={<SaveIcon />}
                    disabled={submitting}
                    sx={{ minWidth: 150 }}
                  >
                    {submitting ? <CircularProgress size={24} /> : t('save')}
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
