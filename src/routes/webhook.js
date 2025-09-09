const express = require('express');
const router = express.Router();

// Webhook para Farcaster Mini App
router.post('/webhook', (req, res) => {
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

module.exports = router;
