
const K_Settings = {
    template: `
        <div class="settings-view-wrapper view-animate">
            <div id="settings-profile-area" class="profile-command-card glass-v2 tilt-card">
                <!-- Profile data will be injected here -->
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
                            <div class="c-dot active" style="background:#06b6d4"></div>
                            <div class="c-dot" style="background:#8b5cf6"></div>
                            <div class="c-dot" style="background:#10b981"></div>
                        </div>
                    </div>
                </div>

                <div class="settings-card glass-v2">
                    <h3 class="s-title"><i class="fas fa-shield-alt accent"></i> DATA SECURITY</h3>
                    <div class="data-btns">
                        <button class="os-btn" onclick="K_Settings.exportData()"><i class="fas fa-file-download"></i> EXPORT NEURAL DATA</button>
                        <button class="os-btn danger" onclick="K_Settings.nuclearReset()"><i class="fas fa-radiation"></i> NUCLEAR WIPE</button>
                    </div>
                </div>
            </div>
        </div>
    `,

    init() {
        firebase.auth().onAuthStateChanged((user) => {
            const area = document.getElementById('settings-profile-area');
            if (!area) return;
            if (user) {
                area.innerHTML = `
                    <div class="p-main">
                        <div class="p-avatar-wrap">
                            <img src="${user.photoURL}" alt="User">
                            <div class="p-glow"></div>
                        </div>
                        <div class="p-info">
                            <h2>${user.displayName}</h2>
                            <p>${user.email}</p>
                            <div class="p-badges"><span class="badge">VANGUARD RANK</span><span class="badge">PRO USER</span></div>
                        </div>
                        <button class="btn-logout" onclick="window.logoutUser()">LOGOUT</button>
                    </div>
                `;
            } else {
                area.innerHTML = `<button class="btn-primary" onclick="window.signInWithGoogle()">LOGIN WITH GOOGLE</button>`;
            }
        });
    },

    exportData() { /* export logic */ },
    nuclearReset() { if(confirm("Erase all data?")) { localStorage.clear(); location.reload(); } }
};