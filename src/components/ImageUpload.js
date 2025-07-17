import React, { useState, useRef } from 'react';
import authService from '../utils/auth';

const ImageUpload = ({ onImageSelect, currentImageUrl = '', label = 'Project Image' }) => {
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'url'
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);

      // Upload to server
      const response = await authService.uploadImage(file);
      
      if (response.success) {
        const uploadedUrl = response.data.url;
        setImageUrl(uploadedUrl);
        setPreview(uploadedUrl);
        onImageSelect(uploadedUrl);
        console.log('✅ Image uploaded successfully:', uploadedUrl);
      }
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      setError(error.message || 'Failed to upload image');
      setPreview(currentImageUrl);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle URL input
  const handleUrlChange = (event) => {
    const url = event.target.value;
    setImageUrl(url);
    setError('');
    
    // Update preview and notify parent
    if (url) {
      setPreview(url);
      onImageSelect(url);
    } else {
      setPreview('');
      onImageSelect('');
    }
  };

  // Handle method change
  const handleMethodChange = (method) => {
    setUploadMethod(method);
    setError('');
    
    if (method === 'upload') {
      setImageUrl('');
      setPreview(currentImageUrl);
      onImageSelect(currentImageUrl);
    }
  };

  // Clear image
  const clearImage = () => {
    setImageUrl('');
    setPreview('');
    setError('');
    onImageSelect('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Method Selection */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => handleMethodChange('upload')}
          className={`px-4 py-2 text-sm font-medium rounded-md border ${
            uploadMethod === 'upload'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          📁 Upload File
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange('url')}
          className={`px-4 py-2 text-sm font-medium rounded-md border ${
            uploadMethod === 'url'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          🔗 Paste URL
        </button>
      </div>

      {/* File Upload */}
      {uploadMethod === 'upload' && (
        <div className="space-y-3">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="image-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 ${
                isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-blue-600">Uploading...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 5MB</p>
                  </>
                )}
              </div>
              <input
                id="image-upload"
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      )}

      {/* URL Input */}
      {uploadMethod === 'url' && (
        <div className="space-y-3">
          <input
            type="url"
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500">
            Paste a direct link to an image (JPG, PNG, GIF, WebP)
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Preview */}
      {preview && (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-gray-300"
              onError={() => {
                setError('Failed to load image. Please check the URL or try a different image.');
                setPreview('');
              }}
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {uploadMethod === 'upload' ? 'Uploaded successfully!' : 'Image loaded from URL'}
          </p>
        </div>
      )}

      {/* Current Image URL (for form submission) */}
      <input
        type="hidden"
        name="imageUrl"
        value={preview || ''}
      />
    </div>
  );
};

export default ImageUpload; 