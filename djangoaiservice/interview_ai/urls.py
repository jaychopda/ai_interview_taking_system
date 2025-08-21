from django.urls import path
from . import views

urlpatterns = [
    path('analyze-resume', views.analyze_resume, name='analyze_resume'),
    path('start-interview', views.start_interview, name='start_interview'),
    path('submit-answer', views.submit_answer, name='submit_answer'),
    path('interview-results/<str:session_id>', views.interview_results, name='interview_results'),
]