/**
 * K-DEEP XP - APP CORE
 * Optimized & Cleaned Production Version
 * Handles Routing, Global UI, and Background Systems
 */

const K_App = {
    currentView: 'dashboard',

    /**
     * Initialize Application
     */
    init() {
        console.log("K-DEEP XP Initializing...");

        // Initialize Gamification if available
        if (typeof K_Gamification !== "undefined") {
            K_Gamification.init();
        }

        // Setup Core Systems
        this.bindEvents();
        this.setupMobileMenu();
        this.updateGlobalUI();
        
        // Initial Routing
        this.switchView('dashboard');

        // Sync Streak on startup
        if (typeof K_Engine !== "undefined") {
            K_Engine.updateStreak();
        }
    },

    /**
     * Global Event Listeners
     */
    bindEvents() {
        // Navigation Handling
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                if (view) {
                    this.switchView(view);
                    this.closeSidebar(); // Auto-close sidebar on mobile after selection
                }
            });
        });

        // Custom XP Gain Event Listener
        window.addEventListener('xpGain', (e) => {
            this.showXpPopup(e.detail.amount, e.detail.x, e.detail.y);
            this.updateGlobalUI();
        });

        // 3D Tilt Card Interaction Logic
        document.addEventListener("mousemove", (e) => {
            const cards = document.querySelectorAll(".tilt-card");
            if (cards.length === 0) return;

            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const rotateY = ((x / rect.width) - 0.5) * 10;
                const rotateX = ((y / rect.height) - 0.5) * -10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
        });

        // Reset Tilt Card on Mouse Leave
        document.addEventListener("mouseleave", () => {
            document.querySelectorAll(".tilt-card").forEach(card => {
                card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
            });
        });
    },

    /**
     * Mobile Menu Management
     */
    setupMobileMenu() {
        const btn = document.getElementById('menu-toggle');
        const sidebar = document.querySelector('.sidebar');

        if (!btn || !sidebar) return;

        btn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    },

    closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && window.innerWidth <= 768) {
            sidebar.classList.remove('mobile-open');
        }
    },

    /**
     * View Switcher / Router
     */
    switchView(viewName) {
        this.currentView = viewName;
        const container = document.getElementById('view-container');
        if (!container) return;

        // Update Navigation UI state
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        const activeNav = document.querySelector(`[data-view="${viewName}"]`);
        if (activeNav) activeNav.classList.add('active');

        // Inject Template
        container.innerHTML = `<div class="view-animate">${this.renderView(viewName)}</div>`;

        // Initialize Module logic based on view
        const modules = {
            'dashboard': K_Dashboard,
            'habits': K_Habits,
            'study': K_Study,
            'journal': K_Journal,
            'analytics': K_Analytics,
            'settings': K_Settings
        };

        if (modules[viewName] && typeof modules[viewName].init === 'function') {
            modules[viewName].init();
        }
        
        window.scrollTo(0, 0);
    },

    /**
     * Template Engine
     */
    renderView(view) {
        const templates = {
            'dashboard': K_Dashboard?.template,
            'habits': K_Habits?.template,
            'study': K_Study?.template,
            'journal': K_Journal?.template,
            'analytics': K_Analytics?.template,
            'settings': K_Settings?.template
        };

        return templates[view] || K_Dashboard?.template || '<div>View not found</div>';
    },

    /**
     * Global Stats Refresh
     */
    updateGlobalUI() {
        const data = K_Storage.getData();
        if (!data || !data.profile) return;

        const xpProgress = K_Engine.getXpProgress(data.profile.totalXp);

        // Update Level & XP
        const levelEl = document.getElementById('current-level');
        const xpRatioEl = document.getElementById('xp-ratio');
        const xpFillEl = document.getElementById('xp-fill');
        const streakEl = document.getElementById('global-streak');
        const rankEl = document.getElementById('rank-name');

        if (levelEl) levelEl.innerText = data.profile.level;
        if (xpRatioEl) xpRatioEl.innerText = `${Math.floor(xpProgress.currentLevelXp)} / ${xpProgress.neededXp} XP`;
        if (xpFillEl) xpFillEl.style.width = `${xpProgress.percentage}%`;
        if (streakEl) streakEl.innerText = data.profile.streak;

        // Update Rank Text
        if (rankEl) {
            const ranks = ["NOVICE", "INITIATE", "ACOLYTE", "WARRIOR", "MASTER", "SAGE", "LEGEND"];
            const rankIndex = Math.min(Math.floor((data.profile.level - 1) / 5), ranks.length - 1);
            rankEl.innerText = ranks[rankIndex];
        }
    },

    /**
     * Visual XP Gain Feedback
     */
    showXpPopup(amount, x, y) {
        const popup = document.createElement('div');
        popup.className = 'xp-popup';
        popup.innerText = `+${amount} XP`;
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;

        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }
};

/**
 * BACKGROUND ANIMATION ENGINE
 */
const ParticleEngine = {
    canvas: null,
    ctx: null,
    particles: [],

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particle-canvas';
        document.body.prepend(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Particle generation
        for (let i = 0; i < 40; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 3,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }

        this.animate();
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#06b6d4';

        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Screen wrap boundaries
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
        });

        requestAnimationFrame(() => this.animate());
    }
};

/**
 * Entry Point
 */
window.onload = () => {
    ParticleEngine.init();
    K_App.init();
};