'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
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
  createdAt: string;
  updatedAt: string | null;
  createdBy: {
    _id: string;
    name: string;
  };
  updatedBy: {
    _id: string;
    name: string;
  } | null;
}

// صفحة عرض تفاصيل المبنى
const ViewBuildingPage = ({ params }: { params: Promise<{ id: string }> }) => {
  // استخدام سياق اللغة
  const { t, language, isRTL } = useLanguage();
  
  // استخدام توجيه Next.js والحصول على معرف المبنى من المسار
  const router = useRouter();
  const resolvedParams = React.use(params);
  const buildingId = resolvedParams.id;
  
  // حالة المبنى
  const [building, setBuilding] = useState<Building | null>(null);
  
  // حالة التحميل والمصادقة
  const [loading, setLoading] = useState(true);
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
        setIsAdmin(userRole === 'مدير');
        
        // جلب بيانات المبنى
        const buildingResponse = await axios.get(`http://localhost:5000/api/buildings/${buildingId}`, config);
        setBuilding(buildingResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        
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
  
  // تنسيق التاريخ
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // تنسيق المبلغ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };
  
  // إغلاق الإشعار
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // الانتقال إلى صفحة تعديل المبنى
  const handleEdit = () => {
    router.push(`/dashboard/buildings/edit/${buildingId}`);
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
  
  // عرض رسالة خطأ إذا لم يتم العثور على المبنى
  if (!building) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
        <Header />
        <Box sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>
              {t('buildingNotFound')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/dashboard/buildings')}
              sx={{ mt: 2 }}
            >
              {t('backToBuildings')}
            </Button>
          </Paper>
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
            {t('viewBuilding')}
          </Typography>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/dashboard/buildings')}
              sx={{ mr: 1 }}
            >
              {t('backButton')}
            </Button>
            
            {isAdmin && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                {t('editBuilding')}
              </Button>
            )}
          </Box>
        </Box>
        
        <Paper sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
          {/* معلومات المبنى الأساسية */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('buildingName')}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {building.name}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('buildingCode')}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {building.code}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('lastRecordedCost')}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {formatCurrency(building.lastRecordedCost)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('maintenanceCost')}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {formatCurrency(building.maintenanceCost)}
                </Typography>
              </Box>
              
              <Box sx={{ gridColumn: { xs: '1', md: '1 / span 2' } }}>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('status')}
                </Typography>
                <Chip
                  label={building.isActive ? t('active') : t('inactive')}
                  color={building.isActive ? 'success' : 'error'}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {/* معلومات الإنشاء والتحديث */}
          <Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('createdBy')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {building.createdBy?.name || '-'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('createdAt')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(building.createdAt)}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('updatedBy')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {building.updatedBy?.name || '-'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  {t('updatedAt')}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(building.updatedAt)}
                </Typography>
              </Box>
            </Box>
          </Box>
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

export default ViewBuildingPage;
