/* ============================================
   MAIN.JS — Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Particle Background ----
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');

    const PARTICLE_CONFIG = {
        COUNT: {
            MAX: 80,
            DENSITY_DIVISOR: 15000
        },
        SIZE: {
            BASE: 0.5,
            VARIATION: 2
        },
        SPEED: {
            FACTOR: 0.4
        },
        OPACITY: {
            BASE: 0.1,
            VARIATION: 0.4,
            LIGHT_THEME_MULTIPLIER: 0.5
        },
        CONNECTION: {
            DISTANCE: 150,
            OPACITY_BASE: 0.15,
            LIGHT_THEME_OPACITY_MULTIPLIER: 0.4,
            LINE_WIDTH: 0.5
        }
    };

    let particles = [];
    let animFrame;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * PARTICLE_CONFIG.SIZE.VARIATION + PARTICLE_CONFIG.SIZE.BASE;
            this.speedX = (Math.random() - 0.5) * PARTICLE_CONFIG.SPEED.FACTOR;
            this.speedY = (Math.random() - 0.5) * PARTICLE_CONFIG.SPEED.FACTOR;
            this.opacity = Math.random() * PARTICLE_CONFIG.OPACITY.VARIATION + PARTICLE_CONFIG.OPACITY.BASE;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
            const color = isDark
                ? `rgba(0, 212, 255, ${this.opacity})`
                : `rgba(100, 100, 180, ${this.opacity * PARTICLE_CONFIG.OPACITY.LIGHT_THEME_MULTIPLIER})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    function initParticles() {
        const count = Math.min(
            PARTICLE_CONFIG.COUNT.MAX,
            Math.floor((canvas.width * canvas.height) / PARTICLE_CONFIG.COUNT.DENSITY_DIVISOR)
        );
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawLines() {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < PARTICLE_CONFIG.CONNECTION.DISTANCE) {
                    const opacity = (1 - dist / PARTICLE_CONFIG.CONNECTION.DISTANCE) * PARTICLE_CONFIG.CONNECTION.OPACITY_BASE;
                    const color = isDark
                        ? `rgba(0, 212, 255, ${opacity})`
                        : `rgba(100, 100, 180, ${opacity * PARTICLE_CONFIG.CONNECTION.LIGHT_THEME_OPACITY_MULTIPLIER})`;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = PARTICLE_CONFIG.CONNECTION.LINE_WIDTH;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawLines();
        animFrame = requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    initParticles();
    animateParticles();

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    // ---- Navbar Scroll Effect ----
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // ---- Hamburger Menu ----
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // ---- Active Nav Highlight ----
    const sections = document.querySelectorAll('.section, .hero');
    const navLinkElements = document.querySelectorAll('.nav-link');

    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-80px 0px -50% 0px'
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinkElements.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));

    // ---- Theme Toggle ----
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // ---- Scroll Reveal ----
    const revealElements = document.querySelectorAll(
        '.glass-card, .section-header, .timeline-item, .education-card, .honors-grid, .certs-grid'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => revealObserver.observe(el));

    // ---- Smooth Scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

});
