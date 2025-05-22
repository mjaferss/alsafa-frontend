import { AppBar, Toolbar, Button, Container, IconButton, Box, Typography } from '@mui/material';
import { Facebook, Twitter, Instagram, WhatsApp, Translate, Logout, Dashboard } from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Header() {
  // استخدام سياق اللغة
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  
  // التحقق من حالة تسجيل الدخول
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    }
  }, []);
  
  // تبديل اللغة
  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };
  
  // تسجيل الخروج
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      router.push('/login');
    }
  };
  
  return (
    <AppBar position="fixed" color="default" elevation={1} sx={{ bgcolor: 'background.paper', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* الشعار */}
          <Link href="/" passHref>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                صفا
              </Typography>
            </Box>
          </Link>

          {/* القائمة الرئيسية */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" href="/">{t('home')}</Button>
            <Button color="inherit" href="/contact">{t('contact')}</Button>
            <Button color="inherit" href="/privacy">{language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</Button>
            <Button color="inherit" href="/terms">{language === 'ar' ? 'شروط الاستخدام' : 'Terms of Use'}</Button>
            
            {mounted && isLoggedIn ? (
              <>
                <Button 
                  variant="contained" 
                  color="primary"
                  href="/dashboard"
                  startIcon={<Dashboard />}
                  sx={{ 
                    bgcolor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  {t('dashboard')}
                </Button>
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={handleLogout}
                  startIcon={<Logout />}
                  sx={{ 
                    borderColor: 'error.main',
                    '&:hover': { bgcolor: 'error.light', borderColor: 'error.dark' }
                  }}
                >
                  {isRTL ? 'تسجيل الخروج' : 'Logout'}
                </Button>
              </>
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                href="/login"
                sx={{ 
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                {t('login')}
              </Button>
            )}
          </Box>

          {/* زر تغيير اللغة وروابط السوشيال ميديا */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* زر تغيير اللغة */}
            <Button 
              onClick={toggleLanguage}
              startIcon={<Translate />}
              color="primary"
              size="small"
              sx={{ 
                minWidth: 'auto',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'primary.main',
                px: 1.5
              }}
            >
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>
            
            {/* روابط السوشيال ميديا */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <IconButton href="https://facebook.com" target="_blank" color="primary">
                <Facebook />
              </IconButton>
              <IconButton href="https://twitter.com" target="_blank" color="primary">
                <Twitter />
              </IconButton>
              <IconButton href="https://instagram.com" target="_blank" color="secondary">
                <Instagram />
              </IconButton>
              <IconButton href="https://whatsapp.com" target="_blank" sx={{ color: 'success.main' }}>
                <WhatsApp />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
