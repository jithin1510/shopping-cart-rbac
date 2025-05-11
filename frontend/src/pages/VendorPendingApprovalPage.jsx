import React, { useEffect } from 'react';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectLoggedInUser, logoutAsync } from '../features/auth/AuthSlice';
import PendingIcon from '@mui/icons-material/Pending';
import Lottie from 'lottie-react';
import { loadingAnimation } from '../assets';

const VendorPendingApprovalPage = () => {
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Redirect if not logged in or not a vendor
    if (!loggedInUser) {
      navigate('/login');
    } else if (loggedInUser.role !== 'vendor') {
      navigate('/');
    } else if (loggedInUser.isApproved) {
      // If vendor is approved, redirect to vendor dashboard
      navigate('/vendor/dashboard');
    }
  }, [loggedInUser, navigate]);

  const handleLogout = () => {
    dispatch(logoutAsync());
    navigate('/login');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Box sx={{ width: '200px', height: '200px', mb: 3 }}>
          <Lottie animationData={loadingAnimation} loop={true} />
        </Box>
        
        <PendingIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Vendor Account Pending Approval
        </Typography>
        
        <Typography variant="body1" paragraph align="center" sx={{ maxWidth: 600, mb: 3 }}>
          Thank you for registering as a vendor! Your account is currently under review by our admin team.
          You'll receive an email notification once your account has been approved.
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph align="center" sx={{ mb: 4 }}>
          This process typically takes 1-2 business days. If you have any questions,
          please contact our support team at support@mernshop.com
        </Typography>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleLogout}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </Paper>
    </Container>
  );
};

export default VendorPendingApprovalPage;