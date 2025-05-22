'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  FormHelperText
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// صفحة إضافة قسم جديد
const AddDepartmentPage = () => {
  // استخدام سياق اللغة
  const { t, isRTL } = useLanguage();
  
  // استخدام توجيه Next.js
  const router = useRouter();
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    name: '',
    code: ''
  });
  
  // حالة الأخطاء
  const [errors, setErrors] = useState({
    name: '',
    code: ''
  });
  
  // حالة التحميل والمصادقة
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // حالة الإشعارات
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // التحقق من المستخدم
  useEffect(() => {
    setMounted(true);
    
    const checkUser = async () => {
      try {
        // التحقق من وجود توكن في localStorage - فقط على جانب العميل
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        
        if (!token) {
          router.push('/login');
          return;
        }
        
        // إعداد رأس الطلب
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // الحصول على بيانات المستخدم
        const userResponse = await axios.get('http://localhost:5000/api/users/me', config);
        
        // التحقق من دور المستخدم
        const userRole = userResponse.data.data.role;
        setIsAdmin(userRole === 'admin' || userRole === 'مدير');
        setIsSupervisor(userRole === 'supervisor' || userRole === 'مشرف');
        
        // إذا لم يكن المستخدم مديرًا أو مشرفًا، توجيهه إلى لوحة التحكم
        if (userRole !== 'admin' && userRole !== 'supervisor' && userRole !== 'مدير' && userRole !== 'مشرف') {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking user:', error);
        router.push('/login');
      }
    };
    
    if (mounted) {
      checkUser();
    }
  }, [mounted, router]);
  
  // التعامل مع تغيير قيم النموذج
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // إعادة تعيين الخطأ عند تغيير القيمة
    setErrors({
      ...errors,
      [name]: ''
    });
  };
  
  // التحقق من صحة النموذج
  const validateForm = () => {
    const newErrors = {
      name: '',
      code: ''
    };
    let isValid = true;
    
    if (!formData.name.trim()) {
      newErrors.name = t('requiredField');
      isValid = false;
    }
    
    if (!formData.code.trim()) {
      newErrors.code = t('requiredField');
      isValid = false;
    } else if (!/^[A-Za-z0-9_-]+$/.test(formData.code)) {
      newErrors.code = t('invalidCode');
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        setSnackbarMessage(t('pleaseLogin'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        router.push('/login');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.post('http://localhost:5000/api/departments', formData, config);
      
      // عرض رسالة نجاح
      setSnackbarMessage(t('departmentAddedSuccessfully'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        code: ''
      });
      
      // الانتظار قليلاً ثم العودة إلى صفحة الأقسام
      setTimeout(() => {
        router.push('/dashboard/departments');
      }, 2000);
    } catch (error: any) {
      console.error('Error adding department:', error);
      
      // عرض رسالة الخطأ
      let errorMessage = t('errorAddingDepartment');
      
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      
      setSnackbarMessage(errorMessage);
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
  
  // إذا لم يكن المستخدم مديرًا أو مشرفًا، فلا تعرض الصفحة واعرض رسالة تحميل فقط
  if (!mounted || (!isAdmin && !isSupervisor)) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // Solo renderizar el contenido completo cuando el componente está montado en el cliente
  if (!mounted) {
    return null; // O un indicador de carga
  }
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('addDepartment')}
        </Typography>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label={t('name')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={loading}
                  required
                />
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <FormControl fullWidth error={!!errors.code}>
                  <TextField
                    fullWidth
                    label={t('code')}
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    error={!!errors.code}
                    helperText={errors.code}
                    disabled={loading}
                    required
                    inputProps={{
                      maxLength: 20
                    }}
                  />
                  <FormHelperText>
                    {t('codeHelperText')}
                  </FormHelperText>
                </FormControl>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {t('save')}
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => router.push('/dashboard/departments')}
                disabled={loading}
              >
                {t('cancel')}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      <Footer />
      
      {/* إشعار */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddDepartmentPage;
