import config from './config.js';

class MovieService {
    constructor() {
        this.apiKey = config.movieApiKey;
        this.baseUrl = 'https://www.omdbapi.com';
        this.currentSlideIndex = 0;
        this.weatherMovies = {
            blissful: {
                description: 'Feel-Good, Comedy, Adventure movies for sunny days',
                genres: ['Comedy', 'Adventure', 'Family'],
                defaultMovies: [
                    'tt0910970', 'tt0338013', 'tt0118799', 'tt0045152', // Original pool
                    'tt0107048', 'tt0119217', 'tt0381681', 'tt0756683', // Before Sunrise, Good Will Hunting, Before Sunset, Once
                    'tt0075148', 'tt0088763', 'tt0107290', 'tt0116629', // Rocky, Back to the Future, Jurassic Park, Independence Day
                    'tt0163651', 'tt0128853', 'tt0311289', 'tt0367594' // American Pie, Notting Hill, Love Actually, Charlie and the Chocolate Factory
                ]
            },
            calm: {
                description: 'Wholesome, Relaxing, Soulful movies for gentle weather',
                genres: ['Drama', 'Romance'],
                defaultMovies: [
                    'tt0118715', 'tt0211915', 'tt0756683', 'tt0109830', // Original pool
                    'tt0112471', 'tt0100405', 'tt0108052', 'tt0120338', // Before Sunrise, Pretty Woman, Schindler's List, Titanic
                    'tt0109686', 'tt0119217', 'tt0381681', 'tt0367089', // Blue Sky, Good Will Hunting, Before Sunset, Seabiscuit
                    'tt0098635', 'tt0120689', 'tt0097165', 'tt0172495'  // Dead Poets Society, The Green Mile, Dead Poets Society, Gladiator
                ]
            },
            melancholic: {
                description: 'Emotional, Deep, Thought-Provoking movies for gloomy weather',
                genres: ['Drama'],
                defaultMovies: [
                    'tt0111161', 'tt0109830', 'tt0120689', 'tt0816692', // Original pool
                    'tt0137523', 'tt0110357', 'tt0120382', 'tt0167404', // Fight Club, Lion King, The Truman Show, The Sixth Sense
                    'tt0253474', 'tt0407887', 'tt0118799', 'tt0169547', // The Pianist, The Departed, Life is Beautiful, American Beauty
                    'tt0114369', 'tt0110912', 'tt0109830', 'tt0120815'  // Se7en, Pulp Fiction, Forrest Gump, Saving Private Ryan
                ]
            },
            intense: {
                description: 'Thriller, Action, Dark Drama movies for dramatic weather',
                genres: ['Thriller', 'Action'],
                defaultMovies: [
                    'tt0468569', 'tt0114369', 'tt0110912', 'tt0407887', // Original pool
                    'tt0133093', 'tt0172495', 'tt0120815', 'tt0109830', // The Matrix, Gladiator, Saving Private Ryan, Forrest Gump
                    'tt0114814', 'tt0167260', 'tt0120737', 'tt0167261', // The Usual Suspects, LOTR trilogy
                    'tt0088247', 'tt0082971', 'tt0078748', 'tt0103064'  // The Terminator, Raiders of the Lost Ark, Alien, Terminator 2
                ]
            },
            dreamy: {
                description: 'Sci-Fi, Fantasy, Art Films for magical evenings',
                genres: ['Fantasy', 'Sci-Fi'],
                defaultMovies: [
                    'tt0816692', 'tt0338013', 'tt0246578', 'tt0209144', // Original pool
                    'tt0133093', 'tt0137523', 'tt0120737', 'tt0167261', // Matrix, Fight Club, LOTR 1&2
                    'tt0167260', 'tt0114369', 'tt0109830', 'tt0110912', // LOTR 3, Se7en, Forrest Gump, Pulp Fiction
                    'tt0088763', 'tt0082971', 'tt0078748', 'tt0103064'  // Back to the Future, Raiders, Alien, Terminator 2
                ]
            }
        };
    }

