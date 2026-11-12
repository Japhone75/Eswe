# ENGWE Speed Tool – iOS Port

Port para iPhone (iOS) de la aplicación de código abierto [engwe-speed-tool](https://github.com/ridelabz/engwe-speed-tool) desarrollada por ridelabz.

---

## ⚡ Características

- **Protocolo BLE 100% idéntico**: Implementación exacta de tramas binarias (`45 6E ... 77 65`) y verificación CRC-16/MODBUS.
- **Límites de velocidad**: 16 km/h, 25 km/h (Legal UE), 32 km/h y 45 km/h con diálogo de confirmación de seguridad para velocidades > 25 km/h.
- **Niveles de asistencia**: Niveles 0 (Off) hasta 5.
- **Luces y Encendido**: Encender/apagar luces delanteras y bloqueo/desbloqueo de encendido de la bici.
- **Dashboard en tiempo real**: Velocidad actual, velocidad máxima, batería %, salud de la batería %, temperatura del controlador, voltaje, odómetro y tiempo de viaje.
- **Persistencia de ajustes**: Opciones *"Keep this speed"* y *"Keep this assist level"* para reaplicar automáticamente al reconectar o encender la bici.
- **Modo Demo**: Permite navegar y probar toda la interfaz y telemetría animada sin necesidad de estar cerca de la bici.
- **Verificación de compatibilidad**: Envío seguro de comando de solo lectura (`0x2411` / `0xFF01`) para comprobar si tu modelo coincide con el verificado (`ENGWE_Omni_ebike1100EU317`).
- **Exportación de logs**: Exporta y comparte el registro de la sesión mediante el menú nativo de iOS.

---

## 📱 Cómo compilar e instalar en tu iPhone con tu cuenta Apple Developer

La aplicación utiliza **Expo Application Services (EAS Build)** para compilar en la nube de Apple sin necesidad de configurar certificados manualmente.

### Paso 1: Abrir la terminal en la carpeta del proyecto
Abre PowerShell o Terminal en:
```bash
cd C:\Users\jagoba\Desktop\Eswe
```

### Paso 2: Iniciar sesión en Expo (cuenta gratuita)
Si no tienes cuenta de Expo, regístrate gratis en [expo.dev](https://expo.dev) y ejecuta:
```bash
npx eas login
```

### Paso 3: Vincular el proyecto
```bash
npx eas project:init
```

### Paso 4: Lanzar la compilación para iOS

#### Opción A: Instalación directa (Perfil Preview / Ad-Hoc)
Genera un enlace y código QR para instalar la aplicación directamente en tu iPhone:
```bash
npx eas build --platform ios --profile preview
```

#### Opción B: Distribución en TestFlight
Si prefieres tenerla en la app TestFlight de Apple:
```bash
npx eas build --platform ios --profile testflight
```

*Durante el proceso, EAS te pedirá iniciar sesión con tu cuenta de **Apple Developer**. EAS generará automáticamente los certificados de firma de Apple y perfiles de aprovisionamiento necesarios en la nube.*

---

## 🧪 Pruebas unitarias

El proyecto incluye tests automáticos que validan el cálculo del CRC-16/MODBUS y el desempaquetado de las tramas del protocolo ENGWE:

```bash
npm test
```

Para verificar tipos en TypeScript:
```bash
npx tsc --noEmit
```

---

## ⚠️ Aviso Legal y de Seguridad

Esta aplicación no está fabricada, respaldada ni afiliada con ENGWE.
- En la Unión Europea, las bicicletas de pedaleo asistido (EPAC) no deben asistir por encima de 25 km/h en vías públicas.
- Utiliza velocidades superiores a 25 km/h únicamente en terrenos privados o donde la legislación aplicable lo permita.
- Verificada en: ENGWE E26 3.0 Pro con firmware IoT 218CAN.
