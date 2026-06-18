/**
 * K-DEEP XP - PREMIUM STUDY ZONE (FOCUS OS)
 * Optimized Production Version
 * Handles Pomodoro timers, subject tracking, and focus session logging.
 */
const K_Study = {
    timerInterval: null,
    timeLeft: 1500, // Default 25 mins
    isRunning: false,
    currentSubject: 'Physics',
    totalSecondsElapsed: 0,

    template: `
        <div class="study-view-container view-animate">
            <!-- TOP ANALYTICS PREVIEW -->
            <div class="study-stats-grid">
                <div class="mini-stat-card glass-v2">
                    <span class="label">TODAY'S FOCUS</span>
                    <h3 id="stat-today-time">0h 0m</h3>
                </div>
                <div class="mini-stat-card glass-v2">
                    <span class="label">TOTAL SESSIONS</span>
                    <h3 id="stat-total-sessions">0</h3>
                </div>
                <div class="mini-stat-card glass-v2">
                    <span class="label">STUDY XP</span>
                    <h3 id="stat-study-xp">0</h3>
                </div>
            </div>

            <!-- DYNAMIC ISLAND TIMER -->
            <section class="timer-section glass-v2">
                <div class="subject-selector">
                    <button class="sub-pill active" onclick="K_Study.setSubject('Physics', this)">Physics</button>
                    <button class="sub-pill" onclick="K_Study.setSubject('Chemistry', this)">Chemistry</button>
                    <button class="sub-pill" onclick="K_Study.setSubject('Maths', this)">Maths</button>
                    <button class="sub-pill" onclick="K_Study.setSubject('English', this)">English</button>
                    <button class="sub-pill" onclick="K_Study.setSubject('Custom', this)">Custom</button>
                </div>

                <div class="dynamic-island-timer">
                    <div class="timer-display" id="main-timer">25:00</div>
                    <div class="timer-label" id="timer-status">READY TO FOCUS</div>
                </div>

                <div class="timer-controls">
                    <button id="btn-start" class="btn-primary main-ctrl" onclick="K_Study.toggleTimer()">
                        <i class="fas fa-play"></i> START SESSION
                    </button>
                    <button id="btn-stop" class="btn-secondary stop-ctrl hidden" onclick="K_Study.stopTimer()">
                        <i class="fas fa-stop"></i>
                    </button>
                </div>
            </section>

            <!-- FOCUS MODES -->
            <section class="focus-modes-grid">
                <div class="mode-card glass-v2" onclick="K_Study.setMode('pomodoro')">
                    <i class="fas fa-apple-alt"></i>
                    <h4>Pomodoro</h4>
                    <small>25 / 5 min</small>
                </div>
                <div class="mode-card glass-v2" onclick="K_Study.setMode('deepwork')">
                    <i class="fas fa-brain"></i>
                    <h4>Deep Work</h4>
                    <small>50 / 10 min</small>
                </div>
                <div class="mode-card glass-v2" onclick="K_Study.setMode('marathon')">
                    <i class="fas fa-infinity"></i>
                    <h4>Marathon</h4>
                    <small>90 / 15 min</small>
                </div>
            </section>
        </div>
    `,

    /**
     * Initializes the Study module
     */
    init() {
        this.renderStats();
        this.updateTimerDisplay();
    },

    /**
     * Sets the active subject for the session
     */
    setSubject(sub, el) {
        this.currentSubject = sub;
        const pills = document.querySelectorAll('.sub-pill');
        pills.forEach(b => b.classList.remove('active'));
        if (el) el.classList.add('active');
    },

    /**
     * Sets the timer duration based on focus mode
     */
    setMode(mode) {
        if (this.isRunning) return;
        
        const modes = {
            'pomodoro': 25 * 60,
            'deepwork': 50 * 60,
            'marathon': 90 * 60
        };

        this.timeLeft = modes[mode] || 1500;
        this.updateTimerDisplay();
    },

    /**
     * Handles Start/Pause logic
     */
    toggleTimer() {
        const btn = document.getElementById('btn-start');
        const stopBtn = document.getElementById('btn-stop');
        const statusLabel = document.getElementById('timer-status');

        if (this.isRunning) {
            // PAUSE SESSION
            clearInterval(this.timerInterval);
            this.isRunning = false;
            if (btn) btn.innerHTML = `<i class="fas fa-play"></i> RESUME`;
            if (statusLabel) statusLabel.innerText = "PAUSED";
        } else {
            // START/RESUME SESSION
            this.isRunning = true;
            if (btn) btn.innerHTML = `<i class="fas fa-pause"></i> PAUSE`;
            if (stopBtn) stopBtn.classList.remove('hidden');
            if (statusLabel) statusLabel.innerText = `FOCUSING ON ${this.currentSubject.toUpperCase()}`;
            
            this.timerInterval = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                    this.totalSecondsElapsed++;
                    this.updateTimerDisplay();
                } else {
                    this.stopTimer();
                }
            }, 1000);
        }
    },

    /**
     * Updates the clock UI (MM:SS)
     */
    updateTimerDisplay() {
        const timerEl = document.getElementById('main-timer');
        if (!timerEl) return;

        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        timerEl.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Ends the session, calculates XP, and resets state
     */
    stopTimer() {
        clearInterval(this.timerInterval);
        const minutesStudied = Math.floor(this.totalSecondsElapsed / 60);
        
        if (minutesStudied > 0) {
            this.saveSession(minutesStudied);
        }

        // Reset Logic State
        this.isRunning = false;
        this.totalSecondsElapsed = 0;
        this.timeLeft = 1500; // Reset to default

        // UI Updates
        const btn = document.getElementById('btn-start');
        const stopBtn = document.getElementById('btn-stop');
        const statusLabel = document.getElementById('timer-status');

        if (btn) btn.innerHTML = `<i class="fas fa-play"></i> START SESSION`;
        if (stopBtn) stopBtn.classList.add('hidden');
        if (statusLabel) statusLabel.innerText = minutesStudied > 0 ? "SESSION COMPLETE" : "READY TO FOCUS";
        
        this.updateTimerDisplay();
        this.renderStats();
    },

    /**
     * Persists focus data to storage and rewards user
     */
    saveSession(mins) {
        const xpEarned = mins * 2; // 2 XP per minute
        const data = K_Storage.getData();
        
        const newLog = {
            id: Date.now(),
            subject: this.currentSubject,
            duration: mins,
            xpEarned: xpEarned,
            timestamp: new Date().toISOString()
        };

        if (data.studyLogs) {
            data.studyLogs.push(newLog);
            K_Storage.save(data);
        }
        
        // Reward Engine Integration
        if (typeof K_Engine !== "undefined") {
            K_Engine.addXP(xpEarned);
        }
        
        // UI Feedback
        if (window.K_App && typeof K_App.showXpPopup === "function") {
            K_App.showXpPopup(xpEarned, window.innerWidth / 2, window.innerHeight / 2);
        }
        
        alert(`Great Work! You studied ${this.currentSubject} for ${mins} mins and earned ${xpEarned} XP.`);
    },

    /**
     * Renders numeric stats in the top header
     */
    renderStats() {
        const data = K_Storage.getData();
        if (!data) return;

        const logs = data.studyLogs || [];
        const today = new Date().toISOString().split('T')[0];
        
        const todayLogs = logs.filter(l => l.timestamp && l.timestamp.split('T')[0] === today);
        const todayMins = todayLogs.reduce((acc, curr) => acc + (curr.duration || 0), 0);
        const totalXP = logs.reduce((acc, curr) => acc + (curr.xpEarned || 0), 0);
        
        const timeEl = document.getElementById('stat-today-time');
        const sessEl = document.getElementById('stat-total-sessions');
        const xpEl = document.getElementById('stat-study-xp');

        if (timeEl) timeEl.innerText = `${Math.floor(todayMins / 60)}h ${todayMins % 60}m`;
        if (sessEl) sessEl.innerText = logs.length;
        if (xpEl) xpEl.innerText = totalXP;
    }
};