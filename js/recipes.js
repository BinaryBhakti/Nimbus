class RecipeService {
    constructor() {
        this.apiKey = '1'; // Replace with your Spoonacular API key
        this.baseUrl = 'www.themealdb.com/api/json/v1/1/filter.php?c=Seafood';
        this.weatherRecipes = {
            hot: {
                tags: ['cold', 'refreshing', 'salad', 'ice cream'],
                type: 'cold dishes',
                excludeTags: ['soup', 'hot']
            },
            cold: {
                tags: ['soup', 'stew', 'hot', 'warming'],
                type: 'warm comfort food',
                excludeTags: ['cold', 'ice cream']
            },
            rainy: {
                tags: ['comfort food', 'soup', 'baking'],
                type: 'comfort food',
                excludeTags: ['salad']
            },
            sunny: {
                tags: ['light', 'fresh', 'grilled'],
                type: 'light meals',
                excludeTags: ['heavy']
            }
        };
    }

    async getRecipesByWeather(weatherType, temperature) {
        try {
            let recipeType = this.getRecipeType(weatherType, temperature);
            const tags = this.weatherRecipes[recipeType].tags.join(',');
            const excludeTags = this.weatherRecipes[recipeType].excludeTags.join(',');

            const response = await fetch(
                `${this.baseUrl}/complexSearch?apiKey=${this.apiKey}&tags=${tags}&excludeTags=${excludeTags}&number=5&addRecipeInformation=true`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }

            const data = await response.json();
            return {
                featured: this.formatRecipe(data.results[0]),
                suggestions: data.results.slice(0, 3).map(recipe => this.formatRecipe(recipe)),
                weatherType,
                temperature
            };
        } catch (error) {
            console.error('Error fetching recipes:', error);
            return {
                featured: { title: 'Recipe recommendations unavailable', type: '', image: 'https://via.placeholder.com/200x200' },
                suggestions: [],
                weatherType,
                temperature
            };
        }
    }

    formatRecipe(recipe) {
        return {
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            sourceUrl: recipe.sourceUrl,
            summary: recipe.summary
        };
    }

    getRecipeType(weatherType, temperature) {
        if (temperature > 25) return 'hot';
        if (temperature < 10) return 'cold';
        if (weatherType === 'Rain' || weatherType === 'Thunderstorm') return 'rainy';
        return 'sunny';
    }

    updateRecipeDisplay(recipes) {
        const recipeTitle = document.querySelector('.recipe-title');
        const recipeDescription = document.querySelector('.recipe-description');
        const recipeImage = document.querySelector('.recipe-image');
        
        if (recipes.featured) {
            recipeTitle.textContent = recipes.featured.title;
            recipeDescription.textContent = `Perfect ${this.weatherRecipes[this.getRecipeType(recipes.weatherType, recipes.temperature)].type} for ${recipes.weatherType.toLowerCase()} weather`;
            recipeImage.style.backgroundImage = `url(${recipes.featured.image})`;
            
            // Add click handler to open recipe
            recipeImage.onclick = () => {
                if (recipes.featured.sourceUrl) {
                    window.open(recipes.featured.sourceUrl, '_blank');
                }
            };
        } else {
            recipeTitle.textContent = 'Recipe recommendations unavailable';
            recipeDescription.textContent = 'Please try again later';
        }
    }
}

// Initialize recipe service
const recipeService = new RecipeService(); 