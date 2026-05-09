# FinanceApp - Frontend Core

Este documento detalla las especificaciones técnicas, la arquitectura de módulos y los objetivos del frontend de la aplicación FinanceApp.

## 🎯 Objetivo del Proyecto
El objetivo principal de este desarrollo es proporcionar una **interfaz de usuario premium, intuitiva y de alto rendimiento** para la gestión de finanzas personales. 

Este frontend busca:
1.  **Simplificar la carga de datos**: Permitir al usuario registrar ingresos, gastos y ahorros en segundos.
2.  **Visualización Inteligente**: Transformar datos transaccionales en información accionable mediante gráficos dinámicos y análisis comparativos.
3.  **Experiencia de Usuario (UX) Superior**: Implementar un diseño basado en los principios de **One UI**, optimizado para el uso con una sola mano y pantallas AMOLED (Dark Mode total).

---

## 🚀 Características Técnicas
-   **Framework**: React Native con **Expo SDK 54**.
-   **Lenguaje**: TypeScript (Tipado estricto).
-   **Navegación**: **Expo Router v4** (File-based routing).
-   **Estilos**: **NativeWind v4** (Basado en Tailwind CSS) con soporte para Modo Oscuro dinámico.
-   **Gráficos**: **Victory Native XL** con aceleración por hardware vía **Skia**.
-   **Estado Global**: **Zustand** con optimización de re-renderizado mediante selectores shallow.

---

## 🧩 Arquitectura de Módulos

El proyecto está organizado de forma modular para facilitar la escalabilidad y el mantenimiento:

### 1. Sistema de Rutas y Navegación (`app/`)
Se encarga de la estructura jerárquica de la aplicación utilizando el sistema basado en archivos de Expo Router.
-   **`_layout.tsx`**: Define el Root Stack, manejando modales globales y el contexto de área segura (SafeArea).
-   **`(tabs)/`**: Organiza la navegación por pestañas (Inicio, Gastos, Estadísticas, Ajustes).
-   **`nueva-transaccion.tsx`**: Módulo de entrada de datos configurado como modal nativo.

### 2. Gestión de Estado Global (`src/store/`)
-   **`useFinanceStore.ts`**: Es el cerebro de la aplicación. Gestiona la base de datos en RAM (Zustand), permitiendo añadir, editar y eliminar transacciones de forma reactiva en toda la app.

### 3. Componentes de Interfaz (`src/components/`)
Componentes atómicos y moleculares reutilizables siguiendo la estética One UI:
-   **`SaldoCard`**: Tarjetas interactivas para visualizar Balances e Ingresos.
-   **`TransaccionItem`**: Fila estilizada para registros individuales con semántica de colores.
-   **`ComparacionMensualCard`**: Lógica visual para analizar rendimiento vs. meses anteriores.
-   **`CategoriaChip`**: Selectores horizontales para filtrado rápido.

### 4. Capa de Datos y Mocks (`src/mocks/`)
-   **`data.ts`**: Centraliza los datos iniciales "semilla" y funciones de utilidad para cálculos financieros (agrupación por categorías, porcentajes de ahorro, etc.).

### 5. Definición de Tipos (`src/types/`)
-   **`index.ts`**: Contiene las interfaces e invariantes de negocio (Transaccion, TipoTransaccion, CategoriaInfo), asegurando la integridad de los datos en todos los módulos.

---

## 🛠️ Modulos Realizados

1.  **Módulo de Dashboard**: Pantalla de inicio con resumen jerárquico de saldos y acceso rápido a últimas actividades.
2.  **Módulo de Listado Inteligente**: Visualización detallada de transacciones con filtrado dinámico por categoría y tipo (Ingresos/Gastos).
3.  **Módulo de Estadísticas**: Análisis visual de distribución de gastos (Gráficos de Torta) e histórico mensual (Gráficos de Barras).
4.  **Módulo de Carga y Edición**: Formulario unificado que permite registrar nuevos movimientos o editar existentes con validaciones en tiempo real.
5.  **Módulo de Configuración**: Gestión de temas (Claro/Oscuro/Sistema) y perfil de usuario.

---

**Estado Actual**: Frontend 100% funcional en memoria, estructurado para una integración inmediata con servicios de Backend mediante Fetch API.
