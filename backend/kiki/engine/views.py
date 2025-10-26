from rest_framework import generics
from .serializers import CardSerializer, PreferencesSerializer, ReviewSerializer
from .models import Card, Preferences
from . import pipeline, fsrs_algo

class CardListView(generics.ListAPIView):
    """
    API endpoint that allows cards to be viewed.
    """
    queryset = Card.objects.all()
    serializer_class = CardSerializer

    def get_queryset(self):
        return Card.objects.order_by('card_id')

# class CardUpdateView(generics.UpdateAPIView):
#     """
#     API endpoint that allows cards to be edited. Will be used for adding due dates.
#     """
#     queryset = Card.objects.all()
#     serializer_class = CardSerializer

class CardCreateView(generics.CreateAPIView):
    """
    API endpoint that allows creation of new cards. If 'due' is none, it's automatically set as datetime.now().
    """
    queryset = Card.objects.all()
    serializer_class = CardSerializer


class UserResponseView(generics.ListCreateAPIView):
    """
    API endpoint that allows POST for getting user responses from the frontend and GET for getting those user responses via a
    native python client. This will be used to prompt Gemini about the user's preferences.
    """
    queryset = Preferences.objects.all()
    serializer_class = PreferencesSerializer
    
    def post(self, request, *args, **kwargs):
        topic = request.data["topic"]
        context = request.data["context"]
        goal = request.data["goal"]

        script_for_audio = pipeline.get_lesson_script(topic, context, goal)
        pipeline.generate_audio_lesson_from_script(script_for_audio)
        pipeline.get_flashcards_and_post_to_endpoint(topic, context, goal)

        return self.create(request, *args, **kwargs)

class UserReviewView(generics.UpdateAPIView):
    """
    API endpoint that allows PUT for getting user review values (again, hard, good, easy) from the frontend for each card. 
    """
    queryset = Card.objects.all()
    serializer_class = ReviewSerializer

    def put(self, request, *args, **kwargs):

        print(request.data)
        card_id = request.data['card_id']
        user_review = request.data['user_review']

        if 'due' in request.data:
            current_due = request.data['due']
            due_datetime = fsrs_algo.review_cards_and_return_due(card_id, current_due, user_review)
            request.data['due'] = due_datetime

        return self.update(request, *args, **kwargs)

# Then, a native python client will be used to GET those retention values to run the algorithm through them to PUT new due datetimes.