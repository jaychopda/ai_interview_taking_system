import google.generativeai as genai
import random
import json
import os
import re

class AIInterviewer:
    def __init__(self):
        # Configure with environment variable
        # api_key = 'AIzaSyBsroOlIDtMUcn0Z7n-BjKQGR6KhdgI44E'
        api_key = 'AIzaSyAPCxYBsWvU1wvywinEmRHa6Vx1EF8Z3rE'
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
        
    def generate_first_question(self, position, difficulty, skills, resume_data):
        """Generate the first interview question based on position, difficulty, skills and resume"""
        
        skills_text = ", ".join(skills) if skills else "general technical skills"
        
        prompt = f"""
        You are an AI interviewer conducting a {difficulty} level interview for a {position} position.
        
        The candidate has selected to focus on these specific technical skills: {skills_text}
        
        Candidate's Resume Summary:
        {json.dumps(resume_data, indent=2)}
        
        Generate the first interview question. This should be a technical question focused on one or more of the selected skills: {skills_text}
        
        The question should be appropriate for {difficulty} level and should test the candidate's knowledge and practical experience with these specific skills.
        
        Respond with JSON format:
        {{
            "text": "the interview question",
            "type": "technical",
            "focused_skills": ["skill1", "skill2"]
        }}
        
        Make it personalized based on their resume and the selected skills, but keep it introductory and welcoming.
        """
        
        data = self._generate_json(prompt, {})
        text = data.get('text') if isinstance(data, dict) else None
        focused_skills = data.get('focused_skills', skills[:2]) if isinstance(data, dict) else skills[:2]
        
        if not text:
            # Fallback question based on selected skills
            if skills:
                skill = skills[0] if skills else "programming"
                text = f"Can you explain your experience with {skill} and how you've used it in your projects?"
            else:
                text = "Tell me about your technical background and what interests you about this position."
        
        return {"text": text, "type": "technical", "focused_skills": focused_skills}
    
    def generate_next_question(self, session, question_number, previous_answer, previous_score):
        """Generate next question based on previous answer and progress"""
        
        question_types = ["technical", "behavioral", "technical", "behavioral", "technical"]
        question_type = question_types[(question_number - 1) % 5]
        
        # Get skills from session
        skills = getattr(session, 'skills', [])
        skills_text = ", ".join(skills) if skills else "general technical skills"
        
        if question_type == "technical" and skills:
            # For technical questions, focus on the selected skills
            prompt = f"""
            You are conducting a {session.difficulty} level interview for {session.position}.
            
            This is question #{question_number} of 5.
            Previous answer score: {previous_score}/10
            Previous answer: {previous_answer}
            
            The candidate has selected to focus on these technical skills: {skills_text}
            
            Generate a technical question focused on one or more of these selected skills: {skills_text}
            The question should be appropriate for {session.difficulty} level.
            
            If the previous score was low, adjust difficulty accordingly but still focus on the selected skills.
            
            Respond with JSON format:
            {{
                "text": "the interview question",
                "type": "technical",
                "focused_skills": ["skill1", "skill2"]
            }}
            """
        else:
            # For behavioral questions, focus on general skills and experience
            prompt = f"""
            You are conducting a {session.difficulty} level interview for {session.position}.
            
            This is question #{question_number} of 5.
            Previous answer score: {previous_score}/10
            Previous answer: {previous_answer}
            
            Generate a behavioral question appropriate for this level and position.
            Focus on soft skills, problem-solving, teamwork, and real-world experience.
            
            If the previous score was low, adjust difficulty accordingly.
            
            Respond with JSON format:
            {{
                "text": "the interview question",
                "type": "behavioral"
            }}
            """
        
        data = self._generate_json(prompt, {})
        text = data.get('text') if isinstance(data, dict) else None
        focused_skills = data.get('focused_skills', skills[:2]) if isinstance(data, dict) and question_type == "technical" else []
        
        if not text:
            if question_type == "technical" and skills:
                # Fallback technical question based on selected skills
                skill = skills[(question_number - 1) % len(skills)] if skills else "programming"
                text = f"Can you describe a challenging technical problem you solved using {skill}?"
            else:
                # Fallback behavioral question
                fallback_questions = {
                    "behavioral": "Describe a challenging situation you faced and how you handled it.",
                    "technical": f"What are the key technical skills required for a {session.position}?"
                }
                text = fallback_questions.get(question_type, "Tell me about your experience in this field.")
        
        return {"text": text, "type": question_type, "focused_skills": focused_skills}
    
    def evaluate_answer(self, question, answer, position, skills=None):
        """Evaluate candidate's answer using Gemini AI"""
        
        skills_context = ""
        if skills:
            skills_context = f"\n\nFocus Areas: The candidate has selected to focus on these technical skills: {', '.join(skills)}"
        
        prompt = f"""
        You are evaluating an interview answer for a {position} position.{skills_context}
        
        Question: {question}
        Answer: {answer}
        
        Evaluate the answer on:
        1. Relevance to the question
        2. Technical accuracy (if applicable)
        3. Communication clarity
        4. Examples and evidence provided
        5. Overall quality
        
        If this is a technical question and skills are specified, pay special attention to how well the answer demonstrates knowledge of those specific skills.
        
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

    def generate_improvement_suggestions(self, session):
        """Generate overall improvement suggestions for the interview session"""
        from .models import Question, Answer

        questions = Question.objects.filter(session=session).order_by('question_number')
        qa_pairs = []
        for q in questions:
            try:
                a = Answer.objects.get(question=q)
                qa_pairs.append({
                    "question": q.question_text,
                    "answer": a.answer_text,
                    "score": a.score
                })
            except Answer.DoesNotExist:
                continue

        skills = getattr(session, 'skills', []) or []
        skills_text = ", ".join(skills) if skills else "general technical skills"

        prompt = f"""
        You are an expert interview coach. Analyze the candidate's interview performance for the position: {session.position} at {session.difficulty} level.

        Focus areas (if any): {skills_text}

        Provide constructive suggestions tailored to the candidate's answers to help them improve.

        Questions and answers (with per-question scores out of 10):
        {json.dumps(qa_pairs, indent=2)}

        Respond ONLY in JSON with the following schema:
        {{
          "suggestions": ["short actionable suggestion 1", "short actionable suggestion 2", ...],
          "overall_advice": "one short paragraph summarizing what to improve next"
        }}
        """

        default_obj = {"suggestions": [], "overall_advice": "Keep practicing and provide more specific, structured answers with measurable outcomes."}
        data = self._generate_json(prompt, default_obj)
        if not isinstance(data, dict):
            return default_obj
        if not isinstance(data.get("suggestions"), list):
            data["suggestions"] = []
        if not isinstance(data.get("overall_advice"), str):
            data["overall_advice"] = default_obj["overall_advice"]
        return data
