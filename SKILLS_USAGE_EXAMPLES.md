# Skills API Usage Examples

This document provides comprehensive examples of how to use the Skills & Expertise API in your frontend applications.

## Quick Start

### 1. Basic Skills Display (Public API)

```javascript
// Display all skills in your portfolio
async function displaySkills() {
  try {
    const skills = await fetch('http://localhost:4000/api/skills').then(r => r.json());
    
    if (skills.success) {
      const skillsContainer = document.getElementById('skills-container');
      
      skills.data.forEach(skill => {
        const skillCard = document.createElement('div');
        skillCard.className = 'skill-card';
        
        // Handle React icon display
        const iconDisplay = skill.icon && skill.icon.library && skill.icon.name 
          ? `<div class="skill-icon-placeholder" data-library="${skill.icon.library}" data-name="${skill.icon.name}" data-size="${skill.icon.size || 24}" data-classname="${skill.icon.className || ''}">
               <span class="icon-fallback">${skill.name.charAt(0)}</span>
             </div>`
          : `<div class="skill-icon-placeholder"><span class="icon-fallback">${skill.name.charAt(0)}</span></div>`;
        
        skillCard.innerHTML = `
          <div class="skill-header">
            ${iconDisplay}
            <h3>${skill.name}</h3>
            <span class="skill-category">${skill.category}</span>
          </div>
          <div class="skill-proficiency">
            <div class="proficiency-bar">
              <div class="proficiency-fill" style="width: ${skill.proficiencyLevel}%; background-color: ${skill.color}"></div>
            </div>
            <span class="proficiency-text">${skill.proficiency} (${skill.proficiencyLevel}%)</span>
          </div>
          <p class="skill-description">${skill.description}</p>
          <div class="skill-meta">
            <span class="experience">${skill.yearsOfExperience} years experience</span>
            <div class="projects">
              Projects: ${skill.projects.join(', ')}
            </div>
          </div>
        `;
        skillsContainer.appendChild(skillCard);
      });
    }
  } catch (error) {
    console.error('Failed to load skills:', error);
  }
}

// Call the function when page loads
document.addEventListener('DOMContentLoaded', displaySkills);
```

### 2. Skills Grouped by Category (Recommended)

```javascript
// Display skills organized by categories
async function displaySkillsByCategory() {
  try {
    const response = await fetch('http://localhost:4000/api/skills/grouped');
    const data = await response.json();
    
    if (data.success) {
      const skillsContainer = document.getElementById('skills-container');
      
      data.data.forEach(categoryGroup => {
        const categorySection = document.createElement('div');
        categorySection.className = 'skills-category';
        categorySection.innerHTML = `
          <h2 class="category-title">${categoryGroup._id.toUpperCase()}</h2>
          <div class="category-skills"></div>
        `;
        
        const categorySkills = categorySection.querySelector('.category-skills');
        
        categoryGroup.skills.forEach(skill => {
          const skillCard = document.createElement('div');
          skillCard.className = 'skill-card';
          
          // Handle React icon display
          const iconDisplay = skill.icon && skill.icon.library && skill.icon.name 
            ? `<div class="skill-icon-placeholder" data-library="${skill.icon.library}" data-name="${skill.icon.name}" data-size="${skill.icon.size || 24}" data-classname="${skill.icon.className || ''}">
                 <span class="icon-fallback">${skill.name.charAt(0)}</span>
               </div>`
            : `<div class="skill-icon-placeholder"><span class="icon-fallback">${skill.name.charAt(0)}</span></div>`;
          
          skillCard.innerHTML = `
            <div class="skill-content">
              ${iconDisplay}
              <h4>${skill.name}</h4>
              <div class="proficiency-bar">
                <div class="proficiency-fill" 
                     style="width: ${skill.proficiencyLevel}%; background-color: ${skill.color}">
                </div>
              </div>
              <span class="proficiency-level">${skill.proficiencyLevel}%</span>
              <p class="skill-description">${skill.description}</p>
              <div class="skill-experience">${skill.yearsOfExperience} years</div>
            </div>
          `;
          categorySkills.appendChild(skillCard);
        });
        
        skillsContainer.appendChild(categorySection);
      });
    }
  } catch (error) {
    console.error('Failed to load grouped skills:', error);
  }
}
```

### 3. React Component Example (Recommended)

