const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function testHighlightsEndpoints() {
  console.log('🧪 Testing UI/UX Design Portfolio Highlights Endpoints...\n');

  try {
    // Test 1: Public highlights categories
    console.log('1. Testing public highlights categories endpoint...');
    const categoriesResponse = await axios.get(`${BASE_URL}/highlights/meta/categories`);
    console.log('✅ Categories endpoint works:', categoriesResponse.data);
    console.log('');

    // Test 2: Public highlights list (empty but should work)
    console.log('2. Testing public highlights list endpoint...');
    const highlightsResponse = await axios.get(`${BASE_URL}/highlights`);
    console.log('✅ Highlights list endpoint works:', highlightsResponse.data);
    console.log('');

    // Test 3: Public highlights grouped by category
    console.log('3. Testing public highlights grouped endpoint...');
    const groupedResponse = await axios.get(`${BASE_URL}/highlights/grouped`);
    console.log('✅ Grouped highlights endpoint works:', groupedResponse.data);
    console.log('');

    // Test 4: Public highlights statistics
    console.log('4. Testing public highlights statistics endpoint...');
    const statsResponse = await axios.get(`${BASE_URL}/highlights/stats/overview`);
    console.log('✅ Statistics endpoint works:', statsResponse.data);
    console.log('');

    // Test 5: Featured highlights
    console.log('5. Testing featured highlights endpoint...');
    const featuredResponse = await axios.get(`${BASE_URL}/highlights/featured/list?limit=6`);
    console.log('✅ Featured highlights endpoint works:', featuredResponse.data);
    console.log('');

    // Test 6: Highlights by category
    console.log('6. Testing highlights by category endpoint...');
    const categoryResponse = await axios.get(`${BASE_URL}/highlights/category/ui-design`);
    console.log('✅ Category-specific highlights endpoint works:', categoryResponse.data);
    console.log('');

    // Test 7: Login to get admin token
    console.log('7. Testing admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Admin login successful');
      console.log('');

      // Test 8: Admin highlights list
      console.log('8. Testing admin highlights list endpoint...');
      const adminHighlightsResponse = await axios.get(`${BASE_URL}/admin/highlights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Admin highlights list endpoint works:', adminHighlightsResponse.data);
      console.log('');

      // Test 9: Admin highlights statistics
      console.log('9. Testing admin highlights statistics endpoint...');
      const adminStatsResponse = await axios.get(`${BASE_URL}/admin/highlights/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Admin statistics endpoint works:', adminStatsResponse.data);
      console.log('');

      // Test 10: Create a sample highlight
      console.log('10. Testing create highlight endpoint...');
      const sampleHighlight = {
        title: 'Sample Mobile App Design',
        description: 'A beautiful mobile app design showcasing modern UI/UX principles with focus on user experience and visual appeal.',
        shortDescription: 'Modern mobile app with great UX',
        imageUrl: 'https://example.com/images/mobile-app.jpg',
        category: 'mobile-app',
        tools: ['Figma', 'Adobe XD', 'Principle'],
        projectUrl: 'https://example.com/project',
        behanceUrl: 'https://behance.net/project',
        dribbbleUrl: 'https://dribbble.com/shots/project',
        figmaUrl: 'https://figma.com/file/project',
        tags: ['mobile', 'ui', 'ux', 'app'],
        featured: true,
        completionDate: '2024-01-15',
        clientName: 'TechCorp Inc.',
        projectDuration: '3 months',
        challenges: ['Complex user flow', 'Multi-platform consistency'],
        solutions: ['Progressive disclosure', 'Design system'],
        keyFeatures: ['Intuitive navigation', 'Smooth animations', 'Responsive design'],
        userFeedback: [{
          feedback: 'Amazing design! Very user-friendly.',
          rating: 5,
          userName: 'John Doe'
        }],
        seoMetadata: {
          metaTitle: 'Mobile App UI/UX Design',
          metaDescription: 'Modern mobile app design with focus on user experience',
          keywords: ['mobile app', 'ui design', 'ux design']
        }
      };

      const createResponse = await axios.post(`${BASE_URL}/admin/highlights`, sampleHighlight, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (createResponse.data.success) {
        console.log('✅ Create highlight endpoint works');
        const highlightId = createResponse.data.data._id;
        console.log('Created highlight ID:', highlightId);
        console.log('');

        // Test 11: Get the created highlight
        console.log('11. Testing get single highlight endpoint...');
        const singleHighlightResponse = await axios.get(`${BASE_URL}/highlights/${highlightId}`);
        console.log('✅ Get single highlight endpoint works:', singleHighlightResponse.data.data.title);
        console.log('');

        // Test 12: Update the highlight
        console.log('12. Testing update highlight endpoint...');
        const updateResponse = await axios.put(`${BASE_URL}/admin/highlights/${highlightId}`, {
          title: 'Updated Mobile App Design',
          description: 'Updated description with more details about the design process and outcomes.'
        }, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Update highlight endpoint works:', updateResponse.data.data.title);
        console.log('');

        // Test 13: Toggle featured status
        console.log('13. Testing toggle featured status endpoint...');
        const toggleFeaturedResponse = await axios.patch(`${BASE_URL}/admin/highlights/${highlightId}/toggle-featured`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Toggle featured status endpoint works:', toggleFeaturedResponse.data.data.featured);
        console.log('');

        // Test 14: Toggle active status
        console.log('14. Testing toggle active status endpoint...');
        const toggleActiveResponse = await axios.patch(`${BASE_URL}/admin/highlights/${highlightId}/toggle-active`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Toggle active status endpoint works:', toggleActiveResponse.data.data.isActive);
        console.log('');

        // Test 15: Delete the highlight
        console.log('15. Testing delete highlight endpoint...');
        const deleteResponse = await axios.delete(`${BASE_URL}/admin/highlights/${highlightId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Delete highlight endpoint works:', deleteResponse.data.message);
        console.log('');

        console.log('🎉 All tests passed! The UI/UX Design Portfolio Highlights system is working correctly.');
      } else {
        console.log('❌ Failed to create highlight:', createResponse.data.message);
      }
    } else {
      console.log('❌ Admin login failed:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testHighlightsEndpoints(); 