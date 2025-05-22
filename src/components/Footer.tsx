'use client';

import React from 'react';
import { Box, Typography, Container, Link, Divider } from '@mui/material';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t, isRTL } = useLanguage();
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            {`© ${currentYear} `}
            <Link color="inherit" href="/">
              {t('welcome')}
            </Link>
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              mt: { xs: 2, sm: 0 },
            }}
          >
            <Link href="/" color="inherit" underline="hover">
              {t('home')}
            </Link>
            <Link href="/about" color="inherit" underline="hover">
              {t('about')}
            </Link>
            <Link href="/contact" color="inherit" underline="hover">
              {t('contact')}
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
