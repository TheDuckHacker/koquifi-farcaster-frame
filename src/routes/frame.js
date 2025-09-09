const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const imageGenerator = require('../services/imageGenerator');
const ticketService = require('../services/ticketService');
const notificationService = require('../services/notificationService');

// Configuración de imágenes - URLs temporales de Unsplash
const IMAGES = {
    main: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=1200&h=630&fit=crop&crop=center",
    buyTicket: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=630&fit=crop&crop=center",
    status: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop&crop=center",
    results: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop&crop=center",
    info: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop&crop=center",
    confirm: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=630&fit=crop&crop=center",
    success: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=630&fit=crop&crop=center",
    error: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop&crop=center"
};

// Endpoint principal para interacciones del Frame
router.post('/interact', async (req, res) => {
    try {
        console.log('Frame interaction received:', req.body);
        
        const { 
            untrustedData, 
            trustedData 
        } = req.body;
        
        if (!untrustedData) {
            return res.json(getMainFrame());
        }
        
        const { buttonIndex, fid, castHash } = untrustedData;
        const userFid = fid;
        
        console.log(`User ${userFid} clicked button ${buttonIndex}`);
        
        let response;
        
        switch(buttonIndex) {
            case 1: // Comprar Ticket
                response = await handleBuyTicket(userFid);
                break;
            case 2: // Ver Estado
                response = await handleViewStatus();
                break;
            case 3: // Ver Resultados
                response = await handleViewResults();
                break;
            case 4: // Info
                response = await handleInfo();
                break;
            default:
                response = getMainFrame();
        }
        
        res.json(response);
    } catch (error) {
        console.error('Error handling frame interaction:', error);
        res.json(getErrorFrame('Error procesando la solicitud'));
    }
});

// Endpoint para confirmar compra de ticket
router.post('/buy-confirm', async (req, res) => {
    try {
        const { untrustedData } = req.body;
        const { fid } = untrustedData || {};
        
        // Aquí implementarías la lógica de compra real
        // Por ahora simulamos la compra
        const success = Math.random() > 0.3; // 70% de éxito
        
        if (success) {
            res.json(getSuccessFrame('¡Ticket comprado exitosamente!'));
        } else {
            res.json(getErrorFrame('Error al comprar ticket. Intenta de nuevo.'));
        }
    } catch (error) {
        console.error('Error confirming purchase:', error);
        res.json(getErrorFrame('Error en la transacción'));
    }
});

// Función para manejar compra de ticket
async function handleBuyTicket(userFid) {
    try {
        const lotteryState = await blockchainService.getLotteryState();
        
        return {
            type: 'frame',
            image: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/image/buy?t=${Date.now()}`,
            buttons: [
                { label: '✅ Confirmar Compra', action: 'post_redirect' },
                { label: '🔙 Volver', action: 'post' }
            ],
            postUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/buy-confirm`,
            state: { userFid, step: 'confirm' }
        };
    } catch (error) {
        console.error('Error in handleBuyTicket:', error);
        return getErrorFrame('Error obteniendo información de la lotería');
    }
}

// Función para ver estado de la lotería
async function handleViewStatus() {
    try {
        const lotteryState = await blockchainService.getLotteryState();
        
        if (!lotteryState) {
            return getErrorFrame('No se pudo obtener el estado de la lotería');
        }
        
        return {
            type: 'frame',
            image: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/image/status?t=${Date.now()}`,
            buttons: [
                { label: '🔄 Actualizar', action: 'post' },
                { label: '🔙 Volver', action: 'post' }
            ],
            postUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/interact`,
            state: { step: 'status' }
        };
    } catch (error) {
        console.error('Error in handleViewStatus:', error);
        return getErrorFrame('Error obteniendo estado');
    }
}

