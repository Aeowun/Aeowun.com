/* =========================================================
   AEOWUN ENGINEERING ARCHIVE
   Domain Navigation
========================================================= */

function switchDomain(domain) {

    const sections = document.querySelectorAll(".domain-surface");
    const navItems = document.querySelectorAll(".nav-item[data-domain]");

    sections.forEach(section => {
        section.classList.toggle(
            "active",
            section.id === domain
        );
    });

    navItems.forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.domain === domain
        );
    });

    document.body.className = `domain-${domain}`;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   INITIAL STATE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const defaultDomain = "systems";

    switchDomainImmediate(defaultDomain);

    initializeAmbientField();
});


function switchDomainImmediate(domain) {

    const sections = document.querySelectorAll(".domain-surface");
    const navItems = document.querySelectorAll(".nav-item[data-domain]");

    sections.forEach(section => {
        section.classList.toggle(
            "active",
            section.id === domain
        );
    });

    navItems.forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.domain === domain
        );
    });

    document.body.className = `domain-${domain}`;
}


/* =========================================================
   AMBIENT FIELD
   Extremely restrained background motion.
========================================================= */

function initializeAmbientField() {

    const canvas = document.getElementById("ambient-canvas");

    if (!canvas) {
        return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
        return;
    }

    let width = 0;
    let height = 0;

    const particles = [];

    function resizeCanvas() {

        const ratio = window.devicePixelRatio || 1;

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = width * ratio;
        canvas.height = height * ratio;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );
    }


    function createParticles() {

        particles.length = 0;

        const count = Math.min(
            35,
            Math.floor(window.innerWidth / 45)
        );

        for (let i = 0; i < count; i++) {

            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,

                radius: Math.random() * 0.8 + 0.2,

                velocityX:
                    (Math.random() - 0.5) * 0.08,

                velocityY:
                    (Math.random() - 0.5) * 0.08,

                opacity:
                    Math.random() * 0.15 + 0.03
            });
        }
    }


    function render() {

        context.clearRect(
            0,
            0,
            width,
            height
        );

        particles.forEach(particle => {

            particle.x += particle.velocityX;
            particle.y += particle.velocityY;

            if (particle.x < 0) {
                particle.x = width;
            }

            if (particle.x > width) {
                particle.x = 0;
            }

            if (particle.y < 0) {
                particle.y = height;
            }

            if (particle.y > height) {
                particle.y = 0;
            }

            context.beginPath();

            context.arc(
                particle.x,
                particle.y,
                particle.radius,
                0,
                Math.PI * 2
            );

            context.fillStyle =
                `rgba(210, 215, 220, ${particle.opacity})`;

            context.fill();
        });

        requestAnimationFrame(render);
    }


    resizeCanvas();
    createParticles();
    render();


    window.addEventListener("resize", () => {

        resizeCanvas();
        createParticles();

    });

}