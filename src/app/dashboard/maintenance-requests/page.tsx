'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  Add,
  Search,
  Visibility,
  CheckCircle,
  Cancel,
  Build,
  HourglassEmpty
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// نوع طلب الصيانة
interface MaintenanceRequest {
  _id: string;
  apartment: {
    _id: string;
    number: string;
    building: {
      name: string;
    }
  };
  maintenanceType: string;
  totalCost: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  createdBy: {
    name: string;
  };
}

// صفحة عرض طلبات الصيانة
export default function MaintenanceRequestsPage() {
  const router = useRouter();
  const { translate, language, isRTL } = useLanguage();
  const { user, checkAuth } = useAuth();
  
  // حالة الصفحة
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MaintenanceRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [maintenanceTypes, setMaintenanceTypes] = useState<any[]>([]);
  
  // جلب طلبات الصيانة وأنواع الصيانة عند تحميل الصفحة
  useEffect(() => {
    const initPage = async () => {
      try {
        // التحقق من وجود توكن
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('لا يوجد توكن - إعادة توجيه لصفحة تسجيل الدخول');
          router.push('/login');
          return;
        }
        
        setLoading(true);
        setError(null);
        
        // جلب أنواع الصيانة
        await fetchMaintenanceTypes();
        
        // جلب طلبات الصيانة
        await fetchMaintenanceRequests();
      } catch (error: any) {
        console.error('Error initializing page:', error);
        setError(error?.response?.data?.message || 'حدث خطأ أثناء تحميل الصفحة');
        
        // التحقق من أخطاء المصادقة
        if (error?.response?.status === 401) {
          toast.error('الرجاء تسجيل الدخول');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    initPage();
  }, [router]);
  
  // تصفية طلبات الصيانة عند تغيير مصطلح البحث
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRequests(maintenanceRequests);
    } else {
      try {
        const lowercasedSearch = searchTerm.toLowerCase();
        const filtered = maintenanceRequests.filter(request => {
          // التحقق من وجود البيانات قبل محاولة الوصول إليها
          const apartmentNumber = request.apartment?.number?.toLowerCase() || '';
          const buildingName = request.apartment?.building?.name?.toLowerCase() || '';
          const maintenanceTypeName = getMaintenanceTypeName(request.maintenanceType).toLowerCase();
          const statusName = getStatusName(request.status).toLowerCase();
          
          return apartmentNumber.includes(lowercasedSearch) ||
            buildingName.includes(lowercasedSearch) ||
            maintenanceTypeName.includes(lowercasedSearch) ||
            statusName.includes(lowercasedSearch);
        });
        setFilteredRequests(filtered);
      } catch (error) {
        console.error('Error filtering maintenance requests:', error);
        setFilteredRequests(maintenanceRequests);
      }
    }
  }, [searchTerm, maintenanceRequests, language]);
  
  // جلب طلبات الصيانة
  const fetchMaintenanceRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('لا يوجد توكن صالح');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/maintenance-requests', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setMaintenanceRequests(response.data.data);
        setFilteredRequests(response.data.data);
      } else {
        setError('فشل في جلب طلبات الصيانة');
      }
    } catch (error: any) {
      console.error('Error fetching maintenance requests:', error);
      setError(error?.response?.data?.message || 'حدث خطأ أثناء جلب طلبات الصيانة');
      
      // استخدام بيانات فارغة في حالة الخطأ
      setMaintenanceRequests([]);
      setFilteredRequests([]);
    }
  };
  
  // جلب أنواع الصيانة
  const fetchMaintenanceTypes = async () => {
    try {
      console.log('[MAINTENANCE LIST] Using default maintenance types');
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
      console.error('[MAINTENANCE LIST] Error in maintenance types setup:', error);
    }
  };
  
  // الحصول على اسم نوع الصيانة بناءً على القيمة
  const getMaintenanceTypeName = (typeValue: string): string => {
    if (!maintenanceTypes || maintenanceTypes.length === 0) {
      return typeValue;
    }
    const type = maintenanceTypes.find(t => t.value === typeValue);
    return type ? (language === 'ar' ? type.ar : type.en) : typeValue;
  };
  
  // الحصول على اسم الحالة بناءً على القيمة
  const getStatusName = (status: string): string => {
    const statusMap: { [key: string]: { ar: string; en: string } } = {
      pending: { ar: 'معلق', en: 'Pending' },
      approved: { ar: 'موافق عليه', en: 'Approved' },
      rejected: { ar: 'مرفوض', en: 'Rejected' },
      completed: { ar: 'مكتمل', en: 'Completed' }
    };
    
    if (!status || !statusMap[status]) {
      return status || '';
    }
    
    return language === 'ar' ? statusMap[status].ar : statusMap[status].en;
  };
  
  // عرض حالة الطلب بلون مناسب
  const renderStatus = (status: string) => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    let icon = null;
    
    switch (status) {
      case 'pending':
        color = 'warning';
        icon = <HourglassEmpty fontSize="small" />;
        break;
      case 'approved':
        color = 'info';
        icon = <CheckCircle fontSize="small" />;
        break;
      case 'rejected':
        color = 'error';
        icon = <Cancel fontSize="small" />;
        break;
      case 'completed':
        color = 'success';
        icon = <Build fontSize="small" />;
        break;
      default:
        color = 'default';
        icon = <HourglassEmpty fontSize="small" />;
    }
    
    return (
      <Chip
        icon={icon}
        label={getStatusName(status)}
        color={color}
        size="small"
        variant="outlined"
      />
    );
  };
  
  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
  };
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {translate('maintenanceRequests') || 'طلبات الصيانة'}
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => router.push('/dashboard/maintenance-requests/add')}
          >
            {translate('createMaintenanceRequest') || 'إنشاء طلب صيانة'}
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder={translate('searchMaintenanceRequests') || 'بحث في طلبات الصيانة'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredRequests.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                {translate('noMaintenanceRequests') || 'لا توجد طلبات صيانة'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{translate('apartmentNumber') || 'رقم الشقة'}</TableCell>
                    <TableCell>{translate('buildingName') || 'اسم المبنى'}</TableCell>
                    <TableCell>{translate('maintenanceType') || 'نوع الصيانة'}</TableCell>
                    <TableCell align="right">{translate('cost') || 'التكلفة'}</TableCell>
                    <TableCell>{translate('status') || 'الحالة'}</TableCell>
                    <TableCell>{translate('createdAt') || 'تاريخ الإنشاء'}</TableCell>
                    <TableCell>{translate('createdBy') || 'المنشئ'}</TableCell>
                    <TableCell>{translate('actions') || 'الإجراءات'}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>{request.apartment?.number || '-'}</TableCell>
                      <TableCell>{request.apartment?.building?.name || '-'}</TableCell>
                      <TableCell>{getMaintenanceTypeName(request.maintenanceType)}</TableCell>
                      <TableCell align="right">{(request.totalCost || 0).toLocaleString()}</TableCell>
                      <TableCell>{renderStatus(request.status)}</TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell>{request.createdBy?.name || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => router.push(`/dashboard/maintenance-requests/view/${request._id}`)}
                          aria-label={translate('view') || 'عرض'}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
      
      <Footer />
    </Box>
  );
}