from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from ..models import Soutenance, Internship
from ..models import Soutenance, Internship, Notification
from ..soutenance_serializers import SoutenanceSerializer
from authentication.models import User
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_superuser or (hasattr(request.user, 'role') and request.user.role.name == 'Administrator'))

class SoutenanceListCreateView(generics.ListCreateAPIView):
    serializer_class = SoutenanceSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        soutenance = serializer.save()
        
        channel_layer = get_channel_layer()
        
        # Notify Student
        student = soutenance.internship.student_id
        msg_student = f"Your soutenance has been scheduled for {soutenance.date} at {soutenance.time} in room {soutenance.room}."
        Notification.objects.create(recipient=student, message=msg_student)
        
        async_to_sync(channel_layer.group_send)(
            f"user_{student.id}",
            {
                "type": "send_notification",
                "message": msg_student
            }
        )
        
        # Notify Jury Members
        for jury in soutenance.juries.all():
            msg_jury = f"You have been assigned as a jury member for {student.first_name} {student.last_name}'s soutenance on {soutenance.date} at {soutenance.time}."
            Notification.objects.create(recipient=jury.member, message=msg_jury)
            
            async_to_sync(channel_layer.group_send)(
                f"user_{jury.member.id}",
                {
                    "type": "send_notification",
                    "message": msg_jury
                }
            )

    def get_queryset(self):
        user = self.request.user
        
        # Admin: All
        if user.is_superuser or (hasattr(user, 'role') and user.role.name == 'Administrator'):
            return Soutenance.objects.all()
            
        # Student: Only their own
        if hasattr(user, 'role') and user.role.name == 'Student':
            return Soutenance.objects.filter(internship__student_id=user)
            
        # Teacher: Only where they are in Jury
        if hasattr(user, 'role') and user.role.name == 'Teacher':
            return Soutenance.objects.filter(juries__member=user)
            
        return Soutenance.objects.none()

class SoutenanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Soutenance.objects.all()
    serializer_class = SoutenanceSerializer
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
             return [permissions.IsAuthenticated(), IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def perform_update(self, serializer):
        soutenance = serializer.save()
        channel_layer = get_channel_layer()
        
        # Notify Student
        student = soutenance.internship.student_id
        msg = f"Your soutenance schedule has been updated to {soutenance.date} at {soutenance.time} in room {soutenance.room}."
        Notification.objects.create(recipient=student, message=msg)
        async_to_sync(channel_layer.group_send)(f"user_{student.id}", {"type": "send_notification", "message": msg})
        
        # Notify Jury
        for jury in soutenance.juries.all():
            msg_jury = f"The soutenance for {student.first_name} has been rescheduled to {soutenance.date} at {soutenance.time}."
            Notification.objects.create(recipient=jury.member, message=msg_jury)
            async_to_sync(channel_layer.group_send)(f"user_{jury.member.id}", {"type": "send_notification", "message": msg_jury})

    def perform_destroy(self, instance):
        channel_layer = get_channel_layer()
        student = instance.internship.student_id
        
        # Notify Student
        msg = f"Your soutenance scheduled for {instance.date} has been CANCELLED."
        Notification.objects.create(recipient=student, message=msg)
        async_to_sync(channel_layer.group_send)(f"user_{student.id}", {"type": "send_notification", "message": msg})
        
        # Notify Jury
        for jury in instance.juries.all():
            msg_jury = f"The soutenance for {student.first_name} scheduled for {instance.date} has been CANCELLED."
            Notification.objects.create(recipient=jury.member, message=msg_jury)
            async_to_sync(channel_layer.group_send)(f"user_{jury.member.id}", {"type": "send_notification", "message": msg_jury})
            
        instance.delete()


class GetSoutenanceCandidatesView(generics.ListAPIView):
    """
    Get list of internships eligible for soutenance planning.
    Criteria:
    1. Has a report marked as is_final=True
    2. Does NOT have an existing soutenance (or at least not one that is active)
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    serializer_class = SoutenanceSerializer # Actually we want an Internship serializer or a custom one. 
    # Let's use a simple custom serializer or reuse InternshipSerializer but we only need fields for the dropdown.
    # Reuse InternshipSerializer is fine for now, or use a method to return just id/title/student.
    
    def get(self, request):
        # Filter internships with final reports and no soutenance
        # Note: report is OneToOne with Internship.
        # We check report__is_final=True
        # We check soutenance__isnull=True (Reverse relation name 'soutenances' is OneToMany but usually 1-1 logic in my head, but model says ForeignKey so Many-to-One.
        # Wait, Soutenance has `internship = ForeignKey`. So one internship can have multiple soutenances?
        # The user said "not done yet with the soutenance".
        # If I use `soutenances__isnull=True`, it means NO soutenance associated.
        
        candidates = Internship.objects.filter(
            report__is_final=True,
            soutenances__isnull=True
        ).select_related('student_id')
        
        # We can construct a simple response data
        data = []
        for i in candidates:
            student_name = f"{i.student_id.first_name} {i.student_id.last_name}" or i.student_id.username
            data.append({
                'id': i.id,
                'title': i.title,
                'student_name': student_name,
                'company': i.company_name
            })
            
        return Response(data)
