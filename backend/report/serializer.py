from rest_framework import serializers
from report.models import Report, ReportVersion, ReviewComment
from authentication.models import User
from internship.models import Internship
from django.utils import timezone

class ReviewCommentSerializer(serializers.ModelSerializer):
    """Serializer for review comments"""
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    teacher_username = serializers.CharField(source='teacher.username', read_only=True)
    
    class Meta:
        model = ReviewComment
        fields = [
            'id', 'version', 'teacher', 'teacher_name', 'teacher_username',
            'comment', 'page_number', 'section', 'is_resolved',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['teacher', 'created_at', 'updated_at']
        ref_name = 'StudentReviewComment'

    def validate_comment(self, value):
        """Validate comment is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Comment cannot be empty.")
        
        if len(value) > 5000:
            raise serializers.ValidationError("Comment is too long (max 5000 characters).")
        
        return value.strip()

    def validate_page_number(self, value):
        """Validate page number"""
        if value is not None and value < 1:
            raise serializers.ValidationError("Page number must be positive.")
        return value


class ReportVersionSerializer(serializers.ModelSerializer):
    """Serializer for report versions"""
    comments = ReviewCommentSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField()
    unresolved_comments_count = serializers.SerializerMethodField()
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportVersion
        fields = [
            'id', 'report', 'version_number', 'file', 'file_size',
            'status', 'submitted_at', 'reviewed_at', 'reviewed_by',
            'reviewed_by_name', 'is_final', 'comments', 'comments_count',
            'unresolved_comments_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'version_number', 'submitted_at', 'reviewed_at',
            'reviewed_by', 'created_at', 'updated_at'
        ]
        ref_name = 'StudentReportVersion'

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_unresolved_comments_count(self, obj):
        return obj.comments.filter(is_resolved=False).count()

    def get_file_size(self, obj):
        """Get file size in MB"""
        if obj.file:
            return round(obj.file.size / (1024 * 1024), 2)
        return 0

    def validate_file(self, value):
        """Validate uploaded file"""
        if not value:
            raise serializers.ValidationError("File is required.")
        
        # Check file extension
        allowed_extensions = ['.pdf', '.doc', '.docx']
        file_extension = value.name.split('.')[-1].lower()
        if f'.{file_extension}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Check file size (max 50MB)
        max_size = 50 * 1024 * 1024  # 50MB
        if value.size > max_size:
            raise serializers.ValidationError(
                "File size too large. Maximum size is 50MB."
            )
        
        return value

    def create(self, validated_data):
        """Create new version with auto-incremented version number"""
        report = validated_data['report']
        
        # Get the last version number
        last_version = report.versions.order_by('-version_number').first()
        new_version_number = (last_version.version_number + 1) if last_version else 1
        
        validated_data['version_number'] = new_version_number
        validated_data['status'] = 'draft'
        
        return super().create(validated_data)


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for main report"""
    versions = ReportVersionSerializer(many=True, read_only=True)
    current_version = serializers.SerializerMethodField()
    approved_version = serializers.SerializerMethodField()
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    internship_title = serializers.CharField(source='internship.title', read_only=True)
    total_versions = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = [
            'id', 'internship', 'internship_title', 'student', 'student_name',
            'title', 'description', 'is_final', 'final_grade',
            'versions', 'current_version', 'approved_version',
            'total_versions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['student', 'created_at', 'updated_at']
        ref_name = 'StudentReport'

    def get_current_version(self, obj):
        version = obj.get_current_version()
        if version:
            return ReportVersionSerializer(version).data
        return None

    def get_approved_version(self, obj):
        version = obj.get_approved_version()
        if version:
            return ReportVersionSerializer(version).data
        return None

    def get_total_versions(self, obj):
        return obj.versions.count()

    def validate_title(self, value):
        """Validate title"""
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        
        if len(value) > 255:
            raise serializers.ValidationError("Title is too long (max 255 characters).")
        
        return value.strip()

    def validate_final_grade(self, value):
        """Validate final grade"""
        if value is not None:
            if value < 0 or value > 20:
                raise serializers.ValidationError("Grade must be between 0 and 20.")
        return value

    def validate_internship(self, value):
        """Validate internship exists and student has access"""
        user = self.context['request'].user
        
        if not Internship.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Invalid internship.")
        
        # Check if student owns this internship
        if value.student_id != user:
            raise serializers.ValidationError("You don't have access to this internship.")
        
        # Check if report already exists for this internship
        if self.instance is None:  # Only on creation
            if Report.objects.filter(internship=value).exists():
                raise serializers.ValidationError("Report already exists for this internship.")
        
        return value


class SubmitVersionSerializer(serializers.Serializer):
    """Serializer for submitting version for review"""
    version_id = serializers.IntegerField()
    
    class Meta:
        ref_name = 'StudentSubmitVersion'

    def validate_version_id(self, value):
        """Validate version exists and belongs to student"""
        user = self.context['request'].user
        
        try:
            version = ReportVersion.objects.select_related('report').get(id=value)
        except ReportVersion.DoesNotExist:
            raise serializers.ValidationError("Version not found.")
        
        # Check if student owns this version
        if version.report.student != user:
            raise serializers.ValidationError("You don't have access to this version.")
        
        # Check if version is in draft status
        if version.status != 'draft':
            raise serializers.ValidationError(
                f"Cannot submit version with status '{version.status}'. Only draft versions can be submitted."
            )
        
        return value


class ReviewVersionSerializer(serializers.Serializer):
    """Serializer for teacher reviewing version"""
    action = serializers.ChoiceField(choices=['approve', 'reject'])
    is_final = serializers.BooleanField(default=False, required=False)
    comment = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        ref_name = 'StudentReviewVersion'

    def validate_action(self, value):
        """Validate action"""
        if value not in ['approve', 'reject']:
            raise serializers.ValidationError("Invalid action. Use 'approve' or 'reject'.")
        return value

    def validate_comment(self, value):
        """Validate comment"""
        if value and len(value) > 5000:
            raise serializers.ValidationError("Comment is too long (max 5000 characters).")
        return value.strip() if value else ''

    def validate(self, attrs):
        """Validate is_final only for approve action"""
        if attrs.get('is_final') and attrs['action'] != 'approve':
            raise serializers.ValidationError({
                'is_final': 'Can only mark as final when approving.'
            })
        return attrs