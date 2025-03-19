import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import LoadingSpinner from "../components/common/LoadingSpinner";
import AlertMessage from "../components/common/AlertMessage";
import UserBillsTable from "../components/users/UserBillsTable";
import UserEditModal from "../components/users/UserEditModal";
import PaymentDialog from "../components/bills/PaymentDialog";
import { getUserById } from "../services/userService";
import { getBillsByUserId } from "../services/billService";
import { formatCurrency, formatDate } from "../utils/formatters";

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);

      // Fetch user details
      const userData = await getUserById(id);
      setUser(userData);

      // Fetch user's bills
      const billsData = await getBillsByUserId(id);
      setBills(billsData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Failed to load user details. Please try again.");
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/users");
  };

  const handleCreateBill = () => {
    if (id) {
      navigate(`/bills/new?userId=${id}`);
    } else {
      // If somehow we don't have a user ID, show an error
      setError("User ID is missing. Please try again.");
    }
  };

  const handlePayment = () => {
    setOpenPaymentDialog(true);
  };

  const handleEditUser = () => {
    setOpenEditModal(true);
  };

  const handlePaymentDialogClose = () => {
    setOpenPaymentDialog(false);
  };

  const handleEditModalClose = () => {
    setOpenEditModal(false);
  };

  const handleUserUpdated = () => {
    // Refresh user data after update
    fetchUserDetails();
    setOpenEditModal(false);
  };

  const handlePaymentSubmitted = () => {
    fetchUserDetails();
    setOpenPaymentDialog(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading user details..." />;
  }

  if (error) {
    return <AlertMessage severity="error" message={error} />;
  }

  if (!user) {
    return <AlertMessage severity="error" message="User not found" />;
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ mr: 2 }}
        >
          Back to Users
        </Button>
        <Typography variant="h4">User Details</Typography>
        <Button
          startIcon={<EditIcon />}
          onClick={handleEditUser}
          sx={{ ml: "auto" }}
        >
          Edit
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Mobile Number
                </Typography>
                <Typography variant="body1">{user.mobile}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Email Address
                </Typography>
                <Typography variant="body1">{user.email || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Address
                </Typography>
                <Typography variant="body1">{user.address || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Customer Since
                </Typography>
                <Typography variant="body1">
                  {formatDate(user.joinDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Last Visit
                </Typography>
                <Typography variant="body1">
                  {formatDate(user.lastVisit)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", md: "block" } }}
          />
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                p: 2,
              }}
            >
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Total Spent
              </Typography>
              <Typography variant="h5" gutterBottom>
                {formatCurrency(user.totalSpent)}
              </Typography>

              <Box sx={{ mt: 2, mb: 2 }}>
                <Divider sx={{ width: "100%" }} />
              </Box>

              <Typography variant="body2" color="textSecondary" gutterBottom>
                Amount Due
              </Typography>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: user.amountDue > 0 ? "error.main" : "success.main",
                  fontWeight: "bold",
                }}
              >
                {formatCurrency(user.amountDue)}
              </Typography>

              {user.amountDue > 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePayment}
                  sx={{ mt: 2 }}
                >
                  Record Payment
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Bills History</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateBill}
        >
          Create New Bill
        </Button>
      </Box>

      <UserBillsTable bills={bills} onRefresh={fetchUserDetails} />

      {openPaymentDialog && (
        <PaymentDialog
          open={openPaymentDialog}
          userId={id}
          userName={user.name}
          amountDue={user.amountDue}
          onClose={handlePaymentDialogClose}
          onPaymentSubmitted={handlePaymentSubmitted}
        />
      )}

      {openEditModal && (
        <UserEditModal
          open={openEditModal}
          user={user}
          onClose={handleEditModalClose}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </Container>
  );
};

export default UserDetailsPage;
