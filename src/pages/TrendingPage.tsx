
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useIsMobile } from '@/hooks/use-mobile';

const TrendingPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className={`flex-1 ${isMobile ? 'pt-16 pb-16' : 'pt-20 pb-6'} w-full max-w-screen-xl mx-auto`}>
        <div className="flex items-center justify-center h-full">
          <h1 className="text-2xl font-bold text-gradient">Trending Page Coming Soon</h1>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrendingPage;
