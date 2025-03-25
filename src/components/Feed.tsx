
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import Post, { Comment } from './Post';

// Mock data for posts
const POSTS = [
  {
    id: '1',
    avatar: '/avatar1.png',
    nickname: 'ShadowFox',
    content: 'Just found the most amazing coffee shop downtown. The ambiance is perfect for working remotely, and they have these incredible pastries that melt in your mouth!',
    timestamp: '2 hours ago',
    likes: 24,
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
        content: 'I've been meaning to read that. Is it as life-changing as everyone says?',
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
    content: 'Anyone else feel like they're living two separate lives sometimes? The public persona vs. who you really are when nobody's watching...',
    timestamp: '6 hours ago',
    likes: 215,
    comments: [
      {
        id: 'c9',
        avatar: '/avatar14.png',
        nickname: 'MaskedThinker',
        content: 'All the time. That's why I love this app - I can be myself without the weight of my public image.',
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
    <ScrollArea className="h-[calc(100vh-80px)] w-full px-4">
      <div className="max-w-lg mx-auto py-6">
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
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default Feed;
