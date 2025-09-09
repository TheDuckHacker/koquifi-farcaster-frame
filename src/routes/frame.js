const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const imageGenerator = require('../services/imageGenerator');
const ticketService = require('../services/ticketService');
const notificationService = require('../services/notificationService');

// Endpoint principal para interacciones del Frame
router.post('/interact', async (req, res) => {
    try {
        console.log('Frame interaction received:', JSON.stringify(req.body, null, 2));
        
        const { 
            untrustedData, 
            trustedData,
            inputText 
        } = req.body;
        
        // Si no hay datos, devolver frame principal
        if (!untrustedData) {
            console.log('No untrustedData, returning main frame');
            return res.json(getMainFrame());
        }
        
        const { buttonIndex, fid, castHash } = untrustedData;
        const userFid = fid || 'anonymous';
        
        console.log(`User ${userFid} clicked button ${buttonIndex}, input: ${inputText}`);
        
        let response;
        
        switch(buttonIndex) {
            case 1: // Comprar Ticket
                response = await handleBuyTicket(userFid, inputText);
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
        
        console.log('Sending response:', JSON.stringify(response, null, 2));
        res.json(response);
    } catch (error) {
        console.error('Error handling frame interaction:', error);
        res.status(500).json(getErrorFrame('Error interno: ' + error.message));
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
            image: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/success?ticket=${encodeURIComponent(JSON.stringify(ticket))}&t=${Date.now()}`,
            buttons: [
                { label: '🎫 Ver Mis Tickets', action: 'post' },
                { label: '🔙 Volver', action: 'post' }
            ],
            postUrl: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/my-tickets`,
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
        
        const tickets = await ticketService.getUserTickets(fid);
        
        res.json({
            type: 'frame',
            image: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/my-tickets?fid=${fid}&t=${Date.now()}`,
            buttons: [
                { label: '🎫 Comprar Más', action: 'post' },
                { label: '🔙 Volver', action: 'post' }
            ],
            postUrl: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/interact`,
            state: { step: 'my-tickets', tickets: tickets }
        });
    } catch (error) {
        console.error('Error getting user tickets:', error);
        res.json(getErrorFrame('Error obteniendo tickets: ' + error.message));
    }
});

// Handlers para cada botón
async function handleBuyTicket(userFid, inputText) {
    try {
        console.log(`Handling buy ticket for user ${userFid}`);
        
        // Simular compra de ticket
        const ticket = await ticketService.simulateBlockchainPurchase(userFid);
        
        return {
            type: 'frame',
            image: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/buy?fid=${userFid}&t=${Date.now()}`,
            buttons: [
                { label: '✅ Confirmar Compra', action: 'post' },
                { label: '❌ Cancelar', action: 'post' }
            ],
            postUrl: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/buy-confirm`,
            state: { 
                step: 'buy', 
                userFid: userFid, 
                ticket: ticket,
                inputText: inputText 
            }
        };
    } catch (error) {
        console.error('Error in handleBuyTicket:', error);
        return getErrorFrame('Error comprando ticket: ' + error.message);
    }
}

async function handleViewStatus() {
    try {
        console.log('Handling view status');
        const lotteryInfo = await blockchainService.getLotteryInfo();
        
        return {
            type: 'frame',
            image: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/status?t=${Date.now()}`,
            buttons: [
                { label: '🎫 Comprar Ticket', action: 'post' },
                { label: '🔙 Volver', action: 'post' }
            ],
            postUrl: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/interact`,
            state: { step: 'status', lotteryInfo: lotteryInfo }
        };
    } catch (error) {
        console.error('Error in handleViewStatus:', error);
        return getErrorFrame('Error obteniendo estado: ' + error.message);
    }
}

async function handleViewResults() {
    try {
        console.log('Handling view results');
        const results = await blockchainService.getLotteryResults();
        
        return {
            type: 'frame',
            image: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/results?t=${Date.now()}`,
            buttons: [
                { label: '🎫 Comprar Ticket', action: 'post' },
                { label: '🔙 Volver', action: 'post' }
            ],
            postUrl: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/interact`,
            state: { step: 'results', results: results }
        };
    } catch (error) {
        console.error('Error in handleViewResults:', error);
        return getErrorFrame('Error obteniendo resultados: ' + error.message);
    }
}

async function handleInfo() {
    try {
        console.log('Handling info');
        
        return {
            type: 'frame',
            image: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/info?t=${Date.now()}`,
            buttons: [
                { label: '🎫 Comprar Ticket', action: 'post' },
                { label: '🔙 Volver', action: 'post' }
            ],
            postUrl: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/interact`,
            state: { step: 'info' }
        };
    } catch (error) {
        console.error('Error in handleInfo:', error);
        return getErrorFrame('Error obteniendo información: ' + error.message);
    }
}

// Frame principal
function getMainFrame() {
    return {
        type: 'frame',
        image: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/main?t=${Date.now()}`,
        buttons: [
            { label: '🎫 Comprar Ticket', action: 'post' },
            { label: '📊 Ver Estado', action: 'post' },
            { label: '🏆 Resultados', action: 'post' },
            { label: 'ℹ️ Info', action: 'post' }
        ],
        postUrl: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/interact`,
        state: { step: 'main' }
    };
}

// Frame de éxito
function getSuccessFrame(message, ticket = null) {
    return {
        type: 'frame',
        image: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/success?ticket=${encodeURIComponent(JSON.stringify(ticket))}&t=${Date.now()}`,
        buttons: [
            { label: '🎫 Ver Mis Tickets', action: 'post' },
            { label: '🔙 Volver', action: 'post' }
        ],
        postUrl: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/my-tickets`,
        state: { step: 'success', message: message, ticket: ticket }
    };
}

// Frame de error
function getErrorFrame(message) {
    return {
        type: 'frame',
        image: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/error?message=${encodeURIComponent(message)}&t=${Date.now()}`,
        buttons: [
            { label: '🔄 Reintentar', action: 'post' },
            { label: '🔙 Volver', action: 'post' }
        ],
        postUrl: `https://koquifi-farcaster-frame-815l.vercel.app/api/frame/interact`,
        state: { step: 'error', message: message }
    };
}

// Endpoints para generar imágenes dinámicas
router.get('/image/main', async (req, res) => {
    try {
        const imageBuffer = await imageGenerator.generateMainFrame();
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=300');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating main image:', error);
        res.status(500).send('Error generating image');
    }
});

