//Beginning of roundTrip.js

$(document).ready(function() {
    
    setDefaultPassengerValues('#roundTrip-adults', '#roundTrip-children', '#roundTrip-infants');
    // Initialize the datepickers
    var departureDatePicker = flatpickr("#roundTrip-departureDate", { 
        dateFormat: "Y-m-d",
        minDate: "today",
        defaultDate: getTomorrowDate(),
        onChange: function(selectedDates, dateStr, instance) {
            returnDatePicker.set('minDate', selectedDates[0] || "today");
        }
    });
    var returnDatePicker = flatpickr("#roundTrip-returnDate", { 
        dateFormat: "Y-m-d",
        minDate: "today"
    });
    // Initialize the timepickers
    flatpickr("#roundTrip-departureTime", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "h:i K",
        minuteIncrement: 15,
        time_24hr: false,
        defaultDate: defaultTime
        disableMobile: true
    });
    flatpickr("#roundTrip-returnTime", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "h:i K",
        minuteIncrement: 15,
        time_24hr: false,
        defaultDate: defaultTime
        disableMobile: true
    });
});


//AIRPORT API FUNCTIONS
$('#roundTrip-departureLocation').on('input', function() {
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

$('#roundTrip-arrivalLocation').on('input', function() {
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


// Handle form submission for round-trip requests
$('#roundTrip-bookingForm').submit(function(e) {
    e.preventDefault(); // Prevent form from refreshing the page

    // Parse and format the departure and return dates and times
    const departureDateTime = formatDateAndTime($('#roundTrip-departureDate').val(), $('#roundTrip-departureTime').val());
    const returnDateTime = formatDateAndTime($('#roundTrip-returnDate').val(), $('#roundTrip-returnTime').val());

    const formattedDepartureDate = (departureDateTime.getMonth() + 1) + '/' + departureDateTime.getDate() + '/' + departureDateTime.getFullYear();
    const formattedDepartureTime = departureDateTime.getHours().toString().padStart(2, '0') + ':' + departureDateTime.getMinutes().toString().padStart(2, '0');
    const formattedReturnDate = (returnDateTime.getMonth() + 1) + '/' + returnDateTime.getDate() + '/' + returnDateTime.getFullYear();
    const formattedReturnTime = returnDateTime.getHours().toString().padStart(2, '0') + ':' + returnDateTime.getMinutes().toString().padStart(2, '0');

    // Prepare the data
    const data = prepareData(
        '#roundTrip-adults',
        '#roundTrip-children',
        '#roundTrip-infants',
        '#roundTrip-pets',
        '#roundTrip-departureLocation',
        '#roundTrip-arrivalLocation',
        formattedDepartureDate,
        formattedDepartureTime,
        {formattedDate: formattedReturnDate, formattedTime: formattedReturnTime}
    );

    console.log('Sending data:', data);  // This line logs the data being sent.
        
    $('#loading').show();
    
    // Send the request to the API
    sendApiRequest(data, function(response) {
        
        $('#loading').hide();
        
        // Parse the response into a JSON object
        const responseObject = JSON.parse(response);

        if(responseObject.err_msg) {
          $('#roundTrip-loading-message').text(responseObject.err_msg);
          $('#roundTripRefresh').css('display', 'inline');
          console.log('#roundTripRefresh should be visible now');
            return;
        }

        console.log('Response object:', responseObject);

        // Save properties as variables
        console.log('responseObject.Legs:', responseObject.Legs);
        const quoteId = responseObject.quoteid;
        console.log('quoteId:', quoteId);

        const [departureLeg, returnLeg] = responseObject.Legs;

        const {
            Origin: departureOrigin,
            Destination: departureDestination,
            DepartDate: departureDate,
            pax: passengers,
            DepartTime: departureTime,
            ArriveTime: departureArriveTime
        } = departureLeg;
        console.log('departureLeg:', departureLeg);

        const {
            DepartDate: returnDate,
            DepartTime: returnTime,
            ArriveTime: returnArriveTime
        } = returnLeg;
        console.log('returnLeg:', returnLeg);

        const totalFlightTime = responseObject.TOTAL_FLIGHT_TIME;
        console.log('totalFlightTime:', totalFlightTime);

        const price = responseObject.Price;
        console.log('price:', price);

        // Update the HTML text using variables
        // Replace IDs and classes with the ones you created for the round-trip form
        $('#roundTrip-quoteID').text('Quote #' + quoteId);

        $('.roundtrip-departure-origin').text(departureOrigin);
        $('.roundtrip-departure-destination').text(departureDestination);
        $('#roundTrip-result-departureDate').text(departureDate);
        console.log('departureDate:', departureDate);
        
        $('#roundTrip-result-departureTime').text(departureTime);
        $('#roundTrip-result-departureArriveTime').text(departureArriveTime);

        $('#roundTrip-result-returnDate').text(returnDate);
        $('#roundTrip-result-returnTime').text(returnTime);
        $('#roundTrip-result-returnArriveTime').text(returnArriveTime);

        $('.roundtrip-flighttime').text(totalFlightTime);
        $('.roundtrip-passengers').text(passengers + ' Passengers');
        $('#roundTrip-price').text(price);

        // Show the quote div
        $('#roundTrip-quote').show();
        $('#roundTrip-loading-message').text('Your quote is below:');

   }, function(jqXHR, textStatus, errorThrown) {
        $('#loading').hide();
        console.log('Error details:', jqXHR, textStatus, errorThrown);
        console.log('API request failed: ', textStatus, errorThrown);

        // Handle error, show error message
        // If the error has a message, display it
        if (jqXHR.responseJSON && jqXHR.responseJSON.err_msg) {
            console.log('Test - before setting text');
            $('#roundTrip-loading-message').text(jqXHR.responseJSON.err_msg); 
            console.log('Test - after setting text');
            $('#roundTripRefresh').show();
            console.log('#roundTripRefresh should be visible now');
        }
        else {
            // If the error doesn't have a message, display a generic error message
            $('#roundTrip-loading-message').text('An error occurred. Please try again.');
            // Show the refresh button
            $('#roundTripRefresh').show();
            console.log('#roundTripRefresh should be visible now');
        }
    });
});