```jsx
import React, { useState, useEffect } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as SiIcons from 'react-icons/si';
import * as DiIcons from 'react-icons/di';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import * as BsIcons from 'react-icons/bs';
import * as FiIcons from 'react-icons/fi';
import * as GiIcons from 'react-icons/gi';
import * as GoIcons from 'react-icons/go';
import * as GrIcons from 'react-icons/gr';
import * as HiIcons from 'react-icons/hi';
import * as ImIcons from 'react-icons/im';
import * as IoIcons from 'react-icons/io';
import * as Io5Icons from 'react-icons/io5';
import * as MdIcons from 'react-icons/md';
import * as RiIcons from 'react-icons/ri';
import * as TbIcons from 'react-icons/tb';
import * as TiIcons from 'react-icons/ti';
import * as VscIcons from 'react-icons/vsc';
import * as WiIcons from 'react-icons/wi';
import './SkillsSection.css';

const SkillsSection = () => {
  const [skillsData, setSkillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon library mapping
  const iconLibraries = {
    'react-icons/fa': FaIcons,
    'react-icons/si': SiIcons,
    'react-icons/di': DiIcons,
    'react-icons/ai': AiIcons,
    'react-icons/bi': BiIcons,
    'react-icons/bs': BsIcons,
    'react-icons/fi': FiIcons,
    'react-icons/gi': GiIcons,
    'react-icons/go': GoIcons,
    'react-icons/gr': GrIcons,
    'react-icons/hi': HiIcons,
    'react-icons/im': ImIcons,
    'react-icons/io': IoIcons,
    'react-icons/io5': Io5Icons,
    'react-icons/md': MdIcons,
    'react-icons/ri': RiIcons,
    'react-icons/tb': TbIcons,
    'react-icons/ti': TiIcons,
    'react-icons/vsc': VscIcons,
    'react-icons/wi': WiIcons
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/skills/grouped');
        const data = await response.json();
        
        if (data.success) {
          setSkillsData(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to load skills');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const renderSkillIcon = (icon, skillName) => {
    if (!icon || !icon.library || !icon.name) {
      return <div className="skill-icon-fallback">{skillName.charAt(0)}</div>;
    }

    const IconLibrary = iconLibraries[icon.library];
    if (!IconLibrary) {
      return <div className="skill-icon-fallback">{skillName.charAt(0)}</div>;
    }

    const IconComponent = IconLibrary[icon.name];
    if (!IconComponent) {
      return <div className="skill-icon-fallback">{skillName.charAt(0)}</div>;
    }

    return (
      <IconComponent 
        size={icon.size || 24}
        className={`skill-icon ${icon.className || ''}`}
      />
    );
  };

  if (loading) return <div className="loading">Loading skills...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <section className="skills-section">
      <h2>Skills & Expertise</h2>
      
      {skillsData.map(category => (
        <div key={category._id} className="skill-category">
          <h3 className="category-title">{category._id}</h3>
          <div className="skills-grid">
            {category.skills.map(skill => (
              <div key={skill._id} className="skill-card">
                <div className="skill-header">
                  {renderSkillIcon(skill.icon, skill.name)}
                  <h4>{skill.name}</h4>
                </div>
                
                <div className="proficiency-container">
                  <div className="proficiency-bar">
                    <div 
                      className="proficiency-fill" 
                      style={{ 
                        width: `${skill.proficiencyLevel}%`,
                        backgroundColor: skill.color 
                      }}
                    />
                  </div>
                  <span className="proficiency-text">
                    {skill.proficiency} ({skill.proficiencyLevel}%)
                  </span>
                </div>
                
                <p className="skill-description">{skill.description}</p>
                
                <div className="skill-meta">
                  <span className="experience">
                    {skill.yearsOfExperience} years experience
                  </span>
                  
                  {skill.projects.length > 0 && (
                    <div className="projects">
                      <strong>Projects:</strong>
                      <ul>
                        {skill.projects.map((project, index) => (
                          <li key={index}>{project}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {skill.certifications.length > 0 && (
                    <div className="certifications">
                      <strong>Certifications:</strong>
                      <ul>
                        {skill.certifications.map((cert, index) => (
                          <li key={index}>
                            <a href={cert.url} target="_blank" rel="noopener noreferrer">
                              {cert.name} - {cert.issuer}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default SkillsSection;
```

### 4. Vue.js Component Example

