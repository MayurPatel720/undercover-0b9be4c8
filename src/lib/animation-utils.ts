
import { cn } from "@/lib/utils";

export const fadeIn = (delay: number = 0) => 
  cn("opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]", 
    delay > 0 ? `[animation-delay:${delay}ms]` : "");

export const scaleIn = (delay: number = 0) => 
  cn("scale-95 opacity-0 animate-[scaleIn_0.3s_ease-out_forwards]", 
    delay > 0 ? `[animation-delay:${delay}ms]` : "");

export const generateRandomGradient = () => {
  const gradients = [
    "bg-gradient-to-r from-purple-500 to-pink-500",
    "bg-gradient-to-r from-blue-500 to-cyan-400",
    "bg-gradient-to-r from-orange-400 to-pink-500",
    "bg-gradient-to-r from-green-400 to-cyan-500",
    "bg-gradient-to-r from-pink-500 to-yellow-400",
    "bg-gradient-to-r from-indigo-500 to-purple-500",
    "bg-gradient-to-r from-rose-400 to-orange-300",
    "bg-gradient-to-r from-fuchsia-500 to-cyan-500",
  ];
  
  return gradients[Math.floor(Math.random() * gradients.length)];
};
