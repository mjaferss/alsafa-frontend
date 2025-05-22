import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  const { translate } = useLanguage();
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      width="100%"
      p={3}
    >
      <CircularProgress color="primary" />
      <Typography variant="body1" sx={{ mt: 2 }}>
        {message || translate('loading')}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
