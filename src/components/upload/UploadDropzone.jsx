import React, { useCallback, useState } from 'react';
import { uploadFile } from '../../services/uploadService';
import toast from 'react-hot-toast';

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // xlsx
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const UploadDropzone = ({ folderId = null }) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateAndUpload = (files) => {
    Array.from(files).forEach((file) => {
      if (!ALLOWED_MIME_TYPES.includes(file.type) && file.type !== '') {
        // file.type can be empty for some unknown extensions, backend might reject it but we show warning
        toast.error(`${file.name} has an unsupported file type.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (Max 50MB).`);
        return;
      }
      uploadFile(file, folderId);
    });
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  }, [folderId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files);
      e.target.value = null; // Reset input so same file can be selected again
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl2 p-12 text-center
        transition-colors duration-200 cursor-pointer overflow-hidden
        ${isDragging 
          ? 'border-azure-500 bg-azure-100/30' 
          : 'border-cloud-300 hover:border-azure-500 hover:bg-azure-100/10 bg-white'
        }
      `}
    >
      <input 
        type="file" 
        multiple 
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept={ALLOWED_MIME_TYPES.join(',')}
      />
      <div className="flex flex-col items-center pointer-events-none">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? 'bg-azure-500 text-white' : 'bg-cloud-100 text-slate-500'}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <p className="font-body text-sm font-medium text-slate-700">
          {isDragging ? 'Drop files to upload' : 'Drag files here or click to browse'}
        </p>
        <p className="font-mono text-xs text-slate-500 mt-1">Max 50 MB per file</p>
      </div>
    </div>
  );
};

export default UploadDropzone;
