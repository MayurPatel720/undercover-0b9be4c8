
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chat from "@/components/Chat";

const ChatPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-white">
      <Header />
      <main className="flex-1 pt-16 pb-16 px-4 md:px-6 max-w-4xl mx-auto w-full">
        <Chat />
      </main>
      <Footer />
    </div>
  );
};

export default ChatPage;
