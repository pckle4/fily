
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Code, Database, Palette, Browser, Server, Globe, Github, Package, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const technologies = [
  {
    name: 'React',
    version: '18.3.1',
    description: 'A JavaScript library for building user interfaces',
    icon: <Browser className="h-6 w-6 text-blue-500" />,
    category: 'Frontend'
  },
  {
    name: 'TypeScript',
    version: '5.2.x',
    description: 'Typed JavaScript at any scale',
    icon: <Code2 className="h-6 w-6 text-blue-700" />,
    category: 'Language'
  },
  {
    name: 'Tailwind CSS',
    version: '3.x',
    description: 'A utility-first CSS framework',
    icon: <Palette className="h-6 w-6 text-teal-500" />,
    category: 'Styling'
  },
  {
    name: 'Vite',
    version: '5.x',
    description: 'Next generation frontend tooling',
    icon: <Package className="h-6 w-6 text-purple-500" />,
    category: 'Build Tool'
  },
  {
    name: 'IndexedDB',
    version: 'Browser API',
    description: 'Low-level API for client-side storage',
    icon: <Database className="h-6 w-6 text-orange-500" />,
    category: 'Storage'
  },
  {
    name: 'React Router',
    version: '6.26.2',
    description: 'Declarative routing for React',
    icon: <Globe className="h-6 w-6 text-red-500" />,
    category: 'Routing'
  },
  {
    name: 'Lucide React',
    version: '0.462.0',
    description: 'Beautiful & consistent icons',
    icon: <Package className="h-6 w-6 text-gray-500" />,
    category: 'UI'
  },
  {
    name: 'TanStack Query',
    version: '5.56.2',
    description: 'Data fetching and state management',
    icon: <Server className="h-6 w-6 text-indigo-500" />,
    category: 'State'
  },
  {
    name: 'shadcn/ui',
    version: 'Latest',
    description: 'Accessible and customizable UI components',
    icon: <Code className="h-6 w-6 text-gray-700" />,
    category: 'UI'
  },
];

const TechStack: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="container px-4 py-12 mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Button variant="outline" size="sm" asChild className="mb-4">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft size={16} />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-purple-gradient">
              Tech Stack
            </h1>
            <p className="text-gray-600 mt-2">
              Technologies used to build Fily
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm">
            <Github size={20} className="text-gray-700" />
            <div>
              <h3 className="font-medium">Open Source</h3>
              <p className="text-xs text-gray-500">Built with modern web technologies</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {technologies.map((tech, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-md transition-all">
              <CardContent className="p-0">
                <div className="flex items-start p-4 gap-4">
                  <div className="p-2 rounded-lg bg-gray-100 flex-shrink-0">
                    {tech.icon}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{tech.name}</h3>
                      <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
                        {tech.version}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{tech.description}</p>
                    <div className="mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                        {tech.category}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <p className="text-sm text-gray-500">
            Built with ❤️ using modern web technologies
          </p>
          <div className="mt-4">
            <Link to="/" className="text-primary hover:underline text-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechStack;
