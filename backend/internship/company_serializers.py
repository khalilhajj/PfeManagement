from rest_framework import serializers
from .models import InternshipOffer, InternshipApplication, Internship, InterviewSlot
from authentication.models import User


class CompanyInfoSerializer(serializers.ModelSerializer):
    """Serializer for company info in offers"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'profile_picture']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class StudentInfoSerializer(serializers.ModelSerializer):
    """Serializer for student info in applications"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'phone', 'profile_picture']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class InternshipOfferSerializer(serializers.ModelSerializer):
    """Serializer for InternshipOffer - Company creates offers"""
    company_info = CompanyInfoSerializer(source='company', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    applications_count = serializers.IntegerField(read_only=True)
    approved_applications_count = serializers.IntegerField(read_only=True)
    has_applied = serializers.SerializerMethodField()
    
    class Meta:
        model = InternshipOffer
        fields = [
            'id', 'company', 'company_info', 'title', 'description', 'requirements',
            'type', 'type_display', 'location', 'duration', 'start_date', 'end_date',
            'positions_available', 'status', 'status_display', 'admin_feedback',
            'applications_count', 'approved_applications_count', 'has_applied',
            'external_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['company', 'status', 'admin_feedback', 'created_at', 'updated_at']
    
    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.applications.filter(student=request.user).exists()
        return False


class InternshipOfferCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new internship offers"""
    
    class Meta:
        model = InternshipOffer
        fields = [
            'title', 'description', 'requirements', 'type', 'location',
            'duration', 'start_date', 'end_date', 'positions_available'
        ]
    
    def validate(self, data):
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data
    
    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user
        validated_data['status'] = 0  # Pending admin approval
        return super().create(validated_data)


class InternshipApplicationSerializer(serializers.ModelSerializer):
    """Serializer for InternshipApplication - Student applies to offers"""
    student_info = StudentInfoSerializer(source='student', read_only=True)
    offer_info = InternshipOfferSerializer(source='offer', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    selected_slot_info = serializers.SerializerMethodField()
    available_slots = serializers.SerializerMethodField()
    
    class Meta:
        model = InternshipApplication
        fields = [
            'id', 'offer', 'offer_info', 'student', 'student_info',
            'cover_letter', 'cv_file', 'status', 'status_display',
            'company_feedback', 'interview_notes', 'selected_interview_slot',
            'selected_slot_info', 'available_slots', 'created_internship',
            'match_score', 'match_analysis',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['student', 'status', 'company_feedback', 'interview_notes', 
                          'created_internship', 'match_score', 'match_analysis',
                          'created_at', 'updated_at']
    
    def get_selected_slot_info(self, obj):
        if obj.selected_interview_slot:
            return InterviewSlotSerializer(obj.selected_interview_slot).data
        return None
    
    def get_available_slots(self, obj):
        # Return available slots if student is invited to interview but hasn't selected yet
        if obj.status == 1 and not obj.selected_interview_slot:  # Interview status
            slots = InterviewSlot.objects.filter(offer=obj.offer, is_booked=False)
            return InterviewSlotSerializer(slots, many=True).data
        return []


class InternshipApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating applications"""
    cv_file = serializers.FileField(required=True)
    
    class Meta:
        model = InternshipApplication
        fields = ['offer', 'cover_letter', 'cv_file']
    
    def validate_cv_file(self, value):
        if not value:
            raise serializers.ValidationError("CV/Resume is required")
        
        # Validate file size (max 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("CV file size must be less than 5MB")
        
        # Validate file extension
        allowed_extensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
        ext = value.name.lower().split('.')[-1]
        if f'.{ext}' not in allowed_extensions:
            raise serializers.ValidationError("Allowed file types: PDF, Word, JPEG, PNG")
        
        return value
    
    def validate_offer(self, value):
        # Check if offer is approved and open
        if value.status != 1:
            raise serializers.ValidationError("This internship offer is not available")
        
        # Check if positions are still available
        if value.approved_applications_count >= value.positions_available:
            raise serializers.ValidationError("No positions available for this offer")
        
        # Check if student already applied
        request = self.context.get('request')
        if request and InternshipApplication.objects.filter(offer=value, student=request.user).exists():
            raise serializers.ValidationError("You have already applied to this offer")
        
        return value
    
    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        validated_data['status'] = 0  # Pending
        return super().create(validated_data)


class ApplicationReviewSerializer(serializers.Serializer):
    """Serializer for company reviewing applications - pass to interview or reject"""
    status = serializers.ChoiceField(choices=[(1, 'Interview'), (3, 'Rejected')])
    feedback = serializers.CharField(required=False, allow_blank=True)


class InterviewDecisionSerializer(serializers.Serializer):
    """Serializer for company making final decision after interview"""
    status = serializers.ChoiceField(choices=[(2, 'Accepted'), (3, 'Rejected')])
    interview_notes = serializers.CharField(required=False, allow_blank=True)
    feedback = serializers.CharField(required=False, allow_blank=True)


class InterviewSlotSerializer(serializers.ModelSerializer):
    """Serializer for interview time slots"""
    
    class Meta:
        model = InterviewSlot
        fields = ['id', 'offer', 'date', 'start_time', 'end_time', 'location', 'is_booked', 'created_at']
        read_only_fields = ['is_booked', 'created_at']


class InterviewSlotCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating interview slots"""
    
    class Meta:
        model = InterviewSlot
        fields = ['date', 'start_time', 'end_time', 'location']
    
    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time")
        return data


class SelectInterviewSlotSerializer(serializers.Serializer):
    """Serializer for student selecting an interview slot"""
    slot_id = serializers.IntegerField()
    
    def validate_slot_id(self, value):
        try:
            slot = InterviewSlot.objects.get(id=value)
            if slot.is_booked:
                raise serializers.ValidationError("This time slot is no longer available")
            return value
        except InterviewSlot.DoesNotExist:
            raise serializers.ValidationError("Invalid time slot")


class OfferAdminReviewSerializer(serializers.Serializer):
    """Serializer for admin reviewing offers"""
    status = serializers.ChoiceField(choices=[(1, 'Approved'), (2, 'Rejected')])
    feedback = serializers.CharField(required=False, allow_blank=True)
