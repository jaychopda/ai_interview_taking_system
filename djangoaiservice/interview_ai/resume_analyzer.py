import PyPDF2
import docx
import google.generativeai as genai
import re
import os
import json


class ResumeAnalyzer:
    def __init__(self):
        # Configure Gemini
        api_key = os.getenv("GEMINI_API_KEY", "AIzaSyBsroOlIDtMUcn0Z7n-BjKQGR6KhdgI44E")
        try:
            genai.configure(api_key=api_key)
        except Exception as e:
            print("Gemini configure failed:", e)

        self.model = genai.GenerativeModel(
            "gemini-1.5-flash"
        )

    def extract_pdf_text(self, pdf_file):
        """Extract text from PDF file"""
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            return "".join([page.extract_text() or "" for page in pdf_reader.pages])
        except Exception as e:
            print("PDF extract error:", e)
            return ""

    def extract_docx_text(self, docx_file):
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(docx_file)
            return "\n".join([p.text for p in doc.paragraphs])
        except Exception as e:
            print("DOCX extract error:", e)
            return ""

    def analyze_with_gemini(self, resume_text):
        """Analyze resume using Gemini AI"""

        system_instruction = """
        You are a resume analyzer.
        ⚠️ IMPORTANT: Only return valid JSON. No explanations, no extra text.
        Required JSON schema:
        {
          "name": string or null,
          "email": string or null,
          "phone": string or null,
          "experience_years": string,
          "skills": [string],
          "education": string or null,
          "previous_roles": [string],
          "key_projects": [string],
          "summary": string
        }
        """

        prompt = f"Resume Text:\n{(resume_text or '')[:6000]}"

        def _default():
            return {
                "name": None,
                "email": None,
                "phone": None,
                "experience_years": "0-1",
                "skills": [],
                "education": None,
                "previous_roles": [],
                "key_projects": [],
                "summary": "Resume analysis failed"
            }

        try:
            response = self.model.generate_content(
                [system_instruction, prompt]
            )

            # ✅ Extract raw output
            raw = ""
            if response and response.candidates:
                parts = response.candidates[0].content.parts
                if parts and hasattr(parts[0], "text"):
                    raw = parts[0].text.strip()

            if not raw:
                print("⚠ No response from Gemini")
                return _default()

            # Debugging output (optional)
            # print("RAW RESPONSE:", raw)

            # ✅ Try parsing JSON strictly
            data = None
            try:
                data = json.loads(raw)
            except Exception:
                # Look for JSON in ``` blocks
                match = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw, re.IGNORECASE)
                if match:
                    try:
                        data = json.loads(match.group(1).strip())
                    except Exception:
                        pass

            # If still not JSON, try substring between first { and last }
            if data is None:
                start, end = raw.find("{"), raw.rfind("}")
                if start != -1 and end != -1:
                    snippet = raw[start:end + 1]
                    try:
                        data = json.loads(snippet)
                    except Exception:
                        pass

            # Final fallback → regex-based parsing
            if not isinstance(data, dict):
                text = resume_text or ""
                email_match = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
                phone_match = re.search(r"(\+?\d[\d\s\-()]{8,})", text)
                skills = []
                mskills = re.search(r"(?i)skills\s*[:\-]?\s*(.+)", text)
                if mskills:
                    skills = [s.strip() for s in re.split(r"[;,\n]", mskills.group(1)) if s.strip()]
                summary_lines = [s.strip() for s in text.strip().splitlines() if s.strip()][:3]
                summary_txt = (" ".join(summary_lines))[:300] if summary_lines else "Resume parsed"

                data = {
                    "name": None,
                    "email": email_match.group(0) if email_match else None,
                    "phone": phone_match.group(0) if phone_match else None,
                    "experience_years": "0-1",
                    "skills": skills,
                    "education": None,
                    "previous_roles": [],
                    "key_projects": [],
                    "summary": summary_txt
                }

            # Ensure schema keys exist
            for key in [
                "name", "email", "phone", "experience_years", "skills",
                "education", "previous_roles", "key_projects", "summary"
            ]:
                data.setdefault(key, None)

            if data["skills"] is None:
                data["skills"] = []
            if data["previous_roles"] is None:
                data["previous_roles"] = []
            if data["key_projects"] is None:
                data["key_projects"] = []

            return data

        except Exception as e:
            print("Gemini error:", e)
            return _default()
