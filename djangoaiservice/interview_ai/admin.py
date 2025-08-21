from django.contrib import admin
from .models import InterviewSession,Question,Answer

# Register your models here.
admin.site.register(InterviewSession)
admin.site.register(Question)
admin.site.register(Answer)