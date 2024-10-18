const apiKey = 'caa29872c09318e78ccd1cb344f92cba';
let unit = 'metric'; 

const currentWeather = document.getElementById('currentWeather');
let forecastData = [];

document.getElementById('getWeatherBtn').addEventListener('click', () => {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        updateWeatherDisplay(city);
    } else {
        alert("Please enter a valid city name.");
    }
});

document.getElementById('locationBtn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                await updateWeatherDisplayByLocation(lat, lon);
            },
            (error) => {
                alert("Unable to retrieve your location.");
                console.error(error);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});

document.getElementById('unitToggle').addEventListener('change', (e) => {
    unit = e.target.checked ? 'imperial' : 'metric'; // 'imperial' for Fahrenheit, 'metric' for Celsius
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        updateWeatherDisplay(city);
    }
});

async function updateWeatherDisplay(city) {
    await getWeatherData(city);
    await getForecastData(city);
}

async function updateWeatherDisplayByLocation(lat, lon) {
    await getWeatherDataByLocation(lat, lon);
    await getForecastDataByLocation(lat, lon);
}

async function getWeatherData(city) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`;
    try {
        const response = await fetch(weatherUrl);
        const data = await response.json();
        displayCurrentWeather(data);
        displayCurrentWeatherChart(data);
    } catch (error) {
        currentWeather.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

async function getWeatherDataByLocation(lat, lon) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`;
    try {
        const response = await fetch(weatherUrl);
        const data = await response.json();
        displayCurrentWeather(data);
        displayCurrentWeatherChart(data);
    } catch (error) {
        currentWeather.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

async function getForecastData(city) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`;
    try {
        const response = await fetch(forecastUrl);
        const data = await response.json();
        forecastData = data;
        displayForecastCharts(data);
    } catch (error) {
        currentWeather.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

async function getForecastDataByLocation(lat, lon) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`;
    try {
        const response = await fetch(forecastUrl);
        const data = await response.json();
        forecastData = data; 
        displayForecastCharts(data);
    } catch (error) {
        currentWeather.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}


function displayCurrentWeather(data) {
    const unitSymbol = unit === 'metric' ? '°C' : '°F';
    currentWeather.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <p>${data.weather[0].description}</p>
        <p>Temperature: ${data.main.temp}${unitSymbol}</p>
        <p>Feels like: ${data.main.feels_like}${unitSymbol}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind: ${data.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}</p>
    `;
}

function displayCurrentWeatherChart(data) {
    const unitSymbol = unit === 'metric' ? '°C' : '°F';
    const ctx = document.getElementById('currentWeatherChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Temp', 'Feels Like', 'Min Temp', 'Max Temp'],
            datasets: [{
                label: `Temperature (${unitSymbol})`,
                data: [data.main.temp, data.main.feels_like, data.main.temp_min, data.main.temp_max],
                backgroundColor: ['#f39c12', '#e74c3c', '#9b59b6', '#3498db']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function displayForecastCharts(data) {
    const forecastData = data.list.filter((_, index) => index % 8 === 0);
    const temps = forecastData.map(day => day.main.temp);
    const labels = forecastData.map(day => new Date(day.dt * 1000).toLocaleDateString());

    const lineCtx = document.getElementById('forecastChart').getContext('2d');
    const unitSymbol = unit === 'metric' ? '°C' : '°F';
    new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Temperature (${unitSymbol})`,
                data: temps,
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.2)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
    const weatherConditions = forecastData.map(day => day.weather[0].main);
    const conditionCounts = weatherConditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});

    new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                label: 'Weather Conditions',
                data: Object.values(conditionCounts),
                backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f39c12']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}
