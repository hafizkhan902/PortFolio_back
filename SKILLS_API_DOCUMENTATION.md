# Skills & Expertise API Documentation

## Overview
The Skills API provides both public and admin endpoints for managing skills and expertise data. Public endpoints are available at `/api/skills` for frontend display, while admin management endpoints are secured under `/api/admin/skills`.

## Public API Endpoints

### Base URL
```
http://localhost:4000/api/skills
```

### 1. Get All Skills (Public)
**GET** `/`

**Description:** Retrieve all active skills ordered by category and display order (no authentication required)

**Query Parameters:**
- `category` (optional): Filter by category (frontend, backend, database, etc.)
- `proficiency` (optional): Filter by proficiency level (beginner, intermediate, advanced, expert)
- `limit` (optional): Limit number of results

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6876d574d5092a9c0a448878",
      "name": "React.js",
      "category": "frontend",
      "proficiency": "expert",
      "proficiencyLevel": 95,
      "description": "Advanced React development with hooks, context, and modern patterns",
      "icon": {
        "library": "react-icons/fa",
        "name": "FaReact",
        "size": 24,
        "className": "text-blue-500"
      },
      "color": "#61DAFB",
      "displayOrder": 1,
      "yearsOfExperience": 4,
      "projects": ["E-commerce Platform", "Task Management App"],
      "certifications": [
        {
          "name": "React Developer Certification",
          "issuer": "Meta",
          "date": "2023-01-15T00:00:00.000Z",
          "url": "https://certificates.example.com/react"
        }
      ],
      "createdAt": "2025-01-15T22:25:56.555Z",
      "updatedAt": "2025-01-15T22:27:06.565Z"
    }
  ]
}
```

### 2. Get Skills Grouped by Category (Public)
**GET** `/grouped`

**Description:** Retrieve skills organized by categories (no authentication required)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "frontend",
      "skills": [
        {
          "_id": "6876d574d5092a9c0a448878",
          "name": "React.js",
          "proficiency": "expert",
          "proficiencyLevel": 95,
          "description": "Advanced React development",
          "icon": {
            "library": "react-icons/fa",
            "name": "FaReact",
            "size": 24,
            "className": "text-blue-500"
          },
          "color": "#61DAFB",
          "displayOrder": 1,
          "yearsOfExperience": 4,
          "projects": ["E-commerce Platform"],
          "certifications": []
        }
      ],
      "count": 5
    }
  ]
}
```

### 3. Get Single Skill (Public)
**GET** `/:id`

**Description:** Retrieve a specific skill by ID (no authentication required)

### 4. Get Skills by Category (Public)
**GET** `/category/:category`

**Description:** Retrieve skills from a specific category

**Path Parameters:**
- `category`: One of: frontend, backend, database, devops, tools, languages, frameworks, cloud, mobile, uiux, other

**Query Parameters:**
- `limit` (optional): Limit number of results

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6876d574d5092a9c0a448878",
      "name": "React.js",
      "category": "frontend",
      "proficiency": "expert",
      "proficiencyLevel": 95
    }
  ],
  "category": "frontend",
  "count": 1
}
```

### 5. Get Skills Statistics (Public)
**GET** `/stats/overview`

**Description:** Get basic skills statistics (no authentication required)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSkills": 25,
    "categoryStats": [
      { "_id": "frontend", "count": 8 },
      { "_id": "backend", "count": 6 },
      { "_id": "database", "count": 4 }
    ],
    "proficiencyStats": [
      { "_id": "expert", "count": 10 },
      { "_id": "advanced", "count": 8 },
      { "_id": "intermediate", "count": 5 }
    ]
  }
}
```

### 6. Get Available Categories (Public)
**GET** `/meta/categories`

**Description:** Get list of available skill categories

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": ["backend", "frontend", "database", "devops"],
    "allCategories": ["frontend", "backend", "database", "devops", "tools", "languages", "frameworks", "cloud", "mobile", "other"]
  }
}
```

## Admin API Endpoints

### Base URL
```
http://localhost:4000/api/admin/skills
```

### Authentication Required
All admin endpoints require admin authentication using Bearer token:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### 1. Get All Skills (Admin)
**GET** `/`

**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
- `category` (optional): Filter by category
- `proficiency` (optional): Filter by proficiency level
- `isActive` (optional): Filter by active status (true/false)
- `search` (optional): Search in name, description, category
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6876d574d5092a9c0a448878",
      "name": "React.js",
      "category": "frontend",
      "proficiency": "expert",
      "proficiencyLevel": 95,
      "description": "Advanced React development",
      "icon": "react-icon.svg",
      "color": "#61DAFB",
      "displayOrder": 1,
      "isActive": true,
      "yearsOfExperience": 4,
      "projects": ["E-commerce Platform"],
      "certifications": [],
      "createdBy": {
        "_id": "687687d1bbd37b6c4a0f2646",
        "username": "admin",
        "email": "admin@example.com"
      },
      "updatedBy": {
        "_id": "687687d1bbd37b6c4a0f2646",
        "username": "admin",
        "email": "admin@example.com"
      },
      "createdAt": "2025-01-15T22:25:56.555Z",
      "updatedAt": "2025-01-15T22:27:06.565Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2
  }
}
```

