'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
  Alert,
  Container,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  InputAdornment,
  FormHelperText,
  Chip
} from '@mui/material';
import { Add, Delete, Save, ArrowBack, Apartment, Build, AttachMoney, Description } from '@mui/icons-material';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// نوع عنصر التكلفة
interface CostItem {
  classificationType: string;
  cost: number;
  quantity: number;
  total: number;
}

// نوع نوع الصيانة
interface MaintenanceType {
  value: string;
  ar: string;
  en: string;
}

// نوع نوع التصنيف
interface ClassificationType {
  value: string;
  ar: string;
  en: string;
}

// نوع الشقة
interface Apartment {
  _id: string;
  number: string;
  type: string;
  isActive: boolean;
  building: {
    name: string;
    _id: string;
  };
  department?: {
    name: string;
    _id: string;
  };
}

// صفحة إنشاء طلب صيانة جديد
export default function CreateMaintenanceRequestPage() {
  const router = useRouter();
  const { translate, language, isRTL } = useLanguage();
  const { user, checkAuth } = useAuth();
  
  // حالة الصفحة
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // بيانات الطلب
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [classificationTypes, setClassificationTypes] = useState<ClassificationType[]>([]);
  const [isApartmentFromUrl, setIsApartmentFromUrl] = useState<boolean>(false);
  
  // نموذج الطلب
  const [formData, setFormData] = useState({
    apartment: '',
    maintenanceType: '',
    notes: '',
  });
  
  // عناصر التكلفة
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [newCostItem, setNewCostItem] = useState<CostItem>({
    classificationType: '',
    cost: 0,
    quantity: 1,
    total: 0
  });
  
  // تهيئة الصفحة
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
        
        // التحقق من وجود معرف الشقة في الرابط
        const urlParams = new URLSearchParams(window.location.search);
        const apartmentId = urlParams.get('apartmentId');
        
        if (apartmentId) {
          console.log('تم العثور على معرف الشقة في الرابط:', apartmentId);
          setFormData(prev => ({ ...prev, apartment: apartmentId }));
          setIsApartmentFromUrl(true);
          
          // جلب بيانات الشقة المحددة
          await fetchSelectedApartment(apartmentId, token);
        }
        
        // جلب البيانات اللازمة
        await Promise.all([
          fetchApartments(),
          fetchMaintenanceTypes(),
          fetchClassificationTypes()
        ]);
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
  
  // جلب بيانات الشقة المحددة
  const fetchSelectedApartment = async (apartmentId: string, token: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/apartments/${apartmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const apartmentData = response.data.data;
        setSelectedApartment(apartmentData);
        
        // التحقق من حالة الشقة
        if (!apartmentData.isActive) {
          // عرض رسالة حسب لغة الموقع
          const errorMessage = translate('apartmentInactiveError');
          
          // عرض رسالة الخطأ
          toast.error(errorMessage, {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          
          // إعادة توجيه المستخدم بعد فترة قصيرة
          setTimeout(() => {
            router.push('/dashboard/apartments');
          }, 3000);
          
          // إضافة رسالة خطأ للصفحة أيضًا
          setError(errorMessage);
        }
      } else {
        console.error('فشل في جلب بيانات الشقة:', response.data);
        setError(language === 'ar' ? 'فشل في جلب بيانات الشقة' : 'Failed to fetch apartment data');
      }
    } catch (error: any) {
      console.error('Error fetching selected apartment:', error);
      const errorMsg = error?.response?.data?.message || (language === 'ar' ? 'حدث خطأ أثناء جلب بيانات الشقة' : 'Error fetching apartment data');
      setError(errorMsg);
    }
  };
  
  // جلب الشقق
  const fetchApartments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('لا يوجد توكن صالح');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/apartments', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setApartments(response.data.data);
      } else {
        console.error('فشل في جلب الشقق:', response.data);
      }
    } catch (error: any) {
      console.error('Error fetching apartments:', error);
      // استخدام بيانات فارغة في حالة الخطأ
      setApartments([]);
    }
  };
  
  // جلب أنواع الصيانة
  const fetchMaintenanceTypes = async () => {
    try {
      console.log('[MAINTENANCE] Using default maintenance types');
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
      
      // تعيين قيمة افتراضية لنوع الصيانة إذا لم يتم تحديده
      if (!formData.maintenanceType) {
        setFormData(prev => ({ ...prev, maintenanceType: 'electrical' }));
      }
    } catch (error) {
      console.error('Error in maintenance types setup:', error);
    }
  };
  
  // جلب أنواع التصنيفات
  const fetchClassificationTypes = async () => {
    try {
      console.log('[MAINTENANCE] Using default classification types');
      // استخدام بيانات افتراضية مباشرة بدلاً من محاولة جلبها من الخادم
      const dummyTypes = [
        { value: 'labor', ar: 'عمالة', en: 'Labor' },
        { value: 'materials', ar: 'مواد', en: 'Materials' },
        { value: 'equipment', ar: 'معدات', en: 'Equipment' },
        { value: 'tools', ar: 'أدوات', en: 'Tools' },
        { value: 'other', ar: 'أخرى', en: 'Other' }
      ];
      setClassificationTypes(dummyTypes);
      
      // تعيين قيمة افتراضية لنوع التصنيف
      setNewCostItem(prev => ({ ...prev, classificationType: 'labor' }));
    } catch (error) {
      console.error('Error in classification types setup:', error);
    }
  };
  
  // تغيير قيم النموذج
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // تغيير قيم عنصر التكلفة الجديد
  const handleCostItemChange = (e: any) => {
    const { name, value } = e.target;
    if (name) {
      const updatedCostItem = { ...newCostItem, [name]: value };
      
      // حساب الإجمالي تلقائياً
      if (name === 'cost' || name === 'quantity') {
        const cost = name === 'cost' ? Number(value) : newCostItem.cost;
        const quantity = name === 'quantity' ? Number(value) : newCostItem.quantity;
        updatedCostItem.total = cost * quantity;
      }
      
      setNewCostItem(updatedCostItem);
    }
  };
  
  // إضافة عنصر تكلفة جديد
  const addCostItem = () => {
    // التحقق من صحة البيانات
    if (!newCostItem.classificationType) {
      toast.error(translate('pleaseSelectClassificationType') || 'يرجى اختيار نوع التصنيف');
      return;
    }
    
    if (newCostItem.cost <= 0) {
      toast.error(translate('pleaseEnterValidCost') || 'يرجى إدخال تكلفة صحيحة');
      return;
    }
    
    if (newCostItem.quantity <= 0) {
      toast.error(translate('pleaseEnterValidQuantity') || 'يرجى إدخال كمية صحيحة');
      return;
    }
    
    // إضافة العنصر إلى القائمة
    setCostItems(prev => [...prev, { ...newCostItem }]);
    
    // إعادة تعيين نموذج العنصر الجديد
    setNewCostItem({
      classificationType: '',
      cost: 0,
      quantity: 1,
      total: 0
    });
  };
  
  // حذف عنصر تكلفة
  const removeCostItem = (index: number) => {
    setCostItems(prev => prev.filter((_, i) => i !== index));
  };
  
  // حساب إجمالي التكلفة
  const calculateTotalCost = () => {
    return costItems.reduce((sum, item) => sum + item.total, 0);
  };
  
  // إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    if (!formData.apartment) {
      toast.error('يرجى اختيار الشقة');
      return;
    }
    
    if (!formData.maintenanceType) {
      toast.error('يرجى اختيار نوع الصيانة');
      return;
    }
    
    if (costItems.length === 0) {
      toast.error('يرجى إضافة عنصر تكلفة واحد على الأقل');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('لا يوجد توكن صالح');
        return;
      }
      
      // تجهيز بيانات الطلب
      const requestData = {
        apartment: formData.apartment,
        maintenanceType: formData.maintenanceType,
        notes: formData.notes,
        costItems: costItems
      };
      
      console.log('إرسال طلب الصيانة:', requestData);
      
      // إرسال الطلب إلى الخادم
      const response = await axios.post(
        'http://localhost:5000/api/maintenance-requests',
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success('تم إنشاء طلب الصيانة بنجاح');
        
        // الانتقال إلى صفحة طلبات الصيانة
        setTimeout(() => {
          router.push('/dashboard/maintenance-requests');
        }, 1000);
      } else {
        setError('فشل في إنشاء طلب الصيانة');
      }
    } catch (error: any) {
      console.error('Error creating maintenance request:', error);
      setError(error?.response?.data?.message || 'حدث خطأ أثناء إنشاء طلب الصيانة');
      
      // التحقق من أخطاء المصادقة
      if (error?.response?.status === 401) {
        toast.error('الرجاء تسجيل الدخول');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    } finally {
      setSubmitting(false);
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
  
  // الحصول على اسم نوع التصنيف بناءً على القيمة
  const getClassificationTypeName = (typeValue: string): string => {
    if (!classificationTypes || classificationTypes.length === 0) {
      return typeValue;
    }
    const type = classificationTypes.find(t => t.value === typeValue);
    return type ? (language === 'ar' ? type.ar : type.en) : typeValue;
  };
  
  // ترجمة نوع الشقة
  const getApartmentTypeTranslation = (type: string): string => {
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
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {translate('createMaintenanceRequest')}
          </Typography>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/dashboard/maintenance-requests')}
          >
            {translate('back')}
          </Button>
        </Box>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              '& .MuiAlert-icon': { fontSize: '1.5rem' },
              '& .MuiAlert-message': { fontSize: '1rem' }
            }}
          >
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 8 }}>
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
              {translate('loading')}
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card elevation={3} sx={{ mb: 4, borderRadius: 2, overflow: 'visible', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s ease-in-out' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Apartment sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {translate('apartmentDetails')}
                    </Typography>
                  </Box>
                }
                sx={{ pb: 0, backgroundColor: 'background.paper' }}
              />
              <CardContent sx={{ pt: 3, px: { xs: 2, sm: 3, md: 4 } }}>
                {/* عرض بيانات الشقة المحددة من الرابط */}
                {isApartmentFromUrl && selectedApartment ? (
                  <Grid container spacing={3} sx={{ width: '100%', mb: 3 }}>
                    <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 4 / span 4' } }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('apartmentNumber')}
                        </Typography>
                        <Typography variant="h6">{selectedApartment.number}</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 4 / span 4' } }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('buildingName')}
                        </Typography>
                        <Typography variant="h6">{selectedApartment.building?.name || '-'}</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 4 / span 4' } }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('departmentName')}
                        </Typography>
                        <Typography variant="h6">{selectedApartment.department?.name || '-'}</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 4 / span 4' } }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('apartmentType')}
                        </Typography>
                        <Typography variant="h6">{getApartmentTypeTranslation(selectedApartment.type)}</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 4 / span 4' } }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('status')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={selectedApartment.isActive ? 
                              translate('active') : 
                              translate('inactive')} 
                            color={selectedApartment.isActive ? 'success' : 'error'}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid sx={{ gridColumn: 'span 12 / span 12' }}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                  </Grid>
                ) : null}
              
                {/* نموذج اختيار الشقة */}
                <Grid container spacing={3} sx={{ width: '100%' }}>
                  <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 6 / span 6' } }}>
                    <FormControl fullWidth required variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, height: '56px' }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 } }}>
                      <InputLabel id="apartment-label">
                        {translate('apartment')}
                      </InputLabel>
                      <Select
                        labelId="apartment-label"
                        id="apartment"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleChange}
                        label={translate('apartment')}
                        startAdornment={
                          <InputAdornment position="start">
                            <Apartment color="primary" fontSize="small" />
                          </InputAdornment>
                        }
                        disabled={isApartmentFromUrl}
                      >
                        {apartments.length > 0 ? (
                          apartments.map((apartment) => (
                            <MenuItem key={apartment._id} value={apartment._id}>
                              {apartment.number} - {apartment.building?.name || ''}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled value="">
                            {translate('noApartmentsFound')}
                          </MenuItem>
                        )}
                      </Select>
                      <FormHelperText>
                        {translate('selectApartmentHelp')}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Card elevation={3} sx={{ mb: 4, borderRadius: 2, overflow: 'visible', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s ease-in-out' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Build sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {translate('maintenanceDetails')}
                    </Typography>
                  </Box>
                }
                sx={{ pb: 0, backgroundColor: 'background.paper' }}
              />
              <CardContent sx={{ pt: 3, px: { xs: 2, sm: 3, md: 4 } }}>
              
              <Grid container spacing={3} sx={{ width: '100%' }}>
                <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 6 / span 6' } }}>
                  <FormControl fullWidth required variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, height: '56px' }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 } }}>
                    <InputLabel id="maintenance-type-label">
                      {translate('maintenanceType')}
                    </InputLabel>
                    <Select
                      labelId="maintenance-type-label"
                      id="maintenanceType"
                      name="maintenanceType"
                      value={formData.maintenanceType}
                      onChange={handleChange}
                      label={translate('maintenanceType')}
                      startAdornment={
                        <InputAdornment position="start">
                          <Build color="primary" fontSize="small" />
                        </InputAdornment>
                      }
                    >
                      {maintenanceTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {language === 'ar' ? type.ar : type.en}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {translate('selectMaintenanceTypeHelp')}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid sx={{ gridColumn: 'span 12 / span 12' }}>
                  <TextField
                    id="notes"
                    name="notes"
                    label={translate('notes')}
                    value={formData.notes}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    fullWidth
                    variant="outlined"
                    placeholder={translate('enterNotesPlaceholder')}
                    sx={{ 
                      width: '100%',
                      minHeight: '120px',
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        transition: 'all 0.3s ease-in-out',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                          borderWidth: '1px'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderWidth: '2px'
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Description color="primary" fontSize="small" />
                        </InputAdornment>
                      )
                    }}
                    helperText={translate('notesHelperText')}
                  />
                </Grid>
              </Grid>
              </CardContent>
            </Card>
            
            <Card elevation={3} sx={{ mb: 4, borderRadius: 2, overflow: 'visible', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s ease-in-out' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {translate('costItems')}
                    </Typography>
                  </Box>
                }
                sx={{ pb: 0, backgroundColor: 'background.paper' }}
              />
              <CardContent sx={{ pt: 3, px: { xs: 2, sm: 3, md: 4 } }}>

              
              <Grid container spacing={3} sx={{ mb: 3, width: '100%' }}>
                <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 3 / span 3' } }}>
                  <FormControl fullWidth required variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, height: '56px' }, '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 } }}>
                    <InputLabel id="classification-type-label">
                      {translate('classificationType')}
                    </InputLabel>
                    <Select
                      labelId="classification-type-label"
                      id="classificationType"
                      name="classificationType"
                      value={newCostItem.classificationType}
                      onChange={handleCostItemChange}
                      label={translate('classificationType')}
                    >
                      {classificationTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {language === 'ar' ? type.ar : type.en}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {translate('classificationTypeHelp')}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 3 / span 3' } }}>
                  <TextField
                    id="cost"
                    name="cost"
                    label={translate('cost')}
                    type="number"
                    value={newCostItem.cost}
                    onChange={handleCostItemChange}
                    fullWidth
                    required
                    variant="outlined"
                    sx={{ 
                      width: '100%',
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        height: '56px',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                          borderWidth: '1px'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderWidth: '2px'
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      inputProps: { min: 0 }
                    }}
                    helperText={translate('costHelperText')}
                  />
                </Grid>
                
                <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 2 / span 2' } }}>
                  <TextField
                    id="quantity"
                    name="quantity"
                    label={translate('quantity')}
                    type="number"
                    value={newCostItem.quantity}
                    onChange={handleCostItemChange}
                    fullWidth
                    required
                    variant="outlined"
                    sx={{ 
                      width: '100%',
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        height: '56px',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                          borderWidth: '1px'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderWidth: '2px'
                        }
                      }
                    }}
                    InputProps={{
                      inputProps: { min: 1 }
                    }}
                    helperText={translate('quantityHelperText')}
                  />
                </Grid>
                
                <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 2 / span 2' } }}>
                  <TextField
                    id="total"
                    label={translate('total')}
                    type="number"
                    value={newCostItem.total}
                    fullWidth
                    disabled
                    variant="outlined"
                    sx={{ 
                      width: '100%',
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2,
                        height: '56px',
                        backgroundColor: 'rgba(0, 0, 0, 0.02)'
                      }
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                    helperText={translate('totalHelperText')}
                  />
                </Grid>
                
                <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 2 / span 2' }, display: 'flex', alignItems: 'center', mt: { xs: 2, md: 0 }, height: '56px' }}>
                  <Tooltip title={translate('addCostItemTooltip')}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Add />}
                      onClick={addCostItem}
                      fullWidth
                      sx={{ 
                        borderRadius: 2, 
                        py: 1.5,
                        height: '56px',
                        boxShadow: 2,
                        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                        transition: 'all 0.3s ease-in-out'
                      }}
                    >
                      {translate('addCostItem')}
                    </Button>
                  </Tooltip>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              {costItems.length === 0 ? (
                <Box sx={{ my: 4, p: 3, borderRadius: 2, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
                  <AttachMoney color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body1" color="textSecondary" align="center">
                    {translate('noCostItems')}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                    {translate('addCostItemsHelp')}
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', boxShadow: 1, border: '1px solid rgba(224, 224, 224, 1)' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                          {translate('classificationType')}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                          {translate('cost')}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                          {translate('quantity')}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                          {translate('total')}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                          {translate('actions')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {costItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{getClassificationTypeName(item.classificationType)}</TableCell>
                          <TableCell align="right">{item.cost.toLocaleString()}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{item.total.toLocaleString()}</TableCell>
                          <TableCell align="center">
                            <Tooltip title={translate('delete')}>
                            <IconButton
                              color="error"
                              onClick={() => removeCostItem(index)}
                              size="small"
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: 'error.light',
                                  color: 'error.contrastText'
                                } 
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                          {translate('totalCost') || 'إجمالي التكلفة'}:
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {calculateTotalCost().toLocaleString()}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              </CardContent>
            </Card>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                onClick={() => router.push('/dashboard/maintenance-requests')}
                sx={{ 
                  mr: 2, 
                  borderRadius: 2, 
                  px: 3, 
                  py: 1.2,
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2, backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  transition: 'all 0.3s ease-in-out'
                }}
                disabled={submitting}
              >
                {translate('cancel')}
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={submitting ? null : <Save />}
                disabled={submitting}
                sx={{ 
                  borderRadius: 2, 
                  px: 4, 
                  py: 1.2,
                  boxShadow: 3,
                  '&:hover': { boxShadow: 5, transform: 'translateY(-2px)' },
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                {submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  translate('save') || 'حفظ'
                )}
              </Button>
            </Box>
          </form>
        )}
      </Container>
      
      <Footer />
    </Box>
  );
}
