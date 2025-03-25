
import React from 'react';
import { Check, Ghost, MessageCircle, Shield, Users } from 'lucide-react';

const steps = [
  {
    title: "Create Your Masked Identity",
    description: "Sign up and get an AI-generated secret persona that hides your real identity from everyone.",
    icon: Ghost,
  },
  {
    title: "Post Anonymously",
    description: "Share your thoughts, images, and voice notes without revealing who you are.",
    icon: MessageCircle,
  },
  {
    title: "Connect With Friends",
    description: "Your real friends can discover who you are through clues and interactions.",
    icon: Users,
  },
  {
    title: "Stay Protected",
    description: "Only friends who recognize you can see your true identity - and only for themselves.",
    icon: Shield,
  },
];

const StepsSection = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">How Undercover Works</h2>
          <p className="text-foreground/70 max-w-[700px]">
            Our unique approach to social media prioritizes your privacy while maintaining real connections.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center z-10 relative">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-[2px] bg-primary/20 hidden lg:block" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-foreground/70">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
