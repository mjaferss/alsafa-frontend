import React, { ReactNode } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

interface PageHeaderProps {
  title: string;
  buttonText?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
  backButtonText?: string;
  onBackButtonClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  buttonText,
  buttonIcon,
  onButtonClick,
  backButtonText,
  onBackButtonClick
}) => {
  return (
    <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'transparent', border: 'none' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
        <Box>
          {backButtonText && onBackButtonClick && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBack />}
              onClick={onBackButtonClick}
              sx={{ mr: 1 }}
            >
              {backButtonText}
            </Button>
          )}
          {buttonText && onButtonClick && (
            <Button
              variant="contained"
              color="primary"
              startIcon={buttonIcon}
              onClick={onButtonClick}
            >
              {buttonText}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default PageHeader;
