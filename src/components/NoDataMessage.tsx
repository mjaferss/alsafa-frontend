import React from 'react';
import { Box, Typography } from '@mui/material';
import { SentimentDissatisfied } from '@mui/icons-material';

interface NoDataMessageProps {
  message: string;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({ message }) => {
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
      <SentimentDissatisfied fontSize="large" color="action" />
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default NoDataMessage;
