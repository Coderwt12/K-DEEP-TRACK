/**
 * STUDY MODULE
 */
const K_Study = {
    timerInterval: null,
    timeLeft: 25 * 60, // Default 25 mins
    isRunning: false,
    selectedSubject: 'General',

    template: `
        <div class="study-wrapper">
            <div class="view-header">
                <h1>Study Zone</h1>
                <div class="subject-picker">
                    <select id="subject-select" class="glass-input">
                        <option value="Programming">Programming</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Design">Design</option>
                        <option value="Exam Prep">Exam Prep</option>
                        <option value="General">General</option>
                    </select>
                </div>
            </div>

            <div class="timer-container glass">
                <div class="timer-display" id="timer-display">25:00</div>
                <div class="timer-controls">
                    <button id="start-timer" class="btn-primary" onclick="K_Study.toggleTimer()">START</button>
                    <button id="reset-timer" class="btn-secondary" onclick="K_Study.resetTimer()">RESET</button>
                </div>
                <div class="timer-modes">
                    <button onclick="K_Study.setMode(25)">25m</button>
                    <button onclick="K_Study.setMode(50)">50m</button>
                    <button onclick="K_Study.setMode(5)">Break</button>
                </div>
            </div>

            <div class="history-section glass">
                <h3>Recent Sessions</h3>
                <div id="study-history-list" class="history-list"></div>
            </div>
        </div>
    `,

    init() {
        this.renderHistory();
        this.updateTimerDisplay();
    },

    setMode(mins) {
        this.stopTimer();
        this.timeLeft = mins * 60;
        this.updateTimerDisplay();
    },

    toggleTimer() {
        if (this.isRunning) {
            this.stopTimer();
        } else {
            this.startTimer();
        }
    },

    startTimer() {
        this.isRunning = true;
        document.getElementById('start-timer').innerText = "PAUSE";
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                this.completeSession();
            }
        }, 1000);
    },

    stopTimer() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        document.getElementById('start-timer').innerText = "START";
    },

    resetTimer() {
        this.stopTimer();
        this.timeLeft = 25 * 60;
        this.updateTimerDisplay();
    },

    updateTimerDisplay() {
        const mins = Math.floor(this.timeLeft / 60);
        const secs = this.timeLeft % 60;
        const display = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        document.getElementById('timer-display').innerText = display;
    },

    completeSession() {
        this.stopTimer();
        const subject = document.getElementById('subject-select').value;
        const durationMins = 25; // Logic: calculate based on mode
        const xpAmount = durationMins * 2; // 2 XP per minute

        K_Storage.addStudyLog({
            subject: subject,
            duration: durationMins,
            xpEarned: xpAmount
        });

        K_Engine.addXP(xpAmount);
        alert(`Session Complete! You earned ${xpAmount} XP.`);
        
        // Dispatch Global UI Update
        const xpEvent = new CustomEvent('xpGain', { 
            detail: { amount: xpAmount, x: window.innerWidth / 2, y: window.innerHeight / 2 } 
        });
        window.dispatchEvent(xpEvent);

        this.renderHistory();
        this.resetTimer();
    },

    renderHistory() {
        const logs = K_Storage.getData().studyLogs.slice().reverse().slice(0, 5);
        const container = document.getElementById('study-history-list');
        
        if (logs.length === 0) {
            container.innerHTML = `<p class="text-dim">No sessions logged yet.</p>`;
            return;
        }

        container.innerHTML = logs.map(log => `
            <div class="history-item">
                <span>${log.subject}</span>
                <span>${log.duration} mins</span>
                <span class="accent">+${log.xpEarned} XP</span>
            </div>
        `).join('');
    }
};