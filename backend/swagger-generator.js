const fs = require('fs');
const path = require('path');

// Read the base swagger file
const baseSwagger = require('./swagger.json');

// Read the schema definitions
const schemas = require('./swagger-schemas.json');

// Read the route definitions
const authRoutes = require('./swagger-auth-routes.json');
const userRoutes = require('./swagger-user-routes.json');
const productRoutes = require('./swagger-product-routes.json');
const cartOrderRoutes = require('./swagger-cart-order-routes.json');
const otherRoutes = require('./swagger-other-routes.json');

// Add schemas to the base swagger file
baseSwagger.components.schemas = schemas;

// Merge all routes
const allRoutes = {
  ...authRoutes,
  ...userRoutes,
  ...productRoutes,
  ...cartOrderRoutes,
  ...otherRoutes
};

// Add routes to the base swagger file
baseSwagger.paths = allRoutes;

// Write the complete swagger file
fs.writeFileSync(
  path.join(__dirname, 'swagger-complete.json'),
  JSON.stringify(baseSwagger, null, 2)
);

console.log('Swagger documentation generated successfully!');