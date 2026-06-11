/**
 * GAMIFICATION & SFX ENGINE
 */
const K_Gamification = {
    badges: [
        { id: 'first_step', name: 'First Step', desc: 'Complete 1 habit', icon: 'fa-shoe-prints', color: '#06b6d4', condition: (data) => data.habits.some(h => h.completedDates.length > 0) },
        { id: 'monk_mode', name: 'Monk Mode', desc: '7 Day Streak', icon: 'fa-om', color: '#8b5cf6', condition: (data) => data.profile.streak >= 7 },
        { id: 'scholar', name: 'Scholar', desc: '10 Hours of Study', icon: 'fa-graduation-cap', color: '#10b981', condition: (data) => data.studyLogs.reduce((acc, l) => acc + l.duration, 0) >= 600 },
        { id: 'deep_thinker', name: 'Deep Thinker', desc: '5 Journal Entries', icon: 'fa-brain', color: '#f59e0b', condition: (data) => data.journal.length >= 5 }
    ],

    init() {
        this.checkBadges();
        this.generateDailyChallenges();
    },

    // Web Audio API Sound Engine
    playSound(type) {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        if (type === 'success') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'levelUp') {
            [440, 554, 659, 880].forEach((freq, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.connect(g); g.connect(ctx.destination);
                o.frequency.value = freq;
                g.gain.setValueAtTime(0, now + i * 0.1);
                g.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.05);
                g.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.2);
                o.start(now + i * 0.1);
                o.stop(now + i * 0.1 + 0.3);
            });
        }
    },

    notify(title, message, type = 'standard') {
        const toast = document.createElement('div');
        toast.className = `notification glass ${type === 'level' ? 'level-up-anim' : ''}`;
        toast.innerHTML = `
            <div class="notif-content">
                <i class="fas ${type === 'level' ? 'fa-crown' : 'fa-award'} accent"></i>
                <div>
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
            </div>
        `;
        document.body.appendChild(toast);
        this.playSound(type === 'level' ? 'levelUp' : 'success');
        setTimeout(() => toast.classList.add('fade-out'), 4000);
        setTimeout(() => toast.remove(), 4500);
    },

    checkBadges() {
        const data = K_Storage.getData();
        this.badges.forEach(badge => {
            if (!data.profile.badges.includes(badge.id) && badge.condition(data)) {
                data.profile.badges.push(badge.id);
                K_Storage.save(data);
                this.notify("Badge Unlocked!", badge.name);
            }
        });
    },

    generateDailyChallenges() {
        const challenges = [
            { id: 'c1', task: 'Study for 50 mins', xp: 100 },
            { id: 'c2', task: 'Complete all habits', xp: 150 },
            { id: 'c3', task: 'Write a journal entry', xp: 50 }
        ];
        // Store in local storage to persist for the day
        const today = new Date().toDateString();
        let data = K_Storage.getData();
        if (data.dailyChallengeDate !== today) {
            data.dailyChallengeDate = today;
            data.challenges = challenges;
            K_Storage.save(data);
        }
    }
};