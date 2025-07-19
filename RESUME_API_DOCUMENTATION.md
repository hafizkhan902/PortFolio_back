# Resume API Documentation

This document describes the Resume management API endpoints for uploading, managing, and downloading PDF resumes.

## Base URLs
- **Public endpoints**: `http://localhost:4000/api/resume`
- **Admin endpoints**: `http://localhost:4000/api/admin/resume`

## Authentication
- **Public endpoints**: No authentication required
- **Admin endpoints**: Require admin authentication token in headers
  ```
  Authorization: Bearer <your-admin-token>
  ```

## Storage
- **PDF files are stored as binary data in MongoDB**
- **No local filesystem storage**
- **Automatic file cleanup on deletion**

---

## 📄 Public Endpoints

### 1. Get Active Resume
**GET** `/api/resume/active`

Returns the currently active and public resume.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "My Professional Resume",
    "originalName": "Hafiz_Resume_2024.pdf",
    "fileSize": 245760,
    "version": "2.0",
    "description": "Updated resume with latest experience",
    "isActive": true,
    "isPublic": true,
    "downloadCount": 15,
    "tags": ["professional", "2024", "full-stack"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "createdBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "username": "admin",
      "email": "admin@portfolio.com"
    }
  }
}
```

### 2. Get All Public Resumes
**GET** `/api/resume/public`

Returns all active and public resumes.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "My Professional Resume",
      "originalName": "Hafiz_Resume_2024.pdf",
      "version": "2.0",
      "description": "Updated resume with latest experience",
      "downloadCount": 15,
      "tags": ["professional", "2024", "full-stack"],
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Download Resume
**GET** `/api/resume/download/:id`

Downloads a specific resume file. Increments the download count.

**Parameters:**
- `id` (string): Resume ID

**Response:** PDF file download

**Headers:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Hafiz_Resume_2024.pdf"
Content-Length: 245760
```

---

## 🔐 Admin Endpoints

### 1. Get All Resumes (Admin)
**GET** `/api/admin/resume`

Returns all resumes including private ones (admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "My Professional Resume",
      "originalName": "Hafiz_Resume_2024.pdf",
      "fileSize": 245760,
      "version": "2.0",
      "description": "Updated resume with latest experience",
      "isActive": true,
      "isPublic": true,
      "downloadCount": 15,
      "tags": ["professional", "2024", "full-stack"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "username": "admin",
        "email": "admin@portfolio.com"
      },
      "updatedBy": null
    }
  ]
}
```

### 2. Upload/Update Resume
**POST** `/api/admin/resume`

Upload a new PDF resume or update existing one (admin only).

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>
```

**Body (Form Data):**
- `resume` (file): PDF file (max 10MB)
- `title` (string): Resume title
- `version` (string): Version number (unique)
- `description` (string, optional): Description
- `tags` (string, optional): Comma-separated tags
- `isPublic` (boolean, optional): Make public (default: true)
- `resumeId` (string, optional): If provided, updates existing resume

**Example Request (New Resume):**
```javascript
const formData = new FormData();
formData.append('resume', pdfFile);
formData.append('title', 'My Professional Resume');
formData.append('version', '2.0');
formData.append('description', 'Updated resume with latest experience');
formData.append('tags', 'professional, 2024, full-stack');
formData.append('isPublic', 'true');

fetch('/api/admin/resume', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken
  },
  body: formData
});
```

**Example Request (Update Resume):**
```javascript
const formData = new FormData();
formData.append('resume', pdfFile);
formData.append('title', 'Updated Resume Title');
formData.append('version', '2.1');
formData.append('resumeId', '64f8a1b2c3d4e5f6a7b8c9d0'); // Existing resume ID

fetch('/api/admin/resume', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken
  },
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "My Professional Resume",
    "originalName": "Hafiz_Resume_2024.pdf",
    "fileSize": 245760,
    "version": "2.0",
    "description": "Updated resume with latest experience",
    "isActive": true,
    "isPublic": true,
    "downloadCount": 0,
    "tags": ["professional", "2024", "full-stack"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "createdBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "username": "admin",
      "email": "admin@portfolio.com"
    }
  }
}
```

### 3. Get Single Resume (Admin)
**GET** `/api/admin/resume/:id`

Returns a specific resume by ID (admin only).

**Parameters:**
- `id` (string): Resume ID

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "My Professional Resume",
    "originalName": "Hafiz_Resume_2024.pdf",
    "fileSize": 245760,
    "version": "2.0",
    "description": "Updated resume with latest experience",
    "isActive": true,
    "isPublic": true,
    "downloadCount": 15,
    "tags": ["professional", "2024", "full-stack"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "createdBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "username": "admin",
      "email": "admin@portfolio.com"
    },
    "updatedBy": null
  }
}
```

### 4. Update Resume Metadata
**PUT** `/api/admin/resume/:id`

Update resume metadata (admin only).

**Parameters:**
- `id` (string): Resume ID

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <admin-token>
```

**Body:**
```json
{
  "title": "Updated Resume Title",
  "version": "2.1",
  "description": "Updated description",
  "tags": "professional, 2024, full-stack, updated",
  "isActive": true,
  "isPublic": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resume updated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "Updated Resume Title",
    "version": "2.1",
    "description": "Updated description",
    "isActive": true,
    "isPublic": true,
    "tags": ["professional", "2024", "full-stack", "updated"],
    "updatedBy": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "username": "admin",
      "email": "admin@portfolio.com"
    }
  }
}
```

