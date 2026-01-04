"""
CV Analysis using FREE Groq API (LLaMA 3)
No credit card needed - completely free!
"""
import os
import tempfile
import requests
from langchain_community.document_loaders import PyPDFLoader


def analyze_cv_with_llama(cv_file):
    """
    Analyzes a CV using FREE Groq API with LLaMA 3.
    
    Args:
        cv_file: Django UploadedFile object
        
    Returns:
        dict with 'keep', 'remove', 'improve' sections
    """
    try:
        # Get Groq API key (FREE - no credit card needed)
        groq_api_key = os.environ.get('GROQ_API_KEY')
        
        if not groq_api_key:
            return {
                'error': 'GROQ_API_KEY not configured. Get free key at https://console.groq.com',
                'keep': ['Sign up at https://console.groq.com for free API key'],
                'remove': [],
                'improve': []
            }
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            for chunk in cv_file.chunks():
                tmp_file.write(chunk)
            tmp_file_path = tmp_file.name
        
        try:
            # Load and extract text from PDF
            print("📄 Loading PDF...")
            loader = PyPDFLoader(tmp_file_path)
            documents = loader.load()
            cv_text = "\n".join([doc.page_content for doc in documents])
            
            # Limit text size for API
            cv_text = cv_text[:3000]
            
            print("🤖 Analyzing with Groq LLaMA 3...")
            
            # Call Groq API with LLaMA 3
            prompt = f"""You are an expert career counselor. Analyze this CV and provide specific, actionable feedback.

CV CONTENT:
{cv_text}

Provide your analysis in exactly this format:

KEEP:
- [Specific strength 1]
- [Specific strength 2]
- [Specific strength 3]
- [Specific strength 4]
- [Specific strength 5]

REMOVE:
- [Specific weakness 1]
- [Specific weakness 2]
- [Specific weakness 3]

IMPROVE:
- [Actionable recommendation 1]
- [Actionable recommendation 2]
- [Actionable recommendation 3]
- [Actionable recommendation 4]
- [Actionable recommendation 5]

Be specific and reference actual content from the CV."""

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
                            "content": "You are an expert career counselor who provides specific, actionable CV feedback in french and give examples."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1000
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                analysis_text = result['choices'][0]['message']['content']
                
                print("✅ Analysis completed!")
                
                # Parse the response
                sections = parse_analysis_response(analysis_text)
                
                return {
                    'keep': sections['keep'],
                    'remove': sections['remove'],
                    'improve': sections['improve'],
                    'raw_analysis': {'full_text': analysis_text}
                }
            else:
                error_msg = f"Groq API error: {response.status_code}"
                if response.status_code == 401:
                    error_msg = "Invalid Groq API key. Get a free one at https://console.groq.com"
                elif response.status_code == 429:
                    error_msg = "Rate limit exceeded. Wait a minute and try again."
                elif response.status_code == 400:
                    error_msg = f"Bad request to Groq API. Details: {response.text}"
                
                print(f"❌ {error_msg}")
                print(f"Response: {response.text[:500]}")
                
                return {
                    'error': error_msg,
                    'keep': [],
                    'remove': [],
                    'improve': []
                }
                
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
                
    except Exception as e:
        print(f"💥 CV Analysis Error: {str(e)}")
        return {
            'error': str(e),
            'keep': [],
            'remove': [],
            'improve': []
        }


def parse_analysis_response(text):
    """
    Parse LLM response into structured sections.
    """
    sections = {'keep': [], 'remove': [], 'improve': []}
    current_section = None
    
    for line in text.split('\n'):
        line = line.strip()
        
        # Detect section headers
        if 'KEEP:' in line.upper():
            current_section = 'keep'
            continue
        elif 'REMOVE:' in line.upper():
            current_section = 'remove'
            continue
        elif 'IMPROVE:' in line.upper():
            current_section = 'improve'
            continue
        
        # Parse bullet points
        if line and current_section:
            if line.startswith('-') or line.startswith('•') or line.startswith('*'):
                cleaned = line.lstrip('-•* ').strip()
                if cleaned and len(cleaned) > 10:  # Ignore very short items
                    sections[current_section].append(cleaned)
            elif line[0].isdigit() and '.' in line[:3]:  # Numbered list
                cleaned = line.split('.', 1)[1].strip()
                if cleaned and len(cleaned) > 10:
                    sections[current_section].append(cleaned)
    
    # Ensure we have at least something in each section
    if not sections['keep']:
        sections['keep'] = [
            "Professional presentation and clear structure",
            "Relevant skills and experiences listed",
            "Educational background clearly stated"
        ]
    
    if not sections['remove']:
        sections['remove'] = [
            "Review for any outdated or irrelevant information",
            "Check for redundant content"
        ]
    
    if not sections['improve']:
        sections['improve'] = [
            "Add quantifiable achievements with metrics",
            "Include specific project outcomes",
            "Strengthen action verbs in experience descriptions"
        ]
    
    return sections
