class NotificationService {
    constructor() {
        this.notifications = new Map();
        this.userPreferences = new Map();
    }

    // Enviar notificación a un usuario
    async sendNotification(userFid, type, data) {
        try {
            const notification = {
                id: this.generateNotificationId(),
                userFid: userFid,
                type: type,
                data: data,
                timestamp: new Date().toISOString(),
                read: false
            };

            // Guardar notificación
            if (!this.notifications.has(userFid)) {
                this.notifications.set(userFid, []);
            }
            this.notifications.get(userFid).push(notification);

            // Enviar a Farcaster (simulado)
            await this.sendToFarcaster(userFid, notification);

            return notification;
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    // Notificar compra exitosa de ticket
    async notifyTicketPurchase(userFid, ticket) {
        const message = `🎫 ¡Ticket comprado exitosamente!\n\n` +
                       `ID: ${ticket.id}\n` +
                       `Números: ${ticket.numbers.join(', ')}\n` +
                       `Semana: ${ticket.week}\n` +
                       `Precio: ${ticket.price} ETH\n\n` +
                       `¡Buena suerte en el sorteo! 🍀`;

        return await this.sendNotification(userFid, 'ticket_purchase', {
            message: message,
            ticket: ticket
        });
    }

    // Notificar resultado de sorteo
    async notifyDrawResult(userFid, results) {
        let message = `🏆 ¡Resultados del sorteo!\n\n`;
        message += `Números ganadores: ${results.numbers.join(', ')}\n\n`;

        if (results.winnings && results.winnings.length > 0) {
            message += `🎉 ¡FELICIDADES! Has ganado:\n`;
            for (const winning of results.winnings) {
                if (winning.won) {
                    message += `• Ticket ${winning.ticketId}: ${winning.matches} aciertos - ${winning.prize}\n`;
                }
            }
        } else {
            message += `😔 No has ganado esta vez, pero sigue participando!`;
        }

        return await this.sendNotification(userFid, 'draw_result', {
            message: message,
            results: results
        });
    }

    // Notificar próximo sorteo
    async notifyUpcomingDraw(userFid, timeUntilDraw) {
        const message = `⏰ ¡Recordatorio!\n\n` +
                       `El próximo sorteo es en: ${timeUntilDraw}\n` +
                       `¡Asegúrate de tener tus tickets listos! 🎫`;

        return await this.sendNotification(userFid, 'upcoming_draw', {
            message: message,
            timeUntilDraw: timeUntilDraw
        });
    }

    // Obtener notificaciones de un usuario
    getUserNotifications(userFid, limit = 10) {
        const userNotifications = this.notifications.get(userFid) || [];
        return userNotifications
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    // Marcar notificación como leída
    markAsRead(userFid, notificationId) {
        const userNotifications = this.notifications.get(userFid) || [];
        const notification = userNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            return true;
        }
        return false;
    }

    // Obtener estadísticas de notificaciones
    getNotificationStats() {
        let totalNotifications = 0;
        let unreadNotifications = 0;
        let totalUsers = 0;

        for (const [userFid, notifications] of this.notifications) {
            totalUsers++;
            totalNotifications += notifications.length;
            unreadNotifications += notifications.filter(n => !n.read).length;
        }

        return {
            totalNotifications,
            unreadNotifications,
            totalUsers,
            averagePerUser: totalUsers > 0 ? (totalNotifications / totalUsers).toFixed(2) : 0
        };
    }

    // Enviar a Farcaster (simulado)
    async sendToFarcaster(userFid, notification) {
        // En una implementación real, aquí se integraría con la API de Farcaster
        console.log(`📱 Notificación enviada a Farcaster para usuario ${userFid}:`, notification.data.message);
        
        // Simular delay de envío
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            success: true,
            farcasterMessageId: 'fc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        };
    }

    // Generar ID único para notificación
    generateNotificationId() {
        return 'NOTIF_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Configurar preferencias de usuario
    setUserPreferences(userFid, preferences) {
        this.userPreferences.set(userFid, {
            ...this.userPreferences.get(userFid),
            ...preferences,
            updatedAt: new Date().toISOString()
        });
    }

    // Obtener preferencias de usuario
    getUserPreferences(userFid) {
        return this.userPreferences.get(userFid) || {
            ticketPurchaseNotifications: true,
            drawResultNotifications: true,
            upcomingDrawNotifications: true,
            marketingNotifications: false
        };
    }

    // Enviar notificación masiva
    async sendBroadcast(type, data, userFilter = null) {
        const users = userFilter || Array.from(this.notifications.keys());
        const results = [];

        for (const userFid of users) {
            try {
                const preferences = this.getUserPreferences(userFid);
                
                // Verificar si el usuario quiere este tipo de notificación
                if (this.shouldSendNotification(type, preferences)) {
                    const result = await this.sendNotification(userFid, type, data);
                    results.push({ userFid, success: true, notification: result });
                } else {
                    results.push({ userFid, success: false, reason: 'User preferences' });
                }
            } catch (error) {
                results.push({ userFid, success: false, error: error.message });
            }
        }

        return results;
    }

    // Verificar si se debe enviar notificación
    shouldSendNotification(type, preferences) {
        switch (type) {
            case 'ticket_purchase':
                return preferences.ticketPurchaseNotifications;
            case 'draw_result':
                return preferences.drawResultNotifications;
            case 'upcoming_draw':
                return preferences.upcomingDrawNotifications;
            case 'marketing':
                return preferences.marketingNotifications;
            default:
                return true;
        }
    }
}

module.exports = new NotificationService();
