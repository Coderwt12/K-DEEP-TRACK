/**
 * K-DEEP XP - PREMIUM ANALYTICS ENGINE
 */
const K_Analytics = {
    charts: {}, // Store chart instances to destroy/recreate

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

    init() {
        const data = K_Storage.getData();
        this.renderStats(data);
        this.initWeeklyXPChart(data);
        this.initSubjectChart(data);
        this.initHabitChart(data);
        this.renderHeatmap(data);
        this.renderAchievements(data);
    },

    renderStats(data) {
        const totalStudyMins = data.studyLogs.reduce((acc, log) => acc + log.duration, 0);
        const totalHabitsCompleted = data.habits.reduce((acc, habit) => acc + habit.completedDates.length, 0);

        document.getElementById('total-xp-stat').innerText = data.profile.totalXp.toLocaleString();
        document.getElementById('total-study-stat').innerText = `${Math.floor(totalStudyMins / 60)}h`;
        document.getElementById('total-habits-stat').innerText = totalHabitsCompleted;
        document.getElementById('current-streak-stat').innerText = data.profile.streak;
    },

    initWeeklyXPChart(data) {
        const ctx = document.getElementById('weeklyXpChart').getContext('2d');
        if (this.charts.xp) this.charts.xp.destroy();

        // Get last 7 days dates and XP
        const labels = [];
        const xpData = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

            // Aggregate XP from study and habits for that day
            const dayStudyXp = data.studyLogs
                .filter(l => l.timestamp.startsWith(dateStr))
                .reduce((acc, curr) => acc + curr.xpEarned, 0);
            
            // Note: In local-first V1, we estimate habit XP (50 per completion)
            const dayHabitXp = data.habits
                .filter(h => h.completedDates.includes(dateStr)).length * 50;

            xpData.push(dayStudyXp + dayHabitXp);
        }

        this.charts.xp = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
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

    initSubjectChart(data) {
        const ctx = document.getElementById('subjectChart').getContext('2d');
        if (this.charts.subject) this.charts.subject.destroy();

        const subjects = ['Physics', 'Chemistry', 'Maths', 'English'];
        const hours = subjects.map(sub => {
            const mins = data.studyLogs
                .filter(l => l.subject === sub)
                .reduce((acc, curr) => acc + curr.duration, 0);
            return (mins / 60).toFixed(1);
        });

        this.charts.subject = new Chart(ctx, {
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

    initHabitChart(data) {
        const ctx = document.getElementById('habitDoughnutChart').getContext('2d');
        if (this.charts.habit) this.charts.habit.destroy();

        const today = new Date().toISOString().split('T')[0];
        const completed = data.habits.filter(h => h.completedDates.includes(today)).length;
        const missed = Math.max(0, data.habits.length - completed);

        this.charts.habit = new Chart(ctx, {
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

    renderHeatmap(data) {
        const container = document.getElementById('heatmap-container');
        container.innerHTML = '';
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // Calculate Activity Score
            const studyCount = data.studyLogs.filter(l => l.timestamp.startsWith(dateStr)).length;
            const habitCount = data.habits.filter(h => h.completedDates.includes(dateStr)).length;
            const score = studyCount + habitCount;

            let intensity = 0;
            if (score > 0) intensity = 1;
            if (score > 2) intensity = 2;
            if (score > 4) intensity = 3;
            if (score > 6) intensity = 4;

            const box = document.createElement('div');
            box.className = `heatmap-box intensity-${intensity}`;
            box.title = `${dateStr}: ${score} Activities`;
            container.appendChild(box);
        }
    },

    renderAchievements(data) {
        const list = document.getElementById('achievement-list');
        const achievements = [
            { id: 'first_habit', name: 'Initiate', desc: 'First Habit Done', icon: 'fa-seedling', check: () => data.habits.some(h => h.completedDates.length > 0) },
            { id: 'streak_7', name: 'Disciplined', desc: '7 Day Streak', icon: 'fa-fire', check: () => data.profile.streak >= 7 },
            { id: 'study_10', name: 'Scholar', desc: '10 Study Sessions', icon: 'fa-graduation-cap', check: () => data.studyLogs.length >= 10 },
            { id: 'xp_1000', name: 'Vanguard', desc: 'Earn 1,000 XP', icon: 'fa-crown', check: () => data.profile.totalXp >= 1000 }
        ];

        list.innerHTML = achievements.map(ach => {
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
    }
};