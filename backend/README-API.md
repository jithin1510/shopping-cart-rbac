# Shopping-cart API with RBAC Documentation

This document provides an overview of the API endpoints and their functionality in the Shopping-cart application with Role-Based Access Control (RBAC).

## API Documentation

The complete API documentation is available through Swagger UI at:

```
http://localhost:8000/api-docs
```

## Role-Based Access Control (RBAC)

The application implements RBAC with three roles:

1. **Customer**
   - Can browse products
   - Can add products to cart and wishlist
   - Can place orders
   - Can manage their own profile and addresses
   - Auto-approved upon registration

2. **Vendor**
   - Can manage their own products (CRUD operations)
   - Can view their product listings
   - Requires admin approval after registration
   - Cannot access customer features like cart

3. **Admin**
   - Can approve/reject vendor applications
   - Can manage all products
   - Can view and update all orders
   - Has access to admin dashboard

## Authentication

All authenticated routes require a JWT token sent via cookies. The token is obtained by logging in.

## Main API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user (customer or vendor)
- `POST /auth/login` - Login and get JWT token
- `POST /auth/verify-otp` - Verify email with OTP
- `GET /auth/logout` - Logout and clear token

### User Management

- `GET /users/vendors/all` - Get all vendors (admin only)
- `PATCH /users/vendors/approve/:id` - Approve/reject vendor (admin only)
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user details

### Products

- `GET /products` - Get all products (with filtering and pagination)
- `POST /products` - Create a product (vendor or admin)
- `GET /products/vendor/my-products` - Get vendor's products (vendor only)
- `GET /products/:id` - Get product details
- `PATCH /products/:id` - Update product (vendor owner or admin)
- `DELETE /products/:id` - Soft-delete product (vendor owner or admin)
- `PATCH /products/undelete/:id` - Restore deleted product (vendor owner or admin)

### Cart & Orders

- `GET /cart` - Get user's cart
- `POST /cart` - Add product to cart
- `PATCH /cart/:productId` - Update cart item quantity
- `DELETE /cart/:productId` - Remove item from cart
- `POST /orders` - Create order from cart
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id` - Update order status (admin only)
- `GET /orders/admin` - Get all orders (admin only)

### Other Features

- `GET /wishlist` - Get user's wishlist
- `POST /wishlist` - Add product to wishlist
- `DELETE /wishlist/:productId` - Remove from wishlist
- `GET /address` - Get user's addresses
- `POST /address` - Add new address
- `GET /reviews/:productId` - Get product reviews
- `POST /reviews/:productId` - Add product review

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Generate Swagger documentation:
   ```
   npm run generate-docs
   ```

3. Start the server:
   ```
   npm start
   ```

4. Access the API documentation at `http://localhost:8000/api-docs`