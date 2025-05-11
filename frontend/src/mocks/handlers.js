import { rest } from 'msw';

// Define base URL for API requests
const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8000';

// Define handlers for API endpoints
export const handlers = [
  // Auth endpoints
  rest.post(`${baseUrl}/auth/signup`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        _id: '123',
        name: req.body.name || 'Test User',
        email: req.body.email || 'test@example.com',
        role: req.body.role || 'customer',
        isVerified: false,
        isApproved: req.body.role === 'customer'
      })
    );
  }),
  
  rest.post(`${baseUrl}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        _id: '123',
        name: 'Test User',
        email: req.body.email || 'test@example.com',
        role: 'customer',
        isVerified: true,
        isApproved: true
      })
    );
  }),
  
  rest.get(`${baseUrl}/auth/check-auth`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        isVerified: true,
        isApproved: true
      })
    );
  }),
  
  rest.get(`${baseUrl}/auth/logout`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ message: 'Logged out successfully' })
    );
  }),
  
  // Product endpoints
  rest.get(`${baseUrl}/products`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          _id: '1',
          title: 'Test Product 1',
          price: 99.99,
          thumbnail: 'https://example.com/thumbnail1.jpg'
        },
        {
          _id: '2',
          title: 'Test Product 2',
          price: 149.99,
          thumbnail: 'https://example.com/thumbnail2.jpg'
        }
      ])
    );
  }),
  
  rest.get(`${baseUrl}/products/:id`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        _id: req.params.id,
        title: 'Test Product',
        price: 99.99,
        thumbnail: 'https://example.com/thumbnail.jpg'
      })
    );
  }),
  
  // User endpoints
  rest.get(`${baseUrl}/users/vendors/all`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          _id: '2',
          name: 'Test Vendor',
          email: 'vendor@example.com',
          role: 'vendor',
          isApproved: false
        }
      ])
    );
  }),
  
  rest.patch(`${baseUrl}/users/vendors/approve/:id`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        _id: req.params.id,
        name: 'Test Vendor',
        email: 'vendor@example.com',
        role: 'vendor',
        isApproved: req.body.isApproved
      })
    );
  })
];