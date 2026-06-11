/**
 * JOURNAL MODULE
 */
const K_Journal = {
    template: `
        <div class="journal-wrapper">
            <div class="view-header">
                <h1>Daily Journal</h1>
                <p id="journal-date" class="accent"></p>
            </div>

            <div class="journal-form glass">
                <div class="input-group">
                    <label>What went well today?</label>
                    <textarea id="journal-well" placeholder="Victories, big or small..."></textarea>
                </div>
                
                <div class="input-group">
                    <label>What could have been better?</label>
                    <textarea id="journal-wrong" placeholder="Lessons from failures..."></textarea>
                </div>

                <div class="input-group">
                    <label>Lessons Learned</label>
                    <textarea id="journal-lessons" placeholder="New insights..."></textarea>
                </div>

                <div class="input-group">
                    <label>Gratitude</label>
                    <textarea id="journal-gratitude" placeholder="I am thankful for..."></textarea>
                </div>

                <button class="btn-primary" onclick="K_Journal.saveEntry()">SAVE REFLECTION (+20 XP)</button>
            </div>
        </div>
    `,

    init() {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('journal-date').innerText = today;
        this.loadTodayEntry();
    },

    loadTodayEntry() {
        const data = K_Storage.getData();
        const today = new Date().toISOString().split('T')[0];
        const entry = data.journal.find(j => j.date === today);

        if (entry) {
            document.getElementById('journal-well').value = entry.well || '';
            document.getElementById('journal-wrong').value = entry.wrong || '';
            document.getElementById('journal-lessons').value = entry.lessons || '';
            document.getElementById('journal-gratitude').value = entry.gratitude || '';
        }
    },

    saveEntry() {
        const entry = {
            well: document.getElementById('journal-well').value,
            wrong: document.getElementById('journal-wrong').value,
            lessons: document.getElementById('journal-lessons').value,
            gratitude: document.getElementById('journal-gratitude').value
        };

        const today = new Date().toISOString().split('T')[0];
        const existingData = K_Storage.getData();
        const isNewEntry = !existingData.journal.find(j => j.date === today);

        K_Storage.saveJournalEntry(entry);

        if (isNewEntry) {
            K_Engine.addXP(20);
            const xpEvent = new CustomEvent('xpGain', { 
                detail: { amount: 20, x: window.innerWidth / 2, y: window.innerHeight / 2 } 
            });
            window.dispatchEvent(xpEvent);
            alert("Entry Saved! +20 XP earned.");
        } else {
            alert("Entry Updated!");
        }
    }
};