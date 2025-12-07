from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

class Report(models.Model):
    """Main report model - represents the report container"""
    internship = models.OneToOneField(
        'internship.Internship',
        on_delete=models.CASCADE,
        related_name='report'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_final = models.BooleanField(default=False)
    final_grade = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(20)]
    )

    class Meta:
        db_table = 'report_report'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.student.username}"

    def get_current_version(self):
        """Get the latest version of this report"""
        return self.versions.order_by('-version_number').first()

    def get_approved_version(self):
        """Get the latest approved version"""
        return self.versions.filter(status='approved').order_by('-version_number').first()

class ReportVersion(models.Model):
    """Report version model - tracks each submission iteration"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Needs Revision'),
    ]

    report = models.ForeignKey(
        Report,
        on_delete=models.CASCADE,
        related_name='versions'
    )
    version_number = models.PositiveIntegerField()
    file = models.FileField(upload_to='reports/versions/%Y/%m/%d/')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_report_versions'
    )
    is_final = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_report_version'
        ordering = ['-version_number']
        unique_together = ['report', 'version_number']

    def __str__(self):
        return f"{self.report.title} - v{self.version_number} ({self.status})"

    def submit_for_review(self):
        """Submit version for teacher review"""
        if self.status == 'draft':
            self.status = 'pending'
            self.submitted_at = timezone.now()
            self.save()
            return True
        return False

    def approve(self, teacher, is_final=False):
        """Teacher approves this version"""
        self.status = 'approved'
        self.reviewed_by = teacher
        self.reviewed_at = timezone.now()
        self.is_final = is_final
        
        if is_final:
            self.report.is_final = True
            self.report.save()
        
        self.save()
        return True

    def reject(self, teacher):
        """Teacher rejects this version"""
        self.status = 'rejected'
        self.reviewed_by = teacher
        self.reviewed_at = timezone.now()
        self.save()
        return True


class ReviewComment(models.Model):
    """Comments from teacher on report versions"""
    version = models.ForeignKey(
        ReportVersion,
        on_delete=models.CASCADE,
        related_name='comments'
    )
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='review_comments'
    )
    comment = models.TextField()
    page_number = models.PositiveIntegerField(null=True, blank=True)
    section = models.CharField(max_length=255, blank=True, null=True)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_review_comment'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment on {self.version} by {self.teacher.username}"

    def resolve(self):
        """Mark comment as resolved"""
        self.is_resolved = True
        self.save()