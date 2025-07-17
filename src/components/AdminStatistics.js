import React, { useState, useEffect } from 'react';
import authService from '../utils/auth';

const AdminStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch statistics on component mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.getAdminStatistics();
      setStatistics(response.data);
      console.log('✅ Statistics loaded:', response.data);
    } catch (error) {
      console.error('❌ Failed to load statistics:', error);
      setError(error.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatistics();
    setRefreshing(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading statistics...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStatistics}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Statistics cards data
  const statsCards = [
    {
      title: 'Total Projects',
      value: statistics?.totalProjects || 0,
      icon: '📁',
      color: 'blue',
      description: 'All projects in portfolio'
    },
    {
      title: 'Featured Projects',
      value: statistics?.featuredProjects || 0,
      icon: '⭐',
      color: 'yellow',
      description: 'Projects marked as featured'
    },
    {
      title: 'Total Messages',
      value: statistics?.totalMessages || 0,
      icon: '✉️',
      color: 'green',
      description: 'Contact form submissions'
    },
    {
      title: 'Unread Messages',
      value: statistics?.unreadMessages || 0,
      icon: '📬',
      color: 'red',
      description: 'Messages awaiting response'
    },
    {
      title: 'GitHub Repositories',
      value: statistics?.githubRepoCount || 0,
      icon: '🐙',
      color: 'gray',
      description: 'Public repositories on GitHub'
    },
    {
      title: 'GitHub Followers',
      value: statistics?.githubFollowers || 0,
      icon: '👥',
      color: 'purple',
      description: 'GitHub profile followers'
    },
    {
      title: 'Portfolio Views',
      value: statistics?.portfolioViewCount || 0,
      icon: '👁️',
      color: 'indigo',
      description: 'Total portfolio page views'
    },
    {
      title: 'Recent Projects',
      value: statistics?.recentProjects || 0,
      icon: '🆕',
      color: 'teal',
      description: 'Projects added in last 30 days'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      gray: 'bg-gray-50 text-gray-600 border-gray-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      teal: 'bg-teal-50 text-teal-600 border-teal-200'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Statistics</h1>
            <p className="text-gray-600 mt-1">
              Portfolio performance and analytics dashboard
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <span className={`mr-2 ${refreshing ? 'animate-spin' : ''}`}>
              {refreshing ? '🔄' : '🔄'}
            </span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border-2 ${getColorClasses(card.color)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{card.icon}</div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{card.value}</div>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-1">{card.title}</h3>
              <p className="text-sm opacity-75">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-4">📊 Project Categories</h3>
            {statistics?.categoryStats && statistics.categoryStats.length > 0 ? (
              <div className="space-y-3">
                {statistics.categoryStats.map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{category._id}</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No category data available</p>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold mb-4">📈 Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Project Completion Rate</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {statistics?.projectCompletionRate || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Message Response Rate</span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {statistics?.messageResponseRate || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">GitHub Following</span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {statistics?.githubFollowing || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h3 className="text-xl font-semibold mb-4">🕐 Recent Activity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {statistics?.recentActivity?.newProjects || 0}
              </div>
              <div className="text-sm text-blue-700">New projects (30 days)</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statistics?.recentActivity?.newMessages || 0}
              </div>
              <div className="text-sm text-green-700">New messages (30 days)</div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-4">⚙️ System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500">API Status</div>
              <div className="flex items-center mt-1">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-green-600 font-medium">
                  {statistics?.apiStatus || 'Unknown'}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Last Updated</div>
              <div className="font-medium text-gray-900">
                {statistics?.lastUpdated 
                  ? new Date(statistics.lastUpdated).toLocaleString()
                  : 'Unknown'
                }
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Environment</div>
              <div className="font-medium text-gray-900">
                {process.env.NODE_ENV || 'Development'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics; 