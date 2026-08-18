# Implementation Plan - Media Content & Auto-Switching

Add images to the Media section and implement an idle-triggered auto-switching feature for the portfolio domains.

## Proposed Changes

### [Portfolio](file:///C:/Users/fixit/Documents/NexiCode/Projects/Portfolio/)

#### [MODIFY] [index.html](file:///C:/Users/fixit/Documents/NexiCode/Projects/Portfolio/index.html)
- Add `<img>` tags to `media-card` elements in the Media section:
    - **Tiny City**: `assets/media/tiny-city.png`
    - **The Apothecary**: `assets/media/apothecary.png`
    - **Blackline**: `assets/media/blackline.png`
- Ensure images are placed inside the `glass-card` but outside `media-info` for better layout.

#### [MODIFY] [app.js](file:///C:/Users/fixit/Documents/NexiCode/Projects/Portfolio/app.js)
- Implement `initAutoSwitch()` function.
- Track user activity (mousemove, mousedown, keydown, scroll) to manage an idle timer.
- After 20 seconds of idle time, start cycling through `DOMAINS` every 5 seconds.
- Reset the idle timer and stop auto-switching upon any user interaction.

## Verification Plan

### Manual Verification
- **Media Page**: Navigate to the MEDIA domain and verify that the three images are correctly displayed within their respective cards.
- **Auto-Switching**:
    1. Load the page and wait for 20 seconds without moving the mouse or interacting.
    2. Verify that the domains (AEOWUN, AXEIS, AEGIS, etc.) start switching every 5 seconds.
    3. Move the mouse or click a button and verify that the auto-switching stops and the idle timer resets.
