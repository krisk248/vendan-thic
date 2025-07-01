const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const https = require('https');
const http = require('http');
const { Readable } = require('stream');
const { fileURLToPath } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// Google Sheets CSV Configuration
// Set these environment variables with your Google Sheets CSV export URLs
const GOOGLE_SHEETS_CONFIG = {
    flashcards_url: process.env.FLASHCARDS_SHEET_URL || null,
    quiz_url: process.env.QUIZ_SHEET_URL || null,
    // Enable Google Sheets integration when URLs are provided
    enabled: !!(process.env.FLASHCARDS_SHEET_URL && process.env.QUIZ_SHEET_URL)
};

// Retry configuration for network requests
const RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 1000, // milliseconds
    timeout: 30000    // 30 seconds
};

console.log('🔗 Google Sheets Integration:', GOOGLE_SHEETS_CONFIG.enabled ? 'ENABLED' : 'DISABLED (using local CSV)');
if (GOOGLE_SHEETS_CONFIG.enabled) {
    console.log('📊 Flashcards URL configured:', !!GOOGLE_SHEETS_CONFIG.flashcards_url);
    console.log('❓ Quiz URL configured:', !!GOOGLE_SHEETS_CONFIG.quiz_url);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Database setup
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
    // Flashcards table
    db.run(`CREATE TABLE IF NOT EXISTS flashcards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sanskrit_term TEXT NOT NULL,
        english_term TEXT NOT NULL,
        meaning TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Quiz questions table
    db.run(`CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        explanation TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // User progress table
    db.run(`CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_name TEXT NOT NULL,
        session_data TEXT NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Data sync log table
    db.run(`CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sync_type TEXT NOT NULL,
        status TEXT NOT NULL,
        message TEXT,
        sync_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Contact submissions table (for future contact us module)
    db.run(`CREATE TABLE IF NOT EXISTS contact_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK (type IN ('suggestion', 'donation', 'general')),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        category TEXT,
        donation_willing BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending'
    )`);

    console.log('Database tables initialized');
});

// Routes

// Home route - serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// API Routes

// Get all flashcards
app.get('/api/flashcards', (req, res) => {
    const { category, difficulty } = req.query;
    let query = 'SELECT * FROM flashcards';
    const params = [];

    if (category || difficulty) {
        query += ' WHERE';
        const conditions = [];
        
        if (category) {
            conditions.push(' category = ?');
            params.push(category);
        }
        
        if (difficulty) {
            conditions.push(' difficulty = ?');
            params.push(difficulty);
        }
        
        query += conditions.join(' AND');
    }

    query += ' ORDER BY category, difficulty, id';

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching flashcards:', err);
            res.status(500).json({ error: 'Failed to fetch flashcards' });
            return;
        }
        res.json(rows);
    });
});

// Get flashcard by ID
app.get('/api/flashcards/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM flashcards WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching flashcard:', err);
            res.status(500).json({ error: 'Failed to fetch flashcard' });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: 'Flashcard not found' });
            return;
        }
        
        res.json(row);
    });
});

// Get all quiz questions
app.get('/api/quiz', (req, res) => {
    const { category, difficulty, limit } = req.query;
    let query = 'SELECT * FROM quiz_questions';
    const params = [];

    if (category || difficulty) {
        query += ' WHERE';
        const conditions = [];
        
        if (category) {
            conditions.push(' category = ?');
            params.push(category);
        }
        
        if (difficulty) {
            conditions.push(' difficulty = ?');
            params.push(difficulty);
        }
        
        query += conditions.join(' AND');
    }

    query += ' ORDER BY RANDOM()';

    if (limit) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching quiz questions:', err);
            res.status(500).json({ error: 'Failed to fetch quiz questions' });
            return;
        }
        res.json(rows);
    });
});

// Save user progress
app.post('/api/progress', (req, res) => {
    const { userName, progressData } = req.body;
    
    if (!userName || !progressData) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    const sessionDataJson = JSON.stringify(progressData);
    
    db.run(
        'INSERT OR REPLACE INTO user_progress (user_name, session_data, last_updated) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [userName, sessionDataJson],
        function(err) {
            if (err) {
                console.error('Error saving progress:', err);
                res.status(500).json({ error: 'Failed to save progress' });
                return;
            }
            
            res.json({ 
                success: true, 
                message: 'Progress saved successfully',
                id: this.lastID 
            });
        }
    );
});

