import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  MoneyOff as MoneyOffIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
      <Box display="flex" alignItems="center">
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            p: 2,
            borderRadius: '50%',
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const StatsCards = ({ stats }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<PeopleIcon sx={{ color: 'primary.main' }} />}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Today's Visitors"
          value={stats.todayVisitors}
          icon={<PersonAddIcon sx={{ color: 'info.main' }} />}
          color="info"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Pending Payments"
          value={formatCurrency(stats.pendingPayments)}
          icon={<MoneyOffIcon sx={{ color: 'error.main' }} />}
          color="error"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={<MoneyIcon sx={{ color: 'success.main' }} />}
          color="success"
        />
      </Grid>
    </Grid>
  );
};

export default StatsCards;