// Función para ver resultados
async function handleViewResults() {
    try {
        const results = await blockchainService.getLastResults();
        
        if (!results) {
            return getErrorFrame('No hay resultados disponibles');
        }
        
        return {
            type: 'frame',
            image: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/image/results?t=${Date.now()}`,
            buttons: [
                { label: '📊 Ver Historial', action: 'post' },
                { label: '🔙 Volver', action: 'post' }
            ],
            postUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/interact`,
            state: { step: 'results' }
        };
    } catch (error) {
        console.error('Error in handleViewResults:', error);
        return getErrorFrame('Error obteniendo resultados');
    }
}

// Función para mostrar información
function handleInfo() {
    return {
        type: 'frame',
        image: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/image/info?t=${Date.now()}`,
        buttons: [
            { label: '🎫 Comprar Ticket', action: 'post' },
            { label: '🔙 Volver', action: 'post' }
        ],
        postUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/interact`,
        state: { step: 'info' }
    };
}

// Frame principal
function getMainFrame() {
    return {
        type: 'frame',
        image: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/image/main?t=${Date.now()}`,
        buttons: [
            { label: '🎫 Comprar Ticket', action: 'post' },
            { label: '📊 Ver Estado', action: 'post' },
            { label: '🏆 Resultados', action: 'post' },
            { label: 'ℹ️ Info', action: 'post' }
        ],
        postUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/interact`,
        state: { step: 'main' }
    };
}

// Frame de éxito
function getSuccessFrame(message) {
    return {
        type: 'frame',
        image: `${IMAGES.success}?t=${Date.now()}`,
        buttons: [
            { label: '🎉 ¡Genial!', action: 'post' },
            { label: '🔙 Volver', action: 'post' }
        ],
        postUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/interact`,
        state: { step: 'success', message }
    };
}

// Frame de error
function getErrorFrame(message) {
    return {
        type: 'frame',
        image: `${IMAGES.error}?t=${Date.now()}`,
        buttons: [
            { label: '🔄 Reintentar', action: 'post' },
            { label: '🔙 Volver', action: 'post' }
        ],
        postUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/interact`,
        state: { step: 'error', message }
    };
}

// Endpoint para generar imagen principal
router.get('/image/main', async (req, res) => {
    try {
        const imageBuffer = await imageGenerator.generateMainFrame();
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=300'); // Cache por 5 minutos
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating main image:', error);
        res.status(500).json({ error: 'Error generando imagen' });
    }
});

// Endpoint para generar imagen de estado
router.get('/image/status', async (req, res) => {
    try {
        const lotteryState = await blockchainService.getLotteryState();
        const imageBuffer = await imageGenerator.generateStatusFrame(lotteryState);
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=60'); // Cache por 1 minuto
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating status image:', error);
        res.status(500).json({ error: 'Error generando imagen de estado' });
    }
});

// Endpoint para generar imagen de resultados
router.get('/image/results', async (req, res) => {
    try {
        const results = await blockchainService.getLastResults();
        const imageBuffer = await imageGenerator.generateResultsFrame(results);
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=300'); // Cache por 5 minutos
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating results image:', error);
        res.status(500).json({ error: 'Error generando imagen de resultados' });
    }
});

// Endpoint para generar imagen de compra
router.get('/image/buy', async (req, res) => {
    try {
        const imageBuffer = await imageGenerator.generateBuyTicketFrame();
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=300'); // Cache por 5 minutos
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating buy image:', error);
        res.status(500).json({ error: 'Error generando imagen de compra' });
    }
});

// Endpoint para generar imagen de información
router.get('/image/info', async (req, res) => {
    try {
        const imageBuffer = await imageGenerator.generateInfoFrame();
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=300'); // Cache por 5 minutos
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating info image:', error);
        res.status(500).json({ error: 'Error generando imagen de información' });
    }
});

// Endpoint para generar imagen de éxito
router.get('/image/success', async (req, res) => {
    try {
        const { ticket } = req.query;
        const ticketData = ticket ? JSON.parse(ticket) : null;
        const imageBuffer = await imageGenerator.generateSuccessFrame(ticketData);
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=60'); // Cache por 1 minuto
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating success image:', error);
        res.status(500).json({ error: 'Error generando imagen de éxito' });
    }
});

