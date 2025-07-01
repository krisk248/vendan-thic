// Analytics and Progress Tracking Module
class AnalyticsManager {
    constructor() {
        this.progress = null;
        this.init();
    }

    init() {
        this.loadProgress();
        this.displayAnalytics();
        this.setupEventListeners();
    }

    loadProgress() {
        this.progress = window.vedanticApp.getProgress();
    }

    setupEventListeners() {
        // Refresh analytics when screen becomes active
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && document.querySelector('#analytics-screen.active')) {
                this.refreshAnalytics();
            }
        });

        // Auto-refresh every 30 seconds when analytics screen is active
        setInterval(() => {
            if (document.querySelector('#analytics-screen.active')) {
                this.refreshAnalytics();
            }
        }, 30000);
    }

    refreshAnalytics() {
        this.loadProgress();
        this.displayAnalytics();
    }

    displayAnalytics() {
        if (!this.progress) {
            this.showNoDataMessage();
            return;
        }

        this.updateMetricCards();
        this.updateCategoryPerformance();
        this.updateAchievements();
    }

    updateMetricCards() {
        // Total Sessions
        const totalSessions = document.getElementById('total-sessions');
        if (totalSessions) {
            totalSessions.textContent = this.progress.totalSessions || 0;
        }

        // Average Score
        const avgScore = document.getElementById('avg-score');
        if (avgScore) {
            const average = this.calculateAverageScore();
            avgScore.textContent = `${average}%`;
        }

        // Learning Streak
        const learningStreak = document.getElementById('learning-streak');
        if (learningStreak) {
            learningStreak.textContent = this.progress.streak || 0;
        }

        // Concepts Learned
        const conceptsLearned = document.getElementById('concepts-learned');
        if (conceptsLearned) {
            conceptsLearned.textContent = this.progress.conceptsLearned ? this.progress.conceptsLearned.length : 0;
        }
    }

    calculateAverageScore() {
        const scores = this.progress.quizScores || [];
        if (scores.length === 0) return 0;

        const totalPercentage = scores.reduce((sum, quiz) => {
            return sum + ((quiz.score / quiz.total) * 100);
        }, 0);

        return Math.round(totalPercentage / scores.length);
    }

    updateCategoryPerformance() {
        const categoryProgress = this.progress.categoryProgress || {};
        const categories = ['Core Concepts', 'Ethics', 'Practices'];

        categories.forEach(category => {
            const categoryData = categoryProgress[category] || { correct: 0, total: 0 };
            const percentage = categoryData.total > 0 
                ? Math.round((categoryData.correct / categoryData.total) * 100) 
                : 0;

            this.updateCategoryDisplay(category, percentage);
        });
    }

    updateCategoryDisplay(category, percentage) {
        const categoryElement = this.findCategoryElement(category);
        if (!categoryElement) return;

        const progressBar = categoryElement.querySelector('.progress-bar');
        const scoreElement = categoryElement.querySelector('.category-score');

        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            
            // Color coding based on performance
            progressBar.className = 'progress-bar';
            if (percentage >= 80) {
                progressBar.classList.add('bg-success');
            } else if (percentage >= 60) {
                progressBar.classList.add('bg-warning');
            } else {
                progressBar.classList.add('bg-danger');
            }
        }

        if (scoreElement) {
            scoreElement.textContent = `${percentage}%`;
        }
    }

    findCategoryElement(category) {
        const categoryItems = document.querySelectorAll('.category-item');
        
        for (const item of categoryItems) {
            const nameElement = item.querySelector('.category-name');
            if (nameElement && nameElement.textContent.trim() === category) {
                return item;
            }
        }
        
        return null;
    }

    updateAchievements() {
        const achievements = this.calculateAchievements();
        this.displayAchievements(achievements);
    }

    calculateAchievements() {
        const achievements = [
            {
                id: 'first-quiz',
                name: 'Pratham Siddhi',
                description: 'First Quiz Completed',
                icon: '🏆',
                condition: () => (this.progress.quizScores || []).length >= 1
            },
            {
                id: 'concepts-25',
                name: 'Adhyayana Premi',
                description: '25 Concepts Learned',
                icon: '📚',
                condition: () => (this.progress.conceptsLearned || []).length >= 25
            },
            {
                id: 'streak-7',
                name: 'Sapta Dina',
                description: '7 Day Streak',
                icon: '🔥',
                condition: () => (this.progress.streak || 0) >= 7
            },
            {
                id: 'streak-30',
                name: 'Sadhana Yukta',
                description: '30 Day Streak',
                icon: '🔥',
                condition: () => (this.progress.streak || 0) >= 30
            },
            {
                id: 'perfect-score',
                name: 'Purna Gyana',
                description: 'Perfect Quiz Score',
                icon: '💯',
                condition: () => this.hasPerfectScore()
            },
            {
                id: 'concepts-100',
                name: 'Gyani',
                description: '100 Concepts Mastered',
                icon: '⭐',
                condition: () => (this.progress.conceptsLearned || []).length >= 100
            },
            {
                id: 'quiz-master',
                name: 'Pariksha Nipuna',
                description: '10 Quizzes Completed',
                icon: '🎯',
                condition: () => (this.progress.quizScores || []).length >= 10
            },
            {
                id: 'dedicated-learner',
                name: 'Nityabhyasi',
                description: '50 Learning Sessions',
                icon: '📖',
                condition: () => (this.progress.totalSessions || 0) >= 50
            }
        ];

        return achievements.map(achievement => ({
            ...achievement,
            earned: achievement.condition()
        }));
    }

    hasPerfectScore() {
        const scores = this.progress.quizScores || [];
        return scores.some(quiz => quiz.score === quiz.total);
    }

    displayAchievements(achievements) {
        const achievementGrid = document.querySelector('.achievement-grid');
        if (!achievementGrid) return;

        // Clear existing achievements
        achievementGrid.innerHTML = '';

        // Display achievements
        achievements.forEach(achievement => {
            const achievementElement = this.createAchievementElement(achievement);
            achievementGrid.appendChild(achievementElement);
        });
    }

    createAchievementElement(achievement) {
        const element = document.createElement('div');
        element.className = `achievement-badge ${achievement.earned ? 'earned' : ''}`;
        
        element.innerHTML = `
            <div class="badge-icon">${achievement.icon}</div>
            <div class="badge-name">${achievement.name}</div>
            <div class="badge-description">${achievement.description}</div>
        `;

        // Add click handler for earned achievements
        if (achievement.earned) {
            element.addEventListener('click', () => {
                this.showAchievementDetails(achievement);
            });
            element.style.cursor = 'pointer';
        }

        return element;
    }

    showAchievementDetails(achievement) {
        const message = `🎉 ${achievement.name}\n\n${achievement.description}\n\nCongratulations on your achievement!`;
        window.vedanticApp.showMessage(message, 'success');
    }

    showNoDataMessage() {
        const metricsContainer = document.querySelector('.row.g-4.mb-4');
        if (metricsContainer) {
            metricsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        <h4>No Progress Data Available</h4>
                        <p>Start learning and taking quizzes to see your progress here!</p>
                        <button class="btn btn-primary" onclick="showScreen('main-screen')">
                            Begin Your Journey
                        </button>
                    </div>
                </div>
            `;
        }
    }

    // Detailed Analytics Methods
    getDetailedStats() {
        if (!this.progress) return null;

        return {
            totalSessions: this.progress.totalSessions || 0,
            totalQuizzes: (this.progress.quizScores || []).length,
            averageScore: this.calculateAverageScore(),
            bestScore: this.getBestScore(),
            totalTimeSpent: this.progress.timeSpent || 0,
            conceptsLearned: (this.progress.conceptsLearned || []).length,
            bookmarkedCards: (this.progress.bookmarkedCards || []).length,
            currentStreak: this.progress.streak || 0,
            lastActivity: this.progress.lastLoginDate,
            categoryBreakdown: this.getCategoryBreakdown(),
            recentActivity: this.getRecentActivity(),
            achievements: this.calculateAchievements().filter(a => a.earned)
        };
    }

    getBestScore() {
        const scores = this.progress.quizScores || [];
        if (scores.length === 0) return 0;

        const bestQuiz = scores.reduce((best, current) => {
            const currentPercentage = (current.score / current.total) * 100;
            const bestPercentage = (best.score / best.total) * 100;
            return currentPercentage > bestPercentage ? current : best;
        });

        return Math.round((bestQuiz.score / bestQuiz.total) * 100);
    }

    getCategoryBreakdown() {
        const categoryProgress = this.progress.categoryProgress || {};
        const breakdown = {};

        Object.keys(categoryProgress).forEach(category => {
            const data = categoryProgress[category];
            breakdown[category] = {
                accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
                questionsAnswered: data.total,
                correctAnswers: data.correct
            };
        });

        return breakdown;
    }

    getRecentActivity() {
        const scores = this.progress.quizScores || [];
        const recentQuizzes = scores
            .slice(-5) // Last 5 quizzes
            .map(quiz => ({
                date: new Date(quiz.date).toLocaleDateString(),
                score: `${quiz.score}/${quiz.total}`,
                percentage: Math.round((quiz.score / quiz.total) * 100),
                category: quiz.category
            }));

        return recentQuizzes;
    }

    // Export/Import Methods
    exportProgress() {
        if (!this.progress) {
            window.vedanticApp.showMessage('No progress data to export', 'warning');
            return;
        }

        const dataStr = JSON.stringify(this.progress, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `vedantic-progress-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        window.vedanticApp.showMessage('Progress data exported successfully!', 'success');
    }

    // Performance insights
    getPerformanceInsights() {
        const stats = this.getDetailedStats();
        if (!stats) return [];

        const insights = [];

        // Accuracy insights
        if (stats.averageScore >= 90) {
            insights.push({
                type: 'success',
                title: 'Excellent Performance',
                message: 'You consistently score above 90%. Consider exploring advanced topics!'
            });
        } else if (stats.averageScore < 60) {
            insights.push({
                type: 'warning',
                title: 'Room for Improvement',
                message: 'Focus on understanding core concepts before attempting difficult questions.'
            });
        }

        // Streak insights
        if (stats.currentStreak >= 7) {
            insights.push({
                type: 'info',
                title: 'Great Consistency',
                message: `You've maintained a ${stats.currentStreak}-day learning streak!`
            });
        }

        // Category insights
        const categoryData = stats.categoryBreakdown;
        const weakestCategory = Object.entries(categoryData)
            .filter(([_, data]) => data.questionsAnswered > 0)
            .sort(([_, a], [__, b]) => a.accuracy - b.accuracy)[0];

        if (weakestCategory && weakestCategory[1].accuracy < 70) {
            insights.push({
                type: 'tip',
                title: 'Focus Area Identified',
                message: `Consider spending more time on ${weakestCategory[0]} (${weakestCategory[1].accuracy}% accuracy).`
            });
        }

        return insights;
    }

    // Public API
    getProgress() {
        return this.progress;
    }

    updateDisplay() {
        this.refreshAnalytics();
    }
}

// Initialize analytics manager
window.analyticsManager = new AnalyticsManager();

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
}