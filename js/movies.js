import config from './config.js';

class MovieService {
    constructor() {
        this.apiKey = config.movieApiKey;
        this.baseUrl = 'http://www.omdbapi.com/';
        this.weatherMovies = {
            blissful: {
                description: 'Feel-Good, Comedy, Adventure movies for sunny days',
                genres: ['Comedy', 'Adventure', 'Family'],
                keywords: ['best', 'top rated', 'popular'],
                bollywoodKeywords: ['bollywood', 'indian cinema', 'hindi']
            },
            calm: {
                description: 'Wholesome, Relaxing, Soulful movies for gentle weather',
                genres: ['Drama', 'Romance'],
                keywords: ['best', 'top rated', 'popular'],
                bollywoodKeywords: ['bollywood', 'indian cinema', 'hindi']
            },
            melancholic: {
                description: 'Emotional, Deep, Thought-Provoking movies for gloomy weather',
                genres: ['Drama'],
                keywords: ['best', 'top rated', 'popular'],
                bollywoodKeywords: ['bollywood', 'indian cinema', 'hindi']
            },
            intense: {
                description: 'Thriller, Action, Dark Drama movies for dramatic weather',
                genres: ['Thriller', 'Action'],
                keywords: ['best', 'top rated', 'popular'],
                bollywoodKeywords: ['bollywood', 'indian cinema', 'hindi']
            },
            dreamy: {
                description: 'Sci-Fi, Fantasy, Art Films for magical evenings',
                genres: ['Fantasy', 'Sci-Fi'],
                keywords: ['best', 'top rated', 'popular'],
                bollywoodKeywords: ['bollywood', 'indian cinema', 'hindi']
            }
        };
    }

    async getMoviesByWeather(weatherType, temperature) {
        try {
            const mood = this.getWeatherMood(weatherType, temperature);
            const weatherMood = this.weatherMovies[mood];
            
            // Get movies based on genres and keywords
            const movies = await this.fetchMoviesForMood(weatherMood);

            return {
                featured: movies[0],
                suggestions: movies.slice(1),
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

    async fetchMoviesForMood(weatherMood) {
        const movies = [];
        const searchPromises = [];

        // Search for Bollywood movies with multiple keywords
        for (const keyword of weatherMood.bollywoodKeywords) {
            searchPromises.push(
                this.searchMovies(`${keyword} movie 2000-2024`),
                this.searchMovies(`${keyword} film`),
                this.searchMovies(`best ${keyword} movies`)
            );
        }

        // Search for Hollywood movies with multiple approaches
        for (const genre of weatherMood.genres) {
            searchPromises.push(
                this.searchMovies(`best ${genre} movies 2000-2024`),
                this.searchMovies(`top rated ${genre} films`),
                this.searchMovies(`popular ${genre} movies`)
            );
        }

        // Add some specific high-rated movie searches
        searchPromises.push(
            this.searchMovies('imdb top rated movies'),
            this.searchMovies('oscar winning films'),
            this.searchMovies('golden globe best picture')
        );

        // Wait for all searches to complete
        const searchResults = await Promise.all(searchPromises);
        
        // Combine all results
        searchResults.forEach(results => {
            if (results) {
                movies.push(...results);
            }
        });

        // Remove duplicates and filter by rating
        const uniqueMovies = this.removeDuplicates(movies, 'imdbID')
            .filter(movie => {
                const rating = parseFloat(movie.rating);
                return !isNaN(rating) && rating >= 7.0;
            })
            .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

        // Separate Bollywood and Hollywood movies
        const bollywoodMovies = uniqueMovies.filter(m => 
            m.language && (
                m.language.toLowerCase().includes('hindi') || 
                m.title.toLowerCase().includes('indian') ||
                m.language.toLowerCase().includes('tamil') ||
                m.language.toLowerCase().includes('telugu')
            )
        );

        const hollywoodMovies = uniqueMovies.filter(m => 
            m.language && 
            m.language.toLowerCase().includes('english') && 
            !m.title.toLowerCase().includes('indian')
        );

        // Ensure we have enough movies from each category
        let finalSelection = [];
        
        // Add Bollywood movies
        if (bollywoodMovies.length > 0) {
            finalSelection.push(...this.getRandomItems(bollywoodMovies, 5));
        }
        
        // Add Hollywood movies
        if (hollywoodMovies.length > 0) {
            finalSelection.push(...this.getRandomItems(hollywoodMovies, 5));
        }

        // If we still don't have enough movies, add default high-rated movies
        if (finalSelection.length < 10) {
            const defaultMovies = [
                {
                    title: "3 Idiots",
                    year: "2009",
                    rating: "8.4",
                    genre: "Comedy, Drama",
                    image: "https://m.media-amazon.com/images/M/MV5BNTkyOGVjMGEtNmQzZi00NzFlLTlhOWQtODYyMDc2ZGJmYzFhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
                    language: "Hindi"
                },
                {
                    title: "The Shawshank Redemption",
                    year: "1994",
                    rating: "9.3",
                    genre: "Drama",
                    image: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
                    language: "English"
                },
                {
                    title: "Dangal",
                    year: "2016",
                    rating: "8.3",
                    genre: "Action, Biography, Drama",
                    image: "https://m.media-amazon.com/images/M/MV5BMTQ4MzQzMzM2Nl5BMl5BanBnXkFtZTgwMTQ1NzU3MDI@._V1_SX300.jpg",
                    language: "Hindi"
                },
                {
                    title: "The Dark Knight",
                    year: "2008",
                    rating: "9.0",
                    genre: "Action, Crime, Drama",
                    image: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
                    language: "English"
                }
            ];
            
            // Add default movies that aren't already in the selection
            for (const movie of defaultMovies) {
                if (finalSelection.length < 10 && !finalSelection.find(m => m.title === movie.title)) {
                    finalSelection.push(movie);
                }
            }
        }

        return finalSelection;
    }

    async searchMovies(searchQuery) {
        try {
            const response = await fetch(
                `${this.baseUrl}?apikey=${this.apiKey}&s=${encodeURIComponent(searchQuery)}&type=movie`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();
            if (data.Response === 'True' && data.Search) {
                // Fetch full details for each movie
                const detailsPromises = data.Search.slice(0, 10).map(movie => 
                    this.fetchMovieDetails(movie.imdbID)
                );
                
                const moviesWithDetails = await Promise.all(detailsPromises);
                return moviesWithDetails.filter(movie => {
                    if (!movie) return false;
                    const rating = parseFloat(movie.rating);
                    return !isNaN(rating) && rating >= 7.0;
                });
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
                `${this.baseUrl}?apikey=${this.apiKey}&i=${imdbId}`
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
                    awards: movie.Awards
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    }

    getRandomItems(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
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

// Initialize movie service
const movieService = new MovieService(); 