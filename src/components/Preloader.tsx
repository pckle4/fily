
import React from 'react';
import { LoaderCircle, Send, FileUp } from 'lucide-react';

const Preloader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 z-50">
      <div className="relative">
        <LoaderCircle size={60} className="text-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileUp size={30} className="text-primary" />
        </div>
      </div>
      
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-purple-gradient mt-6 mb-2">
        Fily
      </h1>
      
      <div className="flex items-center gap-2 mt-2">
        <span className="text-sm text-gray-600">Loading secure file sharing</span>
        <div className="flex space-x-1">
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-xs text-gray-500">
        <Send size={14} className="text-primary" />
        <span>Fast • Secure • Simple</span>
      </div>
    </div>
  );
};

export default Preloader;
