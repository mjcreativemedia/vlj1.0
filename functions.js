//Beginning of functions.js

function setDefaultPassengerValues(adultsSelector, childrenSelector, infantsSelector) {
    $(adultsSelector).val(1);
    $(childrenSelector).val(0);
    $(infantsSelector).val(0);
}
function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
    const day = tomorrow.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

let defaultTime = new Date();
defaultTime.setHours(9);
defaultTime.setMinutes(0);

function formatDateAndTime(dateInput, timeInput) {
  const dateTime = new Date(dateInput);
  const time = timeInput.split(':');
  dateTime.setHours(parseInt(time[0]), parseInt(time[1]));
  return dateTime;
}

//ensures return date is after depart date
function updateReturnDateMin(departureDateSelector, returnDateSelector) {
  const departureDate = $(departureDateSelector).val();
  $(returnDateSelector).attr('min', departureDate);
}


function prepareData(
  adultsSelector, 
  childrenSelector, 
  infantsSelector, 
  petsSelector, 
  departureLocationSelector, 
  arrivalLocationSelector, 
  formattedDate, 
  formattedTime,
  returnData = null
) {
  const totalPassengers = (parseInt($(adultsSelector).val()) || 0) + 
                          (parseInt($(childrenSelector).val()) || 0) + 
                          (parseInt($(infantsSelector).val()) || 0);
  const data = {
    email: 'fly@openmarketjets.com',
    actype: 'SF50',
    passengers: totalPassengers,
    pets: $(petsSelector).is(':checked'),
    addlpilot: false,
    usearrive: false,
    tier: 1,
    CarrierID: 116,
    affiliatecode: 'OPENMARKETJETS',
    Legs: [
      {
        Leg: '0',
        orig: $(departureLocationSelector).val(),
        dest: $(arrivalLocationSelector).val(),
        departdate: formattedDate,
        departtime: formattedTime
      }
    ]
  };

  if(returnData) {
    data.Legs.push({
      Leg: '1',
      orig: $(arrivalLocationSelector).val(),
      dest: $(departureLocationSelector).val(),
      departdate: returnData.formattedDate,
      departtime: returnData.formattedTime
    });
  }

  return data;
}

function sendApiRequest(data, successCallback, errorCallback) {
  $.ajax({
    url: 'https://devcoastalavrestserver.coastalapi.services/api/quotetrip',
    method: 'POST',
    headers: {
      'API-Key': '5o#k#PXTxBZZ!Ac19+Mn6RT5&vziH#q', // Use your actual API key
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(data),
    success: function(response) {
      if (response === undefined || response === "undefined") {
        errorCallback(null, "Invalid API response", "Invalid API response");
      } else {
        successCallback(response);
      }
    },
    error: errorCallback
  });
}

const API_ENDPOINT = "https://devcoastalavrestserver.coastalapi.services/api/v3/airports";
const API_KEY = "5o#k#PXTxBZZ!Ac19+Mn6RT5&vziH#q";

// Function to search for airports by location
function fetchAirports(location, successCallback, errorCallback) {
  const queryParams = new URLSearchParams({
    CarrierID: 116,
    location: location,
    city: location, 
    state: location, 
    latitude: 0,
    longitude: 0,
    drivetime: 0,
  });

  $.ajax({
    url: `${API_ENDPOINT}?${queryParams.toString()}`,
    method: "GET",
    headers: {
      'API-Key': API_KEY,
    },
    success: function(response) {
      console.log(response);  // Log the response data
      const parsedResponse = JSON.parse(response);
      if (parsedResponse === undefined || !parsedResponse.airports) {
        console.error("Invalid API response: ", response);  // Log the invalid response
        errorCallback(null, "Invalid API response", "Invalid API response");
      } else {
        // Pass the airports data to the success callback
        successCallback(parsedResponse.airports);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error("API error: ", textStatus, errorThrown);  // Log the API error
      errorCallback(jqXHR, textStatus, errorThrown);
    }
  });
}

function createAirportDropdown(airports, inputElement) {
  // Create a dropdown menu and add it to the DOM
  const dropdown = $('<div class="dropdown-menu airport-list d-block"></div>');
  const list = $('<ul class="airport-list__content"></ul>');
  dropdown.append(list);
  dropdown.insertAfter(inputElement);

  // Populate the dropdown menu with the airports list
  airports.forEach(airport => {
    const listItem = $('<li class="airport-list__item"></li>');
    const name = $('<span class="airport-list__name"></span>').text(airport.FacilityName);
    const distance = $('<span class="airport-list__distance"></span>').text(`(${airport.airmiles} miles)`);
    const code = $('<span class="airport-list__code"></span>').text(airport.LocationID);
    listItem.append(name, distance, code);
    listItem.on('click', () => {
      inputElement.val(airport.LocationID);
      dropdown.remove();
    });
    list.append(listItem);
  });

  // Remove the dropdown menu when the input field loses focus
  inputElement.on('blur', () => {
    setTimeout(() => dropdown.remove(), 200);
  });
}
