class RecipeService {
    constructor() {
        this.baseUrl = 'https://www.themealdb.com/api/json/v1/1';
        this.currentSlideIndex = 0;
        this.weatherRecipes = {
            blissful: {
                description: 'Light, Refreshing, Summer Recipes for sunny days',
                categories: ['Seafood', 'Vegetarian', 'Miscellaneous'],
                query: 'summer'
            },
            calm: {
                description: 'Comforting, Light Meals for gentle weather',
                categories: ['Pasta', 'Breakfast', 'Side'],
                query: 'comfort'
            },
            melancholic: {
                description: 'Warm, Cozy, Comfort Food for gloomy weather',
                categories: ['Beef', 'Chicken', 'Lamb'],
                query: 'warm'
            },
            intense: {
                description: 'Hearty, Warming Dishes for dramatic weather',
                categories: ['Beef', 'Pork', 'Chicken'],
                query: 'hearty'
            },
            dreamy: {
                description: 'Cozy, Sweet Treats for magical evenings',
                categories: ['Dessert', 'Starter'],
                query: 'dessert'
            }
        };
    }

    async getRecipesByWeather(weatherType, temperature) {
        try {
            console.log('Getting recipes for weather:', weatherType, 'temperature:', temperature);
            const mood = this.getWeatherMood(weatherType, temperature);
            console.log('Determined mood:', mood);
            const weatherMood = this.weatherRecipes[mood];
            
            // Fetch recipes based on mood
            const recipes = await this.fetchRecipesForMood(weatherMood);
            console.log('Fetched recipes:', recipes);

            return {
                featured: recipes[0],
                suggestions: recipes.slice(1, 4),
                mood: mood,
                description: weatherMood.description
            };
        } catch (error) {
            console.error('Error in getRecipesByWeather:', error);
            return {
                featured: { 
                    title: 'Recipe recommendations unavailable',
                    description: 'Please try again later',
                    thumbnail_url: 'https://via.placeholder.com/200x200'
                },
                suggestions: [],
                mood: 'calm',
                description: 'Unable to load recipes'
            };
        }
    }

    async fetchRecipesForMood(weatherMood) {
        try {
            const recipes = [];
            console.log('Fetching recipes for categories:', weatherMood.categories);
            
            // First, let's verify the available categories
            const categoriesResponse = await fetch(`${this.baseUrl}/categories.php`);
            const categoriesData = await categoriesResponse.json();
            console.log('Available categories:', categoriesData);
            
            // Try to get recipes from each category
            for (const category of weatherMood.categories) {
                console.log('Fetching recipes for category:', category);
                const response = await fetch(`${this.baseUrl}/filter.php?c=${encodeURIComponent(category)}`);
                const data = await response.json();
                console.log('Category response:', category, data);
                
                if (data && data.meals) {
                    // Get random recipes from this category
                    const randomMeals = this.getRandomItems(data.meals, 2);
                    console.log('Random meals selected:', randomMeals);
                    
                    // Fetch full details for each meal
                    for (const meal of randomMeals) {
                        const details = await this.fetchRecipeDetails(meal.idMeal);
                        if (details) {
                            recipes.push(details);
                        }
                    }
                }
            }

            // If we don't have enough recipes, try searching by name
            if (recipes.length < 5) {
                console.log('Not enough recipes, searching by name:', weatherMood.query);
                const response = await fetch(`${this.baseUrl}/search.php?s=${encodeURIComponent(weatherMood.query)}`);
                const data = await response.json();
                console.log('Search response:', data);
                
                if (data && data.meals) {
                    const additionalMeals = this.getRandomItems(data.meals, 5 - recipes.length);
                    recipes.push(...additionalMeals.map(meal => this.formatMealData(meal)));
                }
            }

            console.log('Final recipes list:', recipes);
            return recipes.length > 0 ? this.getRandomItems(recipes, 5) : [];
        } catch (error) {
            console.error('Error in fetchRecipesForMood:', error);
            return [];
        }
    }

    async fetchRecipeDetails(id) {
        try {
            const response = await fetch(`${this.baseUrl}/lookup.php?i=${id}`);
            if (!response.ok) return null;

            const data = await response.json();
            if (!data.meals || !data.meals[0]) return null;

            return this.formatMealData(data.meals[0]);
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            return null;
        }
    }

