/**
 * AEOWUN.COM
 * Canonical Architecture & Shared Interactive Behaviors
 */

document.addEventListener("DOMContentLoaded", () => {
    initializeEnvironment();
    initializePointerTracking();
    initializeNavRail();
});

/**
 * NAV RAIL
 * Handles mobile side navigation menu across all page depths
 */
function initializeNavRail() {
    const toggle = document.getElementById('nav-toggle');
    const rail = document.getElementById('nav-rail');
    const closeBtns = [
        document.getElementById('rail-close'),
        document.getElementById('rail-close-btn')
    ];

    if (!toggle || !rail) return;

    toggle.addEventListener('click', () => {
        rail.classList.add('active');
        rail.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    });

    const closeMenu = () => {
        rail.classList.remove('active');
        rail.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    closeBtns.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', closeMenu);
    });

    const railLinks = rail.querySelectorAll('.rail-link');
    railLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close on ESC key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && rail.classList.contains('active')) {
            closeMenu();
        }
    });
}


/**
 * ENVIRONMENT
 * Luminous Wave System (Independent Ambient Animation)
 */
function initializeEnvironment() {
    if (window.innerWidth <= 900) return;

    const waveContainer = document.getElementById('wave-field-svg');
    if (!waveContainer) return;

    const ribbonCount = 40;
    const ribbons = [];

    for (let i = 0; i < ribbonCount; i++) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("class", "wave-ribbon");
        path.setAttribute("stroke", i % 2 === 0 ? "url(#grad-v)" : "url(#grad-b)");
        path.setAttribute("stroke-width", (1 + Math.random() * 2).toString());
        path.setAttribute("filter", "url(#ribbon-glow)");
        path.setAttribute("opacity", (0.05 + Math.random() * 0.1).toString());
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
    // animate();
}


