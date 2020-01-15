function handleSubmit(event) {
    event.preventDefault()

    let formDestination = document.getElementById('destination').value
    let formDateFrom = document.getElementById('datefrom').value
    let formCountry = document.getElementById('country').value

    // Post data to backend
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

      postFormData('http://localhost:3000/travel', {destination: formDestination, 
                                                    country: formCountry, 
                                                    datefrom: formDateFrom})
      .then((data) => {
        console.log('DATA')
        console.log(data);
        
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

    // Valid form data
    function dataValid (data = {}) {
        console.log("::: data valid :::")
        document.getElementById('error').classList.add("pseudo");
        document.getElementById('error').innerHTML = "";
        // destination and temperature
        document.getElementById('Destination').innerHTML = data.country + ' / ' + data.destination;
        document.getElementById('temperature').innerHTML = data.temperature;
        // weather summary and days left
        document.getElementById('weathersummary').innerHTML = data.summary;
        document.getElementById('weathersummary').className = '';
        document.getElementById('daysleft').innerHTML = data.daysleft;
        // icon and image
        setIcons(data.icon, document.querySelector(".icon"));
        document.getElementById('destinationimage').src = data.imagelink;
    }
    
    // Invalid form data
    function dataNotValid (data = {}) {
        console.log("::: data not valid :::")
        document.getElementById('error').classList.remove("pseudo");
        document.getElementById('error').innerHTML = 'Error!  ' + data.error;
    }
}    

export { handleSubmit }
