# Car Registration System

A full-stack car showroom management system with role-based authentication (Admin & Agent), built with Node.js, Express, MongoDB, React, and Tailwind CSS.

## Features

### Authentication
- Fixed login credentials (stored in environment variables)
- JWT-based authentication
- Role-based access control (Admin & Agent)

### Agent Features
- Add new cars to inventory
- View all cars
- Edit car details (variant, km, price are manually editable)
- Delete cars
- All other fields controlled through admin-managed dropdowns

### Admin Features
- All agent features
- Manage car brands (add, edit, delete)
- Manage car models (add, edit, delete)
- Manage dropdown options (fuel type, transmission, ownership, registration state)
- Full system control

## Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React.js
- Tailwind CSS
- Vite
- Axios for API calls
- React Router

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Edit `.env` file with your settings:
```
MONGODB_URI=mongodb://localhost:27017/car_registration
JWT_SECRET=your_secret_key
PORT=5000
ADMIN_EMAIL=admin@showroom.com
ADMIN_PASSWORD=admin123
AGENT_EMAIL=agent@showroom.com
AGENT_PASSWORD=agent123
```

3. Seed the database:
```bash
node scripts/seedUsers.js
node scripts/seedData.js
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Default Login Credentials

- **Admin**: Use email and password from `.env` (default: admin@showroom.com / admin123)
- **Agent**: Use email and password from `.env` (default: agent@showroom.com / agent123)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Cars (Agent + Admin)
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get single car
- `POST /api/cars` - Add new car
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car

### Admin Only
- `GET /api/admin/brands` - Get all brands
- `POST /api/admin/brands` - Add brand
- `PUT /api/admin/brands/:id` - Update brand
- `DELETE /api/admin/brands/:id` - Delete brand
- `GET /api/admin/models` - Get all models
- `POST /api/admin/models` - Add model
- `PUT /api/admin/models/:id` - Update model
- `DELETE /api/admin/models/:id` - Delete model
- `GET /api/admin/dropdowns` - Get all dropdown options
- `GET /api/admin/dropdowns/:field_name` - Get specific dropdown
- `PUT /api/admin/dropdowns/:field_name` - Update dropdown options

## Project Structure

```
car-registration/
├── models/              # MongoDB schemas
├── routes/              # API routes
├── middleware/          # Auth & role check middleware
├── scripts/             # Database seed scripts
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # Context providers
│   │   └── App.jsx      # Main app component
│   └── package.json
├── .env                 # Environment variables
├── server.js            # Express server
└── package.json
```

## Database Schema

### Car Fields
- `stock_code` - Unique identifier (e.g., car01)
- `brand` - Reference to Brand model
- `model` - Reference to Model model
- `variant` - Manual entry by agent
- `year_of_manufacture` - Dropdown
- `registration_year` - Dropdown
- `fuel_type` - Admin-controlled dropdown
- `transmission` - Admin-controlled dropdown
- `km` - Manual entry by agent
- `price` - Manual entry by agent
- `ownership` - Admin-controlled dropdown
- `registration_state` - Admin-controlled dropdown

## License

ISC
