# Journey API Documentation

## Overview
The Journey API provides both public and admin endpoints for managing timeline/journey entries. Public endpoints are available at `/api/journey` while admin management endpoints are secured under `/api/admin/journey`.

## Public API Endpoints

### Base URL
```
http://localhost:4000/api/journey
```

### 1. Get All Journey Entries (Public)
**GET** `/`

**Description:** Retrieve all journey entries ordered by display order (no authentication required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6876d574d5092a9c0a448878",
      "year": 2022,
      "title": "Professional Experience",
      "description": "Started working as a freelance developer and built multiple client projects",
      "displayOrder": 1,
      "createdAt": "2025-07-15T22:25:56.555Z",
      "updatedAt": "2025-07-15T22:27:06.565Z"
    }
  ]
}
```

### 2. Get Single Journey Entry (Public)
**GET** `/:id`

**Description:** Retrieve a specific journey entry by ID (no authentication required)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6876d574d5092a9c0a448878",
    "year": 2022,
    "title": "Professional Experience",
    "description": "Started working as a freelance developer and built multiple client projects",
    "displayOrder": 1,
    "createdAt": "2025-07-15T22:25:56.555Z",
    "updatedAt": "2025-07-15T22:27:06.565Z"
  }
}
```

### 3. Get Journey Statistics (Public)
**GET** `/stats/overview`

**Description:** Get basic journey statistics (no authentication required)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalJourneys": 3,
    "yearRange": {
      "_id": null,
      "minYear": 2020,
      "maxYear": 2022
    }
  }
}
```

## Admin API Endpoints

### Base URL
```
http://localhost:4000/api/admin/journey
```

### Authentication Required
All admin endpoints require admin authentication using Bearer token:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### 1. Get All Journey Entries (Admin)
**GET** `/`

**Headers:** `Authorization: Bearer TOKEN`

**Description:** Retrieve all journey entries with admin details (authentication required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6876d574d5092a9c0a448878",
      "year": 2022,
      "title": "Professional Experience",
      "description": "Started working as a freelance developer and built multiple client projects",
      "displayOrder": 1,
      "createdBy": {
        "_id": "687687d1bbd37b6c4a0f2646",
        "username": "admin",
        "email": "hkkhan074@gmail.com"
      },
      "updatedBy": {
        "_id": "687687d1bbd37b6c4a0f2646",
        "username": "admin",
        "email": "hkkhan074@gmail.com"
      },
      "createdAt": "2025-07-15T22:25:56.555Z",
      "updatedAt": "2025-07-15T22:27:06.565Z"
    }
  ]
}
```

### 2. Create Journey Entry (Admin)
**POST** `/`

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "year": 2023,
  "title": "Advanced Development",
  "description": "Specialized in cloud technologies and microservices",
  "displayOrder": 4
}
```

**Notes:**
- `displayOrder` is optional. If not provided, it will auto-assign the next available order
- `year` must be between 1900 and current year + 10
- `title` max length: 200 characters
- `description` max length: 1000 characters

### 3. Get Single Journey Entry (Admin)
**GET** `/:id`

**Headers:** `Authorization: Bearer TOKEN`

### 4. Update Journey Entry (Admin)
**PUT** `/:id`

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "year": 2022,
  "title": "Updated Professional Experience",
  "description": "Updated description with more details",
  "displayOrder": 1
}
```

### 5. Delete Journey Entry (Admin)
**DELETE** `/:id`

**Headers:** `Authorization: Bearer TOKEN`

### 6. Reorder Journey Entries (Admin)
**POST** `/reorder`

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "journeyIds": [
    "6876d574d5092a9c0a448878",
    "6876d566d5092a9c0a44886f",
    "6876d55cd5092a9c0a448867"
  ]
}
```

### 7. Get Journey Statistics (Admin)
**GET** `/stats`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalJourneys": 3,
    "yearRange": {
      "_id": null,
      "minYear": 2020,
      "maxYear": 2022
    },
    "recentJourneys": 3
  }
}
```

## Security Features

### Public Endpoints
- ✅ **No authentication required** - Perfect for frontend display
- ✅ **Limited data exposure** - Only essential fields returned
- ✅ **Rate limiting** - Protected against abuse
- ✅ **Read-only access** - No data modification possible

### Admin Endpoints
- 🔒 **JWT Authentication required** - All endpoints secured
- 🔒 **Admin role verification** - Only authenticated admins can access
- 🔒 **Full data access** - Includes admin metadata and creation details
- 🔒 **CRUD operations** - Complete management capabilities

## Usage Examples

