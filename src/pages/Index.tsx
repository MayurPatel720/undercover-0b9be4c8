
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Feed from "@/components/Feed";
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className={`flex-1 ${isMobile ? 'pt-16 pb-16' : 'pt-20 pb-6'}`}>
        <Feed />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
