// Weather Dashboard - Main Script
// Using OpenWeatherMap API (Free Tier)

const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Get from https://openweathermap.org/api
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

// State Management
const state = {
    currentWeather: null,
    forecastData: null,
    isCelsius: true,
    currentCity: null,
    savedLocations: JSON.parse(localStorage.getItem('weatherDashboard_locations')) || [],
};

// DOM Elements
const elements = {
    // Search
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),

    // Alerts
    errorAlert: document.getElementById('errorAlert'),
    errorMessage: document.getElementById('errorMessage'),

    // Loading
    loadingSpinner: document.getElementById('loadingSpinner'),

    // Views
    currentView: document.getElementById('currentView'),
    forecastView: document.getElementById('forecastView'),
    hourlyView: document.getElementById('hourlyView'),
    detailsView: document.getElementById('detailsView'),

    // Current Weather
    cityName: document.getElementById('cityName'),
    currentDateTime: document.getElementById('currentDateTime'),
    mainWeatherIcon: document.getElementById('mainWeatherIcon'),
    mainTemp: document.getElementById('mainTemp'),
    weatherDescription: document.getElementById('weatherDescription'),
    feelsLike: document.getElementById('feelsLike'),

    // Stats
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),
    precipitation: document.getElementById('precipitation'),
    uvIndex: document.getElementById('uvIndex'),

    // Sun
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),

    // Containers
    forecastContainer: document.getElementById('forecastContainer'),
    hourlyContainer: document.getElementById('hourlyContainer'),
    detailsContainer: document.getElementById('detailsContainer'),
    savedLocationsContainer: document.getElementById('savedLocationsContainer'),

    // Controls
    toggleUnits: document.getElementById('toggleUnits'),
    refreshBtn: document.getElementById('refreshBtn'),
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

elements.searchBtn.addEventListener('click', handleSearch);
elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
elements.locationBtn.addEventListener('click', handleGeolocation);
elements.toggleUnits.addEventListener('click', toggleTemperatureUnit);
elements.refreshBtn.addEventListener('click', refreshWeather);

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const viewName = btn.dataset.view;
        switchView(viewName);
    });
});

// Initialize App
function initializeApp() {
    console.log('Initializing Weather Dashboard...');
    renderSavedLocations();
    loadWeatherByCity('London'); // Default city
}

// Search Handler
function handleSearch() {
    const city = elements.searchInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    elements.searchInput.value = '';
    loadWeatherByCity(city);
}

// Load Weather by City
async function loadWeatherByCity(city) {
    try {
        showLoading(true);
        hideError();

        const coords = await getCoordinates(city);
        if (!coords) {
            showError(`City "${city}" not found. Please try another search.`);
            showLoading(false);
            return;
        }

        await fetchWeatherData(coords.lat, coords.lon);
        state.currentCity = coords.name;
        updateDateTime();
        showLoading(false);
    } catch (error) {
        showError('Failed to fetch weather data. Please try again.');
        console.error('Error:', error);
        showLoading(false);
    }
}

