import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

const AlertMessage = ({ severity = 'info', title, message }) => {
  return (
    <Alert severity={severity} sx={{ mb: 2 }}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </Alert>
  );
};

export default AlertMessage;