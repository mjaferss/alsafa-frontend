'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip
} from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Cancel, Edit, Delete, ArrowBack, Visibility, Build } from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// تعريف نوع الشقة
interface Apartment {
  _id: string;
  number: string;
  code: string;
  type: string;
  totalAmount: number;
  isActive: boolean;
  department: {
    _id: string;
    name: string;
    code: string;
  };
  building: {
    _id: string;
    name: string;
    code: string;
  };
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
  };
  updatedAt: string | null;
  updatedBy: {
    _id: string;
    name: string;
  } | null;
}

const ViewApartmentPage = ({ params }: { params: { id: string } }) => {
  const { translate, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  
  // حالة البيانات
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // حالة الحذف
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // حالة التفعيل/التعطيل
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);

  // ترجمة نوع الشقة
  const getApartmentTypeTranslation = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'rent': translate('apartmentTypeRent'),
      'sold': translate('apartmentTypeSold'),
      'empty': translate('apartmentTypeEmpty'),
      'public': translate('apartmentTypePublic'),
      'preparation': translate('apartmentTypePreparation'),
      'other': translate('apartmentTypeOther')
    };
    return typeMap[type] || type;
  };

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

  // جلب بيانات الشقة
  const fetchApartment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // التحقق من أننا في جانب العميل
      if (typeof window === 'undefined') {
        console.log('[VIEW] Running on server side, cannot fetch data');
        return;
      }
      
      // الحصول على التوكن من localStorage
      const token = localStorage.getItem('token');
      
      console.log('[VIEW] Fetching apartment data with ID:', params.id);
      console.log('[VIEW] Using token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        console.error('[VIEW] No authentication token found');
        setError(translate('pleaseLogin'));
        toast.error(translate('pleaseLogin'));
        
        // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }
      
      // استخدام رابط API ثابت للاختبار
      const apiUrl = `http://localhost:5000/api/apartments/${params.id}`;
      console.log('[VIEW] API URL:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('[VIEW] Apartment data response:', response.data);
      
      if (response.data.success) {
        setApartment(response.data.data);
      } else {
        console.error('[VIEW] API returned error:', response.data.error);
        setError(response.data.error || translate('apartmentNotFound'));
        toast.error(translate('errorFetchingApartment'));
      }
    } catch (error: any) {
      console.error('[VIEW] Error fetching apartment:', error);
      
      // التحقق من نوع الخطأ
      if (error.response?.status === 401) {
        console.error('[VIEW] Authentication error (401)');
        setError(translate('pleaseLogin'));
        toast.error(translate('pleaseLogin'));
        
        // إزالة التوكن الغير صالح
        localStorage.removeItem('token');
        
        // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setError(translate('apartmentNotFound'));
        toast.error(translate('errorFetchingApartment'));
      }
    } finally {
      setLoading(false);
    }
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    // التحقق من أننا في جانب العميل
    if (typeof window !== 'undefined' && params.id) {
      console.log('[VIEW] Page loaded, checking authentication...');
      
      // التحقق من وجود التوكن قبل جلب البيانات
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('[VIEW] Token exists:', !!token);
      console.log('[VIEW] User data exists:', !!savedUser);
      
      if (!token) {
        console.error('[VIEW] No authentication token found on page load');
        setError(translate('pleaseLogin'));
        toast.error(translate('pleaseLogin'));
        
        // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }
      
      // جلب بيانات الشقة
      fetchApartment();
    }
  }, [params.id, router, translate]);

  // حذف الشقة
  const handleDeleteApartment = async () => {
    try {
      setLoading(true);
      let token = '';
      // التحقق من أننا في جانب العميل
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || '';
      }
      
      // استخدام رابط API ثابت للاختبار
      const apiUrl = `http://localhost:5000/api/apartments/${params.id}`;
      
      const response = await axios.delete(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success(translate('apartmentDeletedSuccess'));
        router.push('/dashboard/apartments');
      }
    } catch (error) {
      console.error('Error deleting apartment:', error);
      toast.error(translate('errorDeletingApartment'));
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  // تفعيل/تعطيل الشقة
  const handleToggleApartmentActive = async () => {
    if (!apartment) return;
    
    try {
      setLoading(true);
      
      // التحقق من أننا في جانب العميل
      if (typeof window === 'undefined') {
        console.error('[TOGGLE] Cannot toggle on server side');
        return;
      }
      
      // الحصول على التوكن
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('[TOGGLE] No authentication token found');
        toast.error(translate('pleaseLogin'));
        
        // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        return;
      }
      
      console.log(`[TOGGLE] Toggling apartment ${params.id}, current status: ${apartment.isActive}`);
      
      // المسار الصحيح لتفعيل/تعطيل الشقة بناءً على ملف apartmentController.js
      const apiUrl = `http://localhost:5000/api/apartments/${params.id}/toggle-active`;
      console.log(`[TOGGLE] Using API URL: ${apiUrl}`);
      
      // استخدام طريقة PUT كما هو محدد في ملف apartmentController.js
      const response = await axios.put(
        apiUrl,
        {},  // لا نحتاج لإرسال بيانات لأن التبديل يتم في الخلفية
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('[TOGGLE] Response:', response.data);
      
      if (response.data.success) {
        const newStatus = !apartment.isActive;
        toast.success(
          apartment.isActive
            ? translate('apartmentDeactivatedSuccessfully')
            : translate('apartmentActivatedSuccessfully')
        );
        
        // تحديث حالة الشقة محلياً
        setApartment({
          ...apartment,
          isActive: newStatus
        });
        
        // إعادة تحميل بيانات الشقة
        setTimeout(() => {
          fetchApartment();
        }, 1000);
      } else {
        console.error('[TOGGLE] API error:', response.data.error || 'Unknown error');
        toast.error(response.data.error || translate('errorTogglingApartmentStatus'));
      }
    } catch (error: any) {
      console.error('[TOGGLE] Error:', error);
      
      // التحقق من نوع الخطأ
      if (error.response?.status === 401) {
        console.error('[TOGGLE] Authentication error (401)');
        toast.error(translate('pleaseLogin'));
        
        // إزالة التوكن الغير صالح
        localStorage.removeItem('token');
        
        // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        toast.error(translate('errorTogglingApartmentStatus'));
      }
    } finally {
      setLoading(false);
      setToggleDialogOpen(false);
    }
  };
  
  // التحقق من صلاحيات المستخدم
  if (user && user.role !== 'مدير' && user.role !== 'مشرف' && user.role !== 'مستخدم') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
        <Header />
        <Container sx={{ mt: 12, mb: 8, flexGrow: 1 }}>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error">
              {translate('accessDenied')}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/dashboard/apartments')}
              sx={{ mt: 2 }}
            >
              {translate('backToApartments')}
            </Button>
          </Box>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
        <Header />
        <Container sx={{ mt: 12, mb: 8, flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
        <PageHeader
          title={translate('apartmentDetails')}
          buttonText={translate('backToApartments')}
          buttonIcon={<ArrowBack />}
          onButtonClick={() => router.push('/dashboard/apartments')}
        />

        {error ? (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error">
              {error}
            </Typography>
          </Box>
        ) : apartment ? (
          <>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {user && (user.role === 'مدير' || user.role === 'مشرف') && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Edit />}
                    onClick={() => router.push(`/dashboard/apartments/edit/${params.id}`)}
                  >
                    {translate('edit')}
                  </Button>
                  
                  <IconButton
                    aria-label={apartment.isActive ? translate('deactivate') : translate('activate')}
                    color={apartment.isActive ? "error" : "success"}
                    onClick={() => {
                      console.log('[DEBUG] Toggle icon button clicked for apartment:', apartment._id);
                      setToggleDialogOpen(true);
                    }}
                  >
                    {apartment.isActive ? <Cancel /> : <CheckCircle />}
                  </IconButton>

                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Build />}
                    onClick={() => router.push(`/dashboard/apartments/maintenance-request/${params.id}`)}
                  >
                    {translate('createMaintenanceRequest') || 'إنشاء طلب صيانة'}
                  </Button>
                </>
              )}
              
              {user && user.role === 'مدير' && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  {translate('delete')}
                </Button>
              )}
            </Box>
          <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                {translate('apartmentNumber')}: {apartment.number}
              </Typography>
              
              <Box>
                {apartment.isActive ? (
                  <Chip
                    label={translate('active')}
                    color="success"
                    size="small"
                    icon={<CheckCircle fontSize="small" />}
                    sx={{ mr: 1 }}
                  />
                ) : (
                  <Chip
                    label={translate('inactive')}
                    color="error"
                    size="small"
                    icon={<Cancel fontSize="small" />}
                    sx={{ mr: 1 }}
                  />
                )}
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {translate('basicInformation')}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('apartmentCode')}
                        </Typography>
                        <Typography variant="body1">{apartment.code}</Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('apartmentType')}
                        </Typography>
                        <Typography variant="body1">
                          {getApartmentTypeTranslation(apartment.type)}
                        </Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('buildingName')}
                        </Typography>
                        <Typography variant="body1">{apartment.building.name}</Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('departmentName')}
                        </Typography>
                        <Typography variant="body1">{apartment.department.name}</Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('totalAmount')}
                        </Typography>
                        <Typography variant="body1">
                          {apartment.totalAmount.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {translate('metaInformation')}
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('createdBy')}
                        </Typography>
                        <Typography variant="body1">{apartment.createdBy.name}</Typography>
                      </Grid>
                      
                      <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('createdAt')}
                        </Typography>
                        <Typography variant="body1">{formatDate(apartment.createdAt)}</Typography>
                      </Grid>
                      
                      {apartment.updatedAt && (
                        <>
                          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                            <Typography variant="subtitle2" color="textSecondary">
                              {translate('updatedBy')}
                            </Typography>
                            <Typography variant="body1">
                              {apartment.updatedBy ? apartment.updatedBy.name : '-'}
                            </Typography>
                          </Grid>
                          
                          <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                            <Typography variant="subtitle2" color="textSecondary">
                              {translate('updatedAt')}
                            </Typography>
                            <Typography variant="body1">{formatDate(apartment.updatedAt)}</Typography>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
          </>
        ) : null}
        
        {/* مربع حوار حذف الشقة */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>{translate('confirmDelete')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {translate('confirmDeleteApartmentMessage')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              {translate('cancel')}
            </Button>
            <Button onClick={handleDeleteApartment} color="error" autoFocus>
              {translate('delete')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* مربع حوار تفعيل/تعطيل الشقة */}
        <Dialog
          open={toggleDialogOpen}
          onClose={() => setToggleDialogOpen(false)}
        >
          <DialogTitle>
            {apartment?.isActive
              ? translate('deactivateApartment')
              : translate('activateApartment')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {apartment?.isActive
                ? translate('confirmDeactivateApartmentMessage')
                : translate('confirmActivateApartmentMessage')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setToggleDialogOpen(false)} color="primary">
              {translate('cancel')}
            </Button>
            <Button
              onClick={handleToggleApartmentActive}
              color={apartment?.isActive ? "error" : "success"}
              autoFocus
            >
              {apartment?.isActive
                ? translate('deactivate')
                : translate('activate')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      <Footer />
    </Box>
  );
};

export default ViewApartmentPage;
