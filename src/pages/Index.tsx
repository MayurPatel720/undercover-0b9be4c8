
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Feed from "@/components/Feed";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 pt-16 pb-16">
        <Feed />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
