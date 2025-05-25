'use client';

import React, { useEffect, useState, Component } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TextField, Button, Container, Typography, Box, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert, Stack } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import axios from 'axios';

interface UserFormData {
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
  isActive: boolean;
}

interface PageProps {
  params: { id: string | string[] };
}

// مكون ErrorBoundary للتعامل مع الأخطاء
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">حدث خطأ ما. يرجى المحاولة مرة أخرى لاحقاً.</Alert>
        </Box>
      );
    }
    return this.props.children;
  }
}

// المكون الرئيسي لتعديل المستخدم
function EditUserContent({ params }: PageProps) {
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { t } = useLanguage();

  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: '',
    phoneNumber: '',
    isActive: true
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError(t('معرف المستخدم مفقود'));
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = response.data.data;
        setFormData({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phoneNumber: userData.phoneNumber || '',
          isActive: userData.isActive
        });
      } catch (err: any) {
        setError(err.response?.data?.message || t('حدث خطأ في جلب بيانات المستخدم'));
        if (err.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, router, t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'isActive' ? value === 'true' : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/users/${userId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(t('تم تحديث بيانات المستخدم بنجاح'));
      setTimeout(() => {
        router.push('/dashboard/users');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('حدث خطأ في تحديث بيانات المستخدم'));
      if (err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Container sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        <Typography component="h1" variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
          {t('تعديل بيانات المستخدم')}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label={t('الاسم')}
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <TextField
              fullWidth
              label={t('البريد الإلكتروني')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <FormControl fullWidth>
              <InputLabel>{t('الدور')}</InputLabel>
              <Select
                name="role"
                value={formData.role}
                label={t('الدور')}
                onChange={handleSelectChange}
                required
              >
                <MenuItem value="admin">{t('مدير')}</MenuItem>
                <MenuItem value="user">{t('مستخدم')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={t('رقم الهاتف')}
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />

            <FormControl fullWidth>
              <InputLabel>{t('الحالة')}</InputLabel>
              <Select
                name="isActive"
                value={String(formData.isActive)}
                label={t('الحالة')}
                onChange={handleSelectChange}
                required
              >
                <MenuItem value="true">{t('نشط')}</MenuItem>
                <MenuItem value="false">{t('غير نشط')}</MenuItem>
              </Select>
            </FormControl>

            {success && (
              <Alert severity="success">{success}</Alert>
            )}

            {error && (
              <Alert severity="error">{error}</Alert>
            )}

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
                sx={{ flex: 1 }}
              >
                {submitting ? t('جاري الحفظ...') : t('حفظ التغييرات')}
              </Button>

              <Button
                variant="outlined"
                onClick={() => router.push('/dashboard/users')}
                sx={{ flex: 1 }}
              >
                {t('إلغاء')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}

// تصدير المكون الرئيسي مع ErrorBoundary
export default function EditUserPage({ params }: PageProps) {
  return (
    <ErrorBoundary>
      <EditUserContent params={params} />
    </ErrorBoundary>
  );
}
