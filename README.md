# NIMBUS - Weather-Based Entertainment Hub

A modern, interactive web application that provides personalized entertainment recommendations based on current weather conditions. Nimbus combines weather information with music, movies, and recipes to create an immersive experience that matches your environment.

## Working Website

![image](https://github.com/user-attachments/assets/946b3cff-375f-489f-ab15-c39e4f35312f)

## Features

### 🌤️ Weather Information
- Real-time weather updates
- 5-day forecast
- Detailed weather metrics (temperature, humidity, wind speed, pressure)
- Dynamic weather animations
- Location-based weather detection
- Search functionality for different locations

### 🎵 Weather-Based Music Player
- Mood-based music selection that matches the weather
- Different playlists for various weather conditions:
  - Blissful (sunny days)
  - Calm (gentle weather)
  - Melancholic (cloudy/rainy days)
  - Intense (stormy weather)
  - Dreamy (night/snow)
- Interactive music controls
- Progress bar with time tracking

### 🎬 Movie Recommendations
- Weather-appropriate movie suggestions
- Curated selection of films that match the current mood
- Movie details including:
  - Release year
  - Genre
  - IMDb rating
  - Interactive movie cards
- Click to search for more information about each movie

### 🍳 Recipe Suggestions
- Weather-based recipe recommendations
- Categories include:
  - Light, refreshing meals for sunny days
  - Comfort food for gloomy weather
  - Warm dishes for cold days
  - Cozy treats for magical evenings
- Recipe details with cooking time and servings
- Easy-to-follow instructions

## Technical Features

- Responsive design that works on all devices
- Dark/Light theme support with auto-switching based on time
- Smooth animations and transitions
- Real-time data updates
- Error handling and fallback states
- Modern UI with intuitive controls

## APIs Used

- WeatherAPI for weather data
- OMDB API for movie information
- MealDB API for recipe information
- Custom music integration

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nimbus.git
```

2. Navigate to the project directory:
```bash
cd nimbus
```

3. Create a `js/config.js` file with your API keys:
```javascript
const config = {
    weatherApiKey: 'your_weather_api_key',
    movieApiKey: 'your_omdb_api_key'
};
export default config;
```

4. Open `index.html` in a modern web browser

## Configuration

To use Nimbus, you'll need to obtain API keys for:
- [WeatherAPI](https://www.weatherapi.com/)
- [OMDB API](http://www.omdbapi.com/)
- [Recipe API](https://www.themealdb.com/api/)

Add these keys to your `config.js` file as shown in the installation section.

## Project Structure

```
nimbus/
├── assets/
│   └── music/            # Music files for different moods
├── css/
│   ├── style.css         # Main styles
│   └── responsive.css    # Responsive design styles
├── js/
│   ├── animations.js     # Weather animations
│   ├── app.js            # Main application logic
│   ├── config.js         # API configuration
│   ├── movies.js         # Movie service
│   ├── music.js          # Music player
│   ├── recipes.js        # Recipe service
│   └── weather.js        # Weather service
└── index.html            # Main HTML file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## Acknowledgments

- Weather icons and animations
- Font Awesome for icons
- Movie data provided by OMDB
- Weather data provided by WeatherAPI