### 2. Create Skill (Admin)
**POST** `/`

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "name": "Vue.js",
  "category": "frontend",
  "proficiency": "advanced",
  "proficiencyLevel": 85,
  "description": "Modern Vue.js development with Composition API",
  "icon": {
    "library": "react-icons/fa",
    "name": "FaVuejs",
    "size": 24,
    "className": "text-green-500"
  },
  "color": "#4FC08D",
  "displayOrder": 2,
  "yearsOfExperience": 3,
  "projects": ["Admin Dashboard", "Portfolio Website"],
  "certifications": [
    {
      "name": "Vue.js Certification",
      "issuer": "Vue School",
      "date": "2023-06-15",
      "url": "https://certificates.example.com/vue"
    }
  ]
}
```

**Notes:**
- `displayOrder` is optional. If not provided, it will auto-assign the next available order for the category
- `proficiencyLevel` must be between 1-100
- `yearsOfExperience` must be between 0-50
- `color` must be a valid hex color code
- `projects` and `certifications` are optional arrays

### 3. Update Skill (Admin)
**PUT** `/:id`

**Headers:** `Authorization: Bearer TOKEN`

**Body:** Same as create, all fields optional

### 4. Delete Skill (Admin)
**DELETE** `/:id`

**Headers:** `Authorization: Bearer TOKEN`

### 5. Toggle Active Status (Admin)
**PATCH** `/:id/toggle-active`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "message": "Skill activated successfully",
  "data": {
    "_id": "6876d574d5092a9c0a448878",
    "name": "React.js",
    "isActive": true
  }
}
```

### 6. Reorder Skills (Admin)
**POST** `/reorder`

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "category": "frontend",
  "skillIds": [
    "6876d574d5092a9c0a448878",
    "6876d566d5092a9c0a44886f",
    "6876d55cd5092a9c0a448867"
  ]
}
```

### 7. Bulk Operations (Admin)
**POST** `/bulk`

**Headers:** `Authorization: Bearer TOKEN`

**Body:**
```json
{
  "action": "activate",
  "skillIds": [
    "6876d574d5092a9c0a448878",
    "6876d566d5092a9c0a44886f"
  ]
}
```

**Available Actions:**
- `activate`: Set skills as active
- `deactivate`: Set skills as inactive
- `delete`: Delete skills permanently

### 8. Get Skills Statistics (Admin)
**GET** `/stats`

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSkills": 25,
    "activeSkills": 22,
    "inactiveSkills": 3,
    "categoryStats": [
      { "_id": "frontend", "count": 8 },
      { "_id": "backend", "count": 6 }
    ],
    "proficiencyStats": [
      { "_id": "expert", "count": 10 },
      { "_id": "advanced", "count": 8 }
    ],
    "recentSkills": 5
  }
}
```

## Security Features

### Public Endpoints
- ✅ **No authentication required** - Perfect for frontend display
- ✅ **Only active skills shown** - Inactive skills are hidden
- ✅ **Limited data exposure** - Admin fields are excluded
- ✅ **Rate limiting** - Protected against abuse
- ✅ **Read-only access** - No data modification possible

### Admin Endpoints
- 🔒 **JWT Authentication required** - All endpoints secured
- 🔒 **Admin role verification** - Only authenticated admins can access
- 🔒 **Full data access** - Includes admin metadata and inactive skills
- 🔒 **CRUD operations** - Complete management capabilities
- 🔒 **Bulk operations** - Efficient management of multiple skills

## Usage Examples