    async getMoviesByWeather(weatherType, temperature) {
        try {
            const mood = this.getWeatherMood(weatherType, temperature);
            const weatherMood = this.weatherMovies[mood];
            
            // Get a random subset of movies for this session
            const moviePool = [...weatherMood.defaultMovies];
            const selectedMovieIds = [];
            
            // Select 5 random movies from the pool
            for (let i = 0; i < 5 && moviePool.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * moviePool.length);
                selectedMovieIds.push(moviePool.splice(randomIndex, 1)[0]);
            }
            
            // Fetch the selected movies
            const movies = await this.getDefaultMovies(selectedMovieIds);
            
            if (movies.length > 0) {
                return {
                    featured: movies[0],
                    suggestions: movies.slice(1),
                    mood: mood
                };
            }

            // Fallback to search if default movies fail
            const searchMovies = await this.fetchMoviesForMood(weatherMood);
            return {
                featured: searchMovies[0],
                suggestions: searchMovies.slice(1),
                mood: mood
            };
        } catch (error) {
            console.error('Error fetching movies:', error);
            return {
                featured: { 
                    title: 'Movie recommendations unavailable',
                    genre: '',
                    image: 'https://via.placeholder.com/200x300'
                },
                suggestions: [],
                mood: 'calm'
            };
        }
    }

    async getDefaultMovies(imdbIds) {
        try {
            // Fetch all selected movies
            const moviePromises = imdbIds.map(id => this.fetchMovieDetails(id));
            const movies = await Promise.all(moviePromises);
            
            // Filter out any failed fetches and add random order
            return movies
                .filter(movie => movie !== null)
                .map(movie => ({
                    ...movie,
                    randomOrder: Math.random()
                }))
                .sort((a, b) => a.randomOrder - b.randomOrder);
        } catch (error) {
            console.error('Error fetching default movies:', error);
            return [];
        }
    }

    async fetchMoviesForMood(weatherMood) {
        try {
            const movies = [];
            const searchPromises = [];

            // Add variety in search queries
            const years = ['2020-2024', '2015-2019', '2010-2014', '2000-2009'];
            const selectedYear = years[Math.floor(Math.random() * years.length)];

            // Mix up the genres with search terms
            for (const genre of weatherMood.genres) {
                searchPromises.push(
                    this.searchMovies(`${genre} ${selectedYear}`),
                    this.searchMovies(`best ${genre} movies`)
                );
            }

            const searchResults = await Promise.all(searchPromises);
            searchResults.forEach(results => {
                if (results) {
                    movies.push(...results);
                }
            });

            const uniqueMovies = this.removeDuplicates(movies, 'imdbID')
                .filter(movie => {
                    const rating = parseFloat(movie.rating);
                    return !isNaN(rating) && rating >= 7.0;
                });

            return this.getRandomItems(uniqueMovies, Math.min(5, uniqueMovies.length));
        } catch (error) {
            console.error('Error in fetchMoviesForMood:', error);
            return [];
        }
    }

    async searchMovies(searchQuery) {
        try {
            const response = await fetch(
                `${this.baseUrl}/?apikey=${this.apiKey}&s=${encodeURIComponent(searchQuery)}&type=movie`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();
            if (data.Response === 'True' && data.Search) {
                const detailsPromises = data.Search.slice(0, 5).map(movie => 
                    this.fetchMovieDetails(movie.imdbID)
                );
                
                const moviesWithDetails = await Promise.all(detailsPromises);
                return moviesWithDetails.filter(movie => movie !== null);
            }
            return [];
        } catch (error) {
            console.error('Error searching movies:', error);
            return [];
        }
    }

    async fetchMovieDetails(imdbId) {
        try {
            const response = await fetch(
                `${this.baseUrl}/?apikey=${this.apiKey}&i=${imdbId}`
            );

            if (!response.ok) return null;

            const movie = await response.json();
            if (movie.Response === 'True') {
                return {
                    imdbID: movie.imdbID,
                    title: movie.Title,
                    year: movie.Year,
                    genre: movie.Genre,
                    plot: movie.Plot,
                    image: movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300',
                    rating: movie.imdbRating,
                    director: movie.Director,
                    actors: movie.Actors,
                    language: movie.Language,
                    awards: movie.Awards,
                    timestamp: Date.now()
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    }

    getRandomItems(array, count) {
        // Add timestamp to ensure different order on each page load
        const timestamp = Date.now();
        
        // Fisher-Yates shuffle algorithm with timestamp influence
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor((Math.random() * (i + 1) + timestamp % 13) % (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Add randomization factors with timestamp influence
        return shuffled.slice(0, count).map(item => ({
            ...item,
            timestamp,
            random: Math.random() + (timestamp % 17) / 17,
            shuffleIndex: Math.random() + (timestamp % 19) / 19
        }))
        .sort((a, b) => a.random - b.random);
    }

    removeDuplicates(array, key) {
        return Array.from(
            array.reduce((map, item) => {
                if (!map.has(item[key])) {
                    map.set(item[key], item);
                }
                return map;
            }, new Map()).values()
        );
    }

    getWeatherMood(weatherType, temperature) {
        if (weatherType.includes('Clear') || weatherType.includes('Sunny')) {
            return 'blissful';
        } else if (weatherType.includes('Rain') || weatherType.includes('Drizzle')) {
            return temperature > 20 ? 'calm' : 'melancholic';
        } else if (weatherType.includes('Storm') || weatherType.includes('Thunder')) {
            return 'intense';
        } else if (weatherType.includes('Snow') || weatherType.includes('Night')) {
            return 'dreamy';
        }
        return 'calm';
    }

    async updateMovieDisplay(weatherType, temperature) {
        const { featured, suggestions, mood } = await this.getMoviesByWeather(weatherType, temperature);
        const weatherMovie = this.weatherMovies[mood];
        
        const movieCard = document.querySelector('.movie-card');
        
        if (featured) {
            movieCard.innerHTML = `
                <div class="movie-header">
                    <h3>Weather-Based Movies (${mood})</h3>
                    <p class="movie-mood-description">${weatherMovie.description}</p>
                </div>
                <div class="movies-container">
                    <button class="nav-btn prev-movie" onclick="movieService.navigateMovies('prev')">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="movies-wrapper">
                        <div class="movies-slider">
                            <div class="movie-item featured" 
                                 onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(featured.title + ' ' + featured.year + ' movie')}', '_blank')">
                                <div class="movie-poster">
                                    <img src="${featured.image}" alt="${featured.title}">
                                </div>
                                <div class="movie-info">
                                    <h4 class="movie-title">${featured.title}</h4>
                                    <p class="movie-year-genre">${featured.year} • ${featured.genre}</p>
                                    <div class="movie-rating">
                                        <span class="rating-source">IMDb</span>
                                        <span class="rating-value">${featured.rating}/10</span>
                                    </div>
                                </div>
                            </div>
                            ${suggestions.map(movie => `
                                <div class="movie-item" 
                                     onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(movie.title + ' ' + movie.year + ' movie')}', '_blank')">
                                    <div class="movie-poster">
                                        <img src="${movie.image}" alt="${movie.title}">
                                    </div>
                                    <div class="movie-info">
                                        <h4 class="movie-title">${movie.title}</h4>
                                        <p class="movie-year-genre">${movie.year} • ${movie.genre}</p>
                                        <div class="movie-rating">
                                            <span class="rating-source">IMDb</span>
                                            <span class="rating-value">${movie.rating}/10</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <button class="nav-btn next-movie" onclick="movieService.navigateMovies('next')">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            `;
        } else {
            movieCard.innerHTML = `
                <h3>Weather-Based Movies</h3>
                <p class="movie-error">Movie recommendations unavailable</p>
            `;
        }

        // Add styles for the new layout
        const style = document.createElement('style');
        style.textContent = `
            .movie-card {
                background: linear-gradient(135deg, var(--secondary-bg), rgba(147, 51, 234, 0.2));
                border-radius: 15px;
                padding: 1rem;
                position: relative;
                overflow: hidden;
                height: 280px;
                display: flex;
                flex-direction: column;
            }

            .movie-header {
                margin-bottom: 0.75rem;
            }

            .movie-header h3 {
                font-size: 1.1rem;
                margin-bottom: 0.25rem;
            }

            .movie-mood-description {
                font-size: 0.85rem;
                color: var(--text-secondary);
                line-height: 1.2;
            }

            .movies-container {
                position: relative;
                display: flex;
                align-items: center;
                gap: 1rem;
                flex: 1;
                padding: 0.5rem 0;
            }

            .movies-wrapper {
                overflow: hidden;
                position: relative;
                flex: 1;
                height: 180px;
            }

            .movies-slider {
                display: flex;
                transition: transform 0.3s ease;
                height: 100%;
                gap: 1rem;
            }

            .movie-item {
                flex: 0 0 calc(100% - 1rem);
                background: rgba(0, 0, 0, 0.2);
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                transition: transform 0.3s ease;
                display: flex;
                height: 100%;
            }

            .movie-item:hover {
                transform: translateY(-3px);
            }

            .movie-poster {
                width: 120px;
                height: 100%;
                flex-shrink: 0;
                position: relative;
                overflow: hidden;
            }

            .movie-poster img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .movie-info {
                padding: 1rem;
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                min-width: 0;
            }

            .movie-title {
                font-size: 1.1rem;
                margin-bottom: 0.5rem;
                color: var(--text-primary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .movie-year-genre {
                font-size: 0.85rem;
                color: var(--text-secondary);
                margin-bottom: 0.5rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .movie-rating {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .rating-source {
                color: var(--text-secondary);
                font-size: 0.85rem;
            }

            .rating-value {
                color: var(--accent-color);
                font-weight: bold;
            }

            .nav-btn {
                background: rgba(0, 0, 0, 0.3);
                border: none;
                color: var(--text-primary);
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                flex-shrink: 0;
                z-index: 2;
            }

            .nav-btn:hover {
                background: rgba(0, 0, 0, 0.5);
                transform: scale(1.1);
            }

            .nav-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }

            .nav-btn i {
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);

        // Initialize the slider position
        this.currentSlideIndex = 0;
        this.updateNavigationButtons();
    }

    navigateMovies(direction) {
        const slider = document.querySelector('.movies-slider');
        const items = document.querySelectorAll('.movie-item');
        const itemWidth = items[0].offsetWidth + 16; // Including gap
        
        if (direction === 'next') {
            this.currentSlideIndex = Math.min(this.currentSlideIndex + 1, items.length - 1);
        } else {
            this.currentSlideIndex = Math.max(this.currentSlideIndex - 1, 0);
        }

        slider.style.transform = `translateX(-${this.currentSlideIndex * itemWidth}px)`;
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const prevBtn = document.querySelector('.prev-movie');
        const nextBtn = document.querySelector('.next-movie');
        const slider = document.querySelector('.movies-slider');
        const items = document.querySelectorAll('.movie-item');
        const itemWidth = items[0].offsetWidth + 16;
        const visibleItems = Math.floor(slider.parentElement.offsetWidth / itemWidth);

        if (prevBtn && nextBtn) {
            prevBtn.disabled = this.currentSlideIndex === 0;
            nextBtn.disabled = this.currentSlideIndex >= items.length - visibleItems;
        }
    }
}

// Export a single instance
export const movieService = new MovieService();

// Make it globally accessible for arrow buttons
window.movieService = movieService; 