import { Box, Container, Grid, Typography, Link as MuiLink, IconButton } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { Facebook, Twitter, Instagram, WhatsApp, Phone, Email, LocationOn } from '@mui/icons-material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'white', py: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
          {/* معلومات الاتصال */}
          <Box>
            <Typography variant="h6" gutterBottom>اتصل بنا</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone fontSize="small" />
                <Typography>+966 50 000 0000</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Typography>info@safa.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography>المملكة العربية السعودية</Typography>
              </Box>
            </Box>
          </Box>

          {/* روابط سريعة */}
          <Box>
            <Typography variant="h6" gutterBottom>روابط سريعة</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink href="/privacy" color="inherit" underline="hover">سياسة الخصوصية</MuiLink>
              <MuiLink href="/terms" color="inherit" underline="hover">شروط الاستخدام</MuiLink>
              <MuiLink href="/contact" color="inherit" underline="hover">اتصل بنا</MuiLink>
            </Box>
          </Box>

          {/* السوشيال ميديا */}
          <Box>
            <Typography variant="h6" gutterBottom>تابعنا على</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton href="https://facebook.com" target="_blank" sx={{ color: 'white' }}>
                <Facebook />
              </IconButton>
              <IconButton href="https://twitter.com" target="_blank" sx={{ color: 'white' }}>
                <Twitter />
              </IconButton>
              <IconButton href="https://instagram.com" target="_blank" sx={{ color: 'white' }}>
                <Instagram />
              </IconButton>
              <IconButton href="https://whatsapp.com" target="_blank" sx={{ color: 'white' }}>
                <WhatsApp />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* حقوق النشر */}
        <Typography variant="body2" align="center" sx={{ mt: 4 }}>
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} صفا
        </Typography>
      </Container>
    </Box>
  );
}
