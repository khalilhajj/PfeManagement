from django.db import models
from django.conf import settings

# Create your models here.
class Internship(models.Model):
    student_id=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='internships'
    )
    teacher_id=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_internships'
    )
    type = models.CharField(max_length=100)
    company_name = models.CharField(max_length=255)
    cahier_de_charges = models.FileField(upload_to='cahiers_de_charges/')
    status = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()

    def __str__(self):
        return self.title
    

class Soutenance(models.Model):
    internship = models.ForeignKey(
        Internship,
        on_delete=models.CASCADE,
        related_name='soutenances'
    )
    date = models.DateField()
    time = models.TimeField()
    room = models.CharField(max_length=255)
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
