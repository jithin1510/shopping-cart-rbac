require("dotenv").config()
const express=require('express')
const cors=require('cors')
const morgan=require("morgan")
const cookieParser=require("cookie-parser")
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger-complete.json')
const authRoutes=require("./routes/Auth")
const productRoutes=require("./routes/Product")
const orderRoutes=require("./routes/Order")
const cartRoutes=require("./routes/Cart")
const brandRoutes=require("./routes/Brand")
const categoryRoutes=require("./routes/Category")
const userRoutes=require("./routes/User")
const addressRoutes=require('./routes/Address')
const reviewRoutes=require("./routes/Review")
const wishlistRoutes=require("./routes/Wishlist")
const { connectToDB } = require("./database/db")


// server init
const server=express()

// database connection
connectToDB()


// middlewares
server.use(cors({origin:process.env.ORIGIN,credentials:true,exposedHeaders:['X-Total-Count'],methods:['GET','POST','PATCH','DELETE']}))
server.use(express.json())
server.use(cookieParser())
server.use(morgan("tiny"))

// Swagger documentation
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { 
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "E-commerce API with RBAC Documentation"
}))

// routeMiddleware
server.use("/auth",authRoutes)
server.use("/users",userRoutes)
server.use("/products",productRoutes)
server.use("/orders",orderRoutes)
server.use("/cart",cartRoutes)
server.use("/brands",brandRoutes)
server.use("/categories",categoryRoutes)
server.use("/address",addressRoutes)
server.use("/reviews",reviewRoutes)
server.use("/wishlist",wishlistRoutes)


server.get("/",(req,res)=>{
    res.status(200).json({
      message: 'E-commerce API with RBAC is running',
      documentation: 'Access API documentation at /api-docs'
    })
})

server.listen(8000,()=>{
    console.log('server [STARTED] ~ http://localhost:8000');
    console.log('API Documentation ~ http://localhost:8000/api-docs');
})