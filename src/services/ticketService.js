const { ethers } = require('ethers');

class TicketService {
    constructor() {
        this.tickets = new Map(); // Simular base de datos de tickets
        this.userTickets = new Map(); // Tickets por usuario
    }

    // Generar números aleatorios únicos para un ticket
    generateTicketNumbers() {
        const numbers = [];
        while (numbers.length < 5) {
            const num = Math.floor(Math.random() * 50) + 1;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        return numbers.sort((a, b) => a - b);
    }

    // Comprar un ticket
    async buyTicket(userFid, numbers = null) {
        try {
            // Si no se proporcionan números, generar aleatorios
            if (!numbers) {
                numbers = this.generateTicketNumbers();
            }

            // Validar números
            if (!this.validateNumbers(numbers)) {
                throw new Error('Números inválidos');
            }

            // Crear ticket
            const ticketId = this.generateTicketId();
            const ticket = {
                id: ticketId,
                userFid: userFid,
                numbers: numbers,
                purchaseTime: new Date().toISOString(),
                week: this.getCurrentWeek(),
                price: '0.1',
                status: 'active',
                transactionHash: this.generateMockTxHash()
            };

            // Guardar ticket
            this.tickets.set(ticketId, ticket);
            
            // Agregar a tickets del usuario
            if (!this.userTickets.has(userFid)) {
                this.userTickets.set(userFid, []);
            }
            this.userTickets.get(userFid).push(ticket);

            return ticket;
        } catch (error) {
            console.error('Error buying ticket:', error);
            throw error;
        }
    }

    // Validar números del ticket
    validateNumbers(numbers) {
        if (!Array.isArray(numbers) || numbers.length !== 5) {
            return false;
        }

        // Verificar que todos los números estén entre 1 y 50
        for (const num of numbers) {
            if (typeof num !== 'number' || num < 1 || num > 50) {
                return false;
            }
        }

        // Verificar que no haya duplicados
        const uniqueNumbers = [...new Set(numbers)];
        return uniqueNumbers.length === 5;
    }

    // Obtener tickets de un usuario
    getUserTickets(userFid) {
        return this.userTickets.get(userFid) || [];
    }

    // Obtener todos los tickets de la semana actual
    getCurrentWeekTickets() {
        const currentWeek = this.getCurrentWeek();
        const weekTickets = [];
        
        for (const ticket of this.tickets.values()) {
            if (ticket.week === currentWeek && ticket.status === 'active') {
                weekTickets.push(ticket);
            }
        }
        
        return weekTickets;
    }

    // Verificar si un usuario ganó
    checkWinning(userFid, winningNumbers) {
        const userTickets = this.getUserTickets(userFid);
        const results = [];

        for (const ticket of userTickets) {
            if (ticket.week === this.getCurrentWeek()) {
                const matches = this.countMatches(ticket.numbers, winningNumbers);
                const prize = this.calculatePrize(matches);
                
                results.push({
                    ticketId: ticket.id,
                    numbers: ticket.numbers,
                    matches: matches,
                    prize: prize,
                    won: matches >= 3
                });
            }
        }

        return results;
    }

    // Contar coincidencias
    countMatches(ticketNumbers, winningNumbers) {
        let matches = 0;
        for (const num of ticketNumbers) {
            if (winningNumbers.includes(num)) {
                matches++;
            }
        }
        return matches;
    }

    // Calcular premio
    calculatePrize(matches) {
        switch (matches) {
            case 5: return '50% del pool';
            case 4: return '30% del pool';
            case 3: return '20% del pool';
            default: return '0';
        }
    }

    // Generar ID único para ticket
    generateTicketId() {
        return 'TKT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Generar hash de transacción simulado
    generateMockTxHash() {
        return '0x' + Math.random().toString(16).substr(2, 64);
    }

    // Obtener semana actual
    getCurrentWeek() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        return Math.floor(days / 7) + 1;
    }

    // Obtener estadísticas
    getStats() {
        const currentWeek = this.getCurrentWeek();
        const weekTickets = this.getCurrentWeekTickets();
        
        return {
            totalTickets: this.tickets.size,
            currentWeekTickets: weekTickets.length,
            totalUsers: this.userTickets.size,
            currentWeek: currentWeek,
            totalRevenue: (this.tickets.size * 0.1).toFixed(2)
        };
    }

    // Simular compra con transacción blockchain
    async simulateBlockchainPurchase(userFid, numbers) {
        try {
            // Simular delay de transacción
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simular éxito/fallo (90% éxito)
            if (Math.random() < 0.9) {
                return await this.buyTicket(userFid, numbers);
            } else {
                throw new Error('Transacción falló en la blockchain');
            }
        } catch (error) {
            console.error('Blockchain purchase simulation failed:', error);
            throw error;
        }
    }
}

module.exports = new TicketService();
