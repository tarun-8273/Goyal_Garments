import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserDetailsPage from './pages/UserDetailsPage';
import BillFormPage from './pages/BillFormPage';
import SettingsPage from './pages/SettingsPage';

// Components
import Layout from './components/common/Layout';
import PrivateRoute from './components/common/PrivateRoute';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a6fdc',
    },
    secondary: {
      main: '#6c757d',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={
              <PrivateRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/users" element={
              <PrivateRoute>
                <Layout>
                  <UsersPage />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/users/:id" element={
              <PrivateRoute>
                <Layout>
                  <UserDetailsPage />
                </Layout>
              </PrivateRoute>
            } />
            
            {/* Important: The /new route must come before the /:id route */}
            <Route path="/bills/new" element={
              <PrivateRoute>
                <Layout>
                  <BillFormPage />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/bills/:id" element={
              <PrivateRoute>
                <Layout>
                  <BillFormPage />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/settings" element={
              <PrivateRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;