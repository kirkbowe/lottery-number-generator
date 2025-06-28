function getUnbiasedCryptoRandom(min, max) {
    const range = max - min + 1;
    const maxValid = Math.floor(2**32 / range) * range - 1;
    
    let randomValue;
    do {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        randomValue = array[0];
    } while (randomValue > maxValid);
    
    return min + (randomValue % range);
}

class MultiEntropyRNG {
    constructor() {
        this.entropyWeights = {
            crypto: 0.30,
            quantum: 0.25,
            atmospheric: 0.20,
            timing: 0.15,
            hardware: 0.10
        };
    }

    generateNumber(min, max) {
        const sources = {
            crypto: this.getCryptoSource(min, max),
            quantum: this.getQuantumSource(min, max),
            atmospheric: this.getAtmosphericSource(min, max),
            timing: this.getTimingSource(min, max),
            hardware: this.getHardwareSource(min, max)
        };

        let weightedSum = 0;
        let totalWeight = 0;

        for (const [source, value] of Object.entries(sources)) {
            const weight = this.entropyWeights[source];
            weightedSum += value * weight;
            totalWeight += weight;
        }

        const result = Math.round(weightedSum / totalWeight);
        return Math.max(min, Math.min(max, result));
    }

    getCryptoSource(min, max) {
        return getUnbiasedCryptoRandom(min, max);
    }

    getQuantumSource(min, max) {
        const quantum = new QuantumInspiredRNG();
        return quantum.generateQuantumNumber(min, max);
    }

    getAtmosphericSource(min, max) {
        const chaos = new AtmosphericChaosGenerator();
        const chaosValue = chaos.generateChaosValue();
        return min + Math.floor(chaosValue * (max - min + 1));
    }

    getTimingSource(min, max) {
        const highResTime = performance.now();
        const microSeconds = (highResTime % 1) * 1000000;
        const normalizedValue = (microSeconds % 1000) / 1000;
        return min + Math.floor(normalizedValue * (max - min + 1));
    }

    getHardwareSource(min, max) {
        const concurrency = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 8;
        const screenArea = screen.width * screen.height;
        
        const seed = (concurrency * 1000 + memory * 100 + (screenArea % 10000)) % 10000;
        const normalizedValue = (seed / 10000 + Math.sin(Date.now() / 1000) + 1) / 2;
        return min + Math.floor(normalizedValue * (max - min + 1));
    }
}

class LotteryBallSimulator {
    constructor(ballCount, drawTime = 30000) {
        this.ballCount = ballCount;
        this.drawTime = drawTime;
        this.balls = [];
        this.lorenzState = { x: 1, y: 1, z: 1 };
        this.sigma = 10;
        this.rho = 28;
        this.beta = 8/3;
    }

    initializeBalls() {
        this.balls = [];
        for (let i = 1; i <= this.ballCount; i++) {
            this.balls.push({
                number: i,
                weight: 1.0 + (Math.random() - 0.5) * 0.01,
                surfaceRoughness: Math.random() * 0.1 + 0.95,
                position: {
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    z: Math.random() * 100
                },
                velocity: {
                    x: (Math.random() - 0.5) * 10,
                    y: (Math.random() - 0.5) * 10,
                    z: (Math.random() - 0.5) * 10
                },
                exitProbability: 0
            });
        }
    }

    simulateChaos(ball, deltaTime, atmosphericFactor) {
        const dt = deltaTime / 1000;
        
        const dx = this.sigma * (this.lorenzState.y - this.lorenzState.x) * dt;
        const dy = (this.lorenzState.x * (this.rho - this.lorenzState.z) - this.lorenzState.y) * dt;
        const dz = (this.lorenzState.x * this.lorenzState.y - this.beta * this.lorenzState.z) * dt;
        
        this.lorenzState.x += dx * ball.weight * atmosphericFactor;
        this.lorenzState.y += dy * ball.surfaceRoughness * atmosphericFactor;
        this.lorenzState.z += dz * atmosphericFactor;
        
        ball.velocity.x += (this.lorenzState.x - ball.position.x) * 0.01 * dt;
        ball.velocity.y += (this.lorenzState.y - ball.position.y) * 0.01 * dt;
        ball.velocity.z += (this.lorenzState.z - ball.position.z) * 0.01 * dt;
        
        ball.velocity.x *= 0.99;
        ball.velocity.y *= 0.99;
        ball.velocity.z *= 0.99;
        
        ball.position.x += ball.velocity.x * dt;
        ball.position.y += ball.velocity.y * dt;
        ball.position.z += ball.velocity.z * dt;
        
        const speed = Math.sqrt(
            ball.velocity.x ** 2 + 
            ball.velocity.y ** 2 + 
            ball.velocity.z ** 2
        );
        const chaosIntensity = Math.abs(this.lorenzState.x) + Math.abs(this.lorenzState.y) + Math.abs(this.lorenzState.z);
        
        ball.exitProbability = (speed * 0.1 + chaosIntensity * 0.05) * ball.weight;
    }

