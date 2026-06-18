// Weather Dashboard API Configuration
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Get from https://openweathermap.org/api
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// State Management
let currentWeatherData = null;
let forecastData = null;
let isCelsius = true;
let savedCities = JSON.parse(localStorage.getItem('savedCities')) || [];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const weatherContainer = document.getElementById('weatherContainer');
const tempToggle = document.getElementById('tempToggle');
const savedCitiesContainer = document.getElementById('savedCitiesContainer');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
locationBtn.addEventListener('click', handleGeolocation);
tempToggle.addEventListener('click', toggleTemperatureUnit);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderSavedCities();
    // Try to load weather for default city or user's location
    loadWeatherByCity('London');
});

/**
 * Search for weather by city name
 */
async function handleSearch() {
    const city = searchInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    searchInput.value = '';
    await loadWeatherByCity(city);
}

/**
 * Load weather for a specific city
 */
async function loadWeatherByCity(city) {
    try {
        showLoading(true);
        hideError();

        // Get coordinates from city name
        const coords = await getCoordinates(city);
        if (!coords) {
            showError(`City "${city}" not found. Please try another search.`);
            showLoading(false);
            return;
        }

        // Fetch weather data
        await fetchWeatherData(coords.lat, coords.lon, city);
        showLoading(false);
    } catch (error) {
        showError('Failed to fetch weather data. Please try again.');
        console.error('Error:', error);
        showLoading(false);
    }
}

/**
 * Get geolocation using browser's Geolocation API
 */
async function handleGeolocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                await fetchWeatherData(latitude, longitude);
                showLoading(false);
            } catch (error) {
                showError('Failed to fetch weather for your location');
                console.error('Error:', error);
                showLoading(false);
            }
        },
        (error) => {
            showError('Unable to access your location. Please enable location services.');
            showLoading(false);
        }
    );
}

/**
 * Get coordinates from city name using OpenWeatherMap Geocoding API
 */
