/**
 * K-DEEP XP - CORE ENGINE
 * Handles Gamification Math, Leveling Logic, and Streak Management
 */

const K_Engine = {

    XP_PER_LEVEL: 1000,

    calculateLevel(totalXp) {
        return Math.floor(totalXp / this.XP_PER_LEVEL) + 1;
    },

    getXpProgress(totalXp) {
        const currentLevelXp = totalXp % this.XP_PER_LEVEL;

        return {
            percentage: (currentLevelXp / this.XP_PER_LEVEL) * 100,
            currentLevelXp: currentLevelXp,
            neededXp: this.XP_PER_LEVEL
        };
    },

    addXP(amount) {
        const data = K_Storage.getData();

        const oldLevel = this.calculateLevel(data.profile.totalXp);

        data.profile.totalXp += amount;
        data.profile.xp = data.profile.totalXp % this.XP_PER_LEVEL;

        const newLevel = this.calculateLevel(data.profile.totalXp);

        data.profile.level = newLevel;

        K_Storage.save(data);

        if (
            newLevel > oldLevel &&
            typeof K_Gamification !== 'undefined' &&
            K_Gamification.notify
        ) {
            K_Gamification.notify(
                "LEVEL UP!",
                `You reached Level ${newLevel}`,
                "level"
            );
        }

        return data.profile;
    },

    updateStreak() {
        const data = K_Storage.getData();

        const now = new Date();
        const todayStr = now.toDateString();

        if (!data.profile.lastActive) {
            data.profile.streak = 1;
            data.profile.lastActive = now.toISOString();

            K_Storage.save(data);

            return 1;
        }

        const lastActiveDate = new Date(data.profile.lastActive);
        const lastActiveStr = lastActiveDate.toDateString();

        if (todayStr === lastActiveStr) {
            return data.profile.streak;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayStr = yesterday.toDateString();

        if (lastActiveStr === yesterdayStr) {
            data.profile.streak += 1;
        } else {
            data.profile.streak = 1;
        }

        data.profile.lastActive = now.toISOString();

        K_Storage.save(data);

        return data.profile.streak;
    },

    resetProgress() {
        const data = K_Storage.getData();

        data.profile.level = 1;
        data.profile.xp = 0;
        data.profile.totalXp = 0;
        data.profile.streak = 0;
        data.profile.badges = [];
        data.profile.lastActive = null;

        K_Storage.save(data);

        return data.profile;
    }
};