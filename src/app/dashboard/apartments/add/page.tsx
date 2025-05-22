'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/PageHeader';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// تعريف نوع القسم
interface Department {
  _id: string;
  name: string;
  code: string;
}

// تعريف نوع المبنى
interface Building {
  _id: string;
  name: string;
  code: string;
}

const AddApartmentPage = () => {
  const { translate, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  // حالة البيانات
  const [departments, setDepartments] = useState<Department[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // حالة النموذج
  const [formData, setFormData] = useState({
    department: '',
    building: '',
    number: '',
    code: '',
    type: '',
    totalAmount: 0
  });

  // حالة الأخطاء
  const [errors, setErrors] = useState({
    department: '',
    building: '',
    number: '',
    code: '',
    type: '',
    totalAmount: ''
  });

  // أنواع الشقق
  const apartmentTypes = [
    { value: 'rent', label: translate('apartmentTypeRent') },
    { value: 'sold', label: translate('apartmentTypeSold') },
    { value: 'empty', label: translate('apartmentTypeEmpty') },
    { value: 'public', label: translate('apartmentTypePublic') },
    { value: 'preparation', label: translate('apartmentTypePreparation') },
    { value: 'other', label: translate('apartmentTypeOther') }
  ];

  // جلب الأقسام والمباني
  const fetchDepartmentsAndBuildings = async () => {
    try {
      setLoading(true);
      let token = '';
      // التحقق من أننا في جانب العميل
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || '';
      }
      
      // استخدام رابط API ثابت للاختبار
      const departmentsApiUrl = 'http://localhost:5000/api/departments';
      const buildingsApiUrl = 'http://localhost:5000/api/buildings';
      
      // جلب الأقسام
      const departmentsResponse = await axios.get(departmentsApiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (departmentsResponse.data.success) {
        setDepartments(departmentsResponse.data.data);
      }
      
      // جلب المباني
      const buildingsResponse = await axios.get(buildingsApiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (buildingsResponse.data.success) {
        setBuildings(buildingsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(translate('errorFetchingData'));
    } finally {
      setLoading(false);
    }
  };

  // التحقق من صحة النموذج
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      department: '',
      building: '',
      number: '',
      code: '',
      type: '',
      totalAmount: ''
    };

    // التحقق من القسم
    if (!formData.department) {
      newErrors.department = translate('departmentRequired');
      isValid = false;
    }

    // التحقق من المبنى
    if (!formData.building) {
      newErrors.building = translate('buildingRequired');
      isValid = false;
    }

    // التحقق من رقم الشقة
    if (!formData.number) {
      newErrors.number = translate('apartmentNumberRequired');
      isValid = false;
    }

    // التحقق من كود الشقة
    if (!formData.code) {
      newErrors.code = translate('apartmentCodeRequired');
      isValid = false;
    }

    // التحقق من نوع الشقة
    if (!formData.type) {
      newErrors.type = translate('apartmentTypeRequired');
      isValid = false;
    }

    // التحقق من المبلغ الإجمالي
    if (formData.totalAmount < 0) {
      newErrors.totalAmount = translate('totalAmountMustBePositive');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // معالجة تغيير حقول النص
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // مسح رسالة الخطأ عند تغيير القيمة
      if (errors[name as keyof typeof errors]) {
        setErrors({
          ...errors,
          [name]: ''
        });
      }
    }
  };

  // معالجة تغيير حقول القائمة المنسدلة
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // مسح رسالة الخطأ عند تغيير القيمة
      if (errors[name as keyof typeof errors]) {
        setErrors({
          ...errors,
          [name]: ''
        });
      }
    }
  };

  // معالجة إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      let token = '';
      // التحقق من أننا في جانب العميل
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || '';
      }
      
      // استخدام رابط API ثابت للاختبار
      const apiUrl = 'http://localhost:5000/api/apartments';
      
      const response = await axios.post(
        apiUrl,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success(translate('apartmentAddedSuccess'));
        router.push('/dashboard/apartments');
      }
    } catch (error: any) {
      console.error('Error adding apartment:', error);
      
      if (error.response?.data?.error === 'Duplicate code') {
        setErrors({
          ...errors,
          code: translate('apartmentCodeAlreadyExists')
        });
      } else {
        toast.error(translate('errorAddingApartment'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    // التحقق من أننا في جانب العميل
    if (typeof window !== 'undefined') {
      fetchDepartmentsAndBuildings();
    }
  }, []);

  // التحقق من صلاحيات المستخدم
  if (user && user.role !== 'مدير' && user.role !== 'مشرف') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h5" color="error">
          {translate('accessDenied')}
        </Typography>
      </Box>
    );
  }

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
      <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1 }}>
        <PageHeader
          title={translate('addApartment')}
          buttonText={translate('backToApartments')}
          buttonIcon={<ArrowBack />}
          onButtonClick={() => router.push('/dashboard/apartments')}
        />

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* القسم */}
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                  <FormControl fullWidth error={!!errors.department}>
                    <InputLabel id="department-label">{translate('selectDepartment')}</InputLabel>
                    <Select
                      labelId="department-label"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleSelectChange}
                      label={translate('selectDepartment')}
                    >
                      {departments.map((department) => (
                        <MenuItem key={department._id} value={department._id}>
                          {department.name} ({department.code})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.department && <FormHelperText>{errors.department}</FormHelperText>}
                  </FormControl>
                </Grid>

                {/* المبنى */}
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                  <FormControl fullWidth error={!!errors.building}>
                    <InputLabel id="building-label">{translate('selectBuilding')}</InputLabel>
                    <Select
                      labelId="building-label"
                      id="building"
                      name="building"
                      value={formData.building}
                      onChange={handleSelectChange}
                      label={translate('selectBuilding')}
                    >
                      {buildings.map((building) => (
                        <MenuItem key={building._id} value={building._id}>
                          {building.name} ({building.code})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.building && <FormHelperText>{errors.building}</FormHelperText>}
                  </FormControl>
                </Grid>

                {/* رقم الشقة */}
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                  <TextField
                    fullWidth
                    id="number"
                    name="number"
                    label={translate('apartmentNumber')}
                    value={formData.number}
                    onChange={handleTextChange}
                    error={!!errors.number}
                    helperText={errors.number}
                  />
                </Grid>

                {/* كود الشقة */}
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                  <TextField
                    fullWidth
                    id="code"
                    name="code"
                    label={translate('apartmentCode')}
                    value={formData.code}
                    onChange={handleTextChange}
                    error={!!errors.code}
                    helperText={errors.code}
                  />
                </Grid>

                {/* نوع الشقة */}
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                  <FormControl fullWidth error={!!errors.type}>
                    <InputLabel id="type-label">{translate('selectApartmentType')}</InputLabel>
                    <Select
                      labelId="type-label"
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleSelectChange}
                      label={translate('selectApartmentType')}
                    >
                      {apartmentTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                  </FormControl>
                </Grid>

                {/* المبلغ الإجمالي */}
                <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                  <TextField
                    fullWidth
                    id="totalAmount"
                    name="totalAmount"
                    label={translate('totalAmount')}
                    type="number"
                    value={formData.totalAmount}
                    onChange={handleTextChange}
                    error={!!errors.totalAmount}
                    helperText={errors.totalAmount}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>

                {/* زر الحفظ */}
                <Grid sx={{ gridColumn: 'span 12' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={submitting}
                      sx={{ minWidth: 150 }}
                    >
                      {submitting ? translate('saving') : translate('saveApartment')}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </Box>
  );
};

export default AddApartmentPage;
