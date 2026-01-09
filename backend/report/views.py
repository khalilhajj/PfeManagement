from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q

from .models import Report, ReportVersion, ReviewComment
from report.serializer import (
    ReportSerializer,
    ReportVersionSerializer,
    ReviewCommentSerializer,
    SubmitVersionSerializer,
    ReviewVersionSerializer
)


class CreateReportView(APIView):
    """Create a new report for an internship"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=ReportSerializer,
        responses={
            201: ReportSerializer,
            400: 'Bad Request',
            403: 'Forbidden'
        }
    )
    def post(self, request):
        # Check if user is a student
        if not request.user.role or request.user.role.name != 'Student':
            return Response({
                'error': 'Only students can create reports.'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = ReportSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            report = serializer.save(student=request.user)
            return Response({
                'message': 'Report created successfully.',
                'data': ReportSerializer(report).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ListMyReportsView(APIView):
    """List all reports for the authenticated student"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        responses={
            200: ReportSerializer(many=True),
            403: 'Forbidden'
        }
    )
    def get(self, request):
        # Check if user is a student
        if not request.user.role or request.user.role.name != 'Student':
            return Response({
                'error': 'Only students can view their reports.'
            }, status=status.HTTP_403_FORBIDDEN)

        reports = Report.objects.filter(student=request.user).prefetch_related('versions')
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GetReportDetailView(APIView):
    """Get detailed information about a specific report"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description="Report ID",
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            200: ReportSerializer,
            403: 'Forbidden',
            404: 'Not Found'
        }
    )
    def get(self, request, id):
        report = get_object_or_404(Report, id=id)
        
        # Check if user has access to this report
        if request.user.role.name == 'Student':
            if report.student != request.user:
                return Response({
                    'error': 'You don\'t have access to this report.'
                }, status=status.HTTP_403_FORBIDDEN)
        elif request.user.role.name == 'Teacher':
            if report.internship.teacher_id != request.user:
                return Response({
                    'error': 'You don\'t have access to this report.'
                }, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({
                'error': 'Invalid user role.'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = ReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DeleteReportView(APIView):
    """Delete a report (only if it's a draft or has no approved versions)"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description="Report ID",
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            200: 'Report deleted successfully',
            403: 'Forbidden',
            404: 'Not Found'
        }
    )
    def delete(self, request, id):
        # Check if user is a student
        if not request.user.role or request.user.role.name != 'Student':
            return Response({
                'error': 'Only students can delete reports.'
            }, status=status.HTTP_403_FORBIDDEN)

        report = get_object_or_404(Report, id=id)
        
        # Check if student owns this report
        if report.student != request.user:
            return Response({
                'error': 'You don\'t have access to this report.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Check if report is final (prevent deletion of graded reports)
        if report.is_final:
            return Response({
                'error': 'Cannot delete a report that has been graded.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Check if any version is approved
        has_approved = report.versions.filter(status='approved').exists()
        if has_approved:
            return Response({
                'error': 'Cannot delete a report with approved versions.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Delete the report (cascade will delete versions and comments)
        report.delete()
        
        return Response({
            'message': 'Report deleted successfully.'
        }, status=status.HTTP_200_OK)


class UploadReportVersionView(APIView):
    """Upload a new version of a report"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'report_id',
                openapi.IN_PATH,
                description="Report ID",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'file',
                openapi.IN_FORM,
                description="Report file (PDF, DOC, DOCX)",
                type=openapi.TYPE_FILE,
                required=True
            )
        ],
        responses={
            201: ReportVersionSerializer,
            400: 'Bad Request',
            403: 'Forbidden',
            404: 'Not Found'
        }
    )
    def post(self, request, report_id):
        # Check if user is a student
        if not request.user.role or request.user.role.name != 'Student':
            return Response({
                'error': 'Only students can upload report versions.'
            }, status=status.HTTP_403_FORBIDDEN)

        report = get_object_or_404(Report, id=report_id)
        
        # Check if student owns this report
        if report.student != request.user:
            return Response({
                'error': 'You don\'t have access to this report.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Check if report is already final
        if report.is_final:
            return Response({
                'error': 'Cannot upload new version. Report is marked as final.'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReportVersionSerializer(data={'report': report.id, 'file': request.FILES.get('file')})
        if serializer.is_valid():
            version = serializer.save()
            return Response({
                'message': f'Version {version.version_number} uploaded successfully.',
                'data': ReportVersionSerializer(version).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubmitVersionForReviewView(APIView):
    """Submit a draft version for teacher review"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=SubmitVersionSerializer,
        responses={
            200: ReportVersionSerializer,
            400: 'Bad Request',
            403: 'Forbidden'
        }
    )
    def post(self, request):
        # Check if user is a student
        if not request.user.role or request.user.role.name != 'Student':
            return Response({
                'error': 'Only students can submit versions for review.'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = SubmitVersionSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        version = get_object_or_404(ReportVersion, id=serializer.validated_data['version_id'])
        
        if version.submit_for_review():
            return Response({
                'message': f'Version {version.version_number} submitted for review.',
                'data': ReportVersionSerializer(version).data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Failed to submit version for review.'
        }, status=status.HTTP_400_BAD_REQUEST)


class ListPendingVersionsView(APIView):
    """List all pending versions for teacher review"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        responses={
            200: ReportVersionSerializer(many=True),
            403: 'Forbidden'
        }
    )
    def get(self, request):
        # Check if user is a teacher
        if not request.user.role or request.user.role.name != 'Teacher':
            return Response({
                'error': 'Only teachers can view pending versions.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Get all pending versions for internships supervised by this teacher
        versions = ReportVersion.objects.filter(
            report__internship__teacher_id=request.user,
            status='pending'
        ).select_related('report', 'report__student', 'report__internship').prefetch_related('comments')
        
        serializer = ReportVersionSerializer(versions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ReviewVersionView(APIView):
    """Teacher reviews a report version (approve/reject)"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'version_id',
                openapi.IN_PATH,
                description="Version ID",
                type=openapi.TYPE_INTEGER
            )
        ],
        request_body=ReviewVersionSerializer,
        responses={
            200: ReportVersionSerializer,
            400: 'Bad Request',
            403: 'Forbidden',
            404: 'Not Found'
        }
    )
    def post(self, request, version_id):
        # Check if user is a teacher
        if not request.user.role or request.user.role.name != 'Teacher':
            return Response({
                'error': 'Only teachers can review versions.'
            }, status=status.HTTP_403_FORBIDDEN)

        version = get_object_or_404(ReportVersion, id=version_id)
        
        # Check if teacher supervises this internship
        if version.report.internship.teacher_id != request.user:
            return Response({
                'error': 'You don\'t have access to review this version.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Check if version is pending
        if version.status != 'pending':
            return Response({
                'error': f'Cannot review version with status \'{version.status}\'. Only pending versions can be reviewed.'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReviewVersionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        action = serializer.validated_data['action']
        is_final = serializer.validated_data.get('is_final', False)
        comment = serializer.validated_data.get('comment', '')

        if action == 'approve':
            version.approve(request.user, is_final=is_final)
            message = f'Version {version.version_number} approved.'
            if is_final:
                message += ' Report marked as final.'
        else:
            version.reject(request.user)
            message = f'Version {version.version_number} rejected. Student can upload a new version.'

        # Add comment if provided
        if comment:
            ReviewComment.objects.create(
                version=version,
                teacher=request.user,
                comment=comment
            )

        return Response({
            'message': message,
            'data': ReportVersionSerializer(version).data
        }, status=status.HTTP_200_OK)


class AddCommentView(APIView):
    """Teacher adds a comment to a version"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'version_id',
                openapi.IN_PATH,
                description="Version ID",
                type=openapi.TYPE_INTEGER
            )
        ],
        request_body=ReviewCommentSerializer,
        responses={
            201: ReviewCommentSerializer,
            400: 'Bad Request',
            403: 'Forbidden',
            404: 'Not Found'
        }
    )
    def post(self, request, version_id):
        # Check if user is a teacher
        if not request.user.role or request.user.role.name != 'Teacher':
            return Response({
                'error': 'Only teachers can add comments.'
            }, status=status.HTTP_403_FORBIDDEN)

        version = get_object_or_404(ReportVersion, id=version_id)
        
        # Check if teacher supervises this internship
        if version.report.internship.teacher_id != request.user:
            return Response({
                'error': 'You don\'t have access to comment on this version.'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = ReviewCommentSerializer(data={**request.data, 'version': version.id})
        if serializer.is_valid():
            comment = serializer.save(teacher=request.user)
            return Response({
                'message': 'Comment added successfully.',
                'data': ReviewCommentSerializer(comment).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResolveCommentView(APIView):
    """Student marks a comment as resolved"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'comment_id',
                openapi.IN_PATH,
                description="Comment ID",
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            200: ReviewCommentSerializer,
            403: 'Forbidden',
            404: 'Not Found'
        }
    )
    def post(self, request, comment_id):
        # Check if user is a student
        if not request.user.role or request.user.role.name != 'Student':
            return Response({
                'error': 'Only students can resolve comments.'
            }, status=status.HTTP_403_FORBIDDEN)

        comment = get_object_or_404(ReviewComment, id=comment_id)
        
        # Check if student owns this report
        if comment.version.report.student != request.user:
            return Response({
                'error': 'You don\'t have access to resolve this comment.'
            }, status=status.HTTP_403_FORBIDDEN)

        comment.resolve()
        
        return Response({
            'message': 'Comment marked as resolved.',
            'data': ReviewCommentSerializer(comment).data
        }, status=status.HTTP_200_OK)


class AssignFinalGradeView(APIView):
    """Teacher assigns final grade to report"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'report_id',
                openapi.IN_PATH,
                description="Report ID",
                type=openapi.TYPE_INTEGER
            )
        ],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'final_grade': openapi.Schema(
                    type=openapi.TYPE_NUMBER,
                    description='Final grade (0-20)',
                    minimum=0,
                    maximum=20
                )
            },
            required=['final_grade']
        ),
        responses={
            200: ReportSerializer,
            400: 'Bad Request',
            403: 'Forbidden',
            404: 'Not Found'
        }
    )
    def post(self, request, report_id):
        # Check if user is a teacher
        if not request.user.role or request.user.role.name != 'Teacher':
            return Response({
                'error': 'Only teachers can assign grades.'
            }, status=status.HTTP_403_FORBIDDEN)

        report = get_object_or_404(Report, id=report_id)
        
        # Check if teacher supervises this internship
        if report.internship.teacher_id != request.user:
            return Response({
                'error': 'You don\'t have access to grade this report.'
            }, status=status.HTTP_403_FORBIDDEN)

        # Check if report is final
        if not report.is_final:
            return Response({
                'error': 'Cannot assign grade. Report must be marked as final first.'
            }, status=status.HTTP_400_BAD_REQUEST)

        final_grade = request.data.get('final_grade')
        
        if final_grade is None:
            return Response({
                'error': 'Final grade is required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            final_grade = float(final_grade)
        except (ValueError, TypeError):
            return Response({
                'error': 'Invalid grade format.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if final_grade < 0 or final_grade > 20:
            return Response({
                'error': 'Grade must be between 0 and 20.'
            }, status=status.HTTP_400_BAD_REQUEST)

        report.final_grade = final_grade
        report.save()

        return Response({
            'message': f'Final grade {final_grade}/20 assigned successfully.',
            'data': ReportSerializer(report).data
        }, status=status.HTTP_200_OK)