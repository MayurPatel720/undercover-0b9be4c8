
import React from 'react';
import Header from "@/components/Header";
import Feed from "@/components/Feed";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <Feed />
      </main>
    </div>
  );
};

export default Index;
