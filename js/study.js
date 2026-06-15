/**
 * K-DEEP XP - PREMIUM STUDY ZONE (FOCUS OS)
 */
const K_Study = {
    timerInterval: null,
    timeLeft: 1500, // Default 25 mins
    isRunning: false,
    currentSubject: 'Physics',
    sessionStartTime: null,
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

    init() {
        this.renderStats();
        this.updateTimerDisplay();
    },

    setSubject(sub, el) {
        this.currentSubject = sub;
        document.querySelectorAll('.sub-pill').forEach(b => b.classList.remove('active'));
        el.classList.add('active');
    },

    setMode(mode) {
        if(this.isRunning) return;
        if(mode === 'pomodoro') this.timeLeft = 25 * 60;
        if(mode === 'deepwork') this.timeLeft = 50 * 60;
        if(mode === 'marathon') this.timeLeft = 90 * 60;
        this.updateTimerDisplay();
    },

    toggleTimer() {
        const btn = document.getElementById('btn-start');
        const stopBtn = document.getElementById('btn-stop');

        if (this.isRunning) {
            // PAUSE
            clearInterval(this.timerInterval);
            this.isRunning = false;
            btn.innerHTML = `<i class="fas fa-play"></i> RESUME`;
            document.getElementById('timer-status').innerText = "PAUSED";
        } else {
            // START
            this.isRunning = true;
            this.sessionStartTime = new Date();
            btn.innerHTML = `<i class="fas fa-pause"></i> PAUSE`;
            stopBtn.classList.remove('hidden');
            document.getElementById('timer-status').innerText = `FOCUSING ON ${this.currentSubject.toUpperCase()}`;
            
            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                this.totalSecondsElapsed++;
                this.updateTimerDisplay();
                if (this.timeLeft <= 0) this.stopTimer();
            }, 1000);
        }
    },

    updateTimerDisplay() {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        document.getElementById('main-timer').innerText = 
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    stopTimer() {
        clearInterval(this.timerInterval);
        const minutesStudied = Math.floor(this.totalSecondsElapsed / 60);
        
        if (minutesStudied > 0) {
            this.saveSession(minutesStudied);
        }

        // Reset UI
        this.isRunning = false;
        this.totalSecondsElapsed = 0;
        this.timeLeft = 1500;
        document.getElementById('btn-start').innerHTML = `<i class="fas fa-play"></i> START SESSION`;
        document.getElementById('btn-stop').classList.add('hidden');
        document.getElementById('timer-status').innerText = "SESSION COMPLETE";
        this.updateTimerDisplay();
        this.renderStats();
    },

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

        data.studyLogs.push(newLog);
        K_Storage.save(data);
        
        // XP Reward Logic
        if(window.K_Engine) K_Engine.addXP(xpEarned);
        
        // Popup
        if(window.K_App && K_App.showXpPopup) {
            K_App.showXpPopup(xpEarned, window.innerWidth/2, window.innerHeight/2);
        }
        
        alert(`Great Work! You studied ${this.currentSubject} for ${mins} mins and earned ${xpEarned} XP.`);
    },

    renderStats() {
        const data = K_Storage.getData();
        const logs = data.studyLogs || [];
        const today = new Date().toISOString().split('T')[0];
        
        const todayLogs = logs.filter(l => l.timestamp.split('T')[0] === today);
        const todayMins = todayLogs.reduce((acc, curr) => acc + curr.duration, 0);
        const totalXP = logs.reduce((acc, curr) => acc + curr.xpEarned, 0);
        
        document.getElementById('stat-today-time').innerText = `${Math.floor(todayMins/60)}h ${todayMins%60}m`;
        document.getElementById('stat-total-sessions').innerText = logs.length;
        document.getElementById('stat-study-xp').innerText = totalXP;

        
    }
};