const express = require('express');
const router = express.Router();
const axios = require('axios');

// GitHub API configuration
const githubAPI = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${ process.env.GITHUB_TOKEN }`,
    Accept: 'application/vnd.github.v3+json'
  }
});

// Cache configuration (in-memory for now, can be replaced with Redis)
const cache = {
  data: null,
  timestamp: null,
  CACHE_DURATION: 30 * 60 * 1000 // 30 minutes
};

// Get GitHub activity feed
router.get('/activity', async (req, res) => {
  try {
    // Check cache
    if (cache.data && cache.timestamp && (Date.now() - cache.timestamp < cache.CACHE_DURATION)) {
      return res.json({
        success: true,
        data: cache.data
      });
    }

    // Fetch user events
    const { data: events } = await githubAPI.get('/users/hafizkhan902/events/public');
    
    // Process and format events
    const processedEvents = events
      .filter(event => ['PushEvent', 'CreateEvent', 'PullRequestEvent'].includes(event.type))
      .map(event => {
        const baseInfo = {
          id: event.id,
          type: event.type,
          repo: event.repo.name,
          createdAt: event.created_at
        };

        switch (event.type) {
          case 'PushEvent':
            return {
              ...baseInfo,
              commits: event.payload.commits.map(commit => ({
                message: commit.message,
                url: commit.url
              }))
            };
          case 'CreateEvent':
            return {
              ...baseInfo,
              refType: event.payload.ref_type,
              ref: event.payload.ref
            };
          case 'PullRequestEvent':
            return {
              ...baseInfo,
              action: event.payload.action,
              title: event.payload.pull_request.title,
              url: event.payload.pull_request.html_url
            };
          default:
            return baseInfo;
        }
      })
      .slice(0, 10); // Limit to last 10 events

    // Update cache
    cache.data = processedEvents;
    cache.timestamp = Date.now();

    res.json({
      success: true,
      data: processedEvents
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GitHub activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get GitHub repositories
router.get('/repos', async (req, res) => {
  try {
    const { data: repos } = await githubAPI.get('/users/hafizkhan902/repos', {
      params: {
        sort: 'updated',
        direction: 'desc',
        per_page: 10
      }
    });

    const processedRepos = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      updatedAt: repo.updated_at
    }));

    res.json({
      success: true,
      data: processedRepos
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GitHub repositories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 