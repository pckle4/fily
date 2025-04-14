
import React from 'react';
import { FileMetadata } from '@/services/indexedDBService';
import { FileIcon, Download, Share2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface FileCardProps {
  metadata: FileMetadata;
  downloadUrl?: string;
  showDownload?: boolean;
  showShare?: boolean;
}

const FileCard: React.FC<FileCardProps> = ({ 
  metadata, 
  downloadUrl, 
  showDownload = false,
  showShare = true
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
  
  // Determine file icon background color based on type
  const getFileTypeColor = () => {
    if (metadata.type.includes('image')) return 'bg-blue-100 text-blue-600';
    if (metadata.type.includes('video')) return 'bg-red-100 text-red-600';
    if (metadata.type.includes('audio')) return 'bg-green-100 text-green-600';
    if (metadata.type.includes('pdf')) return 'bg-yellow-100 text-yellow-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <Card className="animate-expand overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${getFileTypeColor()}`}>
            <FileIcon size={24} />
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
                <Share2 size={16} />
                <span>Share Code</span>
              </div>
              <div className="font-mono bg-primary/10 px-2 py-1 rounded text-primary font-medium">
                {metadata.shareId}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500 gap-2">
              <Clock size={16} />
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
              className="flex-1"
              onClick={copyShareLink}
            >
              Copy Share Link
            </Button>
          )}
          
          {showDownload && downloadUrl && (
            <Button 
              className="flex-1 gap-2"
              asChild
            >
              <a href={downloadUrl} download={metadata.name}>
                <Download size={16} />
                Download
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FileCard;
