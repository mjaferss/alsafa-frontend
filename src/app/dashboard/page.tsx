'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Card, CardContent, Button, CircularProgress, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Person, Home, Assignment, Settings, Translate, ShoppingCart, Apartment, Build } from '@mui/icons-material';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

// نوع بيانات المستخدم
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
}

// نوع بيانات لوحة المعلومات
interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalDepartments: number;
  totalPurchases: number;
  totalBuildings: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalDepartments: 0,
    totalPurchases: 0,
    totalBuildings: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('[DASHBOARD] Auth state:', { loading, user: !!user });
    
    // التحقق من أننا في جانب العميل
    if (typeof window !== 'undefined') {
      // التحقق من وجود التوكن في localStorage
      const token = localStorage.getItem('token');
      console.log('[DASHBOARD] Token exists:', !!token);
      
      // إذا لم يكن هناك توكن أو انتهت عملية التحميل ولم يكن هناك مستخدم
      if ((!token || (!loading && !user))) {
        console.log('[DASHBOARD] No authentication, redirecting to login');
        // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
        window.location.href = '/login';
        return;
      }
    }

    // جلب إحصائيات لوحة المعلومات
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setError('');
        
        // التحقق من أننا في جانب العميل
        if (typeof window === 'undefined') {
          console.log('[DASHBOARD] Running on server side, cannot fetch stats');
          return;
        }
        
        const token = localStorage.getItem('token');
        console.log('[DASHBOARD] Fetching stats with token:', !!token);
        
        if (!token) {
          console.error('[DASHBOARD] No token found when fetching stats');
          setError(t('pleaseLogin'));
          
          // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
          return;
        }
        
        // في المستقبل يمكن استدعاء API لجلب الإحصائيات الحقيقية
        // للآن نستخدم بيانات وهمية للعرض
        setStats({
          totalUsers: 25,
          totalProperties: 120,
          totalDepartments: 8,
          totalPurchases: 56,
          totalBuildings: 6
        });
      } catch (err: any) {
        console.error('Error fetching stats:', err);
        setError(t('loadingError'));
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user, loading, router, t]);

  const handleLogout = () => {
    logout();
  };

  if (loading || !user) {
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
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {t('loadingError')}
          </Alert>
        )}
        
        {user && (
          <>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {t('welcome')}{user.name}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleLogout}
                sx={{ [language === 'ar' ? 'ml' : 'mr']: 2 }}
              >
                {t('logout')}
              </Button>
            </Box>
            
            {/* بطاقات الإحصائيات */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr' }, gap: 3, mb: 6 }}>
              {/* بطاقة المستخدمين */}
              <Box>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#4CAF50', color: 'white', borderRadius: 2 }}>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" component="div">
                        {t('totalUsers')}
                      </Typography>
                      <Person fontSize="large" />
                    </Box>
                    <Typography variant="h3" component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
                      {stats.totalUsers}
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="success" 
                      fullWidth
                      onClick={() => router.push('/dashboard/users')}
                      sx={{ mt: 'auto', bgcolor: 'rgba(255, 255, 255, 0.2)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
                    >
                      {t('viewAll')}
                    </Button>
                  </CardContent>
                </Card>
              </Box>
              
              {/* بطاقة الشقق */}
              <Box>
                <Card sx={{ 
                  height: '100%', 
                  bgcolor: 'secondary.light', 
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                    <Home sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h5" component="div" gutterBottom>
                      {stats.totalProperties}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {t('totalProperties')}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => router.push('/dashboard/apartments')}
                      sx={{ 
                        mt: 2, 
                        color: 'white', 
                        borderColor: 'white',
                        '&:hover': { 
                          backgroundColor: 'rgba(255,255,255,0.1)', 
                          borderColor: 'white' 
                        }
                      }}
                    >
                      {t('viewAll')}
                    </Button>
                  </CardContent>
                </Card>
              </Box>
              
              {/* بطاقة الأقسام */}
              <Box>
                <Card sx={{ 
                  height: '100%', 
                  bgcolor: '#4caf50', // لون أخضر
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                    <Assignment sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h5" component="div" gutterBottom>
                      {stats.totalDepartments}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {t('totalDepartments')}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => router.push('/dashboard/departments')}
                      sx={{ 
                        mt: 2, 
                        color: 'white', 
                        borderColor: 'white',
                        '&:hover': { 
                          backgroundColor: 'rgba(255,255,255,0.1)', 
                          borderColor: 'white' 
                        }
                      }}
                    >
                      {t('viewAll')}
                    </Button>
                  </CardContent>
                </Card>
              </Box>
              
              {/* بطاقة المباني */}
              <Box>
                <Card sx={{ 
                  height: '100%', 
                  bgcolor: '#3f51b5', // لون أزرق
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                    <Apartment sx={{ fontSize: 48, mb: 2 }} />

                    <Typography variant="h5" component="div" gutterBottom>
                      {stats.totalBuildings}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {t('totalBuildings')}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => router.push('/dashboard/buildings')}
                      sx={{ 
                        mt: 2, 
                        color: 'white', 
                        borderColor: 'white',
                        '&:hover': { 
                          backgroundColor: 'rgba(255,255,255,0.1)', 
                          borderColor: 'white' 
                        }
                      }}
                    >
                      {t('viewAll')}
                    </Button>
                  </CardContent>
                </Card>
              </Box>
              
              {/* بطاقة طلبات الصيانة */}
              <Box>
                <Card sx={{ 
                  height: '100%', 
                  bgcolor: '#ff9800', // لون برتقالي
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                    <Assignment sx={{ fontSize: 48, mb: 2 }} />

                    <Typography variant="h5" component="div" gutterBottom>
                      {stats.totalPurchases}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {t('maintenanceRequests') || 'طلبات الصيانة'}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => router.push('/dashboard/maintenance-requests')}
                      sx={{ 
                        mt: 2, 
                        color: 'white', 
                        borderColor: 'white',
                        '&:hover': { 
                          backgroundColor: 'rgba(255,255,255,0.1)', 
                          borderColor: 'white' 
                        }
                      }}
                    >
                      {t('viewAll')}
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Box>
            
            {/* معلومات المستخدم */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                {t('accountInfo')}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      {t('name')}
                    </Typography>
                    <Typography variant="body1">
                      {user.name}
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      {t('email')}
                    </Typography>
                    <Typography variant="body1">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      {t('phone')}
                    </Typography>
                    <Typography variant="body1">
                      {t('notAvailable')}
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      {t('role')}
                    </Typography>
                    <Typography variant="body1">
                      {user.role} {/* عرض الدور كما هو في قاعدة البيانات بدون ترجمة */}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<Settings />}
                  onClick={() => router.push('/dashboard/profile')}
                  sx={{ ml: 2 }}
                >
                  {t('editProfile')}
                </Button>
              </Box>
            </Paper>
            
            {/* روابط سريعة */}
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
                {t('quickLinks')}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth
                    onClick={() => router.push('/dashboard/properties')}
                    sx={{ p: 2 }}
                  >
                    {t('manageProperties')}
                  </Button>
                </Box>
                
                <Box>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth
                    onClick={() => router.push('/dashboard/requests')}
                    sx={{ p: 2 }}
                  >
                    {t('manageRequests')}
                  </Button>
                </Box>
                
                <Box>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth
                    onClick={() => router.push('/dashboard/users')}
                    sx={{ p: 2 }}
                  >
                    {t('manageUsers')}
                  </Button>
                </Box>
                
                <Box>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth
                    onClick={() => router.push('/dashboard/settings')}
                    sx={{ p: 2 }}
                  >
                    {t('systemSettings')}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </>
        )}
      </Container>
      
      <Footer />
    </Box>
  );
}
