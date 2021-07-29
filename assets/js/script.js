
//Attempt to pull existing data from localStorage
var savedCity = localStorage.getItem("city");
var userName = localStorage.getItem("name");

//Function to check if a variable is in an array
function inArray(variable, array) {
    var inBool = false;
    for (i=0; i< array.length; i++) {
      if (array[i] === variable) {
        inBool = true;
      }
    }
    return(inBool)
  }

//Pulls up modal with the appropriate fields for input and establishes element blocks.
function modalMaker(type) {
    $(".modal").show();

    if (type==='city' || type==='name') {
        $("#city-button").off("click", clickCity);
        $("#username-button").off("click", clickUserName);
        $("#commute-button").off("click", commute);
    }

    var nameTextInput = $("<label>")
        .attr("for", "name")
        .text("Name:")
        .append($("<br>"))
        .append($("<input>")
            .attr("type", "text")
            .attr("id", "nameInput")
            .attr("name", "name"))
        .append($("<br>"))
        .append($("<br>"));

    var cityTextInput = $("<label>")
        .attr("for", "city")
        .text("City:")
        .append($("<br>"))
        .append($("<input>")
            .attr("type", "text")
            .attr("id", "cityInput")
            .attr("name", "city"))
        .append($("<br>"))
        .append($("<br>"));

    var submitButton = $("<input>")
        .attr("type", "submit");

    //Populates modal with forms/information according to type
    if (type === "both") {
        $("<form>")
            .attr("id", "modal-form")
            .append(nameTextInput, cityTextInput, submitButton)
            .appendTo($(".modal-content"));

        $("form").on("submit", function (event) {
            event.preventDefault();
            var cityName = $("#cityInput").val().trim();
            var name = $("#nameInput").val().trim();
            if (cityName && name) {
                $("#city-button").show();
                $("#username-button").show();
                displayInfo(cityName, name);
                getCityData(cityName);
                localStorage.setItem('name', name);
                localStorage.setItem('city', cityName);
                $(".modal-content").empty();
                $(".modal").hide();
            } else {
                if (!$('#fill-out-forms-p').text()) {
                    $("<p>")
                        .attr('id', 'fill-out-forms-p')
                        .text("Please fill your all forms!")
                        .appendTo($("#modal-form"));
                }
            }
        });
    } else if (type === "name") {
        $("<form>")
            .attr("id", "modal-form")
            .append(nameTextInput, submitButton)
            .appendTo(".modal-content");

        $("form").on("submit", function (event) {
            event.preventDefault();
            var name = $("#nameInput").val().trim();
            if (name) {
                $("#username-button").show();
                displayInfo(null, name);
                localStorage.setItem('name', name);
                $("#commute-button").on("click", commute);
                $("#city-button").on("click", clickCity);
                $("#username-button").on("click", clickUserName);
                $('body').off('click', exitModal);
                $(".modal-content").empty();
                $(".modal").hide();
            } else {
                if (!$('#fill-out-name-p').text()) {
                    $("<p>")
                        .attr('id', 'fill-out-name-p')
                        .text("Please fill your name!")
                        .appendTo($("#modal-form"));
                }
            };
        });
    } else if (type === "city") {
        $("<form>")
            .attr("id", "modal-form")
            .append(cityTextInput, submitButton)
            .appendTo(".modal-content");

        $("form").on("submit", function (event) {
            event.preventDefault();
            var cityName = $("#cityInput").val().trim();
            if (cityName) {
                $("#city-button").show();
                displayInfo(cityName, null);
                getCityData(cityName);
                localStorage.setItem('city', cityName);
                $("#commute-button").on("click", commute);
                $("#city-button").on("click", clickCity);
                $("#username-button").on("click", clickUserName);
                $('body').off('click', exitModal);
                $(".modal-content").empty();
                $(".modal").hide();
            } else {
                if (!$('#fill-out-city-p').text()) {
                    $("<p>")
                        .attr('id', 'fill-out-city-p')
                        .text("Please fill your city!")
                        .appendTo($("#modal-form"));
                }
            };
        });
    } else if (type === "error") {
        //Code to populate error
        $("#modal-form")
            .append($("<label>")
                .attr("for", "error")
                .text("Error!"))
    }

    if (type==='city' || type==='name') {
        function exitModal(e) {
            var children = Object.values($('.modal-content').children()[0]);
            children.push($('#modal-form')[0]);
            children.push($('#commute-button')[0]);
            children.push($('#city-button')[0]);
            children.push($('#username-button')[0]);
            if (!inArray(e.target, children)) {
                $("#commute-button").on("click", commute);
                $("#city-button").on("click", clickCity);
                $("#username-button").on("click", clickUserName);
                $('body').off('click', exitModal);
                $(".modal-content").empty();
                $(".modal").hide();
            }
        }
        
        $('body').on('click', exitModal)
    }
};

//Fetches immediate data for chosen city, including coordinates and current weather.
function getCityData(city) {
    fetch("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=4493e550e9acf995029c8985968d6001")
        .then(function (response) {
            if (response.ok) {
                return response.json();
        }}).then(function (data) {
            //Sends data according to fed parameter to the appropriate function
            getForecast(data);
            initMap(data);
        })};

//Uses coordinates to get 5-day forecast data
function getForecast(city) {
    fetch(
        "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        city.coord.lat +
        "&lon=" +
        city.coord.lon +
        '&units=' + 'imperial' +
        "&appid=4493e550e9acf995029c8985968d6001"
    ).then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                alert("ERROR");
            }
    }).then(function (data) {
            displayWeather(data);
        })};

//Displays user name and city in element
function displayInfo(city, name) {
    if (city && name) {
        $("#city-button").text(city);
        $(".userName").text(name);
    } else if (!city && name) {
        $(".userName").text(name);
    } else if (city && !name) {
        $("#city-button").text(city);
    }
}

//Uses api data to display today's weather
function displayWeather(cityObj) {
    $('#weather')
        .empty()
        .append($('<img>')
            .attr("id", "current-icon")
            .attr('src', "http://openweathermap.org/img/w/" + cityObj.current.weather[0].icon + ".png"))
        .append($('<h1>')
            .text('Temperature: ' + Math.floor(cityObj.current.temp) + 'F'))
        .append($('<h1>')
            .text('Wind: ' + cityObj.current.wind_speed + 'MPH'))
        .append($('<h1>')
            .text('Humidity: ' + cityObj.current.humidity + '%'))
        .append($('<h1>')
            .text('UV Index: ' + cityObj.current.uvi));
}

//Uses coordiates to display google map with traffic overlay
function initMap(cityObj) {
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: { lat: cityObj.coord.lat, lng: cityObj.coord.lon },
    });
    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);
};

//startup process basied on parameters
if (savedCity && userName) {
    displayInfo(savedCity, userName);
    getCityData(savedCity);
} else if (!savedCity && !userName) {
    savedCity = "";
    userName = "";
    $("#username-button").hide();
    $("#city-button").hide();
    modalMaker("both");
} else if (!savedCity && userName) {
    savedCity = "";
    $("#city-button").hide();
    displayInfo(null, userName);
    modalMaker("city");
} else if (savedCity && !userName) {
    userName = "";
    $("#username-button").hide();
    displayInfo(savedCity, null);
    modalMaker("name");
    getCityData(savedCity);
};

function clickUserName() {
    modalMaker("name");
}

function clickCity() {
    modalMaker('city');
}

//Info button event listeners.
$('#username-button').on('click', clickUserName);

$("#city-button").on("click", clickCity);

