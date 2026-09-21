# SpaceAdventureX

## Vision
A 2D side-scrolling space platformer/shooter combining the accessibility and momentum of a platform game with the enemy patterns and shooting of a classic arcade space shooter.

The player pilots a spaceship that is constantly traveling forward toward a destination planet. The objective of every level is to survive the journey and reach the planet.

The game should feel simple to learn, responsive, increasingly challenging, and visually exciting while remaining fully 2D and primarily Canvas-rendered.

## Core Controls

### Keyboard
- **A** — brake / reduce forward velocity; never reverse the ship
- **D** — boost forward; consumes energy
- **W** — move upward
- **S** — move downward
- **Space** — fire weapon

### Tablet / Touch
Controls should map naturally to the same actions:
- Vertical touch control for W/S movement
- Brake control for A
- Boost control for D
- Large fire control for Space

Touch controls must be designed for comfortable tablet play and should not depend on hover, right-click, or keyboard-only interaction.

## Core Movement Model

The ship has persistent forward velocity.

Suggested initial parameters:
- Minimum forward speed: 180
- Normal cruise speed: approximately 420
- Maximum boost speed: approximately 850
- Vertical movement controlled independently
- D increases forward velocity and consumes energy
- A decreases forward velocity toward the minimum but can never make velocity negative
- Releasing A/D allows velocity to settle naturally according to the movement model

The movement should feel more like piloting a ship with momentum than controlling a character on a flat plane.

## Core Gameplay Loop

1. Start level.
2. Ship automatically travels forward.
3. Navigate vertically through the environment.
4. Brake, boost, and maneuver around obstacles.
5. Shoot enemies and incoming threats.
6. Manage energy carefully.
7. Collect useful pickups where appropriate.
8. Survive increasingly difficult encounters.
9. Reach the destination planet.
10. Complete the level and unlock the next level.

## Combat

The player fires forward.

Enemies can:
- Fly in formations
- Move vertically
- Chase or intercept the player
- Fire projectiles
- Create obstacle patterns
- Become progressively tougher

Player combat should remain readable and arcade-like rather than becoming a complicated twin-stick shooter.

## Energy System

Energy is a major gameplay resource.

Energy can be consumed by:
- Forward boost
- Potential future special abilities

Energy can be restored through:
- Pickups
- Level-specific objects
- Potential future stations/checkpoints

The player should constantly make meaningful decisions about when to conserve energy and when to boost through danger.

## Level Structure

Levels are side-scrolling journeys with a fixed destination planet.

The camera continuously advances with the player's forward progress. The player cannot travel backward through the completed portion of a level.

Each level can contain:
- Enemy formations
- Enemy projectiles
- Asteroids
- Environmental obstacles
- Pickups
- Vertical navigation sections
- Special encounters
- Mini-bosses
- Bosses
- Final destination planet

## Procedural / Data-Driven Architecture

The game should support at least 250 levels without requiring 250 individually hand-authored maps.

Each level should primarily be described by deterministic data such as:

```js
{
  level: 47,
  seed: 847293,
  length: 18000,
  cruiseSpeed: 420,
  enemyDensity: 0.42,
  asteroidDensity: 0.28,
  projectileDifficulty: 0.35,
  boostCost: 1.0,
  planetType: 7,
  backgroundType: 3,
  boss: false
}
```

A seeded procedural generator should turn this data into a repeatable level.

The same level number and seed must produce the same gameplay layout every time.

Procedural generation should control:
- Enemy positions
- Enemy formations
- Asteroid positions
- Pickups
- Environmental hazards
- Decorative space objects
- Planet appearance
- Background composition
- Special encounters where appropriate

## Difficulty Progression

Difficulty should increase through curves rather than simple linear scaling.

Potential progression bands:

- Levels 1–10: Learning
- Levels 11–25: Introduction
- Levels 26–50: Pressure
- Levels 51–75: Advanced
- Levels 76–100: Dangerous
- Levels 101–150: Insane
- Levels 151–200: Expert
- Levels 201–249: Nightmare
- Level 250+: Endgame / special content

Difficulty variables can include:
- Level length
- Forward speed
- Enemy density
- Enemy health
- Enemy projectile frequency
- Projectile speed
- Asteroid density
- Vertical complexity
- Formation complexity
- Energy scarcity
- Boss frequency

Difficulty should increase while periodically introducing easier sections so levels have pacing instead of becoming an uninterrupted wall of difficulty.

## Planet System

The destination planet is a major visual reward at the end of each level.

Planets should be procedurally rendered with Canvas rather than requiring image assets.

Planet parameters may include:
- Radius
- Base color
- Atmosphere color
- Ring count
- Ring size
- Moon count
- Cloud bands
- Storms
- Surface highlights
- Glow strength

Higher-level planets should become increasingly spectacular and distinctive.

## Special Set Pieces

Most level content can be procedural, but selected levels should contain authored events.

Examples:
- Level 25: mini-boss
- Level 50: major asteroid gauntlet
- Level 75: giant enemy introduction
- Level 100: boss
- Level 125: space-station sequence
- Level 150: boss
- Level 200: massive enemy invasion
- Level 250: final boss / major milestone

These events should be layered on top of the procedural system rather than requiring a separate level architecture.

## Rendering Direction

The game should remain 2D.

Canvas should handle:
- Player ship
- Enemies
- Projectiles
- Asteroids
- Particles
- Planets
- Stars
- Nebulas
- Background effects
- Explosions
- UI where practical

Visual effects should favor procedural drawing, gradients, particles, and simple geometric forms so the game remains lightweight and easy to expand.

## Project Architecture

Target modular structure:

```text
SpaceAdventureX/
  index.html
  game.js
  physics.js
  level-generator.js
  levels.js
  entities.js
  weapons.js
  controls.js
  renderer.js
  audio.js
  ui.js
  plan.md
```

Responsibilities should remain separated so gameplay systems can evolve independently.

## First Prototype Milestone

The first playable prototype should contain only the essential loop:

- One side-scrolling level
- Player spaceship
- Constant forward velocity
- A brake
- A boost that consumes energy
- W/S vertical movement
- Shooting
- Basic enemy ships
- Enemy projectiles
- Basic collision/damage
- One or more obstacles
- A destination planet
- Level completion when the planet is reached
- Restart after failure
- Keyboard controls
- Tablet-friendly touch controls

Do not build 250 levels before the core movement and combat feel good.

## Development Principle

Build the engine first, then scale content through data.

The goal is not to hand-code hundreds of levels. The goal is to create a reliable game system capable of generating hundreds of distinct, deterministic, progressively difficult levels while allowing hand-authored set pieces where they provide the most value.
