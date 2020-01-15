/* Express to run server and routes */
const express = require('express');

/* Start up an instance of app */
const app = express();

/* Dependencies */
const dotenv = require('dotenv');
dotenv.config();
const bodyParser = require('body-parser');
const cors = require('cors');
const request = require('request-promise');
const { check, validationResult } = require('express-validator');


/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
app.use(cors());

/* Initialize the main project folder*/
app.use(express.static('dist'));

/* Spin up the server*/
const port = 3000;
app.listen(port, listening);
function listening() {
    console.log(`running on localhost: ${port}`);
}

// Post Route - Travel data form / Validation
app.post('/travel', [
    check('destination').not().isEmpty(),
    check('country').not().isEmpty(),
    check('datefrom').not().isEmpty()
], (req, res) => {
    console.log('::: POST DATA BEGIN :::')
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        req.body.status = "ERROR"
        req.body.error = ""
        console.log('FORM EMPTY ERROR!')
        errors.array().forEach(function (obj) {
            if (req.body.error != '') {
                req.body.error += ', '
            }
            switch (obj.param) {
                case 'destination':
                    req.body.error += 'Destination is empty';
                    break;
                case 'country':
                    req.body.error += 'Country is empty';
                    break;
                case 'datefrom':
                    req.body.error += 'Departing date is empty';
                    break;
            }
        });
    } else {
        req.body.status = "SUCCESS"
        req.body.error = ""
    }
    processTravelData(req, res)
})

// Process travel data - Validate Input, call APIs, return weather data, image link, errors
async function processTravelData(req, res) {

    // variables
    let longitude;
    let latitude;
    let weatherSummary;
    let weatherIcon;
    let temperature;
    let imageLink;
    let geonamesSuccess = false;
    let darkskySuccess = false;

    // daysleft
    let daysleft = Math.floor((new Date(req.body.datefrom).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) + 1;
    let daysleftMessage;
    if (daysleft>=0) {
        daysleftMessage = "Your traveling to " + req.body.destination + " will begin in " + daysleft + " days.";
    }else{
        daysleftMessage = "The departure time has passed " + Math.abs(daysleft) + " days.";
    }

    // Geonames API
    let geonamesURL = 'http://api.geonames.org/postalCodeSearchJSON?placename_startsWith=' + req.body.destination + '&countryCode=' + req.body.country + '&maxRows=1&username=' + process.env.GEONAMES_USERNAME
    if (req.body.status == "SUCCESS"){
        console.log("::: Getting the Geonames Data :::", geonamesURL);
        await request(geonamesURL, function (err, response, body) {
            if (err) {
                req.body.error = "Error when call Geonames API";
            } else {
                let geonamesData = JSON.parse(body);
                if (geonamesData.postalCodes[0] == undefined) {
                    req.body.error = "Location of destination not found, try again with different destination/country";
                } else {
                    longitude = geonamesData.postalCodes[0].lng;
                    latitude = geonamesData.postalCodes[0].lat;
                    geonamesSuccess = true;
                }
            }
        });
    }

    // get weather data from Dark Sky API
    let darkskyURL = 'https://api.darksky.net/forecast/' + process.env.DARKSKY_API_KEY + '/' + latitude + ',' + longitude + ',' + req.body.datefrom + 'T00:00:00?exclude=currently,flags,hourly'
    if (geonamesSuccess) {
        console.log("::: Getting the Dark Sky Data :::", darkskyURL);

        await request(darkskyURL, function (err, response, body) {
            if (err) {
                req.body.error = "Error when call Dark Sky API";
            } else {
                let darkskyData = JSON.parse(body);
                if (darkskyData.daily == undefined) {
                    req.body.error = "Weather data point daily not found - API error";
                } else {
                    weatherSummary = darkskyData.daily.data[0].summary;
                    weatherIcon = darkskyData.daily.data[0].icon;
                    darkskySuccess = true;
                    temperature = darkskyData.daily.data[0].temperatureHigh;
                }
            }
        });
    }

    // get image link from Pixabay API
    let pixabayURL = 'https://pixabay.com/api/?key=' + process.env.PIXABAY_API_KEY + '&q=' + req.body.destination + ' &image_type=photo'
    if (darkskySuccess) {
        console.log("::: Getting the Pixabay image :::", pixabayURL);

        await request(pixabayURL, function (err, response, body) {
            if (err) {
                req.body.error = "Error when call Pixabay API";
            } else {
                let pixabayData = JSON.parse(body);
                if (pixabayData.hits[0] == undefined) {
                    req.body.error = "No Image found";
                } else {
                    imageLink = pixabayData.hits[0].webformatURL;
                }
            }
        });
    }

    // set error status
    if (req.body.error != "") {
        req.body.status = 'ERROR';
    }

    let travelData = {
        destination: req.body.destination,
        country: req.body.country,
        datefrom: req.body.datefrom,
        daysleft: daysleftMessage,
        summary: weatherSummary,
        icon: weatherIcon,
        temperature: temperature,
        imagelink: imageLink,
        status: req.body.status,
        error: req.body.error
    }

    console.log(travelData)
    console.log('::: POST DATA END :::')

    return res.send(travelData);
}









