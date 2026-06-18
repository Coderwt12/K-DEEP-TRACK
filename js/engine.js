/**
 * K-DEEP XP - CORE ENGINE
 * Optimized Production Version
 * Manages Gamification logic, Leveling math, and Streak persistence.
 */

const K_Engine = {
    XP_PER_LEVEL: 1000,

    /**
     * Calculates level based on total XP
     * @param {number} totalXp
     * @returns {number} Current Level (1-based)
     */
    calculateLevel(totalXp) {
        return Math.floor((totalXp || 0) / this.XP_PER_LEVEL) + 1;
    },

    /**
     * Calculates progress within the current level for UI bars
     * @param {number} totalXp
     * @returns {Object} percentage, currentLevelXp, neededXp
     */
    getXpProgress(totalXp) {
        const currentLevelXp = (totalXp || 0) % this.XP_PER_LEVEL;
        return {
            percentage: (currentLevelXp / this.XP_PER_LEVEL) * 100,
            currentLevelXp,
            neededXp: this.XP_PER_LEVEL
        };
    },

    /**
     * Rewards user with XP and handles level-up events
     * @param {number} amount - XP to add
     * @returns {Object} Updated profile object
     */
    addXP(amount) {
        const data = K_Storage.getData();
        const currentTotalXp = data.profile.totalXp || 0;
        const oldLevel = this.calculateLevel(currentTotalXp);

        // Update XP values
        data.profile.totalXp = currentTotalXp + amount;
        data.profile.xp = data.profile.totalXp % this.XP_PER_LEVEL;

        // Recalculate level
        const newLevel = this.calculateLevel(data.profile.totalXp);
        data.profile.level = newLevel;

        K_Storage.save(data);

        // Handle Level Up Notification (Defensive check for Gamification module)
        if (newLevel > oldLevel && typeof K_Gamification !== 'undefined' && K_Gamification.notify) {
            K_Gamification.notify(
                "LEVEL UP!",
                `You reached Level ${newLevel}`,
                "level"
            );
        }

        return data.profile;
    },

    /**
     * Maintains the consecutive activity streak logic
     * @returns {number} Updated streak count
     */
    updateStreak() {
        const data = K_Storage.getData();
        const now = new Date();
        const todayStr = now.toDateString();

        // 1. First time activation handler
        if (!data.profile.lastActive) {
            data.profile.streak = 1;
            data.profile.lastActive = now.toISOString();
            K_Storage.save(data);
            return 1;
        }

        const lastActiveDate = new Date(data.profile.lastActive);
        const lastActiveStr = lastActiveDate.toDateString();

        // 2. Already updated today - do nothing
        if (todayStr === lastActiveStr) {
            return data.profile.streak;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        // 3. Check if user returned next day or missed a window
        if (lastActiveStr === yesterdayStr) {
            data.profile.streak += 1;
        } else {
            data.profile.streak = 1;
        }

        data.profile.lastActive = now.toISOString();
        K_Storage.save(data);

        return data.profile.streak;
    },

    /**
     * Resets gamification progress without deleting habits, journal entries or history logs
     * @returns {Object} Reset profile object
     */
    resetProgress() {
        const data = K_Storage.getData();

        // Use Object.assign for clean property reset
        Object.assign(data.profile, {
            level: 1,
            xp: 0,
            totalXp: 0,
            streak: 0,
            badges: [],
            lastActive: null
        });

        K_Storage.save(data);
        return data.profile;
    }
};