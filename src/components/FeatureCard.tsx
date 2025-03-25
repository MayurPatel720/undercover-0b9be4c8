
import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="group hover:border-primary/20 transition-all duration-300 overflow-hidden glass-card hover:shadow-md hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="mb-4 rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="mb-2">{title}</CardTitle>
        <CardDescription className="text-foreground/70">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
