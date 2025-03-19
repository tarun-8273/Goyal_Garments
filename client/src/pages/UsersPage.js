// src/pages/UsersPage.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import UserSearchForm from '../components/users/UserSearchForm';
import UsersTable from '../components/users/UsersTable';
import UserEditModal from '../components/users/UserEditModal';
import AddUserDialog from '../components/users/AddUserDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import { getUsers } from '../services/userService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleSearch = (filters) => {
    // Search logic as before
  };
  
  const handleAddUser = () => {
    setOpenAddDialog(true);
  };
  
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenEditModal(true);
  };
  
  const handleDialogClose = () => {
    setOpenAddDialog(false);
  };
  
  const handleEditModalClose = () => {
    setOpenEditModal(false);
    setSelectedUser(null);
  };
  
  const handleUserAdded = () => {
    fetchUsers();
    setOpenAddDialog(false);
  };
  
  const handleUserUpdated = () => {
    fetchUsers();
    setOpenEditModal(false);
    setSelectedUser(null);
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }
  
  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">User Search</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddUser}
        >
          Add New Customer
        </Button>
      </Box>
      
      {error && <AlertMessage severity="error" message={error} />}
      
      <UserSearchForm onSearch={handleSearch} />
      
      <UsersTable 
        users={filteredUsers} 
        totalCount={filteredUsers.length}
        onEditUser={handleEditUser}
      />
      
      <AddUserDialog
        open={openAddDialog}
        onClose={handleDialogClose}
        onUserAdded={handleUserAdded}
      />
      
      {selectedUser && (
        <UserEditModal
          open={openEditModal}
          user={selectedUser}
          onClose={handleEditModalClose}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </Container>
  );
};

export default UsersPage;