from django.db import models
import json

class InterviewSession(models.Model):
    session_id = models.CharField(max_length=100, unique=True)
    position = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=50)
    skills = models.JSONField(default=list)
    resume_analysis = models.JSONField()
    total_questions = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)
    is_complete = models.BooleanField(default=False)
    final_score = models.FloatField(null=True, blank=True)

class Question(models.Model):
    session = models.ForeignKey(InterviewSession, on_delete=models.CASCADE)
    question_number = models.IntegerField()
    question_text = models.TextField()
    question_type = models.CharField(max_length=50)  # behavioral, technical, industry
    created_at = models.DateTimeField(auto_now_add=True)

class Answer(models.Model):
    question = models.OneToOneField(Question, on_delete=models.CASCADE)
    answer_text = models.TextField()
    ai_feedback = models.TextField()
    score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)