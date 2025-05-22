'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
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
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// نوع بيانات المبنى
interface Building {
  _id: string;
  name: string;
  code: string;
  lastRecordedCost: number;
  maintenanceCost: number;
  isActive: boolean;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
  };
  updatedAt: string | null;
  updatedBy: {
    _id: string;
    name: string;
  } | null;
}

// نوع حالة الفرز
interface SortState {
  field: keyof Building | '';
  direction: 'asc' | 'desc';
}

// صفحة عرض المباني
const BuildingsPage = () => {
  // استخدام سياق اللغة
  const { t, language, isRTL } = useLanguage();
  
  // استخدام توجيه Next.js
  const router = useRouter();
  
  // حالة المباني
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // حالة التحميل والمصادقة
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // حالة الصفحات
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // حالة الفرز
  const [sort, setSort] = useState<SortState>({
    field: 'createdAt',
    direction: 'desc'
  });
  
  // حالة الحوارات
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  
  // حالة الإشعارات
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  
  // حالة عرض الشاشة
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  // التحقق من تحميل المكون
  useEffect(() => {
    setMounted(true);
    
    // إضافة مستمع لتغيير حجم النافذة
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // التحقق من المستخدم وصلاحياته وجلب بيانات المباني
  useEffect(() => {
    if (!mounted) return;
    
    const checkUser = async () => {
      try {
        // التحقق من وجود توكن في localStorage - فقط على جانب العميل
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
        
        // الحصول على معلومات المستخدم
        const userResponse = await axios.get('http://localhost:5000/api/users/me', config);
        
        // التحقق من دور المستخدم
        const userRole = userResponse.data.data.role;
        
        // التحقق من أن المستخدم هو مدير
        if (userRole !== 'مدير') {
          router.push('/dashboard');
          return;
        }
        
        setIsAdmin(userRole === 'مدير');
        setIsSupervisor(userRole === 'مشرف');
        
        // جلب بيانات المباني
        await fetchBuildings(config);
      } catch (error) {
        console.error('Error checking user:', error);
        
        // إذا كان هناك خطأ في المصادقة، توجيه المستخدم إلى صفحة تسجيل الدخول
        router.push('/login');
      }
    };
    
    if (mounted) {
      checkUser();
    }
  }, [mounted, router]);
  
  // جلب بيانات المباني من الخادم
  const fetchBuildings = async (config: any) => {
    try {
      setLoading(true);
      
      const response = await axios.get('http://localhost:5000/api/buildings', config);
      
      if (response.data.success) {
        setBuildings(response.data.data);
        setFilteredBuildings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
      setSnackbarMessage(t('errorFetchingBuildings'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  // تصفية المباني بناءً على مصطلح البحث
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBuildings(buildings);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = buildings.filter(building => 
        building.name.toLowerCase().includes(lowercasedTerm) ||
        building.code.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredBuildings(filtered);
    }
    
    // إعادة تعيين الصفحة عند البحث
    setPage(0);
  }, [searchTerm, buildings]);
  
  // معالجة تغيير مصطلح البحث
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  // معالجة الفرز
  const handleSort = (field: keyof Building) => {
    const isAsc = sort.field === field && sort.direction === 'asc';
    setSort({
      field,
      direction: isAsc ? 'desc' : 'asc'
    });
    
    // فرز المباني
    const sortedBuildings = [...filteredBuildings].sort((a, b) => {
      if (field === 'createdAt' || field === 'updatedAt') {
        const dateA = new Date(a[field] || 0).getTime();
        const dateB = new Date(b[field] || 0).getTime();
        return isAsc ? dateA - dateB : dateB - dateA;
      } else if (field === 'lastRecordedCost' || field === 'maintenanceCost') {
        return isAsc 
          ? (a[field] || 0) - (b[field] || 0) 
          : (b[field] || 0) - (a[field] || 0);
      } else {
        const valueA = String(a[field]).toLowerCase();
        const valueB = String(b[field]).toLowerCase();
        return isAsc 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
    });
    
    setFilteredBuildings(sortedBuildings);
  };
  
  // عرض حوار حذف المبنى
  const showDeleteDialog = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setDeleteDialogOpen(true);
  };
  
  // إغلاق حوار حذف المبنى
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedBuildingId('');
  };
  
  // حذف المبنى
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || !selectedBuildingId) {
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete(`http://localhost:5000/api/buildings/${selectedBuildingId}`, config);
      
      // تحديث قائمة المباني
      setBuildings(prevBuildings => prevBuildings.filter(building => building._id !== selectedBuildingId));
      
      // إظهار رسالة نجاح
      setSnackbarMessage(t('buildingDeletedSuccessfully'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting building:', error);
      setSnackbarMessage(t('errorDeletingBuilding'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      closeDeleteDialog();
    }
  };
  
  // عرض حوار تفعيل/تعطيل المبنى
  const showToggleDialog = (building: Building) => {
    setSelectedBuilding(building);
    setToggleDialogOpen(true);
  };
  
  // إغلاق حوار تفعيل/تعطيل المبنى
  const closeToggleDialog = () => {
    setToggleDialogOpen(false);
    setSelectedBuilding(null);
  };
  
  // تفعيل/تعطيل المبنى
  const handleToggleActive = async () => {
    try {
      if (!selectedBuilding) {
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`http://localhost:5000/api/buildings/${selectedBuilding._id}/toggle-active`, {}, config);
      
      // تحديث قائمة المباني
      setBuildings(prevBuildings => 
        prevBuildings.map(building => 
          building._id === selectedBuilding._id 
            ? { ...building, isActive: !building.isActive } 
            : building
        )
      );
      
      // إظهار رسالة نجاح
      setSnackbarMessage(
        selectedBuilding.isActive 
          ? t('buildingDeactivatedSuccessfully') 
          : t('buildingActivatedSuccessfully')
      );
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error toggling building status:', error);
      setSnackbarMessage(t('errorTogglingBuilding'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      closeToggleDialog();
    }
  };
  
  // إغلاق الإشعار
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // تنسيق التاريخ
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    );
  };
  
  // تنسيق المبلغ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };
  
  // عرض مؤشر التحميل إذا كان المكون غير محمل
  if (!mounted) {
    return null;
  }
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Header />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('buildings')}
          </Typography>
          
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => router.push('/dashboard/buildings/add')}
            >
              {t('addBuilding')}
            </Button>
          )}
        </Box>
        
        <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('search')}
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
          </Box>
          
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sort.field === 'name'}
                      direction={sort.field === 'name' ? sort.direction : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      {t('name')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sort.field === 'code'}
                      direction={sort.field === 'code' ? sort.direction : 'asc'}
                      onClick={() => handleSort('code')}
                    >
                      {t('code')}
                    </TableSortLabel>
                  </TableCell>
                  {windowWidth >= 600 && (
                    <TableCell align="center">
                      <TableSortLabel
                        active={sort.field === 'lastRecordedCost'}
                        direction={sort.field === 'lastRecordedCost' ? sort.direction : 'asc'}
                        onClick={() => handleSort('lastRecordedCost')}
                      >
                        {t('lastRecordedCost')}
                      </TableSortLabel>
                    </TableCell>
                  )}
                  {windowWidth >= 600 && (
                    <TableCell align="center">
                      <TableSortLabel
                        active={sort.field === 'maintenanceCost'}
                        direction={sort.field === 'maintenanceCost' ? sort.direction : 'asc'}
                        onClick={() => handleSort('maintenanceCost')}
                      >
                        {t('maintenanceCost')}
                      </TableSortLabel>
                    </TableCell>
                  )}
                  <TableCell align="center">
                    <TableSortLabel
                      active={sort.field === 'isActive'}
                      direction={sort.field === 'isActive' ? sort.direction : 'asc'}
                      onClick={() => handleSort('isActive')}
                    >
                      {t('status')}
                    </TableSortLabel>
                  </TableCell>
                  {windowWidth >= 960 && (
                    <TableCell align="center">
                      <TableSortLabel
                        active={sort.field === 'createdAt'}
                        direction={sort.field === 'createdAt' ? sort.direction : 'asc'}
                        onClick={() => handleSort('createdAt')}
                      >
                        {t('createdAt')}
                      </TableSortLabel>
                    </TableCell>
                  )}
                  <TableCell align="center">{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={windowWidth >= 960 ? 7 : (windowWidth >= 600 ? 6 : 4)} align="center">
                      <Typography variant="body1">{t('loading')}</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredBuildings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={windowWidth >= 960 ? 7 : (windowWidth >= 600 ? 6 : 4)} align="center">
                      <Typography variant="body1">{t('noBuildingsFound')}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBuildings
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(building => (
                      <TableRow key={building._id} hover>
                        <TableCell>{building.name}</TableCell>
                        <TableCell>{building.code}</TableCell>
                        {windowWidth >= 600 && (
                          <TableCell align="center">
                            {formatCurrency(building.lastRecordedCost)}
                          </TableCell>
                        )}
                        {windowWidth >= 600 && (
                          <TableCell align="center">
                            {formatCurrency(building.maintenanceCost)}
                          </TableCell>
                        )}
                        <TableCell align="center">
                          <Chip
                            label={building.isActive ? t('active') : t('inactive')}
                            color={building.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        {windowWidth >= 960 && (
                          <TableCell align="center">
                            {formatDate(building.createdAt)}
                          </TableCell>
                        )}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            {/* زر عرض المبنى */}
                            <Tooltip title={t('view')}>
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => router.push(`/dashboard/buildings/view/${building._id}`)}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            {/* زر تعديل المبنى */}
                            {isAdmin && (
                              <Tooltip title={t('edit')}>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => router.push(`/dashboard/buildings/edit/${building._id}`)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {/* زر تفعيل/تعطيل المبنى */}
                            {isAdmin && (
                              <Tooltip title={building.isActive ? t('deactivate') : t('activate')}>
                                <IconButton
                                  size="small"
                                  color={building.isActive ? 'error' : 'success'}
                                  onClick={() => showToggleDialog(building)}
                                >
                                  {building.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                            )}
                            
                            {/* زر حذف المبنى */}
                            {isAdmin && (
                              <Tooltip title={t('delete')}>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => showDeleteDialog(building._id)}
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
        </Paper>
      </Box>
      
      <Footer />
      
      {/* حوار حذف المبنى */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {t('delete')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {t('confirmDeleteBuildingMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            {t('cancel')}
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* حوار تفعيل/تعطيل المبنى */}
      <Dialog
        open={toggleDialogOpen}
        onClose={closeToggleDialog}
        aria-labelledby="toggle-dialog-title"
        aria-describedby="toggle-dialog-description"
      >
        <DialogTitle id="toggle-dialog-title">
          {selectedBuilding?.isActive ? t('deactivateBuilding') : t('activateBuilding')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="toggle-dialog-description">
            {selectedBuilding?.isActive
              ? t('confirmDeactivateBuildingMessage')
              : t('confirmActivateBuildingMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeToggleDialog} color="primary">
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleToggleActive} 
            color={selectedBuilding?.isActive ? 'error' : 'success'} 
            autoFocus
          >
            {selectedBuilding?.isActive ? t('deactivate') : t('activate')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* إشعارات */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BuildingsPage;
