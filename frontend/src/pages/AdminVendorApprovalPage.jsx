import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectLoggedInUser } from '../features/auth/AuthSlice';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { axiosi } from '../config/axios';
import { toast } from 'react-toastify';

const AdminVendorApprovalPage = () => {
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    // Redirect if not logged in or not an admin
    if (!loggedInUser) {
      navigate('/login');
    } else if (!loggedInUser.isAdmin && loggedInUser.role !== 'admin') {
      navigate('/');
    } else {
      fetchVendors();
    }
  }, [loggedInUser, navigate]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      // Using the axiosi instance which already has the base URL and credentials set up
      const response = await axiosi.get("users/vendors/all");
      console.log('Vendors response:', response.data);
      setVendors(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Failed to load vendors. Please try again later.');
      setLoading(false);
    }
  };

  const handleApproveReject = (vendor, action) => {
    setSelectedVendor(vendor);
    setActionType(action);
    setOpenDialog(true);
  };

  const handleConfirmAction = async () => {
    try {
      const isApproved = actionType === 'approve';
      await axiosi.patch(`users/vendors/approve/${selectedVendor._id}`, { isApproved });
      
      // Update local state
      setVendors(vendors.map(vendor => 
        vendor._id === selectedVendor._id 
          ? { ...vendor, isApproved } 
          : vendor
      ));
      
      toast.success(`Vendor ${isApproved ? 'approved' : 'rejected'} successfully`);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast.error('Failed to update vendor status. Please try again.');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Vendor Approval Management
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="body1" paragraph>
          Review and manage vendor registration requests. Approve vendors to allow them to sell products on the platform.
        </Typography>
      </Paper>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No vendors found
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => (
                <TableRow key={vendor._id}>
                  <TableCell>{vendor.name}</TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>
                    {vendor.isApproved ? (
                      <Chip 
                        label="Approved" 
                        color="success" 
                        size="small" 
                        icon={<CheckCircleIcon />} 
                      />
                    ) : (
                      <Chip 
                        label="Pending" 
                        color="warning" 
                        size="small" 
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {!vendor.isApproved ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small"
                          onClick={() => handleApproveReject(vendor, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="contained" 
                          color="error" 
                          size="small"
                          onClick={() => handleApproveReject(vendor, 'reject')}
                        >
                          Reject
                        </Button>
                      </Box>
                    ) : (
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleApproveReject(vendor, 'reject')}
                      >
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Vendor' : 'Reject Vendor'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'approve' 
              ? `Are you sure you want to approve ${selectedVendor?.name} as a vendor? They will be able to list and sell products on the platform.`
              : `Are you sure you want to ${selectedVendor?.isApproved ? 'revoke approval for' : 'reject'} ${selectedVendor?.name}? ${selectedVendor?.isApproved ? 'They will no longer be able to sell products.' : ''}`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleConfirmAction} 
            color={actionType === 'approve' ? 'success' : 'error'} 
            variant="contained"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminVendorApprovalPage;