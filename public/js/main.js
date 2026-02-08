// ---- Nolan Blenniss Resume — Interactive Features ----
// Particle background, theme toggle, scroll effects, hamburger menu
// Animations & smooth scroll

document.addEventListener('DOMContentLoaded', () => {

    // Utility: Debounce function to limit rate of execution
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

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
            DISTANCE_SQ: 22500, // 150 * 150 — squared for fast comparison
            OPACITY_BASE: 0.15,
            LIGHT_THEME_OPACITY_MULTIPLIER: 0.4,
            LINE_WIDTH: 0.5
        }
    };

    let particles = [];
    // Cache theme state to avoid repeated DOM access in animation loop
    let isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    let animFrame;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

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
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distSq = dx * dx + dy * dy;
                if (distSq < PARTICLE_CONFIG.CONNECTION.DISTANCE_SQ) {
                    const dist = Math.sqrt(distSq);
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
        if (document.hidden) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawLines();
        animFrame = requestAnimationFrame(animateParticles);
    }

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            animateParticles();
        }
    });

    initParticles();
    animateParticles();

    window.addEventListener('resize', debounce(() => {
        resizeCanvas();
        initParticles();
    }, 250));

    // ---- Navbar Scroll Effect ----
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
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

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // ---- Theme Toggle ----
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    isDark = savedTheme !== 'light';

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        isDark = next !== 'light';
        localStorage.setItem('theme', next);
    });

    // ---- Scroll Reveal ----
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));

    // ---- Smooth Scroll for Anchor Links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Update focus for accessibility
                target.setAttribute('tabindex', '-1');
                target.focus();
            }
        });
    });

    // ---- Scroll Spy (Active Nav Link) ----
    const spySections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navItems.forEach(link => {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                        link.setAttribute('aria-current', 'page');
                    }
                });
            }
        });
    }, { rootMargin: '-20% 0px -60% 0px' }); // Trigger when section is near top

    spySections.forEach(section => spyObserver.observe(section));

    // ---- Contact Form ----
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('formFeedback');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            // Reset feedback
            formFeedback.className = 'form-feedback';
            formFeedback.textContent = '';

            // Client-side validation (already handled by 'required' attribute, but we can double check)
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';

                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    formFeedback.textContent = 'Message sent successfully!';
                    formFeedback.classList.add('success', 'show');
                    contactForm.reset();
                } else {
                    throw new Error(result.error || 'Failed to send message.');
                }
            } catch (error) {
                formFeedback.textContent = error.message;
                formFeedback.classList.add('error', 'show');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
});
