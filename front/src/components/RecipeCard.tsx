/**
 * RecipeCard Component
 * Redesigned for Whimsical Pantry
 * Features star ratings, category circles, and diorama shadows
 */

import { Clock, Star, StarHalf, Wheat, ChefHat, Milk, Leaf, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Recipe {
  recipe_name: string;
  ingredients: string[];
  directions: string;
  img_src: string | null;
  total_time: number | null;
  servings: string | null;
  rating: number | string | null;
  url?: string;
  missing_ingredients?: string[];
  similarity_score: number;
}

interface RecipeCardProps {
  recipe: Recipe;
  index: number;
  onClick?: (recipe: Recipe) => void;
}

const RecipeCard = ({ recipe, index, onClick }: RecipeCardProps) => {
  const matchPercentage = Math.round(recipe.similarity_score * 100);

  const getMatchEmoji = () => {
    if (matchPercentage >= 80) return "🏷️";
    if (matchPercentage >= 50) return "✨";
    return "🍃";
  };

  const formatTime = (minutes: number | null): string => {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return "N/A";
    if (minutes === 0) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getRating = (): number => {
    if (recipe.rating === "N/A" || recipe.rating === null) return 5.0;
    return typeof recipe.rating === "number" ? recipe.rating : parseFloat(recipe.rating as string) || 5.0;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />);
      } else {
        stars.push(<Star key={i} className="w-3 h-3 text-muted-foreground/30" />);
      }
    }
    return stars;
  };

  // Mock detection of categories based on ingredients
  const hasCategory = (category: string) => {
    const ingStr = recipe.ingredients.join(" ").toLowerCase();
    const keywords: Record<string, string[]> = {
      grain: ["rice", "flour", "grain", "pasta", "bread", "oat"],
      protein: ["chicken", "beef", "meat", "fish", "egg", "tofu", "shrimp"],
      dairy: ["milk", "cheese", "butter", "cream", "yogurt"],
      herb: ["basil", "leaf", "herb", "garlic", "lemon", "basil", "thyme", "rosemary"]
    };
    return keywords[category].some(kw => ingStr.includes(kw));
  };

  return (
    <Card
      className="whimsical-card opacity-0 animate-fade-in-up cursor-pointer group diorama-effect"
      onClick={() => onClick?.(recipe)}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
    >
      {/* Recipe Image or Placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
        {recipe.img_src ? (
          <img
            src={recipe.img_src}
            alt={recipe.recipe_name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-30">
            <ChefHat className="w-12 h-12 text-foreground" />
          </div>
        )}

        {/* Match Percentage Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 shadow-sm text-foreground/80 font-bold border-none text-[10px] rounded-full px-3 py-1">
            {getMatchEmoji()} {matchPercentage}%
          </Badge>
        </div>

        {/* View Icon on Hover */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <div className="bg-white p-3 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform">
            <Eye className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-4 relative z-10">
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-foreground/80 leading-tight line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
            {recipe.recipe_name}
          </h4>

          {/* Star Rating & Numeric Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-0.5">
              {renderStars(getRating())}
            </div>
            <div className="text-[10px] font-black bg-secondary/40 text-secondary-foreground px-2 py-0.5 rounded-full border border-foreground/5 items-center justify-center">
              {getRating().toFixed(1)}
            </div>
          </div>
        </div>

        {/* Category Icons Circles */}
        <div className="flex items-center justify-between border-t border-foreground/5 pt-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${hasCategory('grain') ? 'bg-amber-100 text-amber-600' : 'bg-muted/50 text-muted-foreground/30'}`} title="Grain">
              <Wheat className="w-4 h-4" />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${hasCategory('protein') ? 'bg-rose-100 text-rose-600' : 'bg-muted/50 text-muted-foreground/30'}`} title="Protein">
              <ChefHat className="w-4 h-4" />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${hasCategory('dairy') ? 'bg-blue-100 text-blue-600' : 'bg-muted/50 text-muted-foreground/30'}`} title="Dairy">
              <Milk className="w-4 h-4" />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${hasCategory('herb') ? 'bg-green-100 text-green-600' : 'bg-muted/50 text-muted-foreground/30'}`} title="Herb">
              <Leaf className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-tighter">{formatTime(recipe.total_time)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
