'use client';

import { Box, Container, Typography, Button, Card, CardMedia, CardContent, Grid, Stack } from '@mui/material';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const skillfulWorkers = [
  {
    title: 'تصميم داخلي احترافي',
    image: '/assets/images/interior.jpg',
    description: 'فريق متخصص في التصميم الداخلي مع خبرة تزيد عن 10 سنوات في تصميم المساحات السكنية والتجارية'
  },
  {
    title: 'ديكور عصري',
    image: '/assets/images/decor.jpg',
    description: 'نقدم أحدث صيحات الديكور العصري مع لمسة من الأصالة العربية'
  },
  {
    title: 'إضاءة متميزة',
    image: '/assets/images/lighting.jpg',
    description: 'خبراء في تصميم وتركيب أنظمة الإضاءة الحديثة والموفرة للطاقة'
  }
];

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      {/* القسم الرئيسي */}
      <Box
        sx={{
          pt: { xs: 8, md: 15 },
          pb: 6,
          background: 'linear-gradient(45deg, #0052CC 30%, #4C9AFF 90%)',
          color: 'white',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.75rem' },
              fontWeight: 700,
              mb: 3
            }}
          >
            مرحباً بكم في صفا
          </Typography>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            sx={{ mb: 4, opacity: 0.9 }}
          >
            نقدم خدمات متكاملة في التصميم الداخلي والديكور والإضاءة
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            href="/contact"
            sx={{ 
              px: 4, 
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': { transform: 'translateY(-2px)' },
              transition: 'transform 0.2s'
            }}
          >
            تواصل معنا
          </Button>
        </Container>
      </Box>

      {/* قسم العمال المهرة */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ 
            mb: 4,
            fontWeight: 700,
            color: 'primary.main'
          }}
        >
          خدماتنا المتميزة
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          {skillfulWorkers.map((worker, index) => (
            <Box key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="240"
                  image={worker.image}
                  alt={worker.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {worker.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {worker.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>

      {/* قسم المميزات */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ 
              mb: 6,
              fontWeight: 700,
              color: 'primary.main'
            }}
          >
            لماذا تختار صفا؟
          </Typography>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={4}
            justifyContent="center"
          >
            <Box sx={{ flex: 1, textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'secondary.main', fontWeight: 600 }}>
                خبرة متميزة
              </Typography>
              <Typography>
                فريق متخصص من المصممين والفنيين ذوي الخبرة العالية في مجال التصميم والديكور
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'secondary.main', fontWeight: 600 }}>
                جودة عالية
              </Typography>
              <Typography>
                نستخدم أفضل الخامات والمواد لضمان جودة التنفيذ ومتانة التصميم
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ color: 'secondary.main', fontWeight: 600 }}>
                أسعار تنافسية
              </Typography>
              <Typography>
                نقدم أفضل الأسعار مع ضمان الجودة العالية والتنفيذ المتقن
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
