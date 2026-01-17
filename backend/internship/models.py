from django.db import models
from django.conf import settings
from django.utils import timezone

# Create your models here.
class Internship(models.Model):
    STATUS_CHOICES = [
        (0, 'Pending'),
        (1, 'Approved'),
        (2, 'Rejected'),
        (3, 'In Progress'),
        (4, 'Completed'),
    ]
    TYPE_CHOICES = [
        ('PFE', 'Projet de Fin d\'Études'),
        ('Stage', 'Stage'),
        ('Internship', 'Internship'),
    ]
    student_id=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='internships'
    )
    teacher_id=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_internships',
        null=True,
        blank=True,
    )
    type = models.CharField(max_length=100)
    company_name = models.CharField(max_length=255)
    cahier_de_charges = models.FileField(upload_to='cahiers_de_charges/', blank=True, null=True)
    status = models.IntegerField(choices=STATUS_CHOICES, default=0)
    start_date = models.DateField()
    description = models.TextField(null=True, blank=True)
    end_date = models.DateField()
    title = models.CharField(max_length=255, default='Untitled')
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']
    
class Room(models.Model):
    """Available rooms for soutenances"""
    name = models.CharField(max_length=100, unique=True)
    building = models.CharField(max_length=100, blank=True, null=True)
    capacity = models.IntegerField(help_text="Maximum number of people")
    floor = models.CharField(max_length=50, blank=True, null=True)
    equipment = models.TextField(blank=True, null=True, help_text="Available equipment (projector, computer, etc.)")
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['building', 'name']

    def __str__(self):
        if self.building:
            return f"{self.name} - {self.building}"
        return self.name

class TeacherInvitation(models.Model):
    STATUS_CHOICES = [
        (0, 'Pending'),
        (1, 'Accepted'),
        (2, 'Rejected'),
    ]
    internship = models.ForeignKey(
        Internship,
        on_delete=models.CASCADE,
        related_name='invitations'
    )

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_invitations'
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_invitations'
    )
    status = models.IntegerField(choices=STATUS_CHOICES, default=0)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True,null=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['internship', 'teacher']  # Prevent duplicate invitations

    def __str__(self):
        return f"Invitation from {self.student.username} to {self.teacher.username}"

class Soutenance(models.Model):
    internship = models.ForeignKey(
        Internship,
        on_delete=models.CASCADE,
        related_name='soutenances'
    )
    date = models.DateField()
    time = models.TimeField()
    room = models.ForeignKey(
        'Room',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='soutenances'
    )
    STATUS_CHOICES = [
        ('Planned', 'Planned'),
        ('Done', 'Done'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planned')
    grade= models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Soutenance for {self.internship} on {self.date} at {self.time}"
    
class Jury(models.Model):
    soutenance = models.ForeignKey(
        Soutenance,
        on_delete=models.CASCADE,
        related_name='juries'
    )
    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='jury_memberships'
    )

    def __str__(self):
        return f"Jury member {self.member} for {self.soutenance}"

class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient}: {self.message}"


class InternshipOffer(models.Model):
    """Internship offers posted by companies"""
    STATUS_CHOICES = [
        (0, 'Pending'),      # Waiting for admin approval
        (1, 'Approved'),     # Admin approved, visible to students
        (2, 'Rejected'),     # Admin rejected
        (3, 'Closed'),       # Company closed the offer
    ]
    TYPE_CHOICES = [
        ('PFE', 'Projet de Fin d\'Études'),
        ('Stage', 'Stage'),
        ('Internship', 'Internship'),
    ]
    
    company = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posted_offers'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=100, choices=TYPE_CHOICES, default='Stage')
    location = models.CharField(max_length=255, blank=True, null=True)
    duration = models.CharField(max_length=100, blank=True, null=True)  # e.g., "3 months"
    start_date = models.DateField()
    end_date = models.DateField()
    positions_available = models.IntegerField(default=1)
    status = models.IntegerField(choices=STATUS_CHOICES, default=0)
    admin_feedback = models.TextField(blank=True, null=True)  # Reason for rejection
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.company.username}"

    @property
    def applications_count(self):
        return self.applications.count()
    
    @property
    def approved_applications_count(self):
        return self.applications.filter(status=1).count()


class InternshipApplication(models.Model):
    """Student applications to internship offers"""
    STATUS_CHOICES = [
        (0, 'Pending'),           # Waiting for company review
        (1, 'Interview'),         # Selected for interview
        (2, 'Accepted'),          # Company accepted after interview
        (3, 'Rejected'),          # Company rejected
    ]
    
    offer = models.ForeignKey(
        InternshipOffer,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='internship_applications'
    )
    cover_letter = models.TextField(blank=True, null=True)
    cv_file = models.FileField(upload_to='application_cvs/', blank=True, null=True)
    status = models.IntegerField(choices=STATUS_CHOICES, default=0)
    company_feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Interview-related fields
    selected_interview_slot = models.ForeignKey(
        'InterviewSlot',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='booked_application'
    )
    interview_notes = models.TextField(blank=True, null=True)  # Company notes after interview
    
    # Link to created internship when approved
    created_internship = models.OneToOneField(
        Internship,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='source_application'
    )

    class Meta:
        ordering = ['-created_at']
        unique_together = ['offer', 'student']  # One application per student per offer

    def __str__(self):
        return f"{self.student.username} -> {self.offer.title}"


class InterviewSlot(models.Model):
    """Available interview time slots created by companies"""
    offer = models.ForeignKey(
        InternshipOffer,
        on_delete=models.CASCADE,
        related_name='interview_slots'
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    location = models.CharField(max_length=255, blank=True, null=True)  # Room, Online link, etc.
    is_booked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.offer.title} - {self.date} {self.start_time}-{self.end_time}"
