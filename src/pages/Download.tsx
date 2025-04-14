
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileMetadata } from '@/services/indexedDBService';
import indexedDBService from '@/services/indexedDBService';
import FileCard from '@/components/FileCard';
import { ArrowLeft, DownloadIcon, FileX, Calendar, Clock, HardDrive, FileType, Lock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

const DownloadPage = () => {
  const { shareId = '' } = useParams<{ shareId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [fileData, setFileData] = useState<{ metadata: FileMetadata; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      setIsLoading(true);
      try {
        const result = await indexedDBService.getFileByShareId(shareId);
        
        if (!result) {
          setError('File not found or has expired');
          setIsLoading(false);
          return;
        }

        // Create a URL for the file
        const url = URL.createObjectURL(result.file);
        setFileData({ metadata: result.metadata, url });
      } catch (err) {
        console.error('Error fetching file:', err);
        setError('Failed to fetch the file');
      } finally {
        setIsLoading(false);
      }
    };

    if (shareId) {
      fetchFile();
    }

    // Clean up the URL when unmounting
    return () => {
      if (fileData?.url) {
        URL.revokeObjectURL(fileData.url);
      }
    };
  }, [shareId]);

  const handleDownload = () => {
    if (fileData) {
      setIsDownloading(true);
      // Simulate download progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(() => {
            setIsDownloading(false);
            setDownloadProgress(0);
            toast({
              title: "Download completed!",
              description: `${fileData.metadata.name} has been downloaded`,
              duration: 3000,
            });
          }, 500);
        }
        setDownloadProgress(progress);
      }, 300);
      
      toast({
        title: "Download started!",
        description: `Downloading ${fileData.metadata.name}...`,
        duration: 3000,
      });
    }
  };
  
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const calculateDaysRemaining = (expiryDate: Date): number => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = Math.abs(expiry.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Upload
        </Link>
        
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-purple-gradient mb-4">
            Download Your File
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Your file is securely stored and ready for download
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 max-w-md mx-auto">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin-slow"></div>
              <p className="mt-4 text-gray-600">Fetching your file...</p>
            </div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 mb-4 text-gray-400">
                <FileX size={64} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">File Not Found</h3>
              <p className="mt-2 text-gray-600">{error}</p>
              <Button asChild className="mt-6">
                <Link to="/">Upload New File</Link>
              </Button>
            </div>
          ) : fileData && (
            <div className="space-y-6">
              <FileCard 
                metadata={fileData.metadata} 
                downloadUrl={fileData.url}
                showDownload={true}
                showShare={false}
              />
              
              {/* File Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Uploaded</p>
                    <p className="text-sm font-medium">{formatDate(fileData.metadata.uploadDate)}</p>
                  </div>
                </Card>
                
                <Card className="p-3 flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expires In</p>
                    <p className="text-sm font-medium">{calculateDaysRemaining(fileData.metadata.expiryDate)} days</p>
                  </div>
                </Card>
                
                <Card className="p-3 flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <HardDrive size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="text-sm font-medium">
                      {fileData.metadata.size < 1024
                        ? `${fileData.metadata.size} bytes`
                        : fileData.metadata.size < 1024 * 1024
                        ? `${(fileData.metadata.size / 1024).toFixed(2)} KB`
                        : `${(fileData.metadata.size / (1024 * 1024)).toFixed(2)} MB`}
                    </p>
                  </div>
                </Card>
                
                <Card className="p-3 flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                    <FileType size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm font-medium">{fileData.metadata.type.split('/')[1]?.toUpperCase() || 'FILE'}</p>
                  </div>
                </Card>
                
                <Card className="p-3 flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    <Lock size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Share ID</p>
                    <p className="text-sm font-mono font-medium">{fileData.metadata.shareId}</p>
                  </div>
                </Card>
                
                <Card className="p-3 flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Storage</p>
                    <p className="text-sm font-medium">Local Browser</p>
                  </div>
                </Card>
              </div>
              
              {/* Animated Download Button */}
              {isDownloading ? (
                <div className="space-y-3">
                  <Progress value={downloadProgress} className="h-2 w-full" />
                  <p className="text-center text-sm text-gray-600">Downloading... {Math.round(downloadProgress)}%</p>
                </div>
              ) : (
                <Button 
                  onClick={handleDownload} 
                  size="lg"
                  className="w-full gap-2 animate-pulse-slow transition-all hover:scale-105"
                  asChild
                >
                  <a href={fileData.url} download={fileData.metadata.name}>
                    <DownloadIcon size={18} className="animate-bounce" />
                    Download Now
                  </a>
                </Button>
              )}
              
              <p className="text-xs text-center text-gray-500 mt-4">
                This file will expire in {calculateDaysRemaining(fileData.metadata.expiryDate)} days
              </p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-16">
          <p className="text-sm text-gray-500">All files are stored locally in your browser and expire after 7 days</p>
          <div className="mt-4 flex flex-col items-center justify-center">
            <p className="font-mono text-xs text-gray-400 animate-typing">A Nowhile initiative</p>
            <p className="mt-2 text-sm text-gray-600">Made with ❤️ by Ansh</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
