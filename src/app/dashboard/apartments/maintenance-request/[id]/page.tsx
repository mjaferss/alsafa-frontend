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
  building: {
    name: string;
    _id: string;
  };
  department?: {
    name: string;
    _id: string;
  };
  isActive: boolean;
  type: string;
}

// صفحة إنشاء طلب صيانة لشقة محددة
export default function ApartmentMaintenanceRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { translate, language, isRTL } = useLanguage();
  const { user, checkAuth } = useAuth();
  
  // حالة الصفحة
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // بيانات الطلب
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [classificationTypes, setClassificationTypes] = useState<ClassificationType[]>([]);
  
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
        
        // جلب البيانات اللازمة
        await Promise.all([
          fetchApartment(),
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
  }, [router, params.id]);
  
  // جلب بيانات الشقة
  const fetchApartment = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('لا يوجد توكن صالح');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/apartments/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setApartment(response.data.data);
        // تعيين الشقة في نموذج البيانات
        setFormData(prev => ({ ...prev, apartment: response.data.data._id }));
      } else {
        console.error('فشل في جلب بيانات الشقة:', response.data);
        setError('فشل في جلب بيانات الشقة');
      }
    } catch (error: any) {
      console.error('Error fetching apartment:', error);
      setError(error?.response?.data?.message || 'حدث خطأ أثناء جلب بيانات الشقة');
      
      // التحقق من أخطاء المصادقة
      if (error?.response?.status === 401) {
        toast.error('الرجاء تسجيل الدخول');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    }
  };
  
  // جلب أنواع الصيانة
  const fetchMaintenanceTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // استخدام بيانات افتراضية في حالة عدم وجود توكن
        const dummyTypes = [
          { value: 'electrical', ar: 'كهرباء', en: 'Electrical' },
          { value: 'mechanical', ar: 'ميكانيكا', en: 'Mechanical' },
          { value: 'finishing', ar: 'تشطيب', en: 'Finishing' },
          { value: 'maintenance', ar: 'صيانة', en: 'Maintenance' },
          { value: 'other', ar: 'أخرى', en: 'Other' }
        ];
        setMaintenanceTypes(dummyTypes);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/maintenance-requests/types', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setMaintenanceTypes(response.data.data);
      } else {
        // استخدام بيانات افتراضية في حالة الخطأ
        const dummyTypes = [
          { value: 'electrical', ar: 'كهرباء', en: 'Electrical' },
          { value: 'mechanical', ar: 'ميكانيكا', en: 'Mechanical' },
          { value: 'finishing', ar: 'تشطيب', en: 'Finishing' },
          { value: 'maintenance', ar: 'صيانة', en: 'Maintenance' },
          { value: 'other', ar: 'أخرى', en: 'Other' }
        ];
        setMaintenanceTypes(dummyTypes);
      }
    } catch (error) {
      console.error('Error fetching maintenance types:', error);
      
      // استخدام بيانات افتراضية في حالة الخطأ
      const dummyTypes = [
        { value: 'electrical', ar: 'كهرباء', en: 'Electrical' },
        { value: 'mechanical', ar: 'ميكانيكا', en: 'Mechanical' },
        { value: 'finishing', ar: 'تشطيب', en: 'Finishing' },
        { value: 'maintenance', ar: 'صيانة', en: 'Maintenance' },
        { value: 'other', ar: 'أخرى', en: 'Other' }
      ];
      setMaintenanceTypes(dummyTypes);
    }
  };
  
  // جلب أنواع التصنيفات
  const fetchClassificationTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // استخدام بيانات افتراضية في حالة عدم وجود توكن
        const dummyTypes = [
          { value: 'labor', ar: 'عمالة', en: 'Labor' },
          { value: 'materials', ar: 'مواد', en: 'Materials' },
          { value: 'other', ar: 'أخرى', en: 'Other' }
        ];
        setClassificationTypes(dummyTypes);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/maintenance-requests/classification-types', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setClassificationTypes(response.data.data);
      } else {
        // استخدام بيانات افتراضية في حالة الخطأ
        const dummyTypes = [
          { value: 'labor', ar: 'عمالة', en: 'Labor' },
          { value: 'materials', ar: 'مواد', en: 'Materials' },
          { value: 'other', ar: 'أخرى', en: 'Other' }
        ];
        setClassificationTypes(dummyTypes);
      }
    } catch (error) {
      console.error('Error fetching classification types:', error);
      
      // استخدام بيانات افتراضية في حالة الخطأ
      const dummyTypes = [
        { value: 'labor', ar: 'عمالة', en: 'Labor' },
        { value: 'materials', ar: 'مواد', en: 'Materials' },
        { value: 'other', ar: 'أخرى', en: 'Other' }
      ];
      setClassificationTypes(dummyTypes);
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
    if (!newCostItem.classificationType || newCostItem.cost <= 0 || newCostItem.quantity <= 0) {
      toast.error('يرجى إدخال جميع بيانات عنصر التكلفة بشكل صحيح');
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
  const getApartmentTypeTranslation = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'rent': translate('apartmentTypeRent') || 'إيجار',
      'sold': translate('apartmentTypeSold') || 'مباع',
      'empty': translate('apartmentTypeEmpty') || 'فارغ',
      'public': translate('apartmentTypePublic') || 'عام',
      'preparation': translate('apartmentTypePreparation') || 'تجهيز',
      'other': translate('apartmentTypeOther') || 'أخرى'
    };
    return typeMap[type] || type;
  };
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {translate('createMaintenanceRequestForApartment') || 'إنشاء طلب صيانة للشقة'}
          </Typography>
          
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBack />}
            onClick={() => router.push(`/dashboard/apartments/view/${params.id}`)}
          >
            {translate('back') || 'رجوع'}
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
              {translate('loading') || 'جاري التحميل...'}
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* بيانات الشقة */}
            <Card elevation={3} sx={{ mb: 4, borderRadius: 2, overflow: 'visible', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s ease-in-out' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Apartment sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {translate('apartmentDetails') || 'تفاصيل الشقة'}
                    </Typography>
                  </Box>
                }
                sx={{ pb: 0, backgroundColor: 'background.paper' }}
              />
              <CardContent sx={{ pt: 3, px: { xs: 2, sm: 3, md: 4 } }}>
                {apartment ? (
                  <Grid container spacing={3} sx={{ width: '100%' }}>
                    <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 4 / span 4' } }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('apartmentNumber') || 'رقم الشقة'}
                        </Typography>
                        <Typography variant="h6">{apartment.number}</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 4 / span 4' } }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('buildingName') || 'اسم المبنى'}
                        </Typography>
                        <Typography variant="h6">{apartment.building?.name || '-'}</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 4 / span 4' } }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {translate('apartmentType') || 'نوع الشقة'}
                        </Typography>
                        <Typography variant="h6">{getApartmentTypeTranslation(apartment.type)}</Typography>
                      </Box>
                    </Grid>
                    
                    <Grid sx={{ gridColumn: 'span 12 / span 12' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          label={apartment.isActive ? 
                            (translate('active') || 'مفعلة') : 
                            (translate('inactive') || 'غير مفعلة')} 
                          color={apartment.isActive ? 'success' : 'error'}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="textSecondary">
                          {apartment.isActive ? 
                            (translate('apartmentIsActive') || 'الشقة مفعلة حالياً') : 
                            (translate('apartmentIsInactive') || 'الشقة غير مفعلة حالياً')}.
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body1" color="error">
                    {translate('apartmentNotFound') || 'لم يتم العثور على الشقة'}
                  </Typography>
                )}
              </CardContent>
            </Card>
            
            {/* بيانات طلب الصيانة */}
            <Card elevation={3} sx={{ mb: 4, borderRadius: 2, overflow: 'visible', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s ease-in-out' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Build sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {translate('maintenanceRequestDetails') || 'تفاصيل طلب الصيانة'}
                    </Typography>
                  </Box>
                }
                sx={{ pb: 0, backgroundColor: 'background.paper' }}
              />
              <CardContent sx={{ pt: 3, px: { xs: 2, sm: 3, md: 4 } }}>
                <Grid container spacing={3} sx={{ width: '100%' }}>
                  <Grid sx={{ gridColumn: 'span 12 / span 12' }}>
                    <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                      <InputLabel id="maintenance-type-label">
                        {translate('maintenanceType') || 'نوع الصيانة'} *
                      </InputLabel>
                      <Select
                        labelId="maintenance-type-label"
                        id="maintenance-type"
                        name="maintenanceType"
                        value={formData.maintenanceType}
                        onChange={handleChange}
                        label={translate('maintenanceType') || 'نوع الصيانة'}
                        required
                        sx={{ 
                          height: '56px',
                          '&:hover': { borderColor: 'primary.main' },
                          '& .MuiOutlinedInput-notchedOutline': { borderWidth: '1px' },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: '2px' }
                        }}
                      >
                        {maintenanceTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {language === 'ar' ? type.ar : type.en}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid sx={{ gridColumn: 'span 12 / span 12' }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      label={translate('notes') || 'ملاحظات'}
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: 'primary.main' },
                          '&.Mui-focused fieldset': { borderWidth: '2px' }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Description color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {/* عناصر التكلفة */}
            <Card elevation={3} sx={{ mb: 4, borderRadius: 2, overflow: 'visible', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s ease-in-out' }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {translate('costItems') || 'عناصر التكلفة'}
                    </Typography>
                  </Box>
                }
                sx={{ pb: 0, backgroundColor: 'background.paper' }}
              />
              <CardContent sx={{ pt: 3, px: { xs: 2, sm: 3, md: 4 } }}>
                {/* نموذج إضافة عنصر تكلفة */}
                <Box sx={{ mb: 4, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                    {translate('addNewCostItem') || 'إضافة عنصر تكلفة جديد'}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ width: '100%' }}>
                    <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 4 / span 4' } }}>
                      <FormControl fullWidth variant="outlined" sx={{ mb: { xs: 2, md: 0 } }}>
                        <InputLabel id="classification-type-label">
                          {translate('classificationType') || 'نوع التصنيف'} *
                        </InputLabel>
                        <Select
                          labelId="classification-type-label"
                          id="classification-type"
                          name="classificationType"
                          value={newCostItem.classificationType}
                          onChange={handleCostItemChange}
                          label={translate('classificationType') || 'نوع التصنيف'}
                          sx={{ 
                            height: '56px',
                            '&:hover': { borderColor: 'primary.main' },
                            '& .MuiOutlinedInput-notchedOutline': { borderWidth: '1px' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: '2px' }
                          }}
                        >
                          {classificationTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {language === 'ar' ? type.ar : type.en}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 3 / span 3' } }}>
                      <TextField
                        fullWidth
                        type="number"
                        variant="outlined"
                        label={translate('cost') || 'التكلفة'}
                        name="cost"
                        value={newCostItem.cost}
                        onChange={handleCostItemChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          mb: { xs: 2, md: 0 },
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderWidth: '2px' }
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 3 / span 3' } }}>
                      <TextField
                        fullWidth
                        type="number"
                        variant="outlined"
                        label={translate('quantity') || 'الكمية'}
                        name="quantity"
                        value={newCostItem.quantity}
                        onChange={handleCostItemChange}
                        sx={{ 
                          mb: { xs: 2, md: 0 },
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderWidth: '2px' }
                          }
                        }}
                      />
                    </Grid>
                    
                    <Grid sx={{ gridColumn: 'span 12 / span 12', md: { gridColumn: 'span 2 / span 2' } }}>
                      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                        <Tooltip title={translate('addCostItem') || 'إضافة عنصر التكلفة'}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={addCostItem}
                            startIcon={<Add />}
                            sx={{ 
                              height: '56px',
                              minWidth: '120px',
                              textTransform: 'none',
                              boxShadow: 2,
                              '&:hover': { boxShadow: 4 }
                            }}
                          >
                            {translate('add') || 'إضافة'}
                          </Button>
                        </Tooltip>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                
                {/* قائمة عناصر التكلفة */}
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                  {translate('costItemsList') || 'قائمة عناصر التكلفة'}
                </Typography>
                
                {costItems.length > 0 ? (
                  <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
                    <Table>
                      <TableHead sx={{ backgroundColor: 'background.paper' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            {translate('classificationType') || 'نوع التصنيف'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {translate('cost') || 'التكلفة'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {translate('quantity') || 'الكمية'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {translate('total') || 'الإجمالي'}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                            {translate('actions') || 'الإجراءات'}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {costItems.map((item, index) => (
                          <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                            <TableCell>{getClassificationTypeName(item.classificationType)}</TableCell>
                            <TableCell align="right">{item.cost}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{item.total}</TableCell>
                            <TableCell align="center">
                              <Tooltip title={translate('delete') || 'حذف'}>
                                <IconButton 
                                  color="error" 
                                  onClick={() => removeCostItem(index)}
                                  size="small"
                                  sx={{ '&:hover': { backgroundColor: 'error.light', color: 'error.contrastText' } }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ backgroundColor: 'action.selected' }}>
                          <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>
                            {translate('totalCost') || 'إجمالي التكلفة'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {calculateTotalCost()}
                          </TableCell>
                          <TableCell />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2,
                      '& .MuiAlert-icon': { fontSize: '1.5rem' },
                      '& .MuiAlert-message': { fontSize: '1rem' }
                    }}
                  >
                    {translate('noCostItemsAdded') || 'لم تتم إضافة أي عناصر تكلفة حتى الآن'}
                  </Alert>
                )}
              </CardContent>
            </Card>
            
            {/* أزرار الإجراءات */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => router.push(`/dashboard/apartments/view/${params.id}`)}
                sx={{ 
                  mr: 2, 
                  px: 4,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                {translate('cancel') || 'إلغاء'}
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
                sx={{ 
                  px: 4,
                  textTransform: 'none',
                  boxShadow: 2,
                  '&:hover': { boxShadow: 4 }
                }}
              >
                {submitting
                  ? (translate('saving') || 'جاري الحفظ...')
                  : (translate('saveRequest') || 'حفظ الطلب')}
              </Button>
            </Box>
          </form>
        )}
      </Container>
      
      <Footer />
    </Box>
  );
}
