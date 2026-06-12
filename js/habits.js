/**
 * K-DEEP XP - PREMIUM HABITS MODULE
 */
const K_Habits = {
    template: `
        <div class="habits-view-wrapper view-animate">
            <!-- HEADER: PERFORMANCE SUMMARY -->
            <header class="habits-summary glass-v2">
                <div class="summary-main">
                    <div class="progress-ring-container">
                        <svg class="progress-ring" width="120" height="120">
                            <circle class="progress-ring__circle-bg" stroke="rgba(255,255,255,0.05)" stroke-width="8" fill="transparent" r="52" cx="60" cy="60"/>
                            <circle id="habit-master-progress" class="progress-ring__circle" stroke="var(--accent-cyan)" stroke-width="8" stroke-dasharray="326.72" stroke-dashoffset="326.72" stroke-linecap="round" fill="transparent" r="52" cx="60" cy="60"/>
                        </svg>
                        <div class="progress-text">
                            <span id="percent-val">0%</span>
                            <small>TODAY</small>
                        </div>
                    </div>
                    <div class="summary-stats">
                        <div class="stat-item">
                            <span class="label">TOTAL HABITS</span>
                            <span id="stat-total" class="value">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">COMPLETED</span>
                            <span id="stat-done" class="value">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="label">BEST STREAK</span>
                            <span id="stat-streak" class="value">0</span>
                        </div>
                    </div>
                </div>
                <button class="btn-primary add-habit-btn" onclick="K_Habits.showAddModal()">
                    <i class="fas fa-plus"></i> NEW HABIT
                </button>
            </header>

            <!-- WEEKLY CONSISTENCY -->
            <section class="consistency-area glass-v2">
                <h3>WEEKLY CONSISTENCY</h3>
                <div class="weekly-dots" id="weekly-dots-container">
                    <!-- Dots injected by JS -->
                </div>
            </section>

            <!-- HABIT GRID -->
            <section class="habit-grid" id="habit-list-container">
                <!-- Cards injected by JS -->
            </section>
        </div>
    `,

    init() {
        this.render();
    },

    render() {
        const data = K_Storage.getData();
        const habits = data.habits || [];
        const today = new Date().toISOString().split('T')[0];

        // Calculate Stats
        const total = habits.length;
        const doneToday = habits.filter(h => h.completedDates.includes(today)).length;
        const percent = total > 0 ? Math.round((doneToday / total) * 100) : 0;
        const maxStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0)) : 0;

        // 1. Update Stats UI
        document.getElementById('stat-total').innerText = total;
        document.getElementById('stat-done').innerText = doneToday;
        document.getElementById('stat-streak').innerText = maxStreak;
        document.getElementById('percent-val').innerText = `${percent}%`;

        // 2. Update Circular Progress
        const circle = document.getElementById('habit-master-progress');
        const circumference = 52 * 2 * Math.PI;
        const offset = circumference - (percent / 100 * circumference);
        circle.style.strokeDashoffset = offset;

        // 3. Render Weekly Dots
        this.renderWeeklyDots(habits);

        // 4. Render Habit Cards
        const container = document.getElementById('habit-list-container');
        if (habits.length === 0) {
            container.innerHTML = `<div class="empty-state">No habits tracked. Start your evolution today.</div>`;
            return;
        }

        container.innerHTML = habits.map(habit => {
            const isDone = habit.completedDates.includes(today);
            return `
                <div class="habit-card-v2 glass-v2 ${isDone ? 'is-completed' : ''}" onclick="K_Habits.toggleHabit(${habit.id}, event)">
             
                <button class="habit-delete-btn"
                onclick="K_Habits.deleteHabit(${habit.id}, event)"
                title="Delete Habit">
                  <i class="fas fa-trash-alt"></i>
                </button>
                    <div class="habit-card-body">
                        <div class="habit-info">
                            <div class="habit-icon-wrap" style="background: ${habit.color}20; color: ${habit.color}">
                                <i class="fas fa-${habit.icon || 'bolt'}"></i>
                            </div>
                            <div class="habit-details">
                                <h4>${habit.name}</h4>
                                <div class="habit-meta">
                                    <span class="streak-tag"><i class="fas fa-fire"></i> ${habit.streak} DAY STREAK</span>
                                    <span class="xp-tag">+50 XP</span>
                                </div>
                            </div>
                        </div>
                        <div class="habit-status-icon">
                            <i class="fas ${isDone ? 'fa-check-circle' : 'fa-circle-notch'}"></i>
                        </div>
                    </div>
                    <div class="habit-card-glow" style="background: ${habit.color}"></div>
                </div>
            `;
        }).join('');
    },

    renderWeeklyDots(habits) {
        const container = document.getElementById('weekly-dots-container');
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const today = new Date();
        let html = '';

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const wasProductive = habits.some(h => h.completedDates.includes(dateStr));

            html += `
                <div class="day-dot-wrap">
                    <div class="day-dot ${wasProductive ? 'active' : ''}"></div>
                    <span>${days[d.getDay()]}</span>
                </div>
            `;
        }
        container.innerHTML = html;
    },

    toggleHabit(id, event) {
        const data = K_Storage.getData();
        const habit = data.habits.find(h => h.id === id);
        const today = new Date().toISOString().split('T')[0];
        const index = habit.completedDates.indexOf(today);

        if (index === -1) {
            // Mark Completed
            habit.completedDates.push(today);
            habit.streak = (habit.streak || 0) + 1;

            // Trigger Reward XP
            K_Engine.addXP(50);

            // Visual feedback
            if (window.K_App && K_App.showXpPopup) {
                K_App.showXpPopup(50, event.clientX, event.clientY);
            }
            if (window.K_Gamification) K_Gamification.playSound('success');
        } else {
            // Uncheck
            habit.completedDates.splice(index, 1);
            habit.streak = Math.max(0, habit.streak - 1);
        }

        K_Storage.save(data);
        this.render();
    },

    deleteHabit(id, event) {
        event.stopPropagation();

        const confirmDelete = confirm(
            "Delete this habit permanently?"
        );

        if (!confirmDelete) return;

        const data = K_Storage.getData();

        data.habits = data.habits.filter(
            h => h.id !== id
        );

        K_Storage.save(data);

        this.render();
    },

    showAddModal() {
        const name = prompt("Habit Name:");
        if (!name) return;

        const data = K_Storage.getData();
        const newHabit = {
            id: Date.now(),
            name: name,
            icon: 'star',
            color: '#06b6d4',
            streak: 0,
            completedDates: [],
            createdAt: new Date().toISOString()
        };

        data.habits.push(newHabit);
        K_Storage.save(data);
        this.render();
    }
};