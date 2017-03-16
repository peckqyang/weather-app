/*

- Sign up for openweathermap.org and generate an API key.
- User either $.ajax or $.get to pull weather current data .
  for San Francisco (hint: http://api.openweathermap.org/data/2.5/weather?q=...).
- Print the temperature in console.
- Bonus 1: add a form prompting user for the city and state.
- Bonus 2: convert answer from kelvin to fahrenheit.

*/

'use strict';

let openWeatherUrl = 'https://accesscontrolalloworiginall.herokuapp.com/http://api.openweathermap.org/data/2.5/weather?';
let openWeatherAPIKey = '93e5b48c233a1db4de5e42df96562bcc';
let openWeatherSourceUrl = 'http://openweathermap.org/';

let darkskyUrl = 'https://api.darksky.net/forecast/';
let darkskyAPIKey = '20f8701738463eb008073b3ec92460c6';
let darkskySourceUrl = 'https://darksky.net/';

let $getWeatherButton = $('#weather-request-button');

let DEFAULT_CITY = 'San Francisco';
let DEFAULT_COUNTRY = 'US';
let DEFAULT_GEO_COORD = {lat: 37.77, lng: -122.42};

let map, marker;

function kelvinToCelsius(tempKelvin) {
    return tempKelvin - 273.15;
}

function titleCase(string) {
    let str = string.toLowerCase().split(' ');

    for(let i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }

    return str.join(' ');
}

function getOpenWeatherUrl(city, country) {
    return (openWeatherUrl + 'q=' + city + ',' + country + '&appid=' + openWeatherAPIKey);
}

function getDarkSkyUrl(lat, lon) {
    return (darkskyUrl + darkskyAPIKey + '/' + lat + ',' + lon + '?units=si');
}

function getOpenWeather(city, country, dataprovider) {
    $.ajax({
        url: getOpenWeatherUrl(city, country),
        type: 'GET',
        format: 'JSON',
        success: function(data, status) {
            console.log(data);
            console.log(status);
            if (dataprovider == 'openweathermap') {
                updateWeatherPanel(data, dataprovider);
                updateMap(data);
            } else if (dataprovider == 'darksky') {
                getDarkSkyWeather(data.coord.lat, data.coord.lon, dataprovider, data);
            }
        },
        error: function(data, status) {
            alert('Whoops,there was an error. Please enter another city and country.');
            console.log(status);
        }
    })
}

function getDarkSkyWeather(lat, lon, dataprovider, openweatherdata) {
    $.ajax({
        url: getDarkSkyUrl(lat, lon),
        type: 'GET',
        format: 'JSON',
        dataType: 'jsonp',
        success: function(data, status) {
            console.log(data);
            console.log(status);
            updateWeatherPanel(data, dataprovider, openweatherdata);
            updateMap(openweatherdata);
        },
        error: function(data, status) {
            alert('Whoops,there was an error. Please enter another city and country.');
            console.log(status);
        }
    })
}

function updateWeatherPanel(response, dataprovider, openweatherdata) {
    let city, country, location, condition, currentTemp, imgUrl;

    if (dataprovider == 'openweathermap') {
        city = response.name;
        country = response.sys.country;
        location = city + ', ' + country;

        condition = titleCase(response.weather[0].description);
        currentTemp = kelvinToCelsius(response.main.temp).toFixed(1) + '˚C';
        imgUrl = 'http://openweathermap.org/img/w/' + response.weather[0].icon + '.png';

        $('#condition-pic').replaceWith('<img id=\'condition-pic\'></img>');
        $('#condition-pic').attr('src', imgUrl);

        $('#data-source').html('Openweathermap.org');
        $('#data-source').attr('href', openWeatherSourceUrl + 'city/' + response.id);

    } else if (dataprovider == 'darksky') {
        city = openweatherdata.name;
        country = openweatherdata.sys.country;
        location = city + ', ' + country;

        condition = titleCase(response.currently.summary);
        currentTemp = (response.currently.temperature).toFixed(1) + '˚C';

        var skycons = new Skycons({'color': 'black'});
        $('#condition-pic').replaceWith('<canvas id=\'condition-pic\' width=\'50\' height=\'50\'></canvas>');
        skycons.add('condition-pic', response.currently.icon);
        skycons.play();

        $('#data-source').html('Darksky.net');
        $('#data-source').attr('href', darkskySourceUrl + response.latitude + ',' + response.longitude);
    }
    $('#location').html(location);
    $('#condition').html(condition);
    $('#temp').html(currentTemp);
}

function getWeather() {
    let city = $('#city-input').val();
    let country = $('#country-input').val();
    let dataProviderInput = $('#data-provider').val();
    let dataprovider;

    if (dataProviderInput == 'Openweathermap.org') {
        dataprovider = 'openweathermap';
    } else if (dataProviderInput === 'Darksky.net') {
        dataprovider = 'darksky';
    } else {
        alert('Please select a data provider.');
        return;
    }

    if (city == '') {
        alert('Please enter a city.');
        return;
    } else if (country == '') {
        alert('Please enter a country.');
        return;
    } else {
        // $('#weather-request').find('input').val('');
        // $('#city-input').attr('placeholder', '');
        // $('#country-input').attr('placeholder', '');
        getOpenWeather(city, country, dataprovider);
    }
}

$(document).keypress(function(e) {
    if(e.which == 13) {
        getWeather();
    }
});

$getWeatherButton.on('click', function(event) {
    event.preventDefault();
    getWeather();
});

$(document).ready(function() {
    getOpenWeather(DEFAULT_CITY, DEFAULT_COUNTRY, 'openweathermap');
})

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: DEFAULT_GEO_COORD
    });
    marker = new google.maps.Marker({
        position: DEFAULT_GEO_COORD,
        map: map
    });
}


function updateMap(data) {
    let newLocation = {
        lat : data.coord.lat, 
        lng : data.coord.lon 
    };
    map.setCenter(newLocation);
    marker.setPosition(newLocation);
    
}

