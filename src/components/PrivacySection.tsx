
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Lock, Shield, Ghost } from 'lucide-react';

const privacyPoints = [
  {
    title: "Complete Anonymity",
    description: "Your real identity remains hidden from everyone except those you choose to reveal it to.",
    icon: Ghost,
  },
  {
    title: "End-to-End Encryption",
    description: "All communications are secured with state-of-the-art encryption technology.",
    icon: Lock,
  },
  {
    title: "No Personal Data Collection",
    description: "We don't track your personal information or sell your data to third parties.",
    icon: Shield,
  },
  {
    title: "User-Controlled Privacy",
    description: "You decide who gets to see your real identity and when they can see it.",
    icon: CheckCircle,
  },
];

const PrivacySection = () => {
  return (
    <section id="privacy" className="py-16 md:py-24 bg-secondary/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Privacy First, Always</h2>
          <p className="text-foreground/70 max-w-[700px]">
            At Undercover, we believe privacy isn't just a feature — it's the foundation of meaningful social connection.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {privacyPoints.map((point, index) => (
            <Card key={index} className="border-none shadow-sm bg-background">
              <CardContent className="p-6 flex gap-4">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{point.title}</h3>
                  <p className="text-foreground/70">{point.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrivacySection;
