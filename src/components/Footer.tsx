
// import React from 'react';
// import { Home, Grid, MessageCircle, Sparkles, User } from 'lucide-react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';

// const Footer = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuth();
  
//   return (
//     <div className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-t border-border flex items-center justify-around px-4">
//       <button 
//         className={`flex flex-col items-center justify-center ${location.pathname === '/' ? 'text-accent' : 'text-muted-foreground'}`}
//         onClick={() => navigate('/')}
//       >
//         <Home className="w-6 h-6" />
//         <span className="text-xs mt-1">Home</span>
//       </button>
      
//       <button 
//         className={`flex flex-col items-center justify-center ${location.pathname === '/discover' ? 'text-accent' : 'text-muted-foreground'}`}
//         onClick={() => navigate('/discover')}
//       >
//         <Grid className="w-6 h-6" />
//         <span className="text-xs mt-1">Discover</span>
//       </button>
      
//       <div className="flex items-center justify-center -mt-10">
//         <div 
//           className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg cursor-pointer"
//           onClick={() => navigate('/chat')}
//         >
//           <MessageCircle className="w-7 h-7 text-white" />
//         </div>
//       </div>
      
//       <button 
//         className={`flex flex-col items-center justify-center ${location.pathname === '/trending' ? 'text-accent' : 'text-muted-foreground'}`}
//         onClick={() => navigate('/trending')}
//       >
//         <Sparkles className="w-6 h-6" />
//         <span className="text-xs mt-1">Trending</span>
//       </button>
      
//       <button 
//         className={`flex flex-col items-center justify-center ${location.pathname === '/profile' ? 'text-accent' : 'text-muted-foreground'}`}
//         onClick={() => navigate('/profile')}
//       >
//         <User className="w-6 h-6" />
//         <span className="text-xs mt-1">Profile</span>
//       </button>
//     </div>
//   );
// };

// export default Footer;
import { Home, Grid, MessageCircle, Sparkles, User } from 'lucide-react';
import ad from "../assets/footer.png";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="fixed bottom-0 w-full mx-auto left-1/2 transform -translate-x-1/2">
      <img
        src={ad}
        alt="footer"
        className="w-full max-h-[200px] md:max-h-[250px] lg:max-h-[100px] object-cover"
      />

      <div className="absolute bottom-0 w-full flex justify-between items-center px-6 pb-4">
        <Home
          className="text-3xl text-white cursor-pointer"
          onClick={() => navigate("/")}
        />
        <Grid
          className="text-3xl relative right-6 text-white cursor-pointer"
          onClick={() => navigate("/discover")}
        />

        {/* Center Floating Chat Icon */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 -top-14 bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full shadow-lg "
          onClick={() => navigate("/chat")}
        >
          <MessageCircle className="text-4xl text-white cursor-pointer" />
        </div>

        <Sparkles
          className="text-3xl relative left-6 text-white cursor-pointer"
          onClick={() => navigate("/reel")}
        />
        <User
          className="text-3xl text-white cursor-pointer"
          onClick={() => navigate("/profile")}
        />
      </div>
    </footer>
  );
};

export default Footer;

