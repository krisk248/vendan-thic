# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Server Management
- **Start application**: `npm start` - Runs the Express server on port 3000
- **Development mode**: `npm run dev` - Uses nodemon for auto-restart during development
- **Data sync**: `curl -X POST http://localhost:3000/api/sync -H "Content-Type: application/json" -d '{"type": "all"}'`
- **Health check**: `curl http://localhost:3000/api/health`

### Testing and Quality
- **Tests**: No test framework currently configured (`npm test` shows error)
- **Linting**: Not configured (`npm run lint` shows placeholder)
- **Build**: Tailwind CSS build process to be implemented

## Architecture Overview

### High-Level Structure
This is a Vedantic education web application with a client-server architecture:

- **Frontend**: Vanilla JavaScript with modular classes, **Tailwind CSS** styling (to be migrated from Bootstrap), responsive design
- **Backend**: Express.js server with SQLite database
- **Data**: **Google Sheets CSV integration** (currently local CSV files, to be migrated)
- **Target Users**: Elderly users (60+) learning Vedantic philosophy

### Key Components

#### Frontend Architecture (`assets/js/`)
- **VedanticApp** (`app.js`): Main application controller, handles user management, screen navigation, progress tracking
- **FlashcardManager** (`flashcards.js`): Interactive learning module with flip animations and bookmarking
- **QuizManager** (`quiz.js`): Assessment system with multiple choice questions and scoring
- **AnalyticsManager** (`analytics.js`): Progress tracking, achievements, and statistics
- **ContactManager** (`contact.js`): **[TO BE IMPLEMENTED]** Contact form, suggestions, donation features

#### Backend Architecture (`server/server.js`)
- **Express Server**: RESTful API with CORS support
- **SQLite Database**: Auto-initialized with tables (flashcards, quiz_questions, user_progress, sync_log, contact_submissions)
- **Google Sheets Integration**: **[TO BE IMPLEMENTED]** Fetch CSV data from shared Google Sheets URLs
- **CSV Sync System**: Automatic data synchronization from Google Sheets CSV to database
- **API Endpoints**: Content delivery, progress tracking, admin functions, contact submissions

#### Data Management
- **Content Storage**: **Google Sheets as CSV source** (currently `assets/data/` CSV files)
- **Google Sheets URLs**: To be configured in backend environment variables or config
- **Database Tables**: SQLite with proper relationships and timestamps
- **Progress Persistence**: Local storage + server-side backup
- **Sync Mechanism**: Automatic on startup, manual via API, fetches from Google Sheets

### Styling Architecture (**MIGRATION PLANNED**)
- **Current**: Bootstrap 5 with custom CSS in `vedantic-theme.css`
- **Target**: **Tailwind CSS** with enhanced Vedantic styling
- **Divine Theme Elements**: Sacred geometry, Sanskrit typography, spiritual color palettes
- **Responsive Design**: Mobile-first approach maintained
- **Typography**: Multi-font system (Cinzel, Crimson Text, Noto Sans Devanagari)
- **Accessibility**: High contrast, large fonts, keyboard navigation

## Working with Content

### Current (Local CSV)
1. Edit `assets/data/flashcards.csv` or `assets/data/quiz.csv`
2. Restart server or POST to `/api/sync`

### Planned (Google Sheets CSV)
**BACKEND CONFIGURATION REQUIRED:**
- Environment variables for Google Sheets CSV URLs
- Modify sync functions in `server/server.js` to fetch from URLs instead of local files
- Example URLs format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}`
- Error handling for network requests and CSV parsing from external sources

#### Required Backend Changes for Google Sheets:
```javascript
// Add to server/server.js
const GOOGLE_SHEETS_CONFIG = {
    flashcards_url: process.env.FLASHCARDS_SHEET_URL || 'local_fallback',
    quiz_url: process.env.QUIZ_SHEET_URL || 'local_fallback'
};

