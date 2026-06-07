/**
 * Whimsical Pantry - Recipe Discovery App
 * Cozy, playful, and magical kitchen theme
 */

import { useState } from "react";
import {
  ChefHat,
  Sparkles,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Wheat,
  Egg,
  Milk,
  Leaf,
  Target,
  Home,
  Search,
  Book,
  Heart,
  ShoppingBag
} from "lucide-react";
import IngredientInput from "@/components/IngredientInput";
import RecipeCard, { Recipe } from "@/components/RecipeCard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ExistingRecipes from "@/components/ExistingRecipes";
import RecipeDetailModal from "@/components/RecipeDetailModal";
import useRecipeRecommendations from "@/hooks/useRecipeRecommendations";

const Index = () => {
  const {
    recipes,
    isLoading,
    error,
    hasSearched,
    fetchRecommendations,
    totalCount,
    totalPages,
    currentPage,
    lastIngredients
  } = useRecipeRecommendations();

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Dietary filters for the "mobile" UI
  const dietTags = [
    { icon: <Sprout className="w-4 h-4 text-emerald-500" />, label: "Vegan" },
    { icon: <Wheat className="w-4 h-4 text-amber-600" />, label: "Grain-free" },
    { icon: <Egg className="w-4 h-4 text-orange-400" />, label: "Dairy-free" },
    { icon: <Milk className="w-4 h-4 text-blue-400" />, label: "Wholesome" },
    { icon: <Leaf className="w-4 h-4 text-green-500" />, label: "Herbal" },
    { icon: <Utensils className="w-4 h-4 text-rose-400" />, label: "Quick" },
  ];

  const handleFilterToggle = (label: string) => {
    const newFilters = selectedFilters.includes(label)
      ? selectedFilters.filter(f => f !== label)
      : [...selectedFilters, label];
    setSelectedFilters(newFilters);

    if (hasSearched || lastIngredients || newFilters.length > 0) {
      fetchRecommendations(lastIngredients, newFilters, 1);
    } else if (newFilters.length === 0) {
      // If they deselected the last filter and haven't searched ingredients, we can't fetch.
      // Resetting state in useRecipeRecommendations would be ideal, but for now it will just show previous if we do nothing
      // We can also let the empty search hit the backend, which will return all. But we have a block in the hook.
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchRecommendations(lastIngredients, selectedFilters, newPage);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background parchment-texture flex flex-col items-center">
      {/* Navigation Header */}
      <header className="w-full h-16 bg-white/70 backdrop-blur-md border-b border-foreground/5 sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">Whimsical Pantry</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-1.5"><Home className="w-3.5 h-3.5" /> Home</a>
          <a href="#cherished-favorites" className="text-sm font-bold uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> Favorites</a>
          <a href="#all-recipes-section" className="text-sm font-bold uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5"><Book className="w-3.5 h-3.5" /> Browse Recipes</a>
        </nav>
        <button className="md:hidden p-2 rounded-full bg-primary/10 text-primary">
          <Utensils className="w-5 h-5" />
        </button>
      </header>

      {/* Hero Section */}
      <section className="w-full pt-16 pb-12 px-4 flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-1.5 rounded-full shadow-sm border border-foreground/5 mb-4 animate-float">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Your Culinary Companion</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight text-center">
          Whimsical Pantry
        </h1>
        <h2 className="text-xl md:text-2xl font-bold text-foreground/80 mt-2">
          Recipes Based on What You Have
        </h2>
        <p className="text-muted-foreground font-medium mt-1">
          Enter your ingredients and we'll suggest magic for your kitchen.
        </p>
      </section>

      <main className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Search & Dietary Filters Section */}
        <section className="max-w-4xl mx-auto mb-16">

          {/* Dietary Filter Mobile: Horizontal Scroll */}
          <div className="dietary-scroll mb-8 px-2 py-4 gap-3 flex overflow-x-auto pb-4">
            {dietTags.map((tag, i) => {
              const isActive = selectedFilters.includes(tag.label);
              return (
                <button
                  key={i}
                  onClick={() => handleFilterToggle(tag.label)}
                  className={`hanging-tag flex-shrink-0 transition-all ${isActive ? 'bg-primary/20 border-primary shadow-md scale-105' : 'hover:bg-white/60'}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {tag.icon}
                  <span className={`text-xs font-bold uppercase tracking-tighter whitespace-nowrap ${isActive ? 'text-primary' : 'text-foreground/70'}`}>{tag.label}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-white/40 backdrop-blur-md p-8 rounded-[3rem] shadow-soft border border-white/60 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
            <div className="relative z-10">
              <IngredientInput
                onSubmit={(ingredients) => fetchRecommendations(ingredients, selectedFilters, 1)}
                isLoading={isLoading}
              />
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section id="results-section" className="min-h-[400px]">
          {isLoading && <LoadingState count={8} />}

          {!isLoading && error && (
            <EmptyState type="error" message={error} />
          )}

          {!isLoading && !error && hasSearched && recipes.length === 0 && (
            <EmptyState type="no-results" />
          )}

          {!isLoading && !error && recipes.length > 0 && (
            <div className="space-y-12 animate-fade-in">

              {/* Results Heading with Decorative Badge */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 bg-white/60 px-6 py-2 rounded-full border border-foreground/5 shadow-sm">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="text-2xl font-bold text-foreground/80">
                    Recipes Based on Your Ingredients
                  </h3>
                  <div className="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {totalCount}
                  </div>
                </div>
                <p className="text-muted-foreground font-medium italic">
                  Magical results found in our scrolls...
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {recipes.map((recipe, index) => (
                  <RecipeCard
                    key={`${recipe.recipe_name}-${index}`}
                    recipe={recipe}
                    index={(currentPage - 1) * 8 + index}
                    onClick={handleRecipeClick}
                  />
                ))}
              </div>

              {/* Recommendation Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4 pt-10 pb-6 text-center">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-full bg-white border border-foreground/10 hover:bg-secondary disabled:opacity-30 transition-all flex items-center justify-center shadow-sm"
                    >
                      <ChevronLeft className="w-5 h-5 text-foreground" />
                    </button>

                    <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full border border-foreground/10 shadow-sm">
                      <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Scroll</span>
                      <div className="font-bold text-foreground">
                        {currentPage} <span className="text-foreground/30 font-medium">/ {totalPages}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-full bg-white border border-foreground/10 hover:bg-secondary disabled:opacity-30 transition-all flex items-center justify-center shadow-sm"
                    >
                      <ChevronRight className="w-5 h-5 text-foreground" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Recipe Detail Modal */}
        <RecipeDetailModal
          recipe={selectedRecipe}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Existing Recipes Section */}
        <div className="mt-20">
          <ExistingRecipes />
        </div>
      </main>

      {/* Footer: Simple credit line with kitchen icons */}
      <footer className="w-full border-t border-foreground/5 bg-white/40 py-12 mt-20">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 opacity-30">
            <ChefHat className="w-6 h-6" />
            <Utensils className="w-6 h-6" />
            <Wheat className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-foreground/40 tracking-widest uppercase">
            Whimsical Pantry • Hand-crafted with Magic • 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
