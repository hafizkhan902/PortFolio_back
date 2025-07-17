import React, { useState, useEffect } from 'react';
import authService from '../utils/auth';

const MessageManager = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyData, setReplyData] = useState({ replyMessage: '', replySubject: '' });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // Fetch messages on component mount and when filters change
  useEffect(() => {
    fetchMessages();
  }, [filters]);

  // Fetch statistics on component mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.getContactMessages(filters);
      setMessages(response.data);
      console.log('✅ Messages loaded:', response.data);
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      setError(error.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await authService.getMessageStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('❌ Failed to load message statistics:', error);
    }
  };

  const handleViewMessage = async (messageId) => {
    try {
      const response = await authService.getContactMessage(messageId);
      setSelectedMessage(response.data);
      
      // Refresh messages list to update read status
      fetchMessages();
      fetchStatistics();
    } catch (error) {
      console.error('❌ Failed to load message:', error);
      setError(error.message || 'Failed to load message');
    }
  };

  const handleStatusChange = async (messageId, status) => {
    try {
      await authService.updateMessageStatus(messageId, status);
      fetchMessages();
      fetchStatistics();
      
      // Update selected message if it's the one being changed
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error) {
      console.error('❌ Failed to update message status:', error);
      setError(error.message || 'Failed to update message status');
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyData.replyMessage.trim()) {
      setError('Reply message is required');
      return;
    }

    try {
      await authService.replyToMessage(selectedMessage._id, replyData);
      setShowReplyModal(false);
      setReplyData({ replyMessage: '', replySubject: '' });
      fetchMessages();
      fetchStatistics();
      
      // Update selected message status
      setSelectedMessage({ ...selectedMessage, status: 'replied' });
      
      alert('Reply sent successfully!');
    } catch (error) {
      console.error('❌ Failed to send reply:', error);
      setError(error.message || 'Failed to send reply');
    }
  };

  const handleDelete = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await authService.deleteMessage(messageId);
      fetchMessages();
      fetchStatistics();
      
      // Close selected message if it's the one being deleted
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('❌ Failed to delete message:', error);
      setError(error.message || 'Failed to delete message');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedMessages.length === 0) {
      alert('Please select messages first');
      return;
    }

    if (action === 'delete' && !confirm(`Are you sure you want to delete ${selectedMessages.length} message(s)?`)) {
      return;
    }

    try {
      await authService.bulkMessageOperation(action, selectedMessages);
      setSelectedMessages([]);
      fetchMessages();
      fetchStatistics();
    } catch (error) {
      console.error('❌ Bulk operation failed:', error);
      setError(error.message || 'Bulk operation failed');
    }
  };

  const handleSelectMessage = (messageId) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSelectAll = () => {
    setSelectedMessages(
      selectedMessages.length === messages.length 
        ? [] 
        : messages.map(msg => msg._id)
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading messages...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Message Manager</h1>
            <p className="text-gray-600 mt-1">Manage contact form submissions and replies</p>
          </div>
          <button
            onClick={fetchMessages}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-blue-600">{statistics.totalMessages}</div>
              <div className="text-sm text-gray-600">Total Messages</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-red-600">{statistics.unreadMessages}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-yellow-600">{statistics.readMessages}</div>
              <div className="text-sm text-gray-600">Read</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-green-600">{statistics.repliedMessages}</div>
              <div className="text-sm text-gray-600">Replied</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-2xl font-bold text-purple-600">{statistics.responseRate}%</div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Filters and Controls */}
              <div className="p-4 border-b">
                <div className="flex flex-wrap gap-4 mb-4">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
                    className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
                    className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Bulk Actions */}
                {selectedMessages.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => handleBulkAction('mark-read')}
                      className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                    >
                      Mark Read
                    </button>
                    <button
                      onClick={() => handleBulkAction('mark-unread')}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Mark Unread
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <span className="text-sm text-gray-600 py-1">
                      {selectedMessages.length} selected
                    </span>
                  </div>
                )}

                {/* Select All */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedMessages.length === messages.length && messages.length > 0}
                    onChange={handleSelectAll}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
              </div>

              {/* Messages List */}
              <div className="divide-y">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No messages found
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        selectedMessage?._id === message._id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleViewMessage(message._id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedMessages.includes(message._id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSelectMessage(message._id);
                            }}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{message.name}</div>
                            <div className="text-sm text-gray-600">{message.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="font-medium text-gray-800 mb-1">{message.subject}</div>
                      <div className="text-sm text-gray-600 truncate">
                        {message.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Details */}
          <div className="lg:col-span-1">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedMessage.name}</h3>
                      <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-1">Subject:</h4>
                    <p className="text-gray-700">{selectedMessage.subject}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-1">Date:</h4>
                    <p className="text-sm text-gray-600">{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Message:</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-gray-700 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="p-4 border-t">
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => {
                        setReplyData({
                          replyMessage: '',
                          replySubject: `Re: ${selectedMessage.subject}`
                        });
                        setShowReplyModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      ✉️ Reply
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage._id)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleStatusChange(selectedMessage._id, 'read')}
                      className="w-full px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                    >
                      Mark as Read
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedMessage._id, 'unread')}
                      className="w-full px-3 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Mark as Unread
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
                Select a message to view details
              </div>
            )}
          </div>
        </div>

        {/* Reply Modal */}
        {showReplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Reply to {selectedMessage?.name}</h3>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={replyData.replySubject}
                    onChange={(e) => setReplyData({...replyData, replySubject: e.target.value})}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reply Message *
                  </label>
                  <textarea
                    value={replyData.replyMessage}
                    onChange={(e) => setReplyData({...replyData, replyMessage: e.target.value})}
                    rows={8}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your reply here..."
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Original Message:</h4>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedMessage?.message}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReply}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Send Reply
                  </button>
                  <button
                    onClick={() => setShowReplyModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <div className="flex items-center">
              <div className="text-red-600 mr-2">❌</div>
              <div className="text-red-800">{error}</div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageManager; 