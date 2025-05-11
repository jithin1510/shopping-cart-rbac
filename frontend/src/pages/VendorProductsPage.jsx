import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectLoggedInUser } from '../features/auth/AuthSlice';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RestoreIcon from '@mui/icons-material/Restore';
import axios from 'axios';
import { toast } from 'react-toastify';

const VendorProductsPage = () => {
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [actionType, setActionType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Redirect if not logged in or not a vendor or not approved
    if (!loggedInUser) {
      navigate('/login');
    } else if (loggedInUser.role !== 'vendor') {
      navigate('/');
    } else if (!loggedInUser.isApproved) {
      navigate('/vendor/pending-approval');
    } else {
      fetchVendorProducts();
    }
  }, [loggedInUser, navigate]);

  const fetchVendorProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products/vendor/my-products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again later.');
      setLoading(false);
    }
  };

  const handleEdit = (productId) => {
    navigate(`/product-update/${productId}`);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setActionType('delete');
    setOpenDialog(true);
  };

  const handleRestore = (product) => {
    setSelectedProduct(product);
    setActionType('restore');
    setOpenDialog(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (actionType === 'delete') {
        await axios.delete(`/api/products/${selectedProduct._id}`);
        // Update local state
        setProducts(products.map(product => 
          product._id === selectedProduct._id 
            ? { ...product, isDeleted: true } 
            : product
        ));
        toast.success('Product deleted successfully');
      } else if (actionType === 'restore') {
        await axios.patch(`/api/products/undelete/${selectedProduct._id}`);
        // Update local state
        setProducts(products.map(product => 
          product._id === selectedProduct._id 
            ? { ...product, isDeleted: false } 
            : product
        ));
        toast.success('Product restored successfully');
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product. Please try again.');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Products
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/add-product')}
        >
          Add New Product
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {filteredProducts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" color="text.secondary">
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {searchTerm ? 'Try a different search term' : 'Start by adding your first product'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  opacity: product.isDeleted ? 0.6 : 1,
                  position: 'relative'
                }}
              >
                {product.isDeleted && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      zIndex: 1
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'white', 
                        backgroundColor: 'rgba(0,0,0,0.7)', 
                        px: 2, 
                        py: 1, 
                        borderRadius: 1 
                      }}
                    >
                      DELETED
                    </Typography>
                  </Box>
                )}
                <CardMedia
                  component="img"
                  height="140"
                  image={product.thumbnail}
                  alt={product.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {product.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.description.substring(0, 100)}...
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${product.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Stock: {product.stockQuantity}
                  </Typography>
                </CardContent>
                <CardActions>
                  {product.isDeleted ? (
                    <Button 
                      startIcon={<RestoreIcon />} 
                      size="small" 
                      color="primary"
                      onClick={() => handleRestore(product)}
                      fullWidth
                    >
                      Restore
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(product._id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(product)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {actionType === 'delete' ? 'Delete Product' : 'Restore Product'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'delete' 
              ? `Are you sure you want to delete "${selectedProduct?.title}"? This will hide the product from customers but can be restored later.`
              : `Are you sure you want to restore "${selectedProduct?.title}"? This will make the product visible to customers again.`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleConfirmAction} 
            color={actionType === 'delete' ? 'error' : 'primary'} 
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

export default VendorProductsPage;