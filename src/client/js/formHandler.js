function handleSubmit(event) {
    event.preventDefault()

    // check what text was put into the form field
    let formDestination = document.getElementById('destination').value
    let formDateFrom = document.getElementById('datefrom').value
    let formCountry = document.getElementById('country').value

    console.log("::: destination :::", formDestination);
    console.log("::: country :::", formCountry);
    console.log("::: datefrom :::", formDateFrom);

    // async function to post form data to backend
    async function postFormData(url = '', data = {}) {
        const response = await fetch(url, {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data) 
        });
        return response.json(); 
      }

      // check the entered ISBN, if successful go ahead
      postFormData('http://localhost:3000/travel', {destination: formDestination, 
                                                    country: formCountry, 
                                                    datefrom: formDateFrom})
      .then((data) => {
        console.log('DATA')
        console.log(data); // JSON data parsed by `response.json()` call
        
        if ( data.status === 'SUCCESS' ) {
            console.log('SUCCESS');
            dataValid(data);
        } else { console.log('ERROR'); 
            dataNotValid(data);
            }
      });

    function setIcons(icon, iconID) {
      const skycons = new Skycons({ color: "white" });
      skycons.play();
      return skycons.set(iconID, icon);
    }

    // function for valid form data
    function dataValid (data = {}) {
        console.log("::: data valid :::")
        document.getElementById('error').classList.add("pseudo");
        document.getElementById('error').innerHTML = "";
        document.getElementById('daysleft').innerHTML = data.daysleft;
        // destination and temperature
        document.getElementById('Destination').innerHTML = data.country + ' / ' + data.destination;
        document.getElementById('temperature').innerHTML = data.temperature;
        // weather summary
        document.getElementById('weathersummary').innerHTML = data.summary;
        document.getElementById('weathersummary').className = '';
        /* eslint-disable-next-line */
        setIcons(data.icon, document.querySelector(".icon"));
        document.getElementById('destinationimage').src = data.imagelink;
    }
    
    // function for invalid form data - show the errors
    function dataNotValid (data = {}) {
        console.log("::: data not valid :::")
        document.getElementById('error').classList.remove("pseudo");
        document.getElementById('error').innerHTML = 'Error: ' + data.error;
    }
}    

export { handleSubmit }
