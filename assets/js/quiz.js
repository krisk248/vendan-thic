// Quiz Assessment Module
class QuizManager {
    constructor() {
        this.questions = [];
        this.currentQuiz = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.quizType = '';
        this.startTime = null;
        this.init();
    }

    async init() {
        await this.loadQuestions();
        this.setupEventListeners();
        this.showQuizSetup();
    }

    async loadQuestions() {
        try {
            this.questions = await window.vedanticApp.loadCSVData('quiz.csv');
            console.log('Loaded questions:', this.questions.length);
        } catch (error) {
            console.error('Error loading questions:', error);
            // Fallback to sample data
            this.questions = this.getSampleQuestions();
        }
    }

    getSampleQuestions() {
        return [
            {
                id: '1',
                question: 'What is Moksha?',
                option_a: 'Liberation from the cycle of rebirth',
                option_b: 'Material wealth and prosperity',
                option_c: 'Political power and influence',
                option_d: 'Fame and recognition',
                correct_answer: 'A',
                explanation: 'Moksha means liberation from samsara, the cycle of death and rebirth. It is the ultimate spiritual goal.',
                category: 'Core Concepts',
                difficulty: 'Beginner'
            },
            {
                id: '2',
                question: 'What does Dharma represent?',
                option_a: 'Selfish desires',
                option_b: 'Righteous duty and moral law',
                option_c: 'Material possessions',
                option_d: 'Physical strength',
                correct_answer: 'B',
                explanation: 'Dharma encompasses righteous duty, moral law, and ethical conduct that maintains cosmic order.',
                category: 'Ethics',
                difficulty: 'Beginner'
            },
            {
                id: '3',
                question: 'According to Vedanta, what is Atman?',
                option_a: 'The physical body',
                option_b: 'The mind and thoughts',
                option_c: 'The eternal soul or true Self',
                option_d: 'Worldly achievements',
                correct_answer: 'C',
                explanation: 'Atman is the eternal, unchanging essence of every individual - the true Self beyond body and mind.',
                category: 'Core Concepts',
                difficulty: 'Beginner'
            },
            {
                id: '4',
                question: 'What is the law of Karma?',
                option_a: 'Random events in life',
                option_b: 'The law of cause and effect',
                option_c: 'Financial transactions',
                option_d: 'Social relationships',
                correct_answer: 'B',
                explanation: 'Karma is the universal law of cause and effect, where every action creates consequences.',
                category: 'Ethics',
                difficulty: 'Beginner'
            },
            {
                id: '5',
                question: 'What is Brahman in Vedantic philosophy?',
                option_a: 'A specific deity',
                option_b: 'A religious ritual',
                option_c: 'The ultimate reality',
                option_d: 'A sacred text',
                correct_answer: 'C',
                explanation: 'Brahman is the ultimate reality, the cosmic consciousness that is the source of all existence.',
                category: 'Core Concepts',
                difficulty: 'Intermediate'
            },
            {
                id: '6',
                question: 'What is the purpose of Pranayama?',
                option_a: 'Physical exercise only',
                option_b: 'To control life force through breathing',
                option_c: 'To increase lung capacity',
                option_d: 'To reduce stress only',
                correct_answer: 'B',
                explanation: 'Pranayama controls prana (life force) through breathing exercises to purify body and mind.',
                category: 'Practices',
                difficulty: 'Intermediate'
            },
            {
                id: '7',
                question: 'What does Satsang mean?',
                option_a: 'Singing devotional songs',
                option_b: 'Association with truth and good company',
                option_c: 'Reading scriptures alone',
                option_d: 'Performing rituals',
                correct_answer: 'B',
                explanation: 'Satsang means association with truth or gathering with like-minded spiritual seekers.',
                category: 'Practices',
                difficulty: 'Beginner'
            },
            {
                id: '8',
                question: 'What is Samadhi?',
                option_a: 'A yoga posture',
                option_b: 'A religious festival',
                option_c: 'The highest state of meditation',
                option_d: 'A sacred mantra',
                correct_answer: 'C',
                explanation: 'Samadhi is the highest meditative state where subject, object, and process of meditation merge.',
                category: 'Practices',
                difficulty: 'Advanced'
            }
        ];
    }

