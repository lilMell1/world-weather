// Fetch and populate country options
let countriesArr;
let cityName = document.getElementById('chosen-place');

fetch('https://countriesnow.space/api/v0.1/countries/info?returns=flag')
    .then(response => response.json())
    .then(res => {
        countriesArr = res.data;
        countriesArr.sort((a, b) => a.name.localeCompare(b.name));
        insertCountriesToSelector();
    })
    .catch(error => console.log("Couldn't fetch countries:", error));

function insertCountriesToSelector() {
    let countrySelect = document.getElementById('Countries');
    countriesArr.forEach(country => {
        let option = document.createElement('option');
        option.value = country.name; 
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });
}

function fetchCities(country) {
    fetch(`https://countriesnow.space/api/v0.1/countries/cities/q?country=${country}`)
        .then(response => response.json())
        .then(res => {
            let citiesArr = res.data;
            let citySelect = document.getElementById('Cities');
            citySelect.innerHTML = '<option value="" disabled selected></option>';
            citiesArr.forEach(city => {
                let option = document.createElement('option');
                option.textContent = city;
                citySelect.appendChild(option);
            });
            citiesArr.sort((a, b) => a.localeCompare(b));
        })
        .catch(error => {
            let citySelect = document.getElementById('Cities');
            citySelect.innerHTML = '<option value="" disabled selected></option>';
            console.log("Couldn't fetch cities:", error);
        });
}

document.getElementById('Countries').addEventListener('change', (event) => {
    let chosenCountry = event.target.value;
    fetchCities(chosenCountry);
});

let latitude;
let longitude;

function fetchLandmarks(city, country) {
    fetch(`https://nominatim.openstreetmap.org/search.php?city=${city}&country=${country}&format=jsonv2`)
        .then(response => response.json())
        .then(res => {
            latitude = res[0].lat;
            longitude = res[0].lon;
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
            cityName.innerText = country + " - " + city;
            createCards(latitude, longitude);
        })
        .catch(error => console.log("Couldn't fetch Landmarks:", error));
}

document.getElementById('Cities').addEventListener('change', (event) => {
    let chosenCity = event.target.value;
    let chosenCountry = document.getElementById('Countries').value;
    fetchLandmarks(chosenCity, chosenCountry);
});

function createCards(latitude, longitude) {
    fetch(`https://www.7timer.info/bin/astro.php?lon=${longitude}&lat=${latitude}&unit=metric&output=json&tzshift=0`)
        .then(response => response.json())
        .then(res => {
            const dataseries = res.dataseries;
            let cardsContainer = document.querySelector('.cards-container');
            if (!cardsContainer) {
                // Create the containers dynamically
                const toCenter = document.createElement('div');
                toCenter.className = 'to-center';

                const weatherContainer = document.createElement('div');
                weatherContainer.className = 'weather-container';

                cardsContainer = document.createElement('div');
                cardsContainer.className = 'cards-container';

                weatherContainer.appendChild(cardsContainer);
                toCenter.appendChild(weatherContainer);
                
                // Append the containers to the body
                document.body.appendChild(toCenter);
            }

            cardsContainer.innerHTML = ' ';

            const getCloudCoverIcon = (cloudcover) => {
                if (cloudcover <= 6) return 'sun'; // 0%-6%
                else if (cloudcover <= 19) return 'pcloudy'; // 6%-19%
                else if (cloudcover <= 60) return 'cloudy'; // 19%-60%
                else if (cloudcover <= 80) return 'cloudy'; // 60%-80%
                else return 'cloudy'; // 80%-100%
            };

            const getWeatherIcon = (data) => {
                const { prec_type, cloudcover } = data;

                if (prec_type === 'none') {
                    const cloudIcon = getCloudCoverIcon(cloudcover);
                    return `weather Exam/${cloudIcon}.png`;
                }

                switch (prec_type) {
                    case 'snow':
                        return 'weather Exam/snow.png';
                    case 'rain':
                        return 'weather Exam/rain.png';
                    case 'ts':
                        return 'weather Exam/ts.png';
                    default:
                        const cloudIcon = getCloudCoverIcon(cloudcover);
                        return `weather Exam/${cloudIcon}.png`;
                }
            };

            dataseries.forEach(data => {
                const card = document.createElement('div');
                card.className = 'card';

                const cardText = document.createElement('p');
                cardText.className = 'card-text';
                cardText.textContent = `+${data.timepoint}Hrs`;

                const cardImg = document.createElement('img');
                cardImg.className = 'card-img';
                cardImg.src = getWeatherIcon(data);
                cardImg.alt = 'Weather Image';

                const cardDegrees = document.createElement('p');
                cardDegrees.className = 'card-degrees';
                cardDegrees.textContent = `${data.temp2m}°`;

                card.appendChild(cardText);
                card.appendChild(cardImg);
                card.appendChild(cardDegrees);

                cardsContainer.appendChild(card);
            });
        })
        .catch(error => console.log("Couldn't fetch weather data:", error));
}
