"""
AI-based matching system for internship applications
Analyzes how well a student's profile matches a job offer
"""

import os
import tempfile
import requests
from langchain_community.document_loaders import PyPDFLoader
import re


def calculate_match_score(application):
    """
    Calculate how well a student matches an internship offer using AI
    Returns match_score (0-100) and detailed analysis
    """
    try:
        groq_api_key = os.environ.get('GROQ_API_KEY')
        
        if not groq_api_key:
            return {
                'score': None,
                'analysis': 'GROQ_API_KEY not configured',
                'error': True
            }
        
        # Extract CV text if file exists
        cv_text = ""
        if application.cv_file:
            try:
                cv_path = application.cv_file.path
                loader = PyPDFLoader(cv_path)
                documents = loader.load()
                cv_text = "\n".join([doc.page_content for doc in documents])
                cv_text = cv_text[:4000]  # Limit text size
            except Exception as e:
                print(f"Error reading CV: {e}")
                cv_text = "[CV file could not be read]"
        
        # Build applicant profile
        student = application.student
        applicant_profile = f"""
STUDENT INFORMATION:
- Name: {student.first_name} {student.last_name}
- Email: {student.email}
- Phone: {student.phone or 'Not provided'}

COVER LETTER:
{application.cover_letter or 'No cover letter provided'}

CV CONTENT:
{cv_text if cv_text else 'No CV uploaded'}
"""
        
        # Build job requirements
        offer = application.offer
        
        # Parse skills from requirements if comma-separated
        required_skills = []
        if offer.requirements:
            required_skills = [skill.strip() for skill in offer.requirements.split(',')]
        
        skills_section = ""
        if required_skills:
            skills_section = f"""
REQUIRED SKILLS (Priority):
{chr(10).join([f'- {skill}' for skill in required_skills])}
"""
        
        job_requirements = f"""
JOB TITLE: {offer.title}

COMPANY: {offer.company.first_name or offer.company.username}

DESCRIPTION:
{offer.description}

{skills_section}

ADDITIONAL REQUIREMENTS:
{offer.requirements if offer.requirements else 'No additional requirements listed'}

TYPE: {offer.type}
LOCATION: {offer.location or 'Not specified'}
DURATION: {offer.duration or 'Not specified'}
START DATE: {offer.start_date}
END DATE: {offer.end_date}
"""
        
        # Call Groq API for matching analysis
        prompt = f"""You are an expert HR recruiter. Analyze how well this applicant matches the job requirements, with SPECIAL FOCUS on the required skills.

{job_requirements}

---

{applicant_profile}

Provide your analysis in EXACTLY this format:

MATCH SCORE: [number between 0-100]

SKILLS MATCH:
- [For each required skill, state if the candidate has it and provide evidence from their CV]

STRENGTHS:
- [Specific strength 1]
- [Specific strength 2]
- [Specific strength 3]

GAPS:
- [Missing skill or requirement 1]
- [Missing skill or requirement 2]

RECOMMENDATION:
[Brief recommendation: Strong Match / Good Match / Moderate Match / Weak Match / Not Recommended]

Be specific and reference actual content from both the CV and job requirements."""

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert HR recruiter who analyzes candidate-job matches with emphasis on skills matching. Provide scores from 0-100 where skills are heavily weighted."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.5,
                "max_tokens": 800
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            analysis_text = result['choices'][0]['message']['content']
            
            # Extract match score from response
            score_match = re.search(r'MATCH SCORE:\s*(\d+)', analysis_text)
            match_score = int(score_match.group(1)) if score_match else 50
            
            # Ensure score is between 0-100
            match_score = max(0, min(100, match_score))
            
            return {
                'score': match_score,
                'analysis': analysis_text,
                'error': False
            }
        else:
            return {
                'score': None,
                'analysis': f'API Error: {response.status_code}',
                'error': True
            }
            
    except Exception as e:
        print(f"Error calculating match score: {e}")
        return {
            'score': None,
            'analysis': f'Error: {str(e)}',
            'error': True
        }


def batch_calculate_matches(applications):
    """
    Calculate match scores for multiple applications
    Useful for analyzing all applicants to an offer
    """
    results = []
    for application in applications:
        match_result = calculate_match_score(application)
        results.append({
            'application_id': application.id,
            'student_name': f"{application.student.first_name} {application.student.last_name}",
            'match_score': match_result['score'],
            'analysis': match_result['analysis']
        })
    
    # Sort by match score (highest first)
    results.sort(key=lambda x: x['match_score'] or 0, reverse=True)
    return results
