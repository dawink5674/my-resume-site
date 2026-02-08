/* ============================================
   MAIN.JS — Hyper-Modern Glass Interactions
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;
    let isPageVisible = true;

    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5; this.speedX = (Math.random() - 0.5) * 0.3; this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.3 + 0.05; this.pulseSpeed = Math.random() * 0.01 + 0.005; this.pulseOffset = Math.random() * Math.PI * 2;
        }
        update(time) {
            this.x += this.speedX; this.y += this.speedY;
            this.currentOpacity = this.opacity + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.05;
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        draw() {
            const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
            const alpha = Math.max(0, this.currentOpacity || this.opacity);
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = isDark ? `rgba(0, 212, 255, ${alpha})` : `rgba(100, 100, 180, ${alpha * 0.4})`;
            ctx.fill();
        }
    }

    function initParticles() {
        const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 20000));
        particles = []; for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function drawLines() {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    const opacity = (1 - dist / 140) * 0.1;
                    ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = isDark ? `rgba(0, 212, 255, ${opacity})` : `rgba(100, 100, 180, ${opacity * 0.3})`;
                    ctx.lineWidth = 0.5; ctx.stroke();
                }
            }
        }
    }

    function animateParticles(time) {
        if (!isPageVisible) { animFrame = requestAnimationFrame(animateParticles); return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(time || 0); p.draw(); });
        drawLines(); animFrame = requestAnimationFrame(animateParticles);
    }

    document.addEventListener('visibilitychange', () => { isPageVisible = !document.hidden; });
    resizeCanvas(); initParticles(); animateParticles();
    window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

    // Navbar scroll
    const navbar = document.getElementById('navbar');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
                ticking = false;
            }); ticking = true;
        }
    }, { passive: true });

    // Hamburger
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active'); navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => { hamburger.classList.remove('active'); navLinks.classList.remove('open'); document.body.style.overflow = ''; });
    });

    // Active nav
    const sections = document.querySelectorAll('.section, .hero');
    const navLinkElements = document.querySelectorAll('.nav-link');
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinkElements.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
            }
        });
    }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });
    sections.forEach(section => sectionObserver.observe(section));

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    function updateThemeColor(theme) {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a0f' : '#f2f2f7');
    }
    updateThemeColor(savedTheme);
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next); updateThemeColor(next);
    });

    // Scroll reveal
    const revealElements = document.querySelectorAll('[data-reveal], .glass-card, .section-header, .timeline-item, .education-card, .honors-grid, .certs-grid');
    revealElements.forEach((el, i) => {
        el.classList.add('reveal');
        const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
        const index = siblings.indexOf(el);
        if (index > 0) el.style.transitionDelay = `${index * 0.06}s`;
    });
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});
