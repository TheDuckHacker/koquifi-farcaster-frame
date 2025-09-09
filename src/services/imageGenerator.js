const { createCanvas, loadImage } = require('canvas');

class ImageGenerator {
    constructor() {
        this.width = 1200;
        this.height = 630;
    }

    // Generar imagen principal del Frame
    async generateMainFrame() {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Fondo degradado
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#1A1A1A');
        gradient.addColorStop(1, '#2D2D2D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Título principal
        ctx.fillStyle = '#FF6B35';
        ctx.font = 'bold 72px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎰 KoquiFI Lottery', this.width / 2, 150);

        // Subtítulo
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '36px Arial';
        ctx.fillText('Lotería Semanal con Tokens KOKI', this.width / 2, 220);

        // Información de la lotería
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.fillText('🎫 Compra tickets • 📊 Ver estado • 🏆 Resultados • ℹ️ Info', this.width / 2, 350);

        // Red
        ctx.fillStyle = '#0052FF';
        ctx.font = '20px Arial';
        ctx.fillText('Base Network • Descentralizado • Verificado', this.width / 2, 450);

        return canvas.toBuffer('image/png');
    }

    // Generar imagen de estado de la lotería
    async generateStatusFrame(lotteryState) {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Fondo
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#1A1A1A');
        gradient.addColorStop(1, '#2D2D2D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Título
        ctx.fillStyle = '#FF6B35';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📊 Estado de la Lotería', this.width / 2, 100);

        // Información
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '32px Arial';
        ctx.textAlign = 'left';
        
        const info = [
            `Semana: ${lotteryState.currentWeek}`,
            `Tickets vendidos: ${lotteryState.totalTickets}`,
            `Pool actual: ${lotteryState.poolBalance} ETH`,
            `Próximo sorteo: ${lotteryState.nextDraw}`,
            `Tiempo restante: ${lotteryState.timeUntilDraw}`
        ];

        let y = 200;
        info.forEach(line => {
            ctx.fillText(line, 100, y);
            y += 60;
        });

        // Red
        ctx.fillStyle = '#0052FF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Red: ${lotteryState.network}`, this.width / 2, 550);

        return canvas.toBuffer('image/png');
    }

    // Generar imagen de resultados
    async generateResultsFrame(results) {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Fondo
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#1A1A1A');
        gradient.addColorStop(1, '#2D2D2D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Título
        ctx.fillStyle = '#FF6B35';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 Último Sorteo', this.width / 2, 100);

        // Números ganadores
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 48px Arial';
        const numbersText = results.numbers.join(' • ');
        ctx.fillText(`Números: ${numbersText}`, this.width / 2, 200);

        // Información del sorteo
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '28px Arial';
        ctx.fillText(`Semana: ${results.week}`, this.width / 2, 280);
        ctx.fillText(`Fecha: ${results.drawTime}`, this.width / 2, 320);

        // Ganadores
        ctx.fillStyle = '#FFD700';
        ctx.font = '24px Arial';
        ctx.fillText(`5 aciertos: ${results.winners.level1} ganadores`, this.width / 2, 380);
        ctx.fillText(`4 aciertos: ${results.winners.level2} ganadores`, this.width / 2, 420);
        ctx.fillText(`3 aciertos: ${results.winners.level3} ganadores`, this.width / 2, 460);

        // Premio total
        ctx.fillStyle = '#FF6B35';
        ctx.font = 'bold 32px Arial';
        ctx.fillText(`Premio Total: ${results.totalPrize} ETH`, this.width / 2, 520);

        return canvas.toBuffer('image/png');
    }

    // Generar imagen de compra de ticket
    async generateBuyTicketFrame() {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Fondo
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#1A1A1A');
        gradient.addColorStop(1, '#2D2D2D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Título
        ctx.fillStyle = '#FF6B35';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎫 Comprar Ticket', this.width / 2, 150);

        // Información del ticket
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '32px Arial';
        ctx.fillText('Precio: 0.1 ETH', this.width / 2, 250);
        ctx.fillText('Números: 5 únicos del 1-50', this.width / 2, 300);

        // Instrucciones
        ctx.fillStyle = '#CCCCCC';
        ctx.font = '24px Arial';
        ctx.fillText('1. Conecta tu billetera', this.width / 2, 380);
        ctx.fillText('2. Selecciona 5 números únicos', this.width / 2, 420);
        ctx.fillText('3. Confirma la compra', this.width / 2, 460);

        // Botón
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('✅ Confirmar Compra', this.width / 2, 520);

        return canvas.toBuffer('image/png');
    }

    // Generar imagen de información
    async generateInfoFrame() {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Fondo
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#1A1A1A');
        gradient.addColorStop(1, '#2D2D2D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Título
        ctx.fillStyle = '#FF6B35';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ℹ️ Cómo Funciona', this.width / 2, 100);

        // Información
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        
        const info = [
            '🎫 Cada ticket cuesta 0.1 ETH',
            '🔢 Selecciona 5 números únicos del 1-50',
            '📅 Los sorteos son cada lunes a las 12:00 UTC',
            '🏆 Premios: 5 aciertos (50%), 4 aciertos (30%), 3 aciertos (20%)',
            '🔥 5% del pool se quema automáticamente',
            '🔒 100% descentralizado en Base Network'
        ];

        let y = 180;
        info.forEach(line => {
            ctx.fillText(line, 100, y);
            y += 50;
        });

        // Red
        ctx.fillStyle = '#0052FF';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Base Network • Contratos Verificados', this.width / 2, 550);

        return canvas.toBuffer('image/png');
    }

    // Generar imagen de éxito
    async generateSuccessFrame(ticket = null) {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Fondo
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#1A1A1A');
        gradient.addColorStop(1, '#2D2D2D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Título
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✅ ¡Ticket Comprado!', this.width / 2, 150);

        if (ticket) {
            // Información del ticket
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '28px Arial';
            ctx.fillText(`ID: ${ticket.id}`, this.width / 2, 220);
            ctx.fillText(`Números: ${ticket.numbers.join(', ')}`, this.width / 2, 260);
            ctx.fillText(`Semana: ${ticket.week}`, this.width / 2, 300);
            ctx.fillText(`Precio: ${ticket.price} ETH`, this.width / 2, 340);
        }

        // Mensaje
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 32px Arial';
        ctx.fillText('¡Buena suerte en el sorteo! 🍀', this.width / 2, 420);

        // Red
        ctx.fillStyle = '#0052FF';
        ctx.font = '20px Arial';
        ctx.fillText('Base Network • Transacción Confirmada', this.width / 2, 550);

        return canvas.toBuffer('image/png');
    }

    // Generar imagen de tickets del usuario
    async generateMyTicketsFrame(tickets, currentWeek) {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Fondo
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#1A1A1A');
        gradient.addColorStop(1, '#2D2D2D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Título
        ctx.fillStyle = '#FF6B35';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎫 Mis Tickets', this.width / 2, 80);

        // Información
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.fillText(`Total: ${tickets.length} tickets`, this.width / 2, 130);
        ctx.fillText(`Semana actual: ${currentWeek}`, this.width / 2, 160);

        // Mostrar últimos 3 tickets
        let y = 220;
        const recentTickets = tickets.slice(-3);
        
        for (const ticket of recentTickets) {
            ctx.fillStyle = '#CCCCCC';
            ctx.font = '20px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`• ${ticket.numbers.join(', ')} (Semana ${ticket.week})`, 100, y);
            y += 40;
        }

        if (tickets.length > 3) {
            ctx.fillStyle = '#888888';
            ctx.font = '18px Arial';
            ctx.fillText(`... y ${tickets.length - 3} tickets más`, 100, y);
        }

        // Botones
        ctx.fillStyle = '#00FF00';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎫 Comprar Más Tickets', this.width / 2, 480);

        return canvas.toBuffer('image/png');
    }

    // Generar imagen de error
    async generateErrorFrame(message) {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Fondo
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#1A1A1A');
        gradient.addColorStop(1, '#2D2D2D');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Título
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('❌ Error', this.width / 2, 150);

        // Mensaje
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px Arial';
        ctx.fillText(message, this.width / 2, 250);

        // Botón
        ctx.fillStyle = '#FF6B35';
        ctx.font = 'bold 28px Arial';
        ctx.fillText('🔙 Intentar de Nuevo', this.width / 2, 350);

        return canvas.toBuffer('image/png');
    }
}

module.exports = new ImageGenerator();
