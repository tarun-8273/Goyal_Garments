// src/components/users/UsersTable.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon 
} from '@mui/icons-material';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';

const UsersTable = ({ users, totalCount, onEditUser }) => {
  const navigate = useNavigate();

  const handleViewUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      {/* Table header... */}
      
      {users.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Last Visit</TableCell>
                <TableCell>Amount Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.mobile}</TableCell>
                  <TableCell>{formatDate(user.lastVisit)}</TableCell>
                  <TableCell
                    sx={{
                      color: user.amountDue > 0 ? 'error.main' : 'inherit',
                      fontWeight: user.amountDue > 0 ? 'bold' : 'normal',
                    }}
                  >
                    {formatCurrency(user.amountDue)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.amountDue > 0 ? 'Unpaid' : 'Paid'} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleViewUser(user._id)}
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="warning"
                      size="small"
                      onClick={() => onEditUser(user)}
                      title="Edit User"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" align="center" sx={{ py: 4 }}>
          No users found matching your search criteria.
        </Typography>
      )}
    </Paper>
  );
};

export default UsersTable;