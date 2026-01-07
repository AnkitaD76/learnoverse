import { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { useSession } from '../contexts/SessionContext';
import {
  uploadFile,
  getFiles,
  deleteFile,
  downloadFile,
} from '../api/fileShare';

export const FileShare = ({ courseId }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);
  const { user } = useSession();

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, [courseId]);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { files: loadedFiles } = await getFiles(courseId);
      setFiles(loadedFiles);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load files');
      console.error('Error loading files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    try {
      setIsUploading(true);
      setError(null);

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }

      await uploadFile(file, courseId, 'course');
      setSuccess('File uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reload files
      await loadFiles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file');
      console.error('Error uploading file:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      setError(null);
      await downloadFile(file._id, file.fileName);
      setSuccess(`Downloaded: ${file.fileName}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to download file');
      console.error('Error downloading file:', err);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      setError(null);
      await deleteFile(fileId);
      setSuccess('File deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await loadFiles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete file');
      console.error('Error deleting file:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Shared Files</h3>
          <p className="mt-1 text-sm text-gray-600">
            Upload and manage course materials
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="fileInput"
            disabled={isUploading}
          />
          <label
            htmlFor="fileInput"
            className={`inline-block cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isUploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#FF6A00] text-white hover:bg-[#e85f00]'
            }`}
          >
            {isUploading ? 'Uploading...' : '📎 Upload File'}
          </label>
          <p className="mt-2 text-xs text-gray-500">
            Max size: 50MB • Supported: PDF, Word, Excel, Images, Text
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[#FF6A00] mx-auto"></div>
            <p className="text-sm text-gray-600">Loading files...</p>
          </div>
        </div>
      ) : files.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-8 text-center">
          <p className="text-gray-500">📁 No files shared yet</p>
        </div>
      ) : (
        /* Files List */
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file._id}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-[#FFF2E8] text-lg">
                      {file.fileType.includes('pdf') && '📄'}
                      {file.fileType.includes('word') && '📝'}
                      {file.fileType.includes('excel') && '📊'}
                      {file.fileType.includes('image') && '🖼️'}
                      {file.fileType.includes('text') && '📃'}
                      {!['pdf', 'word', 'excel', 'image', 'text'].some(t =>
                        file.fileType.includes(t)
                      ) && '📎'}
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">
                      {file.fileName}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span className="mx-2">•</span>
                      <span>by {file.uploadedBy?.name || 'Unknown'}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(file.createdAt)}</span>
                    </p>
                    {file.description && (
                      <p className="mt-1 text-xs text-gray-600 truncate">
                        {file.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-orange-600">
                      ⬇️ {file.downloads} downloads
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(file)}
                  className="flex-shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Download file"
                >
                  Download
                </button>

                {user?._id === file.uploadedBy._id && (
                  <button
                    onClick={() => handleDelete(file._id)}
                    className="flex-shrink-0 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                    title="Delete file"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Stats */}
      {files.length > 0 && (
        <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-600">
          {files.length} file{files.length !== 1 ? 's' : ''} •{' '}
          {formatFileSize(files.reduce((sum, f) => sum + f.fileSize, 0))} total
        </div>
      )}
    </div>
  );
};
