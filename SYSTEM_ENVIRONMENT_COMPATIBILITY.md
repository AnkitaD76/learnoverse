# 5. Compatibility with System Environment

## 5.1 Client-Side Requirements

### Supported Browsers & Devices
- **Desktop Browsers:** Chrome 100+, Firefox 100+, Edge 100+, Safari 15+, Opera 85+
- **Mobile:** Android 10+ (Chrome/Firefox), iOS 15+ (Safari)
- **Responsive:** 320px to 4K displays

### Client Requirements
- JavaScript enabled, HTTP-only cookies, WebSocket support
- HTML5 video playback, Local Storage
- Minimum 2 Mbps network for video/live sessions

---

## 5.2 Server-Side Requirements

### Operating System & Runtime
- **OS:** Linux (Ubuntu 20.04+, CentOS 8+, Debian 11+), Windows Server 2019+, macOS 12+ (dev only)
- **Runtime:** Node.js 18.x or later (LTS), npm 9.x or yarn 1.22.x

### Database & Storage
- **MongoDB:** Version 6.0 or later with Mongoose ODM
- **Storage:** Minimum 20GB (scale based on user base)

### External Services
- **Cloudinary:** Media storage
- **Email:** SMTP provider (Gmail, SendGrid, AWS SES)
- **Jitsi Meet:** Live session video conferencing
- **Puppeteer:** Certificate PDF generation (Chromium auto-installed)

### Infrastructure
- **HTTPS/TLS:** Required for production (Let's Encrypt or commercial CA)
- **Ports:** 80 (HTTP), 443 (HTTPS), 27017 (MongoDB)
- **Optional:** Nginx/Apache reverse proxy, load balancer for scaling

---

## 5.3 Server Specifications

### Minimum Configuration (Up to 100 users)
- CPU: 2 vCPUs
- RAM: 4GB
- Storage: 20GB SSD
- Bandwidth: 100 Mbps

### Production Configuration (Up to 1,000 users)
- CPU: 4+ vCPUs
- RAM: 8GB+
- Storage: 100GB+ SSD
- Bandwidth: 1 Gbps

### Enterprise Configuration (10,000+ users)
- CPU: 8+ vCPUs (horizontal scaling across multiple instances)
- RAM: 16GB+ per instance
- Storage: 500GB+ SSD
- Bandwidth: 10 Gbps
- Load balancing required with MongoDB replica set or sharded cluster

---

## 5.4 Key Dependencies

**Client:** React 19, React Router 7, Axios, Socket.io-client 4, Tailwind CSS 3  
**Server:** Express 5, Mongoose 8, Socket.io 4, JWT, bcryptjs, Zod, Cloudinary, Nodemailer, Puppeteer

**Deployment:** AWS, GCP, Azure, DigitalOcean, Docker 20+, Kubernetes 1.24+ (optional), Heroku, Render, Vercel, MongoDB Atlas
