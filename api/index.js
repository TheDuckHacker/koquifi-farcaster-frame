const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const frameRoutes = require('../src/routes/frame');
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

// Rutas de la API
app.use('/api/frame', frameRoutes);

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
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

module.exports = app;
