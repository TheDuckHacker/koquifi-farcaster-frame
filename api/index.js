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
        "name": "KoquiFI Lottery",
        "short_name": "KoquiFI",
        "description": "Lotería semanal con tokens KOKI en Base Network",
        "icon": "https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/main?w=512&h=512",
        "start_url": "https://koquifi-farcaster-frame-815l.vercel.app/miniapp.html",
        "display": "standalone",
        "theme_color": "#FF6B35",
        "background_color": "#1A1A1A",
        "categories": ["finance", "games", "social"],
        "scope": "/",
        "lang": "es",
        "dir": "ltr",
        "orientation": "portrait",
        "display_override": ["window-controls-overlay"],
        "edge_side_panel": {
            "preferred_width": 400
        },
        "launch_handler": {
            "client_mode": "navigate-existing"
        },
        "protocol_handlers": [
            {
                "protocol": "web+koquifi",
                "url": "https://koquifi-farcaster-frame-815l.vercel.app/miniapp.html?action=%s"
            }
        ],
        "screenshots": [
            {
                "src": "https://koquifi-farcaster-frame-815l.vercel.app/api/frame/image/main?w=1200&h=630",
                "sizes": "1200x630",
                "type": "image/png"
            }
        ],
        "related_applications": [],
        "prefer_related_applications": false,
        "farcaster": {
            "mini_app": true,
            "version": "1.0.0",
            "sdk_version": "latest"
        }
    };
    
    res.json(manifest);
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
