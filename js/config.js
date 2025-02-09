// Load environment variables from .env file
const config = {
    weatherApiKey: process.env.WEATHER_API_KEY || '',  // WeatherAPI key
    movieApiKey: process.env.MOVIE_API_KEY || '',      // OMDB API key
};

// Prevent modification of the config object
Object.freeze(config);

// Export the config object
export default config; 