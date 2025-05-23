'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Chip,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// صفحة عرض تفاصيل القسم
const ViewDepartmentPage = ({ params }: { params: Promise<{ id: string }> }) => {
  // تخزين معرف القسم من المعلمات
  const resolvedParams = React.use(params);
  const [departmentId, setDepartmentId] = useState<string>(resolvedParams.id);
  
  // استخدام سياق اللغة
  const { t, language, isRTL } = useLanguage();
  
  // استخدام توجيه Next.js
  const router = useRouter();
  
  // حالة القسم
  const [department, setDepartment] = useState<any>(null);
  
  // حالة التحميل والمصادقة
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // حالة الإشعارات
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
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
      
      setDepartment(response.data.data);
    } catch (error) {
      console.error('Error fetching department:', error);
      setSnackbarMessage(t('errorFetchingDepartment'));
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
  
  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };
  
  // عرض مؤشر التحميل إذا كان المكون غير محمل
  if (!mounted || !departmentId) {
    return null;
  }
  
  // عرض مؤشر التحميل أثناء التحقق من المستخدم أو جلب البيانات
  if (loading) {
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {t('viewDepartment')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* زر العودة */}
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/dashboard/departments')}
            >
              {t('backButton')}
            </Button>
            
            {/* زر التعديل - يظهر فقط للمدير والمشرف */}
            {(isAdmin || isSupervisor) && department && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => router.push(`/dashboard/departments/edit/${departmentId}`)}
              >
                {t('edit')}
              </Button>
            )}
          </Box>
        </Box>
        
        {department ? (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoIcon color="primary" />
                  {t('departmentDetails')}
                </Typography>
                <Divider />
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {/* اسم القسم */}
                <Box sx={{ flex: '1 1 300px', mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('name')}:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {department.name}
                  </Typography>
                </Box>
                
                {/* رمز القسم */}
                <Box sx={{ flex: '1 1 300px', mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('code')}:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {department.code}
                  </Typography>
                </Box>
                
                {/* حالة القسم */}
                <Box sx={{ flex: '1 1 300px', mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('status')}:
                  </Typography>
                  <Chip
                    label={department.isActive ? t('active') : t('inactive')}
                    color={department.isActive ? 'success' : 'error'}
                    sx={{ mt: 1 }}
                  />
                </Box>
                
                {/* تاريخ الإنشاء */}
                <Box sx={{ flex: '1 1 300px', mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('createdAt')}:
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(department.createdAt)}
                  </Typography>
                </Box>
                
                {/* المستخدم الذي أنشأ القسم */}
                <Box sx={{ flex: '1 1 300px', mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('createdBy')}:
                  </Typography>
                  <Typography variant="body1">
                    {department.createdBy ? department.createdBy.name : t('notAvailableData')}
                  </Typography>
                </Box>
                
                {/* تاريخ التعديل */}
                <Box sx={{ flex: '1 1 300px', mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('updatedAtTime')}:
                  </Typography>
                  <Typography variant="body1">
                    {department.updatedAt && department.updatedAt !== department.createdAt
                      ? formatDate(department.updatedAt)
                      : t('notAvailableData')}
                  </Typography>
                </Box>
                
                {/* المستخدم الذي عدل القسم */}
                <Box sx={{ flex: '1 1 300px', mb: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {t('updatedByUser')}:
                  </Typography>
                  <Typography variant="body1">
                    {department.updatedBy ? department.updatedBy.name : t('notAvailableData')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="error">
              {t('departmentNotFound')}
            </Typography>
          </Paper>
        )}
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

export default ViewDepartmentPage;