    formatMealData(meal) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`);
            }
        }

        return {
            id: meal.idMeal,
            title: meal.strMeal,
            description: `A delicious ${meal.strCategory} recipe from ${meal.strArea} cuisine`,
            thumbnail_url: meal.strMealThumb,
            total_time_minutes: '30-45',  // MealDB doesn't provide time info
            servings: '4-6',              // MealDB doesn't provide serving info
            instructions: meal.strInstructions.split('.').filter(step => step.trim()),
            ingredients: ingredients,
            category: meal.strCategory,
            area: meal.strArea,
            tags: meal.strTags ? meal.strTags.split(',') : []
        };
    }

    getRandomItems(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    getWeatherMood(weatherType, temperature) {
        if (weatherType.includes('Clear') || weatherType.includes('Sunny')) {
            return temperature > 25 ? 'blissful' : 'calm';
        } else if (weatherType.includes('Rain') || weatherType.includes('Drizzle')) {
            return temperature > 20 ? 'calm' : 'melancholic';
        } else if (weatherType.includes('Storm') || weatherType.includes('Thunder')) {
            return 'intense';
        } else if (weatherType.includes('Snow') || weatherType.includes('Night')) {
            return 'dreamy';
        }
        return 'calm';
    }

    updateRecipeDisplay(recipes) {
        const recipeCard = document.querySelector('.recipe-card');
        
        if (recipes.featured) {
            recipeCard.innerHTML = `
                <div class="recipe-header">
                    <h3>Weather-Based Recipe</h3>
                    <p class="recipe-mood-description">${recipes.description}</p>
                </div>
                <div class="recipes-container">
                    <button class="nav-btn prev-recipe" onclick="recipeService.navigateRecipes('prev')">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="recipes-wrapper">
                        <div class="recipes-slider">
                            <div class="recipe-item featured" 
                                 onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(recipes.featured.title + ' recipe')}', '_blank')">
                                <div class="recipe-poster">
                                    <img src="${recipes.featured.thumbnail_url}" alt="${recipes.featured.title}">
                                </div>
                                <div class="recipe-info">
                                    <h4 class="recipe-title">${recipes.featured.title}</h4>
                                    <p class="recipe-cuisine">${recipes.featured.area} • ${recipes.featured.category}</p>
                                    <div class="recipe-details">
                                        <span><i class="fas fa-clock"></i> ${recipes.featured.total_time_minutes}</span>
                                        <span><i class="fas fa-user"></i> ${recipes.featured.servings}</span>
                                    </div>
                                </div>
                            </div>
                            ${recipes.suggestions.map(recipe => `
                                <div class="recipe-item" 
                                     onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(recipe.title + ' recipe')}', '_blank')">
                                    <div class="recipe-poster">
                                        <img src="${recipe.thumbnail_url}" alt="${recipe.title}">
                                    </div>
                                    <div class="recipe-info">
                                        <h4 class="recipe-title">${recipe.title}</h4>
                                        <p class="recipe-cuisine">${recipe.area} • ${recipe.category}</p>
                                        <div class="recipe-details">
                                            <span><i class="fas fa-clock"></i> ${recipe.total_time_minutes}</span>
                                            <span><i class="fas fa-user"></i> ${recipe.servings}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <button class="nav-btn next-recipe" onclick="recipeService.navigateRecipes('next')">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            `;

            // Add styles for the new layout
            const style = document.createElement('style');
            style.textContent = `
                .recipe-card {
                    background: linear-gradient(135deg, var(--secondary-bg), rgba(46, 204, 113, 0.2));
                    border-radius: 15px;
                    padding: 1rem;
                    position: relative;
                    overflow: hidden;
                    height: 280px;
                    display: flex;
                    flex-direction: column;
                }

                .recipe-header {
                    margin-bottom: 0.75rem;
                }

                .recipe-header h3 {
                    font-size: 1.1rem;
                    margin-bottom: 0.25rem;
                }

                .recipe-mood-description {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    line-height: 1.2;
                }

                .recipes-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex: 1;
                    padding: 0.5rem 0;
                }

                .recipes-wrapper {
                    overflow: hidden;
                    position: relative;
                    flex: 1;
                    height: 180px;
                }

                .recipes-slider {
                    display: flex;
                    transition: transform 0.3s ease;
                    height: 100%;
                    gap: 1rem;
                }

                .recipe-item {
                    flex: 0 0 calc(100% - 1rem);
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.3s ease;
                    display: flex;
                    height: 100%;
                }

                .recipe-item:hover {
                    transform: translateY(-3px);
                }

                .recipe-poster {
                    width: 120px;
                    height: 100%;
                    flex-shrink: 0;
                    position: relative;
                    overflow: hidden;
                }

                .recipe-poster img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .recipe-info {
                    padding: 1rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-width: 0;
                }

                .recipe-title {
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                    color: var(--text-primary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .recipe-cuisine {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .recipe-details {
                    display: flex;
                    gap: 1rem;
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                }

                .recipe-details span {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
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
        } else {
            recipeCard.innerHTML = `
                <h3>Weather-Based Recipe</h3>
                <p class="recipe-error">Recipe recommendations unavailable</p>
            `;
        }
    }

    navigateRecipes(direction) {
        const slider = document.querySelector('.recipes-slider');
        const items = document.querySelectorAll('.recipe-item');
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
        const prevBtn = document.querySelector('.prev-recipe');
        const nextBtn = document.querySelector('.next-recipe');
        const slider = document.querySelector('.recipes-slider');
        const items = document.querySelectorAll('.recipe-item');
        const itemWidth = items[0].offsetWidth + 16;
        const visibleItems = Math.floor(slider.parentElement.offsetWidth / itemWidth);

        if (prevBtn && nextBtn) {
            prevBtn.disabled = this.currentSlideIndex === 0;
            nextBtn.disabled = this.currentSlideIndex >= items.length - visibleItems;
        }
    }
}

// Export a single instance
export const recipeService = new RecipeService(); 