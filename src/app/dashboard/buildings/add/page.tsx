'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  FormHelperText,
  InputAdornment
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// صفحة إضافة مبنى جديد
const AddBuildingPage = () => {
  // استخدام سياق اللغة
  const { t, language, isRTL } = useLanguage();
  
  // استخدام توجيه Next.js
  const router = useRouter();
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    lastRecordedCost: 0,
    maintenanceCost: 0
  });
  
  // حالة الأخطاء
  const [errors, setErrors] = useState({
    name: '',
    code: ''
  });
  
  // حالة التحميل والمصادقة
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // حالة الإشعارات
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // التحقق من تحميل المكون
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // التحقق من المستخدم وصلاحياته
  useEffect(() => {
    if (!mounted) return;
    
    const checkUser = async () => {
      try {
        // التحقق من وجود توكن في localStorage - فقط على جانب العميل
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        if (!token) {
          router.push('/login');
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // الحصول على معلومات المستخدم
        const userResponse = await axios.get('http://localhost:5000/api/users/me', config);
        
        // التحقق من دور المستخدم
        const userRole = userResponse.data.data.role;
        
        // التحقق من أن المستخدم هو مدير
        if (userRole !== 'مدير') {
          router.push('/dashboard');
          return;
        }
        
        setIsAdmin(userRole === 'مدير');
      } catch (error) {
        console.error('Error checking user:', error);
        
        // إذا كان هناك خطأ في المصادقة، توجيه المستخدم إلى صفحة تسجيل الدخول
        router.push('/login');
      }
    };
    
    if (mounted) {
      checkUser();
    }
  }, [mounted, router]);
  
  // معالجة تغيير قيم النموذج
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'lastRecordedCost' || name === 'maintenanceCost' 
        ? parseFloat(value) || 0 
        : value
    }));
    
    // إعادة تعيين رسائل الخطأ عند تغيير القيمة
    if (errors[name as keyof typeof errors]) {
      setErrors(prevState => ({
        ...prevState,
        [name]: ''
      }));
    }
  };
  
  // التحقق من صحة النموذج
  const validateForm = () => {
    let valid = true;
    const newErrors = { name: '', code: '' };
    
    // التحقق من اسم المبنى
    if (!formData.name.trim()) {
      newErrors.name = t('requiredField');
      valid = false;
    }
    
    // التحقق من رمز المبنى
    if (!formData.code.trim()) {
      newErrors.code = t('requiredField');
      valid = false;
    } else if (!/^[a-zA-Z0-9_\-]+$/.test(formData.code)) {
      newErrors.code = t('invalidCode');
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  // معالجة إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة النموذج
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // إرسال بيانات المبنى إلى الخادم
      await axios.post('http://localhost:5000/api/buildings', formData, config);
      
      // إظهار رسالة نجاح
      setSnackbarMessage(t('buildingAddedSuccessfully'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // الانتظار لمدة ثانيتين ثم التوجيه إلى صفحة المباني
      setTimeout(() => {
        router.push('/dashboard/buildings');
      }, 2000);
    } catch (error: any) {
      console.error('Error adding building:', error);
      
      // إظهار رسالة الخطأ
      setSnackbarMessage(
        error.response?.data?.error || t('errorAddingBuilding')
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  // إغلاق الإشعار
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // عرض مؤشر التحميل إذا كان المكون غير محمل
  if (!mounted) {
    return null;
  }
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('addBuilding')}
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard/buildings')}
          >
            {t('backButton')}
          </Button>
        </Box>
        
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label={t('buildingName')}
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label={t('buildingCode')}
                name="code"
                value={formData.code}
                onChange={handleChange}
                error={!!errors.code}
                helperText={errors.code || t('codeHelperText')}
                required
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label={t('lastRecordedCost')}
                name="lastRecordedCost"
                type="number"
                value={formData.lastRecordedCost}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
                }}
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label={t('maintenanceCost')}
                name="maintenanceCost"
                type="number"
                value={formData.maintenanceCost}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">SAR</InputAdornment>,
                }}
                sx={{ mb: 3 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                {loading ? <CircularProgress size={24} /> : t('saveBuilding')}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
      
      <Footer />
      
      {/* إشعارات */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddBuildingPage;
