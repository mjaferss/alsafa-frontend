'use client';

import React, { useState, useEffect, Component } from 'react';
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

// مكون ErrorBoundary للتعامل مع الأخطاء
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقاً.</Alert>
        </Box>
      );
    }
    return this.props.children;
  }
}

// المكون الرئيسي لتعديل القسم
const EditDepartmentContent = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = React.use(params);
  // تخزين معرف القسم من المعلمات
  const [departmentId] = useState<string>(resolvedParams.id);
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
  const [departmentLoaded, setDepartmentLoaded] = useState(false);
  
  // حالة الإشعارات
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // تحديث حالة النموذج عند تغيير القيم
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // إعادة تعيين رسالة الخطأ عند تغيير القيمة
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // التحقق من تحميل المكون وتعيين معرف القسم
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // التحقق من المستخدم وصلاحياته وجلب بيانات القسم
  useEffect(() => {
    if (!mounted || !departmentId) return;
    
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
        setIsAdmin(userRole === 'admin' || userRole === 'مدير');
        setIsSupervisor(userRole === 'supervisor' || userRole === 'مشرف');
        
        // إذا لم يكن المستخدم مديرًا أو مشرفًا، توجيهه إلى لوحة التحكم
        if (userRole !== 'admin' && userRole !== 'supervisor' && userRole !== 'مدير' && userRole !== 'مشرف') {
          router.push('/dashboard');
          return;
        }
        
        // جلب بيانات القسم
        await fetchDepartment(config);
      } catch (error) {
        console.error('Error checking user:', error);
        
        // إذا كان هناك خطأ في المصادقة، توجيه المستخدم إلى صفحة تسجيل الدخول
        router.push('/login');
      }
    };
    
    checkUser();
  }, [mounted, router, departmentId]);
  
  // جلب بيانات القسم من الخادم
  const fetchDepartment = async (config: any) => {
    try {
      setLoading(true);
      
      if (!departmentId) {
        throw new Error('Department ID is missing');
      }
      
      const response = await axios.get(
        `http://localhost:5000/api/departments/${departmentId}`,
        config
      );
      
      const departmentData = response.data.data;
      
      setFormData({
        name: departmentData.name,
        code: departmentData.code
      });
      
      setDepartmentLoaded(true);
    } catch (error) {
      console.error('Error fetching department:', error);
      setSnackbarMessage(t('errorFetchingDepartment'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  // التحقق من صحة النموذج
  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    if (!formData.name.trim()) {
      newErrors.name = t('departmentNameRequired');
      isValid = false;
    }
    
    if (!formData.code.trim()) {
      newErrors.code = t('departmentCodeRequired');
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
      
      if (!departmentId) {
        throw new Error('Department ID is missing');
      }
      
      await axios.put(
        `http://localhost:5000/api/departments/${departmentId}`,
        formData,
        config
      );
      
      // عرض رسالة نجاح
      setSnackbarMessage(t('departmentUpdatedSuccessfully'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // الانتظار قليلاً ثم العودة إلى صفحة الأقسام
      setTimeout(() => {
        router.push('/dashboard/departments');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating department:', error);
      
      // التحقق من نوع الخطأ
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbarMessage(error.response.data.error);
      } else {
        setSnackbarMessage(t('errorUpdatingDepartment'));
      }
      
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
  if (!mounted || !departmentId) {
    return null;
  }
  
  // عرض مؤشر التحميل أثناء التحقق من المستخدم أو جلب البيانات
  if (loading && !departmentLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('editDepartment')}
        </Typography>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* اسم القسم ورمزه */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth error={!!errors.name}>
                    <TextField
                      name="name"
                      label={t('departmentName')}
                      value={formData.name}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      required
                      error={!!errors.name}
                    />
                    {errors.name && (
                      <FormHelperText>{errors.name}</FormHelperText>
                    )}
                  </FormControl>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <FormControl fullWidth error={!!errors.code}>
                    <TextField
                      name="code"
                      label={t('departmentCode')}
                      value={formData.code}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      required
                      error={!!errors.code}
                    />
                    {errors.code && (
                      <FormHelperText>{errors.code}</FormHelperText>
                    )}
                  </FormControl>
                </Box>
              </Box>
              
              {/* أزرار الحفظ والعودة */}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    t('saveDepartment')
                  )}
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => router.push('/dashboard/departments')}
                >
                  {t('cancel')}
                </Button>
              </Box>
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

// تصدير المكون الرئيسي مع ErrorBoundary
export default function EditDepartmentPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ErrorBoundary>
      <EditDepartmentContent params={params} />
    </ErrorBoundary>
  );
}