```vue
<template>
  <section class="skills-section">
    <h2>Skills & Expertise</h2>
    
    <div v-if="loading" class="loading">Loading skills...</div>
    <div v-else-if="error" class="error">Error: {{ error }}</div>
    
    <div v-else class="skills-container">
      <div v-for="category in skillsData" :key="category._id" class="skill-category">
        <h3 class="category-title">{{ category._id.toUpperCase() }}</h3>
        
        <div class="skills-grid">
          <div v-for="skill in category.skills" :key="skill._id" class="skill-card">
            <div class="skill-header">
              <div class="skill-icon-container">
                <component 
                  v-if="getIconComponent(skill.icon)"
                  :is="getIconComponent(skill.icon)"
                  :size="skill.icon?.size || 24"
                  :class="['skill-icon', skill.icon?.className || '']"
                />
                <div v-else class="skill-icon-fallback">{{ skill.name.charAt(0) }}</div>
              </div>
              <h4>{{ skill.name }}</h4>
            </div>
            
            <div class="proficiency-container">
              <div class="proficiency-bar">
                <div 
                  class="proficiency-fill" 
                  :style="{ 
                    width: `${skill.proficiencyLevel}%`,
                    backgroundColor: skill.color 
                  }"
                />
              </div>
              <span class="proficiency-text">
                {{ skill.proficiency }} ({{ skill.proficiencyLevel }}%)
              </span>
            </div>
            
            <p class="skill-description">{{ skill.description }}</p>
            
            <div class="skill-meta">
              <span class="experience">
                {{ skill.yearsOfExperience }} years experience
              </span>
              
              <div v-if="skill.projects.length > 0" class="projects">
                <strong>Projects:</strong>
                <ul>
                  <li v-for="(project, index) in skill.projects" :key="index">
                    {{ project }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { 
  FaReact, FaVuejs, FaAngular, FaNodeJs, FaPython, FaJava, FaDocker, FaGitAlt, FaAws,
  FaHtml5, FaCss3Alt, FaJs, FaSass
} from 'react-icons/fa';
import { 
  SiTypescript, SiMongodb, SiPostgresql, SiExpress, SiDjango, SiKubernetes,
  SiTailwindcss, SiNextdotjs, SiMysql, SiRedis
} from 'react-icons/si';

export default {
  name: 'SkillsSection',
  components: {
    FaReact, FaVuejs, FaAngular, FaNodeJs, FaPython, FaJava, FaDocker, FaGitAlt, FaAws,
    FaHtml5, FaCss3Alt, FaJs, FaSass,
    SiTypescript, SiMongodb, SiPostgresql, SiExpress, SiDjango, SiKubernetes,
    SiTailwindcss, SiNextdotjs, SiMysql, SiRedis
  },
  data() {
    return {
      skillsData: [],
      loading: true,
      error: null
    };
  },
  
  async mounted() {
    await this.fetchSkills();
  },
  
  methods: {
    async fetchSkills() {
      try {
        const response = await fetch('http://localhost:4000/api/skills/grouped');
        const data = await response.json();
        
        if (data.success) {
          this.skillsData = data.data;
        } else {
          this.error = data.message;
        }
      } catch (err) {
        this.error = 'Failed to load skills';
      } finally {
        this.loading = false;
      }
    },
    
    getIconComponent(icon) {
      if (!icon || !icon.library || !icon.name) {
        return null;
      }
      
      // Map icon names to component names
      const iconMap = {
        'FaReact': 'FaReact',
        'FaVuejs': 'FaVuejs',
        'FaAngular': 'FaAngular',
        'FaNodeJs': 'FaNodeJs',
        'FaPython': 'FaPython',
        'FaJava': 'FaJava',
        'FaDocker': 'FaDocker',
        'FaGitAlt': 'FaGitAlt',
        'FaAws': 'FaAws',
        'FaHtml5': 'FaHtml5',
        'FaCss3Alt': 'FaCss3Alt',
        'FaJs': 'FaJs',
        'FaSass': 'FaSass',
        'SiTypescript': 'SiTypescript',
        'SiMongodb': 'SiMongodb',
        'SiPostgresql': 'SiPostgresql',
        'SiExpress': 'SiExpress',
        'SiDjango': 'SiDjango',
        'SiKubernetes': 'SiKubernetes',
        'SiTailwindcss': 'SiTailwindcss',
        'SiNextdotjs': 'SiNextdotjs',
        'SiMysql': 'SiMysql',
        'SiRedis': 'SiRedis'
      };
      
      return iconMap[icon.name] || null;
    }
  }
};
</script>
```

## Advanced Usage Examples

### 5. Skills with Filtering

