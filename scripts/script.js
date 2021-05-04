// https://www.cheapshark.com/api/1.0
// https://www.cheapshark.com/api/1.0/deals
// https://www.cheapshark.com/api/1.0/games
// https://api.ratesapi.io/api/latest?base=USD

// Cache selectors
const backToTop = document.getElementById('backToTop');
const form = document.getElementById('form');
const gamesList = document.getElementById('gamesList');
const searchTitle = document.getElementById('searchTitle');
const table = document.querySelector('table');
const modal = document.getElementById('modal');
let cadrate;

const baseURL = new URL('https://www.cheapshark.com/api/1.0/deals');
baseURL.search = new URLSearchParams({
  storeID: '1, 7',
  sortBy: 'Title',
});

const currencyURL = new URL('https://api.ratesapi.io/api/latest');
currencyURL.search = new URLSearchParams({
  base: 'USD'
});


// Create namespace object
const app = {};

app.storeIDs = {
  '1': 'steam',
  '7': 'gog'
}

// Loading modal function
app.showModal = () => {
  modal.classList.remove('invisible');
}

// Add event listeners
app.init = () => {
  app.getCurrencyRates();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    app.getRandomGames();
  });

}

// Currency Converter
app.getCurrencyRates = () => {
  fetch(currencyURL)
    .then((response) => response.json())
    .then((jsonResponse) => {
      const getRatesData = jsonResponse;
      const canadianRate = getRatesData.rates['CAD'];

      cadrate = app.cacheCAD(canadianRate);
      console.log(cadrate);
    })
}

// Save the fetched Canadian exchange rate
app.cacheCAD = (cad) => {
  return Number(cad.toFixed(2));
}

// Function to fetch API using updtaed user params, and get games on Submit
app.getRandomGames = () => {
  // Resets Search Params on every Submit request
  baseURL.searchParams.set('title', searchTitle.value);
  fetch(baseURL)
    .then(response => response.json())
    .then(data => {
      const returnedList = data;
      console.log(returnedList);
      app.getData(returnedList);
    });
  app.showModal();

  if (!table.classList.contains('invisible')) {
    table.classList.add('invisible');
    backToTop.classList.add('invisible');
  }
}

// Updates Displayed list 
app.getData = (list) => {
  gamesList.innerHTML = '';

  app.getGamePrices(list);
}

// Builds Array of filtered Games and grabs their prices
app.getGamePrices = (array) => {
  // Initialize current empty game object
  let finalGames = [];
  let currentGame = {};


  // Bring in first game in array
  array.forEach((game, index) => {
    const { title, normalPrice, salePrice, savings } = game;
    currentGame.normalPrice = (currentGame.normalPrice * cadrate).toFixed(2);

    // Check if game listing is from Steam or GoG, assign price, ID and savings to unique variables
    const updatePrices = function () {
      if (game.storeID === '1') {
        currentGame.steamPrice = (salePrice * cadrate).toFixed(2);
        currentGame.steamID = game.dealID;
        currentGame.steamSavings = game.savings;
      } else {
        currentGame.gogPrice = (salePrice * cadrate).toFixed(2);
        currentGame.gogID = game.dealID;
        currentGame.gogSavings = game.savings;
      }
    };

    // Initialize currentGame with first object so empty object does not get pushed
    if (!index) {
      currentGame = { ...game }
      updatePrices();
      // If next game in array is same title, add game's price to currentGame object
    } else if (currentGame.title === title) {
      updatePrices();
      // If next game in array is different game, push currentGame object to finalGames array 
    } else if (currentGame.title !== title) {
      finalGames.push(currentGame);
      currentGame = { ...game };
      updatePrices();
    }


  });
  // Push final currentGame object at end of loop
  finalGames.push(currentGame);

  app.updateData(finalGames);
}

// Get game discount and change link background color
app.getDiscount = (savings) => {
  if (!savings) {
    return 'invisible';
  } else if (Number(savings) < 25) {
    return 'discount0';
  } else if (Number(savings) < 50) {
    return 'discount25';
  } else if (Number(savings) < 75) {
    return 'discount50';
  } else {
    return 'discount75';
  }
}

// Create table + Appends Data
app.updateData = (gamesArray) => {
  gamesArray.forEach(deal => {
    const tableRow = document.createElement('tr');

    const {
      title,
      normalPrice,
      gogPrice,
      savings,
      steamPrice,
      gogID,
      steamID,
      gogSavings,
      steamSavings
    } = deal;

    tableRow.innerHTML = `
      <td><div class="gameCover"><img src="${deal.thumb}"></div></td>
      <td>${title}</td>
      <td>$${normalPrice}</td>
      <td class="storeLink"><a href="https://www.cheapshark.com/redirect?dealID=${steamID}" class="${app.getDiscount(steamSavings)}" target="_blank">$${steamPrice || `--`}</a><span class="discountPercentage">${Number(savings).toFixed(0)}% off</span></td>
      <td><a href="https://www.cheapshark.com/redirect?dealID=${gogID}" savings="${savings}% off" class="storeLink ${app.getDiscount(gogSavings)}" target="_blank">$${gogPrice || `--`}</a></td>
      `

    gamesList.appendChild(tableRow);
  });

  searchTitle.value = '';
  table.classList.remove('invisible');
  backToTop.classList.remove('invisible');
  modal.classList.add('invisible');
}

app.init();