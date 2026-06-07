/**
 * IngredientInput Component
 * Styled for the Whimsical Pantry
 */

import { useState, FormEvent } from "react";
import { Key, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface IngredientInputProps {
  onSubmit: (ingredients: string) => void;
  isLoading: boolean;
}

const IngredientInput = ({ onSubmit, isLoading }: IngredientInputProps) => {
  const [ingredients, setIngredients] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (ingredients.trim()) {
      onSubmit(ingredients);
    }
  };

  const exampleIngredients = [
    { text: "chicken, garlic, lemon", emoji: "🍗" },
    { text: "pasta, tomato, basil", emoji: "🍝" },
    { text: "rice, vegetables, soy", emoji: "🍚" },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8">
      <div className="w-full relative group">
        <Textarea
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter ingredients you have (e.g., honey, garlic, milk)"
          className="min-h-[60px] text-lg bg-white/50 border-none focus-visible:ring-0 rounded-[2rem] placeholder:text-muted-foreground/40 font-medium resize-none px-6 py-4 transition-all group-hover:bg-white/70"
          disabled={isLoading}
        />
        <div className="absolute bottom-4 right-6 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">
          Separate with commas
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {exampleIngredients.map((example, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIngredients(example.text)}
            className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full bg-secondary/30 hover:bg-secondary/60 text-secondary-foreground transition-all hover:scale-105 border border-foreground/5 shadow-sm"
            disabled={isLoading}
          >
            {example.text}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Enter ingredients you have, and we'll suggest recipes!
        </p>
        <Button
          type="submit"
          className="golden-key-cta p-0 flex flex-col items-center justify-center relative overflow-visible"
          disabled={!ingredients.trim() || isLoading}
        >
          {isLoading ? (
            <div className="w-8 h-8 border-4 border-yellow-800/30 border-t-yellow-900 rounded-full animate-spin" />
          ) : (
            <>
              <Key className="w-10 h-10 text-yellow-900 transition-transform group-hover:rotate-45" />
              <span className="text-[10px] font-black text-yellow-900 mt-1 uppercase tracking-tighter">Find Magic</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default IngredientInput;
