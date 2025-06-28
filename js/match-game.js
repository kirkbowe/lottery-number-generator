class MatchGame {
    constructor() {
        this.lotteryConfig = new LotteryConfig();
        this.rngRouter = new RNGRouter();
        this.isRunning = false;
        this.playerNumbers = { main: [], additional: [] };
        this.requiredMatches = { main: 3, additional: 0, total: 3 };
        this.currentMethod = 'crypto';
        this.matchFrequencies = new Map();
        this.startTime = null;
        this.statistics = this.resetStatistics();
    }

    resetStatistics() {
        this.matchFrequencies.clear();
        return {
            totalRuns: 0,
            totalTime: 0,
            bestMainMatches: 0,
            bestAdditionalMatches: 0,
            bestTotalMatches: 0,
            bestMatchNumbers: [],
            allMatches: [],
            averageTime: 0,
            runsPerSecond: 0,
            matchFrequencies: new Map()
        };
    }

    setPlayerNumbers(mainNumbers, additionalNumbers = []) {
        this.playerNumbers.main = [...mainNumbers].sort((a, b) => a - b);
        this.playerNumbers.additional = [...additionalNumbers].sort((a, b) => a - b);
    }

    setRequiredMatches(mainCount, additionalCount = 0, totalCount = null) {
        this.requiredMatches = {
            main: mainCount,
            additional: additionalCount,
            total: totalCount || (mainCount + additionalCount)
        };
    }

    setRNGMethod(method) {
        this.currentMethod = method;
    }

    countMatches(generatedMain, generatedAdditional) {
        const mainMatches = this.playerNumbers.main.filter(num => 
            generatedMain.includes(num)
        ).length;
        
        const additionalMatches = this.playerNumbers.additional.filter(num => 
            generatedAdditional.includes(num)
        ).length;

        return {
            main: mainMatches,
            additional: additionalMatches,
            total: mainMatches + additionalMatches,
            matchedNumbers: {
                main: this.playerNumbers.main.filter(num => generatedMain.includes(num)),
                additional: this.playerNumbers.additional.filter(num => generatedAdditional.includes(num))
            }
        };
    }

    updateStatistics(matchResult, elapsedTime) {
        this.statistics.totalRuns++;
        this.statistics.totalTime = elapsedTime;
        this.statistics.averageTime = elapsedTime / this.statistics.totalRuns;
        this.statistics.runsPerSecond = this.statistics.totalRuns / (elapsedTime / 1000);

        if (matchResult.main > this.statistics.bestMainMatches) {
            this.statistics.bestMainMatches = matchResult.main;
        }
        if (matchResult.additional > this.statistics.bestAdditionalMatches) {
            this.statistics.bestAdditionalMatches = matchResult.additional;
        }
        if (matchResult.total > this.statistics.bestTotalMatches) {
            this.statistics.bestTotalMatches = matchResult.total;
            this.statistics.bestMatchNumbers = [
                ...matchResult.matchedNumbers.main,
                ...matchResult.matchedNumbers.additional
            ];
        }

        // Update match frequency tracking
        const matchKey = `${matchResult.main}+${matchResult.additional}`;
        const currentCount = this.matchFrequencies.get(matchKey) || 0;
        this.matchFrequencies.set(matchKey, currentCount + 1);
        this.statistics.matchFrequencies = new Map(this.matchFrequencies);
        

        if (matchResult.total > 0) {
            this.statistics.allMatches.push({
                run: this.statistics.totalRuns,
                mainMatches: matchResult.main,
                additionalMatches: matchResult.additional,
                totalMatches: matchResult.total,
                matchedNumbers: matchResult.matchedNumbers,
                time: elapsedTime
            });
        }
    }

    formatTime(milliseconds) {
        if (milliseconds < 1000) {
            return `${milliseconds}ms`;
        } else if (milliseconds < 60000) {
            return `${(milliseconds / 1000).toFixed(1)}s`;
        } else if (milliseconds < 3600000) {
            const minutes = Math.floor(milliseconds / 60000);
            const seconds = Math.floor((milliseconds % 60000) / 1000);
            return `${minutes}m ${seconds}s`;
        } else {
            const hours = Math.floor(milliseconds / 3600000);
            const minutes = Math.floor((milliseconds % 3600000) / 60000);
            return `${hours}h ${minutes}m`;
        }
    }

    isWinningMatch(matchResult) {
        return matchResult.main >= this.requiredMatches.main && 
               matchResult.additional >= this.requiredMatches.additional;
    }

    getStatistics() {
        return {
            ...this.statistics,
            formattedTime: this.formatTime(this.statistics.totalTime),
            formattedAverageTime: this.formatTime(this.statistics.averageTime),
            runsPerSecond: this.statistics.runsPerSecond.toFixed(2),
            sortedMatchFrequencies: this.getSortedMatchFrequencies()
        };
    }

    getSortedMatchFrequencies() {
        if (!this.matchFrequencies || this.matchFrequencies.size === 0) {
            return [];
        }
        
        const frequencyArray = Array.from(this.matchFrequencies.entries());
        return frequencyArray
            .map(([key, count]) => {
                const [main, additional] = key.split('+').map(Number);
                return {
                    main,
                    additional,
                    total: main + additional,
                    count,
                    percentage: (count / this.statistics.totalRuns * 100).toFixed(2),
                    key
                };
            })
            .sort((a, b) => b.count - a.count);
    }

    async runSingleGeneration() {
        const config = this.lotteryConfig.getCurrentConfig();
        if (!config) throw new Error('No lottery configuration selected');

        const mainNumbers = await this.rngRouter.generateNumbers(
            this.currentMethod, 
            config, 
            config.numBalls
        );

        const additionalNumbers = await this.rngRouter.generateAdditionalBalls(
            this.currentMethod, 
            config
        );

        return { main: mainNumbers, additional: additionalNumbers };
    }

    async startMatching(onProgress, onMatch, onComplete) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now();
        this.statistics = this.resetStatistics();

        const runGeneration = async () => {
            if (!this.isRunning) return;

            try {
                const generated = await this.runSingleGeneration();
                const matchResult = this.countMatches(generated.main, generated.additional);
                const elapsedTime = Date.now() - this.startTime;
                
                this.updateStatistics(matchResult, elapsedTime);

                if (onProgress) {
                    onProgress(this.getStatistics(), matchResult, generated);
                }

                if (matchResult.total > 0 && onMatch) {
                    onMatch(matchResult, generated, this.statistics.totalRuns);
                }

                if (this.isWinningMatch(matchResult)) {
                    this.isRunning = false;
                    if (onComplete) {
                        onComplete(matchResult, generated, this.getStatistics());
                    }
                    return;
                }

                setTimeout(runGeneration, 1);
                
            } catch (error) {
                console.error('Error during generation:', error);
                this.isRunning = false;
            }
        };

        runGeneration();
    }

    stop() {
        this.isRunning = false;
    }

    getEstimatedOdds() {
        const config = this.lotteryConfig.getCurrentConfig();
        if (!config) return null;

        const mainOdds = this.calculateCombinations(config.maxNumber, config.numBalls);
        let additionalOdds = 1;
        
        if (config.additionalBalls) {
            additionalOdds = this.calculateCombinations(
                config.additionalBalls.maxNumber, 
                config.additionalBalls.num
            );
        }

        const totalOdds = mainOdds * additionalOdds;
        
        return {
            main: mainOdds,
            additional: additionalOdds,
            total: totalOdds,
            formatted: this.formatOdds(totalOdds)
        };
    }

    calculateCombinations(n, r) {
        if (r > n) return 0;
        if (r === 0 || r === n) return 1;
        
        let result = 1;
        for (let i = 0; i < r; i++) {
            result = result * (n - i) / (i + 1);
        }
        return Math.round(result);
    }

    formatOdds(odds) {
        if (odds < 1000) {
            return `1 in ${odds}`;
        } else if (odds < 1000000) {
            return `1 in ${(odds / 1000).toFixed(1)}K`;
        } else if (odds < 1000000000) {
            return `1 in ${(odds / 1000000).toFixed(1)}M`;
        } else {
            return `1 in ${(odds / 1000000000).toFixed(1)}B`;
        }
    }

    getMatchProbabilities() {
        const config = this.lotteryConfig.getCurrentConfig();
        if (!config) return null;

        const probabilities = {};
        const playerMainCount = this.playerNumbers.main.length;
        const playerAdditionalCount = this.playerNumbers.additional.length;

        for (let matches = 1; matches <= playerMainCount + playerAdditionalCount; matches++) {
            let probability = 0;
            
            for (let mainMatches = 0; mainMatches <= Math.min(matches, playerMainCount); mainMatches++) {
                const additionalMatches = matches - mainMatches;
                if (additionalMatches > playerAdditionalCount) continue;

                const mainProb = this.hypergeometric(
                    config.maxNumber, playerMainCount, config.numBalls, mainMatches
                );
                
                let additionalProb = 1;
                if (config.additionalBalls && additionalMatches > 0) {
                    additionalProb = this.hypergeometric(
                        config.additionalBalls.maxNumber, 
                        playerAdditionalCount, 
                        config.additionalBalls.num, 
                        additionalMatches
                    );
                }

                probability += mainProb * additionalProb;
            }

            probabilities[matches] = {
                probability: probability,
                odds: probability > 0 ? 1 / probability : Infinity,
                formatted: probability > 0 ? this.formatOdds(1 / probability) : 'Impossible'
            };
        }

        return probabilities;
    }

    hypergeometric(N, K, n, k) {
        if (k > K || k > n || n > N) return 0;
        
        return (this.calculateCombinations(K, k) * this.calculateCombinations(N - K, n - k)) / 
               this.calculateCombinations(N, n);
    }
}

window.MatchGame = MatchGame;