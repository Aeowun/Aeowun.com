/**
 * AEOWUN.COM
 * Discrete Scene Controller & Environmental Logic
 */

document.addEventListener("DOMContentLoaded", () => {
    initializeEnvironment();
    initializeSceneController();
    initializeAmbientField();
});

/**
 * SCENE CONTROLLER
 * Decouples scroll from animation progress.
 * Scroll acts as a navigational trigger.
 */
function initializeSceneController() {
    const scenes = document.querySelectorAll('.scene');
    if (scenes.length === 0) return;

    // Disable scene controller on mobile
    if (window.innerWidth <= 900) {
        scenes.forEach(s => s.classList.add('active'));
        return;
    }

    let currentSceneIndex = 0;
    let isTransitioning = false;
    const transitionDuration = 1200; // Controlled premium speed

    function goToScene(index) {
        if (index < 0 || index >= scenes.length || isTransitioning) return;
        if (index === currentSceneIndex) return;

        isTransitioning = true;

        // Deactivate current scene
        scenes[currentSceneIndex].classList.remove('active');

        // Update index
        currentSceneIndex = index;

        // Activate new scene after a small delay for smoother overlap
        setTimeout(() => {
            scenes[currentSceneIndex].classList.add('active');

            // Re-enable input after transition completes
            setTimeout(() => {
                isTransitioning = false;
            }, transitionDuration);
        }, 50);
    }

    // Input Listeners
    window.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) < 10) return; // Ignore small movements
        if (e.deltaY > 0) goToScene(currentSceneIndex + 1);
        else goToScene(currentSceneIndex - 1);
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') goToScene(currentSceneIndex + 1);
        if (e.key === 'ArrowUp' || e.key === 'PageUp') goToScene(currentSceneIndex - 1);
    });

    // Touch Support (Simplified)
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => touchStartY = e.touches[0].clientY);
    window.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const delta = touchStartY - touchEndY;
        if (Math.abs(delta) > 50) {
            if (delta > 0) goToScene(currentSceneIndex + 1);
            else goToScene(currentSceneIndex - 1);
        }
    });

    // Initial Scene
    scenes[0].classList.add('active');

    // Pointer Response (Ambient)
    window.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 40;
        const y = (e.clientY / window.innerHeight - 0.5) * 40;
        document.documentElement.style.setProperty("--pointer-x", `${x}px`);
        document.documentElement.style.setProperty("--pointer-y", `${y}px`);
        document.documentElement.style.setProperty("--mouse-x", `${(e.clientX / window.innerWidth) * 100}%`);
        document.documentElement.style.setProperty("--mouse-y", `${(e.clientY / window.innerHeight) * 100}%`);
    });
}

/**
 * ENVIRONMENT
 * Luminous Wave System (Independent Ambient Animation)
 */
function initializeEnvironment() {
    // Disable on mobile to prevent freezing
    if (window.innerWidth <= 900) return;

    const waveContainer = document.getElementById('wave-field-svg');
    if (!waveContainer) return;

    const ribbonCount = 40;
    const ribbons = [];

    for (let i = 0; i < ribbonCount; i++) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("class", "wave-ribbon");
        path.setAttribute("stroke", i % 2 === 0 ? "url(#grad-v)" : "url(#grad-b)");
        path.setAttribute("stroke-width", 1 + Math.random() * 2);
        path.setAttribute("filter", "url(#ribbon-glow)");
        path.setAttribute("opacity", 0.05 + Math.random() * 0.1);
        waveContainer.appendChild(path);
        ribbons.push({ element: path, offset: Math.random() * 100, speed: 0.5 + Math.random() * 0.5 });
    }

    let time = 0;
    function animate() {
        time += 0.001;

        ribbons.forEach((r, i) => {
            const t = time * r.speed;
            const y1 = 800 + Math.sin(t + r.offset) * 150;
            const cp1x = 300 + Math.cos(t) * 100;
            const cp2x = 500 + r.offset;
            const cp2y = 500 + Math.cos(t) * 50;
            const endY = 200 + Math.sin(t + i) * 100;

            r.element.setAttribute("d", `M-100,${y1} Q${cp1x},1000 500,500 T1100,${endY}`);
        });

        requestAnimationFrame(animate);
    }
    animate();
}

/**
 * AMBIENT FIELD
 */
function initializeAmbientField() {
    // Disable on mobile to prevent freezing
    if (window.innerWidth <= 900) return;

    const canvas = document.getElementById("ambient-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height, particles = [];

    function resize() {
        width = window.innerWidth; height = window.innerHeight;
        canvas.width = width * (window.devicePixelRatio || 1);
        canvas.height = height * (window.devicePixelRatio || 1);
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        createParticles();
    }

    function createParticles() {
        particles = [];
        const count = Math.floor(width / 50);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width, y: Math.random() * height,
                r: Math.random() * 0.6 + 0.1,
                vx: (Math.random() - 0.5) * 0.05, vy: (Math.random() - 0.5) * 0.05,
                o: Math.random() * 0.3 + 0.1
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.o})`; ctx.fill();
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize(); draw();
}
