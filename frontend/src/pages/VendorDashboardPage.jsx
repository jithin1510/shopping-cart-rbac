import React, { useEffect } from 'react';
import { Box, Typography, Container, Grid, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectLoggedInUser } from '../features/auth/AuthSlice';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BarChartIcon from '@mui/icons-material/BarChart';

const VendorDashboardPage = () => {
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in or not a vendor or not approved
    if (!loggedInUser) {
      navigate('/login');
    } else if (loggedInUser.role !== 'vendor') {
      navigate('/');
    } else if (!loggedInUser.isApproved) {
      navigate('/vendor/pending-approval');
    }
  }, [loggedInUser, navigate]);

  const dashboardItems = [
    {
      title: 'Add New Product',
      icon: <AddIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      description: 'Create and list a new product for sale',
      action: () => navigate('/add-product')
    },
    {
      title: 'Manage Products',
      icon: <InventoryIcon sx={{ fontSize: 60, color: 'secondary.main' }} />,
      description: 'View, edit or delete your existing products',
      action: () => navigate('/vendor/products')
    },
    {
      title: 'Orders',
      icon: <LocalShippingIcon sx={{ fontSize: 60, color: 'success.main' }} />,
      description: 'Manage customer orders for your products',
      action: () => navigate('/vendor/orders')
    },
    {
      title: 'Analytics',
      icon: <BarChartIcon sx={{ fontSize: 60, color: 'warning.main' }} />,
      description: 'View sales statistics and performance metrics',
      action: () => navigate('/vendor/analytics')
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ mb: 4 }}>
        Vendor Dashboard
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Welcome back, {loggedInUser?.name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your products and monitor your sales from this dashboard.
          </Typography>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {dashboardItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: 240,
                borderRadius: 2,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {item.icon}
              </Box>
              <Typography variant="h6" component="h2" align="center" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2, flexGrow: 1 }}>
                {item.description}
              </Typography>
              <Button variant="contained" onClick={item.action} fullWidth>
                Go
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default VendorDashboardPage;