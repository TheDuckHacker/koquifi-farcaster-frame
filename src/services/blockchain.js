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
        return {
            currentWeek: '42',
            ticketPrice: '0.1',
            totalTickets: '1250',
            lastDrawTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString('es-ES'),
            nextDraw: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleString('es-ES'),
            timeUntilDraw: '5d 12h 30m',
            poolBalance: '125.5',
            network: 'Base Sepolia (Simulado)',
            contractAddress: 'TBD',
            status: 'active'
        };
    }
    
    getSimulatedResults() {
        return {
            numbers: [7, 23, 31, 42, 49],
            drawTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString('es-ES'),
            week: '41',
            winners: {
                level1: 2,
                level2: 15,
                level3: 89
            },
            totalPrize: '125.5'
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
