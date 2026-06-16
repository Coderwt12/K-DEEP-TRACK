const K_Dashboard = {
    template: `
    <div class="os-container view-animate">
        <!-- HERO -->
        <section class="hero-command glass-v2 tilt-card">
            <div class="hero-content">
                <div class="welcome-text">
                    <span class="status-pill"><i class="fas fa-satellite-dish"></i> SYSTEM ONLINE</span>
                    <h1 id="hero-welcome">WELCOME, VANGUARD</h1>
                    <p class="quote">"Discipline is the bridge between goals and accomplishment."</p>
                </div>
                <div class="hero-actions">
                    <div class="daily-mission-card glass-inset">
                        <div class="mission-header">
                            <span>DAILY MISSION</span>
                            <span id="mission-percent" class="accent">0%</span>
                        </div>
                        <div class="mission-bar-bg">
                            <div id="mission-bar-fill" class="mission-bar-fill"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- METRICS -->
        <section class="metric-hub">
            <div class="os-card glass-v2 tilt-card evolution-card">
                <div class="card-label">EVOLUTION PHASE</div>
                <div class="level-display">
                    <span class="lvl-tag">LVL</span>
                    <span id="dash-level" class="lvl-value">01</span>
                </div>
                <div class="xp-stats">
                    <div class="xp-numeric">
                        <span id="dash-xp-current">0</span>
                        <span class="text-dim">/</span>
                        <span class="text-dim" id="dash-xp-needed">1000 XP</span>
                    </div>
                    <div class="xp-progress-container">
                        <div id="dash-xp-bar" class="xp-progress-fill"></div>
                    </div>
                </div>
            </div>

            <div class="os-card glass-v2 tilt-card metric-card">
                <div class="metric-icon streak-glow"><i class="fas fa-fire"></i></div>
                <div class="metric-data">
                    <span class="label">STREAK</span>
                    <h2 id="dash-streak">0</h2>
                    <span class="sub-label">DAYS ACTIVE</span>
                </div>
            </div>

            <div class="os-card glass-v2 tilt-card metric-card">
                <div class="metric-icon focus-glow"><i class="fas fa-stopwatch"></i></div>
                <div class="metric-data">
                    <span class="label">FOCUS</span>
                    <h2 id="dash-study">0h 0m</h2>
                    <span class="sub-label">TIME TODAY</span>
                </div>
            </div>
        </section>

        <!-- WEEKLY + BADGES -->
        <section class="data-grid">
            <div class="os-card glass-v2 tilt-card chart-section">
                <div class="section-header">
                    <h3><i class="fas fa-chart-area accent"></i> WEEKLY FOCUS</h3>
                </div>
                <div class="bar-chart" id="weekly-xp-chart"></div>
            </div>

            <div class="os-card glass-v2 tilt-card achievement-section">
                <div class="section-header">
                    <h3><i class="fas fa-award accent"></i> ACHIEVEMENTS</h3>
                </div>
                <div class="badge-mini-list" id="dash-badges"></div>
            </div>
        </section>
    </div>`,

    init() {
        this.renderStats();
        this.renderWeeklyChart();
    },

    renderStats() {
        const data = K_Storage.getData();
        const today = new Date().toISOString().split('T')[0];

        document.getElementById("hero-welcome").innerText = `WELCOME, ${data.profile.name.toUpperCase()}`;

        const xpProgress = K_Engine.getXpProgress(data.profile.totalXp);
        document.getElementById("dash-level").innerText = data.profile.level.toString().padStart(2, "0");
        document.getElementById("dash-xp-current").innerText = Math.floor(xpProgress.currentLevelXp);
        document.getElementById("dash-xp-needed").innerText = `${xpProgress.neededXp} XP`;
        document.getElementById("dash-xp-bar").style.width = `${xpProgress.percentage}%`;
        document.getElementById("dash-streak").innerText = data.profile.streak;

        const mins = data.studyLogs
            .filter(log => log.timestamp.split("T")[0] === today)
            .reduce((a, b) => a + b.duration, 0);

        document.getElementById("dash-study").innerText = `${Math.floor(mins / 60)}h ${mins % 60}m`;

        const badgeContainer = document.getElementById("dash-badges");
        if (data.profile.badges.length === 0) {
            badgeContainer.innerHTML = `<p class="text-dim">No badges unlocked.</p>`;
        } else {
            badgeContainer.innerHTML = data.profile.badges.slice(-4).map(id => {
                const badge = K_Gamification.badges.find(b => b.id === id);
                return `<div class="mini-badge-item" title="${badge.name}"><i class="fas ${badge.icon}" style="color:${badge.color}"></i></div>`;
            }).join("");
        }
    },

    renderWeeklyChart() {
        const data = K_Storage.getData();
        const chart = document.getElementById("weekly-xp-chart");
        if (!chart) return;

        const durations = [0, 0, 0, 0, 0, 0, 0];
        const labels = ["M", "T", "W", "T", "F", "S", "S"];
        const today = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

        data.studyLogs.forEach(log => {
            const d = new Date(log.timestamp);
            let day = d.getDay() === 0 ? 6 : d.getDay() - 1;
            durations[day] += log.duration;
        });

        const max = Math.max(...durations, 1);
        chart.innerHTML = durations.map((dur, i) => {
            const height = dur === 0 ? 10 : (dur / max) * 100;
            return `
                <div class="chart-column">
                    <div class="bar ${i === today ? "active" : ""}" style="height:${height}%"></div>
                    <span>${labels[i]}</span>
                </div>`;
        }).join("");
    }
};