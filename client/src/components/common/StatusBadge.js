// src/components/common/StatusBadge.js
import React from 'react';
import { Chip } from '@mui/material';

const StatusBadge = ({ status }) => {
  // Make sure we're passing a valid color to the Chip component
  const getColor = () => {
    // Default to 'default' if status is undefined or null
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'warning';
      case 'unpaid':
        return 'error';
      default:
        return 'default'; // Always return a valid color
    }
  };

  return (
    <Chip 
      label={status || 'Unknown'} // Provide a fallback value
      color={getColor()} 
      size="small" 
      variant="outlined"
    />
  );
};

export default StatusBadge;