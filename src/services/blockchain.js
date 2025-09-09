const { ethers } = require('ethers');

class BlockchainService {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.lotteryContract = null;
        this.initialized = false;
        
        this.initialize();
    }
    
    async initialize() {
        try {
            // Configurar provider para Base Sepolia
            this.provider = new ethers.JsonRpcProvider(
                process.env.BASE_RPC_URL || 'https://sepolia.base.org'
            );
            
            // Configurar wallet si hay private key
            if (process.env.PRIVATE_KEY) {
                this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            }
            
            // ABI simplificado para la lotería
            this.lotteryABI = [
                "function getCurrentWeek() view returns (uint256)",
                "function getTicketPrice() view returns (uint256)",
                "function getTotalTickets() view returns (uint256)",
                "function getLastDrawNumbers() view returns (uint8[5])",
                "function buyTicket(uint8[5] numbers) payable",
                "function getLastDrawTime() view returns (uint256)",
                "function getPoolBalance() view returns (uint256)",
                "function getWinningNumbers() view returns (uint8[5])",
                "function getTicketNumbers(address user, uint256 ticketId) view returns (uint8[5])",
                "function getUserTickets(address user) view returns (uint256[])",
                "function drawNumbers() external",
                "function claimPrize(uint256 ticketId) external",
                "event TicketPurchased(address indexed user, uint256 indexed ticketId, uint8[5] numbers)",
                "event NumbersDrawn(uint8[5] numbers, uint256 timestamp)",
                "event PrizeClaimed(address indexed user, uint256 indexed ticketId, uint256 amount)"
            ];
            
            // Inicializar contrato si hay dirección
            if (process.env.LOTTERY_CONTRACT_ADDRESS) {
                this.lotteryContract = new ethers.Contract(
                    process.env.LOTTERY_CONTRACT_ADDRESS,
                    this.lotteryABI,
                    this.wallet || this.provider
                );
            }
            
            this.initialized = true;
            console.log('✅ Blockchain service initialized');
            
        } catch (error) {
            console.error('❌ Error initializing blockchain service:', error);
            this.initialized = false;
        }
    }
    
    async getLotteryState() {
        try {
            if (!this.initialized || !this.lotteryContract) {
                // Retornar datos simulados si no hay contrato
                return this.getSimulatedLotteryState();
            }
            
            const [currentWeek, ticketPrice, totalTickets, lastDrawTime, poolBalance] = await Promise.all([
                this.lotteryContract.getCurrentWeek(),
                this.lotteryContract.getTicketPrice(),
                this.lotteryContract.getTotalTickets(),
                this.lotteryContract.getLastDrawTime(),
                this.lotteryContract.getPoolBalance()
            ]);
            
            const nextDraw = this.calculateNextDraw(Number(lastDrawTime));
            const timeUntilDraw = this.calculateTimeUntilDraw(Number(lastDrawTime));
            
            return {
                currentWeek: currentWeek.toString(),
                ticketPrice: ethers.formatEther(ticketPrice),
                totalTickets: totalTickets.toString(),
                lastDrawTime: new Date(Number(lastDrawTime) * 1000).toLocaleString('es-ES'),
                nextDraw: nextDraw,
                timeUntilDraw: timeUntilDraw,
                poolBalance: ethers.formatEther(poolBalance),
                network: 'Base Sepolia',
                contractAddress: process.env.LOTTERY_CONTRACT_ADDRESS,
                status: 'active'
            };
            
        } catch (error) {
            console.error('Error getting lottery state:', error);
            return this.getSimulatedLotteryState();
        }
    }
    
    async getLastResults() {
        try {
            if (!this.initialized || !this.lotteryContract) {
                return this.getSimulatedResults();
            }
            
            const [lastNumbers, lastDrawTime] = await Promise.all([
                this.lotteryContract.getLastDrawNumbers(),
                this.lotteryContract.getLastDrawTime()
            ]);
            
            return {
                numbers: lastNumbers.map(n => Number(n)),
                drawTime: new Date(Number(lastDrawTime) * 1000).toLocaleString('es-ES'),
                week: Math.floor(Number(lastDrawTime) / (7 * 24 * 60 * 60)),
                winners: await this.getWinners(lastNumbers),
                totalPrize: await this.getTotalPrize()
            };
            
        } catch (error) {
            console.error('Error getting last results:', error);
            return this.getSimulatedResults();
        }
    }
    
    // Datos simulados para desarrollo
    getSimulatedLotteryState() {
        const now = new Date();
        const lastMonday = new Date(now);
        lastMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Último lunes
        lastMonday.setHours(12, 0, 0, 0);
        
        const nextMonday = new Date(lastMonday);
        nextMonday.setDate(lastMonday.getDate() + 7);
        
        const timeUntilDraw = this.calculateTimeUntilDraw(Math.floor(lastMonday.getTime() / 1000));
        
        return {
            currentWeek: Math.floor((now - new Date('2024-01-01')) / (7 * 24 * 60 * 60 * 1000)).toString(),
            ticketPrice: '0.1',
            totalTickets: Math.floor(Math.random() * 2000 + 500).toString(),
            lastDrawTime: lastMonday.toLocaleString('es-ES'),
            nextDraw: nextMonday.toLocaleString('es-ES'),
            timeUntilDraw: timeUntilDraw,
            poolBalance: (Math.random() * 200 + 50).toFixed(2),
            network: 'Base Sepolia',
            contractAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            status: 'active',
            ticketsSoldThisWeek: Math.floor(Math.random() * 100 + 20)
        };
    }
    
    getSimulatedResults() {
        const lastMonday = new Date();
        lastMonday.setDate(lastMonday.getDate() - ((lastMonday.getDay() + 6) % 7));
        lastMonday.setHours(12, 0, 0, 0);
        
        // Generar números ganadores aleatorios
        const winningNumbers = [];
        while (winningNumbers.length < 5) {
            const num = Math.floor(Math.random() * 50) + 1;
            if (!winningNumbers.includes(num)) {
                winningNumbers.push(num);
            }
        }
        winningNumbers.sort((a, b) => a - b);
        
        return {
            numbers: winningNumbers,
            drawTime: lastMonday.toLocaleString('es-ES'),
            week: Math.floor((lastMonday - new Date('2024-01-01')) / (7 * 24 * 60 * 60 * 1000)).toString(),
            winners: {
                level1: Math.floor(Math.random() * 5), // 5 aciertos
                level2: Math.floor(Math.random() * 20 + 5), // 4 aciertos
                level3: Math.floor(Math.random() * 100 + 20) // 3 aciertos
            },
            totalPrize: (Math.random() * 200 + 50).toFixed(2),
            totalWinners: Math.floor(Math.random() * 125 + 25)
        };
    }
    
    // Métodos auxiliares
    calculateNextDraw(lastDrawTime) {
        const lastDraw = new Date(lastDrawTime * 1000);
        const nextDraw = new Date(lastDraw);
        nextDraw.setDate(nextDraw.getDate() + 7); // Próximo lunes
        return nextDraw.toLocaleString('es-ES');
    }
    
    calculateTimeUntilDraw(lastDrawTime) {
        const lastDraw = new Date(lastDrawTime * 1000);
        const nextDraw = new Date(lastDraw);
        nextDraw.setDate(nextDraw.getDate() + 7);
        
        const now = new Date();
        const diff = nextDraw - now;
        
        if (diff <= 0) {
            return 'Sorteo en progreso';
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${days}d ${hours}h ${minutes}m`;
    }
    
    async getWinners(numbers) {
        // Implementar lógica para obtener ganadores
        return {
            level1: 0, // 5 números correctos
            level2: 0, // 4 números correctos  
            level3: 0  // 3 números correctos
        };
    }
    
    async getTotalPrize() {
        try {
            if (!this.lotteryContract) return '0';
            const balance = await this.lotteryContract.getPoolBalance();
            return ethers.formatEther(balance);
        } catch (error) {
            return '0';
        }
    }
    
    // Verificar conexión a la red
    async checkConnection() {
        try {
            if (!this.provider) return false;
            const network = await this.provider.getNetwork();
            console.log(`Connected to network: ${network.name} (${network.chainId})`);
            return true;
        } catch (error) {
            console.error('Connection check failed:', error);
            return false;
        }
    }
}

module.exports = new BlockchainService();
