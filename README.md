# 🌐 My Resume Site

**Live:** [my-resume-site-obgtdsdv4q-uc.a.run.app](https://my-resume-site-obgtdsdv4q-uc.a.run.app)

A modern, Dark & Sleek personal resume website built with vanilla HTML/CSS/JS and hosted on Google Cloud Run.

## ✨ Features

- 🎨 Dark/Light theme toggle with localStorage persistence
- 🌌 Animated particle network background (canvas)
- 💎 Glassmorphism cards with hover effects
- 📱 Fully responsive design with mobile hamburger menu
- 🎭 Scroll-reveal animations via IntersectionObserver
- 📄 Downloadable PDF resume
- ⚡ Lightweight — no frameworks, no build step

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Server | Node.js + Express.js |
| Container | Docker (Node 18 Alpine) |
| Hosting | Google Cloud Run |
| Design | Inter + JetBrains Mono, Cyan-Purple gradients |

## 📁 Project Structure

```
my-resume-site/
├── Dockerfile
├── package.json
├── server.js
├── .dockerignore
└── public/
    ├── index.html
    ├── css/styles.css
    ├── js/main.js
    └── assets/resume.pdf
```

## 🚀 Deploy

The site auto-deploys to Cloud Run. To run locally:

```bash
npm install
npm start
# → http://localhost:8080
```

## 📬 Contact

- **Email:** nolan.blenniss@gmail.com
- **LinkedIn:** [nolanblenniss](https://www.linkedin.com/in/nolanblenniss)
- **GitHub:** [dawink5674](https://github.com/dawink5674)

---
© 2026 Nolan Blenniss
