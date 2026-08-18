/**
 * AEOWUN / NEXICODE Portfolio Logic
 * Domain-Centric Navigation & Ambient Substrate
 */

(function() {
    // 1. Domain Configuration
    const DOMAINS = {
        aeowun: { color: "#22e0c4", name: "THE CORE ENGINE" },
        axeis: { color: "#539bf5", name: "RESEARCH & INTEL" },
        aegis: { color: "#ff4757", name: "NETWORK DEFENSE" },
        lango: { color: "#e8b75c", name: "LEARNING SYSTEMS" },
        media: { color: "#3aa0ff", name: "CREATIVE ARCHIVE" }
    };

    let activeDomain = 'aeowun';

    // 2. Ambient Background
    const initAmbient = () => {
        const canvas = document.getElementById("ambient-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let phase = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", resize);
        resize();

        const draw = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0, 0, w, h);

            const sColor = DOMAINS[activeDomain].color;

            const strands = [
                { color: sColor, yFrac: 0.65, ampFrac: 0.05, freq: 1.2, offset: 2.1, alpha: 0.15 },
                { color: "#ffffff", yFrac: 0.35, ampFrac: 0.04, freq: 1.5, offset: 0.6, alpha: 0.05 },
                { color: sColor, yFrac: 0.50, ampFrac: 0.03, freq: 0.8, offset: 1.2, alpha: 0.08 }
            ];

            strands.forEach((s) => {
                const baseY = h * s.yFrac;
                const amp = h * s.ampFrac;

                ctx.beginPath();
                for (let i = 0; i <= 60; i++) {
                    const x = w * (i / 60);
                    const y = baseY + amp * Math.sin((i / 60) * Math.PI * s.freq * 2 + phase + s.offset);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                ctx.strokeStyle = s.color;
                ctx.globalAlpha = s.alpha;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            });
        };

        const loop = () => {
            phase += 0.008;
            draw();
            requestAnimationFrame(loop);
        };

        loop();
    };

    // 3. Domain Switching
    window.switchDomain = (domainId) => {
        if (!DOMAINS[domainId]) return;

        // Update body class for CSS variables
        document.body.className = `domain-${domainId}`;

        // Update nav items
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.domain === domainId);
        });

        // Update active surface
        const oldSurface = document.querySelector('.domain-surface.active');
        const newSurface = document.getElementById(domainId);

        if (oldSurface && oldSurface !== newSurface) {
            oldSurface.classList.remove('active');
            setTimeout(() => {
                newSurface.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 300);
        }

        activeDomain = domainId;
    };

    // 4. Reveal Animations
    const initReveals = () => {
        const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.tech-row, .media-card, .metric-item, .archive-item').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
            observer.observe(el);
        });

        const style = document.createElement('style');
        style.innerHTML = `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
        document.head.appendChild(style);
    };

    document.addEventListener("DOMContentLoaded", () => {
        initAmbient();
        initReveals();
        console.log("AEOWUN Domain Controller Initialized.");
    });
})();
