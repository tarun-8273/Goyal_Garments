import React, { forwardRef } from 'react';
import { formatCurrency, formatDate, calculateBillTotals } from '../../utils/formatters';

const BillPrintView = forwardRef(({ bill, user }, ref) => {
  const { subtotal, tax, total } = calculateBillTotals(bill.items);
  
  return (
    <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>Fashion Clothing Store</h2>
          <p style={{ margin: '0 0 3px 0' }}>123, Main Street, City</p>
          <p style={{ margin: '0 0 3px 0' }}>Phone: +91 9876543210</p>
          <p style={{ margin: '0 0 3px 0' }}>Email: contact@fashionstore.com</p>
          <p style={{ margin: '0 0 3px 0' }}>GST: 22AAAAA0000A1Z5</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: '0 0 5px 0' }}>INVOICE</h2>
          <p style={{ margin: '0 0 3px 0' }}>Bill #: {bill._id || 'New Bill'}</p>
          <p style={{ margin: '0 0 3px 0' }}>Date: {formatDate(new Date())}</p>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Customer Details:</h3>
        <p style={{ margin: '0 0 3px 0' }}>Name: {user?.name}</p>
        <p style={{ margin: '0 0 3px 0' }}>Phone: {user?.mobile}</p>
        {user?.address && <p style={{ margin: '0 0 3px 0' }}>Address: {user.address}</p>}
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>Item</th>
            <th style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>Quantity</th>
            <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>Price</th>
            <th style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, index) => (
            <tr key={index}>
              <td style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>{item.name}</td>
              <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>{item.quantity}</td>
              <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>{formatCurrency(item.price)}</td>
              <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{ width: '300px', marginLeft: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Tax (GST 18%):</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingTop: '5px', borderTop: '1px solid #ddd' }}>
          <span style={{ fontWeight: 'bold' }}>Total:</span>
          <span style={{ fontWeight: 'bold' }}>{formatCurrency(total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Amount Paid:</span>
          <span>{formatCurrency(bill.paid || 0)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Balance Due:</span>
          <span style={{ color: total - (bill.paid || 0) > 0 ? '#d32f2f' : '#2e7d32' }}>
            {formatCurrency(Math.max(0, total - (bill.paid || 0)))}
          </span>
        </div>
      </div>
      
      {bill.notes && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ margin: '0 0 5px 0' }}>Notes:</h3>
          <p style={{ margin: '0', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>{bill.notes}</p>
        </div>
      )}
      
      <div style={{ marginTop: '50px', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '20px', color: '#666' }}>
        <p style={{ margin: '0' }}>Thank you for your business!</p>
      </div>
    </div>
  );
});

export default BillPrintView;