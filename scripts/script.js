// https://www.cheapshark.com/api/1.0
// https://www.cheapshark.com/api/1.0/deals
// https://www.cheapshark.com/api/1.0/games
// https://api.ratesapi.io/api/latest?base=USD

// Cache selectors
const form = document.getElementById('form');
const gamesList = document.getElementById('gamesList');
const searchTitle = document.getElementById('searchTitle');

const baseURL = new URL('https://www.cheapshark.com/api/1.0/deals');
baseURL.search = new URLSearchParams({
    storeID: '1, 7',
    title: searchTitle.value,
    sortBy: 'Title'
  });


// Create namespace object
const app = {};

// Add event listeners
app.init = () => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    app.getRandomGames();
  });

}

// Function to call API to get random games
app.getRandomGames = (title) => {
  console.log(title);
  baseURL.searchParams.set('title', searchTitle.value);
  // baseURL.searchParams.set('onSale', 1);
  fetch(baseURL)
    .then(response => response.json())
    .then(data => {
      const returnedList = data;
      console.log(returnedList);
      getData(returnedList);
    });

    const getData = (list) => {
      console.log(list);
      gamesList.innerHTML = '';

      let finalGames = [];
      
      const getGamePrices = (array) => {
        // Initialize current empty game object
        let currentGame = {};
        // Bring in first game in array
        array.forEach((game, index) => {
          const { title, normalPrice, salePrice, savings } = game;
          // Initialize currentGame with first object so empty object does not get pushed
          if (!index) {
            currentGame = { ...game }
            console.log(currentGame);
          } else
            // If game title matches current game title, pull out price and set to object
            if (currentGame.title === title) {
              currentGame.price2 = salePrice;
              console.log(currentGame);
            } else
              // If game title does not match current game title, push object to final array and reset current object
              if (currentGame.title !== title) {
                finalGames.push(currentGame);
                console.log({ finalGames });
                currentGame = { ...game };
              }
        });
        // Push final currentGame object at end of loop
        finalGames.push(currentGame);
        console.log(finalGames);
      }

      getGamePrices(list);
      
      finalGames.forEach(deal => {
        const listItem = document.createElement('li');
        const {
          title,
          normalPrice,
          salePrice,
          savings,
          price2
        } = deal;
        listItem.textContent = `${title} --> MSRP: $${normalPrice}, Sale: $${salePrice}, ${price2 === undefined || price2 === `` ? `` : `Sale2: $${price2}`} (-${Math.trunc(savings)}%)`;
        gamesList.appendChild(listItem);
      });
      
      
      
      
    }
  
    // setTimeout(getData(returnedList), 2000);
  }



// Function to render results to the DOM

// Helper function to convert currency





app.init();