// Format currency
export const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };
  
  // Format date
  export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };
  
  // Get status badge class
  export const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'partial':
        return 'warning';
      case 'unpaid':
        return 'danger';
      default:
        return 'secondary';
    }
  };
  
  // Calculate bill totals
  export const calculateBillTotals = (items) => {
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;
    
    return {
      subtotal,
      tax,
      total,
    };
  };