### 5. Delete Resume
**DELETE** `/api/admin/resume/:id`

Delete a resume and its file data from database (admin only).

**Parameters:**
- `id` (string): Resume ID

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Resume deleted successfully"
}
```

### 6. Toggle Resume Active Status
**PATCH** `/api/admin/resume/:id/toggle-active`

Toggle the active status of a resume (admin only).

**Parameters:**
- `id` (string): Resume ID

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Resume activated successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "isActive": true
  }
}
```

### 7. Toggle Resume Public Status
**PATCH** `/api/admin/resume/:id/toggle-public`

Toggle the public status of a resume (admin only).

**Parameters:**
- `id` (string): Resume ID

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Resume made public successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "isPublic": true
  }
}
```

---

## 📋 Complete Endpoint Summary Table

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/api/resume/active` | ❌ | Get active resume |
| 2 | GET | `/api/resume/public` | ❌ | Get public resumes |
| 3 | GET | `/api/resume/download/:id` | ❌ | Download resume |
| 4 | GET | `/api/admin/resume` | ✅ | Get all resumes (admin) |
| 5 | POST | `/api/admin/resume` | ✅ | Upload/Update resume |
| 6 | GET | `/api/admin/resume/:id` | ✅ | Get specific resume |
| 7 | PUT | `/api/admin/resume/:id` | ✅ | Update resume metadata |
| 8 | DELETE | `/api/admin/resume/:id` | ✅ | Delete resume |
| 9 | PATCH | `/api/admin/resume/:id/toggle-active` | ✅ | Toggle active status |
| 10 | PATCH | `/api/admin/resume/:id/toggle-public` | ✅ | Toggle public status |

---

## 📋 Error Responses

### Common Error Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

### Common Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `No resume file provided` | No file uploaded |
| 400 | `Invalid file type. Only PDF files are allowed.` | Non-PDF file uploaded |
| 400 | `File size too large. Maximum size is 10MB.` | File exceeds size limit |
| 400 | `Version already exists. Please choose a different version.` | Duplicate version |
| 401 | `Invalid credentials` | Missing or invalid admin token |
| 404 | `Resume not found` | Resume ID doesn't exist |
| 404 | `No active resume found` | No active resume available |
| 500 | `Failed to upload resume` | Server error during upload |

---

## 🗂️ File Storage

- **Storage**: MongoDB as binary data (Buffer)
- **Max Size**: 10MB
- **Allowed Types**: PDF only
- **No local filesystem storage**
- **Automatic cleanup on deletion**

---

## 🔧 Database Schema

### Resume Model
```javascript
{
  title: String (required),
  originalName: String (required),
  fileData: Buffer (required), // PDF binary data
  contentType: String (required, default: 'application/pdf'),
  fileSize: Number (required),
  version: String (required, unique),
  description: String,
  isActive: Boolean (default: true),
  isPublic: Boolean (default: true),
  downloadCount: Number (default: 0),
  tags: [String],
  createdBy: ObjectId (ref: Admin),
  updatedBy: ObjectId (ref: Admin),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Usage Examples

### Frontend Integration

#### Upload New Resume
```javascript
const uploadResume = async (file, metadata) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('title', metadata.title);
  formData.append('version', metadata.version);
  formData.append('description', metadata.description);
  formData.append('tags', metadata.tags.join(','));
  formData.append('isPublic', metadata.isPublic);

  const response = await fetch('/api/admin/resume', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: formData
  });

  return response.json();
};
```

#### Update Existing Resume
```javascript
const updateResume = async (resumeId, file, metadata) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('title', metadata.title);
  formData.append('version', metadata.version);
  formData.append('resumeId', resumeId); // Key for update

  const response = await fetch('/api/admin/resume', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: formData
  });

  return response.json();
};
```

#### Get Admin Resumes
```javascript
const getAdminResumes = async () => {
  const response = await fetch('/api/admin/resume', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  
  return response.json();
};
```

#### Download Resume
```javascript
const downloadResume = async (resumeId, filename) => {
  const response = await fetch(`/api/resume/download/${resumeId}`);
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
```

#### Get Active Resume
```javascript
const getActiveResume = async () => {
  const response = await fetch('/api/resume/active');
  const result = await response.json();
  
  if (result.success) {
    return result.data;
  }
  return null;
};
```

---

## 🧪 Testing

Use the provided `test-resume-upload.html` file to test the resume functionality:

1. Start your server: `npm start`
2. Open `test-resume-upload.html` in your browser
3. Enter your admin token to authenticate
4. Upload a PDF resume
5. Test download functionality
6. Test admin management features

---

## 📝 Notes

- **Admin endpoints** are now under `/api/admin/resume`
- **Public endpoints** remain under `/api/resume`
- **PDF files are stored as binary data in MongoDB**
- **No local filesystem storage required**
- The same POST endpoint handles both upload and update (use `resumeId` for updates)
- Only one resume can be active at a time
- Version numbers must be unique
- Download count is automatically incremented on each download
- Admin authentication is required for all management operations
- Public endpoints are accessible without authentication
- File data is excluded from JSON responses for performance 