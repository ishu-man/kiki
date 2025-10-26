import datetime
from django.db import models

class Card(models.Model):
    """Model for a generic card object"""
    card_id = models.IntegerField(primary_key=True)
    front = models.CharField(help_text="Card's front side")
    back = models.CharField(help_text="Card's back side")
    due = models.DateTimeField(default=datetime.datetime.now(), null=True)
    user_review = models.CharField(null=True)

    def __str__(self):
        """String for representing the card object (in Admin site etc.)."""
        return self.front
    
class Preferences(models.Model):
    """Model for user's preferences about the topic they want to learn"""
    topic = models.CharField(help_text="The topic you want to learn")
    context = models.CharField(help_text="What you already know about the subject")
    goal = models.CharField(help_text="What you want to accomplish after learning the topic")