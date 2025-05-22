'use client';

import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  Avatar, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Language as LanguageIcon, 
  Dashboard as DashboardIcon, 
  People as PeopleIcon, 
  Apartment as ApartmentIcon, 
  Category as CategoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // التحقق من وجود بيانات المستخدم في localStorage
    if (typeof window !== 'undefined') {
      const storedUserName = localStorage.getItem('userName');
      const storedUserRole = localStorage.getItem('userRole');
      
      if (storedUserName) setUserName(storedUserName);
      if (storedUserRole) setUserRole(storedUserRole);
    }
  }, []);
  
  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleLanguageMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleLanguageChange = (newLanguage: 'ar' | 'en') => {
    setLanguage(newLanguage);
    handleLanguageMenuClose();
  };
  
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
    }
    router.push('/login');
  };
  
  // قائمة الروابط للقائمة الجانبية
  const drawerItems = [
    { text: t('dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { text: t('usersManagement'), icon: <PeopleIcon />, path: '/dashboard/users' },
    { text: t('totalProperties'), icon: <ApartmentIcon />, path: '/dashboard/apartments' },
    { text: t('totalDepartments'), icon: <CategoryIcon />, path: '/dashboard/departments' },
    { text: t('totalPurchases'), icon: <ShoppingCartIcon />, path: '/dashboard/purchases' },
    { text: t('systemSettings'), icon: <SettingsIcon />, path: '/dashboard/settings' },
  ];
  
  if (!mounted) {
    return null;
  }
  
  return (
    <>
      <AppBar position="static" sx={{ direction: isRTL ? 'rtl' : 'ltr' }}>
        <Toolbar>
          {userName && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              {t('welcome')}
            </Link>
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="language"
              onClick={handleLanguageMenuOpen}
            >
              <LanguageIcon />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleLanguageMenuClose}
            >
              <MenuItem onClick={() => handleLanguageChange('ar')}>
                {t('switchToArabic')}
              </MenuItem>
              <MenuItem onClick={() => handleLanguageChange('en')}>
                {t('switchToEnglish')}
              </MenuItem>
            </Menu>
            
            {userName ? (
              <>
                <Button
                  color="inherit"
                  onClick={handleUserMenuOpen}
                  startIcon={<Avatar sx={{ width: 24, height: 24 }}>{userName?.charAt(0)}</Avatar>}
                >
                  {!isMobile && userName}
                </Button>
                
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                >
                  <MenuItem onClick={() => router.push('/dashboard/profile')}>
                    <ListItemIcon>
                      <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('editProfile')}</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('logout')}</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" onClick={() => router.push('/login')}>
                {t('login')}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* القائمة الجانبية */}
      <Drawer
        anchor={isRTL ? 'right' : 'left'}
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{ '& .MuiDrawer-paper': { width: 240 } }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ width: 64, height: 64, mb: 1 }}>
            {userName?.charAt(0)}
          </Avatar>
          <Typography variant="subtitle1">{userName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {userRole === 'admin' ? t('admin') : userRole === 'supervisor' ? t('supervisor') : t('user')}
          </Typography>
        </Box>
        
        <Divider />
        
        <List>
          {drawerItems.map((item) => (
            <ListItem
              key={item.text}
              onClick={() => {
                router.push(item.path);
                setDrawerOpen(false);
              }}
              sx={{ cursor: 'pointer' }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        
        <Divider />
        
        <List>
          <ListItem onClick={handleLogout} sx={{ cursor: 'pointer' }}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t('logout')} />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Header;
