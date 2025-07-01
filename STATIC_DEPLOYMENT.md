# Static Deployment Option

If you want to deploy only the frontend without backend functionality, follow these steps:

## Quick Static Deployment (No Backend)

### Option 1: Netlify Drag & Drop (Easiest)

1. **Create static folder**:
   ```bash
   mkdir adhyatma-static
   cp index.html adhyatma-static/
   cp -r assets adhyatma-static/
   ```

2. **Add sample data to JavaScript** (since no backend):
   
   Create `adhyatma-static/assets/js/sample-data.js`:
   ```javascript
   // Sample flashcards data (replace API calls)
   window.sampleFlashcards = [
     {
       id: 1,
       sanskrit_term: "आत्मन्",
       english_term: "Atman", 
       meaning: "The eternal soul, the true Self...",
       category: "Core Concepts",
       difficulty: "Beginner"
     },
     // Add more from your CSV files...
   ];

   window.sampleQuizQuestions = [
     {
       id: 1,
       question: "What is Moksha?",
       option_a: "Liberation from samsara",
       option_b: "Material wealth", 
       option_c: "Political power",
       option_d: "Fame",
       correct_answer: "A",
       explanation: "Moksha means liberation...",
       category: "Core Concepts",
       difficulty: "Beginner"
     }
     // Add more questions...
   ];
   ```

3. **Update index.html** to include sample data:
   ```html
   <!-- Add before other scripts -->
   <script src="assets/js/sample-data.js"></script>
   ```

4. **Modify API calls** in your JavaScript files to use local data instead of fetch calls

5. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag the `adhyatma-static` folder to deploy
   - Your site will be live instantly!

### Option 2: Vercel Static

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy static folder
cd adhyatma-static
vercel

# Follow prompts
```

### Option 3: GitHub Pages

```bash
# Create gh-pages branch
git checkout -b gh-pages

# Copy static files to root
cp -r adhyatma-static/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# Enable in repo Settings > Pages
```

## Limitations of Static Version

- ❌ No contact form submissions
- ❌ No progress saving to database  
- ❌ No Google Sheets integration
- ❌ No admin features
- ✅ All learning features work with local storage
- ✅ Beautiful UI and animations preserved
- ✅ Fast loading and free hosting

Choose based on your needs:
- **Full features**: Use Railway/Render (with backend)
- **Simple deployment**: Use static version on Netlify