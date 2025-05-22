'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  CircularProgress
} from '@mui/material';
import { Add, Delete, Edit, Search, Visibility, CheckCircle, Cancel, Build } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import NoDataMessage from '@/components/NoDataMessage';
import PageHeader from '@/components/PageHeader';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClientOnly from '@/components/ClientOnly';

// تعريف نوع الشقة
interface Apartment {
  _id: string;
  number: string;
  code: string;
  type: string;
  totalAmount: number;
  isActive: boolean;
  department: {
    _id: string;
    name: string;
    code: string;
  };
  building: {
    _id: string;
    name: string;
    code: string;
  };
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

const ApartmentsPage = () => {
  const { translate, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  
  // حالة البيانات
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [filteredApartments, setFilteredApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // حالة الصفحات
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // حالة الحذف
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState<string | null>(null);
  
  // حالة التفعيل/التعطيل
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [apartmentToToggle, setApartmentToToggle] = useState<{ id: string, isActive: boolean } | null>(null);

  // ترجمة نوع الشقة
  const getApartmentTypeTranslation = (type: string) => {
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

  // جلب بيانات الشقق
  const fetchApartments = async () => {
    try {
      setLoading(true);
      
      // الحصول على التوكن من localStorage بشكل آمن
      const token = localStorage.getItem('token') || '';
      
      // التحقق من وجود التوكن قبل محاولة جلب البيانات
      if (!token) {
        console.log('لا يوجد توكن متاح - الرجاء تسجيل الدخول');
        setLoading(false);
        return;
      }
      
      // استخدام رابط API ثابت للاختبار
      const apiUrl = 'http://localhost:5000/api/apartments';
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setApartments(response.data.data);
        setFilteredApartments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching apartments:', error);
      toast.error(translate('errorFetchingApartments'));
    } finally {
      setLoading(false);
    }
  };
  
  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchApartments();
  }, []);

  // البحث في الشقق
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredApartments(apartments);
    } else {
      const filtered = apartments.filter(apartment => 
        apartment.code.toLowerCase().includes(value.toLowerCase()) ||
        apartment.number.toLowerCase().includes(value.toLowerCase()) ||
        apartment.building.name.toLowerCase().includes(value.toLowerCase()) ||
        apartment.department.name.toLowerCase().includes(value.toLowerCase()) ||
        getApartmentTypeTranslation(apartment.type).toLowerCase().includes(value.toLowerCase())
      );
      setFilteredApartments(filtered);
    }
  };

  // تغيير الصفحة
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // تغيير عدد الصفوف في الصفحة
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // فتح مربع حوار الحذف
  const handleOpenDeleteDialog = (id: string) => {
    setApartmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  // إغلاق مربع حوار الحذف
  const handleCloseDeleteDialog = () => {
    setApartmentToDelete(null);
    setDeleteDialogOpen(false);
  };

  // حذف الشقة
  const handleDeleteApartment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || '';
      
      const apiUrl = `http://localhost:5000/api/apartments/${apartmentToDelete}`;
      const response = await axios.delete(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success(translate('apartmentDeletedSuccess'));
        fetchApartments();
      }
    } catch (error) {
      console.error('Error deleting apartment:', error);
      toast.error(translate('errorDeletingApartment'));
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  // فتح مربع حوار التفعيل/التعطيل
  const handleOpenToggleDialog = (id: string, isActive: boolean) => {
    setApartmentToToggle({ id, isActive });
    setToggleDialogOpen(true);
  };

  // إغلاق مربع حوار التفعيل/التعطيل
  const handleCloseToggleDialog = () => {
    setApartmentToToggle(null);
    setToggleDialogOpen(false);
  };

  // تفعيل/تعطيل الشقة
  const handleToggleApartmentActive = async () => {
    if (!apartmentToToggle) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || '';
      
      const apiUrl = `http://localhost:5000/api/apartments/${apartmentToToggle.id}/toggle-active`;
      const response = await axios.put(
        apiUrl,
        {},  // لا نحتاج لإرسال بيانات لأن التبديل يتم في الخلفية
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        toast.success(
          apartmentToToggle.isActive
            ? translate('apartmentDeactivatedSuccess')
            : translate('apartmentActivatedSuccess')
        );
        fetchApartments();
      }
    } catch (error) {
      console.error('Error toggling apartment status:', error);
      toast.error(translate('errorTogglingApartmentStatus'));
    } finally {
      setLoading(false);
      handleCloseToggleDialog();
    }
  };

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

