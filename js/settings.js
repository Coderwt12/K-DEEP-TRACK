/**
 * SETTINGS & ONBOARDING MODULE
 */
const K_Settings = {
    template: `
        <div class="settings-wrapper view-animate">
            <div class="view-header">
                <h1>Command Center</h1>
            </div>

            <div class="settings-grid">
                <div class="glass profile-edit">
                    <h3>User Profile</h3>
                    <div class="avatar-selector">
                        <img id="profile-preview" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" class="glass">
                        <input type="text" id="user-name-input" class="glass-input" placeholder="Change Persona Name">
                    </div>
                    <button class="btn-primary" onclick="K_Settings.saveProfile()">Update Profile</button>
                </div>

                <div class="glass app-settings">
                    <h3>Preferences</h3>
                    <div class="setting-toggle">
                        <span>High Contrast Mode</span>
                        <input type="checkbox" id="theme-toggle" onchange="K_Settings.toggleTheme()">
                    </div>
                    <div class="setting-toggle">
                        <span>Sound Effects</span>
                        <input type="checkbox" checked id="sfx-toggle">
                    </div>
                    <button class="btn-secondary" onclick="K_Settings.resetData()" style="margin-top: 2rem; color: var(--danger)">WIPE ALL DATA</button>
                </div>
            </div>
        </div>
    `,

    init() {
        const data = K_Storage.getData();
        document.getElementById('user-name-input').value = data.profile.name;
        this.checkOnboarding();
    },

    checkOnboarding() {
        if (!localStorage.getItem('K_DEEP_ONBOARDED')) {
            this.showOnboarding();
        }
    },

    showOnboarding() {
        const overlay = document.createElement('div');
        overlay.className = 'onboarding-overlay';
        overlay.innerHTML = `
            <div class="onboarding-card glass view-animate">
                <div class="logo-icon">K</div>
                <h2>Welcome to K-DEEP XP</h2>
                <p>Knowledge • Discipline • Effort • Evolution • Progress</p>
                <div class="onboarding-steps">
                    <div class="step"><i class="fas fa-check-circle"></i> Complete habits for XP</div>
                    <div class="step"><i class="fas fa-stopwatch"></i> Study deep to level up</div>
                    <div class="step"><i class="fas fa-pen-fancy"></i> Reflect daily to grow</div>
                </div>
                <button class="btn-primary" onclick="K_Settings.completeOnboarding(this)">BEGIN EVOLUTION</button>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    completeOnboarding(btn) {
        localStorage.setItem('K_DEEP_ONBOARDED', 'true');
        btn.closest('.onboarding-overlay').remove();
        K_Gamification.playSound('levelUp');
    },

    saveProfile() {
        const newName = document.getElementById('user-name-input').value;
        if (newName) {
            K_Storage.updateProfile({ name: newName });
            alert("Identity Updated.");
            location.reload(); 
        }
    },

    toggleTheme() {
        document.body.classList.toggle('high-contrast');
    },

    resetData() {
        if (confirm("This will permanently erase your progress, XP, and history. Are you sure?")) {
            localStorage.clear();
            location.reload();
        }
    }
};