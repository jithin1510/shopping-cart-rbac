import React from 'react';
import { 
  Box, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Typography,
  Paper,
  Stack
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';

const RoleSelection = ({ selectedRole, handleRoleChange, ...props }) => {
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend">Select your role</FormLabel>
        <RadioGroup
          aria-label="role"
          name="role"
          value={selectedRole}
          onChange={handleRoleChange}
          sx={{ mt: 1 }}
          {...props}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
            <Paper 
              elevation={selectedRole === 'customer' ? 3 : 1}
              sx={{ 
                p: 2, 
                flex: 1, 
                cursor: 'pointer',
                border: selectedRole === 'customer' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleRoleChange({ target: { value: 'customer' } })}
            >
              <FormControlLabel 
                value="customer" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <PersonIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">Customer</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Shop products from various vendors
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%', m: 0 }}
              />
            </Paper>
            
            <Paper 
              elevation={selectedRole === 'vendor' ? 3 : 1}
              sx={{ 
                p: 2, 
                flex: 1, 
                cursor: 'pointer',
                border: selectedRole === 'vendor' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleRoleChange({ target: { value: 'vendor' } })}
            >
              <FormControlLabel 
                value="vendor" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <StorefrontIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">Vendor</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sell your products on our platform
                    </Typography>
                    <Typography variant="caption" color="warning.main" sx={{ mt: 1 }}>
                      Requires admin approval
                    </Typography>
                  </Box>
                }
                sx={{ width: '100%', m: 0 }}
              />
            </Paper>
          </Stack>
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default RoleSelection;