```javascript
class SkillsManager {
  constructor() {
    this.allSkills = [];
    this.filteredSkills = [];
    this.currentCategory = 'all';
    this.currentProficiency = 'all';
  }

  async init() {
    await this.loadSkills();
    this.setupFilters();
    this.render();
  }

  async loadSkills() {
    try {
      const response = await fetch('http://localhost:4000/api/skills');
      const data = await response.json();
      
      if (data.success) {
        this.allSkills = data.data;
        this.filteredSkills = [...this.allSkills];
      }
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  }

  setupFilters() {
    // Category filter
    document.getElementById('category-filter').addEventListener('change', (e) => {
      this.currentCategory = e.target.value;
      this.applyFilters();
    });

    // Proficiency filter
    document.getElementById('proficiency-filter').addEventListener('change', (e) => {
      this.currentProficiency = e.target.value;
      this.applyFilters();
    });
  }

  applyFilters() {
    this.filteredSkills = this.allSkills.filter(skill => {
      const categoryMatch = this.currentCategory === 'all' || skill.category === this.currentCategory;
      const proficiencyMatch = this.currentProficiency === 'all' || skill.proficiency === this.currentProficiency;
      
      return categoryMatch && proficiencyMatch;
    });
    
    this.render();
  }

  render() {
    const container = document.getElementById('skills-container');
    container.innerHTML = '';
    
    this.filteredSkills.forEach(skill => {
      const skillElement = this.createSkillElement(skill);
      container.appendChild(skillElement);
    });
  }

  createSkillElement(skill) {
    const skillCard = document.createElement('div');
    skillCard.className = 'skill-card';
    
    // Handle React icon display
    const iconDisplay = skill.icon && skill.icon.library && skill.icon.name 
      ? `<div class="skill-icon-placeholder" data-library="${skill.icon.library}" data-name="${skill.icon.name}" data-size="${skill.icon.size || 24}" data-classname="${skill.icon.className || ''}">
           <span class="icon-fallback">${skill.name.charAt(0)}</span>
         </div>`
      : `<div class="skill-icon-placeholder"><span class="icon-fallback">${skill.name.charAt(0)}</span></div>`;
    
    skillCard.innerHTML = `
      <div class="skill-content">
        ${iconDisplay}
        <h4>${skill.name}</h4>
        <span class="category-badge">${skill.category}</span>
        <div class="proficiency-bar">
          <div class="proficiency-fill" 
               style="width: ${skill.proficiencyLevel}%; background-color: ${skill.color}">
          </div>
        </div>
        <span class="proficiency-level">${skill.proficiency} (${skill.proficiencyLevel}%)</span>
        <p class="description">${skill.description}</p>
        <div class="experience">${skill.yearsOfExperience} years experience</div>
      </div>
    `;
    return skillCard;
  }
}

// Initialize the skills manager
const skillsManager = new SkillsManager();
document.addEventListener('DOMContentLoaded', () => {
  skillsManager.init();
});
```

### 6. Skills Statistics Dashboard

```javascript
async function createSkillsDashboard() {
  try {
    const response = await fetch('http://localhost:4000/api/skills/stats/overview');
    const data = await response.json();
    
    if (data.success) {
      const stats = data.data;
      
      // Create dashboard HTML
      const dashboard = document.getElementById('skills-dashboard');
      dashboard.innerHTML = `
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Skills</h3>
            <div class="stat-number">${stats.totalSkills}</div>
          </div>
          
          <div class="stat-card">
            <h3>Categories</h3>
            <div class="category-stats">
              ${stats.categoryStats.map(cat => `
                <div class="category-stat">
                  <span class="category-name">${cat._id}</span>
                  <span class="category-count">${cat.count}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="stat-card">
            <h3>Proficiency Levels</h3>
            <div class="proficiency-stats">
              ${stats.proficiencyStats.map(prof => `
                <div class="proficiency-stat">
                  <span class="proficiency-name">${prof._id}</span>
                  <span class="proficiency-count">${prof.count}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Failed to load skills statistics:', error);
  }
}
```

### 7. Using AuthUtils for Skills Management

```javascript
// Using the provided AuthUtils for skills management
async function manageSkills() {
  // Initialize AuthUtils
  AuthUtils.init();
  
  // Public API usage - no authentication required
  try {
    // Get all skills
    const skills = await AuthUtils.getSkills();
    console.log('All skills:', skills);
    
    // Get skills grouped by category
    const groupedSkills = await AuthUtils.getSkillsGrouped();
    console.log('Grouped skills:', groupedSkills);
    
    // Get frontend skills only
    const frontendSkills = await AuthUtils.getSkillsByCategory('frontend');
    console.log('Frontend skills:', frontendSkills);
    
    // Get skills statistics
    const stats = await AuthUtils.getSkillsStats();
    console.log('Skills statistics:', stats);
    
  } catch (error) {
    console.error('Public API error:', error);
  }
  
  // Admin API usage - requires authentication
  if (AuthUtils.isLoggedIn()) {
    try {
      // Get admin skills with pagination
      const adminSkills = await AuthUtils.getAdminSkills({ page: 1, limit: 10 });
      console.log('Admin skills:', adminSkills);
      
      // Create new skill
      const newSkill = await AuthUtils.createSkill({
        name: 'TypeScript',
        category: 'languages',
        proficiency: 'advanced',
        proficiencyLevel: 85,
        description: 'Strongly typed JavaScript development',
        yearsOfExperience: 3
      });
      console.log('Created skill:', newSkill);
      
      // Update skill
      const updatedSkill = await AuthUtils.updateSkill(newSkill._id, {
        proficiencyLevel: 90,
        description: 'Advanced TypeScript with generics and decorators'
      });
      console.log('Updated skill:', updatedSkill);
      
      // Get admin statistics
      const adminStats = await AuthUtils.getAdminSkillsStats();
      console.log('Admin statistics:', adminStats);
      
    } catch (error) {
      console.error('Admin API error:', error);
    }
  }
}
```

## CSS Styling Examples

### 8. Modern Skills Section Styles

```css
.skills-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.skills-section h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
}

