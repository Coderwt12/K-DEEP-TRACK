/**
 * K-DEEP XP - PREMIUM HABITS MODULE
 * Optimized Production Version
 * Manages daily discipline loops, streak tracking, and habit persistence.
 */
const K_Habits = {
    // UI Template: Defines the layout for the habits dashboard and empty states
    template: `
        <div class="habits-view-wrapper view-animate">
            <header class="habits-hero glass-v2">
                <div class="h-hero-content">
                    <div class="h-hero-text">
                        <h1>Daily Evolution</h1>
                        <p class="text-dim">Small wins every day lead to massive results.</p>
                    </div>
                    <div class="h-hero-stats">
                        <div class="h-mini-stat">
                            <span id="h-done-count">0</span>
                            <small>DONE TODAY</small>
                        </div>
                        <div class="h-stat-divider"></div>
                        <div class="h-mini-stat">
                            <span id="h-total-count">0</span>
                            <small>TOTAL HABITS</small>
                        </div>
                    </div>
                </div>
                <button class="btn-primary add-habit-trigger" onclick="K_Habits.showAddModal()">
                    <i class="fas fa-plus"></i> NEW HABIT
                </button>
            </header>

            <div class="habit-grid-v2" id="habit-list-container">
                <!-- Habit cards dynamically injected here -->
            </div>
        </div>
    `,

    /**
     * Initializes the Habits module
     */
    init() {
        this.render();
    },

    /**
     * Renders the habit dashboard with real-time stats and cards
     */
    render() {
        const data = K_Storage.getData();
        if (!data) return;

        const habits = data.habits || [];
        const today = new Date().toISOString().split('T')[0];
        const container = document.getElementById('habit-list-container');
        
        if (!container) return;

        // 1. Calculate and Update Header Stats
        const doneToday = habits.filter(h => h.completedDates.includes(today)).length;
        const doneCountEl = document.getElementById('h-done-count');
        const totalCountEl = document.getElementById('h-total-count');

        if (doneCountEl) doneCountEl.innerText = doneToday;
        if (totalCountEl) totalCountEl.innerText = habits.length;

        // 2. Handle Empty State
        if (habits.length === 0) {
            container.innerHTML = `
                <div class="empty-habits glass-v2">
                    <i class="fas fa-sparkles"></i>
                    <p>Your journey is blank. Add your first habit to start evolving.</p>
                    <button class="btn-primary" onclick="K_Habits.showAddModal()">+ ADD FIRST HABIT</button>
                </div>`;
            return;
        }

        // 3. Render Habit Cards
        container.innerHTML = habits.map(habit => {
            const isDone = habit.completedDates.includes(today);
            return `
                <div class="habit-card-v3 glass-v2 ${isDone ? 'is-completed' : ''}" onclick="K_Habits.toggleHabit(${habit.id}, event)">
                    <div class="h-card-top">
                        <div class="h-icon-box">
                            <i class="fas fa-fire"></i>
                        </div>
                        <div class="h-card-info">
                            <h3>${habit.name}</h3>
                            <span class="h-streak-tag"><i class="fas fa-bolt"></i> ${habit.streak || 0} DAY STREAK</span>
                        </div>
                        <div class="h-status-indicator">
                            <i class="fas ${isDone ? 'fa-check-double' : 'fa-circle-notch'}"></i>
                        </div>
                    </div>
                    
                    <div class="h-card-footer">
                        <span class="h-xp-tag">+50 XP REWARD</span>
                        <button class="h-del-btn" title="Delete Habit" onclick="K_Habits.deleteHabit(${habit.id}, event)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    
                    <div class="h-card-glow"></div>
                </div>
            `;
        }).join('');
    },

    /**
     * Toggles the completion status for today's date
     * @param {number} id - Habit ID
     * @param {Event} event - UI Click event
     */
    toggleHabit(id, event) {
        const data = K_Storage.getData();
        const habit = data.habits.find(h => h.id === id);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];
        const idx = habit.completedDates.indexOf(today);

        if (idx === -1) {
            // Mark Completed
            habit.completedDates.push(today);
            habit.streak = (habit.streak || 0) + 1;
            
            // Gamification Logic
            if (typeof K_Engine !== "undefined") K_Engine.addXP(50);
            if (window.K_App && typeof K_App.showXpPopup === "function") {
                K_App.showXpPopup(50, event.clientX, event.clientY);
            }
            if (typeof K_Gamification !== "undefined" && typeof K_Gamification.playSound === "function") {
                K_Gamification.playSound('success');
            }
        } else {
            // Un-mark
            habit.completedDates.splice(idx, 1);
            habit.streak = Math.max(0, (habit.streak || 0) - 1);
        }

        K_Storage.save(data);
        this.render();
    },

    /**
     * Removes a habit permanently
     */
    deleteHabit(id, event) {
        event.stopPropagation(); // Prevent card click event
        if (confirm("Delete this habit and its streak data permanently?")) {
            const data = K_Storage.getData();
            data.habits = data.habits.filter(h => h.id !== id);
            K_Storage.save(data);
            this.render();
        }
    },

    /**
     * Opens UI prompt to create a new habit
     */
    showAddModal() {
        const name = prompt("What's your new daily habit?");
        if (name && name.trim()) {
            const data = K_Storage.getData();
            data.habits.push({
                id: Date.now(),
                name: name.trim(),
                streak: 0,
                completedDates: [],
                createdAt: new Date().toISOString()
            });
            K_Storage.save(data);
            this.render();
        }
    }
};