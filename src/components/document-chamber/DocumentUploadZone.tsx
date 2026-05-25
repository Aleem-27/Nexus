import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileUp } from 'lucide-react';

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
};

interface DocumentUploadZoneProps {
  onFileAccepted: (file: File) => void;
  compact?: boolean;
}

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  onFileAccepted,
  compact = false,
}) => {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFileAccepted(accepted[0]);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    multiple: false,
  });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-dashed transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={18} className="text-primary-600" />
        <span className="text-sm font-medium text-gray-700">Upload contract</span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        isDragActive
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="inline-flex p-3 rounded-full bg-primary-100 mb-3">
        <FileUp size={28} className="text-primary-600" />
      </div>
      <p className="text-sm font-medium text-gray-900">
        {isDragActive ? 'Drop file here' : 'Drag & drop a contract, or click to browse'}
      </p>
      <p className="text-xs text-gray-500 mt-2">PDF, Word, Excel, or images — max one file at a time</p>
    </div>
  );
};
