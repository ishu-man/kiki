// this script does these things:
/*
1. Receives the data from the backend about how many cards there are in total, in form of JSON. The JSON also includes 'front' and 'back'
2. For each card, you will first iterate through the JSON:
> Hide the again good hard easy buttons, also the next button.
> Change the textcontent of the card to the textcontent from the JSON's front.
> Add an event listener so that when the user clicks on the card, we change the card's color to neon blue and change the text content to the 'back' value of the card.
> 'next card' changes the content to next card in the JSON. 
> If all cards have been done and dusted I will create a new page which tells the user when their next set is due. THIS IS A KEY PART
OF THE PROJECT: SHOWING FSRS IN ACTION!
*/
// dummyJSON below:

const cardsURL = 'http://127.0.0.1:8000/api/';

let dummyJSON;
fetch(cardsURL, {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
    },
})
   .then(response => response.json())
   .then(JSONresponse => {
    dummyJSON = JSONresponse;
    displayCardsFromJSON(dummyJSON);
  });

const parentContainer = document.querySelector(".flashcards-container");
const flashcardFront = document.querySelector(".flashcard-front");
const optionsContainer = document.querySelector(".options-container");
const nextButton = document.querySelector(".next-button");
let backContent;

// should only be visible when card is clicked.
optionsContainer.style.display = "none";

function displayCardsFromJSON(dummyJSON) {
  let i = 0;
  let currentObject = dummyJSON[i];

  function changeCardContent(cardObject) {
      flashcardFront.textContent = cardObject.front;
      parentContainer.addEventListener("click", ()=> {
          optionsContainer.style.display = "flex";
          flashcardFront.setAttribute("class", "flashcard-back");
          flashcardFront.textContent = cardObject.back;
      });

  }

  nextButton.addEventListener("click", (event)=> {
      flashcardFront.setAttribute("class", "flashcard-front");
      optionsContainer.style.display = "none";
      if (gotoNextObject() !== 0) {
          event.preventDefault();
      }
  });

  changeCardContent(currentObject);

  function gotoNextObject () {
      if (i < dummyJSON.length) {
          currentObject = dummyJSON[i+1];
          changeCardContent(currentObject);
          i += 1;
      }
      else {
          return 0;
      }
  }

  optionsContainer.addEventListener("click", (event)=> {
      // only update the user responses JSON if the user actually clicks on an option.
      if (event.target.value !== "") {
        const currentResponse = 
        {
          "card_id": `${currentObject.card_id}`,
          "user_review": `${event.target.value}`
        };
        console.log(currentObject.card_id);
        const cardReviewURL = `${cardsURL}${currentObject.card_id}/review/`;
        PUTtoEndpoint(currentResponse, cardReviewURL);
      }
  });  
}

// WHAT IS LEFT TO DO HERE? POST the user responses JSON to the api endpoint which accepts the responeses and returns the JSON of due
// dates. Man, this project is getting kinda out of hand. I am literally juggling the frontend and the backend work. I need to have a 
// defined method. Perhaps I should get clear with the API endpoints using DRF first? All of that is a blackbox right now.

async function PUTtoEndpoint(formData, targetURL) {
    try {
    response = await fetch(targetURL, 
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData),
        });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    console.log(result);
    } catch (error) {
    console.error(error.message);
  }
}
