from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os
from typing import List, Optional
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize data on start
    load_and_initialize_data()
    yield

app = FastAPI(lifespan=lifespan)

# Enable CORS (useful for dev, but less critical in single-port setup)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for data and model
df_clean = None
tfidf = None
ingredient_matrix = None

class RecommendRequest(BaseModel):
    ingredients: List[str]
    filters: Optional[List[str]] = []
    page: int = 1
    limit: int = 8
    score_threshold: float = 0.1

class PaginationRequest(BaseModel):
    page: int = 1
    limit: int = 8

def preprocess_ingredients(ingredients_text):
    """Clean and preprocess ingredients text"""
    if pd.isna(ingredients_text):
        return ""
    
    # Remove measurements and quantities
    ingredients_text = re.sub(r'\d+\s*\w*\s*', '', str(ingredients_text))
    ingredients_text = re.sub(r'[¼½¾]', '', ingredients_text)
    ingredients_text = re.sub(r'[\(\)\[\]]', '', ingredients_text)
    ingredients_text = re.sub(r'\s+', ' ', ingredients_text)
    
    return ingredients_text.lower().strip()

def parse_time_to_minutes(time_str):
    """Parse time string like '1 hrs 35 mins' or '45 mins' to total minutes"""
    if pd.isna(time_str):
        return None
        
    time_str = str(time_str).lower()
    total_minutes = 0
    
    # Extract hours
    hrs_match = re.search(r'(\d+)\s*(?:hr|hrs|hour|hours)', time_str)
    if hrs_match:
        total_minutes += int(hrs_match.group(1)) * 60
        
    # Extract minutes
    mins_match = re.search(r'(\d+)\s*(?:min|mins|minute|minutes)', time_str)
    if mins_match:
        total_minutes += int(mins_match.group(1))
        
    return total_minutes if total_minutes > 0 else None

def extract_ingredient_list(ingredients_text):
    """Extract individual ingredients from text"""
    if pd.isna(ingredients_text):
        return []
    ingredients = []
    for item in str(ingredients_text).split(','):
        item = item.strip()
        if item and len(item) > 2:
            ingredients.append(item)
    return ingredients

def find_missing_ingredients(user_ingredients, recipe_ingredients):
    """Find ingredients needed that user doesn't have"""
    user_ingredients_set = set(g.lower() for g in user_ingredients)
    # Simple matching - could be improved
    missing = []
    for ring in recipe_ingredients:
        found = False
        ring_lower = ring.lower()
        for uing in user_ingredients_set:
            if uing in ring_lower or ring_lower in uing:
                found = True
                break
        if not found:
            missing.append(ring)
    return missing

def load_and_initialize_data():
    global df_clean, tfidf, ingredient_matrix
    
    csv_path = os.path.join(os.path.dirname(__file__), "recipes.csv")
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found")
        return

    # Load and clean data
    data = pd.read_csv(csv_path)
    df_clean = data.copy()
    
    # Parse time columns into numeric minutes
    time_cols = ['prep_time', 'cook_time', 'total_time']
    for col in time_cols:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].apply(parse_time_to_minutes)
            
    # For ratings and servings, still use basic numeric coercion
    numerical_cols = ['servings', 'rating']
    for col in numerical_cols:
        if col in df_clean.columns:
            df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
            
    text_cols = ['ingredients', 'directions', 'yield', 'recipe_name', 'url', 'img_src']
    for col in text_cols:
        if col in df_clean.columns:
            df_clean[col] = df_clean[col].fillna('')

    # Preprocess
    df_clean['cleaned_ingredients'] = df_clean['ingredients'].apply(preprocess_ingredients)
    df_clean['ingredient_list'] = df_clean['cleaned_ingredients'].apply(extract_ingredient_list)

    # Fit TF-IDF
    tfidf = TfidfVectorizer(
        max_features=1000,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=2
    )
    ingredient_matrix = tfidf.fit_transform(df_clean['cleaned_ingredients'])
    print("Backend initialization complete.")