// Get user progress
app.get('/api/progress/:userName', (req, res) => {
    const { userName } = req.params;
    
    db.get(
        'SELECT * FROM user_progress WHERE user_name = ? ORDER BY last_updated DESC LIMIT 1',
        [userName],
        (err, row) => {
            if (err) {
                console.error('Error fetching progress:', err);
                res.status(500).json({ error: 'Failed to fetch progress' });
                return;
            }
            
            if (!row) {
                res.status(404).json({ error: 'Progress not found' });
                return;
            }
            
            try {
                const progressData = JSON.parse(row.session_data);
                res.json({
                    userName: row.user_name,
                    progress: progressData,
                    lastUpdated: row.last_updated
                });
            } catch (parseErr) {
                console.error('Error parsing progress data:', parseErr);
                res.status(500).json({ error: 'Invalid progress data format' });
            }
        }
    );
});

// Get statistics
app.get('/api/stats', (req, res) => {
    const stats = {};
    
    // Get flashcard count
    db.get('SELECT COUNT(*) as count FROM flashcards', (err, flashcardCount) => {
        if (err) {
            console.error('Error getting flashcard count:', err);
            res.status(500).json({ error: 'Failed to fetch statistics' });
            return;
        }
        
        stats.totalFlashcards = flashcardCount.count;
        
        // Get quiz question count
        db.get('SELECT COUNT(*) as count FROM quiz_questions', (err, quizCount) => {
            if (err) {
                console.error('Error getting quiz count:', err);
                res.status(500).json({ error: 'Failed to fetch statistics' });
                return;
            }
            
            stats.totalQuizQuestions = quizCount.count;
            
            // Get user count
            db.get('SELECT COUNT(DISTINCT user_name) as count FROM user_progress', (err, userCount) => {
                if (err) {
                    console.error('Error getting user count:', err);
                    res.status(500).json({ error: 'Failed to fetch statistics' });
                    return;
                }
                
                stats.totalUsers = userCount.count;
                
                // Get category breakdown
                db.all('SELECT category, COUNT(*) as count FROM flashcards GROUP BY category', (err, categories) => {
                    if (err) {
                        console.error('Error getting categories:', err);
                        res.status(500).json({ error: 'Failed to fetch statistics' });
                        return;
                    }
                    
                    stats.categoriesBreakdown = categories.reduce((acc, cat) => {
                        acc[cat.category] = cat.count;
                        return acc;
                    }, {});
                    
                    res.json(stats);
                });
            });
        });
    });
});

// Data sync endpoint
app.post('/api/sync', (req, res) => {
    const { type } = req.body;
    
    if (type === 'flashcards') {
        syncFlashcardsFromCSV(res);
    } else if (type === 'quiz') {
        syncQuizFromCSV(res);
    } else if (type === 'all') {
        syncAllData(res);
    } else {
        res.status(400).json({ error: 'Invalid sync type' });
    }
});

// Utility function to fetch CSV data from URL with retry logic
async function fetchCSVFromURL(url, retries = RETRY_CONFIG.maxRetries) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const timeout = setTimeout(() => {
            reject(new Error(`Request timeout after ${RETRY_CONFIG.timeout}ms`));
        }, RETRY_CONFIG.timeout);

        protocol.get(url, (response) => {
            clearTimeout(timeout);
            
            if (response.statusCode === 200) {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => resolve(data));
            } else {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
            }
        }).on('error', (err) => {
            clearTimeout(timeout);
            if (retries > 0) {
                console.log(`🔄 Retrying CSV fetch (${retries} attempts left)...`);
                setTimeout(() => {
                    fetchCSVFromURL(url, retries - 1).then(resolve).catch(reject);
                }, RETRY_CONFIG.retryDelay);
            } else {
                reject(err);
            }
        });
    });
}

