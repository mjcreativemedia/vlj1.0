//Beginning of oneWay.js

$(document).ready(function() {
    console.log('Document ready');
    setDefaultPassengerValues('#oneWay-adults', '#oneWay-children', '#oneWay-infants');

    // Initialize Flatpickr
    console.log('Initializing date picker');
    $("#oneWay-date").flatpickr({
        minDate: getTodayDate(),
        defaultDate: getTomorrowDate(),
        dateFormat: "Y-m-d"
    });

    console.log('Initializing time picker');
    $("#oneWay-time").flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: "h:i K",
    time_24hr: false,
    minuteIncrement: 15,
    defaultDate: defaultTime
    });
});



//AIRPORT API FUNCTIONS
$('#oneWay-departureLocation').on('input', function() {
  const location = $(this).val();
  
  // Remove any existing dropdown
  $('.dropdown-menu.airport-list').remove();

  if (location.length > 1) { // Change this line to check for length > 1
    const inputElement = $(this);
    fetchAirports(location, 
      function(airports) {
        createAirportDropdown(airports, inputElement);
      }, 
      function(error) {
        console.log('Error fetching airports:', error);
        createAirportDropdown([{ FacilityName: 'Airport not found', LocationID: '' }], inputElement);
      }
    );
  }
});

$('#oneWay-arrivalLocation').on('input', function() {
  const location = $(this).val();

  // Remove any existing dropdown
  $('.dropdown-menu.airport-list').remove();

  if (location.length > 1) { // Change this line to check for length > 1
    const inputElement = $(this);
    fetchAirports(location, 
      function(airports) {
        createAirportDropdown(airports, inputElement);
      }, 
      function(error) {
        console.log('Error fetching airports:', error);
        createAirportDropdown([{ FacilityName: 'Airport not found', LocationID: '' }], inputElement);
      }
    );
  }
});

//Form Submit
$('#oneWay-bookingForm').submit(function(e) {
    e.preventDefault();

    const departureDateTime = formatDateAndTime($('#oneWay-date').val(), $('#oneWay-time').val());
    const formattedDate = (departureDateTime.getMonth() + 1) + '/' + departureDateTime.getDate() + '/' + departureDateTime.getFullYear();
    const formattedTime = departureDateTime.getHours().toString().padStart(2, '0') + ':' + departureDateTime.getMinutes().toString().padStart(2, '0');
    console.log('Departure location:', $('#oneWay-departureLocation').val());
    console.log('Arrival location:', $('#oneWay-arrivalLocation').val());

    const data = prepareData(
      '#oneWay-adults',
      '#oneWay-children',
      '#oneWay-infants',
      '#oneWay-pets',
      '#oneWay-departureLocation',
      '#oneWay-arrivalLocation',
      formattedDate,
      formattedTime
    );

    console.log('Sending data:', data);

    $('#loading').show();

    sendApiRequest(
      data,
      function(response) {
        $('#loading').hide();

        const responseObject = JSON.parse(response);
  
        if(responseObject.err_msg) {
          $('#oneWay-loading-message').text(responseObject.err_msg);
          $('#oneWayRefresh').css('display', 'inline');
          console.log('#oneWayRefresh should be visible now');
            return;
        }

        console.log('Parsed Response data: ', responseObject);
        console.log('Parsed Response object keys: ', Object.keys(responseObject));

        const quoteId = responseObject.quoteid;
        const leg = responseObject.Legs[0];
        
        const { Origin: origin, Destination: destination, DepartDate: departDate, pax: passengers, DepartTime: departTime, ArriveTime: arriveTime } = leg;
        const totalFlightTime = responseObject.TOTAL_FLIGHT_TIME;
        const price = responseObject.Price;

        $('#oneWay-quoteID').text('Quote #' + quoteId);
        console.log('Updated #oneWay-quoteID with:', 'Quote #' + quoteId);

        $('.oneway-origin').text(origin);
        console.log('Updated .oneway-origin with:', origin);

        $('.oneway-destination').text(destination);
        console.log('Updated .oneway-destination with:', destination);

        $('#oneWay-departDate').text(departDate);
        console.log('Updated #oneWay-departDate with:', departDate);

        $('#oneWay-flightTime').text(totalFlightTime);
        console.log('Updated #oneWay-flightTime with:', totalFlightTime);

        $('#oneWay-passengers').text(passengers + ' Adults');
        console.log('Updated #oneWay-passengers with:', passengers + ' Adults');

        $('#oneWay-departTime').text(departTime);
        console.log('Updated #oneWay-departTime with:', departTime);

        $('#oneWay-arriveTime').text(arriveTime);
        console.log('Updated #oneWay-arriveTime with:', arriveTime);

        $('#oneWay-price').text(price);
        console.log('Updated #oneWay-price with:', price);

        console.log('Showing #quote div');
        $('#oneWay-quote').show();
        $('#oneWay-loading-message').text('Your quote is below:');
      },
            function(jqXHR, textStatus, errorThrown) {
  $('#loading').hide();
  console.log('Error details:', jqXHR, textStatus, errorThrown);
  console.log('API request failed: ', textStatus, errorThrown);

  // Handle error, show error message
  // If the error has a message, display it
  if (jqXHR.responseJSON && jqXHR.responseJSON.err_msg) {
    console.log('Test - before setting text');
    $('#loading-message').text(jqXHR.responseJSON.err_msg); 
    console.log('Test - after setting text');
    $('#oneWayRefresh').show();
    console.log('#oneWayRefresh should be visible now');
}

  else {
      // If the error doesn't have a message, display a generic error message
      $('#oneWay-loading-message').text('An error occurred. Please try again.');
      // Show the refresh button
  $('#oneWayRefresh').show();
  console.log('#oneWayRefresh should be visible now');
  }
      }
    );
});