@app.get("/favorites")
async def get_favorites():
    if df_clean is None:
        raise HTTPException(status_code=500, detail="Data not loaded")

    # Filter for high-rated recipes
    high_rated = df_clean[df_clean['rating'] >= 4.5]
    
    # Sample randomly (e.g., 6 recipes)
    sample_size = min(len(high_rated), 6)
    favorites_df = high_rated.sample(n=sample_size)
    
    def get_val(x):
        if pd.isna(x) or x == '' or x is None:
            return None
        # if it's a float that is actually an int (e.g. 60.0), return int
        if isinstance(x, float) and x.is_integer():
            return int(x)
        return x
        
    recommendations = []
    for _, recipe in favorites_df.iterrows():
        recommendations.append({
            'recipe_name': str(recipe['recipe_name']),
            'similarity_score': 1.0, # Placeholder for UI
            'prep_time': get_val(recipe.get('prep_time')),
            'cook_time': get_val(recipe.get('cook_time')),
            'total_time': get_val(recipe.get('total_time')),
            'rating': get_val(recipe.get('rating')),
            'servings': str(recipe.get('servings')) if not pd.isna(recipe.get('servings')) else None,
            'ingredients': extract_ingredient_list(recipe['ingredients']),
            'missing_ingredients': [], # User hasn't searched yet
            'url': str(recipe.get('url')),
            'img_src': str(recipe.get('img_src')),
            'directions': str(recipe.get('directions'))
        })

    return {
        "success": True,
        "recipes": recommendations
    }

@app.get("/recipes")
async def get_recipes(page: int = 1, limit: int = 8):
    if df_clean is None:
        raise HTTPException(status_code=500, detail="Data not loaded")

    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    paginated_df = df_clean.iloc[start_idx:end_idx]
    total_count = len(df_clean)
    
    def get_val(x):
        if pd.isna(x) or x == '' or x is None:
            return None
        if isinstance(x, float) and x.is_integer():
            return int(x)
        return x
        
    recommendations = []
    for _, recipe in paginated_df.iterrows():
        recommendations.append({
            'recipe_name': str(recipe['recipe_name']),
            'similarity_score': 0.0,
            'prep_time': get_val(recipe.get('prep_time')),
            'cook_time': get_val(recipe.get('cook_time')),
            'total_time': get_val(recipe.get('total_time')),
            'rating': get_val(recipe.get('rating')),
            'servings': str(recipe.get('servings')) if not pd.isna(recipe.get('servings')) else None,
            'ingredients': extract_ingredient_list(recipe['ingredients']),
            'missing_ingredients': [],
            'url': str(recipe.get('url')),
            'img_src': str(recipe.get('img_src')),
            'directions': str(recipe.get('directions'))
        })

    return {
        "success": True,
        "recipes": recommendations,
        "total_count": total_count,
        "page": page,
        "limit": limit,
        "total_pages": int(np.ceil(total_count / limit)) if limit > 0 else 0
    }