// Parse CSV data from string
function parseCSVData(csvText) {
    return new Promise((resolve, reject) => {
        const results = [];
        const stream = Readable.from([csvText]);
        
        stream
            .pipe(csv())
            .on('data', (row) => {
                results.push(row);
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (err) => {
                reject(err);
            });
    });
}

// Enhanced sync function with Google Sheets support
async function syncFlashcardsFromCSV(res) {
    try {
        let csvData;
        let source = 'local';
        
        // Try Google Sheets first if configured
        if (GOOGLE_SHEETS_CONFIG.enabled && GOOGLE_SHEETS_CONFIG.flashcards_url) {
            try {
                console.log('📁 Fetching flashcards from Google Sheets...');
                csvData = await fetchCSVFromURL(GOOGLE_SHEETS_CONFIG.flashcards_url);
                source = 'google_sheets';
                console.log('✅ Successfully fetched flashcards from Google Sheets');
            } catch (err) {
                console.error('⚠️ Google Sheets fetch failed:', err.message);
                console.log('📝 Falling back to local CSV file...');
                // Fall back to local file
            }
        }
        
        // Fallback to local file if Google Sheets failed or not configured
        if (!csvData) {
            const csvPath = path.join(__dirname, '..', 'assets', 'data', 'flashcards.csv');
            
            if (!fs.existsSync(csvPath)) {
                const error = 'Flashcards CSV file not found (local fallback)';
                if (res) res.status(404).json({ error });
                return;
            }
            
            csvData = fs.readFileSync(csvPath, 'utf8');
            source = 'local_file';
        }
        
        // Parse CSV data
        const flashcards = await parseCSVData(csvData);
        
        // Clear existing data and insert new data
        db.run('DELETE FROM flashcards', (err) => {
            if (err) {
                console.error('Error clearing flashcards:', err);
                if (res) res.status(500).json({ error: 'Failed to clear existing flashcards' });
                return;
            }
            
            const stmt = db.prepare(`
                INSERT INTO flashcards (sanskrit_term, english_term, meaning, category, difficulty, image_url)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            
            let processed = 0;
            let errors = 0;
            
            flashcards.forEach((card) => {
                stmt.run([
                    card.sanskrit_term || '',
                    card.english_term || '',
                    card.meaning || '',
                    card.category || '',
                    card.difficulty || '',
                    card.image_url || ''
                ], (err) => {
                    if (err) {
                        console.error('Error inserting flashcard:', err);
                        errors++;
                    }
                    processed++;
                    
                    if (processed === flashcards.length) {
                        stmt.finalize();
                        const message = `[${source.toUpperCase()}] Processed ${processed} flashcards, ${errors} errors`;
                        logSync('flashcards', errors === 0 ? 'success' : 'partial', message);
                        
                        if (res) {
                            res.json({
                                success: true,
                                message: `Synced ${processed - errors} flashcards successfully from ${source}`,
                                source: source,
                                errors: errors
                            });
                        }
                    }
                });
            });
        });
        
    } catch (error) {
        console.error('Error in syncFlashcardsFromCSV:', error);
        logSync('flashcards', 'error', error.message);
        if (res) {
            res.status(500).json({ error: 'Failed to sync flashcards: ' + error.message });
        }
    }
}

async function syncQuizFromCSV(res) {
    try {
        let csvData;
        let source = 'local';
        
        // Try Google Sheets first if configured
        if (GOOGLE_SHEETS_CONFIG.enabled && GOOGLE_SHEETS_CONFIG.quiz_url) {
            try {
                console.log('❓ Fetching quiz questions from Google Sheets...');
                csvData = await fetchCSVFromURL(GOOGLE_SHEETS_CONFIG.quiz_url);
                source = 'google_sheets';
                console.log('✅ Successfully fetched quiz questions from Google Sheets');
            } catch (err) {
                console.error('⚠️ Google Sheets fetch failed:', err.message);
                console.log('📝 Falling back to local CSV file...');
                // Fall back to local file
            }
        }
        
        // Fallback to local file if Google Sheets failed or not configured
        if (!csvData) {
            const csvPath = path.join(__dirname, '..', 'assets', 'data', 'quiz.csv');
            
            if (!fs.existsSync(csvPath)) {
                const error = 'Quiz CSV file not found (local fallback)';
                if (res) res.status(404).json({ error });
                return;
            }
            
            csvData = fs.readFileSync(csvPath, 'utf8');
            source = 'local_file';
        }
        
        // Parse CSV data
        const questions = await parseCSVData(csvData);
        
        // Clear existing data and insert new data
        db.run('DELETE FROM quiz_questions', (err) => {
            if (err) {
                console.error('Error clearing quiz questions:', err);
                if (res) res.status(500).json({ error: 'Failed to clear existing quiz questions' });
                return;
            }
            
            const stmt = db.prepare(`
                INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, explanation, category, difficulty)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            let processed = 0;
            let errors = 0;
            
            questions.forEach((q) => {
                stmt.run([
                    q.question || '',
                    q.option_a || '',
                    q.option_b || '',
                    q.option_c || '',
                    q.option_d || '',
                    q.correct_answer || '',
                    q.explanation || '',
                    q.category || '',
                    q.difficulty || ''
                ], (err) => {
                    if (err) {
                        console.error('Error inserting quiz question:', err);
                        errors++;
                    }
                    processed++;
                    
                    if (processed === questions.length) {
                        stmt.finalize();
                        const message = `[${source.toUpperCase()}] Processed ${processed} questions, ${errors} errors`;
                        logSync('quiz', errors === 0 ? 'success' : 'partial', message);
                        
                        if (res) {
                            res.json({
                                success: true,
                                message: `Synced ${processed - errors} quiz questions successfully from ${source}`,
                                source: source,
                                errors: errors
                            });
                        }
                    }
                });
            });
        });
        
    } catch (error) {
        console.error('Error in syncQuizFromCSV:', error);
        logSync('quiz', 'error', error.message);
        if (res) {
            res.status(500).json({ error: 'Failed to sync quiz questions: ' + error.message });
        }
    }
}

async function syncAllData(res) {
    try {
        console.log('🔄 Starting complete data sync...');
        await syncFlashcardsFromCSV();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between syncs
        await syncQuizFromCSV();
        
        if (res) {
            res.json({
                success: true,
                message: 'All data synced successfully',
                timestamp: new Date().toISOString()
            });
        }
        console.log('✅ Complete data sync finished');
    } catch (error) {
        console.error('Error in syncAllData:', error);
        if (res) {
            res.status(500).json({ error: 'Failed to sync all data: ' + error.message });
        }
    }
}

function logSync(type, status, message) {
    db.run(
        'INSERT INTO sync_log (sync_type, status, message) VALUES (?, ?, ?)',
        [type, status, message],
        (err) => {
            if (err) {
                console.error('Error logging sync:', err);
            }
        }
    );
}

// Get sync logs
app.get('/api/sync/logs', (req, res) => {
    db.all(
        'SELECT * FROM sync_log ORDER BY sync_date DESC LIMIT 50',
        (err, rows) => {
            if (err) {
                console.error('Error fetching sync logs:', err);
                res.status(500).json({ error: 'Failed to fetch sync logs' });
                return;
            }
            res.json(rows);
        }
    );
});

// Contact APIs

// Submit contact form / suggestion
app.post('/api/contact/suggestion', (req, res) => {
    const { name, email, category, message, donation_willing } = req.body;
    
    if (!name || !email || !message) {
        res.status(400).json({ error: 'Missing required fields (name, email, message)' });
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' });
        return;
    }
    
    db.run(
        `INSERT INTO contact_submissions (type, name, email, message, category, donation_willing) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['suggestion', name, email, message, category || 'general', donation_willing ? 1 : 0],
        function(err) {
            if (err) {
                console.error('Error saving contact submission:', err);
                res.status(500).json({ error: 'Failed to save submission' });
                return;
            }
            
            console.log(`📧 New contact submission from ${name} (${email})`);
            console.log(`   Category: ${category || 'general'}`);
            console.log(`   Donation willing: ${donation_willing ? 'Yes' : 'No'}`);
            
            res.json({ 
                success: true, 
                message: 'Submission received successfully',
                id: this.lastID 
            });
        }
    );
});

// Handle donation inquiries
app.post('/api/contact/donation', (req, res) => {
    const { name, email, message, amount, donation_type } = req.body;
    
    if (!name || !email) {
        res.status(400).json({ error: 'Missing required fields (name, email)' });
        return;
    }
    
    const donationMessage = `Donation Inquiry - Amount: ${amount || 'Not specified'}, Type: ${donation_type || 'General'}\n\nMessage: ${message || 'No additional message'}`;
    
    db.run(
        `INSERT INTO contact_submissions (type, name, email, message, category, donation_willing) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['donation', name, email, donationMessage, 'donation', 1],
        function(err) {
            if (err) {
                console.error('Error saving donation inquiry:', err);
                res.status(500).json({ error: 'Failed to save donation inquiry' });
                return;
            }
            
            console.log(`💰 New donation inquiry from ${name} (${email})`);
            console.log(`   Amount: ${amount || 'Not specified'}`);
            
            res.json({ 
                success: true, 
                message: 'Donation inquiry received successfully',
                id: this.lastID 
            });
        }
    );
});

// Get all contact submissions (admin endpoint)
app.get('/api/contact/submissions', (req, res) => {
    const { type, status, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM contact_submissions';
    const params = [];
    const conditions = [];
    
    if (type) {
        conditions.push('type = ?');
        params.push(type);
    }
    
    if (status) {
        conditions.push('status = ?');
        params.push(status);
    }
    
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching contact submissions:', err);
            res.status(500).json({ error: 'Failed to fetch submissions' });
            return;
        }
        res.json(rows);
    });
});

// Update submission status (admin endpoint)
app.put('/api/contact/submissions/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'reviewed', 'responded', 'archived'].includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be: pending, reviewed, responded, or archived' });
        return;
    }
    
    db.run(
        'UPDATE contact_submissions SET status = ? WHERE id = ?',
        [status, id],
        function(err) {
            if (err) {
                console.error('Error updating submission status:', err);
                res.status(500).json({ error: 'Failed to update status' });
                return;
            }
            
            if (this.changes === 0) {
                res.status(404).json({ error: 'Submission not found' });
                return;
            }
            
            res.json({ success: true, message: 'Status updated successfully' });
        }
    );
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        features: {
            google_sheets: GOOGLE_SHEETS_CONFIG.enabled,
            contact_forms: true,
            donations: true
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🕉️  Vedantic App Server running on port ${PORT}`);
    console.log(`📚 Access the app at: http://localhost:${PORT}`);
    
    // Initial data sync
    console.log('🔄 Performing initial data sync...');
    syncAllData().then(() => {
        console.log('✅ Initial data sync completed');
    }).catch((error) => {
        console.error('❌ Initial data sync failed:', error);
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🙏 Shutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

module.exports = app;