# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a **single-file web application** (`lotto.html`) that generates lottery numbers using advanced randomization techniques. The entire application is contained in one HTML file with embedded CSS and JavaScript - no build process or dependencies required.

### Core Components
- **`lotto.html`** - Complete application (HTML, CSS, JS in one file)
- **`lotteries.json`** - Lottery game configurations (UK National, Powerball, EuroMillions, etc.)
- **`README.md`** - User documentation
- **`ENTROPY_IMPROVEMENTS.md`** - Technical documentation on randomization algorithms

## Development Commands

**No build process needed** - this is a static web application.

### To run locally:
```bash
# Option 1: Open directly in browser
open lotto.html

# Option 2: Serve via HTTP server (recommended for development)
python -m http.server 8000
# Then visit http://localhost:8000/lotto.html
```

### No package manager or build tools:
- No `package.json` or `node_modules`
- No webpack, parcel, or other bundlers
- No transpilation required
- All dependencies loaded via CDN

## Application Architecture

### Single-File Monolithic Design
The entire application logic is embedded in `lotto.html`:
- **HTML Structure**: Bootstrap 4 UI with form controls and display areas
- **CSS**: Embedded styles for lottery balls, chaos visualization, animations
- **JavaScript**: ~850 lines implementing multiple RNG algorithms and UI logic

### Configuration-Driven System
- Lottery parameters defined in `lotteries.json`
- Dynamic form updates based on selected lottery type
- Easy to add new lotteries without code changes

### Advanced Random Number Generation
The application implements 4 sophisticated randomization methods:

1. **Cryptographic RNG**: Bias-free using Web Crypto API with rejection sampling
2. **Multi-Entropy Fusion**: Combines 5 entropy sources (crypto, quantum-inspired, atmospheric, timing, hardware)
3. **Physical Ball Simulation**: Chaos theory using Lorenz attractor to simulate real lottery machines
4. **Quantum-Inspired RNG**: Simulates quantum superposition and measurement

### Key Technical Features
- **Pool-reduction mechanism**: Simulates real lottery draws by removing selected numbers
- **Bias elimination**: Uses rejection sampling to avoid modulo bias
- **Chaos visualization**: Real-time entropy monitoring during generation
- **Historical matching**: Compares generated numbers against past lottery draws via CSV data
- **Image generation**: Creates shareable lottery number images using html2canvas

## External Dependencies (CDN)
- Bootstrap 4.5.2 (UI framework)
- jQuery 3.5.1 (DOM manipulation)
- html2canvas (image generation)
- Random.org API (optional true random numbers)

## Data Flow
```
User Input → Lottery Config → RNG Selection → Number Generation → Display → Optional Historical Matching
```

## Code Organization Within lotto.html
- **Configuration loading**: Fetches and processes `lotteries.json`
- **RNG implementations**: Four separate algorithms with shared interfaces
- **UI controllers**: Form handling, animation, and display logic
- **Utility functions**: CSV parsing, image generation, historical data processing
- **Entropy visualization**: Real-time chaos monitoring and progress indication

## Adding New Features
- **New lottery types**: Add entries to `lotteries.json`
- **New RNG methods**: Implement in the JavaScript section following existing patterns
- **UI modifications**: Update HTML structure and embedded CSS
- **Historical data**: Modify CSV parsing logic for new data sources

Since this is a single-file application, all changes are made directly in `lotto.html`. The modular JavaScript structure within the file makes it easy to locate and modify specific functionality.