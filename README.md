# 🎰 KoquiFI Lottery Frame

Una miniapp completa de Farcaster para participar en loterías semanales con tokens KOKI en Base Network.

## ✨ Características Principales

### 🎫 Sistema de Tickets
- Compra de tickets con 5 números únicos (1-50)
- NFTs únicos para cada ticket
- Precio fijo de 0.1 ETH por ticket
- Validación automática de números

### 🏆 Sistema de Premios
- **5 aciertos**: 50% del pool
- **4 aciertos**: 30% del pool  
- **3 aciertos**: 20% del pool
- Quema automática del 5% del pool

### 📊 Funcionalidades Avanzadas
- Estado en tiempo real de la lotería
- Resultados dinámicos de sorteos
- Sistema de notificaciones automáticas
- Panel de administración completo
- Generación de imágenes dinámicas
- Historial completo de sorteos

### 🔒 Seguridad y Descentralización
- 100% descentralizado en Base Network
- Contratos verificados en BaseScan
- Transacciones transparentes
- Sistema de permisos de administración

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5** con metadatos de Farcaster
- **CSS3** para estilos responsivos
- **JavaScript** para interactividad

### Backend
- **Node.js** + **Express.js**
- **Canvas** para generación de imágenes
- **Ethers.js** para interacción blockchain
- **Helmet** para seguridad
- **CORS** para cross-origin

### Blockchain
- **Base Network** (Base Sepolia para testing)
- **Solidity** para smart contracts
- **Hardhat** para desarrollo
- **OpenZeppelin** para contratos seguros

### Hosting y DevOps
- **Vercel** para hosting
- **GitHub** para control de versiones
- **Git** para deployment automático

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js >= 18.0.0
- npm o yarn
- Cuenta de Vercel
- Billetera con ETH en Base Sepolia

### Instalación Local

1. **Clona el repositorio**
```bash
git clone https://github.com/TheDuckHacker/koquifi-farcaster-frame.git
cd koquifi-farcaster-frame
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**
```bash
cp env.example .env
# Edita .env con tus valores
```

4. **Ejecuta en desarrollo**
```bash
npm run dev
```

### Variables de Entorno

```env
# Blockchain
BASE_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=tu_private_key_aqui_sin_0x
LOTTERY_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

# Aplicación
BASE_URL=https://koquifi-frame.vercel.app
NODE_ENV=production

# Farcaster (opcional)
FARCASTER_API_KEY=tu_api_key_aqui
```

## 📱 Uso de la Aplicación

### Para Usuarios

1. **Accede al Frame**
   - Visita la URL de tu Frame en Farcaster
   - O usa directamente: `https://koquifi-frame.vercel.app`

2. **Interactúa con los Botones**
   - 🎫 **Comprar Ticket**: Selecciona números y compra
   - 📊 **Ver Estado**: Estado actual de la lotería
   - 🏆 **Resultados**: Últimos números ganadores
   - ℹ️ **Info**: Cómo funciona la lotería

3. **Compra Tickets**
   - Los números se generan automáticamente
   - Confirma la compra
   - Recibe notificación de confirmación

### Para Administradores

1. **Accede al Panel de Admin**
   - Usa endpoints con `?userFid=admin_fid`
   - Ejemplo: `/api/admin/stats?userFid=admin`

2. **Ejecuta Sorteos**
   - Simula sorteos para testing
   - Ejecuta sorteos reales
   - Ve historial completo

3. **Gestiona Usuarios**
   - Agrega/remueve administradores
   - Envía notificaciones masivas
   - Monitorea estadísticas

## 🔧 API Endpoints

### Frame Endpoints
- `POST /api/frame/interact` - Interacciones principales
- `GET /api/frame/image/{type}` - Imágenes dinámicas
- `POST /api/frame/buy-confirm` - Confirmar compra
- `GET /api/frame/stats` - Estadísticas generales

### Admin Endpoints
- `POST /api/admin/draw/execute` - Ejecutar sorteo
- `GET /api/admin/stats` - Estadísticas de admin
- `POST /api/admin/notifications/broadcast` - Notificación masiva
- `GET /api/admin/draws/history` - Historial de sorteos

Ver [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) para documentación completa.

