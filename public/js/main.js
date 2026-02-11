/* ============================================
   MAIN.JS — Premium Frosted Glass Interactions
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* ——————————————————————————————————
       PARTICLE MESH — Subtle, elegant
       —————————————————————————————————— */
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: -1000, y: -1000 };
    let isPageVisible = true;
    let isDarkTheme = document.documentElement.getAttribute('data-theme') !== 'light';

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.baseSpeedX = (Math.random() - 0.5) * 0.3;
            this.baseSpeedY = (Math.random() - 0.5) * 0.3;
            this.speedX = this.baseSpeedX;
            this.speedY = this.baseSpeedY;
            this.opacity = Math.random() * 0.35 + 0.05;
            this.pulseSpeed = Math.random() * 0.01 + 0.004;
            this.pulseOffset = Math.random() * Math.PI * 2;
            this.hue = Math.random() > 0.5 ? 174 : 235; // teal or indigo
        }
        update(time) {
            // Mouse repulsion
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                this.speedX = this.baseSpeedX + (dx / dist) * force * 0.8;
                this.speedY = this.baseSpeedY + (dy / dist) * force * 0.8;
            } else {
                this.speedX += (this.baseSpeedX - this.speedX) * 0.05;
                this.speedY += (this.baseSpeedY - this.speedY) * 0.05;
            }
            this.x += this.speedX;
            this.y += this.speedY;
            this.currentOpacity = this.opacity + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.08;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            const alpha = Math.max(0, this.currentOpacity || this.opacity);
            if (isDarkTheme) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.hue === 174
                    ? `rgba(48, 213, 200, ${alpha})`
                    : `rgba(129, 140, 248, ${alpha * 0.6})`;
                ctx.fill();
                // Soft glow
                if (this.size > 1.5) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                    ctx.fillStyle = this.hue === 174
                        ? `rgba(48, 213, 200, ${alpha * 0.08})`
                        : `rgba(129, 140, 248, ${alpha * 0.05})`;
                    ctx.fill();
                }
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99, 102, 241, ${alpha * 0.3})`;
                ctx.fill();
            }
        }
    }

    function initParticles() {
        const count = Math.min(65, Math.floor((canvas.width * canvas.height) / 18000));
        particles = [];
        for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function drawLines() {
        const threshold = 140;
        const thresholdSq = threshold * threshold;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distSq = dx * dx + dy * dy;
                if (distSq < thresholdSq) {
                    const dist = Math.sqrt(distSq);
                    const opacity = (1 - dist / threshold) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = isDarkTheme
                        ? `rgba(48, 213, 200, ${opacity})`
                        : `rgba(99, 102, 241, ${opacity * 0.2})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles(time) {
        if (!isPageVisible) { requestAnimationFrame(animateParticles); return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(time || 0); p.draw(); });
        drawLines();
        requestAnimationFrame(animateParticles);
    }

    document.addEventListener('visibilitychange', () => { isPageVisible = !document.hidden; });
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    resizeCanvas();
    initParticles();
    animateParticles();
    window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

    /* ——————————————————————————————————
       CURSOR SPOTLIGHT — Page-level ambient glow
       —————————————————————————————————— */
    const spotlight = document.createElement('div');
    spotlight.style.cssText = `
    position: fixed;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(circle, rgba(48, 213, 200, 0.04) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    opacity: 0;
  `;
    document.body.appendChild(spotlight);
    let spotlightVisible = false;

    window.addEventListener('mousemove', (e) => {
        spotlight.style.left = e.clientX + 'px';
        spotlight.style.top = e.clientY + 'px';
        if (!spotlightVisible) {
            spotlight.style.opacity = '1';
            spotlightVisible = true;
        }
    });

    window.addEventListener('mouseleave', () => {
        spotlight.style.opacity = '0';
        spotlightVisible = false;
    });

    /* ——————————————————————————————————
       NAVBAR
       —————————————————————————————————— */
    const navbar = document.getElementById('navbar');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    /* ——————————————————————————————————
       HAMBURGER
       —————————————————————————————————— */
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

    /* ——————————————————————————————————
       ACTIVE NAV
       —————————————————————————————————— */
    const sections = document.querySelectorAll('.section, .hero');
    const navLinkElements = document.querySelectorAll('.nav-link');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinkElements.forEach(link =>
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`)
                );
            }
        });
    }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });
    sections.forEach(section => sectionObserver.observe(section));

    /* ——————————————————————————————————
       THEME TOGGLE
       —————————————————————————————————— */
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    function updateThemeColor(theme) {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0b18' : '#f2f2f7');
        isDarkTheme = theme === 'dark';
        spotlight.style.background = theme === 'dark'
            ? 'radial-gradient(circle, rgba(48, 213, 200, 0.04) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.03) 0%, transparent 70%)';
    }
    updateThemeColor(savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeColor(next);
    });

    /* ——————————————————————————————————
       SCROLL REVEAL — Staggered with scale
       —————————————————————————————————— */
    const revealElements = document.querySelectorAll(
        '[data-reveal], .glass-card, .section-header, .timeline-item, .education-card, .honors-grid, .certs-grid, .contact-form-wrapper'
    );
    revealElements.forEach((el) => {
        el.classList.add('reveal');
    });
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    /* ——————————————————————————————————
       SMOOTH SCROLL
       —————————————————————————————————— */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    /* ——————————————————————————————————
       CURSOR-REACTIVE GLASS GLOW
       —————————————————————————————————— */
    const glowCards = document.querySelectorAll('.glass-card');
    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--glow-x', `${x}%`);
            card.style.setProperty('--glow-y', `${y}%`);
        });
    });

    /* ——————————————————————————————————
       3D TILT — perspective hover on cards
       —————————————————————————————————— */
    const tiltCards = document.querySelectorAll('.about-card, .honor-card, .cert-card, .skill-category, .contact-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -4;
            const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 4;
            card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.transform = '';
            setTimeout(() => { card.style.transition = ''; }, 500);
        });
    });

    /* ——————————————————————————————————
       MAGNETIC BUTTONS
       —————————————————————————————————— */
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.03)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            btn.style.transform = '';
            setTimeout(() => { btn.style.transition = ''; }, 400);
        });
    });

    /* ——————————————————————————————————
       SKILL TAG WAVE
       —————————————————————————————————— */
    document.querySelectorAll('.skill-tags').forEach(container => {
        const tags = container.querySelectorAll('.skill-tag');
        container.addEventListener('mouseenter', () => {
            tags.forEach((tag, i) => {
                tag.style.transitionDelay = `${i * 0.03}s`;
                tag.style.transform = 'translateY(-2px) scale(1.03)';
                tag.style.borderColor = 'var(--accent-teal)';
            });
        });
        container.addEventListener('mouseleave', () => {
            tags.forEach(tag => {
                tag.style.transitionDelay = '0s';
                tag.style.transform = '';
                tag.style.borderColor = '';
            });
        });
    });

    /* ——————————————————————————————————
       CONTACT FORM
       —————————————————————————————————— */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const statusEl = document.getElementById('formStatus');
            const submitBtn = document.getElementById('formSubmit');
            const formData = {
                name: document.getElementById('formName').value.trim(),
                email: document.getElementById('formEmail').value.trim(),
                subject: document.getElementById('formSubject').value.trim(),
                message: document.getElementById('formMessage').value.trim(),
            };

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            statusEl.className = 'form-status';
            statusEl.style.display = 'none';

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                const data = await res.json();

                if (data.success) {
                    statusEl.textContent = 'Message sent successfully! I\'ll get back to you soon.';
                    statusEl.className = 'form-status success';
                    statusEl.style.display = 'block';
                    contactForm.reset();
                } else {
                    throw new Error(data.error || 'Something went wrong');
                }
            } catch (err) {
                statusEl.textContent = err.message || 'Failed to send message. Please try again.';
                statusEl.className = 'form-status error';
                statusEl.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message`;
            }
        });
    }
});