// Endpoint para generar imagen de tickets del usuario
router.get('/image/my-tickets', async (req, res) => {
    try {
        const { tickets, currentWeek } = req.query;
        const ticketsData = tickets ? JSON.parse(tickets) : [];
        const week = currentWeek || '1';
        const imageBuffer = await imageGenerator.generateMyTicketsFrame(ticketsData, week);
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=60'); // Cache por 1 minuto
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating my-tickets image:', error);
        res.status(500).json({ error: 'Error generando imagen de tickets' });
    }
});

// Endpoint para generar imagen de error
router.get('/image/error', async (req, res) => {
    try {
        const { message } = req.query;
        const errorMessage = message || 'Error desconocido';
        const imageBuffer = await imageGenerator.generateErrorFrame(errorMessage);
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=60'); // Cache por 1 minuto
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating error image:', error);
        res.status(500).json({ error: 'Error generando imagen de error' });
    }
});

// Endpoint para confirmar compra de ticket
router.post('/buy-confirm', async (req, res) => {
    try {
        console.log('Confirming ticket purchase:', req.body);
        const { untrustedData } = req.body;
        const { fid } = untrustedData;
        
        // Comprar ticket usando el servicio
        const ticket = await ticketService.simulateBlockchainPurchase(fid);
        
        // Enviar notificación
        await notificationService.notifyTicketPurchase(fid, ticket);
        
        res.json({
            type: 'frame',
            image: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/image/success?t=${Date.now()}`,
            buttons: [
                { label: '🎫 Ver Mis Tickets', action: 'post' },
                { label: '🔙 Volver', action: 'post' }
            ],
            postUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/interact`,
            state: { step: 'success', message: '¡Ticket comprado exitosamente!', ticket: ticket }
        });
    } catch (error) {
        console.error('Error confirming purchase:', error);
        res.json(getErrorFrame('Error en la transacción: ' + error.message));
    }
});

// Endpoint para ver tickets del usuario
router.post('/my-tickets', async (req, res) => {
    try {
        const { untrustedData } = req.body;
        const { fid } = untrustedData;
        
        const userTickets = ticketService.getUserTickets(fid);
        const currentWeek = ticketService.getCurrentWeek();
        
        res.json({
            type: 'frame',
            image: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/image/my-tickets?t=${Date.now()}`,
            buttons: [
                { label: '🎫 Comprar Más', action: 'post' },
                { label: '🔙 Volver', action: 'post' }
            ],
            postUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/frame/interact`,
            state: { step: 'my-tickets', tickets: userTickets, currentWeek: currentWeek }
        });
    } catch (error) {
        console.error('Error getting user tickets:', error);
        res.json(getErrorFrame('Error obteniendo tickets'));
    }
});

// Endpoint para notificaciones
router.get('/notifications/:userFid', async (req, res) => {
    try {
        const { userFid } = req.params;
        const notifications = notificationService.getUserNotifications(userFid);
        
        res.json({
            success: true,
            notifications: notifications,
            stats: notificationService.getNotificationStats()
        });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ error: 'Error obteniendo notificaciones' });
    }
});

// Endpoint para estadísticas
router.get('/stats', async (req, res) => {
    try {
        const lotteryState = await blockchainService.getLotteryState();
        const ticketStats = ticketService.getStats();
        const notificationStats = notificationService.getNotificationStats();
        
        res.json({
            success: true,
            lottery: lotteryState,
            tickets: ticketStats,
            notifications: notificationStats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});

// Endpoint para obtener el estado actual del Frame
router.get('/state', (req, res) => {
    res.json({
        currentFrame: 'main',
        availableActions: [
            'buy_ticket',
            'view_status', 
            'view_results',
            'show_info'
        ],
        images: IMAGES
    });
});

module.exports = router;
