# Brantsworld

## Game Concept

Brantsworld is a kid-friendly space adventure built around exploration, collecting, friendly robots, and simple arcade action.

The game combines space-opera adventure, retro-futuristic wasteland aesthetics, and a playful playground feel while keeping the experience bright and non-scary for a 9-year-old player.

## Objective

Play as the Galaxy Ranger and explore Brantsworld.

Your goals are to:

1. Collect glowing energy crystals.
2. Find friendly robots scattered around the world.
3. Use your Star Burst ability to rescue nearby robots.
4. Bring rescued robots along as you explore.
5. Rescue every friendly robot to complete the adventure.

## Tablet Controls

Brantsworld is designed for tablet-first gameplay with large, comfortable touch controls.

| Touch Control | Action |
|---|---|
| Virtual joystick | Move the Galaxy Ranger |
| Star Burst button | Activate Star Burst |
| Tap a crystal | Collect it when nearby |
| Swipe / drag | Optional camera movement |
| Pause button | Pause the adventure |

### Tablet Design Rules

- Use large touch targets suitable for young players.
- Keep important buttons away from the screen edges.
- Support both portrait and landscape layouts, with landscape as the recommended mode.
- Avoid requiring a physical keyboard or mouse.
- Keep the HUD simple and readable on smaller screens.
- Use clear icons plus short labels so controls are easy to understand.
- Make touch feedback obvious with animations, sounds, and button effects.
- Prevent accidental browser scrolling while playing.

### Recommended Layout

Left side: virtual movement joystick.

Right side: large Star Burst button and smaller Pause button.

Top: stars, rescued robots, and energy meter.

Center: unobstructed gameplay area.

### Optional Keyboard Controls

Keyboard controls can remain available for desktop testing:

| Control | Action |
|---|---|
| W / Arrow Up | Move up |
| S / Arrow Down | Move down |
| A / Arrow Left | Move left |
| D / Arrow Right | Move right |
| Space | Star Burst |

## Game Systems

### Crystal Collection

Glowing crystals are spread throughout the world. Moving close to a crystal collects it automatically.

Each crystal awards 5 stars and respawns somewhere else in the world so exploration can continue.

### Friendly Robots

Eight friendly robots wander around Brantsworld.

Robots can be rescued when the player activates Star Burst close enough to them. Rescued robots follow the player.

Each rescued robot awards 25 stars.

### Star Burst

Star Burst is the player's special ability.

- Costs 25 energy.
- Has a short cooldown.
- Creates a burst of particles around the player.
- Rescues nearby friendly robots.

Energy automatically regenerates while playing.

## Player

The player is represented by a friendly glowing blue Galaxy Ranger character.

The character has:

- 100 maximum energy
- Smooth directional movement
- A glowing space-themed appearance
- A friendly face
- A Star Burst ability

## World

The game world uses a colorful alien playground aesthetic with:

- Dark space-inspired skies
- Glowing crystals
- Grid-like terrain
- Large futuristic playground structures
- Friendly wandering robots
- Bright visual effects

The environment is designed to feel adventurous without being frightening or violent.

## Winning

The game is completed when all 8 friendly robots have been rescued.

The player then sees:

> BRANT SAVED THE WORLD!

A Play Again button resets the game and starts a new adventure.

## Technical Structure

The game can be implemented as a standalone HTML5 game using:

- HTML
- CSS
- JavaScript
- HTML Canvas
- requestAnimationFrame for the game loop

No external libraries are required.

## Suggested Future Features

Possible additions include:

- Multiple planets
- More robot types
- Collectible costumes
- A customizable player character
- Friendly alien characters
- Simple quests
- Secret playground areas
- Boss-sized puzzle challenges without scary combat
- Sound effects and original music
- Local high scores
- A map screen
- More Star Burst abilities

## Design Goal

Brantsworld should feel like a colorful, imaginative playground in space: easy to understand, fun to explore, and rewarding for a young player.
