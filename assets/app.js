// Defining elements from DOM to target later
const searchForm = document.getElementById('search-form');
const recentSearchesEl = document.getElementById('recent-searches')
const inputSearch = document.getElementById('input-search');
const currentDayCity = document.getElementById('current-day-city');
const currentDayTemp = document.getElementById('current-day-temp');
const currentDayHumidity = document.getElementById('current-day-humidity');
const currentDayWind = document.getElementById('current-day-wind');
const currentDayUV = document.getElementById('current-day-UV');
const cardContainer = document.getElementById('card-container');
const weatherIcon = document.getElementById('weather-icon')

// Re-setting the recent searches
let recentSearches = [];

// Hide this 
var apiKey = config.open_weather_API

// Retrieves the data for the city
function getOneCallApi(lon, lat) {
    return fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude={part}&appid=${apiKey}`)
        .then(function (response) {
            return response.json();
        })

}

// Find the coordinates of the city I've searched
function getWeatherData(city) {
    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (currentWeather) {
            return getOneCallApi(currentWeather.coord.lon, currentWeather.coord.lat)
        })
}

// when the user clicks on the search button
searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    // get user input
    const userInput = inputSearch.value;
    // Pass the search query to the data collection function
    renderWeatherData(userInput);
    // Adds the user input to list of recent searches
    recentSearches.push(userInput);
    // Saves the current list of recent searches to LS
    localStorage.setItem("recentCities", JSON.stringify(recentSearches));
    // Re-render the searches after a new search is made
    renderSearches();

})

// Function that receives weather data and renders it to DOM
function renderWeatherData(userInput) {
    
    // reset content before rendering again
    cardContainer.innerHTML = "";


    getWeatherData(userInput)
        .then(function (weatherData) {
            console.log(weatherData)
            
            // current card
            const iconID = weatherData.current.weather[0]['icon'];
            const iconURL = "http://openweathermap.org/img/w/" + iconID + ".png";
            console.log(iconURL)


            const datetime = moment(weatherData.current.dt, 'X').format("YYYY-MM-DD")
            currentDayCity.innerHTML = `${userInput} ${datetime}`
            currentDayHumidity.textContent = weatherData.current.humidity;
            currentDayTemp.textContent = weatherData.current.temp + 'F';
            currentDayUV.textContent = weatherData.current.uvi;
            currentDayWind.textContent = weatherData.current.wind_speed + ' mp/h'
            weatherIcon.src = iconURL;        

            // 5 Day forecast
            for (let i = 0; i < 5; i++) {
                // Looping through the next 5 days & creating a card for each one
                const forecastCardCol = document.createElement('div')
                forecastCardCol.classList.add('col-4', 'card')

                const forecastCard = document.createElement('div')
                forecastCard.classList.add('card-body')

                const forecastDate = document.createElement('h6')
                forecastDate.textContent = moment(weatherData.daily[i].dt, 'X').format("dddd")

                const cardText = document.createElement('div')
                cardText.classList.add('card-text')

                const forecastTemp = document.createElement('p');
                const forecastWind = document.createElement('p');
                const forecastHumidity = document.createElement('p');
                const forecastIcon = document.createElement('img')

                // Giving text content to cards
                forecastTemp.textContent = "Temp: " + weatherData.daily[i].temp.day + 'F';
                forecastWind.textContent = "Wind: " + weatherData.daily[i].wind_speed + ' mp/h';
                forecastHumidity.textContent = "Humidity: " + weatherData.daily[i].humidity;
                forecastIcon.setAttribute('src', "http://openweathermap.org/img/w/" + weatherData.daily[i].weather[0]['icon'] + ".png" )

                // Append the card elements
                cardText.appendChild(forecastIcon)
                cardText.appendChild(forecastTemp);
                cardText.appendChild(forecastHumidity);
                cardText.appendChild(forecastWind);

                forecastCard.appendChild(forecastDate);
                forecastCard.appendChild(cardText);

                forecastCardCol.appendChild(forecastCard);
                console.log(forecastCardCol);

                // Append to DOM
                cardContainer.appendChild(forecastCardCol)

            }
        });

}

// When DOM loads, render the recent searches
document.addEventListener('DOMContentLoaded', function () {
    renderSearches()
})

// Displays searches in DOM
function renderSearches() {

    // Resetting the content before rendering again
    recentSearchesEl.innerHTML = '';
    
    // Assigning variable to local storage data
    const pastSearches = JSON.parse(localStorage.getItem("recentCities"))
    // if there are past searches, create buttons and append them to DOM
    if (pastSearches !== null) {
        recentSearches = pastSearches;
        for (let i = 0; i < pastSearches.length; i++) {
        const cityButton = document.createElement("button")
        cityButton.classList.add('btn', 'btn-primary', 'd-block', 'w-100', 'mt-1');
        cityButton.setAttribute('type', 'submit');
        cityButton.setAttribute('id', 'city-button')
        cityButton.setAttribute('data', pastSearches[i])
        cityButton.textContent = pastSearches[i];
        recentSearchesEl.appendChild(cityButton);
        }
    }

    
}

// When a recent search is clicked
$(document).on('click', '#city-button', function (event) {
    // Target the data attribute containing the city name
    event.preventDefault();
    const city = $(this).attr('data');
    // render the weather for the city
    renderWeatherData(city);

})

