
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Shield, Share2, Clock, Code, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileDropZone from '@/components/FileDropZone';
import FileCard from '@/components/FileCard';
import ExpirySelector, { ExpiryDuration } from '@/components/ExpirySelector';
import indexedDBService, { FileMetadata } from '@/services/indexedDBService';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileMetadata | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<ExpiryDuration>({ 
    value: 1000 * 60 * 60 * 24 * 7, // 7 days default
    unit: 'days',
    display: '7 Days'
  });
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Clean up expired files when the component loads
    indexedDBService.cleanupExpiredFiles()
      .catch(error => {
        console.error('Error cleaning up expired files:', error);
      });
  }, []);

  const handleFileSelected = async (file: File) => {
    setIsUploading(true);
    
    try {
      const metadata = await indexedDBService.storeFile(file, selectedExpiry.value);
      setUploadedFile(metadata);
      toast({
        title: "Upload successful!",
        description: `${file.name} has been uploaded and will expire in ${selectedExpiry.display}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleExpiryChange = async (duration: ExpiryDuration) => {
    setSelectedExpiry(duration);
    
    if (uploadedFile) {
      try {
        const updatedMetadata = await indexedDBService.updateFileExpiry(uploadedFile.id, duration.value);
        if (updatedMetadata) {
          setUploadedFile(updatedMetadata);
          toast({
            title: "Expiry updated!",
            description: `File will now expire in ${duration.display}`,
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Error updating expiry time:', error);
        toast({
          title: "Update failed",
          description: "Could not update expiry time",
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  };

  const handleStopSharing = async () => {
    if (!uploadedFile) return;
    
    try {
      await indexedDBService.deleteFile(uploadedFile.id);
      setUploadedFile(null);
      toast({
        title: "Sharing stopped",
        description: "Your file is no longer available for sharing",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error stopping sharing:', error);
      toast({
        title: "Error",
        description: "Could not stop sharing the file",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="container px-4 py-12 mx-auto">
        {/* Header */}
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="sm" asChild className="flex items-center gap-2">
            <Link to="/tech-stack">
              <Code size={16} className="text-purple-500" />
              <span className="hidden sm:inline">Tech Stack</span>
            </Link>
          </Button>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-purple-gradient mb-4 animate-expand">
            Fily
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Send files quickly and securely from your browser
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 glass px-3 py-1.5 rounded-full shadow-sm">
              <Shield size={16} className="text-green-500" />
              <span>Secure Sharing</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 glass px-3 py-1.5 rounded-full shadow-sm">
              <Upload size={16} className="text-blue-500" />
              <span>No Size Limits</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 glass px-3 py-1.5 rounded-full shadow-sm">
              <Share2 size={16} className="text-purple-500" />
              <span>Easy Sharing</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 glass px-3 py-1.5 rounded-full shadow-sm">
              <Clock size={16} className="text-orange-500" />
              <span>Custom Expiry</span>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Upload Area */}
          <div className="glass rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Upload File</h2>
            <p className="text-gray-600 mb-6">Drag and drop your file or click to browse.</p>
            
            <div className="mb-6">
              <ExpirySelector 
                onExpiryChange={handleExpiryChange}
                defaultValue={selectedExpiry.value}
              />
            </div>
            
            <FileDropZone 
              onFileSelected={handleFileSelected} 
              isUploading={isUploading}
            />
          </div>

          {/* File Info Area */}
          <div className="glass rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Share Your File</h2>
            <p className="text-gray-600 mb-6">Once uploaded, you can share your file using the link or code below.</p>
            
            {uploadedFile ? (
              <div className="space-y-4">
                <FileCard 
                  metadata={uploadedFile} 
                  onStopSharing={handleStopSharing}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm">
                <Info size={40} className="text-gray-300 mb-3" />
                <p className="text-gray-500 text-center max-w-xs">
                  Upload a file to get your share link. Your files are stored locally and securely in your browser.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center mt-16">
          <p className="text-sm text-gray-500">All files are stored locally in your browser and expire based on your selection</p>
          <div className="mt-4 flex flex-col items-center justify-center">
            <Link to="/tech-stack" className="text-xs text-primary hover:underline mb-2">
              View Tech Stack
            </Link>
            <p className="font-mono text-xs text-gray-400 animate-typing">A Nowhile initiative</p>
            <p className="mt-2 text-sm text-gray-600">Made with ❤️ by Ansh</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
