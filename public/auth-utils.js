/**
 * Authentication Utilities for Portfolio Backend
 * 
 * This file provides ready-to-use functions for JWT authentication
 * with proper Bearer token handling and race condition prevention.
 */

const AuthUtils = {
  // Configuration
  API_BASE_URL: 'http://localhost:4000/api',
  TOKEN_KEY: 'authToken',
  
  // Internal state to prevent race conditions
  _isLoggingIn: false,
  _tokenPromise: null,
  _authState: {
    isAuthenticated: false,
    token: null,
    user: null
  },

  /**
   * Initialize authentication state
   */
  init() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      this._authState.token = token;
      this._authState.isAuthenticated = true;
    }
  },

  /**
   * Login with username and password
   * Prevents race conditions by ensuring only one login at a time
   */
  async login(username, password) {
    // Prevent multiple simultaneous login attempts
    if (this._isLoggingIn) {
      console.log('⏳ Login already in progress, waiting...');
      return this._tokenPromise;
    }

    this._isLoggingIn = true;
    
    this._tokenPromise = this._performLogin(username, password);
    
    try {
      const result = await this._tokenPromise;
      return result;
    } finally {
      this._isLoggingIn = false;
      this._tokenPromise = null;
    }
  },

  /**
   * Internal login method
   */
  async _performLogin(username, password) {
    try {
      console.log('🔐 Starting login process...');
      
      const response = await fetch(`${this.API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        const token = data.data.token;
        const user = data.data.admin;
        
        // Store token and update state atomically
        localStorage.setItem(this.TOKEN_KEY, token);
        this._authState.token = token;
        this._authState.user = user;
        this._authState.isAuthenticated = true;
        
        console.log('✅ Login successful, token stored and state updated');
        
        // Verify token immediately after login
        await this._verifyToken();
        
        return {
          token,
          user,
          isAuthenticated: true
        };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      this._clearAuthState();
      throw error;
    }
  },

  /**
   * Verify token is valid
   */
  async _verifyToken() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${this._authState.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this._authState.user = data.data;
        console.log('✅ Token verified successfully');
        return true;
      } else {
        console.log('❌ Token verification failed');
        this._clearAuthState();
        return false;
      }
    } catch (error) {
      console.error('❌ Token verification error:', error);
      this._clearAuthState();
      return false;
    }
  },

  /**
   * Clear authentication state
   */
  _clearAuthState() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._authState.token = null;
    this._authState.user = null;
    this._authState.isAuthenticated = false;
  },

  /**
   * Get stored authentication token
   */
  getToken() {
    return this._authState.token || localStorage.getItem(this.TOKEN_KEY);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this._authState.isAuthenticated && this._authState.token !== null;
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    return this._authState.user;
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      // Call backend logout endpoint if authenticated
      if (this.isAuthenticated()) {
        await fetch(`${this.API_BASE_URL}/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this._authState.token}`
          }
        });
      }
    } catch (error) {
      console.error('❌ Logout request failed:', error);
    } finally {
      this._clearAuthState();
      console.log('✅ Logged out successfully');
    }
  },

  /**
   * Make authenticated request with proper error handling
   * This method ensures token is available before making requests
   */
  async makeAuthenticatedRequest(url, options = {}) {
    // Wait for login to complete if in progress
    if (this._isLoggingIn && this._tokenPromise) {
      console.log('⏳ Waiting for login to complete...');
      await this._tokenPromise;
    }

    const token = this.getToken();
    
    if (!token) {
      const error = new Error('No authentication token found. Please login first.');
      error.code = 'NO_TOKEN';
      throw error;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
      });

      const data = await response.json();
      
      // Handle token expiration
      if (response.status === 401) {
        console.log('❌ Token expired, clearing auth state');
        this._clearAuthState();
        const error = new Error('Session expired. Please login again.');
        error.code = 'TOKEN_EXPIRED';
        throw error;
      }

      if (!response.ok) {
        const error = new Error(data.message || `HTTP ${response.status}`);
        error.code = 'REQUEST_FAILED';
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Authenticated request failed:', error);
      
      // Clear auth state on authentication errors
      if (error.message.includes('jwt') || error.message.includes('token')) {
        this._clearAuthState();
      }
      
      throw error;
    }
  },

  /**
   * Login and then fetch initial data
   * This prevents race conditions by ensuring login completes first
   */
  async loginAndFetchData(username, password, dataFetchers = []) {
    try {
      // Step 1: Login first
      console.log('🔐 Step 1: Logging in...');
      const authResult = await this.login(username, password);
      
      // Step 2: Fetch initial data sequentially
      console.log('📊 Step 2: Fetching initial data...');
      const results = {};
      
      for (const [key, fetcher] of Object.entries(dataFetchers)) {
        try {
          console.log(`📥 Fetching ${key}...`);
          results[key] = await fetcher();
        } catch (error) {
          console.error(`❌ Failed to fetch ${key}:`, error);
          results[key] = { error: error.message };
        }
      }
      
      return {
        auth: authResult,
        data: results
      };
    } catch (error) {
      console.error('❌ Login and data fetch failed:', error);
      throw error;
    }
  },

  /**
   * Get admin profile
   */
  async getProfile() {
    return this.makeAuthenticatedRequest(`${this.API_BASE_URL}/admin/profile`);
  },

  /**
   * Get projects for admin
   */
  async getAdminProjects(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.featured !== undefined) params.append('featured', filters.featured);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const url = `${this.API_BASE_URL}/admin/projects${params.toString() ? '?' + params.toString() : ''}`;
    return this.makeAuthenticatedRequest(url);
  },

  /**
   * Get project statistics
   */
  async getStats() {
    return this.makeAuthenticatedRequest(`${this.API_BASE_URL}/admin/projects/stats`);
  },

  /**
   * Create new project
   */
  async createProject(projectData) {
    return this.makeAuthenticatedRequest(`${this.API_BASE_URL}/admin/projects`, {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
  },

  /**
   * Update project
   */
  async updateProject(projectId, projectData) {
    return this.makeAuthenticatedRequest(`${this.API_BASE_URL}/admin/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
  },

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    return this.makeAuthenticatedRequest(`${this.API_BASE_URL}/admin/projects/${projectId}`, {
      method: 'DELETE'
    });
  },

  // ============ JOURNEY MANAGEMENT ============

  /**
   * Get all journey entries (public)
   */
  async getJourneyEntries() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/journey`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch journey entries');
      }
    } catch (error) {
      console.error('❌ Get journey entries error:', error);
      throw error;
    }
  },

  /**
   * Get single journey entry (public)
   */
  async getJourneyEntry(id) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/journey/${id}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch journey entry');
      }
    } catch (error) {
      console.error('❌ Get journey entry error:', error);
      throw error;
    }
  },

  /**
   * Create journey entry (admin only)
   */
  async createJourneyEntry(journeyData) {
    try {
      const data = await this.makeAuthenticatedRequest('/admin/journey', {
        method: 'POST',
        body: JSON.stringify(journeyData)
      });
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create journey entry');
      }
    } catch (error) {
      console.error('❌ Create journey entry error:', error);
      throw error;
    }
  },

  /**
   * Update journey entry (admin only)
   */
  async updateJourneyEntry(id, journeyData) {
    try {
      const data = await this.makeAuthenticatedRequest(`/admin/journey/${id}`, {
        method: 'PUT',
        body: JSON.stringify(journeyData)
      });
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update journey entry');
      }
    } catch (error) {
      console.error('❌ Update journey entry error:', error);
      throw error;
    }
  },

  /**
   * Delete journey entry (admin only)
   */
  async deleteJourneyEntry(id) {
    try {
      const data = await this.makeAuthenticatedRequest(`/admin/journey/${id}`, {
        method: 'DELETE'
      });
      
      if (data.success) {
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete journey entry');
      }
    } catch (error) {
      console.error('❌ Delete journey entry error:', error);
      throw error;
    }
  },

  // ============ SKILLS MANAGEMENT ============

  /**
   * Get all skills (public)
   * @param {Object} filters - Optional filters (category, proficiency, limit)
   */
  async getSkills(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const url = `${this.API_BASE_URL}/skills${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch skills');
      }
    } catch (error) {
      console.error('❌ Get skills error:', error);
      throw error;
    }
  },

  /**
   * Get skills grouped by category (public)
   */
  async getSkillsGrouped() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/skills/grouped`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch grouped skills');
      }
    } catch (error) {
      console.error('❌ Get grouped skills error:', error);
      throw error;
    }
  },

  /**
   * Get skills by category (public)
   * @param {string} category - Category name
   * @param {number} limit - Optional limit
   */
  async getSkillsByCategory(category, limit = null) {
    try {
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit);
      
      const url = `${this.API_BASE_URL}/skills/category/${category}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch skills by category');
      }
    } catch (error) {
      console.error('❌ Get skills by category error:', error);
      throw error;
    }
  },

  /**
   * Get single skill (public)
   */
  async getSkill(id) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/skills/${id}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch skill');
      }
    } catch (error) {
      console.error('❌ Get skill error:', error);
      throw error;
    }
  },

  /**
   * Get skills statistics (public)
   */
  async getSkillsStats() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/skills/stats/overview`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch skills statistics');
      }
    } catch (error) {
      console.error('❌ Get skills statistics error:', error);
      throw error;
    }
  },

  /**
   * Get available categories (public)
   */
  async getSkillsCategories() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/skills/meta/categories`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch skills categories');
      }
    } catch (error) {
      console.error('❌ Get skills categories error:', error);
      throw error;
    }
  },

  /**
   * Get admin skills (admin only)
   * @param {Object} filters - Optional filters (category, proficiency, isActive, search, page, limit)
   */
  async getAdminSkills(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const endpoint = `/admin/skills${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const data = await this.makeAuthenticatedRequest(endpoint);
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch admin skills');
      }
    } catch (error) {
      console.error('❌ Get admin skills error:', error);
      throw error;
    }
  },

  /**
   * Create skill (admin only)
   * @param {Object} skillData - Skill data object
   */
  async createSkill(skillData) {
    try {
      const data = await this.makeAuthenticatedRequest('/admin/skills', {
        method: 'POST',
        body: JSON.stringify(skillData)
      });
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create skill');
      }
    } catch (error) {
      console.error('❌ Create skill error:', error);
      throw error;
    }
  },

  /**
   * Update skill (admin only)
   * @param {string} id - Skill ID
   * @param {Object} skillData - Updated skill data
   */
  async updateSkill(id, skillData) {
    try {
      const data = await this.makeAuthenticatedRequest(`/admin/skills/${id}`, {
        method: 'PUT',
        body: JSON.stringify(skillData)
      });
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update skill');
      }
    } catch (error) {
      console.error('❌ Update skill error:', error);
      throw error;
    }
  },

  /**
   * Delete skill (admin only)
   * @param {string} id - Skill ID
   */
  async deleteSkill(id) {
    try {
      const data = await this.makeAuthenticatedRequest(`/admin/skills/${id}`, {
        method: 'DELETE'
      });
      
      if (data.success) {
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete skill');
      }
    } catch (error) {
      console.error('❌ Delete skill error:', error);
      throw error;
    }
  },

  /**
   * Toggle skill active status (admin only)
   * @param {string} id - Skill ID
   */
  async toggleSkillStatus(id) {
    try {
      const data = await this.makeAuthenticatedRequest(`/admin/skills/${id}/toggle-active`, {
        method: 'PATCH'
      });
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to toggle skill status');
      }
    } catch (error) {
      console.error('❌ Toggle skill status error:', error);
      throw error;
    }
  },

  /**
   * Bulk skill operations (admin only)
   * @param {string} action - Action to perform (activate, deactivate, delete)
   * @param {Array} skillIds - Array of skill IDs
   */
  async bulkSkillOperation(action, skillIds) {
    try {
      const data = await this.makeAuthenticatedRequest('/admin/skills/bulk', {
        method: 'POST',
        body: JSON.stringify({ action, skillIds })
      });
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to perform bulk operation');
      }
    } catch (error) {
      console.error('❌ Bulk skill operation error:', error);
      throw error;
    }
  },

  /**
   * Reorder skills within a category (admin only)
   * @param {string} category - Category name
   * @param {Array} skillIds - Array of skill IDs in desired order
   */
  async reorderSkills(category, skillIds) {
    try {
      const data = await this.makeAuthenticatedRequest('/admin/skills/reorder', {
        method: 'POST',
        body: JSON.stringify({ category, skillIds })
      });
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to reorder skills');
      }
    } catch (error) {
      console.error('❌ Reorder skills error:', error);
      throw error;
    }
  },

  /**
   * Get admin skills statistics (admin only)
   */
  async getAdminSkillsStats() {
    try {
      const data = await this.makeAuthenticatedRequest('/admin/skills/stats');
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch admin skills statistics');
      }
    } catch (error) {
      console.error('❌ Get admin skills statistics error:', error);
      throw error;
    }
  },

  // ============ REACT ICON UTILITIES ============

  /**
   * Get available React icon libraries
   */
  getAvailableIconLibraries() {
    return [
      { value: 'react-icons/fa', label: 'Font Awesome', description: 'Popular icon library' },
      { value: 'react-icons/si', label: 'Simple Icons', description: 'Brand icons' },
      { value: 'react-icons/di', label: 'Devicons', description: 'Developer icons' },
      { value: 'react-icons/ai', label: 'Ant Design', description: 'Ant Design icons' },
      { value: 'react-icons/bi', label: 'Bootstrap', description: 'Bootstrap icons' },
      { value: 'react-icons/bs', label: 'Bootstrap (old)', description: 'Bootstrap icons (legacy)' },
      { value: 'react-icons/fi', label: 'Feather', description: 'Feather icons' },
      { value: 'react-icons/gi', label: 'Game Icons', description: 'Game-related icons' },
      { value: 'react-icons/go', label: 'Github Octicons', description: 'GitHub icons' },
      { value: 'react-icons/gr', label: 'Grommet', description: 'Grommet icons' },
      { value: 'react-icons/hi', label: 'Heroicons', description: 'Heroicons by Tailwind' },
      { value: 'react-icons/im', label: 'IcoMoon', description: 'IcoMoon icons' },
      { value: 'react-icons/io', label: 'Ionicons 4', description: 'Ionicons v4' },
      { value: 'react-icons/io5', label: 'Ionicons 5', description: 'Ionicons v5' },
      { value: 'react-icons/md', label: 'Material Design', description: 'Material Design icons' },
      { value: 'react-icons/ri', label: 'Remix Icon', description: 'Remix icons' },
      { value: 'react-icons/tb', label: 'Tabler', description: 'Tabler icons' },
      { value: 'react-icons/ti', label: 'Typicons', description: 'Typicons' },
      { value: 'react-icons/vsc', label: 'VS Code', description: 'VS Code icons' },
      { value: 'react-icons/wi', label: 'Weather Icons', description: 'Weather-related icons' }
    ];
  },

  /**
   * Get popular icons for skills by category
   */
  getPopularSkillIcons() {
    return {
      frontend: [
        { library: 'react-icons/fa', name: 'FaReact', label: 'React' },
        { library: 'react-icons/fa', name: 'FaVuejs', label: 'Vue.js' },
        { library: 'react-icons/fa', name: 'FaAngular', label: 'Angular' },
        { library: 'react-icons/fa', name: 'FaHtml5', label: 'HTML5' },
        { library: 'react-icons/fa', name: 'FaCss3Alt', label: 'CSS3' },
        { library: 'react-icons/fa', name: 'FaJs', label: 'JavaScript' },
        { library: 'react-icons/si', name: 'SiTypescript', label: 'TypeScript' },
        { library: 'react-icons/si', name: 'SiTailwindcss', label: 'Tailwind CSS' },
        { library: 'react-icons/fa', name: 'FaSass', label: 'Sass' },
        { library: 'react-icons/si', name: 'SiNextdotjs', label: 'Next.js' }
      ],
      backend: [
        { library: 'react-icons/fa', name: 'FaNodeJs', label: 'Node.js' },
        { library: 'react-icons/fa', name: 'FaPython', label: 'Python' },
        { library: 'react-icons/fa', name: 'FaJava', label: 'Java' },
        { library: 'react-icons/si', name: 'SiExpress', label: 'Express.js' },
        { library: 'react-icons/si', name: 'SiDjango', label: 'Django' },
        { library: 'react-icons/si', name: 'SiSpring', label: 'Spring' },
        { library: 'react-icons/si', name: 'SiNestjs', label: 'NestJS' },
        { library: 'react-icons/si', name: 'SiPhp', label: 'PHP' },
        { library: 'react-icons/si', name: 'SiLaravel', label: 'Laravel' },
        { library: 'react-icons/si', name: 'SiRuby', label: 'Ruby' }
      ],
      database: [
        { library: 'react-icons/si', name: 'SiMongodb', label: 'MongoDB' },
        { library: 'react-icons/si', name: 'SiPostgresql', label: 'PostgreSQL' },
        { library: 'react-icons/si', name: 'SiMysql', label: 'MySQL' },
        { library: 'react-icons/si', name: 'SiRedis', label: 'Redis' },
        { library: 'react-icons/si', name: 'SiSqlite', label: 'SQLite' },
        { library: 'react-icons/si', name: 'SiOracle', label: 'Oracle' },
        { library: 'react-icons/si', name: 'SiMicrosoftsqlserver', label: 'SQL Server' },
        { library: 'react-icons/si', name: 'SiElasticsearch', label: 'Elasticsearch' }
      ],
      devops: [
        { library: 'react-icons/fa', name: 'FaDocker', label: 'Docker' },
        { library: 'react-icons/si', name: 'SiKubernetes', label: 'Kubernetes' },
        { library: 'react-icons/si', name: 'SiJenkins', label: 'Jenkins' },
        { library: 'react-icons/fa', name: 'FaGitAlt', label: 'Git' },
        { library: 'react-icons/si', name: 'SiGithubactions', label: 'GitHub Actions' },
        { library: 'react-icons/si', name: 'SiTerraform', label: 'Terraform' },
        { library: 'react-icons/si', name: 'SiAnsible', label: 'Ansible' },
        { library: 'react-icons/si', name: 'SiNginx', label: 'Nginx' }
      ],
      cloud: [
        { library: 'react-icons/fa', name: 'FaAws', label: 'AWS' },
        { library: 'react-icons/si', name: 'SiGooglecloud', label: 'Google Cloud' },
        { library: 'react-icons/si', name: 'SiMicrosoftazure', label: 'Azure' },
        { library: 'react-icons/si', name: 'SiHeroku', label: 'Heroku' },
        { library: 'react-icons/si', name: 'SiVercel', label: 'Vercel' },
        { library: 'react-icons/si', name: 'SiNetlify', label: 'Netlify' },
        { library: 'react-icons/si', name: 'SiDigitalocean', label: 'DigitalOcean' }
      ],
      tools: [
        { library: 'react-icons/si', name: 'SiVisualstudiocode', label: 'VS Code' },
        { library: 'react-icons/si', name: 'SiIntellijidea', label: 'IntelliJ IDEA' },
        { library: 'react-icons/si', name: 'SiPostman', label: 'Postman' },
        { library: 'react-icons/si', name: 'SiSlack', label: 'Slack' },
        { library: 'react-icons/si', name: 'SiJira', label: 'Jira' },
        { library: 'react-icons/si', name: 'SiTrello', label: 'Trello' },
        { library: 'react-icons/si', name: 'SiFigma', label: 'Figma' }
      ],
      mobile: [
        { library: 'react-icons/si', name: 'SiReact', label: 'React Native' },
        { library: 'react-icons/si', name: 'SiFlutter', label: 'Flutter' },
        { library: 'react-icons/si', name: 'SiSwift', label: 'Swift' },
        { library: 'react-icons/si', name: 'SiKotlin', label: 'Kotlin' },
        { library: 'react-icons/si', name: 'SiXamarin', label: 'Xamarin' },
        { library: 'react-icons/si', name: 'SiIonic', label: 'Ionic' }
      ],
      uiux: [
        { library: 'react-icons/si', name: 'SiFigma', label: 'Figma' },
        { library: 'react-icons/si', name: 'SiAdobexd', label: 'Adobe XD' },
        { library: 'react-icons/si', name: 'SiAdobeillustrator', label: 'Adobe Illustrator' },
        { library: 'react-icons/si', name: 'SiAdobephotoshop', label: 'Adobe Photoshop' },
        { library: 'react-icons/si', name: 'SiSketch', label: 'Sketch' },
        { library: 'react-icons/si', name: 'SiInvision', label: 'InVision' },
        { library: 'react-icons/si', name: 'SiFramer', label: 'Framer' },
        { library: 'react-icons/si', name: 'SiCanva', label: 'Canva' },
        { library: 'react-icons/si', name: 'SiBlender', label: 'Blender' },
        { library: 'react-icons/si', name: 'SiAdobeaftereffects', label: 'After Effects' }
      ]
    };
  },

  /**
   * Validate React icon configuration
   * @param {Object} icon - Icon configuration
   */
  validateReactIcon(icon) {
    const errors = [];
    
    if (!icon) {
      return { isValid: true, errors: [] }; // Icon is optional
    }

    if (icon.library && !icon.name) {
      errors.push('Icon name is required when library is specified');
    }

    if (icon.name && !icon.library) {
      errors.push('Icon library is required when name is specified');
    }

    const validLibraries = this.getAvailableIconLibraries().map(lib => lib.value);
    if (icon.library && !validLibraries.includes(icon.library)) {
      errors.push(`Invalid icon library. Must be one of: ${validLibraries.join(', ')}`);
    }

    if (icon.size && (icon.size < 12 || icon.size > 200)) {
      errors.push('Icon size must be between 12 and 200 pixels');
    }

    if (icon.name && (typeof icon.name !== 'string' || icon.name.trim().length === 0)) {
      errors.push('Icon name must be a non-empty string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Generate React icon import statement
   * @param {Object} icon - Icon configuration
   */
  generateIconImport(icon) {
    if (!icon || !icon.library || !icon.name) {
      return null;
    }

    return `import { ${icon.name} } from '${icon.library}';`;
  },

  /**
   * Generate React icon JSX
   * @param {Object} icon - Icon configuration
   * @param {Object} props - Additional props
   */
  generateIconJSX(icon, props = {}) {
    if (!icon || !icon.name) {
      return null;
    }

    const iconProps = {
      size: icon.size || 24,
      className: icon.className || '',
      ...props
    };

    const propsString = Object.entries(iconProps)
      .filter(([key, value]) => value !== '' && value !== null && value !== undefined)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        }
        return `${key}={${value}}`;
      })
      .join(' ');

    return `<${icon.name} ${propsString} />`;
  },

  /**
   * Search icons by name or category
   * @param {string} query - Search query
   * @param {string} category - Optional category filter
   */
  searchIcons(query, category = null) {
    const popularIcons = this.getPopularSkillIcons();
    let iconsToSearch = [];

    if (category && popularIcons[category]) {
      iconsToSearch = popularIcons[category];
    } else {
      iconsToSearch = Object.values(popularIcons).flat();
    }

    if (!query) {
      return iconsToSearch;
    }

    const searchTerm = query.toLowerCase();
    return iconsToSearch.filter(icon => 
      icon.name.toLowerCase().includes(searchTerm) ||
      icon.label.toLowerCase().includes(searchTerm)
    );
  },

  // ============ ADMIN UTILITIES ============
  
  // ============ HIGHLIGHTS MANAGEMENT ============

  /**
   * Get all highlights (public)
   * @param {Object} filters - Optional filters (category, featured, limit, page)
   */
  async getHighlights(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const url = `${this.API_BASE_URL}/highlights${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch highlights');
      }
    } catch (error) {
      console.error('❌ Get highlights error:', error);
      throw error;
    }
  },

  /**
   * Get highlights grouped by category (public)
   */
  async getHighlightsGrouped() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/highlights/grouped`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch grouped highlights');
      }
    } catch (error) {
      console.error('❌ Get grouped highlights error:', error);
      throw error;
    }
  },

  /**
   * Get highlights by category (public)
   * @param {string} category - Category name
   * @param {number} limit - Optional limit
   */
  async getHighlightsByCategory(category, limit = null) {
    try {
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit);
      
      const url = `${this.API_BASE_URL}/highlights/category/${category}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch highlights by category');
      }
    } catch (error) {
      console.error('❌ Get highlights by category error:', error);
      throw error;
    }
  },

  /**
   * Get single highlight (public)
   */
  async getHighlight(id) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/highlights/${id}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch highlight');
      }
    } catch (error) {
      console.error('❌ Get highlight error:', error);
      throw error;
    }
  },

  /**
   * Get featured highlights (public)
   * @param {number} limit - Optional limit (default: 6)
   */
  async getFeaturedHighlights(limit = 6) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/highlights/featured/list?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch featured highlights');
      }
    } catch (error) {
      console.error('❌ Get featured highlights error:', error);
      throw error;
    }
  },

  /**
   * Get highlights statistics (public)
   */
  async getHighlightsStats() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/highlights/stats/overview`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch highlights statistics');
      }
    } catch (error) {
      console.error('❌ Get highlights statistics error:', error);
      throw error;
    }
  },

  /**
   * Get available highlight categories (public)
   */
  async getHighlightCategories() {
    try {
      const response = await fetch(`${this.API_BASE_URL}/highlights/meta/categories`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch highlight categories');
      }
    } catch (error) {
      console.error('❌ Get highlight categories error:', error);
      throw error;
    }
  },

  /**
   * Get admin highlights (admin only)
   * @param {Object} filters - Optional filters (category, featured, isActive, search, page, limit)
   */
  async getAdminHighlights(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          queryParams.append(key, filters[key]);
        }
      });
      
      const endpoint = `/admin/highlights${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const data = await this.makeAuthenticatedRequest(endpoint);
      
      if (data.success) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to fetch admin highlights');
      }
    } catch (error) {
      console.error('❌ Get admin highlights error:', error);
      throw error;
    }
  },

  /**
   * Create highlight (admin only)
   * @param {Object} highlightData - Highlight data object
   */
  async createHighlight(highlightData) {
    try {
      const data = await this.makeAuthenticatedRequest('/admin/highlights', {
        method: 'POST',
        body: JSON.stringify(highlightData)
      });
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to create highlight');
      }
    } catch (error) {
      console.error('❌ Create highlight error:', error);
      throw error;
    }
  },

  /**
   * Update highlight (admin only)
   * @param {string} id - Highlight ID
   * @param {Object} highlightData - Updated highlight data
   */
  async updateHighlight(id, highlightData) {
    try {
      const data = await this.makeAuthenticatedRequest(`/admin/highlights/${id}`, {
        method: 'PUT',
        body: JSON.stringify(highlightData)
      });
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update highlight');
      }
    } catch (error) {
      console.error('❌ Update highlight error:', error);
      throw error;
    }
  },

  /**
   * Delete highlight (admin only)
   * @param {string} id - Highlight ID
   */
  async deleteHighlight(id) {
    try {
      const data = await this.makeAuthenticatedRequest(`/admin/highlights/${id}`, {
        method: 'DELETE'
      });
      
      if (data.success) {
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete highlight');
      }
    } catch (error) {
      console.error('❌ Delete highlight error:', error);
      throw error;
    }
  },

  /**
   * Toggle highlight featured status (admin only)
   * @param {string} id - Highlight ID
   */
  async toggleHighlightFeatured(id) {
    try {
      const data = await this.makeAuthenticatedRequest(`/admin/highlights/${id}/toggle-featured`, {
        method: 'PATCH'
      });
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to toggle highlight featured status');
      }
    } catch (error) {
      console.error('❌ Toggle highlight featured status error:', error);
      throw error;
    }
  },

  /**
   * Toggle highlight active status (admin only)
   * @param {string} id - Highlight ID
   */
  async toggleHighlightActive(id) {
    try {
      const data = await this.makeAuthenticatedRequest(`/admin/highlights/${id}/toggle-active`, {
        method: 'PATCH'
      });
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to toggle highlight active status');
      }
    } catch (error) {
      console.error('❌ Toggle highlight active status error:', error);
      throw error;
    }
  },

  /**
   * Bulk highlight operations (admin only)
   * @param {string} action - Action to perform (activate, deactivate, feature, unfeature, delete)
   * @param {Array} highlightIds - Array of highlight IDs
   */
  async bulkHighlightOperation(action, highlightIds) {
    try {
      const data = await this.makeAuthenticatedRequest('/admin/highlights/bulk', {
        method: 'POST',
        body: JSON.stringify({ action, highlightIds })
      });
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to perform bulk operation');
      }
    } catch (error) {
      console.error('❌ Bulk highlight operation error:', error);
      throw error;
    }
  },

  /**
   * Reorder highlights (admin only)
   * @param {Array} highlightIds - Array of highlight IDs in desired order
   */
  async reorderHighlights(highlightIds) {
    try {
      const data = await this.makeAuthenticatedRequest('/admin/highlights/reorder', {
        method: 'POST',
        body: JSON.stringify({ highlightIds })
      });
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to reorder highlights');
      }
    } catch (error) {
      console.error('❌ Reorder highlights error:', error);
      throw error;
    }
  },

  /**
   * Get admin highlights statistics (admin only)
   */
  async getAdminHighlightsStats() {
    try {
      const data = await this.makeAuthenticatedRequest('/admin/highlights/stats');
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch admin highlights statistics');
      }
    } catch (error) {
      console.error('❌ Get admin highlights statistics error:', error);
      throw error;
    }
  }
};