async function getCoordinates(cityName) {
    try {
        const response = await fetch(
            `${GEO_URL}/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`
        );

        if (!response.ok) throw new Error('Failed to get coordinates');

        const data = await response.json();
        if (data.length === 0) return null;

        const { lat, lon, name, country } = data[0];
        return { lat, lon, name, country };
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
}

/**
 * Fetch weather data from OpenWeatherMap API
 */
async function fetchWeatherData(lat, lon, cityName = null) {
    try {
        // Fetch current weather and forecast
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
            fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }

        currentWeatherData = await currentResponse.json();
        forecastData = await forecastResponse.json();

        // Display the weather
        displayCurrentWeather();
        displayForecast();
        displayHourlyForecast();
        showWeather(true);

        // Add to recent searches if provided
        if (cityName && !isInSavedCities(currentWeatherData.name)) {
            // Optional: auto-add to saved cities
        }
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

/**
 * Display current weather information
 */
function displayCurrentWeather() {
    const { name, sys, main, weather, wind, clouds, visibility } = currentWeatherData;
    const { country } = sys;
    const { temp, feels_like, humidity, pressure } = main;
    const { main: weatherMain, description, icon } = weather[0];

    // Update DOM
    document.getElementById('cityName').textContent = `${name}, ${country}`;
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    updateTemperatureDisplay(temp, feels_like);
    document.getElementById('description').textContent = description;
    document.getElementById('weatherIcon').textContent = getWeatherEmoji(weatherMain);
    
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('windSpeed').textContent = `${wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${pressure} hPa`;
    document.getElementById('visibility').textContent = `${(visibility / 1000).toFixed(1)} km`;
    
    // Sunrise and Sunset
    const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    const sunset = new Date(sys.sunset * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('sunTime').textContent = `${sunrise} / ${sunset}`;

    // UV Index (if available, otherwise show cloud coverage)
    document.getElementById('uvIndex').textContent = `${clouds.all}% cloud cover`;
}

/**
 * Update temperature display
 */
function updateTemperatureDisplay(tempC, feelsLikeC) {
    let temp, feelsLike;
    
    if (isCelsius) {
        temp = Math.round(tempC);
        feelsLike = Math.round(feelsLikeC);
        document.querySelector('.unit').textContent = '°C';
        tempToggle.textContent = '°F';
    } else {
        temp = Math.round((tempC * 9/5) + 32);
        feelsLike = Math.round((feelsLikeC * 9/5) + 32);
        document.querySelector('.unit').textContent = '°F';
        tempToggle.textContent = '°C';
    }

    document.getElementById('temp').textContent = temp;
    document.getElementById('feelsLike').textContent = `Feels like ${feelsLike}°`;
}

/**
 * Display 5-day forecast
 */
function displayForecast() {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    // Get one forecast per day (every 8 forecasts = 24 hours)
    const dailyForecasts = [];
    let lastDate = null;

    for (const forecast of forecastData.list) {
        const date = new Date(forecast.dt * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        if (date !== lastDate) {
            dailyForecasts.push(forecast);
            lastDate = date;
            if (dailyForecasts.length >= 5) break;
        }
    }

    dailyForecasts.forEach(forecast => {
        const { dt, main, weather } = forecast;
        const date = new Date(dt * 1000);
        const temp = isCelsius ? Math.round(main.temp) : Math.round((main.temp * 9/5) + 32);
        const description = weather[0].description;
        const emoji = getWeatherEmoji(weather[0].main);

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            <div class="forecast-icon">${emoji}</div>
            <div class="forecast-temp">${temp}°</div>
            <div class="forecast-desc">${description}</div>
        `;
        forecastContainer.appendChild(card);
    });
}

/**
 * Display hourly forecast
 */
function displayHourlyForecast() {
    const hourlyContainer = document.getElementById('hourlyContainer');
    hourlyContainer.innerHTML = '';

    const next24Hours = forecastData.list.slice(0, 8); // 8 * 3 hours = 24 hours

    next24Hours.forEach(forecast => {
        const { dt, main, weather } = forecast;
        const time = new Date(dt * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        const temp = isCelsius ? Math.round(main.temp) : Math.round((main.temp * 9/5) + 32);
        const emoji = getWeatherEmoji(weather[0].main);

        const card = document.createElement('div');
        card.className = 'hourly-card';
        card.innerHTML = `
            <div class="hourly-time">${time}</div>
            <div class="hourly-icon">${emoji}</div>
            <div class="hourly-temp">${temp}°</div>
        `;
        hourlyContainer.appendChild(card);
    });
}

/**
 * Toggle between Celsius and Fahrenheit
 */
function toggleTemperatureUnit() {
    isCelsius = !isCelsius;
    
    if (currentWeatherData) {
        const { main, weather } = currentWeatherData;
        updateTemperatureDisplay(main.temp, main.feels_like);
        displayForecast();
        displayHourlyForecast();
    }
}

/**
 * Get weather emoji based on condition
 */
function getWeatherEmoji(weatherMain) {
    const emojiMap = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Smoke': '💨',
        'Haze': '🌫️',
        'Dust': '🌪️',
        'Fog': '🌫️',
        'Sand': '🌪️',
        'Ash': '🌋',
        'Squall': '🌪️',
        'Tornado': '🌪️'
    };
    return emojiMap[weatherMain] || '🌤️';
}

/**
 * Save current city to local storage
 */
function saveCurrentCity() {
    if (!currentWeatherData) return;
    
    const city = currentWeatherData.name;
    if (!isInSavedCities(city)) {
        savedCities.push(city);
        localStorage.setItem('savedCities', JSON.stringify(savedCities));
        renderSavedCities();
    }
}

/**
 * Check if city is already saved
 */
function isInSavedCities(cityName) {
    return savedCities.some(city => city.toLowerCase() === cityName.toLowerCase());
}

/**
 * Remove city from saved cities
 */
function removeCity(index) {
    savedCities.splice(index, 1);
    localStorage.setItem('savedCities', JSON.stringify(savedCities));
    renderSavedCities();
}

/**
 * Render saved cities buttons
 */
function renderSavedCities() {
    const container = savedCitiesContainer;
    container.innerHTML = '';

    if (savedCities.length === 0) {
        container.innerHTML = '<div class="empty-message">No saved cities yet. Search for a city and click the save button.</div>';
        return;
    }

    savedCities.forEach((city, index) => {
        const btn = document.createElement('button');
        btn.className = 'saved-city-btn';
        btn.innerHTML = `
            ${city}
            <button class="remove-city" onclick="removeCity(${index})">×</button>
        `;
        btn.addEventListener('click', (e) => {
            if (!e.target.classList.contains('remove-city')) {
                loadWeatherByCity(city);
            }
        });
        container.appendChild(btn);
    });
}

/**
 * Show/hide weather container
 */
function showWeather(show) {
    if (show) {
        weatherContainer.classList.remove('hidden');
        // Add save button functionality
        const saveBtn = document.createElement('button');
        saveBtn.style.display = 'none'; // Hidden, call saveCurrentCity() when needed
    } else {
        weatherContainer.classList.add('hidden');
    }
}

/**
 * Show loading spinner
 */
function showLoading(show) {
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.classList.add('hidden');
}

/**
 * Add keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save current city
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentCity();
        showError('City saved successfully!');
    }
    
    // Ctrl/Cmd + G to use geolocation
    if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        handleGeolocation();
    }
});