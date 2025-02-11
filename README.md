# E-Commerce REST API 🛒

This is a fully functional **E-Commerce REST API** built with **Express**, **Node.js**, and **PostgreSQL**. It supports user authentication, product management, cart operations, order processing, and product reviews.

---

## 🚀 Features

- **User Authentication** (Registration, Login, JWT Protection)
- **Admin Role Management** (Admin-specific features like product creation and order management)
- **Product Management** (CRUD operations for products)
- **Cart Operations** (Add, update, and remove items in the cart)
- **Order Processing** (Place orders, view order history)
- **Product Reviews & Ratings**
- **Swagger API Documentation**
- **Error Handling and Input Validation**
- **Deployed to the Cloud via Render**

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens), bcrypt.js for password hashing
- **Documentation:** Swagger UI
- **Deployment:** Render (with PostgreSQL in the cloud)

---

## 🔧 Installation & Setup

### 1. Clone the Repository

git clone https://github.com/your-username/ecommerce-api.git
cd ecommerce-api

### 2. Install Dependencies 

npm install

### 3. Set Up Environment Variables

Create a .env file in the root directory and add the following:

DATABASE_URL=your_postgres_connection_url
JWT_SECRET=your_jwt_secret
PORT=3000

### 4. Set Up the Database

Run the following command to create the tables:

psql -U postgres -d ecommerce -f database.sql

### 5. Run the Server

npx nodemon app.js

The server will run on http://localhost:3000.

---


## 📚 API Documentation

Swagger is integrated for easy API testing and documentation.

#### Access Swagger UI: 

http://localhost:3000/api-docs

This provides an interactive UI where you can test API endpoints.

---


#### 🛡️ API Endpoints

Authentication:

	•	POST /api/users/register - Register a new user
	•	POST /api/users/login - Login and receive a JWT token
	•	GET /api/users/profile - Get user profile (Protected)

Products:

	•	GET /api/products - Retrieve all products
	•	GET /api/products/:id - Retrieve a specific product by ID
	•	POST /api/products - Create a new product (Admin only)
	•	PUT /api/products/:id - Update a product (Admin only)
	•	DELETE /api/products/:id - Delete a product (Admin only)

Carts:

	•	POST /api/cart - Add items to cart
	•	GET /api/cart - View cart contents
	•	PUT /api/cart - Update cart items
	•	DELETE /api/cart - Remove items from cart

Orders:

	•	POST /api/orders - Place an order
	•	GET /api/orders - View order history
	•	GET /api/orders/all - View all orders (Admin only)
	•	PUT /api/orders/:id - Update order status (Admin only)
	•	DELETE /api/orders/:id - Delete an order (Admin only)

Reviews:

	•	POST /api/reviews/:productId - Submit a product review
	•	GET /api/reviews/:productId - Get reviews for a product

---

### 🌐 Deployment

This project is deployed on Render.

Live API URL:

https://ecommerce-api.onrender.com

---

### 💻 Running Tests with Postman

Sample Admin Credentials:

	•	Email: admin@example.com
	•	Password: adminPassword

	1.	Register or login to obtain a JWT token.
	2.	Use the JWT token to access protected routes by adding it to the Authorization header in Postman as a Bearer Token.

---

### 🙌 Acknowledgements:

	•	Express
	•	PostgreSQL
	•	Swagger
	•	Render