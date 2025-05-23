'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
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

// تعريف نوع الشقة
interface Apartment {
  _id: string;
  number: string;
  code: string;
  type: string;
  totalAmount: number;
  isActive: boolean;
  department: string | {
    _id: string;
    name: string;
    code: string;
  };
  building: string | {
    _id: string;
    name: string;
    code: string;
  };
}

interface PageProps {
  params: {
    id: string;
  };
}

const EditApartmentPage = ({ params }: PageProps) => {
  const { translate, language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  // حالة البيانات
  const [departments, setDepartments] = useState<Department[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<boolean>(false);

  // حالة النموذج
  const [formData, setFormData] = useState<Apartment>({
    _id: '',
    department: '',
    building: '',
    number: '',
    code: '',
    type: '',
    totalAmount: 0,
    isActive: true
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
    }
  };

  // جلب بيانات الشقة
  const fetchApartment = async () => {
    try {
      setLoading(true);
      let token = '';
      // التحقق من أننا في جانب العميل
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || '';
      }
      
      // استخدام رابط API ثابت للاختبار
      const apiUrl = `http://localhost:5000/api/apartments/${params.id}`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const apartmentData = response.data.data;
        setFormData({
          _id: apartmentData._id,
          department: typeof apartmentData.department === 'object' ? apartmentData.department._id : apartmentData.department,
          building: typeof apartmentData.building === 'object' ? apartmentData.building._id : apartmentData.building,
          number: apartmentData.number,
          code: apartmentData.code,
          type: apartmentData.type,
          totalAmount: apartmentData.totalAmount,
          isActive: apartmentData.isActive
        });
      }
    } catch (error) {
      console.error('Error fetching apartment:', error);
      setNotFound(true);
      toast.error(translate('apartmentNotFound'));
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

  // معالجة تغيير الحقول
  const handleChange = (e: any) => {
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
      const apiUrl = `http://localhost:5000/api/apartments/${params.id}`;
      
      const response = await axios.put(
        apiUrl,
        {
          department: formData.department,
          building: formData.building,
          number: formData.number,
          code: formData.code,
          type: formData.type,
          totalAmount: formData.totalAmount
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success(translate('apartmentUpdatedSuccessfully'));
        router.push('/dashboard/apartments');
      }
    } catch (error: any) {
      console.error('Error updating apartment:', error);
      
      if (error.response?.data?.error === 'Duplicate code') {
        setErrors({
          ...errors,
          code: translate('apartmentCodeAlreadyExists')
        });
      } else {
        toast.error(translate('errorUpdatingApartment'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    const fetchData = async () => {
      await fetchDepartmentsAndBuildings();
      await fetchApartment();
    };
    
    fetchData();
  }, [params.id]);

  // التحقق من صلاحيات المستخدم
  if (user && user.role !== 'مدير' && user.role !== 'مشرف') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: language === 'ar' ? 'rtl' : 'ltr' }}>
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

  if (notFound) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: language === 'ar' ? 'rtl' : 'ltr' }}>
        <Header />
        <Container sx={{ mt: 12, mb: 8, flexGrow: 1 }}>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error">
              {translate('apartmentNotFound')}
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

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1 }}>
        <PageHeader
          title={translate('editApartment')}
          backButtonText={translate('backToApartments')}
          onBackButtonClick={() => router.push('/dashboard/apartments')}
        />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
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
                      onChange={handleChange}
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
                      onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                      onChange={handleChange}
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
                    onChange={handleChange}
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
          </Paper>
        )}
      </Container>
      <Footer />
    </Box>
  );
};

export default EditApartmentPage;
