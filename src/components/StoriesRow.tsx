
import React from 'react';
import StoryCircle from './StoryCircle';

// Mock data for stories
const STORIES = [
  { id: '1', avatar: 'https://source.unsplash.com/random/100x100/?portrait,1', name: 'YourStory', hasUnseenStory: false },
  { id: '2', avatar: 'https://source.unsplash.com/random/100x100/?portrait,2', name: 'ShadowFox', hasUnseenStory: true },
  { id: '3', avatar: 'https://source.unsplash.com/random/100x100/?portrait,3', name: 'NeonGhost', hasUnseenStory: true },
  { id: '4', avatar: 'https://source.unsplash.com/random/100x100/?portrait,4', name: 'MysteryT', hasUnseenStory: true },
  { id: '5', avatar: 'https://source.unsplash.com/random/100x100/?portrait,5', name: 'VelvetW', hasUnseenStory: false },
  { id: '6', avatar: 'https://source.unsplash.com/random/100x100/?portrait,6', name: 'PhantomC', hasUnseenStory: true },
  { id: '7', avatar: 'https://source.unsplash.com/random/100x100/?portrait,7', name: 'DuskWand', hasUnseenStory: false },
];

const StoriesRow = () => {
  return (
    <div className="w-full overflow-x-auto scrollbar-none">
      <div className="flex px-4 py-3 space-x-1">
        {STORIES.map(story => (
          <StoryCircle 
            key={story.id}
            avatar={story.avatar} 
            name={story.name}
            hasUnseenStory={story.hasUnseenStory}
          />
        ))}
      </div>
    </div>
  );
};

export default StoriesRow;
