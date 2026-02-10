/* ============================================
   MAIN.JS — iOS 18 Glass Interactions
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* ——— PARTICLES ——— */
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;
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
            this.size = Math.random() * 1.8 + 0.4;
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.speedY = (Math.random() - 0.5) * 0.2;
            this.opacity = Math.random() * 0.2 + 0.03;
            this.pulseSpeed = Math.random() * 0.008 + 0.003;
            this.pulseOffset = Math.random() * Math.PI * 2;
        }
        update(time) {
            this.x += this.speedX;
            this.y += this.speedY;
            this.currentOpacity = this.opacity + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.04;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            const alpha = Math.max(0, this.currentOpacity || this.opacity);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = isDarkTheme
                ? `rgba(48, 213, 200, ${alpha})`
                : `rgba(99, 102, 241, ${alpha * 0.35})`;
            ctx.fill();
        }
    }

    function initParticles() {
        const count = Math.min(50, Math.floor((canvas.width * canvas.height) / 25000));
        particles = [];
        for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function drawLines() {
        const threshold = 130;
        const thresholdSq = threshold * threshold;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distSq = dx * dx + dy * dy;
                if (distSq < thresholdSq) {
                    const dist = Math.sqrt(distSq);
                    const opacity = (1 - dist / threshold) * 0.07;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = isDarkTheme
                        ? `rgba(48, 213, 200, ${opacity})`
                        : `rgba(99, 102, 241, ${opacity * 0.25})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles(time) {
        if (!isPageVisible) { animFrame = requestAnimationFrame(animateParticles); return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(time || 0); p.draw(); });
        drawLines();
        animFrame = requestAnimationFrame(animateParticles);
    }

    document.addEventListener('visibilitychange', () => { isPageVisible = !document.hidden; });
    resizeCanvas();
    initParticles();
    animateParticles();
    window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

    /* ——— NAVBAR SCROLL ——— */
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

    /* ——— HAMBURGER ——— */
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

    /* ——— ACTIVE NAV ——— */
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

    /* ——— THEME TOGGLE ——— */
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    function updateThemeColor(theme) {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a10' : '#f2f2f7');
        isDarkTheme = theme === 'dark';
    }
    updateThemeColor(savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeColor(next);
    });

    /* ——— SCROLL REVEAL ——— */
    const revealElements = document.querySelectorAll(
        '[data-reveal], .glass-card, .section-header, .timeline-item, .education-card, .honors-grid, .certs-grid, .contact-form-wrapper'
    );
    revealElements.forEach((el) => {
        el.classList.add('reveal');
        const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
        const index = siblings.indexOf(el);
        if (index > 0) el.style.transitionDelay = `${index * 0.05}s`;
    });
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    /* ——— SMOOTH SCROLL ——— */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    /* ——— CURSOR-REACTIVE GLASS GLOW ——— */
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

    /* ——— 3D TILT ON GLASS CARDS ——— */
    const tiltCards = document.querySelectorAll('.about-card, .honor-card, .cert-card, .skill-category');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -3;
            const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 3;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ——— CONTACT FORM ——— */
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
