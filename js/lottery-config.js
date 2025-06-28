class LotteryConfig {
    constructor() {
        this.configurations = {};
        this.currentConfig = null;
    }

    async loadConfigurations() {
        try {
            const response = await fetch('./lotteries.json');
            this.configurations = await response.json();
            return this.configurations;
        } catch (error) {
            console.error('Error loading lottery configurations:', error);
            return this.getDefaultConfigurations();
        }
    }

    getDefaultConfigurations() {
        return {
            "UK National Lottery": {
                "numBalls": 6,
                "maxNumber": 59,
                "additionalBalls": null
            },
            "Powerball (USA)": {
                "numBalls": 5,
                "maxNumber": 69,
                "additionalBalls": { "num": 1, "maxNumber": 26 }
            },
            "EuroMillions": {
                "numBalls": 5,
                "maxNumber": 50,
                "additionalBalls": { "num": 2, "maxNumber": 12 }
            }
        };
    }

    getLotteryNames() {
        return Object.keys(this.configurations);
    }

    getLotteryConfig(name) {
        return this.configurations[name];
    }

    setCurrentLottery(name) {
        this.currentConfig = this.configurations[name];
        return this.currentConfig;
    }

    getCurrentConfig() {
        return this.currentConfig;
    }

    getTotalNumbersNeeded() {
        if (!this.currentConfig) return 0;
        
        let total = this.currentConfig.numBalls;
        if (this.currentConfig.additionalBalls) {
            total += this.currentConfig.additionalBalls.num;
        }
        return total;
    }

    getMainBallsInfo() {
        if (!this.currentConfig) return null;
        return {
            count: this.currentConfig.numBalls,
            maxNumber: this.currentConfig.maxNumber
        };
    }

    getAdditionalBallsInfo() {
        if (!this.currentConfig || !this.currentConfig.additionalBalls) return null;
        return this.currentConfig.additionalBalls;
    }
}

window.LotteryConfig = LotteryConfig;