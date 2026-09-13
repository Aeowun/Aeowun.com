export const sounds = {
    bgm_island: new Audio('audio/bgm_island.mp3'),
    bgm_dungeon: new Audio('audio/bgm_dungeon.mp3'),
    sfx_slash: new Audio('audio/sfx_slash.wav'),
    sfx_hit: new Audio('audio/sfx_hit.wav'),
    sfx_step: new Audio('audio/sfx_step.ogg')
};

let currentBGM = null;
let stepTimer = 0;
const STEP_INTERVAL = 0.35; // Seconds between footsteps

export function initAudio() {
    // Setup looping for BGM
    sounds.bgm_island.loop = true;
    sounds.bgm_dungeon.loop = true;

    // Set volumes
    sounds.bgm_island.volume = 0.4;
    sounds.bgm_dungeon.volume = 0.5;
    sounds.sfx_slash.volume = 0.6;
    sounds.sfx_hit.volume = 0.7;
    sounds.sfx_step.volume = 0.3;
}

export function playBGM(type) {
    if (currentBGM === sounds[type]) return;

    if (currentBGM) {
        currentBGM.pause();
        currentBGM.currentTime = 0;
    }

    currentBGM = sounds[type];
    if (currentBGM) {
        currentBGM.play().catch(e => console.log("Audio playback blocked until user interaction."));
    }
}

export function playSFX(type) {
    const sfx = sounds[type];
    if (sfx) {
        // Clone for overlapping sounds if needed, or just reset
        sfx.currentTime = 0;
        sfx.play().catch(e => {});
    }
}

export function updateAudio(dt, state) {
    // Handle Footsteps
    if (state.player.moving && !state.ui.dialogueOpen && !state.ui.storeOpen) {
        stepTimer -= dt;
        if (stepTimer <= 0) {
            playSFX('sfx_step');
            stepTimer = STEP_INTERVAL;
        }
    } else {
        stepTimer = 0;
    }

    // Auto-switch BGM based on world state
    const targetBGM = state.currentWorld === 'overworld' ? 'bgm_island' : 'bgm_dungeon';
    playBGM(targetBGM);
}