    setupEventListeners() {
        // Option buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('option-btn')) {
                this.selectOption(e.target);
            }
        });

        // Next question button
        const nextButton = document.getElementById('next-question');
        if (nextButton) {
            nextButton.addEventListener('click', () => this.nextQuestion());
        }

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (document.querySelector('#quiz-screen.active')) {
                this.handleKeyboardNavigation(e);
            }
        });
    }

    handleKeyboardNavigation(e) {
        const currentSection = document.querySelector('.quiz-section.active');
        if (!currentSection) return;

        if (currentSection.id === 'quiz-questions') {
            switch(e.key) {
                case '1':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.selectOptionByKey('A');
                    break;
                case '2':
                case 'b':
                case 'B':
                    e.preventDefault();
                    this.selectOptionByKey('B');
                    break;
                case '3':
                case 'c':
                case 'C':
                    e.preventDefault();
                    this.selectOptionByKey('C');
                    break;
                case '4':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.selectOptionByKey('D');
                    break;
                case 'Enter':
                    e.preventDefault();
                    const nextButton = document.getElementById('next-question');
                    if (nextButton && nextButton.style.display !== 'none') {
                        this.nextQuestion();
                    }
                    break;
            }
        }
    }

    selectOptionByKey(option) {
        const optionButton = document.querySelector(`[data-option="${option}"]`);
        if (optionButton && !optionButton.disabled) {
            this.selectOption(optionButton);
        }
    }

    showQuizSetup() {
        this.showQuizSection('quiz-setup');
    }

    showQuizSection(sectionId) {
        // Hide all quiz sections
        document.querySelectorAll('.quiz-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    startQuiz(type) {
        this.quizType = type;
        this.prepareQuiz();
        this.resetQuizState();
        this.showQuizSection('quiz-questions');
        this.displayQuestion();
        this.startTime = Date.now();
    }

    prepareQuiz() {
        let availableQuestions = [...this.questions];

        // Filter by quiz type
        switch(this.quizType) {
            case 'core':
                availableQuestions = availableQuestions.filter(q => q.category === 'Core Concepts');
                break;
            case 'ethics':
                availableQuestions = availableQuestions.filter(q => 
                    q.category === 'Ethics' || q.category === 'Practices'
                );
                break;
            case 'mixed':
            default:
                // Use all questions
                break;
        }

        // Shuffle and select questions (max 10)
        this.shuffleArray(availableQuestions);
        this.currentQuiz = availableQuestions.slice(0, Math.min(10, availableQuestions.length));
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    resetQuizState() {
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
    }

    displayQuestion() {
        const question = this.currentQuiz[this.currentQuestionIndex];
        if (!question) return;

        // Update question content
        const questionText = document.getElementById('question-text');
        if (questionText) {
            questionText.textContent = question.question;
        }

        // Update options
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach((btn, index) => {
            const optionKey = String.fromCharCode(65 + index); // A, B, C, D
            const optionText = question[`option_${optionKey.toLowerCase()}`];
            
            btn.innerHTML = `${optionKey}) ${optionText}`;
            btn.dataset.option = optionKey;
            btn.disabled = false;
            btn.className = 'btn btn-outline-primary option-btn w-100 mb-2';
        });

        // Update progress
        this.updateQuizProgress();

        // Hide feedback section
        const feedbackSection = document.getElementById('feedback-section');
        if (feedbackSection) {
            feedbackSection.style.display = 'none';
        }
    }

    updateQuizProgress() {
        const progressBar = document.getElementById('quiz-progress-bar');
        const currentQuestion = document.getElementById('current-question');
        const totalQuestions = document.getElementById('total-questions');

        const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.length) * 100;

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (currentQuestion) {
            currentQuestion.textContent = this.currentQuestionIndex + 1;
        }

        if (totalQuestions) {
            totalQuestions.textContent = this.currentQuiz.length;
        }
    }

    selectOption(optionButton) {
        // Remove previous selections
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Mark selected option
        optionButton.classList.add('selected');

        // Process the answer
        const selectedOption = optionButton.dataset.option;
        this.processAnswer(selectedOption);
    }

    processAnswer(selectedOption) {
        const question = this.currentQuiz[this.currentQuestionIndex];
        const isCorrect = selectedOption === question.correct_answer;

        // Store answer
        this.userAnswers.push({
            questionId: question.id,
            selected: selectedOption,
            correct: question.correct_answer,
            isCorrect: isCorrect
        });

        if (isCorrect) {
            this.score++;
        }

        // Show feedback
        this.showFeedback(question, selectedOption, isCorrect);
    }

    showFeedback(question, selectedOption, isCorrect) {
        // Disable all option buttons
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.disabled = true;
            
            // Highlight correct and incorrect answers
            if (btn.dataset.option === question.correct_answer) {
                btn.classList.add('correct');
            } else if (btn.dataset.option === selectedOption && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        // Show feedback section
        const feedbackSection = document.getElementById('feedback-section');
        const feedbackMessage = document.getElementById('feedback-message');
        const explanation = document.getElementById('explanation');

        if (feedbackSection && feedbackMessage && explanation) {
            feedbackMessage.textContent = isCorrect ? 'Correct!' : 'Incorrect';
            feedbackMessage.className = `feedback-message ${isCorrect ? 'correct' : 'incorrect'}`;
            explanation.textContent = question.explanation;
            
            feedbackSection.style.display = 'block';
        }

        // Update next button
        const nextButton = document.getElementById('next-question');
        if (nextButton) {
            if (this.currentQuestionIndex < this.currentQuiz.length - 1) {
                nextButton.textContent = 'Next Question';
            } else {
                nextButton.textContent = 'View Results';
            }
        }
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.currentQuiz.length) {
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        this.showQuizSection('quiz-results');
        this.displayResults();
        this.saveQuizResults();
    }

    displayResults() {
        const finalScore = document.getElementById('final-score');
        const scorePercentage = document.getElementById('score-percentage');
        const encouragementMessage = document.getElementById('encouragement-message');

        const percentage = Math.round((this.score / this.currentQuiz.length) * 100);

        if (finalScore) {
            finalScore.textContent = this.score;
        }

        if (scorePercentage) {
            scorePercentage.textContent = `${percentage}%`;
        }

        if (encouragementMessage) {
            encouragementMessage.textContent = this.getEncouragementMessage(percentage);
        }

        // Update Sanskrit quote
        this.displaySanskritQuote(percentage);
    }

    getEncouragementMessage(percentage) {
        if (percentage >= 90) {
            return 'Outstanding! You have deep understanding of Vedantic wisdom.';
        } else if (percentage >= 80) {
            return 'Excellent! You\'re on the right path of knowledge.';
        } else if (percentage >= 70) {
            return 'Good work! Continue your learning journey with dedication.';
        } else if (percentage >= 60) {
            return 'Keep learning! Every step brings you closer to wisdom.';
        } else {
            return 'Don\'t give up! The path of knowledge requires patience and practice.';
        }
    }

    displaySanskritQuote(percentage) {
        const quotes = [
            {
                quote: 'सत्यमेव जयते',
                translation: 'Truth alone triumphs',
                condition: percentage >= 90
            },
            {
                quote: 'तत्त्वमसि',
                translation: 'That thou art',
                condition: percentage >= 80
            },
            {
                quote: 'अहं ब्रह्मास्मि',
                translation: 'I am Brahman',
                condition: percentage >= 70
            },
            {
                quote: 'वसुधैव कुटुम्बकम्',
                translation: 'The world is one family',
                condition: percentage >= 60
            },
            {
                quote: 'योगः कर्मसु कौशलम्',
                translation: 'Yoga is skill in action',
                condition: true // Default
            }
        ];

        const selectedQuote = quotes.find(q => q.condition) || quotes[quotes.length - 1];
        
        const quoteElement = document.querySelector('.quote');
        const translationElement = document.querySelector('.quote-translation');
        
        if (quoteElement) {
            quoteElement.textContent = selectedQuote.quote;
        }
        
        if (translationElement) {
            translationElement.textContent = selectedQuote.translation;
        }
    }

    saveQuizResults() {
        const endTime = Date.now();
        const duration = this.startTime ? Math.round((endTime - this.startTime) / 1000) : 0;

        // Calculate category-wise performance
        const categoryStats = this.calculateCategoryStats();

        // Save to progress
        window.vedanticApp.updateProgress('quiz_completed', {
            score: this.score,
            total: this.currentQuiz.length,
            category: this.quizType,
            correct: this.score,
            duration: duration,
            answers: this.userAnswers,
            categoryStats: categoryStats
        });

        console.log('Quiz results saved:', {
            score: this.score,
            total: this.currentQuiz.length,
            percentage: Math.round((this.score / this.currentQuiz.length) * 100)
        });
    }

    calculateCategoryStats() {
        const stats = {};
        
        this.currentQuiz.forEach((question, index) => {
            const category = question.category;
            const answer = this.userAnswers[index];
            
            if (!stats[category]) {
                stats[category] = { correct: 0, total: 0 };
            }
            
            stats[category].total++;
            if (answer && answer.isCorrect) {
                stats[category].correct++;
            }
        });
        
        return stats;
    }

    retryQuiz() {
        this.showQuizSetup();
    }

    // Public API
    getCurrentQuestion() {
        return this.currentQuiz[this.currentQuestionIndex];
    }

    getQuizProgress() {
        return {
            current: this.currentQuestionIndex + 1,
            total: this.currentQuiz.length,
            score: this.score
        };
    }

    getTotalQuestions() {
        return this.questions.length;
    }
}

// Global functions for HTML onclick events
window.startQuiz = function(type) {
    if (window.quizManager) {
        window.quizManager.startQuiz(type);
    }
};

window.retryQuiz = function() {
    if (window.quizManager) {
        window.quizManager.retryQuiz();
    }
};

// Initialize quiz manager
window.quizManager = new QuizManager();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizManager;
}