const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const chalk = require("chalk");
const path = require("path");

const apiKey = process.env.OPEN_WX_API_KEY;
const avWxAPIKey = process.env.AV_WX_API_KEY;
const router = express.Router();

let app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

router.route("/hello").get((req, res) => {
  res.send("Hello, World!");
});

app.use("/", router);

app.get("/wx", (req, res) => {
  res.render("wx", { cityName: null, weather: null, error: null });
});

app.get("/budget", (req, res) => {
  res.render("budget");
});

app.get("/regular", (req, res) => {
  res.render("regular");
});

app.get("/metar", (req, res) => {
  res.render("metar");
});

app.get("/taf", (req, res) => {
  res.render("taf");
});

app.get("/", (req, res) => {
  res.render("landing");
});

app.post("/", (req, res) => {
  let city = req.body.cityName;
  let wxType = req.body.wxType;

  if (wxType == "Regular") {
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    let forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    request(url, (err, response, body) => {
      if (err) {
        res.render("index", {
          cityName: null,
          error: "Error, please try again"
        });
      } else {
        let weather = JSON.parse(body);
        if (weather.main == undefined) {
          let errorMsg = `Error: No city by the name '${city}' was found. Please check and try again!`;
          res.render("index", { cityName: null, error: errorMsg });
        } else {
          let temperature = weather.main.temp;
          let skyCondition = weather.weather[0].description;
          let city = weather.name;
          let countryCode = weather.country;
          let currentWeather = `The current weather in ${city} is ${temperature} degrees Celsius with ${skyCondition}.`;
          res.render("index", {
            cityName: city,
            weather: currentWeather,
            error: null
          });

          //Forecast
          request(forecastUrl, (err, response, body) => {
            let forecast = JSON.parse(body);
            console.log(forecast.list[0]);
            console.log(forecast.list.length);
          });
        }
      }
    });
  } else {
    let url = `https://api.checkwx.com/${wxType.toLowerCase()}/${city}`;
    let options = {
      url: url,
      headers: {
        "X-API-Key": avWxAPIKey
      }
    };

    request(options, function(err, response, body) {
      let results = JSON.parse(body);
      let metar = results.data[0];
      res.render("index", {
        cityName: city,
        weather: metar,
        error: null
      });
    });
  }
});

app.listen(3000, () => {
  console.log(`Listening on port ${chalk.green("3000")}`);
});
