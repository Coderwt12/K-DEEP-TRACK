/**
 * K-DEEP XP - PREMIUM JOURNAL SYSTEM
 */
const K_Journal = {
    selectedMood: 'good',

    template: `
        <div class="journal-view-wrapper view-animate">
            <!-- HEADER: JOURNAL INTELLIGENCE -->
            <header class="journal-stats-bar glass-v2">
                <div class="j-stat">
                    <span class="label">JOURNAL STREAK</span>
                    <div class="stat-val"><i class="fas fa-fire accent-orange"></i> <span id="j-streak">0</span></div>
                </div>
                <div class="j-stat">
                    <span class="label">TOTAL ENTRIES</span>
                    <div class="stat-val"><i class="fas fa-book-open accent-cyan"></i> <span id="j-total">0</span></div>
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
                    <div class="mood-btn active" data-mood="good" onclick="K_Journal.setMood('good')">
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

    init() {
        const today = new Date().toLocaleDateString('en-US', { 
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
        });
        document.getElementById('j-date').innerText = today;
        
        this.renderStats();
        this.loadTodayEntry();
    },

    renderStats() {
        const data = K_Storage.getData();
        document.getElementById('j-total').innerText = data.journal.length;
        document.getElementById('j-streak').innerText = data.profile.streak; // Using global streak or journal specific if available
    },

    setMood(mood) {
        this.selectedMood = mood;
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('active');
            if(btn.dataset.mood === mood) btn.classList.add('active');
        });
    },

    loadTodayEntry() {
        const data = K_Storage.getData();
        const today = new Date().toISOString().split('T')[0];
        const entry = data.journal.find(j => j.date === today);

        if (entry) {
            this.setMood(entry.mood || 'good');
            document.getElementById('j-win').value = entry.win || '';
            document.getElementById('j-study').value = entry.study || '';
            document.getElementById('j-mistake').value = entry.mistake || '';
            document.getElementById('j-lesson').value = entry.lesson || '';
            document.getElementById('j-target').value = entry.target || '';
            document.getElementById('j-gratitude').value = entry.gratitude || '';
        }
    },

    saveEntry() {
        const today = new Date().toISOString().split('T')[0];
        const entry = {
            date: today,
            mood: this.selectedMood,
            win: document.getElementById('j-win').value,
            study: document.getElementById('j-study').value,
            mistake: document.getElementById('j-mistake').value,
            lesson: document.getElementById('j-lesson').value,
            target: document.getElementById('j-target').value,
            gratitude: document.getElementById('j-gratitude').value,
            timestamp: new Date().toISOString()
        };

        const data = K_Storage.getData();
        const existingIndex = data.journal.findIndex(j => j.date === today);

        if (existingIndex > -1) {
            // Update existing
            data.journal[existingIndex] = entry;
            alert("Journal Updated!");
        } else {
            // Create new entry & Reward XP
            data.journal.push(entry);
            K_Engine.addXP(20); // Reward 20 XP for first entry
            
            if(window.K_App && K_App.showXpPopup) {
                K_App.showXpPopup(20, window.innerWidth/2, window.innerHeight/2);
            }
            alert("Entry Saved! +20 XP Earned.");
        }

        K_Storage.save(data);
        this.renderStats();
    }
};