from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from student.cv_analysis import analyze_cv_with_llama


class CVAnalysisView(APIView):
    """
    API endpoint for CV analysis using LLaMA 2
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        """
        Upload a CV PDF and get AI-powered analysis
        """
        if 'cv_file' not in request.FILES:
            return Response(
                {'error': 'No CV file provided. Please upload a PDF file.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cv_file = request.FILES['cv_file']
        
        # Validate file type
        if not cv_file.name.endswith('.pdf'):
            return Response(
                {'error': 'Only PDF files are supported'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 10MB)
        if cv_file.size > 10 * 1024 * 1024:
            return Response(
                {'error': 'File too large. Maximum size is 10MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Analyze the CV
        result = analyze_cv_with_llama(cv_file)
        
        if 'error' in result:
            return Response(
                {
                    'error': result['error'],
                    'message': 'CV analysis failed. Please check configuration.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'success': True,
            'analysis': {
                'keep': result['keep'],
                'remove': result['remove'],
                'improve': result['improve']
            },
            'raw_analysis': result.get('raw_analysis', {}),
            'message': 'CV analyzed successfully'
        }, status=status.HTTP_200_OK)
