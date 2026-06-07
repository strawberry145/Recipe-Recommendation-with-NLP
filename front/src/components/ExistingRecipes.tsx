import { useState, useEffect } from "react";
import { ChefHat, Clock, RefreshCw, ChevronLeft, ChevronRight, BookOpen, Star, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recipe } from "@/components/RecipeCard";
import RecipeDetailModal from "./RecipeDetailModal";

const ExistingRecipes = () => {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [isLoadingFavs, setIsLoadingFavs] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [errorFavs, setErrorFavs] = useState<string | null>(null);
  const [errorAll, setErrorAll] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFavorites = async () => {
    setIsLoadingFavs(true);
    setErrorFavs(null);
    try {
      const response = await fetch("http://localhost:5000/favorites");
      if (!response.ok) throw new Error("Failed to fetch favorites");
      const data = await response.json();
      setFavorites(data.recipes);
    } catch (err) {
      setErrorFavs(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoadingFavs(false);
    }
  };

  const fetchAllRecipes = async (page: number) => {
    setIsLoadingAll(true);
    setErrorAll(null);
    try {
      const response = await fetch(`http://localhost:5000/recipes?page=${page}&limit=8`);
      if (!response.ok) throw new Error("Failed to fetch recipes");
      const data = await response.json();
      setAllRecipes(data.recipes);
      setTotalPages(data.total_pages);
    } catch (err) {
      setErrorAll(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoadingAll(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    fetchAllRecipes(currentPage);
  }, [currentPage]);

  const filteredFavs =
    activeCategory === "All"
      ? favorites
      : favorites.filter((r) =>
        r.recipe_name.toLowerCase().includes(activeCategory.toLowerCase()) ||
        (r.url && r.url.toLowerCase().includes(activeCategory.toLowerCase()))
      );

  const formatTime = (minutes: number | null): string => {
    if (!minutes || isNaN(minutes)) return "N/A";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      document.getElementById("all-recipes-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      document.getElementById("all-recipes-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const RecipeGrid = ({ recipes, loading, error, delayBase = 0 }: { recipes: Recipe[], loading: boolean, error: string | null, delayBase?: number }) => {
    if (loading && recipes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <RefreshCw className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium italic">Consulting the scrolls...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 bg-destructive/5 text-destructive rounded-2xl border border-destructive/10">
          {error}
        </div>
      );
    }

    return (
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {recipes.map((recipe, index) => (
          <Card
            key={`${recipe.recipe_name}-${index}-${delayBase}`}
            className="whimsical-card opacity-0 animate-fade-in-up cursor-pointer group diorama-effect"
            style={{ animationDelay: `${(index + delayBase) * 80}ms`, animationFillMode: "forwards" }}
            onClick={() => handleRecipeClick(recipe)}
          >
            <div className="relative h-44 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
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
                  <ChefHat className="w-10 h-10" />
                </div>
              )}

              <div className="absolute top-2.5 left-2.5">
                <Badge className="bg-white/90 text-foreground/60 text-[10px] font-bold rounded-full border-none shadow-sm px-3 py-1">
                  {delayBase === 0 ? "Featured" : "Tale"}
                </Badge>
              </div>
              <div className="absolute top-2.5 right-2.5">
                <Badge className="bg-primary text-white border-none text-[10px] font-black rounded-full px-2 h-5 shadow-sm">
                  ★ {recipe.rating || "5.0"}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6 space-y-3">
              <h4 className="text-lg font-bold text-foreground/80 leading-tight line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                {recipe.recipe_name}
              </h4>

              <div className="flex items-center gap-4 pt-1 border-t border-foreground/5">
                {recipe.total_time && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{formatTime(recipe.total_time)}</span>
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center gap-1.5 text-muted-foreground pl-3 border-l border-foreground/10">
                    <span className="text-[10px] font-bold">Serves {recipe.servings}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-24 pb-16">
      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Favorites Section */}
      <section id="cherished-favorites" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="text-center mb-14 flex flex-col items-center gap-4">
          <div className="decorative-badge">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Community Favorites</span>
            <div className="bg-amber-500/10 text-amber-700 px-2 rounded-full text-[10px]">
              {filteredFavs.length}
            </div>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Community Favorites
          </h3>
          <p className="text-muted-foreground font-medium italic mb-2">
            Popular recipes chosen by our community.
          </p>
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={fetchFavorites}
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors bg-primary/5 px-4 py-2 rounded-full border border-primary/10 group shadow-sm"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingFavs ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
              Refresh Tales
            </button>
          </div>
        </div>

        <RecipeGrid
          recipes={filteredFavs}
          loading={isLoadingFavs}
          error={errorFavs}
        />
      </section>

      {/* All Recipes Section */}
      <section id="all-recipes-section" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="text-center mb-14 flex flex-col items-center gap-4">
          <div className="decorative-badge">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Recipe Index</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            All Recipes
          </h3>
          <p className="text-muted-foreground font-medium italic mb-2">
            Discover every recipe in our collection.
          </p>
        </div>

        <RecipeGrid
          recipes={allRecipes}
          loading={isLoadingAll}
          error={errorAll}
          delayBase={4}
        />

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isLoadingAll}
                className="w-12 h-12 rounded-full bg-white border border-foreground/10 hover:bg-secondary disabled:opacity-30 transition-all flex items-center justify-center shadow-sm"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>

              <div className="flex items-center gap-4 px-6 py-3 bg-white/80 rounded-full border border-foreground/10 shadow-sm">
                <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Scroll</span>
                <div className="font-bold text-foreground text-xl">
                  {currentPage} <span className="text-foreground/20 font-medium">/ {totalPages}</span>
                </div>
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || isLoadingAll}
                className="w-12 h-12 rounded-full bg-white border border-foreground/10 hover:bg-secondary disabled:opacity-30 transition-all flex items-center justify-center shadow-sm"
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
            </div>
            <p className="text-[10px] font-black tracking-[0.4em] uppercase text-foreground/20 pt-2 animate-pulse">Turn the Page</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ExistingRecipes;
