import google.generativeai as genai
import random
import json
import os
import re

class AIInterviewer:
    def __init__(self):
        # Configure with environment variable
        api_key = 'AIzaSyBsroOlIDtMUcn0Z7n-BjKQGR6KhdgI44E'
        if api_key:
            try:
                genai.configure(api_key=api_key)
            except Exception:
                pass
        # Use a current model and ask for JSON
        # Use a current model
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def _generate_json(self, prompt, default_obj):
        try:
            response = self.model.generate_content(prompt)
            text = getattr(response, 'text', None)
            if not text:
                # Try extracting from candidates
                try:
                    candidates = getattr(response, 'candidates', []) or []
                    if candidates:
                        parts = getattr(candidates[0].content, 'parts', []) or []
                        for part in parts:
                            part_text = getattr(part, 'text', None)
                            if part_text:
                                text = part_text
                                break
                except Exception:
                    pass
            if not text:
                # Possibly safety blocked
                pf = getattr(response, 'prompt_feedback', None)
                if pf:
                    print('Gemini prompt blocked:', pf)
                return default_obj
            raw = (text or '').strip()
            # Try direct JSON
            try:
                data = json.loads(raw)
                if isinstance(data, dict):
                    return data
            except Exception:
                pass
            # Try fenced code block ```json ... ```
            m = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw, re.IGNORECASE)
            if m:
                try:
                    data = json.loads(m.group(1).strip())
                    if isinstance(data, dict):
                        return data
                except Exception:
                    pass
            # Try to find first JSON object by braces
            start = raw.find('{')
            end = raw.rfind('}')
            if start != -1 and end != -1 and end > start:
                snippet = raw[start:end+1]
                try:
                    data = json.loads(snippet)
                    if isinstance(data, dict):
                        return data
                except Exception:
                    pass
            # Last resort: return default
            if not isinstance(data, dict):
                return default_obj
            return data
        except Exception as e:
            # Non-JSON output or transient SDK error
            print('Gemini generation error:', repr(e))
            return default_obj
        
    def generate_first_question(self, position, difficulty, resume_data):
        """Generate the first interview question based on position and resume"""
        
        prompt = f"""
        You are an AI interviewer conducting a {difficulty} level interview for a {position} position.
        
        Candidate's Resume Summary:
        {json.dumps(resume_data, indent=2)}
        
        Generate the first interview question. This should be a behavioral question to make the candidate comfortable.
        
        Respond with JSON format:
        {{
            "text": "the interview question",
            "type": "behavioral"
        }}
        
        Make it personalized based on their resume but keep it introductory and welcoming.
        """
        
        data = self._generate_json(prompt, {})
        text = data.get('text') if isinstance(data, dict) else None
        if not text:
            text = "Tell me about yourself and what interests you about this position."
        return {"text": text, "type": "behavioral"}
    
    def generate_next_question(self, session, question_number, previous_answer, previous_score):
        """Generate next question based on previous answer and progress"""
        
        question_types = ["behavioral", "technical", "industry"]
        question_type = question_types[(question_number - 1) % 3]
        
        prompt = f"""
        You are conducting a {session.difficulty} level interview for {session.position}.
        
        This is question #{question_number} of 5.
        Previous answer score: {previous_score}/10
        Previous answer: {previous_answer}
        
        Generate a {question_type} question appropriate for this level and position.
        If the previous score was low, adjust difficulty accordingly.
        
        Respond with JSON format:
        {{
            "text": "the interview question",
            "type": "{question_type}"
        }}
        """
        
        data = self._generate_json(prompt, {})
        text = data.get('text') if isinstance(data, dict) else None
        if not text:
            fallback_questions = {
                "behavioral": "Describe a challenging situation you faced and how you handled it.",
                "technical": f"What are the key technical skills required for a {session.position}?",
                "industry": f"What trends do you see in the {session.position} field?"
            }
            return {"text": fallback_questions[question_type], "type": question_type}
        return {"text": text, "type": question_type}
    
    def evaluate_answer(self, question, answer, position):
        """Evaluate candidate's answer using Gemini AI"""
        
        prompt = f"""
        You are evaluating an interview answer for a {position} position.
        
        Question: {question}
        Answer: {answer}
        
        Evaluate the answer on:
        1. Relevance to the question
        2. Technical accuracy (if applicable)
        3. Communication clarity
        4. Examples and evidence provided
        5. Overall quality
        
        Provide a score from 1-10 and constructive feedback.
        
        Respond with JSON format:
        {{
            "score": 8.5,
            "feedback": "detailed feedback on the answer with strengths and areas for improvement"
        }}
        """
        
        data = self._generate_json(prompt, {})
        score = None
        feedback = None
        if isinstance(data, dict):
            score = data.get('score')
            feedback = data.get('feedback')
        try:
            score = float(score)
        except Exception:
            score = 7.0
        if not feedback:
            feedback = "Thank you for your answer. Consider providing more specific examples to strengthen your response."
        return {"score": score, "feedback": feedback}
    
    def calculate_final_score(self, session):
        """Calculate final interview score"""
        from .models import Answer, Question
        
        questions = Question.objects.filter(session=session)
        total_score = 0
        answer_count = 0
        
        for question in questions:
            try:
                answer = Answer.objects.get(question=question)
                total_score += answer.score
                answer_count += 1
            except Answer.DoesNotExist:
                continue
        
        if answer_count == 0:
            return 0.0
        
        return round(total_score / answer_count, 2)
