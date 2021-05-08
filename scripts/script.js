// Cache selectors
const backToTop = document.getElementById('backToTop');
const currencyInput = document.querySelectorAll('.currency');
const errorMessage = document.getElementById('errorMessage');
const form = document.getElementById('form');
const gamesList = document.getElementById('gamesList');
const loadMoreButton = document.getElementById('loadMore');
const modal = document.getElementById('modal');
const nav = document.querySelector('.nav-links li a');
const navFlags = document.querySelector('.nav-flags');
const searchTitle = document.getElementById('searchTitle');
const table = document.querySelector('table');

// Base URLs
const baseURL = new URL('https://www.cheapshark.com/api/1.0/deals');
baseURL.search = new URLSearchParams({
  storeID: '1, 7',
  sortBy: 'Title',
});
const currencyURL = new URL('https://api.ratesapi.io/api/latest');
currencyURL.search = new URLSearchParams({
  base: 'USD',
});

// Create namespace object
const app = {};

// Stores current page search of API call
app.currentSearchPage = 0;
// saved default variable (to aid in searches)
app.savedCurrency = 1;

// Stores the exchange rates
app.currencies = {
  usd: 1
}

// Store IDs used for filtering
app.storeIDs = {
  '1': 'steam',
  '7': 'gog'
}

// Toggle Flags function
app.toggleFlags = () => {
  nav.addEventListener('click', () => {
    navFlags.classList.toggle('flags-toggle');
  })
}

// Loading modal function
app.showModal = () => {
  modal.classList.toggle('invisible');
}

// Add event listeners
app.init = () => {
  app.getCurrencyRates('USD');
  app.toggleFlags();
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    app.lastGameSearched = searchTitle.value;
    app.currentSearchPage = 0
    app.getRandomGames(app.lastGameSearched, app.currentSearchPage);
  });

  loadMoreButton.addEventListener('click', (event) => {
    event.preventDefault();

    app.currentSearchPage += 1;
    app.getRandomGames(app.lastGameSearched, app.currentSearchPage);
  });
}


// fetches exchange rate from the API compared against USD and stores into an object 
app.getCurrencyRates = (rate) => {
  fetch(currencyURL)
    .then((response) => response.json())
    .then((jsonResponse) => {
      const getRatesData = jsonResponse;

      app.currencies.euro = getRatesData.rates['EUR'];
      app.currencies.cad = getRatesData.rates['CAD'];

      app.currencies.euro = app.cacheMoney(app.currencies.euro);
      app.currencies.cad = app.cacheMoney(app.currencies.cad);
    })
}
// Convert the exchange rates to 2 decimal spaces
app.cacheMoney = (rate) => {
  return Number(rate.toFixed(2));
}


// Function to fetch API using updated user params, and get games on Submit
app.getRandomGames = (titleToSearch, searchResultsPage) => {
  // Clear error message from window
  errorMessage.classList.add('invisible');
  loadMoreButton.classList.add('invisible');
  // Resets Search Params on every Submit request
  baseURL.searchParams.set('title', titleToSearch);
  baseURL.searchParams.set('pageNumber', searchResultsPage);
  fetch(baseURL)
    .then(response => response.json())
    .then(data => {
      app.returnedList = data;
      if (app.returnedList.length === 0) {
        app.displayError();
      } else {
        app.selectExchangeRate();
      }
    });

  app.showModal();

  if (!table.classList.contains('invisible')) {
    table.classList.add('invisible');
    backToTop.classList.add('invisible');
  }
}

app.selectExchangeRate = () => {
  // Setting default parameter for the initial game search 
  app.getGamePrices(app.returnedList, app.savedCurrency);

  // Event listener applied to flags. Allows for easy currency changes and saves selected currency for future search
  currencyInput.forEach(flag => {
    flag.addEventListener('click', () => {
      // update prices in real time
      app.getGamePrices(app.returnedList, app.currencies[flag.id]);
      app.savedCurrency = app.currencies[flag.id];
  
      navFlags.classList.toggle('flags-toggle');
    })
    // Adding same function for keyboard accessibility
    flag.addEventListener('keyup', (event) => {
      // update prices in real time
      if (event.keyCode === 13) {
        app.getGamePrices(app.returnedList, app.currencies[flag.id]);
        app.savedCurrency = app.currencies[flag.id];
        
        navFlags.classList.toggle('flags-toggle');
      }
    })
  });
}

// Builds Array of filtered Games and grabs their prices
app.getGamePrices = (array, exchangeRate) => {
  // Initialize current empty game object
  let finalGames = [];
  let currentGame = {};


  // Bring in first game in array
  array.forEach((game, index) => {
    const { title, salePrice } = game;

    // Check if game listing is from Steam or GoG, assign price, ID and savings to unique variables
    const updatePrices = function () {
      if (game.storeID === '1') {
        currentGame.steamPrice = (salePrice * exchangeRate).toFixed(2);
        currentGame.steamID = game.dealID;
        currentGame.steamSavings = game.savings;
      } else {
        currentGame.gogPrice = (salePrice * exchangeRate).toFixed(2);
        currentGame.gogID = game.dealID;
        currentGame.gogSavings = game.savings;
      }
    };

    // Initialize currentGame with first object so empty object does not get pushed
    if (!index) {
      currentGame = { ...game }
      currentGame.normalPrice = (currentGame.normalPrice * exchangeRate).toFixed(2);
      updatePrices();
      // If next game in array is same title, add game's price to currentGame object
    } else if (currentGame.title === title) {
      updatePrices();
      // If next game in array is different game, push currentGame object to finalGames array 
    } else if (currentGame.title !== title) {
      finalGames.push(currentGame);
      currentGame = { ...game };
      currentGame.normalPrice = (currentGame.normalPrice * exchangeRate).toFixed(2);
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
  } else if (savings == 0) {
    return;
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
  gamesList.replaceChildren();
  gamesArray.forEach(deal => {
    const tableRow = document.createElement('tr');

    const {
      title,
      normalPrice,
      gogPrice,
      steamPrice,
      gogID,
      steamID,
      gogSavings,
      steamSavings
    } = deal;

    // Re-format the variable to remove decimals
    steamDiscount = Number(steamSavings).toFixed(0);
    gogDiscount = Number(gogSavings).toFixed(0);

    tableRow.innerHTML = `
      <td><div class="gameCover"><img src="${deal.thumb}" alt="Cover art for ${title}"></div></td>
      <td>${title}</td>
      <td>$${normalPrice}</td>
      <td><a href="https://www.cheapshark.com/redirect?dealID=${steamID}" savings="-${steamDiscount}%" class="storeLink ${app.getDiscount(steamSavings)}" target="_blank">$${steamPrice}</a></td>
      <td><a href="https://www.cheapshark.com/redirect?dealID=${gogID}" savings="-${gogDiscount}%" class="storeLink ${app.getDiscount(gogSavings)}" target="_blank">$${gogPrice}</a></td>
      `
    gamesList.appendChild(tableRow);
  });

  table.classList.remove('invisible');
  backToTop.classList.remove('invisible');
  modal.classList.add('invisible');
  // app.showModal();

  // Check if API call returned full page of data, if so make LOAD MORE RESULTS visible
  if (app.returnedList.length === 60) {
    loadMoreButton.classList.remove('invisible');
    searchTitle.value = app.lastGameSearched;
  } else {
    loadMoreButton.classList.add('invisible');
    searchTitle.value = '';
  }
}

// If API promise is not fulfilled, remove loading modal and display error message
app.displayError = () => {
  app.showModal();
  loadMoreButton.classList.add('invisible');
  errorMessage.classList.remove('invisible');
}


app.init();
