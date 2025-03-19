import React from "react";
import { useNavigate } from "react-router-dom";
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
  Box,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import StatusBadge from "../common/StatusBadge";
import { formatDate, formatCurrency } from "../../utils/formatters";

const UserBillsTable = ({ bills, onRefresh }) => {
  const navigate = useNavigate();

  const handleViewBill = (billId) => {
    navigate(`/bills/${billId}`);
  };

  const handleEditBill = (billId) => {
    navigate(`/bills/${billId}/edit`);
  };

  const handlePrintBill = (billId) => {
    navigate(`/bills/${billId}`);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      {bills.length > 0 ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bill No.</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Paid</TableCell>
                <TableCell align="right">Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bills.map((bill) => (
                <TableRow key={bill._id}>
                  <TableCell>#{bill._id.slice(-5)}</TableCell>
                  <TableCell>{formatDate(bill.createdAt)}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(bill.amount)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(bill.paid)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: bill.due > 0 ? "error.main" : "inherit",
                      fontWeight: bill.due > 0 ? "bold" : "normal",
                    }}
                  >
                    {formatCurrency(bill.due)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={bill.status} />
                  </TableCell>
                  <TableCell align="center">
                    <Box>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewBill(bill._id)}
                        title="View"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleEditBill(bill._id)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handlePrintBill(bill._id)}
                        title="Print"
                      >
                        <PrintIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" align="center" sx={{ py: 4 }}>
          No bills found for this customer.
        </Typography>
      )}
    </Paper>
  );
};

export default UserBillsTable;
