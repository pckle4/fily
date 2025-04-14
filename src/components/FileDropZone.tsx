
import React, { useState, useRef } from 'react';
import { Upload, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileSelected, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div
      className={cn(
        "file-drop-area w-full p-10 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-4",
        isDragging ? "border-primary bg-primary/5 scale-105" : "border-gray-300 bg-white/50 hover:bg-white/80",
        isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      <div className="animate-float p-4 bg-primary/10 rounded-full">
        {isUploading ? (
          <File size={48} className="text-primary animate-pulse" />
        ) : (
          <Upload size={48} className="text-primary" />
        )}
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-800">
          {isUploading ? "Uploading..." : "Drag & Drop your file here"}
        </h3>
        <p className="text-gray-500 mt-2">
          {isUploading ? "Please wait..." : "or click to browse your files"}
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
        disabled={isUploading}
      />
    </div>
  );
};

export default FileDropZone;
