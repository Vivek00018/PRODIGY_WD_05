const apiKey = "eb0a81a137465ea3c97222a61f6b1e72"; // Replace with your OpenWeatherMap API key
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locateBtn = document.getElementById("locate-btn");

const weatherDisplay = document.querySelector(".weather-display");
const errorMessage = document.querySelector(".error-message");
const background = document.querySelector(".background-animation");

/**
 * Updates the background and animations based on weather conditions and time of day.
 * @param {string} weather - The main weather condition (e.g., "rain", "snow", "cloud", "clear").
 * @param {boolean} isDay - True if it's daytime, false if it's nighttime.
 */
function updateBackground(weather, isDay) {
    background.innerHTML = ""; // Clear previous animations

    if (weather.includes("rain")) {
        document.body.style.background = "linear-gradient(120deg, #4b6cb7, #182848)";
        let rainContainer = document.createElement("div");
        rainContainer.classList.add("rain-animation");

        for (let i = 0; i < 80; i++) {
            let drop = document.createElement("div");
            drop.classList.add("drop");
            drop.style.left = Math.random() * 100 + "vw";
            drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + "s";
            rainContainer.appendChild(drop);
        }
        background.appendChild(rainContainer);
    }
    else if (weather.includes("snow")) {
        document.body.style.background = "linear-gradient(120deg, #83a4d4, #b6fbff)";
        for (let i = 0; i < 50; i++) {
            let snowflake = document.createElement("div");
            snowflake.classList.add("snowflake");
            snowflake.style.width = snowflake.style.height = Math.random() * 5 + 2 + "px";
            snowflake.style.left = Math.random() * 100 + "vw";
            snowflake.style.animationDuration = (Math.random() * 3 + 2) + "s";
            background.appendChild(snowflake);
        }
    }
    else if (weather.includes("cloud")) {
        document.body.style.background = "linear-gradient(120deg, #bdc3c7, #2c3e50)";
        for (let i = 0; i < 3; i++) {
            let cloud = document.createElement("div");
            cloud.classList.add("cloud-animation");
            cloud.style.top = Math.random() * 50 + "%";
            background.appendChild(cloud);
        }
    }
    else {
        if (isDay) {
            document.body.style.background = "linear-gradient(120deg, #f6d365, #fda085)";
            let sun = document.createElement("div");
            sun.classList.add("sun-animation");
            background.appendChild(sun);
        } else {
            document.body.style.background = "linear-gradient(120deg, #0f2027, #203a43, #2c5364)";
            for (let i = 0; i < 50; i++) {
                let star = document.createElement("div");
                star.classList.add("snowflake"); // reuse style for stars
                star.style.background = "#fff";
                star.style.width = star.style.height = Math.random() * 2 + 1 + "px";
                star.style.animationDuration = (Math.random() * 5 + 3) + "s";
                background.appendChild(star);
            }
        }
    }
}

/**
 * Fetches weather data for a given city and updates the UI.
 * Optionally pushes the city to the browser history.
 * @param {string} city - The name of the city.
 * @param {boolean} [pushState=true] - Whether to push the city to the browser history.
 */
async function getWeather(city, pushState = true) {
    try {
        const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
        if (!response.ok) {
            // If the response is not OK, throw an error to be caught by the catch block
            throw new Error("City not found");
        }

        const data = await response.json();
        errorMessage.style.display = "none";

        // Update weather data in the UI
        document.querySelector(".city").innerHTML = data.name + ", " + data.sys.country;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
        document.querySelector(".feels-like").innerHTML = "Feels like: " + Math.round(data.main.feels_like) + "°C";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = Math.round(data.wind.speed) + " km/h";
        document.querySelector(".pressure").innerHTML = data.main.pressure + " hPa";
        document.querySelector(".visibility").innerHTML = (data.visibility / 1000).toFixed(1) + " km";
        document.querySelector(".sunrise").innerHTML = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        document.querySelector(".sunset").innerHTML = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        document.querySelector(".description").innerHTML = data.weather[0].description;

        // Update background & animations based on new weather data
        const weatherMain = data.weather[0].main.toLowerCase();
        const isDay = data.dt > data.sys.sunrise && data.dt < data.sys.sunset;
        updateBackground(weatherMain, isDay);

        // Show weather display
        weatherDisplay.classList.add("active");

        // Push state to history if pushState is true
        if (pushState) {
            history.pushState({ city: data.name }, data.name, `?city=${encodeURIComponent(data.name)}`);
        }
        // Update the search box with the fetched city name
        searchBox.value = data.name;

    } catch (error) {
        errorMessage.style.display = "block";
        weatherDisplay.classList.remove("active");
        console.error("Error fetching weather data:", error);
    }
}

// Event listener for search button click
searchBtn.addEventListener("click", () => {
    if (searchBox.value.trim() !== "") {
        getWeather(searchBox.value.trim());
    }
});

// Event listener for Enter key press in search box
searchBox.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && searchBox.value.trim() !== "") {
        getWeather(searchBox.value.trim());
    }
});

// Event listener for locate button click (uses geolocation)
locateBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`);
                if (!response.ok) {
                    throw new Error("Location weather data not found");
                }
                const data = await response.json();
                getWeather(data.name); // Call getWeather, which will push to history
            } catch (error) {
                errorMessage.style.display = "block";
                console.error("Error fetching weather data for current location:", error);
            }
        }, (error) => {
            // Handle geolocation errors (e.g., user denies permission)
            errorMessage.style.display = "block";
            errorMessage.querySelector('p').textContent = "❌ Geolocation failed. Please enable location services or enter a city manually.";
            console.error("Geolocation error:", error);
        });
    } else {
        errorMessage.style.display = "block";
        errorMessage.querySelector('p').textContent = "❌ Geolocation is not supported by your browser.";
    }
});

// Event listener for browser's popstate event (back/forward buttons)
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.city) {
        // If there's a city in the history state, load its weather without pushing a new state
        getWeather(event.state.city, false);
    } else {
        // If no specific state, clear the display or load a default
        weatherDisplay.classList.remove("active");
        errorMessage.style.display = "none";
        searchBox.value = ""; // Clear search box
        document.body.style.background = "linear-gradient(120deg, #1e3c72, #2a5298)"; // Reset background
        background.innerHTML = ""; // Clear animations
    }
});

// Initial load: Check if a city is specified in the URL on page load
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cityFromUrl = urlParams.get('city');
    if (cityFromUrl) {
        getWeather(decodeURIComponent(cityFromUrl), false); // Load from URL, don't push state
    }
});
