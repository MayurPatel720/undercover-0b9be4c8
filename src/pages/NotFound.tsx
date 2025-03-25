
import React from 'react';
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <Ghost className="w-16 h-16 text-primary mb-6" />
      <h1 className="text-3xl font-bold tracking-tight mb-2">Page Not Found</h1>
      <p className="text-foreground/70 mb-8 text-center max-w-md">
        The page you're looking for has disappeared into the shadows. It might be undercover.
      </p>
      <Button asChild>
        <Link to="/">Return Home</Link>
      </Button>
    </div>
  );
};

export default NotFound;