// Get Coordinates from City Name
async function getCoordinates(cityName) {
    try {
        const response = await fetch(
            `${GEO_URL}/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`
        );

        if (!response.ok) throw new Error('Geocoding failed');

        const data = await response.json();
        if (data.length === 0) return null;

        const { lat, lon, name, country } = data[0];
        return { lat, lon, name, country };
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
}

// Fetch Weather Data
async function fetchWeatherData(lat, lon) {
    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
            fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Weather API request failed');
        }

        state.currentWeather = await currentResponse.json();
        state.forecastData = await forecastResponse.json();

        // Update UI
        displayCurrentWeather();
        displayForecast();
        displayHourlyForecast();
        displayDetails();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Geolocation Handler
function handleGeolocation() {
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
                
                // Get city name from coordinates
                const response = await fetch(
                    `${GEO_URL}/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
                );
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        state.currentCity = data[0].name;
                    }
                }
                
                updateDateTime();
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

// Display Current Weather
function displayCurrentWeather() {
    const { name, sys, main, weather, wind, clouds, visibility } = state.currentWeather;
    const { country } = sys;
    const { temp, feels_like, humidity, pressure } = main;
    const { main: weatherMain, description } = weather[0];

    // Update title and time
    elements.cityName.textContent = `${name}, ${country}`;

    // Update temperature
    elements.mainTemp.textContent = formatTemp(temp);
    elements.feelsLike.textContent = `Feels like ${formatTemp(feels_like)}°`;
    elements.weatherDescription.textContent = description;

    // Update weather icon
    elements.mainWeatherIcon.className = `fas ${getWeatherIcon(weatherMain)}`;

    // Update stats
    elements.humidity.textContent = `${humidity}%`;
    elements.windSpeed.textContent = `${wind.speed.toFixed(1)} m/s`;
    elements.pressure.textContent = `${pressure} hPa`;
    elements.visibility.textContent = `${(visibility / 1000).toFixed(1)} km`;
    elements.precipitation.textContent = `${main.humidity}%`; // Using humidity as proxy
    elements.uvIndex.textContent = 'N/A'; // Would need UV API

    // Update sunrise/sunset
    elements.sunrise.textContent = formatTime(sys.sunrise);
    elements.sunset.textContent = formatTime(sys.sunset);
}

// Display 5-Day Forecast
function displayForecast() {
    elements.forecastContainer.innerHTML = '';

    const dailyForecasts = getUniqueDaily(state.forecastData.list);

    dailyForecasts.slice(0, 5).forEach(forecast => {
        const { dt, main, weather } = forecast;
        const date = new Date(dt * 1000);
        const temp = formatTemp(main.temp);
        const description = weather[0].description;
        const weatherIcon = getWeatherIcon(weather[0].main);

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <div class="forecast-date">${formatDateShort(date)}</div>
            <div class="forecast-icon"><i class="fas ${weatherIcon}"></i></div>
            <div class="forecast-temp">${temp}°</div>
            <div class="forecast-desc">${description}</div>
        `;
        elements.forecastContainer.appendChild(card);
    });
}

// Display Hourly Forecast
function displayHourlyForecast() {
    elements.hourlyContainer.innerHTML = '';

    const next24Hours = state.forecastData.list.slice(0, 8); // 8 * 3 hours = 24 hours

    next24Hours.forEach(forecast => {
        const { dt, main, weather } = forecast;
        const time = new Date(dt * 1000);
        const temp = formatTemp(main.temp);
        const weatherIcon = getWeatherIcon(weather[0].main);

        const card = document.createElement('div');
        card.className = 'hourly-card';
        card.innerHTML = `
            <div class="hourly-time">${formatTimeHour(time)}</div>
            <div class="hourly-icon"><i class="fas ${weatherIcon}"></i></div>
            <div class="hourly-temp">${temp}°</div>
        `;
        elements.hourlyContainer.appendChild(card);
    });
}

// Display Details
function displayDetails() {
    if (!state.currentWeather) return;

    const { main, wind, sys, clouds, visibility, weather } = state.currentWeather;
    
    const details = [
        { title: 'Feels Like', value: `${formatTemp(main.feels_like)}°`, icon: 'fa-thermometer-half' },
        { title: 'Max Temp', value: `${formatTemp(main.temp_max)}°`, icon: 'fa-arrow-up' },
        { title: 'Min Temp', value: `${formatTemp(main.temp_min)}°`, icon: 'fa-arrow-down' },
        { title: 'Humidity', value: `${main.humidity}%`, icon: 'fa-droplets' },
        { title: 'Wind Speed', value: `${wind.speed.toFixed(1)} m/s`, icon: 'fa-wind' },
        { title: 'Wind Direction', value: `${wind.deg}°`, icon: 'fa-compass' },
        { title: 'Pressure', value: `${main.pressure} hPa`, icon: 'fa-gauge' },
        { title: 'Visibility', value: `${(visibility / 1000).toFixed(1)} km`, icon: 'fa-eye' },
        { title: 'Cloud Cover', value: `${clouds.all}%`, icon: 'fa-cloud' },
    ];

    elements.detailsContainer.innerHTML = '';
    details.forEach(detail => {
        const card = document.createElement('div');
        card.className = 'detail-card';
        card.innerHTML = `
            <div class="detail-title"><i class="fas ${detail.icon}"></i> ${detail.title}</div>
            <div class="detail-value">${detail.value}</div>
        `;
        elements.detailsContainer.appendChild(card);
    });
}

