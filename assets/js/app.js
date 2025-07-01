// Main Application Controller
class VedanticApp {
    constructor() {
        this.currentUser = null;
        this.userProgress = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.initializeScreens();
    }

    // User Management
    loadUserData() {
        const savedUser = localStorage.getItem('vedantic_user');
        const savedProgress = localStorage.getItem('vedantic_progress');
        
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.userProgress = savedProgress ? JSON.parse(savedProgress) : this.createDefaultProgress();
            this.showScreen('main-screen');
            this.updateUserDisplay();
        } else {
            this.showScreen('welcome-screen');
        }
    }

    createDefaultProgress() {
        return {
            name: this.currentUser?.name || '',
            totalSessions: 0,
            quizScores: [],
            conceptsLearned: [],
            lastLoginDate: new Date().toISOString(),
            streak: 0,
            timeSpent: 0,
            bookmarkedCards: [],
            categoryProgress: {
                'Core Concepts': { correct: 0, total: 0 },
                'Ethics': { correct: 0, total: 0 },
                'Practices': { correct: 0, total: 0 }
            }
        };
    }

    startJourney() {
        const nameInput = document.getElementById('user-name');
        const name = nameInput.value.trim();
        
        if (!name) {
            this.showMessage('Please enter your name to continue, dear seeker.');
            nameInput.focus();
            return;
        }

        this.currentUser = { name };
        this.userProgress = this.createDefaultProgress();
        this.userProgress.name = name;
        
        this.saveUserData();
        this.updateUserDisplay();
        this.showScreen('main-screen');
        this.showMessage(`Namaskar ${name}! Your journey of Vedantic wisdom begins. 🕉️`);
    }

    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('vedantic_user', JSON.stringify(this.currentUser));
        }
        if (this.userProgress) {
            this.userProgress.lastLoginDate = new Date().toISOString();
            localStorage.setItem('vedantic_progress', JSON.stringify(this.userProgress));
        }
    }

    updateUserDisplay() {
        const displayName = document.getElementById('display-name');
        if (displayName && this.currentUser) {
            displayName.textContent = this.currentUser.name;
        }
    }

    // Screen Management
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            targetScreen.classList.add('fade-in');
            
            // Initialize screen-specific functionality
            this.initializeScreen(screenId);
        }
    }

    initializeScreen(screenId) {
        switch(screenId) {
            case 'learning-screen':
                if (window.flashcardManager) {
                    window.flashcardManager.init();
                }
                break;
            case 'quiz-screen':
                if (window.quizManager) {
                    window.quizManager.init();
                }
                break;
            case 'analytics-screen':
                if (window.analyticsManager) {
                    window.analyticsManager.init();
                }
                break;
        }
    }

    initializeScreens() {
        // Set up welcome screen
        this.setupWelcomeScreen();
    }

    setupWelcomeScreen() {
        const nameInput = document.getElementById('user-name');
        const startButton = document.getElementById('start-journey');
        
        if (nameInput && startButton) {
            // Enter key handler
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.startJourney();
                }
            });
            
            // Start button handler
            startButton.addEventListener('click', () => {
                this.startJourney();
            });
        }
    }

    setupEventListeners() {
        // Global event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.init();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveUserData();
        });

        // Visibility change for session tracking
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveUserData();
            } else {
                this.updateStreak();
            }
        });
    }

    handleKeyboardNavigation(e) {
        // Escape key to go back
        if (e.key === 'Escape') {
            const currentScreen = document.querySelector('.screen.active');
            if (currentScreen && currentScreen.id !== 'welcome-screen' && currentScreen.id !== 'main-screen') {
                this.showScreen('main-screen');
            }
        }
        
        // Arrow keys for navigation in learning mode
        if (currentScreen && currentScreen.id === 'learning-screen') {
            if (e.key === 'ArrowLeft' && window.flashcardManager) {
                window.flashcardManager.previousCard();
            } else if (e.key === 'ArrowRight' && window.flashcardManager) {
                window.flashcardManager.nextCard();
            } else if (e.key === ' ' && window.flashcardManager) {
                e.preventDefault();
                window.flashcardManager.flipCard();
            }
        }
    }

    // Progress Management
    updateProgress(activity, data = {}) {
        if (!this.userProgress) return;

        switch(activity) {
            case 'session_start':
                this.userProgress.totalSessions++;
                break;
            case 'quiz_completed':
                this.userProgress.quizScores.push({
                    score: data.score,
                    total: data.total,
                    category: data.category,
                    date: new Date().toISOString()
                });
                this.updateCategoryProgress(data.category, data.correct, data.total);
                break;
            case 'concept_learned':
                if (!this.userProgress.conceptsLearned.includes(data.conceptId)) {
                    this.userProgress.conceptsLearned.push(data.conceptId);
                }
                break;
            case 'bookmark_card':
                if (!this.userProgress.bookmarkedCards.includes(data.cardId)) {
                    this.userProgress.bookmarkedCards.push(data.cardId);
                }
                break;
            case 'time_spent':
                this.userProgress.timeSpent += data.minutes || 0;
                break;
        }

        this.saveUserData();
    }

    updateCategoryProgress(category, correct, total) {
        if (!this.userProgress.categoryProgress[category]) {
            this.userProgress.categoryProgress[category] = { correct: 0, total: 0 };
        }
        
        this.userProgress.categoryProgress[category].correct += correct;
        this.userProgress.categoryProgress[category].total += total;
    }

    updateStreak() {
        if (!this.userProgress) return;

        const today = new Date().toDateString();
        const lastLogin = new Date(this.userProgress.lastLoginDate).toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLogin === today) {
            // Same day, no change
            return;
        } else if (lastLogin === yesterday.toDateString()) {
            // Consecutive day
            this.userProgress.streak++;
        } else {
            // Streak broken
            this.userProgress.streak = 1;
        }
        
        this.saveUserData();
    }

    // Utility Methods
    showMessage(message, type = 'info') {
        // Create or update message display
        let messageDiv = document.getElementById('app-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'app-message';
            messageDiv.className = 'alert alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
            messageDiv.style.zIndex = '9999';
            document.body.appendChild(messageDiv);
        }

        messageDiv.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (messageDiv && messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }

    // Data Management
    async loadCSVData(filename) {
        try {
            const response = await fetch(`assets/data/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}`);
            }
            
            const csvText = await response.text();
            return this.parseCSV(csvText);
        } catch (error) {
            console.error('Error loading CSV data:', error);
            this.showMessage(`Error loading data: ${error.message}`, 'error');
            return [];
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index];
                });
                data.push(row);
            }
        }

        return data;
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }

    // Public API
    getProgress() {
        return this.userProgress;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize the application
window.vedanticApp = new VedanticApp();

// Global navigation function
window.showScreen = function(screenId) {
    window.vedanticApp.showScreen(screenId);
};

// Global functions for new design
window.startJourney = function() {
    window.vedanticApp.startJourney();
};

// Flashcard functions
window.flipCard = function() {
    if (window.flashcardManager) {
        window.flashcardManager.flipCard();
    }
};

window.nextCard = function() {
    if (window.flashcardManager) {
        window.flashcardManager.nextCard();
    }
};

window.previousCard = function() {
    if (window.flashcardManager) {
        window.flashcardManager.previousCard();
    }
};

window.shuffleCards = function() {
    if (window.flashcardManager) {
        window.flashcardManager.shuffleCards();
    }
};

window.bookmarkCard = function() {
    if (window.flashcardManager) {
        window.flashcardManager.bookmarkCard();
    }
};

// Quiz functions
window.selectOption = function(index) {
    if (window.quizManager) {
        window.quizManager.selectOption(index);
    }
};

window.submitAnswer = function() {
    if (window.quizManager) {
        window.quizManager.submitAnswer();
    }
};

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VedanticApp;
}