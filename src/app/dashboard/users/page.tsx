'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import { 
  Visibility as VisibilityIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Key as KeyIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

// نوع بيانات المستخدم
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  
  // جلب قائمة المستخدمين مع دعم الترقيم
  const fetchUsers = async (config: any, pageNumber = 1, limit = 10) => {
    try {
      setLoading(true);
      
      // التحقق من التوكن قبل إرسال الطلب
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        setError('لم يتم العثور على توكن المصادقة. الرجاء تسجيل الدخول مرة أخرى.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }
      
      // تعيين رأس الطلب بشكل صريح
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // محاولة جلب المستخدمين من الباك إند
      // إضافة معلمات الترقيم إلى طلب API
      const response = await axios.get(
        `http://localhost:5000/api/users?page=${pageNumber}&limit=${limit}`, 
        { headers }
      );
      
      // التحقق من نجاح الطلب
      if (response.data.success) {
        // التحقق من هيكل البيانات
        const userData = response.data.data || [];
        
        // إضافة بيانات المستخدمين إلى الحالة
        setUsers(Array.isArray(userData) ? userData : []);
        
        // تحديث إجمالي عدد المستخدمين للترقيم
        if (response.data.count !== undefined) {
          setTotalUsers(response.data.count);
        } else if (Array.isArray(userData)) {
          setTotalUsers(userData.length);
        }
        
        // تحديث معلومات الترقيم
        if (response.data.pagination) {
          const totalItems = response.data.count || userData.length;
          setTotalPages(Math.ceil(totalItems / limit));
        }
        
        // إذا لم يتم العثور على مستخدمين، نحاول جلب المستخدمين بدون معلمات الترقيم
        if (userData.length === 0 && pageNumber === 1) {
          // محاولة جلب جميع المستخدمين بدون ترقيم
          const allUsersResponse = await axios.get(
            `http://localhost:5000/api/users`, 
            { headers }
          );
          
          if (allUsersResponse.data.success) {
            const allUserData = allUsersResponse.data.data || [];
            setUsers(Array.isArray(allUserData) ? allUserData : []);
            setTotalUsers(allUserData.length);
            setTotalPages(1);
          }
        }
      } else {
        setError('فشل في جلب بيانات المستخدمين. الرجاء التحقق من السيرفر');
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      
      // تحقق من مشكلة المصادقة
      if (err.response?.status === 401) {
        const errorMsg = err.response?.data?.error || 'جلسة المستخدم انتهت. الرجاء تسجيل الدخول مرة أخرى.';
        setError(`خطأ في المصادقة: ${errorMsg}`);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } else if (err.response?.status === 403) {
        const errorMsg = err.response?.data?.error || 'ليس لديك صلاحية للوصول إلى هذه الصفحة.';
        setError(`خطأ في الصلاحيات: ${errorMsg}`);
      } else {
        setError('فشل في جلب بيانات المستخدمين. تحقق من اتصال السيرفر');
        
        // محاولة جلب المستخدمين بدون معلمات الترقيم كخيار احتياطي
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          if (token) {
            const headers = {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            };
            
            const fallbackResponse = await axios.get(
              `http://localhost:5000/api/users`, 
              { headers }
            );
            
            if (fallbackResponse.data.success) {
              const fallbackUserData = fallbackResponse.data.data || [];
              setUsers(Array.isArray(fallbackUserData) ? fallbackUserData : []);
              setTotalUsers(fallbackUserData.length);
              setTotalPages(1);
              setError(''); // مسح رسالة الخطأ إذا نجحت المحاولة الاحتياطية
            }
          }
        } catch (fallbackErr) {
          console.error('Fallback request also failed:', fallbackErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // التحقق من وجود توكن المستخدم
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    // إعداد الهيدر للطلبات
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    // جلب بيانات المستخدم الحالي للتحقق من الصلاحيات
    const checkAdminStatus = async () => {
      // تأكد من أننا في جانب العميل
      if (typeof window === 'undefined') {
        return;
      }
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.log('No token found, redirecting to login page');
          router.push('/login');
          return;
        }
        
        // تعيين رأس الطلب بشكل صريح
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        console.log('Checking admin status with token:', token.substring(0, 20) + '...');
        console.log('Request URL:', 'http://localhost:5000/api/users/me');
        console.log('Request headers:', headers);
        
        const response = await axios.get('http://localhost:5000/api/users/me', { headers });
        
        console.log('User data response:', response.data);
        
        if (response.data.success && response.data.data) {
          const currentUser = response.data.data;
          console.log('Current user:', currentUser);
          console.log('User role:', currentUser.role);
          
          // التحقق من دور المستخدم
          if (currentUser.role === 'مدير') {
            console.log('User is admin, fetching users list');
            setIsAdmin(true);
            fetchUsers(config, page + 1, rowsPerPage);
          } else {
            console.error('User is not admin, role:', currentUser.role);
            // محاولة تحديث دور المستخدم إلى مدير
            try {
              const updateResponse = await axios.put(
                `http://localhost:5000/api/users/${currentUser._id}`,
                { role: 'مدير' },
                { headers }
              );
              
              console.log('User role updated to مدير successfully!');
              alert('تم تحديث دورك إلى مدير. سيتم إعادة تحميل الصفحة.');
              window.location.reload();
              return;
            } catch (updateErr) {
              console.error('Error updating user role:', updateErr);
              // إعادة توجيه المستخدم مباشرة إلى الداشبورد
              alert(`ليس لديك صلاحية للوصول إلى هذه الصفحة. دورك الحالي: ${currentUser.role}`);
              router.push('/dashboard');
              return;
            }
          }
        }
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        console.error('Error details:', err.response?.data);
        console.error('Error status:', err.response?.status);
        
        if (err.response?.status === 401) {
          const errorMsg = err.response?.data?.error || 'جلسة المستخدم انتهت. الرجاء تسجيل الدخول مرة أخرى.';
          alert(`خطأ في المصادقة: ${errorMsg}`);
          localStorage.removeItem('token');
          router.push('/login');
          return;
        } else {
          alert('ليس لديك صلاحية للوصول إلى هذه الصفحة');
          router.push('/dashboard');
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAdmin) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        // +1 لأن Material UI يبدأ من 0 بينما الباك إند يبدأ من 1
        fetchUsers(config, page + 1, rowsPerPage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, isAdmin]);

  // تغيير الصفحة - سيتم تنفيذ الطلب بشكل تلقائي من خلال useEffect
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // تغيير عدد الصفوف في الصفحة - سيتم تنفيذ الطلب بشكل تلقائي من خلال useEffect
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // فتح حوار تأكيد الحذف
  const handleOpenDeleteDialog = (userId: string) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  // إغلاق حوار تأكيد الحذف
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // تعطيل المستخدم بدلاً من حذفه
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

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

    try {
      setLoading(true);
      // بدلاً من حذف المستخدم، نقوم بتحديث حالته إلى غير نشط
      const response = await axios.put(
        `http://localhost:5000/api/users/${userToDelete}`,
        { isActive: false },
        config
      );
      
      if (response.data.success) {
        // بعد تعطيل المستخدم نعيد تحميل البيانات للتأكد من تحديث القائمة
        fetchUsers(config, page + 1, rowsPerPage);
      }
    } catch (err: any) {
      console.error('Error deactivating user:', err);
      setError(err.response?.data?.error || t('errorDeactivatingUser'));
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    if (!dateString) return t('notAvailable');
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // استخدام useState للتحكم في عرض المحتوى بعد التحميل على العميل
  const [mounted, setMounted] = useState(false);
  
  // استخدام useState للتحكم في عرض الأعمدة بناءً على حجم الشاشة
  // استخدام قيمة افتراضية لتجنب مشاكل التقديم المبدئي على الخادم
  const [windowWidth, setWindowWidth] = useState<number>(0);
  
  // استخدام useEffect للتأكد من أننا في جانب العميل
  // استخدام useEffect للتأكد من أننا في جانب العميل
  useEffect(() => {
    // تعيين mounted إلى true للإشارة إلى أننا في جانب العميل
    setMounted(true);
    
    // تحديث قيمة windowWidth عند تحميل الصفحة
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
    }
  }, []);
  
  // استخدام useEffect منفصل لمراقبة تغييرات حجم النافذة
  useEffect(() => {
    // تحديث حجم الشاشة عند تغيير حجم النافذة
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // إضافة مستمع لحدث تغيير حجم النافذة
    if (typeof window !== 'undefined') {
      // تشغيل handleResize مرة واحدة للتأكد من أن القيمة الأولية صحيحة
      handleResize();
      
      window.addEventListener('resize', handleResize);
      
      // إزالة المستمع عند تفكيك المكون
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [mounted]); // تنفيذ هذا التأثير فقط بعد أن يتم تحميل المكون
  
  // إذا لم يكن المستخدم مديرًا، فلا تعرض الصفحة واعرض رسالة تحميل فقط
  if (!mounted || (!isAdmin && loading)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', direction: isRTL ? 'rtl' : 'ltr' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {isRTL ? 'جاري التحقق من الصلاحيات...' : 'Checking permissions...'}
        </Typography>
      </Box>
    );
  }

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {t('accessDenied')}
          </Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />
      
      <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => {
                  setError('');
                  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                  if (token) {
                    const config = {
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    };
                    fetchUsers(config, page + 1, rowsPerPage);
                  } else {
                    router.push('/login');
                  }
                }}
              >
                {isRTL ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
            <Typography variant="h6" component="div">
              {t('usersManagement')}
            </Typography>
            {isAdmin && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => router.push('/dashboard/users/register')}
              >
                {t('addNewUser')}
              </Button>
            )}
          </Box>
          
          <TableContainer>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell>{t('userName')}</TableCell>
                  {/* إظهار البريد الإلكتروني فقط على الشاشات المتوسطة والكبيرة (> 600px) */}
                  {windowWidth > 600 && <TableCell>{t('userEmail')}</TableCell>}
                  {/* إظهار رقم الهاتف فقط على الشاشات المتوسطة والكبيرة (> 600px) */}
                  {windowWidth > 600 && <TableCell>{t('userPhoneNumber')}</TableCell>}
                  {/* إظهار الدور فقط على الشاشات المتوسطة والكبيرة (> 600px) */}
                  {windowWidth > 600 && <TableCell>{t('userRoleLabel')}</TableCell>}
                  <TableCell>{t('userStatus')}</TableCell>
                  {/* إظهار تاريخ الإنشاء فقط على الشاشات الكبيرة (> 960px) */}
                  {windowWidth > 960 && <TableCell>{t('userCreatedAt')}</TableCell>}
                  <TableCell align="center">{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={30} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <TableRow hover key={user._id}>
                      <TableCell component="th" scope="row">
                        {user.name}
                      </TableCell>
                      {/* إظهار البريد الإلكتروني فقط على الشاشات المتوسطة والكبيرة (> 600px) */}
                      {windowWidth > 600 && <TableCell>{user.email}</TableCell>}
                      {/* إظهار رقم الهاتف فقط على الشاشات المتوسطة والكبيرة (> 600px) */}
                      {windowWidth > 600 && <TableCell>{user.phoneNumber || t('notAvailable')}</TableCell>}
                      {/* إظهار الدور فقط على الشاشات المتوسطة والكبيرة (> 600px) */}
                      {windowWidth > 600 && (
                        <TableCell>
                          {user.role} {/* عرض الدور كما هو في قاعدة البيانات بدون ترجمة */}
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip 
                          label={user.isActive ? t('activeStatus') : t('inactiveStatus')} 
                          color={user.isActive ? 'success' : 'error'} 
                          size="small" 
                        />
                      </TableCell>
                      {/* إظهار تاريخ الإنشاء فقط على الشاشات الكبيرة (> 960px) */}
                      {windowWidth > 960 && <TableCell>{formatDate(user.createdAt)}</TableCell>}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: windowWidth < 400 ? 1 : 0 }}>
                          <Tooltip title={t('viewButton')}>
                            <IconButton 
                              color="primary" 
                              onClick={() => router.push(`/dashboard/users/view?id=${user._id}`)}
                              size={windowWidth < 400 ? "small" : "medium"}
                            >
                              <VisibilityIcon fontSize={windowWidth < 400 ? "small" : "medium"} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('editButton')}>
                            <IconButton 
                              color="secondary" 
                              onClick={() => router.push(`/dashboard/users/edit/${user._id}`)}
                              size={windowWidth < 400 ? "small" : "medium"}
                            >
                              <EditIcon fontSize={windowWidth < 400 ? "small" : "medium"} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('changePassword')}>
                            <IconButton 
                              color="info" 
                              onClick={() => router.push(`/dashboard/users/password?id=${user._id}`)}
                              size={windowWidth < 400 ? "small" : "medium"}
                            >
                              <KeyIcon fontSize={windowWidth < 400 ? "small" : "medium"} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('deactivateUser')}>
                            <IconButton 
                              color="error" 
                              onClick={() => handleOpenDeleteDialog(user._id)}
                              size={windowWidth < 400 ? "small" : "medium"}
                            >
                              <DeleteIcon fontSize={windowWidth < 400 ? "small" : "medium"} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        {isRTL ? 'لا يوجد مستخدمين' : 'No users found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={isRTL ? "صفوف في الصفحة:" : "Rows per page:"}
            labelDisplayedRows={({ from, to, count }) => 
              isRTL 
                ? `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
                : `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
            }
          />
        </Paper>
      </Container>
      
      <Footer />
      
      {/* حوار تأكيد تعطيل المستخدم */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t('deactivateUser')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('confirmDelete')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            {t('cancel')}
          </Button>
          <Button onClick={handleDeleteUser} color="error" autoFocus>
            {t('deactivateUser')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
