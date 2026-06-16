/**
 * K-DEEP XP - ANALYTICS ENGINE (ORIGINAL V1)
 */
const K_Analytics = {
    charts: {}, 

    template: `
        <div class="analytics-view-wrapper view-animate">
            <!-- OVERVIEW CARDS -->
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

            <!-- WEEKLY & SUBJECT CHARTS -->
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

            <!-- HABIT DOUGHNUT & HEATMAP -->
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

            <!-- ACHIEVEMENT PANEL -->
            <div class="achievement-panel glass-v2">
                <h3><i class="fas fa-trophy"></i> MILESTONES</h3>
                <div class="achievement-grid" id="achievement-list"></div>
            </div>
        </div>
    `,

    init() {
        const data = K_Storage.getData();
        this.renderStats(data);
        
        // Initialize Charts
        setTimeout(() => {
            this.initWeeklyXPChart(data);
            this.initSubjectChart(data);
            this.initHabitChart(data);
            this.renderHeatmap(data);
            this.renderAchievements(data);
        }, 100);
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

        const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const xpData = [100, 200, 150, 300, 250, 400, 350]; // Sample data for V1

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
                    tension: 0.4
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
        const hours = [5, 3, 8, 4]; // Sample data for V1

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
                plugins: { legend: { display: false } }
            }
        });
    },

    initHabitChart(data) {
        const ctx = document.getElementById('habitDoughnutChart').getContext('2d');
        if (this.charts.habit) this.charts.habit.destroy();

        this.charts.habit = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Missed'],
                datasets: [{
                    data: [70, 30],
                    backgroundColor: ['#10b981', 'rgba(255,255,255,0.05)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: '80%',
                plugins: { legend: { position: 'bottom' } }
            }
        });
    },

    renderHeatmap(data) {
        const container = document.getElementById('heatmap-container');
        container.innerHTML = '';
        for (let i = 0; i < 30; i++) {
            const box = document.createElement('div');
            box.className = `heatmap-box intensity-${Math.floor(Math.random() * 5)}`;
            container.appendChild(box);
        }
    },

    renderAchievements(data) {
        const list = document.getElementById('achievement-list');
        const achievements = [
            { id: 'first_habit', name: 'Initiate', desc: 'First Habit Done', icon: 'fa-seedling' },
            { id: 'streak_7', name: 'Disciplined', desc: '7 Day Streak', icon: 'fa-fire' },
            { id: 'study_10', name: 'Scholar', desc: '10 Study Sessions', icon: 'fa-graduation-cap' },
            { id: 'xp_1000', name: 'Vanguard', desc: 'Earn 1,000 XP', icon: 'fa-crown' }
        ];

        list.innerHTML = achievements.map(ach => `
            <div class="achievement-item unlocked">
                <div class="ach-icon"><i class="fas ${ach.icon}"></i></div>
                <div class="ach-text">
                    <strong>${ach.name}</strong>
                    <p>${ach.desc}</p>
                </div>
            </div>
        `).join('');
    }
};