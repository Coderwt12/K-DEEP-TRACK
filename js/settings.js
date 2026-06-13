/**
 * K-DEEP XP - CENTRAL COMMAND HUB (SETTINGS)
 */
const K_Settings = {
    template: `
        <div class="settings-view-wrapper view-animate">
            <!-- SECTION 1: PROFILE COMMAND CARD -->
            <div class="profile-command-card glass-v2 tilt-card">
                <div class="profile-header">
                    <div class="avatar-container">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" id="settings-avatar">
                        <div class="lvl-badge" id="set-lvl">01</div>
                    </div>
                    <div class="profile-meta">
                        <div class="username-row">
                            <input type="text" id="set-username" class="glass-input" value="Player One">
                            <button class="save-name-btn" onclick="K_Settings.updateUsername()"><i class="fas fa-check"></i></button>
                        </div>
                        <span class="rank-tag" id="set-rank">NOVICE VANGUARD</span>
                    </div>
                </div>
                <div class="profile-stats-mini">
                    <div class="s-mini">
                        <span class="label">TOTAL XP</span>
                        <span class="val" id="set-total-xp">0</span>
                    </div>
                    <div class="s-mini">
                        <span class="label">SYSTEM STATUS</span>
                        <span class="val accent">ACTIVE</span>
                    </div>
                </div>
            </div>

            <div class="settings-grid">
                <!-- SECTION 2: APPEARANCE ENGINE -->
                <div class="settings-card glass-v2">
                    <h3><i class="fas fa-palette accent"></i> APPEARANCE ENGINE</h3>
                    
                    <div class="setting-item">
                        <label>Interface Theme</label>
                        <div class="theme-toggles">
                            <button class="t-btn active" id="btn-dark" onclick="K_Settings.setTheme('dark')"><i class="fas fa-moon"></i> DARK</button>
                            <button class="t-btn" id="btn-light" onclick="K_Settings.setTheme('light')"><i class="fas fa-sun"></i> LIGHT</button>
                        </div>
                    </div>

                    <div class="setting-item">
                        <label>System Accent Color</label>
                        <div class="color-picker">
                            <div class="color-pill cyan active" onclick="K_Settings.setAccent('cyan')"></div>
                            <div class="color-pill purple" onclick="K_Settings.setAccent('purple')"></div>
                            <div class="color-pill emerald" onclick="K_Settings.setAccent('emerald')"></div>
                        </div>
                    </div>
                </div>

                <!-- SECTION 3: DATA ARCHIVE -->
                <div class="settings-card glass-v2">
                <div class="glass-v2" style="padding:20px;margin-bottom:20px;">

<h3>ACCOUNT</h3>

<button class="theme-btn" onclick="signInWithGoogle()">

<i class="fab fa-google"></i>

Login with Google

</button>

<button class="theme-btn"

onclick="logoutUser()"

style="margin-left:10px;">

Logout

</button>

<div id="user-box"

style="margin-top:20px;">

Not Logged In

</div>

</div>
                    <h3><i class="fas fa-database accent"></i> DATA MANAGEMENT</h3>
                    <p class="text-dim">Backup your progress or migrate your consciousness.</p>
                    
                    <div class="data-actions">
                        <button class="action-btn" onclick="K_Settings.exportData()">
                            <i class="fas fa-file-export"></i> EXPORT BACKUP (.JSON)
                        </button>
                        <button class="action-btn" onclick="document.getElementById('import-file').click()">
                            <i class="fas fa-file-import"></i> IMPORT BACKUP
                        </button>
                        <input type="file" id="import-file" style="display:none" onchange="K_Settings.importData(event)">
                        
                        <button class="action-btn danger" onclick="K_Settings.resetSystem()">
                            <i class="fas fa-radiation"></i> NUCLEAR RESET
                        </button>
                    </div>
                </div>
            </div>

            <!-- SECTION 4: SYSTEM INFO -->
            <footer class="about-section glass-v2">
                <div class="about-content">
                    <h4>K-DEEP XP <span class="version">v2.0</span></h4>
                    <p>Knowledge • Discipline • Effort • Evolution • Progress</p>
                    <small>System Architect: <strong>Kuldeep Singh Rawat</strong></small>
                </div>
            </footer>
        </div>
    `,

    init() {
        const data = K_Storage.getData();
        const xpProgress = K_Engine.getXpProgress(data.profile.totalXp);

        // Populate Profile Card
        document.getElementById('set-username').value = data.profile.name;
        document.getElementById('set-lvl').innerText = data.profile.level;
        document.getElementById('set-total-xp').innerText = data.profile.totalXp.toLocaleString();

        // Calculate Rank
        const ranks = ["NOVICE VANGUARD", "INITIATE", "ELITE ACOLYTE", "COMMANDER", "SYSTEM MASTER"];
        const rIdx = Math.min(Math.floor((data.profile.level - 1) / 5), ranks.length - 1);
        document.getElementById('set-rank').innerText = ranks[rIdx];

        // Apply saved visual states
        this.loadVisualStates();
    },

    updateUsername() {
        const newName = document.getElementById('set-username').value;
        if (newName.trim()) {
            const data = K_Storage.getData();
            data.profile.name = newName;
            K_Storage.save(data);
            alert("Identity Synced to Mainframe.");
            location.reload();
        }
    },

    setTheme(mode) {
        document.body.className = mode === 'light' ? 'light-theme' : 'dark-theme';
        localStorage.setItem('kdeep_theme', mode);
        document.querySelectorAll('.t-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`btn-${mode}`).classList.add('active');
    },

    setAccent(color) {
        document.documentElement.setAttribute('data-accent', color);
        localStorage.setItem('kdeep_accent', color);
        document.querySelectorAll('.color-pill').forEach(p => p.classList.remove('active'));
        document.querySelector(`.color-pill.${color}`).classList.add('active');
    },

    loadVisualStates() {
        const theme = localStorage.getItem('kdeep_theme') || 'dark';
        const accent = localStorage.getItem('kdeep_accent') || 'cyan';
        this.setTheme(theme);
        this.setAccent(accent);
    },

    exportData() {
        const data = localStorage.getItem('K_DEEP_USER_DATA');
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `K-DEEP-BACKUP-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    },

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (imported.profile && imported.habits) {
                    K_Storage.save(imported);
                    alert("Backup Restored Successfully. Rebooting...");
                    location.reload();
                } else { throw new Error(); }
            } catch (err) {
                alert("Invalid Backup File Protocol.");
            }
        };
        reader.readAsText(file);
    },

    resetSystem() {
        if (confirm("WARNING: Nuclear Reset will erase all XP, Habits, and Study Logs. Proceed?")) {
            localStorage.clear();
            location.reload();
        }
    }
};