@app.post("/recommend")
async def recommend(request: RecommendRequest):
    if df_clean is None or tfidf is None:
        raise HTTPException(status_code=500, detail="Model not initialized")

    user_ingredients_text = ', '.join(request.ingredients) if request.ingredients else ""
    user_ingredients_cleaned = preprocess_ingredients(user_ingredients_text)
    
    if user_ingredients_cleaned:
        user_vector = tfidf.transform([user_ingredients_cleaned])
        cosine_similarities = cosine_similarity(user_vector, ingredient_matrix).flatten()
        # Filter indices by threshold
        valid_indices = [idx for idx, score in enumerate(cosine_similarities) if score >= request.score_threshold]
    else:
        # If no ingredients provided, allow all recipes to be filtered
        cosine_similarities = np.zeros(len(df_clean))
        valid_indices = list(range(len(df_clean)))
    
    DIETARY_KEYWORDS = {
        'vegan': {
            'exclude': ['chicken', 'beef', 'pork', 'fish', 'meat', 'egg', 'milk', 'cheese', 'butter', 'cream', 'yogurt', 'honey', 'salmon', 'shrimp', 'bacon', 'prosciutto', 'sausage']
        },
        'dairy-free': {
            'exclude': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey']
        },
        'grain-free': {
            'exclude': ['flour', 'wheat', 'bread', 'pasta', 'rice', 'oat', 'barley', 'rye', 'cornmeal']
        },
        'herbal': {
            'include_any': ['basil', 'cilantro', 'parsley', 'thyme', 'rosemary', 'mint', 'garlic', 'oregano', 'sage', 'chives']
        },
        'wholesome': {
            'exclude': ['sugar', 'syrup', 'fried', 'deep-fried', 'marshmallow', 'candies', 'artificial']
        }
    }

    # Apply dietary filters
    if request.filters:
        filtered_indices = []
        for idx in valid_indices:
            recipe = df_clean.iloc[idx]
            ing_str = str(recipe.get('ingredients', '')).lower()
            recipe_name = str(recipe.get('recipe_name', '')).lower()
            total_time = recipe.get('total_time')
            
            keep = True
            for filter_name in request.filters:
                filter_name = filter_name.lower()
                
                if filter_name == 'quick':
                    time_val = pd.to_numeric(total_time, errors='coerce')
                    if pd.isna(time_val) or time_val > 30:
                        keep = False
                        break
                elif filter_name in DIETARY_KEYWORDS:
                    rules = DIETARY_KEYWORDS[filter_name]
                    if 'exclude' in rules:
                        if any(kw in ing_str or kw in recipe_name for kw in rules['exclude']):
                            keep = False
                            break
                    if 'include_any' in rules:
                        if not any(kw in ing_str or kw in recipe_name for kw in rules['include_any']):
                            keep = False
                            break
            
            if keep:
                filtered_indices.append(idx)
        valid_indices = filtered_indices
    
    # Optimize search by adjusting score based on missing ingredients
    scored_indices = []
    for idx in valid_indices:
        recipe = df_clean.iloc[idx]
        base_score = float(cosine_similarities[idx])
        
        recipe_ingredients = extract_ingredient_list(recipe['ingredients'])
        missing = find_missing_ingredients(request.ingredients, recipe_ingredients)
        
        if request.ingredients:
            # Revert to original vector algorithm (no penalty)
            adjusted_score = base_score
        else:
            # If no ingredients searched, sort by rating
            rating = pd.to_numeric(recipe.get('rating'), errors='coerce')
            rating = rating if not pd.isna(rating) else 3.0
            adjusted_score = rating / 5.0
            
        scored_indices.append((idx, adjusted_score, missing))
    
    # Sort valid indices by adjusted score descending
    sorted_valid_indices = sorted(scored_indices, key=lambda x: x[1], reverse=True)
    
    total_count = len(sorted_valid_indices)
    
    # Paginate
    start_idx = (request.page - 1) * request.limit
    end_idx = start_idx + request.limit
    paginated_items = sorted_valid_indices[start_idx:end_idx]
    
    def get_val(x):
        if pd.isna(x) or x == '' or x is None:
            return None
        if isinstance(x, float) and x.is_integer():
            return int(x)
        return x
        
    recommendations = []
    for idx, adjusted_score, missing in paginated_items:
        recipe = df_clean.iloc[idx]
        
        recommendations.append({
            'recipe_name': str(recipe['recipe_name']),
            'similarity_score': adjusted_score,
            'prep_time': get_val(recipe.get('prep_time')),
            'cook_time': get_val(recipe.get('cook_time')),
            'total_time': get_val(recipe.get('total_time')),
            'rating': get_val(recipe.get('rating')),
            'servings': str(recipe.get('servings')) if not pd.isna(recipe.get('servings')) else None,
            'ingredients': extract_ingredient_list(recipe['ingredients']),
            'missing_ingredients': missing,
            'url': str(recipe.get('url')),
            'img_src': str(recipe.get('img_src')),
            'directions': str(recipe.get('directions'))
        })

    return {
        "success": True,
        "recommendations": recommendations,
        "total_count": total_count,
        "page": request.page,
        "limit": request.limit,
        "total_pages": int(np.ceil(total_count / request.limit)) if request.limit > 0 else 0
    }

# Serve frontend static files
# Note: Ensure you run 'npm run build' in the /front directory first
frontend_path = os.path.join(os.path.dirname(__file__), "..", "front", "dist")

if os.path.exists(frontend_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve index.html for all other routes to support client-side routing
        return FileResponse(os.path.join(frontend_path, "index.html"))
else:
    print(f"Warning: Frontend build folder not found at {frontend_path}. Run 'npm run build' in /front.")

if __name__ == "__main__":
    import uvicorn
    import subprocess
    import signal

    PORT = 5000

    # ── Auto-kill any existing process on PORT before binding ──────────────────
    try:
        # Works on Windows
        result = subprocess.check_output(
            f'netstat -ano | findstr :{PORT}', shell=True
        ).decode()
        for line in result.strip().splitlines():
            parts = line.split()
            if len(parts) >= 5 and "LISTENING" in parts:
                pid = parts[-1]
                print(f"[startup] Killing stale process PID {pid} on port {PORT}...")
                subprocess.call(f"taskkill /F /PID {pid}", shell=True)
    except subprocess.CalledProcessError:
        pass  # No process found on that port — nothing to kill

    import time
    time.sleep(0.5)  # Give OS time to release the port
    # ──────────────────────────────────────────────────────────────────────────

    print(f"[startup] Starting server on port {PORT}...")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
