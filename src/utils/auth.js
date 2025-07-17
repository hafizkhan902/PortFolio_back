/**
 * Authentication utilities for React frontend
 * Handles JWT authentication with the Portfolio backend
 */

const API_BASE_URL = 'http://localhost:4000/api';
const TOKEN_KEY = 'authToken';

class AuthService {
  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
    this.isLoggingIn = false;
  }

  /**
   * Login with username and password
   */
  async login(username, password) {
    if (this.isLoggingIn) {
      throw new Error('Login already in progress');
    }

    this.isLoggingIn = true;
    
    try {
      console.log('🔐 Attempting login...');
      
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        this.token = data.data.token;
        localStorage.setItem(TOKEN_KEY, this.token);
        console.log('✅ Login successful, token stored');
        return data.data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    } finally {
      this.isLoggingIn = false;
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
    console.log('✅ Logged out successfully');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Get stored token
   */
  getToken() {
    return this.token || localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Make authenticated request
   */
  async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    console.log('🔑 Making authenticated request to:', url);
    console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      
      // Handle token expiration
      if (response.status === 401) {
        console.log('❌ Token expired or invalid, clearing auth state');
        this.logout();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        // Provide more detailed error message
        const errorMessage = data.error || data.message || `HTTP ${response.status}`;
        console.error('❌ Backend error details:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          message: data.message
        });
        throw new Error(errorMessage);
      }

      console.log('✅ Request successful');
      return data;
    } catch (error) {
      console.error('❌ Authenticated request failed:', error);
      
      // Clear auth state on authentication errors
      if (error.message.includes('jwt') || error.message.includes('token') || error.message.includes('Session expired')) {
        this.logout();
      }
      
      throw error;
    }
  }

  /**
   * Get admin profile
   */
  async getProfile() {
    return this.makeAuthenticatedRequest(`${API_BASE_URL}/admin/profile`);
  }

  /**
   * Get admin projects
   */
  async getAdminProjects(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.featured !== undefined) params.append('featured', filters.featured);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const url = `${API_BASE_URL}/admin/projects${params.toString() ? '?' + params.toString() : ''}`;
    return this.makeAuthenticatedRequest(url);
  }

  /**
   * Create new project
   */
  async createProject(projectData) {
    // Ensure required fields have default values
    const processedData = {
      ...projectData,
      // Provide defaults for required fields if missing or empty
      imageUrl: projectData.imageUrl || 'https://via.placeholder.com/600x400',
      githubUrl: projectData.githubUrl || 'https://github.com',
      completionDate: projectData.completionDate || new Date(),
      technologies: projectData.technologies && projectData.technologies.length > 0 
        ? projectData.technologies 
        : ['JavaScript'] // Default technology
    };

    console.log('🔄 Processed project data with defaults:', processedData);

    return this.makeAuthenticatedRequest(`${API_BASE_URL}/admin/projects`, {
      method: 'POST',
      body: JSON.stringify(processedData)
    });
  }

  /**
   * Update project
   */
  async updateProject(projectId, projectData) {
    return this.makeAuthenticatedRequest(`${API_BASE_URL}/admin/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  }

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    return this.makeAuthenticatedRequest(`${API_BASE_URL}/admin/projects/${projectId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get project statistics
   */
  async getStats() {
    return this.makeAuthenticatedRequest(`${API_BASE_URL}/admin/projects/stats`);
  }

  /**
   * Upload single image
   */
  async uploadImage(imageFile) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.status === 401) {
        this.logout();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images
   */
  async uploadImages(imageFiles) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const formData = new FormData();
    for (let i = 0; i < imageFiles.length; i++) {
      formData.append('images', imageFiles[i]);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/upload/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.status === 401) {
        this.logout();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ Images upload failed:', error);
      throw error;
    }
  }

  /**
   * Delete uploaded image
   */
  async deleteImage(filename) {
    return this.makeAuthenticatedRequest(`${API_BASE_URL}/upload/image/${filename}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get comprehensive admin statistics
   */
  async getAdminStatistics() {
    console.log('📊 Fetching admin statistics...');
    return this.makeAuthenticatedRequest(`${API_BASE_URL}/admin/statistics`);
  }

  /**
   * Get portfolio view statistics
   */
  async getViewStatistics() {
    return this.makeAuthenticatedRequest(`${API_BASE_URL}/admin/view-stats`);
  }

  /**
   * Track portfolio view (public endpoint)
   */
  async trackPortfolioView(pageData = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/track-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          page: pageData.page || window.location.pathname,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          ...pageData
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.warn('Failed to track view:', data.message);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('View tracking failed:', error);
      return null;
    }
  }

  /**
   * Get all contact messages with filtering and pagination
   */
  async getContactMessages(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const url = `${API_BASE_URL}/admin/messages${params.toString() ? '?' + params.toString() : ''}`;
    return this.makeAuthenticatedRequest(url);
  }

  /**
   * Get single contact message by ID
   */
  async getContactMessage(messageId) {
    return this.makeAuthenticatedRequest(`${API_BASE_URL}/admin/messages/${messageId}`);
  }

  /**
   * Update message status
   */
  async updateMessageStatus(messageId, status) {
    return this.makeAuthenticatedRequest(`${API_BASE_URL}/admin/messages/${messageId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  /**
   * Reply to a contact message
   */
  async replyToMessage(messageId, replyData) {
    return this.makeAuthenticatedRequest(`${API_BASE_URL}/admin/messages/${messageId}/reply`, {
      method: 'POST',
      body: JSON.stringify(replyData)
    });
  }

  /**
   * Delete a contact message
   */
  async deleteMessage(messageId) {
    return this.makeAuthenticatedRequest(`${API_BASE_URL}/admin/messages/${messageId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Perform bulk operations on messages
   */
  async bulkMessageOperation(action, messageIds) {
    return this.makeAuthenticatedRequest(`${API_BASE_URL}/admin/messages/bulk`, {
      method: 'POST',
      body: JSON.stringify({ action, messageIds })
    });
  }

  /**
   * Get message statistics
   */
  async getMessageStatistics() {
    return this.makeAuthenticatedRequest(`${API_BASE_URL}/admin/messages/stats`);
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService; 