## 🎨 Generación de Imágenes

La aplicación genera imágenes dinámicas para cada estado del Frame:

- **Imagen Principal**: Estado general de la lotería
- **Estado**: Información detallada del sorteo actual
- **Resultados**: Números ganadores y premios
- **Compra**: Interfaz de compra de tickets
- **Éxito**: Confirmación de compra
- **Error**: Mensajes de error personalizados

## 📊 Sistema de Notificaciones

### Tipos de Notificaciones
- **Compra de Ticket**: Confirmación de compra exitosa
- **Resultados de Sorteo**: Números ganadores y premios
- **Recordatorio**: Próximo sorteo
- **Marketing**: Promociones especiales

### Configuración de Usuario
Los usuarios pueden configurar qué notificaciones recibir:
- Notificaciones de compra
- Resultados de sorteos
- Recordatorios
- Notificaciones de marketing

## 🔐 Seguridad

### Medidas Implementadas
- **Helmet.js** para headers de seguridad
- **CORS** configurado para dominios permitidos
- **Validación** de todos los parámetros de entrada
- **Sanitización** de datos de usuario
- **Rate limiting** en endpoints críticos
- **Autenticación** para funciones de administración

### Permisos de Administración
- Solo usuarios autorizados pueden ejecutar sorteos
- Sistema de roles para diferentes niveles de acceso
- Logs de todas las acciones administrativas

## 🚀 Despliegue

### Vercel (Recomendado)

1. **Conecta tu repositorio**
   - Ve a [Vercel](https://vercel.com)
   - Importa tu repositorio de GitHub

2. **Configura las variables de entorno**
   - Agrega todas las variables del archivo `.env`
   - Configura `BASE_URL` con tu dominio de Vercel

3. **Despliega**
   - Vercel detectará automáticamente el proyecto
   - El despliegue se realizará automáticamente

### Otros Proveedores

La aplicación es compatible con:
- **Netlify**
- **Railway**
- **Heroku**
- **DigitalOcean App Platform**

## 🧪 Testing

### Datos de Prueba
```bash
# Simular sorteo
curl -X POST "https://tu-app.vercel.app/api/admin/draw/simulate?userFid=admin"

# Limpiar datos de testing
curl -X POST "https://tu-app.vercel.app/api/admin/cleanup/test-data?userFid=admin"
```

### Endpoints de Testing
- `/api/admin/draw/simulate` - Simula un sorteo completo
- `/api/admin/cleanup/test-data` - Limpia datos de prueba
- `/health` - Verifica estado del sistema

## 📈 Monitoreo y Analytics

### Métricas Disponibles
- Tickets vendidos por semana
- Usuarios activos
- Notificaciones enviadas
- Sorteos ejecutados
- Errores del sistema

### Logs
- Logs estructurados en formato JSON
- Niveles de log configurables
- Tracking de errores y performance

## 🤝 Contribuir

### Cómo Contribuir

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Estándares de Código
- Usar ESLint para JavaScript
- Comentarios en español
- Documentación actualizada
- Tests para nuevas funcionalidades

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

### Problemas Comunes

1. **Error de Private Key**
   - Asegúrate de que no tenga el prefijo `0x`
   - Verifica que sea una clave válida

2. **Error de Puerto en Uso**
   - Mata el proceso: `taskkill /PID <PID> /F`
   - O usa otro puerto: `PORT=3001 npm run dev`

3. **Error de Vercel**
   - Verifica las variables de entorno
   - Revisa los logs de Vercel

### Contacto
- **GitHub Issues**: Para reportar bugs
- **Discord**: Para soporte en tiempo real
- **Email**: Para consultas comerciales

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Integración con Chainlink VRF
- [ ] Sistema de referidos
- [ ] Múltiples tipos de lotería
- [ ] Integración con más redes
- [ ] App móvil nativa
- [ ] Dashboard web completo

### Mejoras Técnicas
- [ ] Cache Redis para mejor performance
- [ ] Base de datos PostgreSQL
- [ ] Sistema de backup automático
- [ ] Monitoreo con Prometheus
- [ ] Tests automatizados

---

**¡Gracias por usar KoquiFI Lottery! 🎰✨**
