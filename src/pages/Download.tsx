
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileMetadata } from '@/services/indexedDBService';
import indexedDBService from '@/services/indexedDBService';
import FileCard from '@/components/FileCard';
import { ArrowLeft, Download, FileNotFound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Download = () => {
  const { shareId = '' } = useParams<{ shareId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [fileData, setFileData] = useState<{ metadata: FileMetadata; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      toast({
        title: "Download started!",
        description: `Downloading ${fileData.metadata.name}...`,
        duration: 3000,
      });
    }
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
                <FileNotFound size={64} />
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
              
              <Button 
                onClick={handleDownload} 
                size="lg"
                className="w-full gap-2 animate-pulse-glow"
                asChild
              >
                <a href={fileData.url} download={fileData.metadata.name}>
                  <Download size={18} />
                  Download Now
                </a>
              </Button>
              
              <p className="text-xs text-center text-gray-500 mt-4">
                This file will expire in {
                  Math.ceil(
                    (new Date(fileData.metadata.expiryDate).getTime() - new Date().getTime()) / 
                    (1000 * 60 * 60 * 24)
                  )
                } days
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Download;
