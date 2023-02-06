"use strict";

// TODOS: Adjust table header sizing
//        Fix sidepanel to stay full screen on md and up

(() => {
  const COCKTAILS = {
    1: {
      name: "Apple Martini",
      originalPrice: 10.00
    },
    2: {
      name: "Cosmopolitan",
      originalPrice: 10.00
    },
    3: {
      name: "Daiquiri",
      originalPrice: 10.00
    },
    4: {
      name: "Gin & Tonic",
      originalPrice: 10.00
    },
    5: {
      name: "Long Island Ice Tea",
      originalPrice: 10.00
    },
    6: {
      name: "Margarita",
      originalPrice: 10.00
    },
    7: {
      name: "Mojito",
      originalPrice: 10.00
    },
    8: {
      name: "Pina Colada",
      originalPrice: 10.00
    },
    9: {
      name: "Tequila Sunrise",
      originalPrice: 10.00
    },
    10: {
      name: "Whiskey Sour",
      originalPrice: 10.00
    }
  };

  let time = {};
  const timer = {
    text: '',
    originalFontSize: 0
  };
  const timerIncrement = {
    minutes: 0,
    seconds: 5
  };
  const maxPercentage = 25;
  const maxCocktails = Object.keys(COCKTAILS).length;
  const priceyCocktailAmount = Math.floor(maxCocktails * 0.2); //20% of the cocktails will be more expensive
  const cocktailInfoMap = {};
  let chart1;
  let chart2;

  currentTime();
  populateTime();
  calculateDiscounts(COCKTAILS);
  populateDOM(cocktailInfoMap);

  chart1 = createChart1();
  // chart2 = createChart2();

  updateFrequency(timerIncrement.minutes, timerIncrement.seconds);

  function update() {
    calculateDiscounts(COCKTAILS);
    updateDOM(cocktailInfoMap);
    updateChart(chart1, dataset => {
      dataset.data = Object.values(cocktailInfoMap).map(el => el.currentPrice);
    });
    // updateChart(chart2, dataset => {
    //   if (dataset.label === 'Current Price') {
    //     dataset.data = Object.values(cocktailInfoMap).map(el => el.currentPrice);
    //   }

    //   if (dataset.label === 'Previous Price') {
    //     dataset.data = Object.values(cocktailInfoMap).map(el => el.previousPrice);
    //   }
    // });
  }

  function updateChart(chart, callback) {
    chart.data.datasets.forEach(callback);
    chart.update();
  }

  function updateFrequency(minutes, seconds) {
    setInterval(function(){
      currentTime();
      populateTime();

      const { mm, ss } = time;

      if (seconds !== 0) {
        if (!(ss % seconds)) {
          update();
        }
      } else {
        if (!(mm % minutes) && ss === 0) {
          update();
        }
      }
    }, 1000);
  }

  function rng(maxNum) {
    return Math.ceil(Math.random() * maxNum); 
  }

  function calculateDiscounts(drinks) {
    const priceyCocktailSet = new Set();

    while (priceyCocktailSet.size < priceyCocktailAmount) {
      const currentNumber = rng(maxCocktails);

      if (priceyCocktailSet.size === 0 || !priceyCocktailSet.has(currentNumber)) {
        priceyCocktailSet.add(currentNumber);
      }
    }

    for (let i = 1; i <= maxCocktails; i++) {
        const currentDrink = drinks[i];
        const diffTotalPercent = priceyCocktailSet.has(i) ? rng(maxPercentage) : -Math.abs(rng(maxPercentage));
        const diffTotal = Math.round((currentDrink.originalPrice * diffTotalPercent / 100) / 0.5) * 0.5;
        const previousPrice = Number(cocktailInfoMap[i] ? cocktailInfoMap[i].currentPrice : currentDrink.originalPrice);
        const currentPrice = currentDrink.originalPrice + diffTotal;
        const diffTotalRoundedPercent = currentPrice * 100 / currentDrink.originalPrice - 100;
        const diffLastPrice = currentPrice - previousPrice;
        const diffLastPricePercent = calculatePercentage(currentPrice, previousPrice);

      cocktailInfoMap[i] = {
        name: drinks[i].name,
        currentPrice: decimalConversion(currentPrice, false),
        originalPrice: decimalConversion(drinks[i].originalPrice, false),
        previousPrice: decimalConversion(previousPrice, false),
        symbol: symbolToggle(diffLastPrice),
        diffLastPrice: decimalConversion( diffLastPrice),
        diffLastPricePercent: decimalConversion(diffLastPricePercent),
        diffTotal: decimalConversion(diffTotal),
        diffTotalPercent: decimalConversion(diffTotalPercent),
        diffTotalRoundedPercent: decimalConversion(diffTotalRoundedPercent)
      }
    }
  }

  function symbolToggle(cost) {
    return cost > 0 ? '\u25b2' : cost < 0 ? '\u25bc' : '';
  }

  function populateDOM(cocktailMap) {
    const table = document.getElementById("tbody");

    for (let i in cocktailMap) {
      const newRow = document.createElement("tr");
      newRow.setAttribute("id", i);

      for (let j in cocktailMap[i]) {
        if (!(j == 'previousPrice' || j == 'diffTotalPercent')) {
          if (j === 'name') {
            const cell = document.createElement("th");
            cell.innerHTML = cocktailMap[i][j];
            cell.setAttribute("class", "text-start");
            newRow.appendChild(cell);
          } else {
            const cell = document.createElement("td");
            cell.innerHTML = cocktailMap[i][j];

            if (j === 'symbol') {
              if (cocktailMap[i][j] === '\u25b2') {
                cell.setAttribute("class", "text-end text-danger");
              }

              if (cocktailMap[i][j] === '\u25bc') {
                cell.setAttribute("class", "text-end text-success");
              }
            } else if (j === 'diffLastPricePercent' ||
                       j === 'diffTotal' ||
                       j === 'diffTotalRoundedPercent') {
              cell.setAttribute("class", "text-end d-none d-sm-table-cell");
            } else {
              cell.setAttribute("class", "text-end");
            }

            newRow.appendChild(cell);
          }
        }
      }

      table.appendChild(newRow);
    }
  }

  function updateDOM(cocktailMap) {
    const numMap = {
      0: 'name',
      1: 'currentPrice',
      2: 'originalPrice',
      3: 'symbol',
      4: 'diffLastPrice',
      5: 'diffLastPricePercent',
      6: 'diffTotal',
      7: 'diffTotalRoundedPercent',
    };

    for (let i = 1; i <= maxCocktails; i++) {
      const currentRow = document.getElementById(i);
      const children = currentRow.children;

      for (let j = 0; j < children.length; j++) {
        const currentChild = children[j];

        if (numMap[j] === 'symbol') {
          if (cocktailMap[i][numMap[j]] === '\u25b2') {
            currentChild.setAttribute("class", "text-end text-danger");
          } else if (cocktailMap[i][numMap[j]] === '\u25bc') {
            currentChild.setAttribute("class", "text-end text-success");
          } else {
            currentChild.removeAttribute("class");
          }
        }
        
        currentChild.innerHTML = cocktailMap[i][numMap[j]];
      }
    }
  }

  function calculatePercentage(newPrice, oldPrice) {
    const percent = newPrice * 100 / oldPrice - 100;
    return newPrice > oldPrice? percent : -Math.abs(percent);
  }

  function decimalConversion(number, prefix = true) {
    if (!prefix) {
      return number.toFixed(2);
    }

    return number >= 0 ? '+' + number.toFixed(2) : number.toFixed(2);
  }

  function digitConversion(digit) {
    return (digit < 10) ? '0' + digit : digit;
  }

  function currentTime() {
    const dayList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthList = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const newDate = new Date();

    time = {
      hh: newDate.getHours(),
      mm: newDate.getMinutes(),
      ss: newDate.getSeconds(),
      meridiem: 'AM',
      day: dayList[newDate.getDay()],
      date: newDate.getDate(),
      month: monthList[newDate.getMonth()],
      year: newDate.getFullYear(),
    }
  }

  function populateTime() {
    let {hh, mm, ss, meridiem} = time;

    if (hh === 0) {
      hh = 12;
    } else if (hh >= 12){
      if (hh > 12) {
        hh = hh - 12;
      }

      meridiem = 'PM';
    }

    mm = digitConversion(mm);
    ss = digitConversion(ss);

    document.getElementById('clock-time').innerText = `${hh}:${mm}:${ss} ${meridiem}`;
    document.getElementById('clock-date').innerText =
    `${time.day}, ${time.month} ${time.date}, ${time.year}`;

    populateTimer(mm, ss);
  }

  function populateTimer(minutes, seconds) {
    let timerMinutes;
    let timerSeconds;
    const timerElement = document.getElementById('timer');

    if (timerIncrement.minutes === 0) {
      timerMinutes = 0;
    } else {
      timerMinutes = (59 - minutes) % timerIncrement.minutes;
    }

    if (timerIncrement.seconds === 0) {
      timerSeconds = 59 - seconds;
    } else {
      timerSeconds = (59 - seconds) % timerIncrement.seconds;
    }

    timerMinutes = digitConversion(timerMinutes);
    timerSeconds = digitConversion(timerSeconds);
    
    timer.text = `${timerMinutes}:${timerSeconds}`;
    timerElement.innerText = timer.text;
  }

  // CHART.JS API
  function createChart1() {
    const ctx = document.getElementById('myChart1').getContext('2d');

    Chart.defaults.borderColor = '#242832';
    Chart.defaults.color = '#d1d4dc'; // default text color

    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Object.values(cocktailInfoMap).map(el => el.name),
        datasets: [{
          label: 'Current Price',
          data: Object.values(cocktailInfoMap).map(el => el.currentPrice),
          borderColor: '#f23645',
          borderWidth: 10,
          radius: 0, // changes size of little circles in chart
          
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          x: {
            ticks: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            min: 7, // lowest point of chart
            max: 13, // highest point of chart
            ticks: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    return newChart;
  }

  function createChart2() {
    const ctx = document.getElementById('myChart2').getContext('2d');

    Chart.defaults.borderColor = '#242832';
    Chart.defaults.color = '#d1d4dc'; // default text color

    const newChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Object.values(cocktailInfoMap).map(el => el.name),
        datasets: [
          {
            label: 'Original Price',
            data: Object.values(cocktailInfoMap).map(el => el.originalPrice),
            backgroundColor: '#823539',
            borderColor: '#823539',
            fill: false,
          },
          {
            label: 'Previous Price',
            data: Object.values(cocktailInfoMap).map(el => el.previousPrice),
            backgroundColor: '#2956c7',
            borderColor: '#2956c7',
            fill: false,
          },
          {
            label: 'Current Price',
            data: Object.values(cocktailInfoMap).map(el => el.currentPrice),
            backgroundColor: '#1c5e5e',
            borderColor: '#1c5e5e',
            fill: false,
          },
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: false,
            ticks: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            stacked: false,
            ticks: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });

    return newChart;
  }
})();