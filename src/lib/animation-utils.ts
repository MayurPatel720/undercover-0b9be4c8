
import { cn } from "@/lib/utils";

export const fadeIn = (delay: number = 0) => 
  cn("opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]", 
    delay > 0 ? `[animation-delay:${delay}ms]` : "");

export const scaleIn = (delay: number = 0) => 
  cn("scale-95 opacity-0 animate-[scaleIn_0.3s_ease-out_forwards]", 
    delay > 0 ? `[animation-delay:${delay}ms]` : "");

export const generateRandomGradient = () => {
  const gradients = [
    "bg-gradient-to-r from-[#1a365d] to-[#2d6b96]",
    "bg-gradient-to-r from-[#2d6b96] to-[#1a365d]",
    "bg-gradient-to-r from-[#2d6b96] to-[#1a365d]/80",
    "bg-gradient-to-r from-[#1a365d] to-[#1a365d]/80",
    "bg-gradient-to-r from-[#1a365d]/90 to-[#2d6b96]",
    "bg-gradient-to-r from-[#1a365d] to-[#2d6b96]/90",
    "bg-gradient-to-r from-[#1a365d]/80 to-[#2d6b96]/90",
    "bg-gradient-to-r from-[#2d6b96]/90 to-[#1a365d]/80",
  ];
  
  return gradients[Math.floor(Math.random() * gradients.length)];
};