### Frontend JavaScript (Public API)
```javascript
// Get all skills for skills section
const fetchSkills = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/skills');
    const data = await response.json();
    
    if (data.success) {
      return data.data; // Clean skills data without admin details
    }
  } catch (error) {
    console.error('Failed to fetch skills:', error);
  }
};

// Get skills grouped by category for organized display
const fetchSkillsByCategory = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/skills/grouped');
    const data = await response.json();
    
    if (data.success) {
      return data.data; // Skills organized by category
    }
  } catch (error) {
    console.error('Failed to fetch grouped skills:', error);
  }
};

// Get frontend skills only
const fetchFrontendSkills = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/skills/category/frontend');
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error('Failed to fetch frontend skills:', error);
  }
};

// Get skills statistics for overview
const fetchSkillsStats = async () => {
  try {
    const response = await fetch('http://localhost:4000/api/skills/stats/overview');
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error('Failed to fetch skills statistics:', error);
  }
};
```

### Admin JavaScript (Admin API)
```javascript
// Admin: Get all skills with admin details
const fetchAdminSkills = async (token, page = 1, category = '') => {
  try {
    const params = new URLSearchParams({ page: page.toString() });
    if (category) params.append('category', category);
    
    const response = await fetch(`http://localhost:4000/api/admin/skills?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    
    if (data.success) {
      return data; // Full data with pagination and admin metadata
    }
  } catch (error) {
    console.error('Failed to fetch admin skills:', error);
  }
};

// Admin: Create new skill
const createSkill = async (token, skillData) => {
  try {
    const response = await fetch('http://localhost:4000/api/admin/skills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(skillData)
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to create skill:', error);
  }
};

// Admin: Update skill
const updateSkill = async (token, skillId, skillData) => {
  try {
    const response = await fetch(`http://localhost:4000/api/admin/skills/${skillId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(skillData)
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to update skill:', error);
  }
};

// Admin: Toggle skill active status
const toggleSkillStatus = async (token, skillId) => {
  try {
    const response = await fetch(`http://localhost:4000/api/admin/skills/${skillId}/toggle-active`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to toggle skill status:', error);
  }
};

// Admin: Bulk operations
const bulkSkillOperation = async (token, action, skillIds) => {
  try {
    const response = await fetch('http://localhost:4000/api/admin/skills/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ action, skillIds })
    });
    return await response.json();
  } catch (error) {
    console.error('Failed to perform bulk operation:', error);
  }
};
```

### cURL Examples

#### Public API
```bash
# Get all skills (public)
curl http://localhost:4000/api/skills

# Get skills grouped by category (public)
curl http://localhost:4000/api/skills/grouped

# Get frontend skills only (public)
curl http://localhost:4000/api/skills/category/frontend

# Get skills statistics (public)
curl http://localhost:4000/api/skills/stats/overview

# Get available categories (public)
curl http://localhost:4000/api/skills/meta/categories
```

#### Admin API
```bash
# Get all skills (admin)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/admin/skills

# Create new skill (admin)
curl -X POST http://localhost:4000/api/admin/skills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Node.js",
    "category": "backend",
    "proficiency": "expert",
    "proficiencyLevel": 90,
    "description": "Server-side JavaScript development",
    "yearsOfExperience": 5
  }'

# Update skill (admin)
curl -X PUT http://localhost:4000/api/admin/skills/SKILL_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Node.js",
    "proficiencyLevel": 95,
    "description": "Advanced Node.js with microservices"
  }'

# Toggle skill active status (admin)
curl -X PATCH http://localhost:4000/api/admin/skills/SKILL_ID/toggle-active \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete skill (admin)
curl -X DELETE http://localhost:4000/api/admin/skills/SKILL_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Reorder skills (admin)
curl -X POST http://localhost:4000/api/admin/skills/reorder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "category": "frontend",
    "skillIds": ["ID1", "ID2", "ID3"]
  }'

# Bulk operations (admin)
curl -X POST http://localhost:4000/api/admin/skills/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "action": "activate",
    "skillIds": ["ID1", "ID2"]
  }'