// Modify syncFlashcardsFromCSV() to fetch from URL
// Modify syncQuizFromCSV() to fetch from URL  
// Add network retry logic and error handling
```

## API Reference

### Content APIs
- `GET /api/flashcards?category=X&difficulty=Y` - Filtered flashcards
- `GET /api/quiz?category=X&difficulty=Y&limit=N` - Randomized quiz questions
- `GET /api/stats` - Application statistics

### Progress APIs
- `POST /api/progress` - Save user progress (body: `{userName, progressData}`)
- `GET /api/progress/:userName` - Retrieve user progress

### Contact APIs (**TO BE IMPLEMENTED**)
- `POST /api/contact/suggestion` - Submit user suggestions
- `POST /api/contact/donation` - Handle donation inquiries  
- `GET /api/contact/submissions` - Admin view of submissions

### Admin APIs
- `POST /api/sync` - Sync data from Google Sheets CSV
- `GET /api/sync/logs` - View sync operation history

## Planned UI/UX Enhancements

### Divine Landing Page Redesign
**Current**: Simple welcome screen with name input
**Planned**: Enhanced spiritual experience with:
- Sacred geometry animations
- Om symbol with divine animations
- Sanskrit shlokas/mantras
- Gradient backgrounds with spiritual themes
- Lotus/mandala design elements
- Peaceful background sounds/music (optional)
- Enhanced typography with golden ratios

### Contact Us Module (**NEW FEATURE**)
**Components to implement:**
1. **Suggestion Form**: 
   - User feedback and feature requests
   - Category selection (content, technical, general)
   - Rich text area for detailed suggestions
2. **Donation Section**:
   - Information about platform mission
   - Donation amount options
   - Payment gateway integration (future)
   - "Willingness to donate" checkbox/survey
3. **Contact Information**:
   - Platform mission statement
   - Team contact details
   - Social media links (if applicable)

## Development Patterns

### Screen Management
The application uses a screen-based navigation system managed by `VedanticApp.showScreen()`. All screens have CSS class `.screen` and are toggled with `.active`.

**Screens to add:**
- `contact-screen` - New contact us module
- Enhanced `welcome-screen` - Divine landing page

### Data Flow
1. **Google Sheets** → Database (via sync) **[PLANNED]**
2. Database → Frontend (via API)
3. Frontend → Local Storage (progress)
4. Local Storage → Database (backup via API)
5. Contact Form → Database → Email notifications **[PLANNED]**

### Tailwind CSS Migration Plan
1. **Install Tailwind**: Add to package.json and configure build process
2. **Replace Bootstrap**: Remove Bootstrap dependencies
3. **Enhanced Vedantic Classes**: Create custom Tailwind components
4. **Divine Animations**: CSS animations for spiritual elements
5. **Sacred Color Palette**: Extended color scheme in Tailwind config

## Special Considerations

### Google Sheets Integration Requirements
- **Network reliability**: Implement retry logic for sheet fetching
- **Rate limiting**: Respect Google's API limits
- **Caching**: Cache CSV data to reduce external requests
- **Fallback**: Local CSV backup when sheets are unavailable
- **Authentication**: Consider if private sheets need API keys

### Enhanced Vedantic Styling (Tailwind)
- **Sacred Geometry**: CSS Grid/Flexbox patterns
- **Divine Animations**: Subtle, peaceful transitions
- **Spiritual Typography**: Enhanced Sanskrit rendering
- **Color Psychology**: Colors that promote peace and learning
- **Responsive Divinity**: Maintain spiritual aesthetics across devices

### Contact & Donation Features
- **Privacy**: Secure handling of contact information
- **Spam Protection**: reCAPTCHA or similar for forms
- **Email Integration**: Notification system for new submissions
- **Donation Ethics**: Transparent use of funds messaging
- **Accessibility**: Forms usable by elderly users

### Elderly User Focus (Maintained)
- Large touch targets (44px minimum)
- High contrast colors (WCAG AA compliance)  
- Simple navigation patterns
- Readable fonts (18px+ base size)
- **Enhanced**: Divine aesthetics that are still accessible

## Database Schema

**Current Tables:**
```sql
flashcards: id, sanskrit_term, english_term, meaning, category, difficulty, image_url, timestamps
quiz_questions: id, question, options(a-d), correct_answer, explanation, category, difficulty, timestamps  
user_progress: id, user_name, session_data(JSON), last_updated
sync_log: id, sync_type, status, message, sync_date
```

**New Tables (To be added):**
```sql
contact_submissions: id, type(suggestion/donation), name, email, message, category, donation_willing, created_at, status
notification_log: id, submission_id, email_sent, sent_at, status
```

## Migration Priorities

1. **Phase 1**: Google Sheets CSV integration in backend
2. **Phase 2**: Tailwind CSS migration with enhanced Vedantic styling  
3. **Phase 3**: Divine landing page redesign
4. **Phase 4**: Contact Us module with donation features
5. **Phase 5**: Advanced animations and spiritual enhancements