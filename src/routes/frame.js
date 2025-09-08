const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');

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
            image: `${IMAGES.buyTicket}?t=${Date.now()}`,
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
            image: `${IMAGES.status}?t=${Date.now()}`,
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
            image: `${IMAGES.results}?t=${Date.now()}`,
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
        image: `${IMAGES.info}?t=${Date.now()}`,
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
        image: `${IMAGES.main}?t=${Date.now()}`,
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