router.get('/image/status', async (req, res) => {
    try {
        const imageBuffer = await imageGenerator.generateStatusFrame();
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=300');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating status image:', error);
        res.status(500).send('Error generating image');
    }
});

router.get('/image/results', async (req, res) => {
    try {
        const imageBuffer = await imageGenerator.generateResultsFrame();
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=300');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating results image:', error);
        res.status(500).send('Error generating image');
    }
});

router.get('/image/buy', async (req, res) => {
    try {
        const { fid } = req.query;
        const imageBuffer = await imageGenerator.generateBuyFrame(fid);
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=300');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating buy image:', error);
        res.status(500).send('Error generating image');
    }
});

router.get('/image/info', async (req, res) => {
    try {
        const imageBuffer = await imageGenerator.generateInfoFrame();
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=300');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating info image:', error);
        res.status(500).send('Error generating image');
    }
});

router.get('/image/success', async (req, res) => {
    try {
        const { ticket } = req.query;
        const ticketData = ticket ? JSON.parse(decodeURIComponent(ticket)) : null;
        const imageBuffer = await imageGenerator.generateSuccessFrame(ticketData);
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=300');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating success image:', error);
        res.status(500).send('Error generating image');
    }
});

router.get('/image/my-tickets', async (req, res) => {
    try {
        const { fid } = req.query;
        const imageBuffer = await imageGenerator.generateMyTicketsFrame(fid);
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=300');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating my-tickets image:', error);
        res.status(500).send('Error generating image');
    }
});

router.get('/image/error', async (req, res) => {
    try {
        const { message } = req.query;
        const imageBuffer = await imageGenerator.generateErrorFrame(message);
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=300');
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error generating error image:', error);
        res.status(500).send('Error generating image');
    }
});

module.exports = router;