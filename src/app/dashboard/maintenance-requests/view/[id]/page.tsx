"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Box, Container, Typography, Paper, Grid, Divider, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Card, CardContent, Alert, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton
} from '@mui/material';
import { CheckCircle, Close, ArrowBack } from '@mui/icons-material';
import { toast } from 'react-toastify';
import moment from 'moment';
import 'moment/locale/ar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuthContextType } from '@/types/auth';

// تعريف الأنواع
interface CostItem {
  classificationType: string;
  cost: number;
  quantity: number;
  total: number;
}

interface Approval {
  isApproved: boolean;
  approvalDate?: Date;
  notes?: string;
  manager?: {
    _id: string;
    name: string;
  };
  supervisor?: {
    _id: string;
    name: string;
  };
}

interface Action {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  date: Date;
  description: string;
}

interface MaintenanceRequest {
  _id: string;
  apartment: {
    _id: string;
    number: string;
    building: string | { _id: string; name: string; code?: string };
    floor: string;
  };
  createdAt: Date;
  maintenanceType: string;
  costItems: CostItem[];
  totalCost: number;
  notes: string;
  managerApproval: Approval;
  supervisorApproval: Approval;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdBy: {
    _id: string;
    name: string;
  };
  actions: Action[];
  updatedAt: Date;
}

