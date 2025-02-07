class WeatherService {
    constructor() {
        this.apiKey = '0730e0845f0a4947a8d214649250302';
        this.baseUrl = 'https://api.weatherapi.com/v1';
    }

    async getWeather(latitude, longitude) {
        try {
            // Get current weather and forecast
            const query = typeof latitude === 'string' ? latitude : `${latitude},${longitude}`;
            const response = await fetch(
                `${this.baseUrl}/forecast.json?key=${this.apiKey}&q=${query}&days=5&aqi=yes`
            );
            
            if (!response.ok) {
                throw new Error('Weather data not available');
            }

            const data = await response.json();

            return {
                temperature: Math.round(data.current.temp_c),
                temp_max: Math.round(data.forecast.forecastday[0].day.maxtemp_c),
                temp_min: Math.round(data.forecast.forecastday[0].day.mintemp_c),
                description: data.current.condition.text,
                icon: data.current.condition.icon,
                location: `${data.location.name}, ${data.location.country}`,
                weatherMain: this.getWeatherMain(data.current.condition.code),
                humidity: data.current.humidity,
                wind_speed: data.current.wind_kph,
                pressure: data.current.pressure_mb,
                forecast: this.processForecastData(data.forecast.forecastday)
            };
        } catch (error) {
            console.error('Error fetching weather:', error);
            throw error;
        }
    }

    processForecastData(forecastData) {
        return forecastData.slice(1).map(day => ({
            date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
            temp: Math.round(day.day.avgtemp_c),
            icon: day.day.condition.icon,
            description: day.day.condition.text
        }));
    }

    getWeatherMain(code) {
        // Map WeatherAPI condition codes to our weather types
        if (code === 1000) return 'Clear';
        if (code >= 1003 && code <= 1030) return 'Clouds';
        if (code >= 1063 && code <= 1171) return 'Rain';
        if (code >= 1180 && code <= 1201) return 'Rain';
        if (code >= 1204 && code <= 1237) return 'Snow';
        if (code >= 1273 && code <= 1282) return 'Thunderstorm';
        return 'Clouds';
    }

    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }

    getWeatherMood(weatherMain) {
        const weatherMoods = {
            'Clear': 'happy',
            'Clouds': 'calm',
            'Rain': 'melancholic',
            'Snow': 'peaceful',
            'Thunderstorm': 'intense',
            'Drizzle': 'relaxed',
            'Mist': 'mysterious',
            'Fog': 'mysterious'
        };

        return weatherMoods[weatherMain] || 'calm';
    }
}

// Initialize weather service
const weatherService = new WeatherService(); 