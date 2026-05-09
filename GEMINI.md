# FinanceApp - Proyecto de Gestión Financiera

## Resumen del Proyecto
FinanceApp es una aplicación móvil desarrollada con **React Native** y **Expo** diseñada para el seguimiento personal de finanzas. Permite gestionar periodos mensuales, registrar gastos, ahorros y visualizar resúmenes financieros. La aplicación se comunica con un backend externo mediante una API REST y está construida íntegramente con **TypeScript** para garantizar la seguridad de tipos.

### Tecnologías Principales
- **Frontend**: React Native (Expo SDK 54)
- **Lenguaje**: TypeScript
- **Comunicación**: Fetch API con normalización de moneda (centavos a decimales)

## Arquitectura y Estructura
La arquitectura sigue una separación clara entre la lógica de negocio/datos y la presentación:

- `src/types/`: Contiene todas las interfaces de dominio y de entrada/salida de la API.
- `src/services/api.ts`: Centraliza las peticiones HTTP, el manejo de errores y la normalización de montos monetarios (multiplicación/división por 100 para evitar problemas de coma flotante).
- `App.tsx`: Punto de entrada de la interfaz de usuario.

## Comandos Clave (Scripts de npm)
A continuación se detallan los comandos disponibles para el desarrollo:

- `npm start`: Inicia el servidor de desarrollo de Expo.
- `npm run android`: Ejecuta la aplicación en un emulador o dispositivo Android.
- `npm run ios`: Ejecuta la aplicación en un simulador o dispositivo iOS (requiere macOS).
- `npm run web`: Abre la aplicación en el navegador.

## Convenciones de Desarrollo
- **Manejo de Moneda**: Todos los montos deben ser tratados como enteros (centavos) al enviarlos o recibirlos de la API. La conversión a decimales debe ocurrir únicamente en la capa de servicio o presentación.
- **Tipado Estricto**: Se deben utilizar las interfaces definidas en `src/types/finance.ts` para cualquier operación que involucre datos financieros.
- **Variables de Entorno**: Es obligatorio configurar `EXPO_PUBLIC_API_URL` en el entorno para que la aplicación pueda comunicarse con el backend.

## TODOs Pendientes
- [x] Implementar la navegación (Expo Router).
- [ ] Desarrollar los componentes de UI para visualización de gastos y ahorros.
- [ ] Configurar validaciones de formularios para la creación de registros.
