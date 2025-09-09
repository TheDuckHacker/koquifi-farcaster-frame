const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const frameRoutes = require('../src/routes/frame');
const adminRoutes = require('../src/routes/admin');
const blockchainService = require('../src/services/blockchain');

const app = express();

// Middleware de seguridad
app.use(helmet({
    contentSecurityPolicy: false, // Necesario para Farcaster Frames
    crossOriginEmbedderPolicy: false
}));

// Middleware CORS
app.use(cors({
    origin: ['https://warpcast.com', 'https://farcaster.xyz', 'https://*.vercel.app'],
    credentials: true
}));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use(express.static('public'));

// Headers específicos para Farcaster Mini Apps
app.use((req, res, next) => {
    // Headers para manifest
    if (req.path === '/.well-known/manifest.json') {
        res.setHeader('Content-Type', 'application/manifest+json');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    
    // Headers para CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    next();
});

// Ruta específica para manifest
app.get('/.well-known/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, User-Agent');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    // Leer y enviar el manifest como JSON
    const manifest = {
        "frame": {
            "name": "KoquiFI Lottery",
            "version": "1",
            "iconUrl": "https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/main?w=512&h=512",
            "homeUrl": "https://koquifi-farcaster-frame-815l.vercel.app/miniapp.html",
            "imageUrl": "https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/main?w=1200&h=630",
            "buttonTitle": "Jugar Lotería",
            "splashImageUrl": "https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/main?w=1200&h=630",
            "splashBackgroundColor": "#FF6B35",
            "webhookUrl": "https://koquifi-farcaster-frame-815l.vercel.app/api/webhook",
            "subtitle": "Lotería KOKI Base Network",
            "description": "Lotería semanal con tokens KOKI en Base Network. Compra tickets, elige números y gana premios increíbles cada lunes. Sistema 100% descentralizado.",
            "primaryCategory": "finance",
            "screenshotUrls": [
                "https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/main?w=1200&h=630"
            ],
            "heroImageUrl": "https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/main?w=1200&h=630",
            "tags": [
                "lottery",
                "defi",
                "base",
                "koki",
                "tokens"
            ],
            "tagline": "Gana Premios Increíbles",
            "ogTitle": "KoquiFI Lottery",
            "ogDescription": "Compra tickets, elige números y gana premios increíbles cada lunes en Base Network.",
            "ogImageUrl": "https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/main?w=1200&h=630",
            "castShareUrl": "https://warpcast.com/~/compose?text=🎰%20Participa%20en%20KoquiFI%20Lottery%20-%20Lotería%20semanal%20con%20tokens%20KOKI%20en%20Base%20Network%20https://koquifi-farcaster-frame-815l.vercel.app"
        }
    };
    
    res.json(manifest);
});

// Endpoint para farcaster.json - SIMPLIFICADO
app.get('/farcaster.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
        "name": "KoquiFI Lottery",
        "version": "1",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/2583/2583344.png",
        "homeUrl": "https://koquifi-farcaster-frame-815l.vercel.app/miniapp.html",
        "imageUrl": "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=1200&h=630&fit=crop",
        "buttonTitle": "Jugar Lotería",
        "splashImageUrl": "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=1200&h=630&fit=crop",
        "splashBackgroundColor": "#FF6B35",
        "webhookUrl": "https://koquifi-farcaster-frame-815l.vercel.app/api/webhook",
        "subtitle": "Lotería KOKI Base Network",
        "description": "Lotería semanal con tokens KOKI en Base Network. Compra tickets, elige números y gana premios increíbles cada lunes. Sistema 100% descentralizado.",
        "primaryCategory": "finance",
        "screenshotUrls": ["https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=1200&h=630&fit=crop"],
        "heroImageUrl": "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=1200&h=630&fit=crop",
        "tags": ["lottery", "defi", "base", "koki", "tokens"],
        "tagline": "Gana Premios Increíbles",
        "ogTitle": "KoquiFI Lottery",
        "ogDescription": "Compra tickets, elige números y gana premios increíbles cada lunes en Base Network.",
        "ogImageUrl": "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=1200&h=630&fit=crop",
        "castShareUrl": "https://warpcast.com/~/compose?text=🎰%20Participa%20en%20KoquiFI%20Lottery%20-%20Lotería%20semanal%20con%20tokens%20KOKI%20en%20Base%20Network%20https://koquifi-farcaster-frame-815l.vercel.app"
    });
});

// Endpoint alternativo para manifest
app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(__dirname, '../public/manifest.json'));
});

// Ruta principal - servir el Frame HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Webhook para Farcaster Mini App
app.post('/api/webhook', (req, res) => {
    try {
        console.log('Webhook recibido:', req.body);
        
        const { type, data } = req.body;
        
        switch (type) {
            case 'user.install':
                console.log('Usuario instaló la app:', data);
                break;
            case 'user.uninstall':
                console.log('Usuario desinstaló la app:', data);
                break;
            case 'user.open':
                console.log('Usuario abrió la app:', data);
                break;
            case 'user.close':
                console.log('Usuario cerró la app:', data);
                break;
            default:
                console.log('Evento desconocido:', type, data);
        }
        
        res.json({ success: true, message: 'Webhook procesado' });
    } catch (error) {
        console.error('Error en webhook:', error);
        res.status(500).json({ error: 'Error procesando webhook' });
    }
});

// Rutas de la API
app.use('/api/frame', frameRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'KoquiFI Lottery Frame',
        version: '1.0.0'
    });
});

// Endpoint para obtener información del Frame
app.get('/api/frame/info', (req, res) => {
    res.json({
        name: 'KoquiFI Lottery',
        description: 'Lotería semanal con tokens KOKI en Base Network',
        version: '1.0.0',
        network: 'Base Sepolia',
        token: 'KOKI',
        contract: process.env.LOTTERY_CONTRACT_ADDRESS || 'TBD'
    });
});

// Endpoint para obtener estado de la lotería
app.get('/api/lottery/state', async (req, res) => {
    try {
        const state = await blockchainService.getLotteryState();
        res.json(state);
    } catch (error) {
        console.error('Error getting lottery state:', error);
        res.status(500).json({ error: 'Error obteniendo estado de la lotería' });
    }
});

// Endpoint para obtener resultados
app.get('/api/lottery/results', async (req, res) => {
    try {
        const results = await blockchainService.getLastResults();
        res.json(results);
    } catch (error) {
        console.error('Error getting lottery results:', error);
        res.status(500).json({ error: 'Error obteniendo resultados' });
    }
});

// Webhook para Farcaster - ARREGLADO
app.post('/api/webhook', (req, res) => {
    console.log('Webhook POST recibido:', req.body);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ 
        status: 'ok', 
        message: 'Webhook recibido correctamente',
        timestamp: new Date().toISOString()
    });
});

// Webhook GET para verificación
app.get('/api/webhook', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ 
        status: 'ok', 
        message: 'Webhook endpoint funcionando',
        timestamp: new Date().toISOString()
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    // Si es una ruta de API, devolver JSON
    if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({ error: 'API endpoint no encontrado' });
    } else {
        // Para otras rutas, servir el Frame HTML
        res.sendFile(path.join(__dirname, '../public/index.html'));
    }
});

module.exports = app;
