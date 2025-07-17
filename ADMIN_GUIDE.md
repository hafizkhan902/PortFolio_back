# Portfolio Admin Backend API

## 🚀 Overview

The Portfolio Admin Backend API provides comprehensive endpoints for managing portfolio projects with authentication, CRUD operations, and project categorization.

## 🔐 Admin Authentication

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `super_admin`

⚠️ **IMPORTANT**: Change the password after first login!

### Base API URL
```
http://localhost:4000/api
```

## 📊 Features

### 1. **Authentication System**
- JWT-based authentication
- Role-based access control (admin/super_admin)
- Secure password hashing with bcrypt
- Token expiration (24 hours)

### 2. **Project Management**
- ✅ Create, read, update, delete projects
- ✅ Toggle featured status
- ✅ Filter by category and featured status
- ✅ Pagination support
- ✅ Bulk operations
- ✅ Project statistics

### 3. **Enhanced Project Schema**
- **Basic Info**: Title, description, short description
- **URLs**: GitHub, live demo, additional demo URL
- **Media**: Main image, additional images with captions
- **Classification**: Category, tags, priority (0-10)
- **Status**: Completed, in-progress, on-hold, cancelled
- **Dates**: Start date, completion date
- **Details**: Technologies, features, challenges, solutions
- **SEO**: Meta title, description, keywords
- **Analytics**: Views, likes, shares tracking
- **Admin Tracking**: Created by, updated by, timestamps

### 4. **Available Categories**
- Web
- UI
- Fullstack
- Research
- Mobile
- Desktop
- API
- Other

## 🛠️ API Endpoints

### Authentication
```bash
POST /api/admin/login                # Admin login
GET /api/admin/profile              # Get current admin profile
POST /api/admin/logout              # Logout (client-side token removal)
PUT /api/admin/change-password      # Change password
```

### Project Management
```bash
# Public endpoints
GET /api/projects                    # Get all projects (with pagination)
GET /api/projects/:id               # Get single project
GET /api/projects/meta/categories   # Get available categories

# Admin-only endpoints (require JWT token)
POST /api/projects                  # Create project
PUT /api/projects/:id              # Update project
DELETE /api/projects/:id           # Delete project
PATCH /api/projects/:id/featured   # Toggle featured status
GET /api/projects/meta/stats       # Get project statistics

# Bulk operations (admin-only)
POST /api/projects/bulk/featured   # Bulk update featured status
DELETE /api/projects/bulk/delete   # Bulk delete projects
```

### Admin Management (Super Admin only)
```bash
POST /api/admin/create             # Create new admin
GET /api/admin/list               # Get all admins
PUT /api/admin/:id/status         # Update admin status
```

## 📝 Usage Examples

### 1. Login to Get JWT Token
```bash
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "_id": "...",
      "username": "admin",
      "email": "hkkhan074@gmail.com",
      "role": "super_admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Get Admin Profile
```bash
curl -X GET http://localhost:4000/api/admin/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Create a New Project
```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "E-commerce Platform",
    "description": "Full-stack e-commerce solution with React and Node.js",
    "shortDescription": "Modern e-commerce platform with secure payments",
    "category": "Fullstack",
    "technologies": ["React", "Node.js", "MongoDB", "Stripe"],
    "imageUrl": "https://example.com/image.jpg",
    "githubUrl": "https://github.com/username/project",
    "liveUrl": "https://project.com",
    "demoUrl": "https://demo.project.com",
    "completionDate": "2025-01-15",
    "startDate": "2024-12-01",
    "featured": true,
    "priority": 8,
    "status": "completed",
    "features": ["User authentication", "Payment processing", "Admin dashboard"],
    "challenges": ["Payment integration", "Real-time updates"],
    "solutions": ["Stripe API", "Socket.io implementation"]
  }'
```

### 4. Get All Projects (Public)
```bash
curl "http://localhost:4000/api/projects"

# With filters and pagination
curl "http://localhost:4000/api/projects?category=Fullstack&featured=true&page=1&limit=10"
```

