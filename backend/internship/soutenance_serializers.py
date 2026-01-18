from rest_framework import serializers
from .models import Soutenance, Jury, Internship, Room
from authentication.models import User

class JurySerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField(read_only=True)
    member_email = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Jury
        fields = ['id', 'member', 'member_name', 'member_email']
        read_only_fields = ['id']

    def get_member_name(self, obj):
        return f"{obj.member.first_name} {obj.member.last_name}".strip() or obj.member.username

    def get_member_email(self, obj):
        return obj.member.email

class SoutenanceSerializer(serializers.ModelSerializer):
    juries = JurySerializer(many=True, read_only=True)
    jury_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=True,
        help_text="List of 2 Teacher IDs for the jury (supervisor is auto-added)"
    )
    student_name = serializers.SerializerMethodField(read_only=True)
    internship_title = serializers.CharField(source='internship.title', read_only=True)
    room_display = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Soutenance
        fields = [
            'id', 'internship', 'internship_title', 'student_name', 
            'date', 'time', 'room', 'room_display', 'status', 'grade', 'juries', 'jury_ids'
        ]
        read_only_fields = ['status', 'juries', 'id', 'room_display']

    def get_student_name(self, obj):
        if obj.internship and obj.internship.student_id:
            s = obj.internship.student_id
            return f"{s.first_name} {s.last_name}".strip() or s.username
        return "Unknown"
    
    def get_room_display(self, obj):
        if obj.room:
            if obj.room.building:
                return f"{obj.room.name} - {obj.room.building}"
            return obj.room.name
        return "Not assigned"

    def validate_jury_ids(self, value):
        if len(value) != 2:
            raise serializers.ValidationError("You must select exactly 2 additional jury members.")
        return value

    def validate(self, data):
        internship = data.get('internship')
        
        # Check if report is final
        if hasattr(internship, 'report'):
            if not internship.report.is_final:
                raise serializers.ValidationError("The internship report is not marked as final.")
        else:
             raise serializers.ValidationError("This internship does not have a report.")
             
        # Check if year is current (assuming 'end_date' or created_at marks the year)
        # Detailed verification can be here or in view.
        
        return data

    def create(self, validated_data):
        jury_ids = validated_data.pop('jury_ids')
        soutenance = Soutenance.objects.create(**validated_data)
        
        # Add Supervisor
        supervisor = soutenance.internship.teacher_id
        if supervisor:
            Jury.objects.create(soutenance=soutenance, member=supervisor)
        
        # Add other members
        for teacher_id in jury_ids:
            try:
                teacher = User.objects.get(id=teacher_id)
                if teacher != supervisor: # Prevent duplicate if user selected supervisor
                     Jury.objects.create(soutenance=soutenance, member=teacher)
            except User.DoesNotExist:
                pass # or raise error
                
        return soutenance
