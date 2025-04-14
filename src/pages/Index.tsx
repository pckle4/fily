import React, { useState, useEffect } from 'react';
import { Upload, Shield, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileDropZone from '@/components/FileDropZone';
import FileCard from '@/components/FileCard';
import indexedDBService, { FileMetadata } from '@/services/indexedDBService';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileMetadata | null>(null);
  const { toast } = useToast();

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
      const metadata = await indexedDBService.storeFile(file);
      setUploadedFile(metadata);
      toast({
        title: "Upload successful!",
        description: `${file.name} has been uploaded and is ready to share`,
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

  const copyShareLink = () => {
    if (!uploadedFile) return;
    
    const shareUrl = `${window.location.origin}/download/${uploadedFile.shareId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast({
          title: "Link copied!",
          description: "Share link has been copied to clipboard",
          duration: 3000,
        });
      })
      .catch(() => {
        toast({
          title: "Copy failed",
          description: "Could not copy link to clipboard",
          variant: "destructive",
          duration: 3000,
        });
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="container px-4 py-12 mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-purple-gradient mb-4 animate-expand">
            KineticSwarm
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Fast, secure P2P file sharing directly from your browser
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <Shield size={16} className="text-primary" />
              <span>Secure P2P Sharing</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <Upload size={16} className="text-primary" />
              <span>No Size Limits</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <Share2 size={16} className="text-primary" />
              <span>Easy Sharing</span>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Upload Area */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Upload File</h2>
            <p className="text-gray-600 mb-6">Drag and drop your file or click to browse. Your file will be stored securely for 7 days.</p>
            
            <FileDropZone 
              onFileSelected={handleFileSelected} 
              isUploading={isUploading}
            />
          </div>

          {/* File Info Area */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Share Your File</h2>
            <p className="text-gray-600 mb-6">Once uploaded, you can share your file using the link or code below.</p>
            
            {uploadedFile ? (
              <div className="space-y-4">
                <FileCard metadata={uploadedFile} />
                
                <Button 
                  className="w-full gap-2" 
                  onClick={copyShareLink}
                >
                  <Share2 size={18} />
                  Copy Share Link
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <p className="text-gray-500 text-center">
                  Upload a file to get your share link
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center mt-16 text-sm text-gray-500">
          <p>All files are stored locally in your browser and expire after 7 days</p>
          <p className="mt-1">© 2025 KineticSwarm · Built with P2P technology</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
