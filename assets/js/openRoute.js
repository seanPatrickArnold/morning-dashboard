//Asynchronous function to fetch data from Open Route with headers provided and some parameters changed from the default values
async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      'Content-Type': 'application/json',
      'Authorization': '5b3ce3597851110001cf624822a021e023d6442c86c9d2e3384eccb4',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  });
  return(response);
}

//Create function to get state dependent address object from local storage
function getAddress() {
  var state = locationsObject.states[0];
  var addressObject = JSON.parse(localStorage.getItem(state+'Location'));
  return(addressObject)
}

//Function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

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

//Create locationsObject which contains state variables to step through built-in methods in
//specified order using method progressState
var locationsObject = {};
locationsObject.reset = function() {
  locationsObject.states = ['start', 'end', 'start', 'end', 'duration']
  locationsObject.startLocation = {}
  locationsObject.endLocation = {}
  locationsObject.functions = ['getLocations', 'getLocations', 'getCoordinates', 'getCoordinates', 'getDuration']
  locationsObject.progressState = function() {
    locationsObject.states.splice(0, 1);
    locationsObject.functions.splice(0, 1);
  }
  locationsObject.coordinates = [];
}

//Method that gets drive-time based on array of coordinates using Open Route API
locationsObject.getDuration = function() {
  postData('https://api.openrouteservice.org/v2/directions/driving-car/geojson', 
      {coordinates: locationsObject.coordinates
    })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      else {
          alert("ERROR");
      }
    })
    .then(function (data) {
      if ($('#travel-time-p').text()) {
        $('#travel-time-p')
          .text('Drive Time: ' + Math.floor(data.features[0].properties.summary.duration/60) + ' min');
      }
      else {
        $("<p>")
          .text('Drive Time: ' + Math.floor(data.features[0].properties.summary.duration/60) + ' min')
          .attr('id', 'travel-time-p')
          .appendTo($("#travel"));
      }
    });
  locationsObject.reset();
}

//Method to convert address into coordinates to pass into getDuration to get drive-time
//using XHR Open Route API request
locationsObject.getCoordinates = function() {

  var request = new XMLHttpRequest();

  var location = getAddress();

  request.open('GET', 'https://api.openrouteservice.org/geocode/search/structured?'
                      + 'api_key=5b3ce3597851110001cf624822a021e023d6442c86c9d2e3384eccb4'
                      + '&address=' + location.address
                      + '&country=' + location.country
                      + '&postalcode=' + location.postalcode
                      + '&region=' + location.region
                      + '&locality=' + location.locality
  );

  request.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');

  request.onreadystatechange = function () {
    if (this.readyState === 4) {
      locationsObject.coordinates.push(JSON.parse(this.response).features[0].geometry.coordinates);
      locationsObject.progressState();
      var fn = locationsObject[locationsObject.functions[0]];
      if (typeof fn === "function") fn();
    }
  };

  request.send();
}

//Method to call a modal to get address information from the user and save in locationsObject using Open Route API
locationsObject.getLocations = function() {
  
  $("#city-button").off("click", clickCity);
  $("#username-button").off("click", clickUserName);
  $("#commute-button").off("click", commute);
  $(".modal").show();

  var inputs = ['address', 'locality', 'region', 'country', 'postalCode'];
  var inputsObject = {}
  var state = locationsObject.states[0];
  
  var modalForm = $("<form>")
    .attr("id", "modal-form")

  modalForm.append($('<label>')
    .text(capitalizeFirstLetter(state) + ' Location')
    .attr("id", state + '-label'))
    .append('<br>')
    .append('<br>');

  for (i=0; i<inputs.length; i++) {
    inputName = inputs[i]
    inputsObject[inputName+'Label'] = $("<label>")
      .text(capitalizeFirstLetter(inputName) + ":")
      .attr("id", inputName + '-label')

    inputsObject[inputName+'Input'] = $("<input>")
      .attr("type", "text")
      .attr("id", inputName + '-input')
      .attr("name", inputName)
  }

  var submitButton = $("<input>")
  .attr("type", "submit");

  for (i=0; i<inputs.length; i++) {
    inputName = inputs[i];
    modalForm.append(inputsObject[inputName+'Label']);
    modalForm.append($('<br>'));
    modalForm.append(inputsObject[inputName+'Input']);
    modalForm.append($('<br>'));
  }

  modalForm.append($('<br>'))
    .append(submitButton)
  $('.modal-content').append(modalForm)

  $("form").on("submit", function (event) {
    event.preventDefault();
    var formFilled = true;
    for (i=0; i<inputs.length; i++) {
      inputName = inputs[i];
      var item = inputsObject[inputName+'Input'].val().trim();
      if (!item) {
        formFilled = false;
      }
    }
    if (formFilled) {
      var addressString = '';
      for (i=0; i<inputs.length; i++) {
        inputName = inputs[i];
        var item = inputsObject[inputName+'Input'].val().trim();
        locationsObject[state+'Location'][inputName] = item;
        addressString += item + ' ';
      }
      localStorage.setItem(state+'Location', JSON.stringify(locationsObject[state+'Location']))
      if ($('#' + locationsObject.states[0] + '-location-p').text()) {
        $('#' + locationsObject.states[0] + '-location-p')
          .text(capitalizeFirstLetter(state) + ' Location: ' + addressString.trim());
      }
      else {
        $("<p>")
          .text(capitalizeFirstLetter(state) + ' Location: ' + addressString.trim())
          .attr('id', state + '-location-p')
          .appendTo($("#travel"));
      }
      $(".modal-content").empty();
      $(".modal").hide();
      $("#commute-button").on("click", commute);
      $("#city-button").on("click", clickCity);
      $("#username-button").on("click", clickUserName);
      $('body').off('click', exitModal)
      locationsObject.progressState();
      var fn = locationsObject[locationsObject.functions[0]];
      if (typeof fn === "function") fn();
    }
    else {
      if (!$('#fill-out-form-p').text()) {
        $("<p>")
          .text("Please fill out all inputs.")
          .attr('id', 'fill-out-form-p')
          .appendTo($("#modal-form"));
      }
    }
  })

  function exitModal(e) {
    var children = Object.values($('.modal-content').children()[0].childNodes);
    children.push($('#modal-form')[0]);
    children.push($('#commute-button')[0]);
    children.push($('#city-button')[0]);
    children.push($('#username-button')[0]);
    if (!inArray(e.target, children)) {
      $("#commute-button").on("click", commute);
      $("#city-button").on("click", clickCity);
      $("#username-button").on("click", clickUserName);
      $('body').off('click', exitModal)
      $(".modal-content").empty();
      $(".modal").hide();
    }
  }

  $('body').on('click', exitModal)
}

//Add event listener for commute button to start sequence of locationsObject methods
function commute() {
  var savedCity = localStorage.getItem("city");
  var userName = localStorage.getItem("name");
  if (savedCity && userName) {
    var fn = locationsObject[locationsObject.functions[0]];
    if (typeof fn === "function") fn();
    if (!$('#commute-h2').text()) {
      $('<h2>')
          .text('Commute:')
          .attr('id', 'commute-h2')
          .appendTo($('#travel'));
    }
  }
}

locationsObject.reset();

$("#commute-button").on("click", commute);
