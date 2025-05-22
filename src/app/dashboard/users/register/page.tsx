'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Container from '@mui/material/Container';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  phoneNumber: string;
  isActive: boolean;
}

export default function RegisterUser() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'مستخدم',
    phoneNumber: '',
    isActive: true
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // استخدام useState للتحكم في عرض المحتوى بعد التحميل على العميل
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // التأكد من أننا في جانب العميل
    setMounted(true);
    
    const checkAuth = async () => {
      try {
        // التأكد من أننا في جانب العميل قبل استخدام localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          router.push('/login');
          return;
        }
        
        // استخدام عنوان API الصحيح
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          router.push('/login');
          return;
        }
        
        const userData = await response.json();
        setUser(userData.data);
        
        // التحقق من أن المستخدم لديه دور مدير
        if (userData.data.role !== 'مدير') {
          setError(t('accessDenied'));
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      }
    };
    
    if (mounted) {
      checkAuth();
    }
  }, [router, t, mounted]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value
    });
  };
  
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      isActive: e.target.checked
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phoneNumber: formData.phoneNumber,
          isActive: formData.isActive
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || t('registrationError'));
      }
      
      setSuccess(true);
      setError(''); // إزالة أي رسائل خطأ سابقة
      
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'مستخدم',
        phoneNumber: '',
        isActive: true
      });
      
      // عرض رسالة نجاح وإعادة التوجيه بعد فترة
      setTimeout(() => {
        router.push('/dashboard/users');
      }, 2000);
      
    } catch (error: any) {
      setError(error.message || t('registrationError'));
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSuccess(false);
  };
  
  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Container>
        <Footer />
      </Box>
    );
  }
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/dashboard/users')}
              sx={{ mr: 4 }} 
            >
              {t('cancel')}
            </Button>
            <Typography variant="h4" component="h1">
              {t('registerNewUser')}
            </Typography>
          </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Snackbar 
          open={success} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {t('userRegisteredSuccessfully')}
          </Alert>
        </Snackbar>
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label={t('name')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label={t('email')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                />
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label={t('password')}
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                  helperText={t('passwordMinLength')}
                />
              </Box>
              
              <Box sx={{ flex: '1 1 300px' }}>
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
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <TextField
                  fullWidth
                  label={t('phoneNumber')}
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  margin="normal"
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ flex: '1 1 300px' }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="role-label">{t('role')}</InputLabel>
                  <Select
                    labelId="role-label"
                    name="role"
                    value={formData.role}
                    onChange={handleChange as any}
                    label={t('role')}
                  >
                    <MenuItem value="مدير">مدير</MenuItem>
                    <MenuItem value="مشرف">مشرف</MenuItem>
                    <MenuItem value="مستخدم">مستخدم</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={formData.isActive} 
                    onChange={handleSwitchChange} 
                    name="isActive" 
                    color="primary"
                  />
                }
                label={t('activeAccount')}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                type="submit"
                startIcon={<PersonAddIcon />}
                disabled={submitting}
                sx={{ minWidth: 150 }}
              >
                {submitting ? <CircularProgress size={24} /> : t('registerUser')}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
      </Container>
      <Footer />
    </Box>
  );
}
