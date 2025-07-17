const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function testHighlightsImagesField() {
  console.log('🧪 Testing Highlights Images Field in All Endpoints...\n');

  try {
    // Test 1: Main highlights endpoint
    console.log('1. Testing main highlights endpoint...');
    const highlightsResponse = await axios.get(`${BASE_URL}/highlights`);
    if (highlightsResponse.data.success && highlightsResponse.data.data.length > 0) {
      const firstHighlight = highlightsResponse.data.data[0];
      console.log('✅ Main endpoint works');
      console.log('   - Has images field:', 'images' in firstHighlight);
      console.log('   - Images array length:', firstHighlight.images ? firstHighlight.images.length : 0);
      if (firstHighlight.images && firstHighlight.images.length > 0) {
        console.log('   - First image URL:', firstHighlight.images[0].url);
      }
    } else {
      console.log('❌ No data in main endpoint');
    }
    console.log('');

    // Test 2: Grouped highlights endpoint
    console.log('2. Testing grouped highlights endpoint...');
    const groupedResponse = await axios.get(`${BASE_URL}/highlights/grouped`);
    if (groupedResponse.data.success && groupedResponse.data.data.length > 0) {
      const firstCategory = groupedResponse.data.data[0];
      if (firstCategory.highlights && firstCategory.highlights.length > 0) {
        const firstHighlight = firstCategory.highlights[0];
        console.log('✅ Grouped endpoint works');
        console.log('   - Has images field:', 'images' in firstHighlight);
        console.log('   - Images array length:', firstHighlight.images ? firstHighlight.images.length : 0);
        if (firstHighlight.images && firstHighlight.images.length > 0) {
          console.log('   - First image URL:', firstHighlight.images[0].url);
        }
      }
    } else {
      console.log('❌ No data in grouped endpoint');
    }
    console.log('');

    // Test 3: Category-specific highlights endpoint
    console.log('3. Testing category-specific highlights endpoint...');
    const categoryResponse = await axios.get(`${BASE_URL}/highlights/category/ui-design`);
    if (categoryResponse.data.success && categoryResponse.data.data.length > 0) {
      const firstHighlight = categoryResponse.data.data[0];
      console.log('✅ Category endpoint works');
      console.log('   - Has images field:', 'images' in firstHighlight);
      console.log('   - Images array length:', firstHighlight.images ? firstHighlight.images.length : 0);
      if (firstHighlight.images && firstHighlight.images.length > 0) {
        console.log('   - First image URL:', firstHighlight.images[0].url);
      }
    } else {
      console.log('❌ No data in category endpoint');
    }
    console.log('');

    // Test 4: Single highlight endpoint
    console.log('4. Testing single highlight endpoint...');
    // First get a highlight ID from the main endpoint
    const mainResponse = await axios.get(`${BASE_URL}/highlights`);
    if (mainResponse.data.success && mainResponse.data.data.length > 0) {
      const highlightId = mainResponse.data.data[0]._id;
      const singleResponse = await axios.get(`${BASE_URL}/highlights/${highlightId}`);
      
      if (singleResponse.data.success) {
        const highlight = singleResponse.data.data;
        console.log('✅ Single highlight endpoint works');
        console.log('   - Has images field:', 'images' in highlight);
        console.log('   - Images array length:', highlight.images ? highlight.images.length : 0);
        if (highlight.images && highlight.images.length > 0) {
          console.log('   - First image URL:', highlight.images[0].url);
          console.log('   - All images:');
          highlight.images.forEach((img, index) => {
            console.log(`     ${index + 1}. ${img.url}`);
            console.log(`        Caption: "${img.caption || 'No caption'}"`);
          });
        }
      } else {
        console.log('❌ Single highlight endpoint failed');
      }
    } else {
      console.log('❌ No data to test single highlight endpoint');
    }
    console.log('');

    // Test 5: Featured highlights endpoint
    console.log('5. Testing featured highlights endpoint...');
    const featuredResponse = await axios.get(`${BASE_URL}/highlights/featured/list`);
    if (featuredResponse.data.success && featuredResponse.data.data.length > 0) {
      const firstHighlight = featuredResponse.data.data[0];
      console.log('✅ Featured endpoint works');
      console.log('   - Has images field:', 'images' in firstHighlight);
      console.log('   - Images array length:', firstHighlight.images ? firstHighlight.images.length : 0);
    } else {
      console.log('ℹ️  No featured highlights found (this is normal if none are marked as featured)');
    }
    console.log('');

    console.log('🎉 Images field testing completed!');
    console.log('📋 Summary:');
    console.log('   - All public endpoints should now include the images array');
    console.log('   - The images array contains objects with url, caption, and _id fields');
    console.log('   - Empty caption fields are returned as empty strings');
    console.log('   - The main imageUrl field is separate from the images array');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testHighlightsImagesField(); 