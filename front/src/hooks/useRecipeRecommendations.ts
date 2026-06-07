import { useState } from "react";
import { Recipe } from "@/components/RecipeCard";

// API Configuration - Update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface RecommendationResponse {
  success: boolean;
  recommendations: Recipe[];
  total_count: number;
  total_pages: number;
  page: number;
  message?: string;
}

interface UseRecipeRecommendationsReturn {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  fetchRecommendations: (ingredients: string, filters?: string[], page?: number) => Promise<void>;
  lastIngredients: string;
  lastFilters: string[];
}

export const useRecipeRecommendations = (): UseRecipeRecommendationsReturn => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastIngredients, setLastIngredients] = useState("");
  const [lastFilters, setLastFilters] = useState<string[]>([]);

  /**
   * Parse ingredient string into array
   * Handles comma-separated, newline-separated, or space-separated inputs
   */
  const parseIngredients = (input: string): string[] => {
    return input
      .split(/[,\n]+/)
      .map((ingredient) => ingredient.trim().toLowerCase())
      .filter((ingredient) => ingredient.length > 0);
  };

  /**
   * Fetch recipe recommendations from the backend
   */
  const fetchRecommendations = async (ingredientInput: string, filters: string[] = [], page: number = 1): Promise<void> => {
    // Validate input
    const ingredients = parseIngredients(ingredientInput);

    if (ingredients.length === 0 && filters.length === 0) {
      setError("Please enter at least one ingredient or select a filter.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setCurrentPage(page);
    setLastIngredients(ingredientInput);
    setLastFilters(filters);

    try {
      const response = await fetch(`${API_BASE_URL}/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ ingredients, filters, page, limit: 8, score_threshold: 0.1 }),
      });

      // Handle HTTP errors
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Recipe recommendation endpoint not found. Ensure your backend server is running.");
        }
        if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        }
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: RecommendationResponse = await response.json();

      if (data.success === false) {
        throw new Error(data.message || "Failed to get recommendations.");
      }

      setRecipes(data.recommendations || []);
      setTotalCount(data.total_count || 0);
      setTotalPages(data.total_pages || 0);
    } catch (err) {
      // Handle network errors
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError(
          "Unable to connect to the recipe server. Make sure your Python backend is running at " +
          API_BASE_URL
        );
      } else {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      }
      setRecipes([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recipes,
    isLoading,
    error,
    hasSearched,
    totalCount,
    totalPages,
    currentPage,
    fetchRecommendations,
    lastIngredients,
    lastFilters
  };
};

export default useRecipeRecommendations;
