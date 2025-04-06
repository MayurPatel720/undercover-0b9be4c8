
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Discover from "@/components/Discover";
import { useIsMobile } from '@/hooks/use-mobile';

const DiscoverPage = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className={`flex-1 ${isMobile ? 'pt-16 pb-16' : 'pt-20 pb-6'} w-full max-w-screen-xl mx-auto`}>
        <Discover />
      </main>
      <Footer />
    </div>
  );
};

export default DiscoverPage;
