# 🔧 Configuración de Variables de Entorno en Vercel

## Variables Necesarias

### **1. Ir a Vercel Dashboard**
1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto `koquifi-farcaster-frame`

### **2. Configurar Variables de Entorno**
1. Ve a **Settings** → **Environment Variables**
2. Agrega las siguientes variables:

#### **Base Network**
```
BASE_RPC_URL = https://sepolia.base.org
BASE_CHAIN_ID = 84532
BASE_EXPLORER_URL = https://sepolia.basescan.org
```

#### **Contratos (después del deploy)**
```
KOKI_TOKEN_ADDRESS = [dirección_del_contrato]
LOTTERY_CONTRACT_ADDRESS = [dirección_del_contrato]
```

#### **Claves Privadas (SOLO PARA TESTING)**
```
PRIVATE_KEY = [tu_clave_privada_sin_0x]
ADMIN_PRIVATE_KEY = [clave_privada_admin_sin_0x]
```

#### **Farcaster API**
```
FARCASTER_API_KEY = [tu_api_key_de_farcaster]
FARCASTER_WEBHOOK_SECRET = [webhook_secret]
```

#### **Configuración de la App**
```
BASE_URL = https://koquifi-farcaster-frame-815l.vercel.app
NODE_ENV = production
LOG_LEVEL = info
```

#### **Configuración de la Lotería**
```
LOTTERY_TICKET_PRICE = 0.001
LOTTERY_DRAW_DAY = 1
LOTTERY_DRAW_HOUR = 20
ENABLE_NOTIFICATIONS = true
```

### **3. Configurar Entornos**
- **Production**: Todas las variables
- **Preview**: Variables de testing
- **Development**: Variables locales

### **4. Redeploy**
1. Ve a **Deployments**
2. Haz clic en **Redeploy** en el último deployment
3. Espera a que termine el despliegue

## 🔐 Seguridad

### **Variables Sensibles**
- **NUNCA** subas claves privadas a GitHub
- Usa **Vercel Environment Variables** para datos sensibles
- Las claves privadas solo para testing en Base Sepolia

### **Variables Públicas**
- URLs de RPC
- Direcciones de contratos
- Configuración de la app

## 📋 Checklist de Configuración

- [ ] Base RPC URL configurada
- [ ] Chain ID configurado
- [ ] Explorer URL configurado
- [ ] Contratos desplegados y direcciones configuradas
- [ ] Claves privadas configuradas (solo testing)
- [ ] Farcaster API key configurada
- [ ] Base URL configurada
- [ ] Variables de lotería configuradas
- [ ] Redeploy realizado
- [ ] Funcionamiento verificado

## 🚨 Importante

1. **Solo usar Base Sepolia** para testing
2. **Nunca usar claves privadas reales** en producción
3. **Verificar que todas las variables** estén configuradas
4. **Hacer redeploy** después de configurar variables
5. **Probar** que todo funcione correctamente

## 🔗 Enlaces Útiles

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [Farcaster API Documentation](https://docs.farcaster.xyz/)
- [Base Network Documentation](https://docs.base.org/)
