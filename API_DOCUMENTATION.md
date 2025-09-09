# KoquiFI Lottery Frame - Documentación de API

## Descripción General

KoquiFI Lottery es una miniapp de Farcaster que permite a los usuarios participar en una lotería semanal usando tokens KOKI en Base Network. La aplicación incluye un sistema completo de tickets, sorteos, notificaciones y administración.

## Endpoints Principales

### Frame Endpoints

#### `POST /api/frame/interact`
Endpoint principal para interacciones del Frame de Farcaster.

**Parámetros:**
- `untrustedData.buttonIndex`: Índice del botón presionado (1-4)
- `untrustedData.fid`: ID del usuario en Farcaster

**Respuesta:**
```json
{
  "type": "frame",
  "image": "URL_de_imagen_dinámica",
  "buttons": [...],
  "postUrl": "URL_para_siguiente_interacción",
  "state": {...}
}
```

#### `GET /api/frame/image/{type}`
Genera imágenes dinámicas para el Frame.

**Tipos disponibles:**
- `main`: Imagen principal
- `status`: Estado de la lotería
- `results`: Resultados del último sorteo
- `buy`: Pantalla de compra
- `info`: Información de la lotería
- `success`: Confirmación de compra
- `my-tickets`: Tickets del usuario
- `error`: Mensaje de error

### Ticket Endpoints

#### `POST /api/frame/buy-confirm`
Confirma la compra de un ticket.

**Respuesta:**
```json
{
  "type": "frame",
  "image": "URL_imagen_éxito",
  "buttons": [...],
  "state": {
    "step": "success",
    "message": "¡Ticket comprado exitosamente!",
    "ticket": {...}
  }
}
```

#### `POST /api/frame/my-tickets`
Muestra los tickets del usuario.

### Blockchain Endpoints

#### `GET /api/frame/stats`
Obtiene estadísticas generales de la lotería.

**Respuesta:**
```json
{
  "success": true,
  "lottery": {
    "currentWeek": "52",
    "ticketPrice": "0.1",
    "totalTickets": "1250",
    "poolBalance": "125.50",
    "nextDraw": "2024-01-15 12:00:00",
    "timeUntilDraw": "2d 5h 30m 15s"
  },
  "tickets": {
    "totalTickets": 1250,
    "currentWeekTickets": 45,
    "totalUsers": 89,
    "totalRevenue": "125.00"
  },
  "notifications": {
    "totalNotifications": 450,
    "unreadNotifications": 23,
    "totalUsers": 89
  }
}
```

### Notificación Endpoints

#### `GET /api/frame/notifications/{userFid}`
Obtiene las notificaciones de un usuario.

