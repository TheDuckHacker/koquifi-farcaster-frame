const axios = require('axios');

class KoquifiIntegration {
    constructor() {
        this.baseUrl = process.env.KOQUIFI_BACKEND_URL || 'http://localhost:3000';
        this.apiKey = process.env.KOQUIFI_API_KEY || '';
    }

    // Integrar con el sistema de autenticación ICM-ICTT
    async authenticateUser(fid, walletAddress = null) {
        try {
            const response = await axios.post(`${this.baseUrl}/auth/register/google`, {
                fid: fid,
                walletAddress: walletAddress,
                source: 'farcaster'
            });
            return response.data;
        } catch (error) {
            console.error('Error authenticating user:', error);
            return { success: false, error: error.message };
        }
    }

    // Comprar ticket usando el sistema original
    async buyTicket(fid, numbers, walletAddress) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/tickets/buy`, {
                userAddress: walletAddress,
                numbers: numbers,
                fid: fid,
                source: 'farcaster'
            });
            return response.data;
        } catch (error) {
            console.error('Error buying ticket:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener estado de la lotería
    async getLotteryStatus() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/lottery/status`);
            return response.data;
        } catch (error) {
            console.error('Error getting lottery status:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener resultados de la lotería
    async getLotteryResults(week = null) {
        try {
            const endpoint = week ? `/api/results/${week}` : '/api/results/latest';
            const response = await axios.get(`${this.baseUrl}${endpoint}`);
            return response.data;
        } catch (error) {
            console.error('Error getting lottery results:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener tickets del usuario
    async getUserTickets(fid) {
        try {
            const response = await axios.get(`${this.baseUrl}/api/tickets/user/${fid}`);
            return response.data;
        } catch (error) {
            console.error('Error getting user tickets:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener información del token KOKI
    async getTokenInfo() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/token/info`);
            return response.data;
        } catch (error) {
            console.error('Error getting token info:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener estadísticas del usuario
    async getUserStats(fid) {
        try {
            const response = await axios.get(`${this.baseUrl}/auth/stats?fid=${fid}`);
            return response.data;
        } catch (error) {
            console.error('Error getting user stats:', error);
            return { success: false, error: error.message };
        }
    }

    // Ejecutar sorteo (solo admin)
    async executeDraw(adminKey) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/draw`, {}, {
                headers: { 'Authorization': `Bearer ${adminKey}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error executing draw:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener información del DEX
    async getDexInfo() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/dex/info`);
            return response.data;
        } catch (error) {
            console.error('Error getting DEX info:', error);
            return { success: false, error: error.message };
        }
    }

    // Realizar swap en el DEX
    async performSwap(fid, fromToken, toToken, amount) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/swap`, {
                fid: fid,
                fromToken: fromToken,
                toToken: toToken,
                amount: amount
            });
            return response.data;
        } catch (error) {
            console.error('Error performing swap:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener información del staking
    async getStakingInfo() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/staking/info`);
            return response.data;
        } catch (error) {
            console.error('Error getting staking info:', error);
            return { success: false, error: error.message };
        }
    }

    // Obtener información del oracle de precios
    async getPriceOracle() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/oracle/prices`);
            return response.data;
        } catch (error) {
            console.error('Error getting price oracle:', error);
            return { success: false, error: error.message };
        }
    }

    // Verificar si el backend está disponible
    async healthCheck() {
        try {
            const response = await axios.get(`${this.baseUrl}/health`);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new KoquifiIntegration();
