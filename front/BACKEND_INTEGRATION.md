# Backend Integration Guide

This document explains how to connect the React frontend to your Python recipe recommendation backend.

## Frontend-Backend Communication

The frontend sends a POST request to `/recommend` with user ingredients and expects recipe recommendations in return.

---

## API Specification

### Endpoint
```
POST /recommend
```

### Request Format
```json
{
  "ingredients": ["chicken", "garlic", "lemon", "olive oil"]
}
```

### Response Format
```json
{
  "success": true,
  "recommendations": [
    {
      "recipe_name": "Lemon Garlic Chicken",
      "similarity_score": 0.85,
      "prep_time": 15,
      "cook_time": 30,
      "total_time": 45,
      "rating": 4.7,
      "servings": "4 servings",
      "ingredients": ["chicken breast", "garlic cloves", "lemon juice"],
      "missing_ingredients": ["olive oil", "salt", "pepper"],
      "url": "https://example.com/recipe",
      "img_src": "https://example.com/image.jpg"
    }
  ]
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description here"
}
```

---

## Flask Backend Example

Create a new file `app.py`:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load your data and model (from your notebook)
# df_clean = pd.read_csv('cleaned_recipes.csv')
# tfidf = TfidfVectorizer(...)
# ingredient_matrix = tfidf.fit_transform(...)

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        ingredients = data.get('ingredients', [])
        
        if not ingredients:
            return jsonify({
                'success': False,
                'message': 'No ingredients provided'
            }), 400
        
        # Call your recommendation function
        # recommendations = find_recipes_by_ingredients(
        #     ingredients, df_clean, ingredient_matrix, tfidf, top_n=10
        # )
        
        # Format response (example structure)
        formatted_recommendations = []
        for rec in recommendations:
            formatted_recommendations.append({
                'recipe_name': rec['recipe_name'],
                'similarity_score': rec['similarity_score'],
                'prep_time': rec.get('prep_time'),
                'cook_time': rec.get('cook_time'),
                'total_time': rec.get('total_time'),
                'rating': rec.get('rating', 'N/A'),
                'servings': rec.get('servings'),
                'ingredients': rec.get('ingredients', []),
                'missing_ingredients': rec.get('missing_ingredients', []),
                'url': rec.get('url'),
                'img_src': rec.get('img_src')
            })
        
        return jsonify({
            'success': True,
            'recommendations': formatted_recommendations
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### Install Flask Dependencies
```bash
pip install flask flask-cors
```

### Run the Backend
```bash
python app.py
```

The backend will run at `http://localhost:5000`.

---

## FastAPI Backend Alternative

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IngredientsRequest(BaseModel):
    ingredients: List[str]

class Recipe(BaseModel):
    recipe_name: str
    similarity_score: float
    prep_time: Optional[float]
    cook_time: Optional[float]
    total_time: Optional[float]
    rating: Optional[float]
    servings: Optional[str]
    ingredients: List[str]
    missing_ingredients: List[str]
    url: Optional[str]
    img_src: Optional[str]

class RecommendationResponse(BaseModel):
    success: bool
    recommendations: List[Recipe]
    message: Optional[str] = None

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend(request: IngredientsRequest):
    # Your recommendation logic here
    pass
```

### Run FastAPI
```bash
pip install fastapi uvicorn
uvicorn app:app --reload --port 5000
```

---

## Frontend Configuration

### Default API URL
The frontend defaults to `http://localhost:5000`. To change this:

1. Create a `.env` file in the project root:
```
VITE_API_URL=http://your-backend-url:5000
```

2. Or modify `src/hooks/useRecipeRecommendations.ts`:
```typescript
const API_BASE_URL = "http://your-backend-url:5000";
```

---

## Running the Full Stack

### 1. Start the Python Backend
```bash
cd your-backend-folder
python app.py
```

### 2. Start the React Frontend
```bash
# In this project directory
npm run dev
```

### 3. Open in Browser
Navigate to `http://localhost:5173` (or the port shown in terminal).

---

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
- Ensure `flask-cors` is installed and `CORS(app)` is called
- Check that the backend is running on the correct port

### Connection Refused
- Verify the backend is running (`python app.py`)
- Check the port matches (`localhost:5000`)
- Ensure no firewall is blocking the connection

### No Recipes Found
- Verify your recommendation function returns data
- Check the console for any backend errors
- Ensure the response format matches the expected schema

---

## Data Mapping

Based on your notebook, map these fields from your recommendation function:

| Frontend Field | Your Notebook Field |
|---------------|---------------------|
| recipe_name | recipe_name |
| similarity_score | similarity_score |
| prep_time | prep_time |
| cook_time | cook_time |
| rating | rating |
| missing_ingredients | missing_ingredients |
| url | url |
| img_src | img_src |