### Frontend JavaScript (Public API)
```javascript
// Get all journey entries for public display
const fetchJourneyEntries = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/journey');
    const data = await response.json();
    
    if (data.success) {
      return data.data; // Clean journey data without admin details
    }
  } catch (error) {
    console.error('Failed to fetch journey entries:', error);
  }
};

// Get single journey entry
const fetchJourneyEntry = async (id) => {
  try {
    const response = await fetch(`http://localhost:4000/api/journey/${id}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error('Failed to fetch journey entry:', error);
  }
};

// Get journey statistics
const fetchJourneyStats = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/journey/stats/overview');
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error('Failed to fetch journey statistics:', error);
  }
};
```

### Admin JavaScript (Admin API)
```javascript
// Admin: Get all journey entries with admin details
const fetchAdminJourneyEntries = async (token) => {
  try {
    const response = await fetch('http://localhost:4000/api/admin/journey', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    
    if (data.success) {
      return data.data; // Full data with admin metadata
    }
  } catch (error) {
    console.error('Failed to fetch admin journey entries:', error);
  }
};

// Admin: Create new journey entry
const createJourneyEntry = async (token, journeyData) => {
  try {
    const response = await fetch('http://localhost:4000/api/admin/journey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(journeyData)
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to create journey entry:', error);
  }
};
```

### cURL Examples

#### Public API
```bash
# Get all journey entries (public)
curl http://localhost:4000/api/journey

# Get single journey entry (public)
curl http://localhost:4000/api/journey/JOURNEY_ID

# Get journey statistics (public)
curl http://localhost:4000/api/journey/stats/overview
```

#### Admin API
```bash
# Get all journey entries (admin)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/admin/journey

# Create new journey entry (admin)
curl -X POST http://localhost:4000/api/admin/journey \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"year": 2023, "title": "New Milestone", "description": "Achievement description"}'

# Update journey entry (admin)
curl -X PUT http://localhost:4000/api/admin/journey/JOURNEY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"year": 2023, "title": "Updated Title", "description": "Updated description"}'

# Delete journey entry (admin)
curl -X DELETE http://localhost:4000/api/admin/journey/JOURNEY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Reorder journey entries (admin)
curl -X POST http://localhost:4000/api/admin/journey/reorder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"journeyIds": ["ID1", "ID2", "ID3"]}'

# Get admin statistics (admin)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/admin/journey/stats
```

## Error Responses

### Authentication Errors (Admin endpoints)
```json
{
  "success": false,
  "message": "Access denied. No token provided.",
  "debug": {
    "tokenFound": false,
    "reason": "No Authorization header or token in request"
  }
}
```

### Validation Errors
```json
{
  "success": false,
  "message": "Display order already exists. Please choose a different order."
}
```

### Not Found Errors
```json
{
  "success": false,
  "message": "Journey entry not found"
}
```

## API Differences

| Feature | Public API (`/api/journey`) | Admin API (`/api/admin/journey`) |
|---------|---------------------------|--------------------------------|
| Authentication | ❌ None required | ✅ JWT Token required |
| Data Exposure | 📄 Essential fields only | 📋 Full data + admin metadata |
| Operations | 👀 Read-only | 🔧 Full CRUD operations |
| Admin Details | ❌ Hidden | ✅ createdBy, updatedBy fields |
| Statistics | 📊 Basic overview | 📈 Detailed admin stats |
| Security | 🔓 Public access | 🔒 Admin-only access |

## Model Schema

```javascript
{
  year: Number (required, min: 1900, max: currentYear + 10),
  title: String (required, max: 200 chars),
  description: String (required, max: 1000 chars),
  displayOrder: Number (required, unique, min: 0),
  createdBy: ObjectId (ref: Admin),
  updatedBy: ObjectId (ref: Admin),
  createdAt: Date,
  updatedAt: Date
}
```

## Best Practices

### For Frontend Development
- Use **public API** (`/api/journey`) for displaying journey timeline
- Use **admin API** (`/api/admin/journey`) only in admin panels
- Cache public API responses for better performance
- Handle errors gracefully with fallback content

### For Security
- Never expose admin tokens in client-side code
- Use environment variables for API base URLs
- Implement proper error handling for authentication failures
- Validate data on both client and server sides

## Notes
- ✅ **Public endpoints** are optimized for frontend display with clean data
- 🔒 **Admin endpoints** require authentication and provide full management capabilities
- 📊 **Statistics endpoints** are available in both public and admin versions
- 🔄 **Reordering functionality** is admin-only for security
- 📈 **Performance optimized** with lean queries for public endpoints 