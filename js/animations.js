class WeatherAnimations {
    constructor() {
        this.canvas = document.getElementById('weatherCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.weatherType = 'clear';
        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    setWeather(type) {
        this.weatherType = type.toLowerCase();
        this.particles = [];
        this.initParticles();
    }

    initParticles() {
        const particleCount = this.weatherType === 'snow' ? 50 : 
                            this.weatherType === 'rain' ? 100 : 20;

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: this.weatherType === 'snow' ? Math.random() * 3 + 2 :
                  this.weatherType === 'rain' ? 1 : Math.random() * 2 + 1,
            speedX: this.weatherType === 'snow' ? Math.random() * 2 - 1 :
                    this.weatherType === 'rain' ? Math.random() * 1 - 0.5 : Math.random() * 0.5 - 0.25,
            speedY: this.weatherType === 'snow' ? Math.random() * 1 + 1 :
                    this.weatherType === 'rain' ? Math.random() * 5 + 7 : Math.random() * 0.2 - 0.1,
            opacity: Math.random() * 0.5 + 0.5
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
        });

        requestAnimationFrame(() => this.animate());
    }

    updateParticle(particle) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.y > this.canvas.height) {
            particle.y = -10;
            particle.x = Math.random() * this.canvas.width;
        }
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = this.canvas.width;
    }

    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        
        if (this.weatherType === 'rain') {
            this.ctx.moveTo(particle.x, particle.y);
            this.ctx.lineTo(particle.x, particle.y + 10);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.stroke();
        } else {
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}

// Theme management
class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                '--primary-bg': '#FDF0D5',
                '--secondary-bg': '#ffffff',
                '--card-bg': 'rgba(0, 0, 0, 0.03)',
                '--text-primary': '#2D3047',
                '--text-secondary': '#565872',
                '--accent-color': '#2C699A',
                '--danger-color': '#B23A48',
                '--success-color': '#54876B',
                '--card-shadow': '0 4px 12px rgba(45, 48, 71, 0.08)',
                '--gradient-overlay': 'linear-gradient(180deg, rgba(253, 240, 213, 0) 0%, rgba(253, 240, 213, 0.8) 100%)'
            },
            dark: {
                '--primary-bg': '#1a1d21',
                '--secondary-bg': '#242830',
                '--card-bg': 'rgba(255, 255, 255, 0.1)',
                '--text-primary': '#ffffff',
                '--text-secondary': '#a0a0a0',
                '--accent-color': '#3498db',
                '--danger-color': '#e74c3c',
                '--success-color': '#2ecc71',
                '--card-shadow': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
                '--gradient-overlay': 'linear-gradient(180deg, rgba(26, 29, 33, 0) 0%, rgba(26, 29, 33, 0.8) 100%)'
            }
        };
        this.init();
    }

    init() {
        this.setupThemeButtons();
        this.setupAutoTheme();
    }

    setupThemeButtons() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.classList.contains('light-theme') ? 'light' :
                             btn.classList.contains('dark-theme') ? 'dark' : 'auto';
                this.setTheme(theme);
                
                // Update active button
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    setupAutoTheme() {
        const hour = new Date().getHours();
        if (document.querySelector('.auto-theme').classList.contains('active')) {
            this.setTheme(hour >= 6 && hour < 18 ? 'light' : 'dark');
        }
    }

    setTheme(theme) {
        const root = document.documentElement;
        const themeColors = this.themes[theme === 'auto' ? 
            (new Date().getHours() >= 6 && new Date().getHours() < 18 ? 'light' : 'dark') : 
            theme];

        Object.entries(themeColors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }
}

// Enhanced Interactivity
class EnhancedInteractivity {
    constructor() {
        this.setupSearchBar();
        this.setupRefreshButton();
        this.setupForecastCards();
        this.setupInfoCards();
    }

    setupSearchBar() {
        const searchInput = document.querySelector('.location-search');
        const suggestions = document.querySelector('.search-suggestions');
        
        searchInput.addEventListener('input', this.debounce(async (e) => {
            const query = e.target.value;
            if (query.length < 3) {
                suggestions.classList.remove('active');
                return;
            }

            try {
                const response = await fetch(
                    `https://api.weatherapi.com/v1/search.json?key=${weatherService.apiKey}&q=${query}`
                );
                const data = await response.json();

                suggestions.innerHTML = data.map(city => `
                    <div class="suggestion-item" data-location="${city.name}, ${city.country}">
                        ${city.name}, ${city.country}
                    </div>
                `).join('');
                
                suggestions.classList.add('active');
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            }
        }, 300));

        // Handle suggestion clicks
        suggestions.addEventListener('click', async (e) => {
            const item = e.target.closest('.suggestion-item');
            if (!item) return;

            const location = item.dataset.location;
            try {
                await weatherApp.updateWeather({ latitude: location });
                searchInput.value = item.textContent.trim();
                suggestions.classList.remove('active');
            } catch (error) {
                console.error('Error fetching weather for location:', error);
            }
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                suggestions.classList.remove('active');
            }
        });
    }

    setupRefreshButton() {
        const refreshBtn = document.querySelector('.refresh-btn');
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.classList.add('loading');
            await weatherApp.updateWeather(await weatherService.getCurrentLocation());
            refreshBtn.classList.remove('loading');
        });
    }

    setupForecastCards() {
        const forecastContainer = document.querySelector('.forecast-cards');
        forecastContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.forecast-card');
            if (!card) return;

            // Add click animation
            card.style.transform = 'scale(0.95)';
            setTimeout(() => card.style.transform = '', 150);

            // Show detailed forecast modal
            this.showForecastModal(card.dataset);
        });
    }

    setupInfoCards() {
        document.querySelectorAll('.info-card').forEach(card => {
            card.addEventListener('click', () => {
                if (card.classList.contains('music-card')) {
                    this.expandMusicPlayer(card);
                } else if (card.classList.contains('recipe-card')) {
                    this.expandRecipeCard(card);
                }
            });
        });
    }

    debounce(func, wait) {
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

    showForecastModal(forecastData) {
        // Implementation for detailed forecast modal
    }

    expandMusicPlayer(card) {
        // Implementation for expanded music player
    }

    expandRecipeCard(card) {
        // Implementation for expanded recipe view
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.weatherAnimations = new WeatherAnimations();
    window.themeManager = new ThemeManager();
    window.enhancedInteractivity = new EnhancedInteractivity();
}); 