/**
 * K-DEEP XP - DASHBOARD MODULE
 * Optimized Production Version
 * Handles real-time stat rendering and weekly activity visualization.
 */

const K_Dashboard = {
    // UI Template preserved with original structure and cyberpunk styling
    template: `
    <div class="os-container view-animate">
        <!-- HERO COMMAND CENTER -->
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

        <!-- CORE METRICS HUB -->
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

        <!-- ANALYTICS & ACHIEVEMENTS GRID -->
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

    /**
     * Entry point for the dashboard module
     */
    init() {
        this.renderStats();
        this.renderWeeklyChart();
    },

    /**
     * Renders numeric stats, welcome message, and badges
     */
    renderStats() {
        const data = K_Storage.getData();
        if (!data) return;

        const today = new Date().toISOString().split('T')[0];
        const { profile, studyLogs, habits } = data;

        // 1. Welcome & Basic Identity
        const welcomeEl = document.getElementById("hero-welcome");
        if (welcomeEl) welcomeEl.innerText = `WELCOME, ${profile.name.toUpperCase()}`;

        // 2. XP & Leveling Logic
        const xpProgress = K_Engine.getXpProgress(profile.totalXp);
        const levelEl = document.getElementById("dash-level");
        const xpCurrEl = document.getElementById("dash-xp-current");
        const xpNeedEl = document.getElementById("dash-xp-needed");
        const xpBarEl = document.getElementById("dash-xp-bar");

        if (levelEl) levelEl.innerText = profile.level.toString().padStart(2, "0");
        if (xpCurrEl) xpCurrEl.innerText = Math.floor(xpProgress.currentLevelXp);
        if (xpNeedEl) xpNeedEl.innerText = `${xpProgress.neededXp} XP`;
        if (xpBarEl) xpBarEl.style.width = `${xpProgress.percentage}%`;

        // 3. Streak
        const streakEl = document.getElementById("dash-streak");
        if (streakEl) streakEl.innerText = profile.streak;

        // 4. Focus Time Logic (Today's Total)
        const mins = studyLogs
            .filter(log => log.timestamp.split("T")[0] === today)
            .reduce((total, log) => total + log.duration, 0);

        const studyEl = document.getElementById("dash-study");
        if (studyEl) studyEl.innerText = `${Math.floor(mins / 60)}h ${mins % 60}m`;

        // 5. Daily Mission Logic (Habit Completion)
        const totalHabits = habits.length;
        const doneToday = habits.filter(h => h.completedDates.includes(today)).length;
        const missionPercent = totalHabits > 0 ? Math.round((doneToday / totalHabits) * 100) : 0;
        
        const missionPercEl = document.getElementById("mission-percent");
        const missionBarEl = document.getElementById("mission-bar-fill");
        if (missionPercEl) missionPercEl.innerText = `${missionPercent}%`;
        if (missionBarEl) missionBarEl.style.width = `${missionPercent}%`;

        // 6. Badges (Show last 4 recent)
        const badgeContainer = document.getElementById("dash-badges");
        if (badgeContainer) {
            if (profile.badges.length === 0) {
                badgeContainer.innerHTML = `<p class="text-dim">No badges unlocked.</p>`;
            } else {
                badgeContainer.innerHTML = profile.badges.slice(-4).map(id => {
                    const badge = K_Gamification.badges.find(b => b.id === id);
                    return badge ? `<div class="mini-badge-item" title="${badge.name}"><i class="fas ${badge.icon}" style="color:${badge.color}"></i></div>` : "";
                }).join("");
            }
        }
    },

    /**
     * Renders the bar chart for the current week's study activity
     */
    renderWeeklyChart() {
        const data = K_Storage.getData();
        const chart = document.getElementById("weekly-xp-chart");
        if (!chart || !data) return;

        const durations = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun
        const labels = ["M", "T", "W", "T", "F", "S", "S"];
        const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

        // Populate durations from logs
        data.studyLogs.forEach(log => {
            const d = new Date(log.timestamp);
            const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
            durations[day] += log.duration;
        });

        const max = Math.max(...durations, 1);
        
        chart.innerHTML = durations.map((dur, i) => {
            const height = dur === 0 ? 10 : (dur / max) * 100;
            return `
                <div class="chart-column">
                    <div class="bar ${i === todayIdx ? "active" : ""}" style="height:${height}%"></div>
                    <span>${labels[i]}</span>
                </div>`;
        }).join("");
    }
};