**Respuesta:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "NOTIF_1234567890_abc123",
      "type": "ticket_purchase",
      "data": {
        "message": "🎫 ¡Ticket comprado exitosamente!",
        "ticket": {...}
      },
      "timestamp": "2024-01-13T10:30:00.000Z",
      "read": false
    }
  ],
  "stats": {...}
}
```

## Endpoints de Administración

### Autenticación
Todos los endpoints de administración requieren el parámetro `userFid` con permisos de administrador.

### Sorteos

#### `POST /api/admin/draw/execute?userFid={adminFid}`
Ejecuta el sorteo semanal.

**Respuesta:**
```json
{
  "success": true,
  "message": "Sorteo ejecutado exitosamente",
  "draw": {
    "id": "DRAW_1234567890_abc123",
    "week": "52",
    "drawTime": "2024-01-15T12:00:00.000Z",
    "winningNumbers": [7, 15, 23, 31, 42],
    "totalTickets": 45,
    "winners": {
      "level1": [...],
      "level2": [...],
      "level3": [...]
    },
    "prizeDistribution": {...},
    "totalPrize": "125.50 ETH"
  }
}
```

#### `POST /api/admin/draw/simulate?userFid={adminFid}`
Simula un sorteo para testing.

#### `GET /api/admin/draws/history?userFid={adminFid}&limit=10`
Obtiene el historial de sorteos.

### Estadísticas

#### `GET /api/admin/stats?userFid={adminFid}`
Obtiene estadísticas completas de administración.

#### `GET /api/admin/tickets/current-week?userFid={adminFid}`
Obtiene todos los tickets de la semana actual.

#### `GET /api/admin/tickets/user/{userFid}?userFid={adminFid}`
Obtiene los tickets de un usuario específico.

### Notificaciones

#### `POST /api/admin/notifications/broadcast?userFid={adminFid}`
Envía notificación masiva a todos los usuarios.

**Body:**
```json
{
  "type": "marketing",
  "message": "¡Nuevo sorteo especial esta semana!",
  "userFilter": ["user1", "user2"] // Opcional
}
```

### Administración de Usuarios

#### `POST /api/admin/admin/add?userFid={adminFid}`
Agrega un nuevo administrador.

**Body:**
```json
{
  "userFid": "new_admin_fid"
}
```

#### `POST /api/admin/admin/remove?userFid={adminFid}`
Remueve un administrador.

#### `GET /api/admin/admin/list?userFid={adminFid}`
Obtiene la lista de administradores.

### Utilidades

#### `POST /api/admin/cleanup/test-data?userFid={adminFid}`
Limpia todos los datos de testing.

#### `GET /api/admin/health?userFid={adminFid}`
Verifica el estado de salud del sistema.

## Estructura de Datos

### Ticket
```json
{
  "id": "TKT-1234567890-abc123",
  "userFid": "user_fid",
  "numbers": [7, 15, 23, 31, 42],
  "purchaseTime": "2024-01-13T10:30:00.000Z",
  "week": "52",
  "price": "0.1",
  "status": "active",
  "transactionHash": "0x1234567890abcdef..."
}
```

### Sorteo
```json
{
  "id": "DRAW-1234567890-abc123",
  "week": "52",
  "drawTime": "2024-01-15T12:00:00.000Z",
  "winningNumbers": [7, 15, 23, 31, 42],
  "totalTickets": 45,
  "winners": {
    "level1": [
      {
        "ticketId": "TKT-1234567890-abc123",
        "userFid": "user_fid",
        "numbers": [7, 15, 23, 31, 42],
        "matches": 5,
        "prize": "50% del pool"
      }
    ],
    "level2": [...],
    "level3": [...]
  },
  "prizeDistribution": {...},
  "totalPrize": "125.50 ETH"
}
```

### Notificación
```json
{
  "id": "NOTIF_1234567890_abc123",
  "userFid": "user_fid",
  "type": "ticket_purchase",
  "data": {
    "message": "🎫 ¡Ticket comprado exitosamente!",
    "ticket": {...}
  },
  "timestamp": "2024-01-13T10:30:00.000Z",
  "read": false
}
```

## Códigos de Error

- `400`: Bad Request - Parámetros inválidos
- `403`: Forbidden - Sin permisos de administrador
- `404`: Not Found - Recurso no encontrado
- `500`: Internal Server Error - Error del servidor

## Rate Limiting

- Frame endpoints: 100 requests/minuto por usuario
- Admin endpoints: 50 requests/minuto por administrador
- Image generation: 200 requests/minuto por IP

## Seguridad

- Todos los endpoints de administración requieren autenticación
- Validación de parámetros en todos los endpoints
- Sanitización de datos de entrada
- Headers de seguridad con Helmet
- CORS configurado para dominios permitidos

## Ejemplos de Uso

### Compra de Ticket
```bash
curl -X POST https://koquifi-frame.vercel.app/api/frame/buy-confirm \
  -H "Content-Type: application/json" \
  -d '{
    "untrustedData": {
      "fid": "user_fid"
    }
  }'
```

### Ejecutar Sorteo (Admin)
```bash
curl -X POST "https://koquifi-frame.vercel.app/api/admin/draw/execute?userFid=admin_fid"
```

### Obtener Estadísticas
```bash
curl "https://koquifi-frame.vercel.app/api/frame/stats"
```

## Monitoreo

- Health check: `GET /health`
- Admin health: `GET /api/admin/health?userFid={adminFid}`
- Logs estructurados en formato JSON
- Métricas de performance y uso
