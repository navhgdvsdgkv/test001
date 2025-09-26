# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser-based pool/billiards game written in vanilla JavaScript, HTML, and CSS. The game features:
- Canvas-based 2D graphics with realistic physics simulation
- Chinese language interface (台球游戏)
- Interactive mouse controls for aiming and shooting
- Ball collision detection and pocket mechanics
- Score tracking and win conditions

## Architecture

### Core Components

**PoolGame Class** (`script.js:67-344`)
- Main game controller that manages game state, rendering, and user interactions
- Handles canvas setup, event listeners, and game loop
- Manages ball physics, collision detection, and scoring

**Ball Class** (`script.js:1-47`)
- Represents individual balls with physics properties (position, velocity, friction)
- Handles ball movement, rendering, and potting state
- Includes visual distinction for cue ball (white with inner circle)

**Pocket Class** (`script.js:49-65`)
- Represents table pockets with collision detection
- Simple circular geometry for ball capture mechanics

### Game Physics

The physics engine implements:
- Ball-to-ball elastic collisions with mass conservation
- Boundary collisions with energy loss (0.8 coefficient)
- Friction simulation (0.98 coefficient per frame)
- Realistic ball separation on collision overlap

### UI Structure

- **HTML**: Basic structure with canvas, controls, and instructions
- **CSS**: Responsive design with gradient backgrounds and modern styling
- **Controls**: Mouse-based aiming system with power meter visualization

## File Structure

- `index.html` - Main HTML structure and Chinese UI text
- `script.js` - Complete game logic and physics engine
- `style.css` - Responsive styling with modern CSS features
- `code-review.md` - Code review template (Chinese)

## Development Notes

### Running the Game
Simply open `index.html` in a web browser - no build process required.

### Key Game Mechanics
- Mouse down starts aiming, mouse movement adjusts power, mouse up shoots
- Cue ball respawns after potting (with 1-second delay)
- Game ends when all colored balls are potted
- Power meter shows shot strength visually

### Physics Constants
- Ball radius: 12px
- Pocket radius: 25px
- Max power: 20 units
- Friction: 0.98 per frame
- Boundary bounce: 0.8 energy retention

### Language
All user-facing text is in Chinese. The game title is "台球游戏" (Pool Game).