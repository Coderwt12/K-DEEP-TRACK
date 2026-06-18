/**
 * K-DEEP XP - PREMIUM ANALYTICS ENGINE
 * Optimized Production Version
 * Handles data visualization, Chart.js lifecycle management, and productivity metrics.
 */
const K_Analytics = {
    charts: {}, // Registry to store chart instances and prevent memory leaks

    template: `
        <div class="analytics-view-wrapper view-animate">
            <!-- SECTION A: OVERVIEW CARDS -->
            <div class="overview-grid">
                <div class="analytics-card glass-v2">
                    <i class="fas fa-bolt accent"></i>
                    <div class="card-info">
                        <span class="label">TOTAL XP</span>
                        <h2 id="total-xp-stat">0</h2>
                    </div>
                </div>
                <div class="analytics-card glass-v2">
                    <i class="fas fa-book-open accent-purple"></i>
                    <div class="card-info">
                        <span class="label">STUDY HOURS</span>
                        <h2 id="total-study-stat">0h</h2>
                    </div>
                </div>
                <div class="analytics-card glass-v2">
                    <i class="fas fa-check-circle accent-emerald"></i>
                    <div class="card-info">
                        <span class="label">HABITS DONE</span>
                        <h2 id="total-habits-stat">0</h2>
                    </div>
                </div>
                <div class="analytics-card glass-v2">
                    <i class="fas fa-fire accent-orange"></i>
                    <div class="card-info">
                        <span class="label">STREAK</span>
                        <h2 id="current-streak-stat">0</h2>
                    </div>
                </div>
            </div>

            <!-- SECTION B & C: MAIN CHARTS -->
            <div class="charts-main-grid">
                <div class="chart-container glass-v2">
                    <h3><i class="fas fa-chart-line"></i> WEEKLY XP GROWTH</h3>
                    <canvas id="weeklyXpChart"></canvas>
                </div>
                <div class="chart-container glass-v2">
                    <h3><i class="fas fa-chart-bar"></i> SUBJECT DISTRIBUTION</h3>
                    <canvas id="subjectChart"></canvas>
                </div>
            </div>

            <!-- SECTION D & E: HABITS & HEATMAP -->
            <div class="charts-secondary-grid">
                <div class="chart-container glass-v2 doughnut-wrap">
                    <h3><i class="fas fa-pie-chart"></i> HABIT CONSISTENCY</h3>
                    <canvas id="habitDoughnutChart"></canvas>
                </div>
                <div class="chart-container glass-v2 heatmap-wrap">
                    <h3><i class="fas fa-calendar-alt"></i> PRODUCTIVITY HEATMAP (30D)</h3>
                    <div class="heatmap-grid" id="heatmap-container"></div>
                </div>
            </div>

            <!-- SECTION F: ACHIEVEMENT PANEL -->
            <div class="achievement-panel glass-v2">
                <h3><i class="fas fa-trophy"></i> MILESTONES</h3>
                <div class="achievement-grid" id="achievement-list"></div>
            </div>
        </div>
    `,

    /**
     * Initializes all analytics components
     */
    init() {
        const data = K_Storage.getData();
        if (!data) return;

        // Render numeric stats and achievements
        this.renderStats(data);
        this.renderAchievements(data);

        // Standardize 7-day data range for chart consistency
        const last7Days = this._getDateRange(7);

        // Initialize visualization components
        this.initWeeklyXPChart(data, last7Days);
        this.initSubjectChart(data);
        this.initHabitChart(data);
        this.renderHeatmap(data);
    },

    /**
     * Utility: Generates an array of last N days for data alignment
     */
    _getDateRange(daysCount) {
        const days = [];
        const today = new Date();
        for (let i = daysCount - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            days.push({
                dateStr: d.toISOString().split('T')[0],
                label: d.toLocaleDateString('en-US', { weekday: 'short' })
            });
        }
        return days;
    },

    /**
     * Updates header statistic cards
     */
    renderStats(data) {
        const totalStudyMins = (data.studyLogs || []).reduce((acc, log) => acc + (log.duration || 0), 0);
        const totalHabitsDone = (data.habits || []).reduce((acc, habit) => acc + (habit.completedDates?.length || 0), 0);

        const elements = {
            'total-xp-stat': (data.profile?.totalXp || 0).toLocaleString(),
            'total-study-stat': `${Math.floor(totalStudyMins / 60)}h`,
            'total-habits-stat': totalHabitsDone,
            'current-streak-stat': data.profile?.streak || 0
        };

        Object.entries(elements).forEach(([id, val]) => {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        });
    },

    /**
     * LINE CHART: Visualizes daily XP gains
     */
    initWeeklyXPChart(data, days) {
        const labels = days.map(d => d.label);
        const xpData = days.map(day => {
            const studyXp = (data.studyLogs || [])
                .filter(l => l.timestamp?.startsWith(day.dateStr))
                .reduce((acc, curr) => acc + (curr.xpEarned || 0), 0);
            
            const habitXp = (data.habits || [])
                .filter(h => h.completedDates?.includes(day.dateStr)).length * 50;

            return studyXp + habitXp;
        });

        this._renderChart('weeklyXpChart', {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'XP Earned',
                    data: xpData,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#06b6d4'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    },

    /**
     * BAR CHART: Subject study distribution
     */
    initSubjectChart(data) {
        const subjects = ['Physics', 'Chemistry', 'Maths', 'English'];
        const hours = subjects.map(sub => {
            const mins = (data.studyLogs || [])
                .filter(l => l.subject === sub)
                .reduce((acc, curr) => acc + (curr.duration || 0), 0);
            return (mins / 60).toFixed(1);
        });

        this._renderChart('subjectChart', {
            type: 'bar',
            data: {
                labels: subjects,
                datasets: [{
                    data: hours,
                    backgroundColor: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    /**
     * DOUGHNUT CHART: Daily habit completion ratio
     */
    initHabitChart(data) {
        const today = new Date().toISOString().split('T')[0];
        const habits = data.habits || [];
        const completed = habits.filter(h => h.completedDates?.includes(today)).length;
        const missed = Math.max(0, habits.length - completed);

        this._renderChart('habitDoughnutChart', {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending'],
                datasets: [{
                    data: [completed, missed],
                    backgroundColor: ['#10b981', 'rgba(255,255,255,0.05)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: '80%',
                plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa' } } }
            }
        });
    },

    /**
     * Renders activity heatmap for the last 30 days
     */
    renderHeatmap(data) {
        const container = document.getElementById('heatmap-container');
        if (!container) return;

        const days = this._getDateRange(30);
        let html = '';

        days.forEach(day => {
            const studyCount = (data.studyLogs || []).filter(l => l.timestamp?.startsWith(day.dateStr)).length;
            const habitCount = (data.habits || []).filter(h => h.completedDates?.includes(day.dateStr)).length;
            const score = studyCount + habitCount;

            let intensity = 0;
            if (score > 6) intensity = 4;
            else if (score > 4) intensity = 3;
            else if (score > 2) intensity = 2;
            else if (score > 0) intensity = 1;

            html += `<div class="heatmap-box intensity-${intensity}" title="${day.dateStr}: ${score} Activities"></div>`;
        });

        container.innerHTML = html;
    },

    /**
     * Renders achievements based on current profile metrics
     */
    renderAchievements(data) {
        const list = document.getElementById('achievement-list');
        if (!list) return;

        const milestones = [
            { id: 'first_habit', name: 'Initiate', desc: 'First Habit Done', icon: 'fa-seedling', check: () => (data.habits || []).some(h => h.completedDates?.length > 0) },
            { id: 'streak_7', name: 'Disciplined', desc: '7 Day Streak', icon: 'fa-fire', check: () => (data.profile?.streak || 0) >= 7 },
            { id: 'study_10', name: 'Scholar', desc: '10 Study Sessions', icon: 'fa-graduation-cap', check: () => (data.studyLogs || []).length >= 10 },
            { id: 'xp_1000', name: 'Vanguard', desc: 'Earn 1,000 XP', icon: 'fa-crown', check: () => (data.profile?.totalXp || 0) >= 1000 }
        ];

        list.innerHTML = milestones.map(ach => {
            const unlocked = ach.check();
            return `
                <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
                    <div class="ach-icon"><i class="fas ${ach.icon}"></i></div>
                    <div class="ach-text">
                        <strong>${ach.name}</strong>
                        <p>${ach.desc}</p>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Utility: Standardized Chart creation with automatic destruction
     */
    _renderChart(canvasId, config) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Prevent memory leaks: Destroy previous instance before creating a new one
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        this.charts[canvasId] = new Chart(ctx, config);
    }
};