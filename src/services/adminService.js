const ticketService = require('./ticketService');
const notificationService = require('./notificationService');
const blockchainService = require('./blockchain');

class AdminService {
    constructor() {
        this.adminUsers = new Set(['admin', 'owner']); // Usuarios administradores
        this.drawHistory = []; // Historial de sorteos
    }

    // Verificar si un usuario es administrador
    isAdmin(userFid) {
        return this.adminUsers.has(userFid.toString());
    }

    // Ejecutar sorteo semanal
    async executeWeeklyDraw() {
        try {
            console.log('🎲 Ejecutando sorteo semanal...');
            
            // Obtener tickets de la semana actual
            const currentWeekTickets = ticketService.getCurrentWeekTickets();
            const currentWeek = ticketService.getCurrentWeek();
            
            if (currentWeekTickets.length === 0) {
                throw new Error('No hay tickets para el sorteo de esta semana');
            }

            // Generar números ganadores
            const winningNumbers = this.generateWinningNumbers();
            
            // Calcular ganadores
            const winners = this.calculateWinners(currentWeekTickets, winningNumbers);
            
            // Crear registro del sorteo
            const drawRecord = {
                id: this.generateDrawId(),
                week: currentWeek,
                drawTime: new Date().toISOString(),
                winningNumbers: winningNumbers,
                totalTickets: currentWeekTickets.length,
                winners: winners,
                prizeDistribution: this.calculatePrizeDistribution(winners),
                totalPrize: this.calculateTotalPrize(winners)
            };

            // Guardar en historial
            this.drawHistory.push(drawRecord);

            // Notificar a todos los usuarios
            await this.notifyAllUsers(drawRecord);

            console.log('✅ Sorteo ejecutado exitosamente:', drawRecord);
            return drawRecord;

        } catch (error) {
            console.error('❌ Error ejecutando sorteo:', error);
            throw error;
        }
    }

    // Generar números ganadores
    generateWinningNumbers() {
        const numbers = [];
        while (numbers.length < 5) {
            const num = Math.floor(Math.random() * 50) + 1;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        return numbers.sort((a, b) => a - b);
    }

    // Calcular ganadores
    calculateWinners(tickets, winningNumbers) {
        const winners = {
            level1: [], // 5 aciertos
            level2: [], // 4 aciertos
            level3: []  // 3 aciertos
        };

        for (const ticket of tickets) {
            const matches = this.countMatches(ticket.numbers, winningNumbers);
            
            if (matches >= 3) {
                const winnerInfo = {
                    ticketId: ticket.id,
                    userFid: ticket.userFid,
                    numbers: ticket.numbers,
                    matches: matches,
                    prize: this.calculatePrize(matches)
                };

                if (matches === 5) {
                    winners.level1.push(winnerInfo);
                } else if (matches === 4) {
                    winners.level2.push(winnerInfo);
                } else if (matches === 3) {
                    winners.level3.push(winnerInfo);
                }
            }
        }

        return winners;
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

    // Calcular premio individual
    calculatePrize(matches) {
        switch (matches) {
            case 5: return '50% del pool';
            case 4: return '30% del pool';
            case 3: return '20% del pool';
            default: return '0';
        }
    }

    // Calcular distribución de premios
    calculatePrizeDistribution(winners) {
        const totalWinners = winners.level1.length + winners.level2.length + winners.level3.length;
        
        return {
            level1: {
                count: winners.level1.length,
                prize: winners.level1.length > 0 ? '50% del pool' : '0',
                winners: winners.level1.map(w => w.userFid)
            },
            level2: {
                count: winners.level2.length,
                prize: winners.level2.length > 0 ? '30% del pool' : '0',
                winners: winners.level2.map(w => w.userFid)
            },
            level3: {
                count: winners.level3.length,
                prize: winners.level3.length > 0 ? '20% del pool' : '0',
                winners: winners.level3.map(w => w.userFid)
            },
            totalWinners: totalWinners
        };
    }

    // Calcular premio total
    calculateTotalPrize(winners) {
        const totalWinners = winners.level1.length + winners.level2.length + winners.level3.length;
        if (totalWinners === 0) return '0 ETH';
        
        // Simular pool de premios
        const basePool = 10; // ETH base
        const ticketRevenue = ticketService.getStats().totalRevenue;
        const totalPool = parseFloat(ticketRevenue) + basePool;
        
        return `${totalPool.toFixed(2)} ETH`;
    }

    // Notificar a todos los usuarios
    async notifyAllUsers(drawRecord) {
        const allUsers = Array.from(ticketService.userTickets.keys());
        const results = [];

        for (const userFid of allUsers) {
            try {
                // Verificar si el usuario ganó
                const userWinnings = this.getUserWinnings(userFid, drawRecord);
                
                const notificationData = {
                    drawRecord: drawRecord,
                    userWinnings: userWinnings
                };

                await notificationService.notifyDrawResult(userFid, notificationData);
                results.push({ userFid, success: true });
            } catch (error) {
                console.error(`Error notifying user ${userFid}:`, error);
                results.push({ userFid, success: false, error: error.message });
            }
        }

        return results;
    }

    // Obtener ganancias de un usuario
    getUserWinnings(userFid, drawRecord) {
        const userWinnings = [];
        
        // Buscar en todos los niveles
        for (const level of ['level1', 'level2', 'level3']) {
            for (const winner of drawRecord.winners[level]) {
                if (winner.userFid === userFid) {
                    userWinnings.push(winner);
                }
            }
        }

        return userWinnings;
    }

    // Obtener estadísticas de administración
    getAdminStats() {
        const ticketStats = ticketService.getStats();
        const notificationStats = notificationService.getNotificationStats();
        const lotteryState = blockchainService.getLotteryState();

        return {
            tickets: ticketStats,
            notifications: notificationStats,
            lottery: lotteryState,
            draws: {
                total: this.drawHistory.length,
                lastDraw: this.drawHistory[this.drawHistory.length - 1] || null
            },
            timestamp: new Date().toISOString()
        };
    }

    // Obtener historial de sorteos
    getDrawHistory(limit = 10) {
        return this.drawHistory
            .sort((a, b) => new Date(b.drawTime) - new Date(a.drawTime))
            .slice(0, limit);
    }

    // Generar ID único para sorteo
    generateDrawId() {
        return 'DRAW-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Simular sorteo (para testing)
    async simulateDraw() {
        console.log('🎲 Simulando sorteo...');
        
        // Crear algunos tickets de prueba si no existen
        if (ticketService.getCurrentWeekTickets().length === 0) {
            console.log('📝 Creando tickets de prueba...');
            for (let i = 0; i < 10; i++) {
                await ticketService.buyTicket(`test_user_${i}`);
            }
        }

        return await this.executeWeeklyDraw();
    }

    // Limpiar datos de testing
    clearTestData() {
        ticketService.tickets.clear();
        ticketService.userTickets.clear();
        notificationService.notifications.clear();
        this.drawHistory = [];
        console.log('🧹 Datos de testing limpiados');
    }

    // Agregar usuario administrador
    addAdmin(userFid) {
        this.adminUsers.add(userFid.toString());
        console.log(`👑 Usuario ${userFid} agregado como administrador`);
    }

    // Remover usuario administrador
    removeAdmin(userFid) {
        this.adminUsers.delete(userFid.toString());
        console.log(`👤 Usuario ${userFid} removido como administrador`);
    }
}

module.exports = new AdminService();
