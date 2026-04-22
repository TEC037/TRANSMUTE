# 💎 TRANSMUTE: Alchemical Habits (Beta)

> "Transforma el plomo de la rutina en el oro de la disciplina."

TRANSMUTE es una aplicación avanzada de gestión de hábitos que fusiona la psicología conductual con una narrativa alquímica inmersiva. Diseñada para dispositivos móviles, utiliza un sistema de progresión basado en XP (Esencia) y estados de materia (Nigredo, Albedo, Citrinitas, Rubedo).

---

## 🗺️ Índice del Proyecto (Mapa del Atanor)

### 📂 Estructura de Directorios

- **`/src`**: El núcleo de la transmutación.
    - **`components/`**: Elementos de la interfaz de usuario (React).
        - `AlchemistDashboard.jsx`: El altar principal de gestión diaria.
        - `HabitCard.jsx`: El nodo interactivo de cada hábito.
        - `ForgeOnboarding.jsx`: El ritual de inicio guiado por Tavira.
        - `AlchemicalGeode.jsx`: Representación visual del progreso total.
    - **`store/`**: El receptáculo del estado global.
        - `useStore.jsx`: Gestión de datos con Zustand y persistencia.
    - **`domain/`**: Las leyes puras de la aplicación.
        - `HabitDomain.js`: Lógica de rachas y logros.
        - `XPDomain.js`: Sistema de experiencia y niveles.
        - `InvocadorSystem.js`: Jerarquía de rangos del usuario.
    - **`repositories/`**: Capa de acceso a datos.
        - `HabitRepository.js`: Sincronización con Supabase.
    - **`utils/`**: Herramientas de soporte.
        - `haptics.js`: Retroalimentación táctil nativa.
        - `oracle.js`: Sistema de notificaciones y recordatorios.
    - **`constants/`**: Librería de sigilos (iconos) y categorías.

- **`/public`**: Activos públicos, manifiesto PWA y favicon.
- **`/lib`**: Configuraciones de librerías externas (Supabase).

---

## 🛠️ Tecnologías Utilizadas

- **Core:** React 19 + Vite + JavaScript.
- **Estado:** Zustand (con persistencia).
- **Estilos:** Tailwind CSS 4 + Framer Motion (animaciones cinéticas).
- **Backend:** Supabase (Auth + DB en tiempo real).
- **Mobile:** Capacitor 8 (Despliegue nativo iOS/Android).
- **Captura:** modern-screenshot (Generación de Códices).

---

## 🚀 Guía de Inicio (Iniciación)

1. **Instalar Dependencias:**
   ```bash
   npm install
   ```

2. **Entorno de Desarrollo:**
   ```bash
   npm run dev
   ```

3. **Sincronización Nativa (Capacitor):**
   ```bash
   npx cap sync
   ```

---

## 📜 Estado del Proyecto: Fase Beta
TRANSMUTE se encuentra en una fase de estabilidad crítica. La arquitectura actual prioriza la eficiencia de recursos y la legibilidad del código para futuras expansiones hacia el modelo Freemium.

**Adepto al mando:** TEC•LEO
**Versión:** 0.8.0 (Beta)
