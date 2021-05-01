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
    title: searchTitle.value
  });
  
  // const baseURL = new URL('https://www.cheapshark.com/api/1.0/deals');
  // const searchParams = new URLSearchParams(baseURL);

  // searchParams.set('storeID', '1, 7');


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
  // baseURL.search.set('title', title);
  fetch(baseURL)
    .then(response => response.json())
    .then(data => {
      const returnedList = data;
      console.log(returnedList);
      getData(returnedList);
    });

    const getData = (list) => {
      console.log(list);
      list.forEach(deal => {
        const listItem = document.createElement('li');
        listItem.textContent = `${deal.title}`;
        gamesList.appendChild(listItem);
      });
    }
  
    // setTimeout(getData(returnedList), 2000);
  }

   
    


// Function to render results to the DOM

// Helper function to convert currency


app.init();