    async generateDrawNumbers(count) {
        this.initializeBalls();
        
        const startTime = Date.now();
        const selectedNumbers = [];
        const availableBalls = [...this.balls];
        const chaos = new AtmosphericChaosGenerator();
        
        return new Promise((resolve) => {
            const simulationStep = () => {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / this.drawTime, 1);
                
                if (selectedNumbers.length >= count || progress >= 1) {
                    while (selectedNumbers.length < count && availableBalls.length > 0) {
                        const randomIndex = Math.floor(Math.random() * availableBalls.length);
                        selectedNumbers.push(availableBalls[randomIndex].number);
                        availableBalls.splice(randomIndex, 1);
                    }
                    resolve(selectedNumbers.sort((a, b) => a - b));
                    return;
                }
                
                const atmosphericFactor = chaos.generateChaosValue();
                const deltaTime = 50;
                
                for (const ball of availableBalls) {
                    this.simulateChaos(ball, deltaTime, atmosphericFactor);
                    
                    if (ball.exitProbability > Math.random() * 10 && selectedNumbers.length < count) {
                        selectedNumbers.push(ball.number);
                        const ballIndex = availableBalls.indexOf(ball);
                        availableBalls.splice(ballIndex, 1);
                    }
                }
                
                setTimeout(simulationStep, deltaTime);
            };
            
            simulationStep();
        });
    }
}

class QuantumInspiredRNG {
    constructor() {
        this.quantumState = new Array(8).fill(0).map(() => Math.random());
    }

    generateQuantumNumber(min, max) {
        this.updateQuantumState();
        
        let measurement = 0;
        for (let i = 0; i < this.quantumState.length; i++) {
            const amplitude = Math.cos(this.quantumState[i] * Math.PI * 2);
            measurement += amplitude * amplitude;
        }
        
        const collapsed = Math.abs(measurement / this.quantumState.length);
        const finalValue = min + Math.floor(collapsed * (max - min + 1));
        return Math.max(min, Math.min(max, finalValue));
    }

    updateQuantumState() {
        for (let i = 0; i < this.quantumState.length; i++) {
            this.quantumState[i] += (Math.random() - 0.5) * 0.1;
            this.quantumState[i] = Math.max(0, Math.min(1, this.quantumState[i]));
        }
    }
}

class AtmosphericChaosGenerator {
    generateChaosValue() {
        const timestamp = Date.now();
        const pressure = Math.sin(timestamp / 10000) * 0.5 + 0.5;
        
        const concurrency = navigator.hardwareConcurrency || 4;
        const temperature = (Math.sin(timestamp / 7000 + concurrency) * 0.3 + 0.7);
        
        const humidity = Math.cos(timestamp / 5000 + screen.width + screen.height) * 0.4 + 0.6;
        
        return (pressure * 0.4 + temperature * 0.35 + humidity * 0.25);
    }
}

class RNGRouter {
    constructor() {
        this.multiEntropy = new MultiEntropyRNG();
        this.quantum = new QuantumInspiredRNG();
    }

    async generateNumbers(method, config, count) {
        const numbers = [];
        const availableNumbers = Array.from(
            { length: config.maxNumber }, 
            (_, i) => i + 1
        );

        if (method === 'physical') {
            const simulator = new LotteryBallSimulator(config.maxNumber);
            return await simulator.generateDrawNumbers(count);
        }

        for (let i = 0; i < count; i++) {
            let number;
            
            switch (method) {
                case 'crypto':
                    number = getUnbiasedCryptoRandom(1, availableNumbers.length);
                    break;
                case 'multi-entropy':
                    number = this.multiEntropy.generateNumber(1, availableNumbers.length);
                    break;
                case 'quantum':
                    number = this.quantum.generateQuantumNumber(1, availableNumbers.length);
                    break;
                default:
                    number = getUnbiasedCryptoRandom(1, availableNumbers.length);
            }

            const selectedNumber = availableNumbers[number - 1];
            numbers.push(selectedNumber);
            availableNumbers.splice(number - 1, 1);
        }

        return numbers.sort((a, b) => a - b);
    }

    async generateAdditionalBalls(method, config) {
        if (!config.additionalBalls) return [];
        
        const numbers = [];
        const availableNumbers = Array.from(
            { length: config.additionalBalls.maxNumber }, 
            (_, i) => i + 1
        );

        for (let i = 0; i < config.additionalBalls.num; i++) {
            let number;
            
            switch (method) {
                case 'crypto':
                    number = getUnbiasedCryptoRandom(1, availableNumbers.length);
                    break;
                case 'multi-entropy':
                    number = this.multiEntropy.generateNumber(1, availableNumbers.length);
                    break;
                case 'quantum':
                    number = this.quantum.generateQuantumNumber(1, availableNumbers.length);
                    break;
                default:
                    number = getUnbiasedCryptoRandom(1, availableNumbers.length);
            }

            const selectedNumber = availableNumbers[number - 1];
            numbers.push(selectedNumber);
            availableNumbers.splice(number - 1, 1);
        }

        return numbers;
    }
}

window.RNGRouter = RNGRouter;
window.getUnbiasedCryptoRandom = getUnbiasedCryptoRandom;