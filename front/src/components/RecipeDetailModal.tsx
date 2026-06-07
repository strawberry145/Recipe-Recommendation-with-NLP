import {
    Dialog,
    DialogContent,
    DialogHeader,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, CheckCircle2, ListChecks, Star, StarHalf, Sparkles } from "lucide-react";
import { Recipe } from "./RecipeCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecipeDetailModalProps {
    recipe: Recipe | null;
    isOpen: boolean;
    onClose: () => void;
}

const RecipeDetailModal = ({ recipe, isOpen, onClose }: RecipeDetailModalProps) => {
    if (!recipe) return null;

    const formatTime = (minutes: number | null): string => {
        if (!minutes || isNaN(minutes)) return "N/A";
        if (minutes < 60) return `${minutes} min`;
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
                stars.push(<Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
            } else if (i === fullStars && hasHalfStar) {
                stars.push(<StarHalf key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />);
            } else {
                stars.push(<Star key={i} className="w-4 h-4 text-muted-foreground/30" />);
            }
        }
        return stars;
    };

    const directions = recipe.directions || "No directions available.";
    const steps = directions.split(/\d+\.|\n/).filter(step => step.trim().length > 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-deep bg-background parchment-texture">
                <ScrollArea className="max-h-[90vh]">
                    <div className="flex flex-col md:flex-row">
                        {/* Left Side: Illustration / Image Side */}
                        <div className="md:w-2/5 relative min-h-[350px] md:min-h-full bg-gradient-to-br from-primary/10 to-accent/20">
                            {recipe.img_src ? (
                                <img
                                    src={recipe.img_src}
                                    alt={recipe.recipe_name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                    <ChefHat className="w-24 h-24 text-foreground" />
                                </div>
                            )}

                            {/* Overlay for Name */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex items-center gap-0.5">
                                        {renderStars(getRating())}
                                    </div>
                                    <Badge className="bg-white/20 backdrop-blur-md border-none text-white text-[10px] py-1 px-4 font-black">
                                        {getRating().toFixed(1)}
                                    </Badge>
                                </div>
                                <h2 className="text-3xl font-bold leading-tight tracking-tight mb-2">
                                    {recipe.recipe_name}
                                </h2>
                                <div className="w-20 h-1.5 bg-primary rounded-full" />
                            </div>
                        </div>

                        {/* Right Side: Content */}
                        <div className="md:w-3/5 p-8 md:p-12 flex flex-col gap-10 bg-white/40 backdrop-blur-sm">
                            <DialogHeader>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-foreground/5 shadow-sm">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest">{formatTime(recipe.total_time)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-foreground/5 shadow-sm">
                                        <Users className="w-4 h-4 text-accent" />
                                        <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest">Serves {recipe.servings || "N/A"}</span>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-10">
                                {/* Ingredients Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-foreground/70 font-bold mb-2">
                                        <ListChecks className="w-6 h-6 text-primary" />
                                        <h3 className="text-xl">Secret Ingredients</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {recipe.ingredients.map((ing, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-foreground/5 shadow-sm transition-all hover:bg-secondary/20 hover:translate-x-1">
                                                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                                <span className="text-sm font-medium text-foreground/70 leading-snug">{ing}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Instructions Section */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-3 text-foreground/70 font-bold mb-2">
                                        <ChefHat className="w-6 h-6 text-accent" />
                                        <h3 className="text-xl">Culinary Magic</h3>
                                    </div>
                                    <div className="space-y-6">
                                        {steps.length > 1 ? (
                                            steps.map((step, i) => (
                                                <div key={i} className="flex gap-5 group">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0 border border-primary/20 shadow-sm transition-colors group-hover:bg-primary group-hover:text-white">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-sm text-foreground/60 leading-[1.8] pt-1 font-medium">{step.trim()}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 rounded-[2rem] bg-secondary/10 border-2 border-dashed border-foreground/5 italic text-foreground/50 leading-relaxed text-sm text-center">
                                                {directions}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* Closing / Footer of Modal */}
                            <div className="flex justify-center pt-8 border-t border-foreground/5">
                                <div className="flex items-center gap-2 opacity-20">
                                    <div className="w-8 h-px bg-foreground" />
                                    <Sparkles className="w-4 h-4" />
                                    <div className="w-8 h-px bg-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default RecipeDetailModal;
