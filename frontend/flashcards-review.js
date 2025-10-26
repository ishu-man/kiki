const flashcardDisplay = document.querySelector(".flashcards-section");
const reviewDisplay = document.querySelector(".review-section");
const dueCards = document.querySelector(".due-cards");
flashcardDisplay.style.display = 'none';
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
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    let totalDueToday = 0;
    dueTodayJSON = [];
    const todayString = `${yyyy}-${mm}-${dd}`;

    for (object of dummyJSON) {
        const dateString = (object.due).substring(0, 10);
        if (dateString === todayString) {
            dueTodayJSON.push(object);
            totalDueToday += 1;
        }
    }

    dueCards.textContent = totalDueToday;

});





const startButton = document.querySelector(".start-review-session-button");
startButton.addEventListener("click", () => {
    fetch(cardsURL, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(response => response.json())
    .then(JSONresponse => {

        dummyJSON = JSONresponse;
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();

        let totalDueToday = 0;
        dueTodayJSON = [];
        const todayString = `${yyyy}-${mm}-${dd}`;

        for (object of dummyJSON) {
            const dateString = (object.due).substring(0, 10);
            if (dateString === todayString) {
                dueTodayJSON.push(object);
                totalDueToday += 1;
            }
        }
        displayCardsFromJSON(dueTodayJSON);
    });
    flashcardDisplay.style.display = 'flex';
    flashcardDisplay.style.flexDirection = 'column';
    reviewDisplay.style.display = 'none';
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