.skill-category {
  margin-bottom: 3rem;
}

.category-title {
  font-size: 1.8rem;
  color: #555;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.skill-card {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #f0f0f0;
}

.skill-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.skill-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.skill-icon {
  width: 40px;
  height: 40px;
  margin-right: 1rem;
  border-radius: 8px;
}

.skill-header h4 {
  font-size: 1.25rem;
  color: #333;
  margin: 0;
}

.proficiency-container {
  margin: 1.5rem 0;
}

.proficiency-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.proficiency-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.proficiency-text {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.skill-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.skill-meta {
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
}

.experience {
  display: inline-block;
  background: #f8f9fa;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 1rem;
}

.projects {
  margin-top: 1rem;
}

.projects strong {
  color: #333;
  font-size: 0.9rem;
}

.projects ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.projects li {
  background: #f8f9fa;
  padding: 0.25rem 0.75rem;
  margin: 0.25rem 0;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #666;
}

.certifications {
  margin-top: 1rem;
}

.certifications strong {
  color: #333;
  font-size: 0.9rem;
}

.certifications ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.certifications li {
  margin: 0.25rem 0;
}

.certifications a {
  color: #007bff;
  text-decoration: none;
  font-size: 0.85rem;
}

.certifications a:hover {
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 768px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }
  
  .skill-card {
    padding: 1.5rem;
  }
}
```

## CSS Styling for Icons

```css
.skills-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.skills-section h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
}

.skill-category {
  margin-bottom: 3rem;
}

.category-title {
  font-size: 1.8rem;
  color: #555;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.skill-card {
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #f0f0f0;
}

.skill-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.skill-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.skill-icon {
  margin-right: 1rem;
  color: #666;
  transition: color 0.3s ease;
}

.skill-icon-placeholder {
  width: 40px;
  height: 40px;
  margin-right: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
}

.skill-icon-fallback {
  width: 40px;
  height: 40px;
  margin-right: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  font-weight: bold;
  color: #6c757d;
}

.icon-fallback {
  font-weight: bold;
  color: #6c757d;
  font-size: 1.2rem;
}

.skill-header h4 {
  font-size: 1.25rem;
  color: #333;
  margin: 0;
}

.proficiency-container {
  margin: 1.5rem 0;
}

.proficiency-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.proficiency-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.proficiency-text {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.skill-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.skill-meta {
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
}

.experience {
  display: inline-block;
  background: #f8f9fa;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 1rem;
}

.projects {
  margin-top: 1rem;
}

.projects strong {
  color: #333;
  font-size: 0.9rem;
}

.projects ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.projects li {
  background: #f8f9fa;
  padding: 0.25rem 0.75rem;
  margin: 0.25rem 0;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #666;
}

.certifications {
  margin-top: 1rem;
}

.certifications strong {
  color: #333;
  font-size: 0.9rem;
}

.certifications ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
}

.certifications li {
  margin: 0.25rem 0;
}

