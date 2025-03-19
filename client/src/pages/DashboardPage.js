import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import StatsCards from '../components/dashboard/StatsCards';
import VisitorsChart from '../components/dashboard/VisitorsChart';
import PaymentStatusChart from '../components/dashboard/PaymentStatusChart';
import RecentUsersTable from '../components/dashboard/RecentUsersTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertMessage from '../components/common/AlertMessage';
import { getUserStats } from '../services/userService';
import { getUsers } from '../services/userService';
import { getChartData } from '../services/billService';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats
        const statsData = await getUserStats();
        setStats(statsData);
        
        // Fetch chart data
        const chartData = await getChartData();
        setChartData(chartData);
        
        // Fetch recent users (limit to 5)
        const usersData = await getUsers();
        setRecentUsers(usersData.slice(0, 5));
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return <LoadingSpinner message="Loading dashboard data..." />;
  }
  
  if (error) {
    return <AlertMessage severity="error" message={error} />;
  }
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}
      
      {/* Charts */}
      {chartData && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={7}>
            <VisitorsChart chartData={chartData.visitors} />
          </Grid>
          <Grid item xs={12} md={5}>
            <PaymentStatusChart chartData={chartData.payments} />
          </Grid>
        </Grid>
      )}
      
      {/* Recent Users Table */}
      {recentUsers.length > 0 && <RecentUsersTable users={recentUsers} />}
    </Container>
  );
};

export default DashboardPage;