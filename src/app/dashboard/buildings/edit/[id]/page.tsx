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
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// نوع بيانات المبنى
interface Building {
  _id: string;
  name: string;
  code: string;
  lastRecordedCost: number;
  maintenanceCost: number;
  isActive: boolean;
}

// صفحة تعديل المبنى
const EditBuildingPage = ({ params }: { params: Promise<{ id: string }> }) => {
  // استخدام سياق اللغة
  const { t, language, isRTL } = useLanguage();
  
  // استخدام توجيه Next.js والحصول على معرف المبنى من المسار
  const router = useRouter();
  const resolvedParams = React.use(params);
  const buildingId = resolvedParams.id;
  
  // حالة النموذج
  const [formData, setFormData] = useState<Building>({
    _id: '',
    name: '',
    code: '',
    lastRecordedCost: 0,
    maintenanceCost: 0,
    isActive: true
  });
  
  // حالة الأخطاء
  const [errors, setErrors] = useState({
    name: '',
    code: ''
  });
  
  // حالة التحميل والمصادقة
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // حالة الإشعارات
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // حالة حوار التأكيد
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [originalCode, setOriginalCode] = useState('');
  
  // التحقق من تحميل المكون
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // التحقق من المستخدم وصلاحياته وجلب بيانات المبنى
  useEffect(() => {
    if (!mounted) return;
    
    const fetchData = async () => {
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
        
        // جلب بيانات المبنى
        const buildingResponse = await axios.get(`http://localhost:5000/api/buildings/${buildingId}`, config);
        const buildingData = buildingResponse.data.data;
        
        // تحديث حالة النموذج
        setFormData({
          _id: buildingData._id,
          name: buildingData.name,
          code: buildingData.code,
          lastRecordedCost: buildingData.lastRecordedCost,
          maintenanceCost: buildingData.maintenanceCost,
          isActive: buildingData.isActive
        });
        
        // حفظ الرمز الأصلي للمبنى للمقارنة لاحقًا
        setOriginalCode(buildingData.code);
      } catch (error) {
        console.error('Error fetching building:', error);
        
        // إظهار رسالة الخطأ
        setSnackbarMessage(t('errorFetchingBuilding'));
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        
        // توجيه المستخدم إلى صفحة المباني بعد فترة قصيرة
        setTimeout(() => {
          router.push('/dashboard/buildings');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };
    
    if (mounted && buildingId) {
      fetchData();
    }
  }, [mounted, buildingId, router, t]);
  
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
    
    // إذا تم تغيير الرمز، نتحقق مما إذا كان مختلفًا عن الرمز الأصلي
    if (name === 'code' && value !== originalCode) {
      setConfirmDialogOpen(true);
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
      setIsSubmitting(true);
      
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
      
      // إرسال بيانات المبنى المحدثة إلى الخادم
      await axios.put(`http://localhost:5000/api/buildings/${buildingId}`, formData, config);
      
      // إظهار رسالة نجاح
      setSnackbarMessage(t('buildingUpdatedSuccessfully'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // الانتظار لمدة ثانيتين ثم التوجيه إلى صفحة عرض المبنى
      setTimeout(() => {
        router.push(`/dashboard/buildings/view/${buildingId}`);
      }, 2000);
    } catch (error: any) {
      console.error('Error updating building:', error);
      
      // إظهار رسالة الخطأ
      setSnackbarMessage(
        error.response?.data?.error || t('errorUpdatingBuilding')
      );
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // إغلاق الإشعار
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // إغلاق حوار التأكيد
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };
  
  // تأكيد تغيير الرمز
  const handleConfirmCodeChange = () => {
    setConfirmDialogOpen(false);
  };
  
  // عرض مؤشر التحميل إذا كان المكون غير محمل أو البيانات قيد التحميل
  if (!mounted || loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
        <Header />
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
        <Footer />
      </Box>
    );
  }
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('editBuilding')}
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push(`/dashboard/buildings/view/${buildingId}`)}
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
                disabled={isSubmitting}
                startIcon={<SaveIcon />}
                sx={{ minWidth: 150 }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : t('saveChanges')}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
      
      <Footer />
      
      {/* حوار تأكيد تغيير الرمز */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogTitle id="alert-dialog-title">
          {t('confirmCodeChange')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('codeChangeWarning')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="primary">
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirmCodeChange} color="primary" autoFocus>
            {t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default EditBuildingPage;
