# Pixel Art App

## Description

This is a web application for creating pixel art. The intuitive interface allows users to draw, erase, and fill cells on a grid with various brush sizes and layers. It is perfect for designers, artists, and pixel art enthusiasts.

## Features

- **Tools:**

  - Draw, Erase, and Fill.
  - Basic shapes: Circle, Square, Line.
  - Adjustable brush size.
  - Preview tool.

- **Grid Settings:**

  - Adjustable grid size (number of cells).
  - Configurable cell size in pixels.

- **Layers:**

  - Layer management system to handle multiple elements.
  - Toggle, delete, and opacity adjustment for layers.

- **Controls:**

  - "Clear Canvas" button to reset the grid.

- **Undo/Redo (Roadmap)**

  - Limited to the last 20 states.
  - Undo/Redo are not saved in localStorage due to storage constraints.

- **State Persistence (localStorage - Roadmap):**

  - The grid state and selected tools are saved in localStorage, allowing users to continue their work when reloading the page.
  - The app uses jotai for state management and localStorage to persist key data, such as grid design, tools settings and layer settings.

## Technologies Used

- **React**: JavaScript framework for building user interfaces.
- **Jotai**: State management library for React, ensuring lightweight and atomic state handling.

## Requirements

- Node.js (version 14 or higher)
- A modern web browser (Chrome, Firefox, Edge, etc.)
