import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, Chip, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserInfo } from '../../user/UserSlice';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { selectCartItems } from '../../cart/CartSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TuneIcon from '@mui/icons-material/Tune';
import { selectProductIsFilterOpen, toggleFilters } from '../../products/ProductSlice';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';

export const Navbar = ({isProductList=false}) => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const userInfo = useSelector(selectUserInfo);
  const cartItems = useSelector(selectCartItems);
  const loggedInUser = useSelector(selectLoggedInUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  const wishlistItems = useSelector(selectWishlistItems);
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleToggleFilters = () => {
    dispatch(toggleFilters());
  };

  // Define settings based on user role
  let settings = [];
  let roleLabel = '';
  let roleIcon = null;
  let roleColor = '';
  
  if (loggedInUser?.role === 'admin' || loggedInUser?.isAdmin) {
    settings = [
      {name: "Dashboard", to: "/admin/dashboard"},
      {name: 'Vendor Approvals', to: "/admin/vendors"},
      {name: 'Orders', to: "/admin/orders"},
      {name: 'Add Product', to: "/admin/add-product"},
      {name: 'Logout', to: "/logout"},
    ];
    roleLabel = 'Admin';
    roleIcon = <AdminPanelSettingsIcon />;
    roleColor = 'error';
  } else if (loggedInUser?.role === 'vendor') {
    settings = [
      {name: "Dashboard", to: "/vendor/dashboard"},
      {name: 'My Products', to: "/vendor/products"},
      {name: 'Add Product', to: "/add-product"},
      {name: 'Profile', to: "/profile"},
      {name: 'Logout', to: "/logout"},
    ];
    roleLabel = 'Vendor';
    roleIcon = <StorefrontIcon />;
    roleColor = 'secondary';
  } else {
    settings = [
      {name: "Home", to: "/"},
      {name: 'Profile', to: "/profile"},
      {name: 'My orders', to: "/orders"},
      {name: 'Logout', to: "/logout"},
    ];
    roleIcon = <PersonIcon />;
    roleLabel = 'Customer';
    roleColor = 'primary';
  }

  return (
    <AppBar position="sticky" sx={{backgroundColor:"white", boxShadow:"none", color:"text.primary"}}>
        <Toolbar sx={{p:1, height:"4rem", display:"flex", justifyContent:"space-around"}}>
          <Typography 
            variant="h6" 
            noWrap 
            component="a" 
            href={loggedInUser?.role === 'vendor' ? '/vendor/dashboard' : loggedInUser?.role === 'admin' ? '/admin/dashboard' : '/'} 
            sx={{ 
              mr: 2, 
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700, 
              letterSpacing: '.3rem', 
              color: 'inherit', 
              textDecoration: 'none', 
            }}
          >
            MERN SHOP
          </Typography>

          <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'center'} columnGap={2}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={userInfo?.name} src="null" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
                  <Typography component={Link} color={'text.primary'} sx={{textDecoration:"none"}} to={setting.to} textAlign="center">{setting.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
            
            <Typography variant='h6' fontWeight={300}>
              {is480 ? `${userInfo?.name?.toString().split(" ")[0]}` : `Hey👋, ${userInfo?.name}`}
            </Typography>
            
            <Chip 
              icon={roleIcon} 
              label={roleLabel} 
              color={roleColor} 
              variant="outlined" 
              size="small"
            />
            
            <Stack sx={{flexDirection:"row", columnGap:"1rem", alignItems:"center", justifyContent:"center"}}>
              {/* Only show cart for customers */}
              {loggedInUser?.role === 'customer' && cartItems?.length > 0 && 
                <Badge badgeContent={cartItems.length} color='error'>
                  <IconButton onClick={() => navigate("/cart")}>
                    <ShoppingCartOutlinedIcon />
                  </IconButton>
                </Badge>
              }
              
              {/* Only show wishlist for customers */}
              {loggedInUser?.role === 'customer' &&
                <Stack>
                  <Badge badgeContent={wishlistItems?.length} color='error'>
                    <IconButton component={Link} to={"/wishlist"}>
                      <FavoriteBorderIcon />
                    </IconButton>
                  </Badge>
                </Stack>
              }
              
              {isProductList && 
                <IconButton onClick={handleToggleFilters}>
                  <TuneIcon sx={{color: isProductFilterOpen ? "black" : ""}}/>
                </IconButton>
              }
            </Stack>
          </Stack>
        </Toolbar>
    </AppBar>
  );
}