// Toggle Temperature Unit
function toggleTemperatureUnit() {
    state.isCelsius = !state.isCelsius;
    if (state.currentWeather) {
        displayCurrentWeather();
        displayForecast();
        displayHourlyForecast();
        displayDetails();
    }
}

// Refresh Weather
function refreshWeather() {
    if (state.currentCity) {
        loadWeatherByCity(state.currentCity);
    }
}

// Switch View
function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Remove active class from nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected view
    const viewMap = {
        'current': elements.currentView,
        'forecast': elements.forecastView,
        'hourly': elements.hourlyView,
        'details': elements.detailsView,
    };

    if (viewMap[viewName]) {
        viewMap[viewName].classList.add('active');
    }

    // Add active class to clicked button
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');
}

// Save Location
function saveLocation() {
    if (!state.currentCity || state.savedLocations.includes(state.currentCity)) {
        return;
    }
    state.savedLocations.push(state.currentCity);
    localStorage.setItem('weatherDashboard_locations', JSON.stringify(state.savedLocations));
    renderSavedLocations();
}

// Remove Location
function removeLocation(city) {
    state.savedLocations = state.savedLocations.filter(c => c !== city);
    localStorage.setItem('weatherDashboard_locations', JSON.stringify(state.savedLocations));
    renderSavedLocations();
}

// Render Saved Locations
function renderSavedLocations() {
    elements.savedLocationsContainer.innerHTML = '';

    if (state.savedLocations.length === 0) {
        elements.savedLocationsContainer.innerHTML = '<p style="color: rgba(255,255,255,0.7); grid-column: 1/-1;">No saved locations</p>';
        return;
    }

    state.savedLocations.forEach(city => {
        const btn = document.createElement('button');
        btn.className = 'location-btn';
        btn.innerHTML = `
            <span class="location-name">${city}</span>
            <span class="location-temp">--°</span>
            <button class="remove-location" onclick="removeLocation('${city}')">×</button>
        `;
        btn.onclick = () => loadWeatherByCity(city);
        elements.savedLocationsContainer.appendChild(btn);
    });
}

// Utility Functions

function formatTemp(temp) {
    if (state.isCelsius) {
        return Math.round(temp);
    } else {
        return Math.round((temp * 9/5) + 32);
    }
}

function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function formatTimeHour(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

function formatDateShort(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function updateDateTime() {
    const now = new Date();
    elements.currentDateTime.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getWeatherIcon(weatherMain) {
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Drizzle': 'fa-cloud-rain',
        'Thunderstorm': 'fa-bolt',
        'Snow': 'fa-snowflake',
        'Mist': 'fa-smog',
        'Smoke': 'fa-smog',
        'Haze': 'fa-smog',
        'Dust': 'fa-wind',
        'Fog': 'fa-smog',
        'Sand': 'fa-wind',
        'Ash': 'fa-smog',
        'Squall': 'fa-wind',
        'Tornado': 'fa-tornado'
    };
    return iconMap[weatherMain] || 'fa-cloud';
}

function getUniqueDaily(list) {
    const dailyForecasts = [];
    const uniqueDates = new Set();

    for (const forecast of list) {
        const date = new Date(forecast.dt * 1000).toLocaleDateString();
        if (!uniqueDates.has(date)) {
            uniqueDates.add(date);
            dailyForecasts.push(forecast);
        }
    }

    return dailyForecasts;
}

function showLoading(show) {
    if (show) {
        elements.loadingSpinner.classList.remove('hidden');
    } else {
        elements.loadingSpinner.classList.add('hidden');
    }
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorAlert.classList.remove('hidden');
    setTimeout(() => {
        elements.errorAlert.classList.add('hidden');
    }, 5000);
}

function hideError() {
    elements.errorAlert.classList.add('hidden');
}

console.log('Weather Dashboard Loaded');