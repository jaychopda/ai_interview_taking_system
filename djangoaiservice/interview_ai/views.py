from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
import google.generativeai as genai
import PyPDF2
import docx
import uuid
import os
from .models import InterviewSession, Question, Answer
from .resume_analyzer import ResumeAnalyzer
from .ai_interviewer import AIInterviewer

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

@api_view(['POST'])
def analyze_resume(request):
    """Analyze uploaded resume and extract key information"""
    try:
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No file uploaded'}, status=400)

        # Initialize resume analyzer
        analyzer = ResumeAnalyzer()
        
        # Extract text from file
        if uploaded_file.name.endswith('.pdf'):
            text = analyzer.extract_pdf_text(uploaded_file)
        elif uploaded_file.name.endswith(('.doc', '.docx')):
            text = analyzer.extract_docx_text(uploaded_file)
        else:
            return Response({'error': 'Unsupported file format'}, status=400)

        # Analyze resume with Gemini AI
        analysis = analyzer.analyze_with_gemini(text)

        return Response({
            'success': True,
            'analysis': analysis,
            'extracted_text_length': len(text)
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def start_interview(request):
    """Start a new interview session"""
    try:
        data = request.data
        position = data.get('position')
        difficulty = data.get('difficulty')
        resume_data = data.get('resume_data')

        # Generate unique session ID
        session_id = str(uuid.uuid4())

        # Create interview session
        session = InterviewSession.objects.create(
            session_id=session_id,
            position=position,
            difficulty=difficulty,
            resume_analysis=resume_data or {}
        )

        # Initialize AI interviewer
        interviewer = AIInterviewer()
        
        # Generate first question
        first_question = interviewer.generate_first_question(position, difficulty, resume_data or {})

        # Save first question
        Question.objects.create(
            session=session,
            question_number=1,
            question_text=first_question['text'],
            question_type=first_question['type']
        )

        return Response({
            'success': True,
            'session_id': session_id,
            'question': first_question['text'],
            'question_type': first_question['type']
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def submit_answer(request):
    """Submit answer and get feedback + next question"""
    try:
        data = request.data
        session_id = data.get('session_id')
        answer = data.get('answer')
        question_number = data.get('question_number')

        # Get session and current question
        session = InterviewSession.objects.get(session_id=session_id)
        try:
            question_number = int(question_number)
        except Exception:
            return Response({'error': 'Invalid question_number'}, status=400)
        current_question = Question.objects.get(session=session, question_number=question_number)

        # Initialize AI interviewer
        interviewer = AIInterviewer()

        # Evaluate answer with Gemini
        evaluation = interviewer.evaluate_answer(current_question.question_text, answer, session.position)

        # Save answer and feedback
        Answer.objects.create(
            question=current_question,
            answer_text=answer,
            ai_feedback=evaluation['feedback'],
            score=float(evaluation['score'])
        )

        # Check if interview is complete
        total_questions = 5
        is_complete = question_number >= total_questions

        response_data = {
            'success': True,
            'feedback': evaluation['feedback'],
            'score': evaluation['score'],
            'question_number': question_number + 1,
            'is_complete': is_complete
        }

        if not is_complete:
            # Generate next question
            next_question = interviewer.generate_next_question(
                session, question_number + 1, answer, float(evaluation['score'])
            )
            
            # Save next question
            Question.objects.create(
                session=session,
                question_number=question_number + 1,
                question_text=next_question['text'],
                question_type=next_question['type']
            )
            
            response_data['next_question'] = next_question['text']
        else:
            # Calculate final score
            final_score = interviewer.calculate_final_score(session)
            session.final_score = final_score
            session.is_complete = True
            session.save()
            
            response_data['final_score'] = final_score

        return Response(response_data)

    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def interview_results(request, session_id):
    """Get complete interview results"""
    try:
        session = InterviewSession.objects.get(session_id=session_id)
        questions = Question.objects.filter(session=session).order_by('question_number')
        
        results = {
            'session_id': session_id,
            'position': session.position,
            'difficulty': session.difficulty,
            'final_score': session.final_score,
            'is_complete': session.is_complete,
            'created_at': session.created_at,
            'questions_and_answers': []
        }

        for question in questions:
            try:
                answer = Answer.objects.get(question=question)
                results['questions_and_answers'].append({
                    'question_number': question.question_number,
                    'question': question.question_text,
                    'question_type': question.question_type,
                    'answer': answer.answer_text,
                    'feedback': answer.ai_feedback,
                    'score': answer.score
                })
            except Answer.DoesNotExist:
                results['questions_and_answers'].append({
                    'question_number': question.question_number,
                    'question': question.question_text,
                    'question_type': question.question_type,
                    'answer': None,
                    'feedback': None,
                    'score': None
                })

        return Response(results)

    except InterviewSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
