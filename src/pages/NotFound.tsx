
import React from 'react';
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-float">
            <FileQuestion size={48} className="text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-purple-gradient mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! We couldn't find that page</p>
        
        <Button asChild className="gap-2">
          <Link to="/">
            <Home size={18} />
            Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