// Initialize on load
if (typeof window !== 'undefined') {
  AuthUtils.init();
  window.AuthUtils = AuthUtils;
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthUtils;
}

// Example usage to prevent race conditions:
/*
// ❌ BAD: Race condition prone
async function badLogin() {
  await AuthUtils.login('admin', 'admin123');
  const profile = await AuthUtils.getProfile(); // Might fail if token not ready
  const projects = await AuthUtils.getAdminProjects(); // Might fail
}

// ✅ GOOD: Race condition safe
async function goodLogin() {
  const result = await AuthUtils.loginAndFetchData('admin', 'admin123', {
    profile: () => AuthUtils.getProfile(),
    projects: () => AuthUtils.getAdminProjects(),
    stats: () => AuthUtils.getStats()
  });
  
  console.log('Auth:', result.auth);
  console.log('Profile:', result.data.profile);
  console.log('Projects:', result.data.projects);
  console.log('Stats:', result.data.stats);
}

// ✅ GOOD: Manual sequential approach
async function manualSequentialLogin() {
  try {
    // Step 1: Login
    await AuthUtils.login('admin', 'admin123');
    
    // Step 2: Wait a bit to ensure token is ready (optional)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Step 3: Fetch data
    const profile = await AuthUtils.getProfile();
    const projects = await AuthUtils.getAdminProjects();
    
    console.log('Profile:', profile);
    console.log('Projects:', projects);
  } catch (error) {
    console.error('Login flow failed:', error);
  }
}
*/ 