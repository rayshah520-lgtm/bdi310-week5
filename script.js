// Shows the room temperature, and decides
// whether to turn on the heater or open the vent.
// For now, the slider stands in for a heat sensor.

// The sensor gives a raw number, not degrees.
// Multiply it by 0.08 to get degrees.
const PER_STEP = 0.08;

// The heater comes on below 18 degrees.
// The vent opens above 25 degrees.
// 18 and 25 were picked by testing in the studio.
const COLD = 18;
const HOT = 25;

// The average is worked out from the last 5 readings.
const MAX_READINGS = 5;

let latest = null;
let readings = [];
let heaterOn = false;
let roomName = "This room";

const slider = document.querySelector("#sensor");
const windowBox = document.querySelector("#window");
const roomText = document.querySelector("#room");
const temperatureText = document.querySelector("#temperature");
const actionText = document.querySelector("#action");
const averageText = document.querySelector("#average");

function toCelsius(raw) {
  return raw * PER_STEP;
}

function decide(celsius, windowIsOpen) {
  if (windowIsOpen) {
    return "Window open. Heater stays off.";
  } else if (celsius < COLD) {
    return "Heater on";
  } else if (celsius > HOT) {
    return "Vent open";
  } else {
    return "Nothing to do";
  }
}

function average(list) {
  let total = 0;
  for (let i = 0; i < list.length; i++) {
    total = total + list[i].celsius;
  }
  return total / list.length;
}

function show() {
  if (latest === null) {
    temperatureText.textContent = "No reading yet";
    return;
  }

  heaterOn = latest.celsius < COLD && !windowBox.checked;
  const needsAction =
    latest.celsius < COLD || latest.celsius > HOT;

  temperatureText.textContent = latest.celsius.toFixed(1) + "°C";
  actionText.textContent = decide(latest.celsius, windowBox.checked);
  actionText.classList.toggle("alert", needsAction);
  document.body.classList.toggle("heating", heaterOn);

  averageText.textContent =
    "Average of the last " + readings.length + ": " +
    average(readings).toFixed(1) + "°C";
}

slider.addEventListener("input", function () {
  const raw = Number(slider.value);

  latest = {
    raw: raw,
    celsius: toCelsius(raw),
    time: Date.now()
  };

  readings.push(latest);
  while (readings.length > MAX_READINGS) {
    readings.shift();
  }

  show();
});

windowBox.addEventListener("change", show);

roomText.textContent = roomName;

// A free weather service, asked for the
// temperature outside, in Toronto, right now.
const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=43.65&longitude=-79.38" +
  "&current=temperature_2m";
const outsideText = document.querySelector("#outside");

fetch(WEATHER_URL)
  .then(function (response) {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  })
  .then(function (data) {
    outsideText.textContent =
      "Outside right now: " + data.current.temperature_2m + "°C";
  })
  .catch(function () {
    outsideText.textContent = "Outside right now: no answer";
  });

show();