  // تحضير محتوى التحميل
  const loadingContent = (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
  
  // التحقق من وجود المستخدم
  if (!user) {
    return loadingContent;
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
      
      <ClientOnly fallback={loadingContent}>
      <Container maxWidth="lg" sx={{ mt: 12, mb: 8, flexGrow: 1 }}>
        <PageHeader
          title={translate('apartments')}
          buttonText={translate('addApartment')}
          buttonIcon={<Add />}
          onButtonClick={() => router.push('/dashboard/apartments/add')}
        />

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={translate('searchApartments')}
                    value={searchTerm}
                    onChange={handleSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {filteredApartments.length === 0 ? (
          <NoDataMessage message={translate('noApartmentsFound')} />
        ) : (
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', overflowX: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{translate('apartmentNumber')}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{translate('buildingName')}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{translate('departmentName')}</TableCell>
                    <TableCell>{translate('apartmentType')}</TableCell>
                    <TableCell>{translate('status')}</TableCell>
                    <TableCell align="center">{translate('actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApartments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((apartment) => (
                      <TableRow hover key={apartment._id}>
                        <TableCell>{apartment.number}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{apartment.building.name}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{apartment.department.name}</TableCell>
                        <TableCell>{getApartmentTypeTranslation(apartment.type)}</TableCell>
                        <TableCell>
                          {apartment.isActive ? (
                            <Chip
                              label={translate('active')}
                              color="success"
                              size="small"
                              icon={<CheckCircle fontSize="small" />}
                            />
                          ) : (
                            <Chip
                              label={translate('inactive')}
                              color="error"
                              size="small"
                              icon={<Cancel fontSize="small" />}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title={translate('view')}>
                              <IconButton
                                color="info"
                                onClick={() => router.push(`/dashboard/apartments/view/${apartment._id}`)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            
                            {user && (user.role === 'مدير' || user.role === 'مشرف') && (
                              <>
                                <Tooltip title={translate('edit')}>
                                  <IconButton
                                    color="primary"
                                    onClick={() => router.push(`/dashboard/apartments/edit/${apartment._id}`)}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title={apartment.isActive ? translate('deactivate') : translate('activate')}>
                                  <IconButton
                                    color={apartment.isActive ? "error" : "success"}
                                    onClick={() => handleOpenToggleDialog(apartment._id, apartment.isActive)}
                                  >
                                    {apartment.isActive ? <Cancel /> : <CheckCircle />}
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title={translate('createMaintenanceRequest')}>
                                  <IconButton
                                    color="secondary"
                                    onClick={() => router.push(`/dashboard/maintenance-requests/add?apartmentId=${apartment._id}`)}
                                  >
                                    <Build />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            
                            {user && user.role === 'مدير' && (
                              <Tooltip title={translate('delete')}>
                                <IconButton
                                  color="error"
                                  onClick={() => handleOpenDeleteDialog(apartment._id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredApartments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage={translate('rowsPerPage')}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} ${translate('of')} ${count}`}
            />
          </Paper>
        )}

        {/* مربع حوار حذف الشقة */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
        >
          <DialogTitle>{translate('confirmDelete')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {translate('confirmDeleteApartmentMessage')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              {translate('cancel')}
            </Button>
            <Button onClick={handleDeleteApartment} color="error" autoFocus>
              {translate('delete')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* مربع حوار تفعيل/تعطيل الشقة */}
        <Dialog
          open={toggleDialogOpen}
          onClose={handleCloseToggleDialog}
        >
          <DialogTitle>
            {apartmentToToggle?.isActive
              ? translate('deactivateApartment')
              : translate('activateApartment')}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {apartmentToToggle?.isActive
                ? translate('confirmDeactivateApartmentMessage')
                : translate('confirmActivateApartmentMessage')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseToggleDialog} color="primary">
              {translate('cancel')}
            </Button>
            <Button
              onClick={handleToggleApartmentActive}
              color={apartmentToToggle?.isActive ? "error" : "success"}
              autoFocus
            >
              {apartmentToToggle?.isActive
                ? translate('deactivate')
                : translate('activate')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      </ClientOnly>
      
      <Footer />
    </Box>
  );
};

export default ApartmentsPage;