.certifications a {
  color: #007bff;
  text-decoration: none;
  font-size: 0.85rem;
}

.certifications a:hover {
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 768px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }
  
  .skill-card {
    padding: 1.5rem;
  }
}
```

## Simple HTML Example for Landing Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Skills Section</title>
    <style>
        /* Include the CSS above */
    </style>
</head>
<body>
    <section class="skills-section">
        <h2>Skills & Expertise</h2>
        <div id="skills-container">
            <!-- Skills will be loaded here -->
        </div>
    </section>

    <script>
        // Simple skills display for landing page
        async function loadSkills() {
            try {
                const response = await fetch('http://localhost:4000/api/skills/grouped');
                const data = await response.json();
                
                if (data.success) {
                    const container = document.getElementById('skills-container');
                    
                    data.data.forEach(category => {
                        const categoryDiv = document.createElement('div');
                        categoryDiv.className = 'skill-category';
                        
                        categoryDiv.innerHTML = `
                            <h3 class="category-title">${category._id.toUpperCase()}</h3>
                            <div class="skills-grid">
                                ${category.skills.map(skill => `
                                    <div class="skill-card">
                                        <div class="skill-header">
                                            <div class="skill-icon-fallback">${skill.name.charAt(0)}</div>
                                            <h4>${skill.name}</h4>
                                        </div>
                                        <div class="proficiency-container">
                                            <div class="proficiency-bar">
                                                <div class="proficiency-fill" style="width: ${skill.proficiencyLevel}%; background-color: ${skill.color}"></div>
                                            </div>
                                            <span class="proficiency-text">${skill.proficiency} (${skill.proficiencyLevel}%)</span>
                                        </div>
                                        <p class="skill-description">${skill.description}</p>
                                        <div class="skill-meta">
                                            <span class="experience">${skill.yearsOfExperience} years experience</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                        
                        container.appendChild(categoryDiv);
                    });
                }
            } catch (error) {
                console.error('Failed to load skills:', error);
                document.getElementById('skills-container').innerHTML = '<p>Failed to load skills. Please try again later.</p>';
            }
        }

        // Load skills when page loads
        document.addEventListener('DOMContentLoaded', loadSkills);
    </script>
</body>
</html>
```

## Integration Tips

### 9. Error Handling and Loading States

```javascript
class SkillsLoader {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.loading = false;
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading skills...</p>
      </div>
    `;
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="error-message">
        <p>Error: ${message}</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    `;
  }

  async loadSkills() {
    if (this.loading) return;
    
    this.loading = true;
    this.showLoading();
    
    try {
      const response = await fetch('http://localhost:4000/api/skills/grouped');
      const data = await response.json();
      
      if (data.success) {
        this.renderSkills(data.data);
      } else {
        this.showError(data.message || 'Failed to load skills');
      }
    } catch (error) {
      this.showError('Network error. Please check your connection.');
    } finally {
      this.loading = false;
    }
  }

  renderSkills(skillsData) {
    // Implementation here...
  }
}
```

### 10. Performance Optimization

```javascript
// Cache skills data to avoid repeated API calls
class SkillsCache {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async getSkills(endpoint) {
    const now = Date.now();
    const cached = this.cache.get(endpoint);
    
    if (cached && (now - cached.timestamp) < this.cacheExpiry) {
      return cached.data;
    }
    
    try {
      const response = await fetch(`http://localhost:4000/api/skills${endpoint}`);
      const data = await response.json();
      
      if (data.success) {
        this.cache.set(endpoint, {
          data: data.data,
          timestamp: now
        });
        return data.data;
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      // Return cached data if available, even if expired
      return cached ? cached.data : null;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}

// Usage
const skillsCache = new SkillsCache();

async function loadSkillsWithCache() {
  const skills = await skillsCache.getSkills('/grouped');
  // Use skills data...
}
```

## Summary

The Skills API provides a comprehensive solution for managing and displaying skills and expertise data. Key features include:

- **Public API** for frontend display without authentication
- **Admin API** for full CRUD operations with authentication
- **React Icons Support** for modern icon display
- **Flexible filtering** by category, proficiency, and search
- **Statistics and analytics** for both public and admin use
- **Performance optimized** with proper caching and pagination
- **Rich metadata** including icons, colors, projects, and certifications

Use these examples as a starting point and customize them according to your specific design and functionality requirements.

**Note**: The examples above show proper handling of React icons. For full React icon functionality, you'll need to install the `react-icons` package and import the specific icon libraries you want to use. 