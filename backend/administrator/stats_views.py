from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta

from internship.models import Internship, Soutenance, InternshipOffer, Room, InternshipApplication
from report.models import Report
from authentication.models import User, Role


class AdminStatisticsView(APIView):
    """Get comprehensive statistics for admin dashboard"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Check if user is admin
        if not request.user.role or request.user.role.name != 'Administrator':
            return Response({'error': 'Admin access required'}, status=403)

        # Get current date for time-based filtering
        today = timezone.now().date()
        current_year = today.year
        
        # User Statistics
        try:
            student_role = Role.objects.get(name='Student')
            teacher_role = Role.objects.get(name='Teacher')
            company_role = Role.objects.get(name='Company')
            
            total_students = User.objects.filter(role=student_role).count()
            total_teachers = User.objects.filter(role=teacher_role).count()
            total_companies = User.objects.filter(role=company_role).count()
            active_users = User.objects.filter(is_active=True).count()
        except Role.DoesNotExist:
            total_students = total_teachers = total_companies = active_users = 0

        # Internship Statistics
        total_internships = Internship.objects.count()
        pending_internships = Internship.objects.filter(status=0).count()
        approved_internships = Internship.objects.filter(status=1).count()
        rejected_internships = Internship.objects.filter(status=2).count()
        
        # Internships by type
        internships_by_type = list(Internship.objects.values('type').annotate(
            count=Count('id')
        ))
        
        # Current year internships
        current_year_internships = Internship.objects.filter(
            created_at__year=current_year
        ).count()

        # Soutenance Statistics
        total_soutenances = Soutenance.objects.count()
        planned_soutenances = Soutenance.objects.filter(status='Planned').count()
        done_soutenances = Soutenance.objects.filter(status='Done').count()
        
        # Average grade
        avg_grade = Soutenance.objects.filter(
            grade__isnull=False
        ).aggregate(Avg('grade'))['grade__avg'] or 0

        # Report Statistics
        total_reports = Report.objects.count()
        final_reports = Report.objects.filter(is_final=True).count()
        reports_pending_review = Report.objects.filter(is_final=False).count()

        # Room Statistics
        total_rooms = Room.objects.count()
        available_rooms = Room.objects.filter(is_available=True).count()
        occupied_rooms = total_rooms - available_rooms

        # Company Offers Statistics
        total_offers = InternshipOffer.objects.count()
        pending_offers = InternshipOffer.objects.filter(status=0).count()
        approved_offers = InternshipOffer.objects.filter(status=1).count()
        rejected_offers = InternshipOffer.objects.filter(status=2).count()

        # Application Statistics
        total_applications = InternshipApplication.objects.count()
        pending_applications = InternshipApplication.objects.filter(status=0).count()
        accepted_applications = InternshipApplication.objects.filter(status=2).count()
        rejected_applications = InternshipApplication.objects.filter(status=3).count()

        # Monthly internships trend (last 6 months)
        monthly_internships = []
        for i in range(5, -1, -1):
            month_date = today - timedelta(days=30*i)
            month_count = Internship.objects.filter(
                created_at__year=month_date.year,
                created_at__month=month_date.month
            ).count()
            monthly_internships.append({
                'month': month_date.strftime('%b %Y'),
                'count': month_count
            })

        # Internship status distribution for chart
        internship_status_chart = [
            {'name': 'Pending', 'value': pending_internships},
            {'name': 'Approved', 'value': approved_internships},
            {'name': 'Rejected', 'value': rejected_internships}
        ]

        # Soutenance status for chart
        soutenance_status_chart = [
            {'name': 'Planned', 'value': planned_soutenances},
            {'name': 'Done', 'value': done_soutenances}
        ]

        # User distribution for chart
        user_distribution_chart = [
            {'name': 'Students', 'value': total_students},
            {'name': 'Teachers', 'value': total_teachers},
            {'name': 'Companies', 'value': total_companies}
        ]

        # Room availability chart
        room_chart = [
            {'name': 'Available', 'value': available_rooms},
            {'name': 'Occupied', 'value': occupied_rooms}
        ]

        return Response({
            'overview': {
                'total_users': active_users,
                'total_students': total_students,
                'total_teachers': total_teachers,
                'total_companies': total_companies,
                'total_internships': total_internships,
                'current_year_internships': current_year_internships,
                'total_soutenances': total_soutenances,
                'total_reports': total_reports,
                'total_rooms': total_rooms
            },
            'internships': {
                'total': total_internships,
                'pending': pending_internships,
                'approved': approved_internships,
                'rejected': rejected_internships,
                'by_type': internships_by_type,
                'status_chart': internship_status_chart,
                'monthly_trend': monthly_internships
            },
            'soutenances': {
                'total': total_soutenances,
                'planned': planned_soutenances,
                'done': done_soutenances,
                'average_grade': round(avg_grade, 2),
                'status_chart': soutenance_status_chart
            },
            'reports': {
                'total': total_reports,
                'final': final_reports,
                'pending_review': reports_pending_review
            },
            'rooms': {
                'total': total_rooms,
                'available': available_rooms,
                'occupied': occupied_rooms,
                'chart': room_chart
            },
            'offers': {
                'total': total_offers,
                'pending': pending_offers,
                'approved': approved_offers,
                'rejected': rejected_offers
            },
            'applications': {
                'total': total_applications,
                'pending': pending_applications,
                'accepted': accepted_applications,
                'rejected': rejected_applications
            },
            'users': {
                'total': active_users,
                'students': total_students,
                'teachers': total_teachers,
                'companies': total_companies,
                'distribution_chart': user_distribution_chart
            }
        })
