/**
 * ANALYTICS MODULE
 */
const K_Analytics = {
    template: `
        <div class="analytics-wrapper">
            <div class="view-header">
                <h1>Growth Analytics</h1>
            </div>

            <div class="analytics-grid">
                <div class="glass chart-container">
                    <h3>Study Consistency (Last 7 Logs)</h3>
                    <div class="chart-y-axis" id="study-chart"></div>
                </div>

                <div class="glass stats-summary">
                    <h3>Performance Metrics</h3>
                    <div id="metrics-list"></div>
                </div>
            </div>

            <div class="glass badges-grid-view">
                <h3>Achievements Archive</h3>
                <div id="full-badge-list" class="badge-gallery"></div>
            </div>
        </div>
    `,

    init() {
        this.renderStudyChart();
        this.renderMetrics();
        this.renderBadgeGallery();
    },

    renderStudyChart() {
        const data = K_Storage.getData();
        const logs = data.studyLogs.slice(-7);
        const container = document.getElementById('study-chart');
        
        if (logs.length === 0) {
            container.innerHTML = `<p class="text-dim">Insufficient data for charting.</p>`;
            return;
        }

        const maxDuration = Math.max(...logs.map(l => l.duration));
        container.innerHTML = logs.map(l => `
            <div class="chart-col">
                <div class="bar" style="height: ${(l.duration / maxDuration) * 100}%">
                    <span class="bar-val">${l.duration}m</span>
                </div>
                <span class="bar-label">${l.subject.substring(0,3)}</span>
            </div>
        `).join('');
    },

    renderMetrics() {
        const data = K_Storage.getData();
        const totalStudy = data.studyLogs.reduce((acc, l) => acc + l.duration, 0);
        const habitCompletionRate = data.habits.length > 0 
            ? Math.round((data.habits.reduce((acc, h) => acc + h.completedDates.length, 0) / (data.habits.length * 7)) * 100) 
            : 0;

        document.getElementById('metrics-list').innerHTML = `
            <div class="metric-item"><span>Total Study Hours:</span> <span class="accent">${(totalStudy/60).toFixed(1)}h</span></div>
            <div class="metric-item"><span>Habit Discipline:</span> <span class="accent">${habitCompletionRate}%</span></div>
            <div class="metric-item"><span>Total XP Earned:</span> <span class="accent">${data.profile.totalXp}</span></div>
            <div class="metric-item"><span>Journaling Consistency:</span> <span class="accent">${data.journal.length} Days</span></div>
        `;
    },

    renderBadgeGallery() {
        const data = K_Storage.getData();
        const container = document.getElementById('full-badge-list');
        
        container.innerHTML = K_Gamification.badges.map(badge => {
            const isUnlocked = data.profile.badges.includes(badge.id);
            return `
                <div class="badge-item ${isUnlocked ? '' : 'locked'}" style="--badge-clr: ${badge.color}">
                    <i class="fas ${badge.icon}"></i>
                    <div class="badge-tip">
                        <strong>${badge.name}</strong>
                        <p>${badge.desc}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
};