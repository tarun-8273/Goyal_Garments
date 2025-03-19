import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { useReactToPrint } from "react-to-print";
import LoadingSpinner from "../components/common/LoadingSpinner";
import AlertMessage from "../components/common/AlertMessage";
import StatusBadge from "../components/common/StatusBadge";
import BillPrintView from "../components/bills/BillPrintView";
import { getUserById } from "../services/userService";
import { getUsers } from "../services/userService";
import { getBillById, createBill, updateBill } from "../services/billService";
import { formatCurrency } from "../utils/formatters";
import { calculateBillTotals } from "../utils/formatters";

const BillFormPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const printRef = useRef();

  // Determine if this is a new bill based on the URL path
  const isNewBill = location.pathname === "/bills/new";

  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const preselectedUserId = queryParams.get("userId");

  const [bill, setBill] = useState({
    userId: preselectedUserId || "",
    items: [{ name: "", quantity: 1, price: 0, total: 0 }],
    paid: 0,
    notes: "",
  });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, [location.pathname, params.id, preselectedUserId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all users for selection
      const usersData = await getUsers();
      setUsers(usersData || []);

      if (!isNewBill && params.id) {
        // Fetch existing bill data
        try {
          const billData = await getBillById(params.id);

          setBill({
            userId: billData.user?._id || "",
            items:
              billData.items?.map((item) => ({
                ...item,
                total: item.price * item.quantity,
              })) || [],
            paid: billData.paid || 0,
            notes: billData.notes || "",
            _id: billData._id,
            amount: billData.amount || 0,
            due: billData.due || 0,
            status: billData.status || "Unpaid",
          });

          // Set selected user
          if (billData.user?._id) {
            try {
              const user = await getUserById(billData.user._id);
              setSelectedUser(user);
            } catch (userError) {
              console.error("Error fetching user details:", userError);
            }
          }
        } catch (billError) {
          console.error("Error fetching bill:", billError);
          setError("Error loading bill data. Please try again.");
        }
      } else if (preselectedUserId) {
        // For new bill with preselected user
        try {
          const user = await getUserById(preselectedUserId);
          if (user) {
            setSelectedUser(user);
            // Make sure we update the bill object with the user ID
            setBill((prev) => ({
              ...prev,
              userId: preselectedUserId,
            }));
          }
        } catch (userError) {
          console.error("Error fetching preselected user:", userError);
        }
      }

      // If it's a new bill, always ensure we have at least one empty item
      if (isNewBill) {
        setBill((prev) => ({
          ...prev,
          items:
            prev.items && prev.items.length > 0
              ? prev.items
              : [{ name: "", quantity: 1, price: 0, total: 0 }],
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (selectedUser) {
      navigate(`/users/${selectedUser._id}`);
    } else {
      navigate("/users");
    }
  };

  const handleUserChange = async (e) => {
    const userId = e.target.value;
    setBill((prev) => ({ ...prev, userId }));

    try {
      const user = await getUserById(userId);
      setSelectedUser(user);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...bill.items];
    updatedItems[index][field] = value;

    // Recalculate total if quantity or price changes
    if (field === "quantity" || field === "price") {
      updatedItems[index].total =
        updatedItems[index].quantity * updatedItems[index].price;
    }

    setBill((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = () => {
    setBill((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, price: 0, total: 0 }],
    }));
  };

  const handleRemoveItem = (index) => {
    const updatedItems = bill.items.filter((_, i) => i !== index);
    setBill((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBill((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!bill.userId) {
        setError("Please select a customer");
        return;
      }

      if (bill.items.length === 0 || bill.items.some((item) => !item.name)) {
        setError("Please add at least one item with a name");
        return;
      }

      setSubmitting(true);
      setError("");

      // Format the bill data
      const billData = {
        userId: bill.userId,
        items: bill.items,
        paid: parseFloat(bill.paid) || 0,
        notes: bill.notes || "",
      };

      if (isNewBill) {
        await createBill(billData);
      } else if (params.id) {
        await updateBill(params.id, billData);
      } else {
        throw new Error("Cannot determine if creating or updating a bill");
      }

      // Navigate back to user details
      navigate(`/users/${bill.userId}`);
    } catch (error) {
      console.error("Error saving bill:", error);

      if (error.response) {
        console.error("Server response:", error.response.data);
      }

      setError(
        error.response?.data?.message || error.message || "Failed to save bill"
      );
      setSubmitting(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  // Calculate bill totals
  const { subtotal, tax, total } = calculateBillTotals(bill.items);

  if (loading) {
    return <LoadingSpinner message="Loading bill data..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">
          {isNewBill ? "Create New Bill" : "Edit Bill"}
        </Typography>
      </Box>

      {error && (
        <AlertMessage severity="error" message={error} sx={{ mb: 3 }} />
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Select Customer"
              value={bill.userId}
              onChange={handleUserChange}
              fullWidth
              disabled={!isNewBill || submitting}
            >
              {users.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.name} ({user.mobile})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {!isNewBill && bill.status && (
            <Grid item xs={12} md={6}>
              <Box display="flex" justifyContent="flex-end" alignItems="center">
                <Typography variant="subtitle1" mr={2}>
                  Status:
                </Typography>
                <StatusBadge status={bill.status} />
              </Box>
            </Grid>
          )}

          {selectedUser && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Customer Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="textSecondary">
                      Name
                    </Typography>
                    <Typography variant="body1">{selectedUser.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="textSecondary">
                      Mobile
                    </Typography>
                    <Typography variant="body1">
                      {selectedUser.mobile}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="textSecondary">
                      Outstanding Balance
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color:
                          selectedUser.amountDue > 0 ? "error.main" : "inherit",
                        fontWeight:
                          selectedUser.amountDue > 0 ? "bold" : "normal",
                      }}
                    >
                      {formatCurrency(selectedUser.amountDue)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Bill Items</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              disabled={submitting}
            >
              Add Item
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="40%">Item Name</TableCell>
                  <TableCell align="center" width="15%">
                    Quantity
                  </TableCell>
                  <TableCell align="right" width="20%">
                    Price
                  </TableCell>
                  <TableCell align="right" width="20%">
                    Total
                  </TableCell>
                  <TableCell align="center" width="5%">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bill.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={item.name || ""}
                        onChange={(e) =>
                          handleItemChange(index, "name", e.target.value)
                        }
                        placeholder="Item name"
                        size="small"
                        disabled={submitting}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={item.quantity || 1}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        InputProps={{ inputProps: { min: 1 } }}
                        size="small"
                        sx={{ width: "80px" }}
                        disabled={submitting}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        value={item.price || 0}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                        size="small"
                        sx={{ width: "120px" }}
                        disabled={submitting}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.total || 0)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                        disabled={bill.items.length <= 1 || submitting}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Notes"
                name="notes"
                value={bill.notes || ""}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
                disabled={submitting}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  width="300px"
                  mb={1}
                >
                  <Typography>Subtotal:</Typography>
                  <Typography>{formatCurrency(subtotal)}</Typography>
                </Box>
                {/* <Box display="flex" justifyContent="space-between" width="300px" mb={1}>
                  <Typography>Tax (GST 18%):</Typography>
                  <Typography>{formatCurrency(tax)}</Typography>
                </Box> */}
                <Divider sx={{ width: "300px", my: 1 }} />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  width="300px"
                  mb={2}
                >
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">
                    {formatCurrency(subtotal)}
                  </Typography>{" "}
                  {/* Use subtotal directly instead of total */}
                </Box>

                <TextField
                  label="Amount Paid"
                  name="paid"
                  type="number"
                  value={bill.paid || 0}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  sx={{ width: "300px", mb: 2 }}
                  disabled={submitting}
                />

                <Box
                  display="flex"
                  justifyContent="space-between"
                  width="300px"
                >
                  <Typography variant="subtitle1">Due:</Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color:
                        subtotal - (parseFloat(bill.paid) || 0) > 0
                          ? "error.main"
                          : "success.main",
                      fontWeight: "bold",
                    }}
                  >
                    {formatCurrency(
                      Math.max(0, subtotal - (parseFloat(bill.paid) || 0))
                    )}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Box display="flex" justifyContent="flex-end" gap={2} mb={4}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          disabled={submitting}
        >
          Cancel
        </Button>

        {!isNewBill && (
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            disabled={submitting}
          >
            Print
          </Button>
        )}

        <Button
          variant="contained"
          color="primary"
          startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {isNewBill ? "Create Bill" : "Save Changes"}
        </Button>
      </Box>

      <div style={{ display: "none" }}>
        <BillPrintView ref={printRef} bill={bill} user={selectedUser} />
      </div>
    </Container>
  );
};

export default BillFormPage;
