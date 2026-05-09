# 📱 App Finanzas - Documento de Arquitectura y Reglas (Frontend V2)

## 🎯 Objetivo del Proyecto
Desarrollar desde cero el frontend de una aplicación de gestión financiera personal. La aplicación debe ser altamente performante, modular, con una experiencia de usuario (UX/UI) premium y ejecutarse perfectamente tanto en dispositivos móviles (enfocado en Android/Samsung S21 Ultra) como en navegadores Web.

**Estado de Conectividad:** ⚠️ ESTRICTAMENTE FRONTEND. No hay backend conectado. Todo el flujo de datos debe estar mockeado de forma robusta y tipada.

---

## 🛠️ Stack Tecnológico (Estricto)
Para garantizar el rendimiento y evitar problemas de compatibilidad, se deben usar estrictamente estas herramientas:
* **Framework:** Expo SDK (React Native) con soporte explícito para Web.
* **Lenguaje:** TypeScript (Tipado estricto, sin uso de `any`).
* **Navegación:** Expo Router (File-based routing). *Prohibido usar `NavigationContainer` manual o `react-navigation` clásico.*
* **Estilos:** NativeWind (Tailwind CSS para React Native). 
* **Estado Global:** Zustand.
* **Gráficos:** Victory Native XL (basado en Skia) para 60fps constantes.
* **Animaciones:** `react-native-reanimated`.

---

## 📐 Reglas de Arquitectura y Buenas Prácticas
1.  **Diseño Modular (Atomic Design):** Separar estrictamente la UI de la lógica de negocio. 
    * `/src/components/ui/` (Botones, Inputs, Chips - reutilizables).
    * `/src/components/features/` (Tarjetas de saldo, Listas de transacciones).
    * `/app/` (Exclusivamente para las pantallas de Expo Router).
2.  **Manejo de Datos (Mocks):** Toda la data simulada debe vivir en `/src/mocks/`. Debe estar centralizada e interactuar con Zustand para simular latencia de red e interacciones de base de datos (CRUD completo en memoria).
3.  **Optimización:** Usar `FlatList` (o `FlashList` si es posible) para renderizado de transacciones. Implementar `useMemo` y `useCallback` en componentes pesados y gráficos para evitar re-renderizados.

---

## 🎨 Principios de Diseño UX/UI (Mobile & Web)
1.  **Optimización Samsung S21 Ultra (Mobile-First):**
    * **AMOLED Dark Mode:** El tema oscuro debe ser el predeterminado, usando negro puro (`#000000` o `bg-black` en Tailwind) para apagar píxeles y ahorrar batería.
    * **Estética One UI:** Bordes ampliamente redondeados (`rounded-3xl` / 24px+), tipografía grande y legible, y elementos interactivos ubicados en el tercio inferior de la pantalla para facilitar el uso con una sola mano.
2.  **Adaptabilidad Web (Responsive):**
    * La aplicación no debe estirarse de forma fea en pantallas de escritorio.
    * En web, el layout principal debe estar centrado con un ancho máximo (ej. `max-w-md mx-auto`), simulando la vista móvil, o utilizar las clases responsivas de NativeWind (`md:`, `lg:`) para expandir paneles estadísticos hacia los lados.
3.  **Micro-interacciones:** Proveer feedback visual en cada toque (usando la opacidad o fondos de botones) y animaciones de entrada suaves al cargar pantallas.