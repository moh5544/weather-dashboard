// Configuration
const API_KEY = localStorage.getItem('weatherApiKey') || prompt('Enter your OpenWeatherMap API Key:\n\nGet one free at: https://openweathermap.org/api');
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Store API key in localStorage for future use
if (API_KEY && !localStorage.getItem('weatherApiKey')) {
    localStorage.setItem('weatherApiKey', API_KEY);
}

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherContainer = document.getElementById('weatherContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const initialState = document.getElementById('initialState');
const errorMessage = document.getElementById('errorMessage');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

/**
 * Handle search button click and Enter key press
 */
function handleSearch() {
    const city = cityInput.value.trim();
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    if (!API_KEY) {
        showError('API Key is required. Please refresh and enter your OpenWeatherMap API Key.');
        return;
    }

    fetchWeatherData(city);
}

/**
 * Fetch weather data from OpenWeatherMap API
 * @param {string} city - City name to search for
 */
async function fetchWeatherData(city) {
    try {
        showLoading(true);
        clearError();

        const response = await fetch(
            `${API_BASE_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the spelling and try again.');
            } else if (response.status === 401) {
                throw new Error('Invalid API Key. Please check your OpenWeatherMap API Key.');
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
        }

        const data = await response.json();
        displayWeather(data);
        showLoading(false);

    } catch (error) {
        showLoading(false);
        showError(error.message);
        console.error('Weather fetch error:', error);
    }
}

/**
 * Display weather data on the dashboard
 * @param {object} data - Weather data from API
 */
function displayWeather(data) {
    try {
        const {
            name,
            sys,
            main,
            weather,
            wind,
            clouds,
            visibility,
            dt
        } = data;

        // Extract weather information
        const weatherMain = weather[0];
        const temperature = Math.round(main.temp);
        const feelsLike = Math.round(main.feels_like);
        const minTemp = Math.round(main.temp_min);
        const maxTemp = Math.round(main.temp_max);
        const humidity = main.humidity;
        const pressure = main.pressure;
        const windSpeed = (wind.speed * 3.6).toFixed(1); // Convert m/s to km/h
        const cloudCoverage = clouds.all;
        const visibilityKm = (visibility / 1000).toFixed(1);
        const description = weatherMain.main;
        const weatherIcon = getWeatherIcon(weatherMain.icon);

        // Format sunrise and sunset
        const sunrise = new Date(sys.sunrise * 1000);
        const sunset = new Date(sys.sunset * 1000);
        const sunriseTime = formatTime(sunrise);
        const sunsetTime = formatTime(sunset);

        // Format last updated time
        const lastUpdated = new Date(dt * 1000);
        const formattedTime = lastUpdated.toLocaleString();

        // Update DOM elements
        document.getElementById('cityName').textContent = `${name}, ${sys.country}`;
        document.getElementById('weatherDescription').textContent = description;
        document.getElementById('weatherIcon').src = weatherIcon;
        document.getElementById('weatherIcon').alt = description;

        document.getElementById('temperature').textContent = temperature;
        document.getElementById('feelsLike').textContent = feelsLike;

        document.getElementById('humidity').textContent = `${humidity}%`;
        document.getElementById('windSpeed').textContent = `${windSpeed} km/h`;
        document.getElementById('pressure').textContent = `${pressure} hPa`;
        document.getElementById('visibility').textContent = `${visibilityKm} km`;

        document.getElementById('sunrise').textContent = sunriseTime;
        document.getElementById('sunset').textContent = sunsetTime;

        document.getElementById('maxTemp').textContent = maxTemp;
        document.getElementById('minTemp').textContent = minTemp;
        document.getElementById('clouds').textContent = cloudCoverage;

        document.getElementById('lastUpdated').textContent = formattedTime;

        // Show weather container, hide initial state
        weatherContainer.classList.remove('hidden');
        initialState.classList.add('hidden');

    } catch (error) {
        showError('Error processing weather data. Please try again.');
        console.error('Display error:', error);
    }
}

/**
 * Get weather icon URL from OpenWeatherMap
 * @param {string} iconCode - Icon code from API
 * @returns {string} Icon URL
 */
function getWeatherIcon(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
}

/**
 * Format time in HH:MM format
 * @param {Date} date - Date object
 * @returns {string} Formatted time
 */
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Show loading spinner
 * @param {boolean} show - Whether to show or hide spinner
 */
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
        weatherContainer.classList.add('hidden');
        initialState.classList.add('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

/**
 * Display error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    weatherContainer.classList.add('hidden');
    loadingSpinner.classList.add('hidden');
    initialState.classList.remove('hidden');

    // Auto-hide error after 5 seconds
    setTimeout(clearError, 5000);
}

/**
 * Clear error message
 */
function clearError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
}

/**
 * Initialize the app
 */
function init() {
    // Focus on input field on load
    cityInput.focus();

    // Set a default city (optional)
    // cityInput.value = 'London';
    // fetchWeatherData('London');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Clear API key and refresh on Ctrl+Shift+K
    if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        localStorage.removeItem('weatherApiKey');
        location.reload();
    }
});
