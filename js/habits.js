/**
 * HABIT MODULE
 */

const K_Habits = {
    template: `
        <div class="view-header">
            <h1>Habit Tracker</h1>
            <button class="btn-primary" onclick="K_Habits.showAddModal()">+ New Habit</button>
        </div>
        <div class="habit-grid" id="habit-list"></div>
    `,

    init() {
        this.renderHabits();
    },

    renderHabits() {
        const habits = K_Storage.getData().habits;
        const container = document.getElementById('habit-list');
        const today = new Date().toISOString().split('T')[0];

        if (habits.length === 0) {
            container.innerHTML = `<p style="color:var(--text-secondary)">No habits created yet. Start your journey!</p>`;
            return;
        }

        container.innerHTML = habits.map(habit => {
            const isCompleted = habit.completedDates.includes(today);
            return `
                <div class="habit-card glass ${isCompleted ? 'completed' : ''}" 
                     onclick="K_Habits.toggleHabit(${habit.id}, event)">
                    <div class="habit-header">
                        <div class="habit-icon"><i class="fas fa-check"></i></div>
                        <div>
                            <h3>${habit.name}</h3>
                            <small>${habit.streak} Day Streak</small>
                        </div>
                    </div>
                    <div class="xp-bar-bg" style="height:4px">
                        <div class="xp-bar-fill" style="width: ${Math.min(habit.streak * 10, 100)}%; background: var(--accent-emerald)"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    toggleHabit(id, event) {
        const data = K_Storage.getData();
        const habit = data.habits.find(h => h.id === id);
        const today = new Date().toISOString().split('T')[0];
        const dateIndex = habit.completedDates.indexOf(today);

        if (dateIndex === -1) {
            // Complete habit
            habit.completedDates.push(today);
            habit.streak += 1;
            
            // Dispatch XP Gain Event
            const xpEvent = new CustomEvent('xpGain', { 
                detail: { amount: 50, x: event.clientX, y: event.clientY } 
            });
            window.dispatchEvent(xpEvent);
            K_Engine.addXP(50);
        } else {
            // Un-complete habit
            habit.completedDates.splice(dateIndex, 1);
            habit.streak = Math.max(0, habit.streak - 1);
        }

        K_Storage.save(data);
        this.renderHabits();
    },

    showAddModal() {
        const name = prompt("Enter habit name (e.g., Meditate 10m):");
        if (name) {
            K_Storage.addHabit({ name: name });
            this.renderHabits();
        }
    }
};