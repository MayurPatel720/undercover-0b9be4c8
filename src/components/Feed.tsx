
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import Post, { Comment } from './Post';
import Footer from './Footer';

// Mock data for posts
const POSTS = [
  {
    id: '1',
    avatar: '/avatar1.png',
    nickname: 'ShadowFox',
    content: 'Just found the most amazing coffee shop downtown. The ambiance is perfect for working remotely, and they have these incredible pastries that melt in your mouth!',
    timestamp: '2 hours ago',
    likes: 24,
    image: '/lovable-uploads/e4483356-161b-45f7-8258-cc25c4c5ebae.png',
    comments: [
      {
        id: 'c1',
        avatar: '/avatar2.png',
        nickname: 'NeonGhost',
        content: 'I think I know which one you mean! Is it the one with the blue awning?',
        timestamp: '1 hour ago'
      },
      {
        id: 'c2',
        avatar: '/avatar3.png',
        nickname: 'MidnightWanderer',
        content: 'Their cold brew is amazing too. Spent my whole afternoon there yesterday.',
        timestamp: '45 minutes ago'
      }
    ] as Comment[]
  },
  {
    id: '2',
    avatar: '/avatar4.png',
    nickname: 'MysteryTraveler',
    content: 'Watching the sunset from this hidden spot in the city. Sometimes the best views are the ones nobody talks about.',
    timestamp: '5 hours ago',
    likes: 57,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    comments: [
      {
        id: 'c3',
        avatar: '/avatar5.png',
        nickname: 'UrbanSpecter',
        content: 'Is that near the old bridge? I think I recognize the skyline!',
        timestamp: '4 hours ago'
      }
    ] as Comment[]
  },
  {
    id: '3',
    avatar: '/avatar6.png',
    nickname: 'VelvetWhisper',
    content: 'Just finished reading this book that completely changed my perspective on life. Has anyone read "The Silent Path"?',
    timestamp: '1 day ago',
    likes: 89,
    comments: [
      {
        id: 'c4',
        avatar: '/avatar7.png',
        nickname: 'EchoSage',
        content: 'One of my favorites! The chapter about mindful decisions really stuck with me.',
        timestamp: '20 hours ago'
      },
      {
        id: 'c5',
        avatar: '/avatar8.png',
        nickname: 'CipherEcho',
        content: 'I\'ve been meaning to read that. Is it as life-changing as everyone says?',
        timestamp: '18 hours ago'
      },
      {
        id: 'c6',
        avatar: '/avatar9.png',
        nickname: 'NightVeil',
        content: 'I think I know who you are based on your book taste... 👀',
        timestamp: '12 hours ago'
      }
    ] as Comment[]
  },
  {
    id: '4',
    avatar: '/avatar10.png',
    nickname: 'PhantomCoder',
    content: 'Working on a side project that combines AI and music. The results are surprisingly emotional. Technology can be so beautiful sometimes.',
    timestamp: '3 days ago',
    likes: 132,
    image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843',
    comments: [
      {
        id: 'c7',
        avatar: '/avatar11.png',
        nickname: 'DigitalSpecter',
        content: 'This sounds fascinating! Would love to hear more about your approach.',
        timestamp: '2 days ago'
      },
      {
        id: 'c8',
        avatar: '/avatar12.png',
        nickname: 'ShadowByte',
        content: 'Have you published any demos yet? Would love to check it out.',
        timestamp: '1 day ago'
      }
    ] as Comment[]
  },
  {
    id: '5',
    avatar: '/avatar13.png',
    nickname: 'DuskWanderer',
    content: 'Anyone else feel like they\'re living two separate lives sometimes? The public persona vs. who you really are when nobody\'s watching...',
    timestamp: '6 hours ago',
    likes: 215,
    comments: [
      {
        id: 'c9',
        avatar: '/avatar14.png',
        nickname: 'MaskedThinker',
        content: 'All the time. That\'s why I love this app - I can be myself without the weight of my public image.',
        timestamp: '5 hours ago'
      },
      {
        id: 'c10',
        avatar: '/avatar15.png',
        nickname: 'VeritasShade',
        content: 'The masks we wear become so comfortable that sometimes I forget which version is the real me.',
        timestamp: '4 hours ago'
      },
      {
        id: 'c11',
        avatar: '/avatar16.png',
        nickname: 'EtherealEcho',
        content: 'I think we all have multiple authentic versions of ourselves. None are less real than others.',
        timestamp: '3 hours ago'
      }
    ] as Comment[]
  }
];

const Feed = () => {
  return (
    <>
      <ScrollArea className="h-[calc(100vh-140px)] w-full px-4">
        <div className="max-w-lg mx-auto py-6">
          <div className="flex items-center justify-between mb-6 overflow-x-auto pb-2">
            <div className="flex gap-2">
              <div className="flex flex-col items-center mr-1">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </div>
                <span className="text-xs mt-1">Add</span>
              </div>
              
              {['Brooklyn', 'Esther', 'Robert', 'Leslie'].map((name, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full bg-orange-${300 + index * 100} flex items-center justify-center border-2 ${index === 0 ? 'border-primary' : 'border-transparent'}`}>
                    <span className="text-xs">{name.substring(0, 1)}</span>
                  </div>
                  <span className="text-xs mt-1">{name}</span>
                  {index === 0 && <span className="text-xs text-primary">Live</span>}
                </div>
              ))}
            </div>
          </div>
          
          {POSTS.map(post => (
            <Post
              key={post.id}
              id={post.id}
              avatar={post.avatar}
              nickname={post.nickname}
              content={post.content}
              timestamp={post.timestamp}
              initialLikes={post.likes}
              initialComments={post.comments}
              image={post.image}
            />
          ))}
        </div>
      </ScrollArea>
      <Footer />
    </>
  );
};

export default Feed;
