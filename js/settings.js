/**
 * K-DEEP XP - COMMAND CENTER (SETTINGS)
 * Optimized Production Version
 * Manages user profile state, data portability, and system preferences.
 */
const K_Settings = {
    // UI Template: Preserving original Jarvis/Cyberpunk structure and IDs
    template: `
        <div class="settings-view-wrapper view-animate">
            <div id="settings-profile-area" class="profile-command-card glass-v2 tilt-card">
                <!-- Profile data dynamically injected by renderProfile() -->
            </div>

            <div class="settings-grid">
                <div class="settings-card glass-v2">
                    <h3 class="s-title"><i class="fas fa-sliders-h accent"></i> SYSTEM PREFERENCES</h3>
                    <div class="s-row">
                        <span>High Contrast Mode</span>
                        <div class="toggle-pill" onclick="this.classList.toggle('active')"></div>
                    </div>
                    <div class="s-row">
                        <span>Accent Sync</span>
                        <div class="color-dots">
                            <div class="c-dot active" style="background:#06b6d4" onclick="K_Settings.updateAccent('cyan')"></div>
                            <div class="c-dot" style="background:#8b5cf6" onclick="K_Settings.updateAccent('purple')"></div>
                            <div class="c-dot" style="background:#10b981" onclick="K_Settings.updateAccent('emerald')"></div>
                        </div>
                    </div>
                </div>

                <div class="settings-card glass-v2">
                    <h3 class="s-title"><i class="fas fa-shield-alt accent"></i> DATA SECURITY</h3>
                    <div class="data-btns">
                        <button class="os-btn" onclick="K_Settings.exportData()">
                            <i class="fas fa-file-download"></i> EXPORT NEURAL DATA
                        </button>
                        <button class="os-btn danger" onclick="K_Settings.nuclearReset()">
                            <i class="fas fa-radiation"></i> NUCLEAR WIPE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,

    /**
     * Module Entry Point
     */
    init() {
        // Initial render based on current Firebase state
        const user = firebase.auth().currentUser;
        this.renderProfile(user);

        // Standardized Auth observer for real-time UI updates
        firebase.auth().onAuthStateChanged((user) => {
            this.renderProfile(user);
        });
    },

    /**
     * Handles dynamic rendering of the profile card based on Auth state
     * @param {Object|null} user - Firebase User Object
     */
    renderProfile(user) {
        const area = document.getElementById('settings-profile-area');
        if (!area) return;

        if (user) {
            // Logged In View
            area.innerHTML = `
                <div class="p-main">
                    <div class="p-avatar-wrap">
                        <img src="${user.photoURL || 'image/default-avatar.png'}" alt="User Identity">
                        <div class="p-glow"></div>
                    </div>
                    <div class="p-info">
                        <h2>${user.displayName || 'Vanguard Operative'}</h2>
                        <p class="text-dim">${user.email}</p>
                        <div class="p-badges">
                            <span class="badge">VANGUARD RANK</span>
                            <span class="badge">SYSTEM ACTIVE</span>
                        </div>
                    </div>
                    <button class="btn-logout" onclick="window.logoutUser()">
                        <i class="fas fa-sign-out-alt"></i> LOGOUT
                    </button>
                </div>
            `;
        } else {
            // Logged Out / Guest View
            area.innerHTML = `
                <div class="login-prompt" style="text-align: center; padding: 1rem;">
                    <div class="ach-icon" style="margin-bottom: 1rem; font-size: 2rem;">
                        <i class="fas fa-user-shield accent"></i>
                    </div>
                    <h2>Neural Link Offline</h2>
                    <p class="text-dim" style="margin-bottom: 1.5rem;">Authenticate to sync your progress with the cloud mainframe.</p>
                    <button class="btn-primary" onclick="window.signInWithGoogle()">
                        LOGIN WITH GOOGLE
                    </button>
                </div>
            `;
        }
    },

    /**
     * Placeholder for accent color selection logic
     */
    updateAccent(color) {
        console.log(`System: Accent changed to ${color}`);
        // Additional theme logic can be implemented here
    },

    /**
     * Exports entire LocalStorage state as a downloadable JSON file
     */
    exportData() {
        try {
            const data = localStorage.getItem('K_DEEP_USER_DATA');
            if (!data) throw new Error("No local data found.");

            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = `K-DEEP-BACKUP-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log("System: Data Archive Exported Successfully.");
        } catch (error) {
            alert("Export Failed: " + error.message);
        }
    },

    /**
     * Completely wipes local progress and reloads system
     */
    nuclearReset() {
        const warning = "FATAL ACTION: This will permanently erase your XP, habits, and neural logs. This cannot be undone. Proceed?";
        
        if (confirm(warning)) {
            localStorage.clear();
            location.reload();
        }
    }
};