### 5. Get Project Categories
```bash
curl "http://localhost:4000/api/projects/meta/categories"

# Response:
{
  "success": true,
  "data": ["Web", "UI", "Fullstack", "Research", "Mobile", "Desktop", "API", "Other"]
}
```

### 6. Toggle Featured Status
```bash
curl -X PATCH http://localhost:4000/api/projects/PROJECT_ID/featured \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Get Project Statistics (Admin only)
```bash
curl -X GET http://localhost:4000/api/projects/meta/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response:
{
  "success": true,
  "data": {
    "totalProjects": 10,
    "featuredProjects": 5,
    "categoryCounts": [
      { "_id": "Fullstack", "count": 4 },
      { "_id": "Web", "count": 3 },
      { "_id": "UI", "count": 2 }
    ]
  }
}
```

### 8. Update Project
```bash
curl -X PUT http://localhost:4000/api/projects/PROJECT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Project Title",
    "description": "Updated description",
    "featured": false
  }'
```

### 9. Delete Project
```bash
curl -X DELETE http://localhost:4000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Technical Details

### Database Schema
```javascript
// Project Schema
{
  title: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 200 },
  technologies: [{ type: String, required: true }],
  imageUrl: { type: String, required: true },
  images: [{ url: String, caption: String, alt: String }],
  githubUrl: { type: String, required: true },
  liveUrl: String,
  demoUrl: String,
  category: { 
    type: String, 
    required: true,
    enum: ['Web', 'UI', 'Fullstack', 'Research', 'Mobile', 'Desktop', 'API', 'Other']
  },
  featured: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['completed', 'in-progress', 'on-hold', 'cancelled'],
    default: 'completed'
  },
  priority: { type: Number, default: 0, min: 0, max: 10 },
  completionDate: { type: Date, required: true },
  startDate: Date,
  challenges: [String],
  solutions: [String],
  features: [String],
  tags: [String],
  metrics: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  seoMetadata: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  createdBy: { type: ObjectId, ref: 'Admin' },
  updatedBy: { type: ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Admin Schema
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // bcrypt hashed
  role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
}
```

### Authentication Flow
1. POST to `/api/admin/login` with credentials
2. Server validates and returns JWT token
3. Include token in Authorization header: `Bearer YOUR_TOKEN`
4. Server validates token for protected routes
5. Token expires after 24 hours

### Response Format
All API responses follow this format:
```javascript
{
  "success": true|false,
  "message": "Response message",
  "data": {...}, // Response data (if success)
  "error": "Error details" // Only in development mode
}
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

### 3. Start the Server
```bash
npm run dev
```

### 4. Create Admin User
```bash
node scripts/create-admin.js
```

### 5. Test the API
```bash
# Health check
curl http://localhost:4000/api/health

# Login
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: Mongoose schema validation
- **Role-based Access**: Admin and super admin roles
- **Helmet**: Security headers middleware

## 📊 Query Parameters

### Projects Endpoint (`/api/projects`)
- `category`: Filter by category (Web, UI, Fullstack, etc.)
- `featured`: Filter by featured status (true/false)
- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 10)

Example:
```bash
curl "http://localhost:4000/api/projects?category=Fullstack&featured=true&page=1&limit=5"
```

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check if admin user exists: `node scripts/create-admin.js`
   - Verify credentials are correct
   - Ensure JWT_SECRET is set in .env

2. **Database Connection Error**
   - Check MongoDB is running
   - Verify MONGODB_URI in .env
   - Check database permissions

3. **CORS Errors**
   - Update CORS_ORIGIN in .env
   - Ensure frontend URL matches CORS_ORIGIN

4. **Token Expired**
   - Tokens expire after 24 hours
   - Login again to get new token

### Debug Mode
Set `NODE_ENV=development` in .env for detailed error messages.

## 📞 API Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

**Backend API Ready! 🚀**

Your admin backend is now ready for frontend integration. Use the JWT token from the login endpoint to authenticate all admin operations. 