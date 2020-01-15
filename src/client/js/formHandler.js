function handleSubmit(event) {
    event.preventDefault()

    let destination = document.getElementById('destination').value
    let country = document.getElementById('country').value
    let dateFrom = document.getElementById('datefrom').value
    
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

      postFormData('http://localhost:3000/travel', {destination: destination, country: country, datefrom: dateFrom})
      .then((data) => {
        console.log(data);
        if ( data.status === 'SUCCESS' ) {
            console.log('SUCCESS');
            dataSuccess(data);
        } else { console.log('ERROR'); 
            dataError(data);
            }
      });

    function setIcons(icon, iconID) {
      const skycons = new Skycons({ color: "white" });
      skycons.play();
      return skycons.set(iconID, icon);
    }

    function dataSuccess (data = {}) {
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
    
    function dataError (data = {}) {
        document.getElementById('error').innerHTML = 'Error!  ' + data.error;
    }
}    

export { handleSubmit }
