// Flashcard Learning Module
class FlashcardManager {
    constructor() {
        this.flashcards = [];
        this.currentIndex = 0;
        this.filteredCards = [];
        this.isFlipped = false;
        this.sessionStartTime = null;
        this.selectedLevel = null;
        // Don't auto-initialize, wait for level selection
    }

    async init() {
        await this.loadFlashcards();
        this.setupEventListeners();
        this.applyFilters();
        this.displayCurrentCard();
        this.startSession();
    }

    async loadFlashcards() {
        try {
            const response = await fetch('/api/flashcards');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            this.flashcards = await response.json();
            console.log('Loaded flashcards from API:', this.flashcards.length);
        } catch (error) {
            console.error('Error loading flashcards from API:', error);
            // Fallback to sample data
            this.flashcards = this.getSampleFlashcards();
            console.log('Using sample flashcards data');
        }
    }

    getSampleFlashcards() {
        return [
            {
                id: '1',
                sanskrit_term: 'आत्मन्',
                english_term: 'Atman',
                meaning: 'The eternal soul, the true Self that is beyond the physical body and mind. It is the unchanging essence of every individual.',
                category: 'Core Concepts',
                difficulty: 'Beginner',
                image_url: ''
            },
            {
                id: '2',
                sanskrit_term: 'ब्रह्मन्',
                english_term: 'Brahman',
                meaning: 'The ultimate reality, the cosmic consciousness that pervades everything. It is the source and essence of all existence.',
                category: 'Core Concepts',
                difficulty: 'Intermediate',
                image_url: ''
            },
            {
                id: '3',
                sanskrit_term: 'मोक्ष',
                english_term: 'Moksha',
                meaning: 'Liberation from the cycle of death and rebirth (samsara). It is the ultimate goal of spiritual practice.',
                category: 'Core Concepts',
                difficulty: 'Beginner',
                image_url: ''
            },
            {
                id: '4',
                sanskrit_term: 'धर्म',
                english_term: 'Dharma',
                meaning: 'Righteous duty or moral law. It encompasses ethical conduct, natural law, and individual purpose in life.',
                category: 'Ethics',
                difficulty: 'Beginner',
                image_url: ''
            },
            {
                id: '5',
                sanskrit_term: 'कर्म',
                english_term: 'Karma',
                meaning: 'The law of cause and effect governing actions and their consequences. Every action creates reactions that affect future experiences.',
                category: 'Ethics',
                difficulty: 'Beginner',
                image_url: ''
            },
            {
                id: '6',
                sanskrit_term: 'समाधि',
                english_term: 'Samadhi',
                meaning: 'The highest state of meditation where the meditator, meditation, and object of meditation become one.',
                category: 'Practices',
                difficulty: 'Advanced',
                image_url: ''
            },
            {
                id: '7',
                sanskrit_term: 'प्राणायाम',
                english_term: 'Pranayama',
                meaning: 'Breathing exercises that control the life force (prana) to purify the body and mind for spiritual practice.',
                category: 'Practices',
                difficulty: 'Intermediate',
                image_url: ''
            },
            {
                id: '8',
                sanskrit_term: 'सत्संग',
                english_term: 'Satsang',
                meaning: 'Association with truth or good company. Gathering with like-minded spiritual seekers for learning and growth.',
                category: 'Practices',
                difficulty: 'Beginner',
                image_url: ''
            }
        ];
    }

    setupEventListeners() {
        // Set up flashcard click listener
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            // Remove existing listeners by cloning
            const newFlashcard = flashcard.cloneNode(true);
            flashcard.parentNode.replaceChild(newFlashcard, flashcard);
            // Add new click listener
            newFlashcard.addEventListener('click', (e) => {
                e.preventDefault();
                this.flipCard();
            });
        }

