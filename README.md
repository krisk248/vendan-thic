# Adhyatma Vidya (आत्म-ज्ञान की यात्रा)

A responsive web application for learning Vedantic concepts through interactive flashcards, assessments, and progress tracking.

## 🎯 Overview

Adhyatma Vidya is designed specifically for elderly users (60+ years) interested in Vedantic philosophy. It provides a simple, accessible, and engaging way to learn Sanskrit terms, concepts, and principles through:

- **Adhyayana (अध्ययन)** - Interactive flashcard learning
- **Pariksha (परीक्षा)** - Guided assessments and quizzes  
- **Pragati (प्रगति)** - Progress tracking and analytics

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Clone or download the project**
   ```bash
   cd phase2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   ```bash
   npm start
   ```

4. **Access the app**
   Open your browser and go to: `http://localhost:3000`

### Development Mode

For development with auto-reload:
```bash
npm run dev
```

## 📁 Project Structure

```
phase2/
├── index.html              # Main application file
├── assets/
│   ├── css/
│   │   ├── vedantic-theme.css    # Sacred Saffron theme
│   │   └── main.css             # Application styles
│   ├── js/
│   │   ├── app.js              # Main application controller
│   │   ├── flashcards.js       # Flashcard learning module
│   │   ├── quiz.js             # Quiz assessment module
│   │   └── analytics.js        # Progress analytics module
│   └── data/
│       ├── flashcards.csv      # Flashcard content
│       └── quiz.csv            # Quiz questions
├── server/
│   ├── server.js              # Express server
│   └── database.db            # SQLite database (auto-created)
├── package.json
└── README.md
```

## 🎨 Features

### Learning Module (Adhyayana)
- Interactive flashcards with Sanskrit terms
- Flip animations to reveal meanings
- Category and difficulty filtering
- Bookmark favorite cards
- Shuffle and navigation controls
- Progress tracking

### Assessment Module (Pariksha)
- Multiple choice quizzes
- Immediate feedback with explanations
- Category-based or mixed quizzes
- Score tracking and history
- Encouraging Sanskrit quotes

### Analytics Module (Pragati)
- Learning session tracking
- Quiz score analytics
- Learning streak monitoring
- Category-wise performance
- Achievement badges
- Sanskrit-named milestones

## 🎨 Design Theme - "Sacred Saffron"

### Color Palette
- **Primary**: #FF9933 (Saffron)
- **Secondary**: #FFD700 (Gold)
- **Background**: #FFF5E6 (Cream)
- **Text**: #654321 (Dark Brown)
- **Accent**: #8B4513 (Brown)

### Typography
- **Headings**: 'Cinzel' serif (Sanskrit elegance)
- **Body**: 'Crimson Text' serif (readability)
- **Sanskrit**: 'Noto Sans Devanagari' (authentic script)

## 📊 Data Management

### CSV Data Structure

**Flashcards (flashcards.csv)**:
```csv
id,sanskrit_term,english_term,meaning,category,difficulty,image_url
1,आत्मन्,Atman,"The eternal soul...",Core Concepts,Beginner,
```

**Quiz (quiz.csv)**:
```csv
id,question,option_a,option_b,option_c,option_d,correct_answer,explanation,category,difficulty
1,"What is Moksha?","Liberation","Wealth","Power","Fame",A,"Moksha means...",Core Concepts,Beginner
```

### Database Tables
- `flashcards` - Stores flashcard content
- `quiz_questions` - Stores quiz questions
- `user_progress` - Tracks user learning data
- `sync_log` - Logs data synchronization

## 🔧 API Endpoints

### Content APIs
- `GET /api/flashcards` - Get flashcards (with optional filters)
- `GET /api/flashcards/:id` - Get specific flashcard
- `GET /api/quiz` - Get quiz questions (with optional filters)

### Progress APIs
- `POST /api/progress` - Save user progress
- `GET /api/progress/:userName` - Get user progress

### Admin APIs
- `GET /api/stats` - Get application statistics
- `POST /api/sync` - Sync data from CSV files
- `GET /api/sync/logs` - Get sync operation logs
- `GET /api/health` - Health check

## 🎯 User Experience

### Accessibility Features
- Large fonts (18px base, 20px for elderly)
- High contrast colors (WCAG AA compliant)
- Minimum 44px touch targets
- Simple 3-level navigation
- Keyboard navigation support
- Screen reader compatibility

### Mobile-First Design
- Responsive breakpoints:
  - Mobile: 320px - 768px (primary)
  - Tablet: 768px - 1024px
  - Desktop: 1024px+ (secondary)

### Offline Capability (Phase 3)
- Service worker for offline functionality
- Local data caching
- Background sync capabilities

## 🏆 Achievement System

Sanskrit-named achievements:
- **Pratham Siddhi** (प्रथम सिद्धि) - First Quiz Completed
- **Adhyayana Premi** (अध्ययन प्रेमी) - 25 Concepts Learned
- **Sapta Dina** (सप्त दिन) - 7 Day Streak
- **Sadhana Yukta** (साधना युक्त) - 30 Day Streak
- **Purna Gyana** (पूर्ण ज्ञान) - Perfect Quiz Score
- **Gyani** (ज्ञानी) - 100 Concepts Mastered

## 🛠️ Development

### Data Sync
Update CSV files and run:
```bash
curl -X POST http://localhost:3000/api/sync -H "Content-Type: application/json" -d '{"type": "all"}'
```

### Adding Content
1. Edit `assets/data/flashcards.csv` or `assets/data/quiz.csv`
2. Restart server or use sync API
3. Content automatically loads into database

### Customization
- Modify color scheme in `assets/css/vedantic-theme.css`
- Update Sanskrit terms and meanings in CSV files
- Add new achievement conditions in `analytics.js`

## 📈 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure proper port (default: 3000)
3. Ensure SQLite database permissions
4. Set up SSL for PWA features (Phase 3)

### Hosting Requirements
- Node.js hosting support
- 50MB storage for app + 10MB for data
- Minimal bandwidth (text-based content)

## 🔄 Maintenance

### Weekly Routine
1. **Saturday**: Update CSV files with new content  
2. **Sunday**: Run data sync
3. **Monthly**: Backup user progress data
4. **Quarterly**: Performance audit

## 🤝 Contributing

1. Follow existing code style and patterns
2. Test on mobile devices (primary target)
3. Ensure accessibility compliance
4. Use Sanskrit naming for spiritual concepts
5. Maintain simplicity for elderly users

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Support

For issues and feedback:
- Create issue in repository
- Ensure mobile compatibility
- Include browser and device information

---

**Om Shanti Shanti Shanti** 🕉️

*May this application serve the noble purpose of spreading Vedantic wisdom and supporting spiritual growth.*