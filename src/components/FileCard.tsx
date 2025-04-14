
import React from 'react';
import { FileMetadata } from '@/services/indexedDBService';
import { FileIcon, DownloadIcon, Share2, Clock, FileText, FilePdf, FileVideo, FileAudio, FileImage, FileCode, FileArchive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface FileCardProps {
  metadata: FileMetadata;
  downloadUrl?: string;
  showDownload?: boolean;
  showShare?: boolean;
  onStopSharing?: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ 
  metadata, 
  downloadUrl, 
  showDownload = false,
  showShare = true,
  onStopSharing
}) => {
  const { toast } = useToast();
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const copyShareLink = () => {
    // Use window.location to construct a proper URL with the correct protocol
    const origin = window.location.origin;
    const shareUrl = `${origin}/download/${metadata.shareId}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast({
          title: "Link copied!",
          description: "Share link has been copied to clipboard",
          duration: 3000,
        });
      })
      .catch((error) => {
        console.error('Copy error:', error);
        toast({
          title: "Copy failed",
          description: "Could not copy link to clipboard",
          variant: "destructive",
          duration: 3000,
        });
      });
  };

  const calculateDaysRemaining = (): number => {
    const now = new Date();
    const expiry = new Date(metadata.expiryDate);
    const diffTime = Math.abs(expiry.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const daysRemaining = calculateDaysRemaining();
  
  // Get file icon based on type
  const getFileIcon = () => {
    const type = metadata.type.toLowerCase();
    
    if (type.includes('image')) {
      return <FileImage className="h-6 w-6" />;
    } else if (type.includes('video')) {
      return <FileVideo className="h-6 w-6" />;
    } else if (type.includes('audio')) {
      return <FileAudio className="h-6 w-6" />;
    } else if (type.includes('pdf')) {
      return <FilePdf className="h-6 w-6" />;
    } else if (type.includes('word') || type.includes('document')) {
      return <FileText className="h-6 w-6" />;
    } else if (type.includes('zip') || type.includes('compressed')) {
      return <FileArchive className="h-6 w-6" />;
    } else if (type.includes('javascript') || type.includes('html') || type.includes('css') || type.includes('json')) {
      return <FileCode className="h-6 w-6" />;
    }
    return <FileIcon className="h-6 w-6" />;
  };

  // Determine file icon background color based on type
  const getFileTypeColor = () => {
    const type = metadata.type.toLowerCase();
    
    if (type.includes('image')) return 'file-icon-image';
    if (type.includes('video')) return 'file-icon-video';
    if (type.includes('audio')) return 'file-icon-audio';
    if (type.includes('pdf')) return 'file-icon-pdf';
    if (type.includes('word') || type.includes('document')) return 'file-icon-doc';
    if (type.includes('zip') || type.includes('compressed')) return 'file-icon-zip';
    if (type.includes('javascript') || type.includes('html') || type.includes('css') || type.includes('json')) return 'file-icon-code';
    return 'file-icon-default';
  };

  return (
    <Card className="animate-expand overflow-hidden card-hover">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${getFileTypeColor()}`}>
            {getFileIcon()}
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-medium truncate" title={metadata.name}>
              {metadata.name}
            </h3>
            <p className="text-sm text-gray-500">
              {formatFileSize(metadata.size)} • {metadata.type.split('/')[1]?.toUpperCase() || 'FILE'}
            </p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          {showShare && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-500 gap-2">
                <Share2 size={16} className="text-purple-500" />
                <span>Share Code</span>
              </div>
              <div className="font-mono bg-primary/10 px-2 py-1 rounded text-primary font-medium">
                {metadata.shareId}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500 gap-2">
              <Clock size={16} className="text-blue-500" />
              <span>Expires in</span>
            </div>
            <div className="font-medium">
              {daysRemaining} days
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex gap-2">
          {showShare && (
            <Button 
              variant="outline" 
              className="flex-1 btn-hover"
              onClick={copyShareLink}
            >
              <Share2 size={16} className="mr-2 text-purple-500" />
              Copy Share Link
            </Button>
          )}
          
          {showDownload && downloadUrl && (
            <Button 
              className="flex-1 gap-2 btn-hover bg-blue-gradient"
              asChild
            >
              <a href={downloadUrl} download={metadata.name}>
                <DownloadIcon size={16} className="animate-bounce" />
                Download
              </a>
            </Button>
          )}
          
          {onStopSharing && (
            <Button 
              variant="destructive" 
              className="flex-1 btn-hover"
              onClick={onStopSharing}
            >
              Stop Sharing
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FileCard;