// صفحة عرض طلب الصيانة
export default function ViewMaintenanceRequest({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { language, translate } = useLanguage();
  const { user, token } = useAuth();

  const [maintenanceRequest, setMaintenanceRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [maintenanceTypes, setMaintenanceTypes] = useState<any[]>([]);
  const [classificationTypes, setClassificationTypes] = useState<any[]>([]);
  
  // حالة النافذة المنبثقة
  const [approvalDialogOpen, setApprovalDialogOpen] = useState<boolean>(false);
  const [approvalType, setApprovalType] = useState<'approve' | 'reject'>('approve');
  const [approvalNotes, setApprovalNotes] = useState<string>('');

  // جلب بيانات طلب الصيانة
  const fetchMaintenanceRequest = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`http://localhost:5000/api/maintenance-requests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setMaintenanceRequest(response.data.data);
      } else {
        setError(response.data.message || translate('errorFetchingData') || 'حدث خطأ أثناء جلب البيانات');
      }
    } catch (error: any) {
      console.error('Error fetching maintenance request:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        setError(error.response?.data?.message || translate('errorFetchingData') || 'حدث خطأ أثناء جلب البيانات');
      }
    } finally {
      setLoading(false);
    }
  };

  // جلب أنواع الصيانة والتصنيفات
  const fetchMaintenanceTypes = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      console.log('[VIEW MAINTENANCE] Using default maintenance types');
      // استخدام بيانات افتراضية مباشرة بدلاً من محاولة جلبها من الخادم
      const dummyTypes = [
        { value: 'electrical', ar: 'كهرباء', en: 'Electrical' },
        { value: 'mechanical', ar: 'ميكانيكا', en: 'Mechanical' },
        { value: 'plumbing', ar: 'سباكة', en: 'Plumbing' },
        { value: 'finishing', ar: 'تشطيب', en: 'Finishing' },
        { value: 'maintenance', ar: 'صيانة عامة', en: 'General Maintenance' },
        { value: 'other', ar: 'أخرى', en: 'Other' }
      ];
      setMaintenanceTypes(dummyTypes);
    } catch (error) {
      console.error('[VIEW MAINTENANCE] Error in maintenance types setup:', error);
    }
  };

  const fetchClassificationTypes = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      console.log('[VIEW MAINTENANCE] Using default classification types');
      // استخدام بيانات افتراضية مباشرة بدلاً من محاولة جلبها من الخادم
      const dummyTypes = [
        { value: 'labor', ar: 'عمالة', en: 'Labor' },
        { value: 'materials', ar: 'مواد', en: 'Materials' },
        { value: 'equipment', ar: 'معدات', en: 'Equipment' },
        { value: 'tools', ar: 'أدوات', en: 'Tools' },
        { value: 'other', ar: 'أخرى', en: 'Other' }
      ];
      setClassificationTypes(dummyTypes);
    } catch (error) {
      console.error('[VIEW MAINTENANCE] Error in classification types setup:', error);
    }
  };

  // تغيير حالة طلب الصيانة
  const updateStatus = async (newStatus: 'pending' | 'approved' | 'rejected' | 'completed') => {
    if (!token || !maintenanceRequest) return;

    try {
      const response = await axios.put(`http://localhost:5000/api/maintenance-requests/${id}/status`, {
        status: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success(translate('statusUpdatedSuccessfully') || 'تم تحديث الحالة بنجاح');
        fetchMaintenanceRequest();
      } else {
        toast.error(response.data.message || translate('errorUpdatingStatus') || 'حدث خطأ أثناء تحديث الحالة');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || translate('errorUpdatingStatus') || 'حدث خطأ أثناء تحديث الحالة');
    }
  };

  // فتح نافذة الموافقة أو الرفض
  const openApprovalDialog = (type: 'approve' | 'reject') => {
    setApprovalType(type);
    setApprovalNotes('');
    setApprovalDialogOpen(true);
  };

  // إغلاق نافذة الموافقة أو الرفض
  const closeApprovalDialog = () => {
    setApprovalDialogOpen(false);
  };

  // إرسال الموافقة أو الرفض مع التعليق
  const submitApproval = async () => {
    if (!token || !maintenanceRequest) return;
    
    const isApproved = approvalType === 'approve';
    // تحديد نوع الموافقة (مدير أو مشرف) بناءً على دور المستخدم
    const approvalRole = user?.role === 'مدير' ? 'manager' : 'supervisor';
    
    try {
      setApprovalDialogOpen(false);
      
      const response = await axios.put(`http://localhost:5000/api/maintenance-requests/${id}/approval`, {
        type: approvalRole,
        isApproved,
        notes: approvalNotes
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success(isApproved 
          ? (translate('approvedSuccessfully') || 'تمت الموافقة بنجاح')
          : (translate('rejectedSuccessfully') || 'تم الرفض بنجاح')
        );
        fetchMaintenanceRequest();
      } else {
        toast.error(response.data.message || translate('errorUpdatingApproval') || 'حدث خطأ أثناء تحديث الموافقة');
      }
    } catch (error: any) {
      console.error('Error updating approval:', error);
      toast.error(error.response?.data?.message || translate('errorUpdatingApproval') || 'حدث خطأ أثناء تحديث الموافقة');
    }
  };

  // إضافة إجراء جديد
  const addAction = async (description: string) => {
    if (!token || !maintenanceRequest) return;

    try {
      const response = await axios.post(`http://localhost:5000/api/maintenance-requests/${id}/actions`, {
        description
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success(translate('actionAddedSuccessfully') || 'تم إضافة الإجراء بنجاح');
        fetchMaintenanceRequest();
      } else {
        toast.error(response.data.message || translate('errorAddingAction') || 'حدث خطأ أثناء إضافة الإجراء');
      }
    } catch (error: any) {
      console.error('Error adding action:', error);
      toast.error(error.response?.data?.message || translate('errorAddingAction') || 'حدث خطأ أثناء إضافة الإجراء');
    }
  };

  // الحصول على اسم نوع الصيانة بناءً على القيمة
  const getMaintenanceTypeName = (value: string) => {
    const type = maintenanceTypes.find(t => t.value === value);
    return type ? type[language] : value;
  };

  // الحصول على اسم نوع التصنيف بناءً على القيمة
  const getClassificationTypeName = (value: string) => {
    const type = classificationTypes.find(t => t.value === value);
    return type ? type[language] : value;
  };

  // الحصول على اسم الحالة بناءً على القيمة
  const getStatusName = (status: string) => {
    const statusMap: Record<string, Record<string, string>> = {
      pending: { ar: 'معلق', en: 'Pending' },
      approved: { ar: 'تمت الموافقة', en: 'Approved' },
      rejected: { ar: 'مرفوض', en: 'Rejected' },
      completed: { ar: 'مكتمل', en: 'Completed' }
    };

    
    return statusMap[status] ? statusMap[status][language] : status;
  };

  // الحصول على لون الحالة بناءً على القيمة
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      completed: 'info'
    };
    
    return colorMap[status] || 'default';
  };

  // تنسيق التاريخ حسب اللغة
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    
    moment.locale(language === 'ar' ? 'ar' : 'en');
    return moment(date).format('YYYY/MM/DD - hh:mm A');
  };

  // تحميل البيانات عند تحميل الصفحة
  useEffect(() => {
    if (token) {
      fetchMaintenanceRequest();
      fetchMaintenanceTypes();
      fetchClassificationTypes();
    } else {
      router.push('/login');
    }
  }, [token, id]);

  // العودة إلى صفحة طلبات الصيانة
  const handleBack = () => {
    router.push('/dashboard/maintenance-requests');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Container component="main" sx={{ flexGrow: 1, py: 4, mt: 8 }}>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          {translate('backButton') || 'رجوع'}
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {translate('viewMaintenanceRequest') || 'عرض طلب الصيانة'}
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : maintenanceRequest ? (
          <Box>
            {/* بطاقة معلومات الطلب الأساسية */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid sx={{ gridColumn: 'span 12' }}>
                  <Typography variant="h6" gutterBottom>
                    {translate('requestDetails') || 'تفاصيل الطلب'}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {translate('requestId') || 'رقم الطلب'}
                  </Typography>
                  <Typography variant="body1">
                    {maintenanceRequest._id}
                  </Typography>
                </Grid>
                
                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {translate('status') || 'الحالة'}
                  </Typography>
                  <Chip 
                    label={getStatusName(maintenanceRequest.status)}
                    color={getStatusColor(maintenanceRequest.status) as any}
                    size="small"
                  />
                </Grid>
                
                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {translate('createdAt') || 'تاريخ الإنشاء'}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(maintenanceRequest.createdAt)}
                  </Typography>
                </Grid>
                
                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {translate('lastUpdated') || 'آخر تحديث'}
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(maintenanceRequest.updatedAt)}
                  </Typography>
                </Grid>
                
                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {translate('createdBy') || 'بواسطة'}
                  </Typography>
                  <Typography variant="body1">
                    {maintenanceRequest.createdBy?.name || translate('unknown') || 'غير معروف'}
                  </Typography>
                </Grid>
                
                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {translate('maintenanceType') || 'نوع الصيانة'}
                  </Typography>
                  <Typography variant="body1">
                    {getMaintenanceTypeName(maintenanceRequest.maintenanceType)}
                  </Typography>
                </Grid>
                
                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {translate('totalCost') || 'إجمالي التكلفة'}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {maintenanceRequest.totalCost.toFixed(2)} {translate('currency') || 'ريال'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            {/* بطاقة معلومات الشقة */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid sx={{ gridColumn: 'span 12' }}>
                  <Typography variant="h6" gutterBottom>
                    {translate('apartmentDetails') || 'تفاصيل الشقة'}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {translate('apartmentNumber') || 'رقم الشقة'}
                  </Typography>
                  <Typography variant="body1">
                    {maintenanceRequest.apartment?.number || translate('notSpecified') || 'غير محدد'}
                  </Typography>
                </Grid>
                
                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {translate('building') || 'المبنى'}
                  </Typography>
                  <Typography variant="body1">
                    {typeof maintenanceRequest.apartment?.building === 'string' 
                      ? maintenanceRequest.apartment?.building 
                      : maintenanceRequest.apartment?.building?.name || translate('notSpecified') || 'غير محدد'}
                  </Typography>
                </Grid>
                
                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 4' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {translate('floor') || 'الطابق'}
                  </Typography>
                  <Typography variant="body1">
                    {maintenanceRequest.apartment?.floor || translate('notSpecified') || 'غير محدد'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            {/* عناصر التكلفة */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {translate('costItems') || 'عناصر التكلفة'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {maintenanceRequest.costItems && maintenanceRequest.costItems.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{translate('classificationType') || 'نوع التصنيف'}</TableCell>
                        <TableCell align="right">{translate('cost') || 'التكلفة'}</TableCell>
                        <TableCell align="right">{translate('quantity') || 'الكمية'}</TableCell>
                        <TableCell align="right">{translate('total') || 'الإجمالي'}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {maintenanceRequest.costItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{getClassificationTypeName(item.classificationType)}</TableCell>
                          <TableCell align="right">{item.cost.toFixed(2)}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{item.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                          {translate('totalCost') || 'إجمالي التكلفة'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {maintenanceRequest.totalCost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {translate('noCostItems') || 'لا توجد عناصر تكلفة'}
                </Typography>
              )}
            </Paper>
            
            {/* الملاحظات */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {translate('notes') || 'الملاحظات'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1">
                {maintenanceRequest.notes || translate('noNotes') || 'لا توجد ملاحظات'}
              </Typography>
            </Paper>
            
            {/* موافقات المدير والمشرف */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* موافقة المدير */}
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    {translate('managerApproval') || 'موافقة المدير'}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {translate('status') || 'الحالة'}
                      </Typography>
                      {maintenanceRequest.managerApproval?.isApproved ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <CheckCircle color="success" sx={{ mr: 1 }} />
                          <Typography variant="body2" color="success.main" fontWeight="bold">
                            {translate('approved') || 'تمت الموافقة'}
                          </Typography>
                        </Box>
                      ) : (
                        <Chip 
                          label={translate('notApproved') || 'لم تتم الموافقة'}
                          color="default"
                          size="small"
                        />
                      )}
                    </Box>
                    
                    {maintenanceRequest.managerApproval?.manager && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {translate('approvedBy') || 'تمت الموافقة بواسطة'}
                        </Typography>
                        <Typography variant="body1">
                          {maintenanceRequest.managerApproval.manager.name || translate('unknown') || 'غير معروف'}
                        </Typography>
                      </Box>
                    )}
                    
                    {maintenanceRequest.managerApproval?.approvalDate && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {translate('approvalDate') || 'تاريخ الموافقة'}
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(maintenanceRequest.managerApproval.approvalDate)}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {translate('notes') || 'ملاحظات'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {maintenanceRequest.managerApproval?.notes || translate('noNotes') || 'لا توجد ملاحظات'}
                      </Typography>
                      
                      {/* أزرار الموافقة والرفض للمدير فقط */}
                      {!maintenanceRequest.managerApproval?.isApproved && user?.role === 'مدير' && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => openApprovalDialog('approve')}
                            sx={{ flex: 1 }}
                          >
                            {translate('approve') || 'موافقة'}
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => openApprovalDialog('reject')}
                            sx={{ 
                              flex: 1,
                              color: 'white',
                              '&:hover': { backgroundColor: 'error.dark' }
                            }}
                          >
                            {translate('reject') || 'رفض'}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
              
              {/* موافقة المشرف */}
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    {translate('supervisorApproval') || 'موافقة المشرف'}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {translate('status') || 'الحالة'}
                      </Typography>
                      <Chip 
                        label={maintenanceRequest.supervisorApproval?.isApproved 
                          ? (translate('approved') || 'تمت الموافقة') 
                          : (translate('notApproved') || 'لم تتم الموافقة')}
                        color={maintenanceRequest.supervisorApproval?.isApproved ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    {maintenanceRequest.supervisorApproval?.supervisor && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {translate('approvedBy') || 'تمت الموافقة بواسطة'}
                        </Typography>
                        <Typography variant="body1">
                          {maintenanceRequest.supervisorApproval.supervisor.name || translate('unknown') || 'غير معروف'}
                        </Typography>
                      </Box>
                    )}
                    
                    {maintenanceRequest.supervisorApproval?.approvalDate && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {translate('approvalDate') || 'تاريخ الموافقة'}
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(maintenanceRequest.supervisorApproval.approvalDate)}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        {translate('notes') || 'ملاحظات'}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {maintenanceRequest.supervisorApproval?.notes || translate('noNotes') || 'لا توجد ملاحظات'}
                      </Typography>
                      
                      {/* أزرار الموافقة والرفض - تظهر دائماً ولكن تكون معطلة إذا لم يكن المستخدم مشرفاً */}
                      {!maintenanceRequest.supervisorApproval?.isApproved && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => openApprovalDialog('approve')}
                            disabled={user?.role !== 'مشرف'}
                            sx={{ 
                              flex: 1,
                              bgcolor: user?.role === 'مشرف' ? 'success.main' : 'grey.400',
                              '&:hover': { bgcolor: user?.role === 'مشرف' ? 'success.dark' : 'grey.400' }
                            }}
                          >
                            {translate('approve') || 'موافقة'}
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => openApprovalDialog('reject')}
                            disabled={user?.role !== 'مشرف'}
                            sx={{ 
                              flex: 1,
                              bgcolor: user?.role === 'مشرف' ? 'error.main' : 'grey.400',
                              color: 'white',
                              '&:hover': { bgcolor: user?.role === 'مشرف' ? 'error.dark' : 'grey.400' }
                            }}
                          >
                            {translate('reject') || 'رفض'}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
            
            {/* الإجراءات */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {translate('actions') || 'الإجراءات'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {maintenanceRequest.actions && maintenanceRequest.actions.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{translate('date') || 'التاريخ'}</TableCell>
                        <TableCell>{translate('user') || 'المستخدم'}</TableCell>
                        <TableCell>{translate('description') || 'الوصف'}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {maintenanceRequest.actions.map((action) => (
                        <TableRow key={action._id}>
                          <TableCell>{formatDate(action.date)}</TableCell>
                          <TableCell>{action.user?.name || translate('unknown') || 'غير معروف'}</TableCell>
                          <TableCell>{action.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {translate('noActions') || 'لا توجد إجراءات'}
                </Typography>
              )}
            </Paper>
            
            {/* أزرار تغيير الحالة */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {translate('updateStatus') || 'تحديث الحالة'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  color="warning"
                  onClick={() => updateStatus('pending')}
                  disabled={maintenanceRequest.status === 'pending'}
                >
                  {translate('markAsPending') || 'تعليق'}
                </Button>
                
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={() => updateStatus('approved')}
                  disabled={maintenanceRequest.status === 'approved'}
                >
                  {translate('markAsApproved') || 'موافقة'}
                </Button>
                
                <Button 
                  variant="contained" 
                  color="error"
                  onClick={() => updateStatus('rejected')}
                  disabled={maintenanceRequest.status === 'rejected'}
                >
                  {translate('markAsRejected') || 'رفض'}
                </Button>
                
                <Button 
                  variant="contained" 
                  color="info"
                  onClick={() => updateStatus('completed')}
                  disabled={maintenanceRequest.status === 'completed'}
                >
                  {translate('markAsCompleted') || 'إكمال'}
                </Button>
              </Box>
            </Paper>
          </Box>
        ) : (
          <Alert severity="info" sx={{ my: 2 }}>
            {translate('maintenanceRequestNotFound') || 'لم يتم العثور على طلب الصيانة'}
          </Alert>
        )}
      </Container>
      
      <Footer />
      
      {/* نافذة إضافة تعليق للموافقة أو الرفض */}
      <Dialog open={approvalDialogOpen} onClose={closeApprovalDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {approvalType === 'approve' 
            ? translate('approveRequest')
            : translate('rejectRequest')
          }
          <IconButton onClick={closeApprovalDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={translate('notes')}
            fullWidth
            multiline
            rows={4}
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            variant="outlined"
            placeholder={approvalType === 'approve' 
              ? translate('approvalNotesPlaceholder')
              : translate('rejectionNotesPlaceholder')
            }
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeApprovalDialog} variant="outlined">
            {translate('cancel')}
          </Button>
          <Button 
            onClick={submitApproval} 
            variant="contained" 
            color={approvalType === 'approve' ? 'success' : 'error'}
          >
            {approvalType === 'approve' 
              ? translate('confirm')
              : translate('reject')
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
