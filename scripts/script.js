// https://www.cheapshark.com/api/1.0
// https://www.cheapshark.com/api/1.0/deals
// https://www.cheapshark.com/api/1.0/games
// https://api.ratesapi.io/api/latest?base=USD

// Cache selectors
const form = document.getElementById('form');
const gamesList = document.getElementById('gamesList');
const searchTitle = document.getElementById('searchTitle');
let cadrate;

const baseURL = new URL('https://www.cheapshark.com/api/1.0/deals');
baseURL.search = new URLSearchParams({
    storeID: '1, 7',
    // title: searchTitle.value, // <--- extra code can safely delete
    // onSale: '1',
    sortBy: 'Title'
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
// ***************************** ***********     ***********      gdfgdgd * *dg* d*d d* g*df* gd       **d jojsdfgh vs fts fstuf tik  sfdts


// Function to fetch API using updtaed user params, and get games on Submit
app.getRandomGames = () => {
  // Resets Search Params on every Submit request
  baseURL.searchParams.set('title', searchTitle.value);
  // baseURL.searchParams.set('onSale', 1);
  fetch(baseURL)
    .then(response => response.json())
    .then(data => {
      const returnedList = data;
      console.log(returnedList);
      app.getData(returnedList);
    });
}

// Updates Displayed list 
app.getData = (list) => {
  // console.log(list);
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
      // Initialize currentGame with first object so empty object does not get pushed
      if (!index) {
        currentGame = { ...game }
        if (game.storeID === '1') {
          currentGame.steamPrice = (salePrice * cadrate).toFixed(2);
        } else {
          currentGame.gogPrice = (salePrice * cadrate).toFixed(2);
        }
        // console.log('INDEX:',index ,currentGame);
      } else
      // If game title matches current game title, pull out price and set to object
      if (currentGame.title === title) {
          if (game.storeID === '1') {
            currentGame.steamPrice = (salePrice * cadrate).toFixed(2);
          } else {
            currentGame.gogPrice = (salePrice * cadrate).toFixed(2);
          }
          // currentGame.price2 = salePrice;
          // console.log(currentGame);
        } else
          // If game title does not match current game title, push object to final array and reset current object
          if (currentGame.title !== title) {
            finalGames.push(currentGame);
            // console.log({ finalGames });
            currentGame = { ...game };
            if (game.storeID === '1') {
              currentGame.steamPrice = (salePrice * cadrate).toFixed(2);
            } else {
              currentGame.gogPrice = (salePrice * cadrate).toFixed(2);
            }
          }
    });
    // Push final currentGame object at end of loop
    finalGames.push(currentGame);
    // console.log(finalGames);

    app.updateData(finalGames);
}

// Create table + Appends Data
app.updateData = (gamesArray) => {
    gamesArray.forEach(deal => {
      const tableRow = document.createElement('tr');

      // const imgItem = document.createElement('img');
      // imgItem.src = deal.thumb;
      const {
        title,
        normalPrice,
        salePrice,
        savings,
        price2,
        gogPrice,
        steamPrice
      } = deal;


      tableRow.innerHTML = `
        <td><div><img src="${deal.thumb}"></div></td>
        <td>${title}</td>
        <td>Regular Price: $${normalPrice}</td>
        <td>Sale Price: $${steamPrice  || `--`}</td>
        <td>$${gogPrice || `--`}</td>
      `

      gamesList.append(tableRow);
    });
  }


// Function to render results to the DOM

// Helper function to convert currency

app.init();