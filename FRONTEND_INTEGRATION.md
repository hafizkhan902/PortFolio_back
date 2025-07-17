# Frontend Integration Guide

## 🚀 JWT Authentication with Bearer Token

This guide shows how to properly integrate your frontend with the backend JWT authentication system.

## ⚠️ Common Issue: "Bearer undefined"

The most common error is sending `Bearer undefined` instead of `Bearer <actual-token>`. This happens when:

1. Token is not properly stored after login
2. Token is not properly retrieved from storage
3. Token is undefined/null when making requests

## ✅ Correct Implementation

### 1. **Login and Store Token**

```javascript
// ✅ CORRECT: Login and store token
const login = async (username, password) => {
  try {
    const response = await fetch('http://localhost:4000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    
    if (data.success) {
      // ✅ Store the token properly
      localStorage.setItem('authToken', data.data.token);
      
      // ✅ Or use sessionStorage for session-only storage
      // sessionStorage.setItem('authToken', data.data.token);
      
      console.log('Login successful, token stored:', data.data.token);
      return data.data.token;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### 2. **Retrieve Token and Make Authenticated Requests**

```javascript
// ✅ CORRECT: Get token and make authenticated request
const makeAuthenticatedRequest = async (url, options = {}) => {
  // ✅ Get token from storage
  const token = localStorage.getItem('authToken');
  
  // ✅ Check if token exists
  if (!token) {
    throw new Error('No authentication token found. Please login first.');
  }

  // ✅ Make request with proper Bearer token
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // ✅ Proper Bearer format
      ...options.headers
    }
  });

  const data = await response.json();
  
  // ✅ Handle token expiration
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    throw new Error('Session expired. Please login again.');
  }

  return data;
};
```

### 3. **Example Usage in React**

```javascript
import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Login function
  const handleLogin = async (username, password) => {
    try {
      setLoading(true);
      const token = await login(username, password);
      
      // ✅ Token is now stored, fetch protected data
      await fetchProjects();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch projects with authentication
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await makeAuthenticatedRequest('http://localhost:4000/api/projects');
      setProjects(data.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create new project
  const createProject = async (projectData) => {
    try {
      setLoading(true);
      const data = await makeAuthenticatedRequest('http://localhost:4000/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      });
      
      // ✅ Refresh projects list
      await fetchProjects();
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update project
  const updateProject = async (projectId, projectData) => {
    try {
      setLoading(true);
      const data = await makeAuthenticatedRequest(`http://localhost:4000/api/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(projectData)
      });
      
      // ✅ Refresh projects list
      await fetchProjects();
      return data;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete project
  const deleteProject = async (projectId) => {
    try {
      setLoading(true);
      await makeAuthenticatedRequest(`http://localhost:4000/api/projects/${projectId}`, {
        method: 'DELETE'
      });
      
      // ✅ Refresh projects list
      await fetchProjects();
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Your UI components */}
    </div>
  );
};
```

### 4. **Custom Hook for Authentication**

```javascript
// ✅ Custom hook for authentication
import { useState, useEffect } from 'react';

const useAuth = () => {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Check for existing token on mount
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:4000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        const newToken = data.data.token;
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
        setIsAuthenticated(true);
        return newToken;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setIsAuthenticated(false);
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    const data = await response.json();
    
    if (response.status === 401) {
      logout(); // ✅ Auto-logout on token expiration
      throw new Error('Session expired. Please login again.');
    }

    return data;
  };

  return {
    token,
    isAuthenticated,
    loading,
    login,
    logout,
    makeAuthenticatedRequest
  };
};

export default useAuth;
```

### 5. **Using the Custom Hook**

```javascript
import React from 'react';
import useAuth from './useAuth';

const App = () => {
  const { isAuthenticated, login, logout, makeAuthenticatedRequest } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login('admin', 'admin123');
      console.log('Login successful!');
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await makeAuthenticatedRequest('http://localhost:4000/api/admin/profile');
      console.log('Profile:', data.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error.message);
    }
  };

  return (
    <div>
      {!isAuthenticated ? (
        <form onSubmit={handleLogin}>
          <button type="submit">Login</button>
        </form>
      ) : (
        <div>
          <button onClick={fetchProfile}>Get Profile</button>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
};
```

## ❌ Common Mistakes to Avoid

### 1. **Sending undefined token**
```javascript
// ❌ WRONG: This sends "Bearer undefined"
const token = undefined;
headers: {
  'Authorization': `Bearer ${token}` // Results in "Bearer undefined"
}

// ✅ CORRECT: Check token first
const token = localStorage.getItem('authToken');
if (!token) {
  throw new Error('No token found');
}
headers: {
  'Authorization': `Bearer ${token}`
}
```

### 2. **Not storing token after login**
```javascript
// ❌ WRONG: Login but don't store token
const login = async () => {
  const response = await fetch('/api/admin/login', { ... });
  const data = await response.json();
  // Missing: localStorage.setItem('authToken', data.data.token);
};

// ✅ CORRECT: Always store token after successful login
const login = async () => {
  const response = await fetch('/api/admin/login', { ... });
  const data = await response.json();
  localStorage.setItem('authToken', data.data.token); // ✅ Store token
};
```

### 3. **Not handling token expiration**
```javascript
// ❌ WRONG: Don't handle 401 responses
const makeRequest = async () => {
  const response = await fetch('/api/projects', { ... });
  return response.json(); // Ignores 401 errors
};

// ✅ CORRECT: Handle token expiration
const makeRequest = async () => {
  const response = await fetch('/api/projects', { ... });
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    throw new Error('Session expired');
  }
  return response.json();
};
```

## 🔧 Testing Your Implementation

### 1. **Test Login**
```bash
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### 2. **Test Authenticated Request**
```bash
# Replace TOKEN with actual token from login response
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/admin/profile
```

### 3. **Test Invalid Token**
```bash
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:4000/api/admin/profile
```

## 🚀 Ready to Use

Your backend is properly configured and ready for frontend integration. The key points:

1. **✅ Login** returns JWT token
2. **✅ Store** token in localStorage/sessionStorage
3. **✅ Send** token as `Authorization: Bearer <token>`
4. **✅ Handle** token expiration (401 responses)
5. **✅ Remove** token on logout

The backend will properly extract the token from the `Bearer` prefix and validate it. The enhanced logging will help you debug any issues during development. 