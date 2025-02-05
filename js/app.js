class WeatherMusicApp {
    constructor() {
        this.weatherElements = {
            temperature: document.querySelector('.temperature'),
            description: document.querySelector('.weather-description-large'),
            location: document.querySelector('.location'),
            icon: document.querySelector('.weather-icon-large'),
            highTemp: document.querySelector('.high-temp'),
            lowTemp: document.querySelector('.low-temp'),
            humidity: document.querySelector('.humidity-value'),
            windSpeed: document.querySelector('.wind-value'),
            pressure: document.querySelector('.pressure-value')
        };

        this.initialize();
    }

    async initialize() {
        try {
            // Get user's location
            const location = await weatherService.getCurrentLocation();
            
            // Start updating weather periodically
            this.updateWeather(location);
            setInterval(() => this.updateWeather(location), 300000); // Update every 5 minutes

            // Initialize status meter
            this.updateStatusMeter();
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Please enable location services to use this app.');
        }
    }

    async updateWeather(location) {
        try {
            const weather = await weatherService.getWeather(location.latitude, location.longitude);
            
            // Update main weather display
            this.weatherElements.temperature.textContent = `${weather.temperature}°`;
            this.weatherElements.description.textContent = this.capitalizeFirst(weather.description);
            this.weatherElements.location.textContent = weather.location;
            this.weatherElements.icon.innerHTML = `<img src="${weather.icon}" alt="${weather.description}">`;

            // Update high/low temperatures
            this.weatherElements.highTemp.textContent = `${Math.round(weather.temp_max)}°`;
            this.weatherElements.lowTemp.textContent = `${Math.round(weather.temp_min)}°`;

            // Update weather details
            this.weatherElements.humidity.textContent = `${weather.humidity}%`;
            this.weatherElements.windSpeed.textContent = `${Math.round(weather.wind_speed)} km/h`;
            this.weatherElements.pressure.textContent = `${weather.pressure} hPa`;

            // Update music based on weather
            const mood = weatherService.getWeatherMood(weather.weatherMain);
            musicPlayer.setMood(mood);

            // Update recipe suggestions
            const recipes = recipeService.getRecipesByWeather(weather.weatherMain, weather.temperature);
            this.updateRecipeSection(recipes);

            // Update forecast cards
            this.updateForecast(weather.forecast);

            // Update weather animation
            if (window.weatherAnimations) {
                window.weatherAnimations.setWeather(weather.weatherMain);
            }

        } catch (error) {
            console.error('Error updating weather:', error);
            this.showError('Unable to update weather information.');
        }
    }

    updateStatusMeter() {
        const meterFill = document.querySelector('.meter-fill');
        // Simulate air quality update (replace with actual air quality data in the future)
        const quality = Math.random() * 100;
        meterFill.style.width = `${quality}%`;
        meterFill.style.background = this.getQualityColor(quality);
    }

    getQualityColor(value) {
        if (value > 80) return 'var(--success-color)';
        if (value > 60) return 'var(--accent-color)';
        if (value > 40) return 'orange';
        return 'var(--danger-color)';
    }

    updateRecipeSection(recipes) {
        const recipeTitle = document.querySelector('.recipe-title');
        const recipeDescription = document.querySelector('.recipe-description');
        
        recipeTitle.textContent = recipes.message;
        recipeDescription.textContent = `Weather: ${recipes.weatherType}, Temperature: ${recipes.temperature}°C`;
    }

    updateForecast(forecast) {
        const forecastContainer = document.querySelector('.forecast-cards');
        if (!forecast) return;

        forecastContainer.innerHTML = forecast.map(day => `
            <div class="forecast-card">
                <div class="forecast-day">${day.date}</div>
                <img src="${day.icon}" alt="${day.description}">
                <div class="forecast-temp">${Math.round(day.temp)}°</div>
            </div>
        `).join('');
    }

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    showError(message) {
        // Create a more elegant error display
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize the app and make it globally accessible
let weatherApp;
document.addEventListener('DOMContentLoaded', () => {
    weatherApp = new WeatherMusicApp();
    window.weatherApp = weatherApp; // Make it globally accessible
});

// Add some CSS for error messages
const style = document.createElement('style');
style.textContent = `
    .error-message {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--danger-color);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease-out;
        z-index: 1000;
    }

    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style); 