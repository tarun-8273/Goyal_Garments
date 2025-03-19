import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';

const RecentUsersTable = ({ users }) => {
  const navigate = useNavigate();

  const handleViewUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleViewAll = () => {
    navigate('/users');
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Recent Customers</Typography>
        <Button color="primary" onClick={handleViewAll}>
          View All
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Last Visit</TableCell>
              <TableCell>Amount Due</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Action</TableCell>
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
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RecentUsersTable;