# Get admin statistics (admin)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/admin/skills/stats
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
  "message": "Display order already exists for this category. Please choose a different order."
}
```

### Category Validation Error
```json
{
  "success": false,
  "message": "Invalid category",
  "validCategories": ["frontend", "backend", "database", "devops", "tools", "languages", "frameworks", "cloud", "mobile", "other"]
}
```

## API Differences

| Feature | Public API (`/api/skills`) | Admin API (`/api/admin/skills`) |
|---------|---------------------------|--------------------------------|
| Authentication | ❌ None required | ✅ JWT Token required |
| Data Exposure | 📄 Active skills only | 📋 All skills + admin metadata |
| Operations | 👀 Read-only | 🔧 Full CRUD + bulk operations |
| Admin Details | ❌ Hidden | ✅ createdBy, updatedBy fields |
| Inactive Skills | ❌ Hidden | ✅ Visible with status flag |
| Statistics | 📊 Basic overview | 📈 Detailed admin stats |
| Security | 🔓 Public access | 🔒 Admin-only access |

## Model Schema

```javascript
{
  name: String (required, max: 100 chars),
  category: String (required, enum: ['frontend', 'backend', 'database', 'devops', 'tools', 'languages', 'frameworks', 'cloud', 'mobile', 'uiux', 'other']),
  proficiency: String (required, enum: ['beginner', 'intermediate', 'advanced', 'expert']),
  proficiencyLevel: Number (required, min: 1, max: 100),
  description: String (max: 500 chars),
  icon: {
    library: String (required),
    name: String (required),
    size: Number (required),
    className: String (required)
  },
  color: String (hex color format),
  displayOrder: Number (required, unique within category, min: 0),
  isActive: Boolean (default: true),
  yearsOfExperience: Number (min: 0, max: 50),
  projects: [String] (max: 200 chars each),
  certifications: [{
    name: String (max: 200 chars),
    issuer: String (max: 100 chars),
    date: Date,
    url: String (max: 500 chars)
  }],
  createdBy: ObjectId (ref: Admin),
  updatedBy: ObjectId (ref: Admin),
  createdAt: Date,
  updatedAt: Date
}
```

## Categories

### Available Categories
- **frontend**: React, Vue, Angular, HTML, CSS, JavaScript
- **backend**: Node.js, Python, PHP, Java, C#, Ruby
- **database**: MongoDB, MySQL, PostgreSQL, Redis
- **devops**: Docker, Kubernetes, AWS, CI/CD
- **tools**: Git, VS Code, Postman, Figma
- **languages**: JavaScript, Python, TypeScript, Java
- **frameworks**: Express.js, Django, Laravel, Spring
- **cloud**: AWS, Azure, Google Cloud, Heroku
- **mobile**: React Native, Flutter, Swift, Kotlin
- **uiux**: User Interface/User Experience design, Figma, Adobe XD, Sketch
- **other**: Any other skills not fitting above categories

## Best Practices

### For Frontend Development
- Use **public API** (`/api/skills`) for displaying skills section
- Use **grouped endpoint** for organized category display
- Use **category-specific endpoints** for filtered views
- Cache public API responses for better performance
- Handle errors gracefully with fallback content

### For Admin Development
- Use **admin API** (`/api/admin/skills`) only in admin panels
- Implement proper pagination for large skill lists
- Use bulk operations for efficient management
- Provide search and filtering capabilities
- Show both active and inactive skills with clear status indicators

### For Security
- Never expose admin tokens in client-side code
- Use environment variables for API base URLs
- Implement proper error handling for authentication failures
- Validate data on both client and server sides
- Use HTTPS in production environments

## Integration with Portfolio

### Skills Section Display
```javascript
// Example: Display skills grouped by category
const SkillsSection = () => {
  const [skillsData, setSkillsData] = useState([]);
  
  useEffect(() => {
    fetchSkillsByCategory().then(data => {
      setSkillsData(data);
    });
  }, []);
  
  const renderSkillIcon = (icon, skillName) => {
    if (!icon || !icon.library || !icon.name) {
      return <div className="skill-icon-fallback">{skillName.charAt(0)}</div>;
    }
    
    // You'll need to implement icon library mapping here
    // See SKILLS_USAGE_EXAMPLES.md for complete implementation
    return <div className="skill-icon-placeholder">{skillName.charAt(0)}</div>;
  };
  
  return (
    <div className="skills-section">
      {skillsData.map(category => (
        <div key={category._id} className="skill-category">
          <h3>{category._id}</h3>
          <div className="skills-grid">
            {category.skills.map(skill => (
              <div key={skill._id} className="skill-card">
                {renderSkillIcon(skill.icon, skill.name)}
                <h4>{skill.name}</h4>
                <div className="proficiency-bar">
                  <div 
                    className="proficiency-fill" 
                    style={{ 
                      width: `${skill.proficiencyLevel}%`,
                      backgroundColor: skill.color 
                    }}
                  />
                </div>
                <p>{skill.description}</p>
                <span className="experience">{skill.yearsOfExperience} years</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
```

## Notes
- ✅ **Public endpoints** are optimized for frontend display with clean, active skills only
- 🔒 **Admin endpoints** require authentication and provide full management capabilities
- 📊 **Statistics endpoints** are available in both public and admin versions
- 🔄 **Reordering functionality** is admin-only for security
- 📈 **Performance optimized** with lean queries and proper indexing
- 🎨 **Rich metadata** support including icons, colors, certifications, and projects
- 🔍 **Search and filtering** capabilities for efficient skill management
- 📱 **Category-based organization** for better UX and management 