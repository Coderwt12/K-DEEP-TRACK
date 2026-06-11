/**
 * K-DEEP XP - PREMIUM DASHBOARD OS
 */
const K_Dashboard = {
    template: `
        <div class="os-container view-animate">
            <!-- HERO COMMAND SECTION -->
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

            <!-- METRIC HUB -->
            <section class="metric-hub">
                <div class="os-card glass-v2 tilt-card evolution-card">
                    <div class="card-label">EVOLUTION PHASE</div>
                    <div class="level-display">
                        <span class="lvl-tag">LVL</span>
                        <span id="dash-level" class="lvl-value">01</span>
                    </div>
                    <div class="xp-stats">
                        <div class="xp-numeric">
                            <span id="dash-xp-current">450</span>
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

            <!-- ANALYTICS & ARCHIVE -->
            <section class="data-grid">
                <div class="os-card glass-v2 tilt-card chart-section">
                    <div class="section-header">
                        <h3><i class="fas fa-chart-area accent"></i> WEEKLY PROGRESS</h3>
                        <div class="chart-legend">XP EARNED</div>
                    </div>
                    <div class="bar-chart" id="weekly-xp-chart">
                        <div class="chart-column"><div class="bar" style="height: 15%"></div><span>M</span></div>
                        <div class="chart-column"><div class="bar" style="height: 45%"></div><span>T</span></div>
                        <div class="chart-column"><div class="bar" style="height: 30%"></div><span>W</span></div>
                        <div class="chart-column"><div class="bar active" style="height: 65%"></div><span>T</span></div>
                        <div class="chart-column"><div class="bar" style="height: 20%"></div><span>F</span></div>
                        <div class="chart-column"><div class="bar" style="height: 10%"></div><span>S</span></div>
                        <div class="chart-column"><div class="bar" style="height: 5%"></div><span>S</span></div>
                    </div>
                </div>

                <div class="os-card glass-v2 tilt-card achievement-section">
                    <div class="section-header">
                        <h3><i class="fas fa-award accent"></i> ACHIEVEMENTS</h3>
                        <button class="text-link" onclick="K_App.switchView('analytics')">VIEW ALL</button>
                    </div>
                    <div class="badge-mini-list" id="dash-badges">
                        <!-- Badges injected by JS -->
                    </div>
                </div>
            </section>
        </div>
    `,

    init() {
        this.renderStats();
    },

    renderStats() {
        const data = K_Storage.getData();
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Welcome Message
        document.getElementById('hero-welcome').innerText = `WELCOME, ${data.profile.name.toUpperCase()}`;

        // 2. Evolution Stats (Level & XP)
        const xpProgress = K_Engine.getXpProgress(data.profile.totalXp);
        document.getElementById('dash-level').innerText = data.profile.level.toString().padStart(2, '0');
        document.getElementById('dash-xp-current').innerText = Math.floor(xpProgress.currentLevelXp);
        document.getElementById('dash-xp-needed').innerText = `${xpProgress.neededXp} XP`;
        document.getElementById('dash-xp-bar').style.width = `${xpProgress.percentage}%`;

        // 3. Streak
        document.getElementById('dash-streak').innerText = data.profile.streak;

        // 4. Study Time Today
        const studyTodayMins = data.studyLogs
            .filter(log => log.timestamp.split('T')[0] === today)
            .reduce((acc, curr) => acc + curr.duration, 0);
        const hours = Math.floor(studyTodayMins / 60);
        const mins = studyTodayMins % 60;
        document.getElementById('dash-study').innerText = `${hours}h ${mins}m`;

        // 5. Daily Mission (Habits)
        const totalHabits = data.habits.length;
        const completedHabits = data.habits.filter(h => h.completedDates.includes(today)).length;
        const missionPercent = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;
        document.getElementById('mission-percent').innerText = `${missionPercent}%`;
        document.getElementById('mission-bar-fill').style.width = `${missionPercent}%`;

        // 6. Achievements Mini List
        const badgeContainer = document.getElementById('dash-badges');
        if (data.profile.badges.length === 0) {
            badgeContainer.innerHTML = `<p class="text-dim">No badges earned yet.</p>`;
        } else {
            const lastThreeBadges = data.profile.badges.slice(-3);
            badgeContainer.innerHTML = lastThreeBadges.map(bId => {
                const badge = K_Gamification.badges.find(b => b.id === bId);
                return `
                    <div class="mini-badge-item" title="${badge.name}">
                        <i class="fas ${badge.icon}" style="color: ${badge.color}"></i>
                    </div>
                `;
            }).join('');
        }
    }
};