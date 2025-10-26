from fsrs import Scheduler, Card, Rating, ReviewLog
from datetime import datetime
from pytz import timezone
import requests

'''
Create a function that creates 10 cards (all are automatically due).
Create another functon that receives a JSON from the frontend input form, it also takes the 10 created cards as arguments.

ARGS: frontend JSON, 10 cards
--> this JSON will only contain 10 ratings. Nothing more.
ex. if on card 1 the user clicks again, the JSON will only have:
{
    {
        rating: "again"
    },
    and so on...
}

then this function reads the ratings from the JSON and assigns each created card that rating. 
RETURN: due times for each card in JSON format. 
This data will be parsed by the JavaScript code to assign each card a due date. Now that's a question for you to figure out:
1. How will you show the cards only after that much time has passed, ex. 10 mins?
possible solution: https://javascript.info/settimeout-setinterval
First you will save the received JSON. Then you will create a function that gets the current datetime and you subtract the JSON due datetime
from it to give you a value in seconds. Then you simply save that seconds value in an array and set a timeout for a particular card.
Of course, create card will be a separate function that is timed out. 

The function should be async.

This is too much speculation. Grab a pen and paper.
'''

def review_cards_and_return_due(id, current_due, user_review):
    """ 
    Args: Raw request.data fields 
    Returns: new due datetime for the selected card
    """

    scheduler = Scheduler()
    now = datetime.now(tz=timezone('UTC'))
    current_card = Card(card_id=id, due=current_due)

    ratings_map = {
        "Again": Rating.Again,
        "Hard": Rating.Hard,
        "Good": Rating.Good,
        "Easy": Rating.Easy,
    }

    if user_review is not None:
        rating = ratings_map[user_review]
    else:
        rating = ratings_map['Again']

    reviewed_card, review_log = scheduler.review_card(current_card, rating)
    due = reviewed_card.due
    return due

# time_delta = due - datetime.now(timezone.utc)
