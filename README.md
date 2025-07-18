# Portfolio Backend API

Backend API for Hafiz Al Asad's portfolio website. Built with Node.js, Express, and MongoDB.

## Features

- Contact form submission with email notifications
- Project management API
- GitHub integration for activity feed and repositories
- Secure API with rate limiting and security headers
- Error handling and logging

## Tech Stack

- Node.js & Express
- MongoDB & Mongoose
- Nodemailer for emails
- GitHub API integration
- Security: Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- GitHub account and personal access token

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd portfolio-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/portfolio
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-specific-password
   GITHUB_TOKEN=your-github-personal-access-token
   CORS_ORIGIN=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Contact API

#### POST /api/contact
Submit a contact form
- Body:
  ```json
  {
    "name": "string",
    "email": "string",
    "subject": "string",
    "message": "string"
  }
  ```

### Projects API

#### GET /api/projects
Get all projects
- Query Parameters:
  - category (optional): Filter by category
  - featured (optional): Filter featured projects

#### GET /api/projects/:id
Get a single project by ID

#### POST /api/projects
Create a new project
- Body: Project object

#### PUT /api/projects/:id
Update a project
- Body: Updated project fields

#### DELETE /api/projects/:id
Delete a project

### GitHub API

#### GET /api/github/activity
Get recent GitHub activity

#### GET /api/github/repos
Get GitHub repositories

## Security

The API implements several security measures:
- Rate limiting
- Security headers with Helmet
- CORS configuration
- Input validation
- Error handling

## Development

### Scripts

- `npm start`: Start production server
- `npm run dev`: Start development server with nodemon
- `npm test`: Run tests

### Project Structure

```
src/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
└── server.js        # Main application file
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 

## 🚀 Deploying to Railway

### 1. Create a Railway Project
- Go to [Railway](https://railway.app/) and create a new project.
- Connect your GitHub repository or upload your code.

### 2. Configure Environment Variables
Set the following environment variables in the Railway dashboard:
- `PORT` (e.g., 4000)
- `NODE_ENV` (e.g., production)
- `MONGODB_URI` (your MongoDB connection string)
- `JWT_SECRET` (your JWT secret)
- `EMAIL_HOST` (e.g., smtp.gmail.com)
- `EMAIL_PORT` (e.g., 587)
- `EMAIL_USER` (your email address)
- `EMAIL_PASS` (your email password or app password)
- `GITHUB_TOKEN` (your GitHub personal access token)
- `CORS_ORIGIN` (your frontend URL)

### 3. Set the Start Command
Railway will use the `start` script from `package.json`:
```
npm start
```

### 4. (Optional) Add a Health Check
Set the health check endpoint to `/api/health` in the Railway settings for better monitoring.

### 5. Deploy
- Click "Deploy" in Railway. Your app will build and start automatically.
- View logs and monitor your deployment from the Railway dashboard. 