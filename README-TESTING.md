# E-commerce RBAC Application Testing Guide

This document provides a comprehensive guide to testing the E-commerce application with Role-Based Access Control (RBAC).

## Testing Infrastructure

### Backend Testing

The backend testing infrastructure uses:
- **Jest**: For running tests and assertions
- **Supertest**: For testing HTTP endpoints
- **MongoDB Memory Server**: For in-memory database testing

### Frontend Testing

The frontend testing infrastructure uses:
- **Jest**: For running tests and assertions
- **React Testing Library**: For testing React components
- **MSW (Mock Service Worker)**: For mocking API requests
- **Redux Test Utils**: For testing Redux state management

## Running Tests

### Backend Tests

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Frontend Tests

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Backend Tests

The backend tests are organized into the following directories:

- **`tests/models/`**: Tests for database models
- **`tests/controllers/`**: Tests for API controllers
- **`tests/middleware/`**: Tests for middleware functions
- **`tests/integration/`**: Integration tests for API endpoints
- **`tests/utils/`**: Test utilities and helpers

### Frontend Tests

The frontend tests are organized as follows:

- **`src/features/*/components/__tests__/`**: Tests for React components
- **`src/features/*/__tests__/`**: Tests for Redux slices
- **`src/pages/__tests__/`**: Tests for page components
- **`src/components/__tests__/`**: Tests for shared components
- **`src/utils/test-utils.jsx`**: Test utilities and helpers
- **`src/mocks/`**: API mocking setup

## Test Coverage

The test suite aims to cover:

1. **User Authentication**
   - Registration (customer and vendor)
   - Login
   - OTP verification
   - Password reset

2. **Role-Based Access Control**
   - Customer access restrictions
   - Vendor access restrictions
   - Admin access restrictions
   - Vendor approval workflow

3. **Product Management**
   - Product creation (vendor/admin)
   - Product listing and filtering
   - Product updates and deletion
   - Product ownership verification

4. **Shopping Features**
   - Cart management
   - Order placement
   - Wishlist functionality
   - Address management

5. **Admin Features**
   - Vendor approval
   - Order management
   - Product management across vendors

## Writing New Tests

### Backend Test Example

```javascript
const request = require('supertest');
const express = require('express');
const { createTestUser } = require('../utils/test-utils');

describe('Product Controller', () => {
  let testUser, testProduct;
  
  beforeEach(async () => {
    testUser = await createTestUser({ role: 'vendor', isApproved: true });
    testProduct = await createTestProduct({}, testUser);
  });
  
  it('should return 403 when non-owner tries to update product', async () => {
    const otherUser = await createTestUser({ role: 'vendor', isApproved: true });
    
    await request(app)
      .patch(`/products/${testProduct._id}`)
      .set('Authorization', `Bearer ${generateToken(otherUser)}`)
      .send({ price: 199.99 })
      .expect(403);
  });
});
```

### Frontend Test Example

```jsx
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../utils/test-utils';
import ProductCard from '../ProductCard';

describe('ProductCard Component', () => {
  it('renders product information correctly', () => {
    const product = {
      _id: '1',
      title: 'Test Product',
      price: 99.99,
      thumbnail: 'test.jpg'
    };
    
    renderWithProviders(<ProductCard product={product} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on the state from other tests.

2. **Mock External Dependencies**: Use mocks for external services, APIs, and databases.

3. **Test Real User Flows**: Focus on testing user journeys and interactions.

4. **Role-Based Testing**: Test each feature with different user roles to ensure proper access control.

5. **Error Handling**: Test both success and error scenarios.

6. **Accessibility Testing**: Include tests for accessibility compliance.

7. **Performance Testing**: Consider adding performance tests for critical paths.

## Troubleshooting Common Issues

- **Test Database Connection Issues**: Ensure MongoDB Memory Server is properly configured.
- **Mock Service Worker Errors**: Check that MSW handlers match the API endpoints being called.
- **Redux State Issues**: Use the Redux DevTools to inspect state during tests.
- **Component Rendering Issues**: Use `screen.debug()` to see the current DOM state.

## Continuous Integration

The test suite is configured to run in CI/CD pipelines. The following checks are performed:

- All tests must pass
- Code coverage must meet minimum thresholds
- No ESLint warnings or errors
- TypeScript type checking must pass