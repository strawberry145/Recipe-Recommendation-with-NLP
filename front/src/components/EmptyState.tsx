/**
 * EmptyState Component
 * Cute empty states with playful design
 */

import { ChefHat, Search, AlertCircle, Sparkles, Cookie, Heart } from "lucide-react";

type EmptyStateType = "initial" | "no-results" | "error";

interface EmptyStateProps {
  type: EmptyStateType;
  message?: string;
}

const EmptyState = ({ type, message }: EmptyStateProps) => {
  const configs = {
    initial: {
      emoji: "👨‍🍳",
      title: "Ready to Cook Something Yummy?",
      description: "Tell us what ingredients you have, and we'll find perfect recipes for you! 💕",
      bgClass: "bg-gradient-to-br from-primary/10 via-pink-100/50 to-accent/10",
    },
    "no-results": {
      emoji: "🔍",
      title: "Oops! No Recipes Found",
      description: message || "Try adding more ingredients or different ones. We believe in you! 💪",
      bgClass: "bg-gradient-to-br from-secondary via-muted to-secondary",
    },
    error: {
      emoji: "😢",
      title: "Oh No! Something Went Wrong",
      description: message || "We couldn't connect to the recipe server. Please try again! 🙏",
      bgClass: "bg-gradient-to-br from-destructive/10 via-pink-50 to-destructive/5",
    },
  };

  const config = configs[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className={`w-32 h-32 rounded-3xl ${config.bgClass} flex items-center justify-center mb-6 shadow-lg animate-bounce-gentle`}>
        <span className="text-6xl">{config.emoji}</span>
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3">
        {config.title}
      </h3>
      <p className="text-muted-foreground max-w-md text-lg">
        {config.description}
      </p>
      
      {type === "initial" && (
        <div className="flex items-center gap-4 mt-8 text-muted-foreground/60">
          <Cookie className="w-6 h-6 animate-float" />
          <Sparkles className="w-5 h-5 animate-sparkle" style={{ animationDelay: '0.5s' }} />
          <Heart className="w-6 h-6 animate-float" style={{ animationDelay: '1s' }} />
        </div>
      )}
    </div>
  );
};

export default EmptyState;
