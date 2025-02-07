class MovieService {
    constructor() {
        this.apiKey = '7024146f'; // Replace with your TMDB API key
        this.baseUrl = 'http://www.omdbapi.com/?i=tt3896198&apikey=7024146f';
        this.weatherGenres = {
            Clear: {
                genres: [35, 10749], // Comedy, Romance
                keywords: 'summer|sunshine|beach',
                mood: 'uplifting'
            },
            Rain: {
                genres: [9648, 18], // Mystery, Drama
                keywords: 'rain|noir|moody',
                mood: 'melancholic'
            },
            Snow: {
                genres: [18, 10751], // Drama, Family
                keywords: 'winter|snow|christmas',
                mood: 'cozy'
            },
            Clouds: {
                genres: [878, 14], // Sci-Fi, Fantas   y
                keywords: 'dream|fantasy|journey',
                mood: 'thoughtful'
            },
            Thunderstorm: {
                genres: [27, 53], // Horror, Thriller
                keywords: 'storm|thriller|suspense',
                mood: 'intense'
            }
        };
    }

    async getMoviesByWeather(weatherType) {
        try {
            const weatherMood = this.weatherGenres[weatherType] || this.weatherGenres.Clouds;
            const genreIds = weatherMood.genres.join(',');
            
            // Get movies based on genres and keywords
            const response = await fetch(
                `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&with_genres=${genreIds}&with_keywords=${weatherMood.keywords}&sort_by=popularity.desc&page=1`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();
            const movies = data.results.slice(0, 5).map(movie => ({
                title: movie.title,
                genre: this.getGenreNames(movie.genre_ids),
                image: `https://image.tmdb.org/t/p/w200${movie.poster_path}`,
                overview: movie.overview,
                rating: movie.vote_average
            }));

            return {
                featured: movies[0],
                suggestions: movies
            };
        } catch (error) {
            console.error('Error fetching movies:', error);
            return {
                featured: { title: 'Movie recommendations unavailable', genre: '', image: 'https://via.placeholder.com/200x300' },
                suggestions: []
            };
        }
    }

    getGenreNames(genreIds) {
        const genreMap = {
            28: 'Action',
            12: 'Adventure',
            16: 'Animation',
            35: 'Comedy',
            80: 'Crime',
            99: 'Documentary',
            18: 'Drama',
            10751: 'Family',
            14: 'Fantasy',
            36: 'History',
            27: 'Horror',
            10402: 'Music',
            9648: 'Mystery',
            10749: 'Romance',
            878: 'Science Fiction',
            10770: 'TV Movie',
            53: 'Thriller',
            10752: 'War',
            37: 'Western'
        };
        return genreIds.map(id => genreMap[id] || '').filter(Boolean).join(', ');
    }

    async updateMovieDisplay(weatherType) {
        const { featured, suggestions } = await this.getMoviesByWeather(weatherType);
        
        // Update featured movie
        document.querySelector('.movie-title').textContent = featured.title;
        document.querySelector('.movie-description').textContent = 
            `Perfect ${featured.genre} movie for ${weatherType.toLowerCase()} weather`;
        document.querySelector('.movie-image').style.backgroundImage = `url(${featured.image})`;
        
        // Update suggestions list
        const suggestionList = document.querySelector('.suggestion-list');
        suggestionList.innerHTML = suggestions.map(movie => `
            <div class="movie-suggestion">
                <img src="${movie.image}" alt="${movie.title}">
                <div class="movie-suggestion-info">
                    <div class="movie-suggestion-title">${movie.title}</div>
                    <div class="movie-suggestion-genre">${movie.genre}</div>
                </div>
            </div>
        `).join('');
    }
}

// Initialize movie service
const movieService = new MovieService(); 