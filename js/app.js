/**
 * APP CORE
 * Handles Routing and Global UI Updates
 */

const K_App = {
    currentView: 'dashboard',

    init() {
        console.log("K-DEEP XP Initializing...");

        if (typeof K_Gamification !== "undefined") {
            K_Gamification.init();
        }

        this.bindEvents();
        this.setupMobileMenu();

        this.updateGlobalUI();
        this.switchView('dashboard');

        document
            .querySelector('.sidebar')
            ?.classList.remove('mobile-open');

        K_Engine.updateStreak();
    },

    bindEvents() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                this.switchView(view);
            });
        });

        window.addEventListener('xpGain', (e) => {
            this.showXpPopup(e.detail.amount, e.detail.x, e.detail.y);
            this.updateGlobalUI();
        });
    },
    setupMobileMenu() {

        const btn = document.getElementById('menu-toggle');
        const sidebar = document.querySelector('.sidebar');

        if (!btn || !sidebar) return;

        btn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });

    },

    switchView(viewName) {
        this.currentView = viewName;
        const container = document.getElementById('view-container');

        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

        const activeNav = document.querySelector(`[data-view="${viewName}"]`);
        if (activeNav) activeNav.classList.add('active');

        container.innerHTML = `<div class="view-animate">${this.renderView(viewName)}</div>`;

        if (viewName === 'dashboard') K_Dashboard.init();
        if (viewName === 'habits') K_Habits.init();
        if (viewName === 'study') K_Study.init();
        if (viewName === 'journal') K_Journal.init();
        if (viewName === 'analytics') K_Analytics.init();
        if (viewName === 'settings') K_Settings.init();
    },

    renderView(view) {
        switch (view) {
            case 'dashboard':
                return K_Dashboard.template;

            case 'habits':
                return K_Habits.template;

            case 'study':
                return K_Study.template;

            case 'journal':
                return K_Journal.template;

            case 'analytics':
                return K_Analytics.template;

            case 'settings':
                return K_Settings.template;

            default:
                return K_Dashboard.template;
        }
    },

    updateGlobalUI() {
        const data = K_Storage.getData();
        const xpProgress = K_Engine.getXpProgress(data.profile.totalXp);

        document.getElementById('current-level').innerText = data.profile.level;
        document.getElementById('xp-ratio').innerText =
            `${Math.floor(xpProgress.currentLevelXp)} / ${xpProgress.neededXp} XP`;

        document.getElementById('xp-fill').style.width =
            `${xpProgress.percentage}%`;

        document.getElementById('global-streak').innerText =
            data.profile.streak;

        const ranks = [
            "NOVICE",
            "INITIATE",
            "ACOLYTE",
            "WARRIOR",
            "MASTER",
            "SAGE",
            "LEGEND"
        ];

        const rankIndex =
            Math.min(Math.floor((data.profile.level - 1) / 5), ranks.length - 1);

        document.getElementById('rank-name').innerText =
            ranks[rankIndex];
    },

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

        this.particles.forEach(p => {

            p.x += p.vx;
            p.y += p.vy;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

            this.ctx.fillStyle = '#06b6d4';
            this.ctx.fill();

            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

        });

        requestAnimationFrame(() => this.animate());
    }
};

window.onload = () =>
    K_App.init();
ParticleEngine.init();
document.addEventListener("mousemove", (e) => {

    document.querySelectorAll(".tilt-card").forEach(card => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 10;
        const rotateX = ((y / rect.height) - 0.5) * -10;

        card.style.transform =
            `perspective(1000px)
             rotateX(${rotateX}deg)
             rotateY(${rotateY}deg)`;

    });

});

document.addEventListener("mouseleave", () => {

    document.querySelectorAll(".tilt-card").forEach(card => {

        card.style.transform =
            "perspective(1000px) rotateX(0deg) rotateY(0deg)";

    });

});