const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');
const ticketService = require('../services/ticketService');
const notificationService = require('../services/notificationService');

// Middleware para verificar administrador
const requireAdmin = (req, res, next) => {
    const { userFid } = req.query;
    
    if (!userFid || !adminService.isAdmin(userFid)) {
        return res.status(403).json({ 
            error: 'Acceso denegado. Se requieren permisos de administrador.' 
        });
    }
    
    next();
};

// Endpoint para ejecutar sorteo
router.post('/draw/execute', requireAdmin, async (req, res) => {
    try {
        const drawResult = await adminService.executeWeeklyDraw();
        
        res.json({
            success: true,
            message: 'Sorteo ejecutado exitosamente',
            draw: drawResult
        });
    } catch (error) {
        console.error('Error executing draw:', error);
        res.status(500).json({ 
            error: 'Error ejecutando sorteo',
            message: error.message 
        });
    }
});

// Endpoint para simular sorteo (testing)
router.post('/draw/simulate', requireAdmin, async (req, res) => {
    try {
        const drawResult = await adminService.simulateDraw();
        
        res.json({
            success: true,
            message: 'Sorteo simulado exitosamente',
            draw: drawResult
        });
    } catch (error) {
        console.error('Error simulating draw:', error);
        res.status(500).json({ 
            error: 'Error simulando sorteo',
            message: error.message 
        });
    }
});

// Endpoint para obtener estadísticas de administración
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const stats = adminService.getAdminStats();
        
        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Error getting admin stats:', error);
        res.status(500).json({ 
            error: 'Error obteniendo estadísticas',
            message: error.message 
        });
    }
});

// Endpoint para obtener historial de sorteos
router.get('/draws/history', requireAdmin, async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const history = adminService.getDrawHistory(parseInt(limit));
        
        res.json({
            success: true,
            history: history,
            total: adminService.drawHistory.length
        });
    } catch (error) {
        console.error('Error getting draw history:', error);
        res.status(500).json({ 
            error: 'Error obteniendo historial',
            message: error.message 
        });
    }
});

// Endpoint para obtener tickets de la semana actual
router.get('/tickets/current-week', requireAdmin, async (req, res) => {
    try {
        const tickets = ticketService.getCurrentWeekTickets();
        const stats = ticketService.getStats();
        
        res.json({
            success: true,
            tickets: tickets,
            stats: stats
        });
    } catch (error) {
        console.error('Error getting current week tickets:', error);
        res.status(500).json({ 
            error: 'Error obteniendo tickets',
            message: error.message 
        });
    }
});

// Endpoint para obtener tickets de un usuario específico
router.get('/tickets/user/:userFid', requireAdmin, async (req, res) => {
    try {
        const { userFid } = req.params;
        const tickets = ticketService.getUserTickets(userFid);
        
        res.json({
            success: true,
            userFid: userFid,
            tickets: tickets,
            count: tickets.length
        });
    } catch (error) {
        console.error('Error getting user tickets:', error);
        res.status(500).json({ 
            error: 'Error obteniendo tickets del usuario',
            message: error.message 
        });
    }
});

// Endpoint para enviar notificación masiva
router.post('/notifications/broadcast', requireAdmin, async (req, res) => {
    try {
        const { type, message, userFilter } = req.body;
        
        if (!type || !message) {
            return res.status(400).json({ 
                error: 'Tipo y mensaje son requeridos' 
            });
        }

        const results = await notificationService.sendBroadcast(type, { message }, userFilter);
        
        res.json({
            success: true,
            message: 'Notificación masiva enviada',
            results: results,
            totalSent: results.filter(r => r.success).length,
            totalFailed: results.filter(r => !r.success).length
        });
    } catch (error) {
        console.error('Error sending broadcast:', error);
        res.status(500).json({ 
            error: 'Error enviando notificación masiva',
            message: error.message 
        });
    }
});

// Endpoint para limpiar datos de testing
router.post('/cleanup/test-data', requireAdmin, async (req, res) => {
    try {
        adminService.clearTestData();
        
        res.json({
            success: true,
            message: 'Datos de testing limpiados exitosamente'
        });
    } catch (error) {
        console.error('Error cleaning test data:', error);
        res.status(500).json({ 
            error: 'Error limpiando datos de testing',
            message: error.message 
        });
    }
});

// Endpoint para agregar administrador
router.post('/admin/add', requireAdmin, async (req, res) => {
    try {
        const { userFid } = req.body;
        
        if (!userFid) {
            return res.status(400).json({ 
                error: 'userFid es requerido' 
            });
        }

        adminService.addAdmin(userFid);
        
        res.json({
            success: true,
            message: `Usuario ${userFid} agregado como administrador`
        });
    } catch (error) {
        console.error('Error adding admin:', error);
        res.status(500).json({ 
            error: 'Error agregando administrador',
            message: error.message 
        });
    }
});

// Endpoint para remover administrador
router.post('/admin/remove', requireAdmin, async (req, res) => {
    try {
        const { userFid } = req.body;
        
        if (!userFid) {
            return res.status(400).json({ 
                error: 'userFid es requerido' 
            });
        }

        adminService.removeAdmin(userFid);
        
        res.json({
            success: true,
            message: `Usuario ${userFid} removido como administrador`
        });
    } catch (error) {
        console.error('Error removing admin:', error);
        res.status(500).json({ 
            error: 'Error removiendo administrador',
            message: error.message 
        });
    }
});

// Endpoint para obtener lista de administradores
router.get('/admin/list', requireAdmin, async (req, res) => {
    try {
        const admins = Array.from(adminService.adminUsers);
        
        res.json({
            success: true,
            admins: admins
        });
    } catch (error) {
        console.error('Error getting admin list:', error);
        res.status(500).json({ 
            error: 'Error obteniendo lista de administradores',
            message: error.message 
        });
    }
});

// Endpoint de salud para administración
router.get('/health', requireAdmin, async (req, res) => {
    try {
        const stats = adminService.getAdminStats();
        
        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            stats: {
                totalTickets: stats.tickets.totalTickets,
                totalUsers: stats.tickets.totalUsers,
                totalDraws: stats.draws.total,
                totalNotifications: stats.notifications.totalNotifications
            }
        });
    } catch (error) {
        console.error('Error in admin health check:', error);
        res.status(500).json({ 
            error: 'Error en verificación de salud',
            message: error.message 
        });
    }
});

module.exports = router;
