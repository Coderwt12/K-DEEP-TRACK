/**
 * K-DEEP XP - PREMIUM JOURNAL SYSTEM
 * Optimized Production Version
 * Manages daily reflections, mood tracking, and retrospective growth logs.
 */
const K_Journal = {
    selectedMood: 'good',

    // UI Template: Preserving original cyberpunk glassmorphism structure
    template: `
        <div class="journal-view-wrapper view-animate">
            <!-- HEADER: JOURNAL INTELLIGENCE -->
            <header class="journal-stats-bar glass-v2">
                <div class="j-stat">
                    <span class="label">JOURNAL STREAK</span>
                    <div class="stat-val">
                        <i class="fas fa-fire accent-orange"></i> 
                        <span id="j-streak">0</span>
                    </div>
                </div>
                <div class="j-stat">
                    <span class="label">TOTAL ENTRIES</span>
                    <div class="stat-val">
                        <i class="fas fa-book-open accent-cyan"></i> 
                        <span id="j-total">0</span>
                    </div>
                </div>
                <div class="j-stat">
                    <span class="label">TODAY'S DATE</span>
                    <div class="stat-val date-val" id="j-date">-- -- ----</div>
                </div>
            </header>

            <!-- MOOD PICKER -->
            <section class="mood-section glass-v2">
                <h3>HOW IS YOUR MINDSET TODAY?</h3>
                <div class="mood-picker">
                    <div class="mood-btn" data-mood="great" onclick="K_Journal.setMood('great')">
                        <span class="emoji">😄</span> <span class="mood-label">Great</span>
                    </div>
                    <div class="mood-btn" data-mood="good" onclick="K_Journal.setMood('good')">
                        <span class="emoji">🙂</span> <span class="mood-label">Good</span>
                    </div>
                    <div class="mood-btn" data-mood="average" onclick="K_Journal.setMood('average')">
                        <span class="emoji">😐</span> <span class="mood-label">Average</span>
                    </div>
                    <div class="mood-btn" data-mood="bad" onclick="K_Journal.setMood('bad')">
                        <span class="emoji">😞</span> <span class="mood-label">Bad</span>
                    </div>
                </div>
            </section>

            <!-- JOURNAL INPUT GRID -->
            <div class="journal-grid">
                <div class="journal-card glass-v2">
                    <label><i class="fas fa-crown accent"></i> BIGGEST WIN TODAY</label>
                    <textarea id="j-win" placeholder="What was your main victory?"></textarea>
                </div>
                <div class="journal-card glass-v2">
                    <label><i class="fas fa-book accent-purple"></i> WHAT I STUDIED</label>
                    <textarea id="j-study" placeholder="Key subjects or topics covered..."></textarea>
                </div>
                <div class="journal-card glass-v2">
                    <label><i class="fas fa-exclamation-triangle accent-orange"></i> BIGGEST MISTAKE</label>
                    <textarea id="j-mistake" placeholder="What went wrong? Be honest..."></textarea>
                </div>
                <div class="journal-card glass-v2">
                    <label><i class="fas fa-lightbulb accent-yellow"></i> LESSON LEARNED</label>
                    <textarea id="j-lesson" placeholder="How will you improve tomorrow?"></textarea>
                </div>
                <div class="journal-card glass-v2">
                    <label><i class="fas fa-bullseye accent-cyan"></i> TOMORROW'S TARGET</label>
                    <textarea id="j-target" placeholder="The #1 thing you must finish tomorrow."></textarea>
                </div>
                <div class="journal-card glass-v2">
                    <label><i class="fas fa-heart accent-emerald"></i> GRATITUDE</label>
                    <textarea id="j-gratitude" placeholder="I am thankful for..."></textarea>
                </div>
            </div>

            <div class="journal-actions">
                <button class="btn-primary save-journal-btn" onclick="K_Journal.saveEntry()">
                    <i class="fas fa-save"></i> SYNC REFLECTION
                </button>
            </div>
        </div>
    `,

    /**
     * Module Entry Point
     */
    init() {
        const todayLabel = new Date().toLocaleDateString('en-US', { 
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
        });
        
        const dateEl = document.getElementById('j-date');
        if (dateEl) dateEl.innerText = todayLabel;
        
        this.renderStats();
        this.loadTodayEntry();
    },

    /**
     * Updates header statistics from storage
     */
    renderStats() {
        const data = K_Storage.getData();
        if (!data) return;

        const totalEl = document.getElementById('j-total');
        const streakEl = document.getElementById('j-streak');

        if (totalEl) totalEl.innerText = data.journal?.length || 0;
        if (streakEl) streakEl.innerText = data.profile?.streak || 0;
    },

    /**
     * UI Handler for mindset/mood selection
     * @param {string} mood - key (great, good, average, bad)
     */
    setMood(mood) {
        this.selectedMood = mood;
        const buttons = document.querySelectorAll('.mood-btn');
        
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mood === mood);
        });
    },

    /**
     * Populates fields if an entry exists for the current calendar date
     */
    loadTodayEntry() {
        const data = K_Storage.getData();
        const todayKey = new Date().toISOString().split('T')[0];
        const entry = data.journal?.find(j => j.date === todayKey);

        if (entry) {
            this.setMood(entry.mood || 'good');
            
            // Internal mapping for field population
            const fields = ['win', 'study', 'mistake', 'lesson', 'target', 'gratitude'];
            fields.forEach(field => {
                const el = document.getElementById(`j-${field}`);
                if (el) el.value = entry[field] || '';
            });
        } else {
            this.setMood('good'); // Reset UI to default for new entry
        }
    },

    /**
     * Persists entry to storage and calculates XP rewards
     */
    saveEntry() {
        const todayKey = new Date().toISOString().split('T')[0];
        
        // Helper to get element values safely
        const getVal = (id) => document.getElementById(id)?.value || '';

        const entry = {
            date: todayKey,
            mood: this.selectedMood,
            win: getVal('j-win'),
            study: getVal('j-study'),
            mistake: getVal('j-mistake'),
            lesson: getVal('j-lesson'),
            target: getVal('j-target'),
            gratitude: getVal('j-gratitude'),
            timestamp: new Date().toISOString()
        };

        const data = K_Storage.getData();
        const existingIndex = data.journal.findIndex(j => j.date === todayKey);

        if (existingIndex > -1) {
            // Update mode
            data.journal[existingIndex] = { ...data.journal[existingIndex], ...entry };
            alert("Journal Intelligence Updated.");
        } else {
            // Create mode & Reward XP
            data.journal.push(entry);
            
            if (typeof K_Engine !== "undefined") {
                K_Engine.addXP(20);
            }
            
            if (window.K_App && typeof K_App.showXpPopup === "function") {
                K_App.showXpPopup(20, window.innerWidth / 2, window.innerHeight / 2);
            }
            
            alert("Neural Reflection Synced! +20 XP Earned.");
        }

        K_Storage.save(data);
        this.renderStats();
    }
};