        // Navigation buttons  
        const prevButton = document.getElementById('prev-btn');
        const nextButton = document.getElementById('next-btn');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => this.previousCard());
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextCard());
        }

        // Action buttons
        const shuffleButton = document.getElementById('shuffle-cards');
        const bookmarkButton = document.getElementById('bookmark-card');
        
        if (shuffleButton) {
            shuffleButton.addEventListener('click', () => this.shuffleCards());
        }
        
        if (bookmarkButton) {
            bookmarkButton.addEventListener('click', () => this.toggleBookmark());
        }

        // Filter controls
        const categoryFilter = document.getElementById('category-filter');
        const difficultyFilter = document.getElementById('difficulty-filter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => this.applyFilters());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('#learning-screen.active')) {
                this.handleKeyboardNavigation(e);
            }
        });

        // Touch/swipe support for mobile
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;

        let startX = 0;
        let startY = 0;

        flashcard.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        flashcard.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Determine if it's a swipe or tap
            if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
                // Swipe detected
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX > 0) {
                        this.previousCard();
                    } else {
                        this.nextCard();
                    }
                }
            }
            // Tap is handled by click event
        });
    }

    handleKeyboardNavigation(e) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previousCard();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextCard();
                break;
            case ' ':
            case 'Enter':
                e.preventDefault();
                this.flipCard();
                break;
            case 'b':
            case 'B':
                e.preventDefault();
                this.toggleBookmark();
                break;
            case 's':
            case 'S':
                e.preventDefault();
                this.shuffleCards();
                break;
        }
    }

    setLevel(level) {
        this.selectedLevel = level;
        // Don't apply filters immediately - wait for init() to load flashcards first
    }

    applyFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const difficultyFilter = document.getElementById('difficulty-filter');
        
        const selectedCategory = categoryFilter ? categoryFilter.value : '';
        const selectedDifficulty = difficultyFilter ? difficultyFilter.value : '';
        
        this.filteredCards = this.flashcards.filter(card => {
            const categoryMatch = !selectedCategory || card.category === selectedCategory;
            const difficultyMatch = !selectedDifficulty || card.difficulty === selectedDifficulty;
            const levelMatch = !this.selectedLevel || card.difficulty.toLowerCase() === this.selectedLevel.toLowerCase();
            return categoryMatch && difficultyMatch && levelMatch;
        });

        // Reset to first card when filters change
        this.currentIndex = 0;
        this.displayCurrentCard();
        this.updateNavigation();
    }

    displayCurrentCard() {
        if (this.filteredCards.length === 0) {
            this.showNoCardsMessage();
            return;
        }

        const card = this.filteredCards[this.currentIndex];
        if (!card) return;

        // Reset flip state
        this.isFlipped = false;

        // Update card content
        this.updateCardContent(card);
        
        // Reset flip state
        this.resetFlipState();
        
        // Update progress indicator
        this.updateProgressIndicator();
        
        // Update bookmark button
        this.updateBookmarkButton(card.id);
        
        // Mark concept as learned
        this.markConceptLearned(card.id);
    }

    updateCardContent(card) {
        const sanskritTerm = document.getElementById('card-term');
        const englishTerm = document.getElementById('card-english');
        const meaning = document.getElementById('card-meaning');

        if (sanskritTerm) sanskritTerm.textContent = card.sanskrit_term;
        if (englishTerm) englishTerm.textContent = card.english_term;
        if (meaning) meaning.textContent = card.meaning;
    }

    resetFlipState() {
        const meaning = document.getElementById('card-meaning');
        const hint = document.getElementById('flip-hint');
        
        if (meaning && hint) {
            meaning.classList.add('hidden');
            hint.style.display = 'block';
            this.isFlipped = false;
        }
    }

    updateProgressIndicator() {
        const progressElement = document.getElementById('card-progress');
        
        if (progressElement) {
            progressElement.textContent = `Card ${this.currentIndex + 1} of ${this.filteredCards.length}`;
        }
    }

    updateBookmarkButton(cardId) {
        const bookmarkButton = document.getElementById('bookmark-card');
        if (!bookmarkButton) return;

        const progress = window.vedanticApp.getProgress();
        const isBookmarked = progress && progress.bookmarkedCards.includes(cardId);
        
        bookmarkButton.innerHTML = isBookmarked ? '⭐ Bookmarked' : '☆ Bookmark';
        bookmarkButton.className = isBookmarked ? 'btn btn-warning' : 'btn btn-outline-warning';
    }

    updateNavigation() {
        const prevButton = document.getElementById('prev-btn');
        const nextButton = document.getElementById('next-btn');
        
        if (prevButton) {
            prevButton.disabled = this.currentIndex === 0;
        }
        
        if (nextButton) {
            nextButton.disabled = this.currentIndex === this.filteredCards.length - 1;
        }
    }

    showNoCardsMessage() {
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.innerHTML = `
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <div class="no-cards-message">
                            <h3>No cards found</h3>
                            <p>Try adjusting your filters or check if data is loaded properly.</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    flipCard() {
        const meaning = document.getElementById('card-meaning');
        const hint = document.getElementById('flip-hint');
        
        if (meaning && hint) {
            if (meaning.classList.contains('hidden')) {
                // Show meaning
                meaning.classList.remove('hidden');
                hint.style.display = 'none';
                this.isFlipped = true;
            } else {
                // Hide meaning
                meaning.classList.add('hidden');
                hint.style.display = 'block';
                this.isFlipped = false;
            }
        }
    }

    nextCard() {
        if (this.currentIndex < this.filteredCards.length - 1) {
            this.currentIndex++;
            this.displayCurrentCard();
            this.updateNavigation();
        }
    }

    previousCard() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.displayCurrentCard();
            this.updateNavigation();
        }
    }

    shuffleCards() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.filteredCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.filteredCards[i], this.filteredCards[j]] = [this.filteredCards[j], this.filteredCards[i]];
        }
        
        this.currentIndex = 0;
        this.displayCurrentCard();
        this.updateNavigation();
        
        window.vedanticApp.showMessage('Cards shuffled!', 'success');
    }

    toggleBookmark() {
        const currentCard = this.filteredCards[this.currentIndex];
        if (!currentCard) return;

        const progress = window.vedanticApp.getProgress();
        if (!progress) return;

        const cardId = currentCard.id;
        const isBookmarked = progress.bookmarkedCards.includes(cardId);
        
        if (isBookmarked) {
            const index = progress.bookmarkedCards.indexOf(cardId);
            progress.bookmarkedCards.splice(index, 1);
            window.vedanticApp.showMessage('Bookmark removed', 'info');
        } else {
            window.vedanticApp.updateProgress('bookmark_card', { cardId });
            window.vedanticApp.showMessage('Card bookmarked!', 'success');
        }
        
        this.updateBookmarkButton(cardId);
    }

    markConceptLearned(cardId) {
        window.vedanticApp.updateProgress('concept_learned', { conceptId: cardId });
    }

    startSession() {
        this.sessionStartTime = Date.now();
        window.vedanticApp.updateProgress('session_start');
    }

    endSession() {
        if (this.sessionStartTime) {
            const sessionTime = Date.now() - this.sessionStartTime;
            const minutes = Math.round(sessionTime / 60000);
            window.vedanticApp.updateProgress('time_spent', { minutes });
        }
    }

    // Public API
    getCurrentCard() {
        return this.filteredCards[this.currentIndex];
    }

    getFilteredCards() {
        return this.filteredCards;
    }

    getTotalCards() {
        return this.flashcards.length;
    }
}

// Don't auto-initialize - will be created when level is selected
// window.flashcardManager = new FlashcardManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.flashcardManager) {
        window.flashcardManager.endSession();
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FlashcardManager;
}