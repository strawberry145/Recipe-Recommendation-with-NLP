# Whimsical Pantry — AI Recipe Recommendation System

## Project Overview & Machine Learning Workflow

This project is a Machine Learning-powered Recipe Recommendation System. It aims to solve the common problem: *"What can I cook with the ingredients I currently have in my fridge/pantry?"*

The core of this project is an **Unsupervised Learning** approach, extracting semantic meaning from unstructured ingredient lists and matching user queries to the most relevant recipes. 

### 1. The Dataset
- **Source/Size:** The dataset `recipes.csv` contains **7,155 unique recipes** and 15 variables.
- **Features Used:** `recipe_name`, `ingredients`, `prep_time`, `cook_time`, `directions`, `rating`, `servings`.
- **Target Question:** Recommend the top recipes that best match a user's provided list of ingredients, while allowing filtering by time, dietary restrictions, and minimum ratings.

### 2. Exploratory Data Analysis (EDA) & Data Cleaning
- Missing numerical values in `prep_time` and `cook_time` were imputed.
- Unnecessary columns (URLs, metadata) were dropped.
- The raw `ingredients` text was heavily cleaned using Regular Expressions to strip measurements (e.g., "1/2 cup", "2 tablespoons") and irrelevant punctuation, isolating the core ingredients (e.g., "apples", "cinnamon", "flour").

### 3. Machine Learning Models & Experimentations
During the experimentation phase (see `notebook/draft_experiments.ipynb`), several approaches were tested:
- **Approach 1: CountVectorizer:** This simple Bag-of-Words approach gave too much importance to very common ingredients (like salt, pepper, sugar), skewing the recommendations.
- **Approach 2: K-Means Clustering:** An attempt to group recipes into distinct "families" using clustering. However, the elbow method showed no clear number of clusters, and recipes were too varied for rigid categorizations.
- **Final Approach: TF-IDF Vectorization & Cosine Similarity:** We settled on TF-IDF (Term Frequency - Inverse Document Frequency). This algorithm naturally penalizes overly common words (salt, water) while highlighting unique, defining ingredients (e.g., specific spices, rare meats). User queries are vectorized into the same TF-IDF space, and we calculate the **Cosine Similarity** between the query vector and all 7,155 recipe vectors.

### 4. Results & Conclusion
The TF-IDF and Cosine Similarity pipeline proved highly effective. When a user inputs [apples, cinnamon, sugar, flour], the system successfully identifies recipes like "Apple Crisp" or "Baked Apples" with high similarity scores (> 0.40). 
To make it more robust, the model was augmented with custom Python logic to explicitly list which ingredients the user is missing, and to apply dietary/time filters post-prediction. The combination of NLP and deterministic filtering provides a powerful and practical recommendation engine.

---

## Application Integration (React + FastAPI)

To make this ML model usable, we integrated it into a full-stack application featuring a magical, cozy kitchen UI.

### Project Structure
- `/notebook`: Contains all `.ipynb` notebooks (EDA, Drafts, and Final ML Pipeline).
- `/front`: React + Vite + Tailwind CSS frontend interface.
- `/backend`: FastAPI backend that hosts the TF-IDF model and serves recommendations via a REST API.

### Getting Started

#### Important — Port Conflicts
The backend uses **port 5000**. If you see `Errno 10048 (address already in use)`, the port is occupied by a previous session. Use the startup script below which handles this automatically.

#### Backend Setup
**Option A — Use the startup script (recommended):**
```powershell
# From the root folder, run:
.\start_backend.ps1
```

**Option B — Manual:**
```powershell
# Step 1 — Find and kill any process on port 5000
netstat -ano | findstr :5000
taskkill /F /PID <PID>

# Step 2 — Run the backend
cd backend
pip install -r requirements.txt
python main.py
```
The backend runs at `http://localhost:5000`.

#### Frontend Setup
```bash
cd front
npm install
npm run build
```
Once the frontend is built, the FastAPI backend will automatically serve the React static files. You can access the entire app at `http://localhost:5000`.

## License
MIT
#
