'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Chip,
  Pagination,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  TableSortLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// تعريف واجهة القسم
interface Department {
  _id: string;
  name: string;
  code: string;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedAt: string | null;
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  } | null;
  isActive: boolean;
}

// تعريف واجهة المستخدم
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

// الصفحة الرئيسية للأقسام
const DepartmentsPage = () => {
  // استخدام سياق اللغة والمصادقة
  const { t, language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  
  // استخدام توجيه Next.js
  const router = useRouter();
  
  // حالة التحميل والمصادقة
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  
  // حالة الأقسام
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // حالة الترقيم
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // حالة الترتيب
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  
  // حالة الحذف
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState('');
  
  // حالة التفعيل/التعطيل
  const [openToggleDialog, setOpenToggleDialog] = useState(false);
  const [departmentToToggle, setDepartmentToToggle] = useState<Department | null>(null);
  
  // حالة الإشعارات
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // استخدام useState للتحكم في عرض المحتوى بعد التحميل على العميل
  const [mounted, setMounted] = useState(false);
  
  // استخدام useState للتحكم في عرض الأعمدة بناءً على حجم الشاشة
  const [windowWidth, setWindowWidth] = useState<number>(0);
  
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
  
  // التحقق من المستخدم وصلاحياته
  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        
        // التحقق من وجود المستخدم باستخدام سياق المصادقة
        if (!user) {
          router.push('/login');
          return;
        }
        
        // التحقق من دور المستخدم
        const userRole = user.role;
        setIsAdmin(userRole === 'admin' || userRole === 'مدير');
        setIsSupervisor(userRole === 'supervisor' || userRole === 'مشرف');
        
        // إعداد رأس الطلب
        let token = '';
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('token') || '';
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // الحصول على الأقسام
        await fetchDepartments(config);
      } catch (error) {
        console.error('Error checking user:', error);
        // إذا كان هناك خطأ في المصادقة، توجيه المستخدم إلى صفحة تسجيل الدخول
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    if (mounted) {
      checkUser();
    }
  }, [mounted, router, page, limit, orderBy, order]);
  
  // جلب الأقسام من الخادم
  const fetchDepartments = async (config: any) => {
    try {
      const response = await axios.get('http://localhost:5000/api/departments', config);
      setDepartments(response.data.data);
      setFilteredDepartments(response.data.data);
      setTotalDepartments(response.data.data.length);
    } catch (error) {
      console.error('Error fetching departments:', error);
      showSnackbar(t('errorFetchingDepartments'), 'error');
    }
  };
  
  // البحث في الأقسام
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDepartments(departments);
    } else {
      const filtered = departments.filter(
        (department) =>
          department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          department.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDepartments(filtered);
    }
  }, [searchTerm, departments]);
  
  // التعامل مع تغيير الصفحة
  const handleChangePage = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // التعامل مع طلب الترتيب
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // إظهار مربع حوار الحذف
  const showDeleteDialog = (id: string) => {
    setDepartmentToDelete(id);
    setOpenDeleteDialog(true);
  };
  
  // إغلاق مربع حوار الحذف
  const closeDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDepartmentToDelete('');
  };
  
  // حذف القسم
  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        showSnackbar(t('pleaseLogin'), 'error');
        router.push('/login');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`http://localhost:5000/api/departments/${departmentToDelete}`, config);
      
      // تحديث قائمة الأقسام
      const updatedDepartments = departments.filter(
        (department) => department._id !== departmentToDelete
      );
      setDepartments(updatedDepartments);
      setFilteredDepartments(updatedDepartments);
      
      showSnackbar(t('departmentDeletedSuccessfully'), 'success');
      closeDeleteDialog();
    } catch (error) {
      console.error('Error deleting department:', error);
      showSnackbar(t('errorDeletingDepartment'), 'error');
      closeDeleteDialog();
    }
  };
  
  // إظهار مربع حوار التفعيل/التعطيل
  const showToggleDialog = (department: Department) => {
    setDepartmentToToggle(department);
    setOpenToggleDialog(true);
  };
  
  // إغلاق مربع حوار التفعيل/التعطيل
  const closeToggleDialog = () => {
    setOpenToggleDialog(false);
    setDepartmentToToggle(null);
  };
  
  // تفعيل/تعطيل القسم
  const handleToggleDepartment = async () => {
    if (!departmentToToggle) return;
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        showSnackbar(t('pleaseLogin'), 'error');
        router.push('/login');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put(
        `http://localhost:5000/api/departments/${departmentToToggle._id}/toggle-active`,
        {},
        config
      );
      
      // تحديث القسم في القائمة
      const updatedDepartments = departments.map((department) =>
        department._id === departmentToToggle._id ? response.data.data : department
      );
      
      setDepartments(updatedDepartments);
      setFilteredDepartments(updatedDepartments);
      
      const message = departmentToToggle.isActive
        ? t('departmentDeactivatedSuccessfully')
        : t('departmentActivatedSuccessfully');
      
      showSnackbar(message, 'success');
      closeToggleDialog();
    } catch (error) {
      console.error('Error toggling department:', error);
      showSnackbar(t('errorTogglingDepartment'), 'error');
      closeToggleDialog();
    }
  };
  
  // إظهار إشعار
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // إغلاق الإشعار
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // إذا لم يكن المستخدم مديرًا، فلا تعرض الصفحة واعرض رسالة تحميل فقط
  if (!mounted || loading || authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // التحقق من وجود المستخدم
  if (!user) {
    router.push('/login');
    return null;
  }
  
  // Solo renderizar el contenido completo cuando el componente está montado en el cliente
  if (!mounted) {
    return null; // O un indicador de carga
  }
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('departments')}
        </Typography>
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          {/* حقل البحث */}
          <TextField
            label={t('search')}
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ flexGrow: 1, maxWidth: '300px' }}
          />
          
          {/* زر إضافة قسم جديد */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => router.push('/dashboard/departments/add')}
            sx={{
              fontWeight: 'bold',
              px: 2,
              py: 1,
              boxShadow: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
                bgcolor: 'primary.dark'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {t('addDepartment')}
          </Button>
        </Box>
        
        {/* جدول الأقسام */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    {t('name')}
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'code'}
                    direction={orderBy === 'code' ? order : 'asc'}
                    onClick={() => handleRequestSort('code')}
                  >
                    {t('code')}
                  </TableSortLabel>
                </TableCell>
                {windowWidth >= 960 && (
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'createdAt'}
                      direction={orderBy === 'createdAt' ? order : 'asc'}
                      onClick={() => handleRequestSort('createdAt')}
                    >
                      {t('createdAt')}
                    </TableSortLabel>
                  </TableCell>
                )}
                {windowWidth >= 600 && (
                  <TableCell>{t('createdBy')}</TableCell>
                )}
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'isActive'}
                    direction={orderBy === 'isActive' ? order : 'asc'}
                    onClick={() => handleRequestSort('isActive')}
                  >
                    {t('status')}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t('noDepartmentsFound')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((department) => (
                  <TableRow key={department._id}>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.code}</TableCell>
                    {windowWidth >= 960 && (
                      <TableCell>
                        {new Date(department.createdAt).toLocaleDateString(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }
                        )}
                      </TableCell>
                    )}
                    {windowWidth >= 600 && (
                      <TableCell>{department.createdBy?.name || '-'}</TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={department.isActive ? t('active') : t('inactive')}
                        color={department.isActive ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        {/* زر عرض القسم */}
                        <Tooltip title={t('view')}>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => router.push(`/dashboard/departments/view/${department._id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {/* زر تعديل القسم */}
                        {(isAdmin || isSupervisor) && (
                          <Tooltip title={t('edit')}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => router.push(`/dashboard/departments/edit/${department._id}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {/* زر تفعيل/تعطيل القسم */}
                        {(isAdmin || isSupervisor) && (
                          <Tooltip title={department.isActive ? t('deactivate') : t('activate')}>
                            <IconButton
                              size="small"
                              color={department.isActive ? 'error' : 'success'}
                              onClick={() => showToggleDialog(department)}
                            >
                              {department.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {/* زر حذف القسم */}
                        {isAdmin && (
                          <Tooltip title={t('delete')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => showDeleteDialog(department._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* ترقيم الصفحات */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(totalDepartments / limit)}
            page={page}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>
      </Box>
      
      <Footer />
      
      {/* مربع حوار حذف القسم */}
      <Dialog open={openDeleteDialog} onClose={closeDeleteDialog}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('confirmDeleteDepartmentMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>{t('cancel')}</Button>
          <Button onClick={handleDeleteDepartment} color="error" autoFocus>
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* مربع حوار تفعيل/تعطيل القسم */}
      <Dialog open={openToggleDialog} onClose={closeToggleDialog}>
        <DialogTitle>
          {departmentToToggle?.isActive ? t('deactivateDepartment') : t('activateDepartment')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {departmentToToggle?.isActive
              ? t('confirmDeactivateDepartmentMessage')
              : t('confirmActivateDepartmentMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeToggleDialog}>{t('cancel')}</Button>
          <Button
            onClick={handleToggleDepartment}
            color={departmentToToggle?.isActive ? 'error' : 'success'}
            autoFocus
          >
            {departmentToToggle?.isActive ? t('deactivate') : t('activate')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* إشعار */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DepartmentsPage;
