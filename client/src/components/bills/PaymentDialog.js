import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { recordPayment } from '../../services/billService';
import { formatCurrency } from '../../utils/formatters';
import { getBillsByUserId } from '../../services/billService';

const PaymentDialog = ({ open, userId, userName, amountDue, onClose, onPaymentSubmitted }) => {
  const [amount, setAmount] = useState('');
  const [billId, setBillId] = useState('');
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [billsLoading, setBillsLoading] = useState(true);
  const [error, setError] = useState('');
  
  React.useEffect(() => {
    const fetchBills = async () => {
      try {
        setBillsLoading(true);
        const userBills = await getBillsByUserId(userId);
        const unpaidBills = userBills.filter(bill => bill.due > 0);
        setBills(unpaidBills);
        if (unpaidBills.length > 0) {
          setBillId(unpaidBills[0]._id);
        }
        setBillsLoading(false);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setBillsLoading(false);
      }
    };
    
    if (open && userId) {
      fetchBills();
    }
  }, [open, userId]);
  
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };
  
  const handleBillChange = (e) => {
    setBillId(e.target.value);
  };
  
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!amount || parseFloat(amount) <= 0) {
        setError('Please enter a valid payment amount');
        return;
      }
      
      if (!billId) {
        setError('Please select a bill to apply payment to');
        return;
      }
      
      setLoading(true);
      setError('');
      
      await recordPayment(billId, parseFloat(amount));
      
      onPaymentSubmitted();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to record payment');
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Record Payment</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="subtitle1" gutterBottom>
          Customer: {userName}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Total Amount Due: {formatCurrency(amountDue)}
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          {billsLoading ? (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress size={24} />
            </Box>
          ) : bills.length > 0 ? (
            <>
              <TextField
                select
                label="Select Bill to Pay"
                value={billId}
                onChange={handleBillChange}
                fullWidth
                sx={{ mb: 2 }}
                SelectProps={{
                  native: true,
                }}
              >
                {bills.map((bill) => (
                  <option key={bill._id} value={bill._id}>
                    Bill #{bill._id.slice(-5)} - Due: {formatCurrency(bill.due)}
                  </option>
                ))}
              </TextField>
              
              <TextField
                label="Payment Amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: '₹',
                }}
                placeholder="0.00"
              />
            </>
          ) : (
            <Typography>No unpaid bills found for this customer.</Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || billsLoading || bills.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Record Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;