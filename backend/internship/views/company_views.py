from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db import transaction
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from ..models import InternshipOffer, InternshipApplication, Internship, Notification, InterviewSlot
from ..company_serializers import (
    InternshipOfferSerializer, InternshipOfferCreateSerializer,
    InternshipApplicationSerializer, InternshipApplicationCreateSerializer,
    ApplicationReviewSerializer, OfferAdminReviewSerializer,
    InterviewSlotSerializer, InterviewSlotCreateSerializer,
    InterviewDecisionSerializer, SelectInterviewSlotSerializer
)


# ==================== COMPANY VIEWS ====================

class CompanyOfferListCreateView(APIView):
    """List and create internship offers for companies"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request):
        """Get all offers posted by the current company"""
        if not request.user.role or request.user.role.name != 'Company':
            return Response({'error': 'Only companies can access this'}, status=status.HTTP_403_FORBIDDEN)
        
        offers = InternshipOffer.objects.filter(company=request.user)
        serializer = InternshipOfferSerializer(offers, many=True, context={'request': request})
        return Response(serializer.data)
    
    @swagger_auto_schema(request_body=InternshipOfferCreateSerializer)
    def post(self, request):
        """Create a new internship offer"""
        if not request.user.role or request.user.role.name != 'Company':
            return Response({'error': 'Only companies can create offers'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = InternshipOfferCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            offer = serializer.save()
            return Response({
                'message': 'Internship offer created successfully. Waiting for admin approval.',
                'offer': InternshipOfferSerializer(offer, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CompanyOfferDetailView(APIView):
    """Get, update, delete a specific offer"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request, offer_id):
        """Get offer details"""
        offer = get_object_or_404(InternshipOffer, id=offer_id)
        
        # Company can see their own, students can see approved ones
        if offer.company != request.user and offer.status != 1:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = InternshipOfferSerializer(offer, context={'request': request})
        return Response(serializer.data)
    
    @swagger_auto_schema(request_body=InternshipOfferCreateSerializer)
    def put(self, request, offer_id):
        """Update an offer (only if pending)"""
        offer = get_object_or_404(InternshipOffer, id=offer_id, company=request.user)
        
        if offer.status != 0:
            return Response({'error': 'Can only edit pending offers'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = InternshipOfferCreateSerializer(offer, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(InternshipOfferSerializer(offer, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, offer_id):
        """Delete an offer"""
        offer = get_object_or_404(InternshipOffer, id=offer_id, company=request.user)
        offer.delete()
        return Response({'message': 'Offer deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class CompanyApplicationsView(APIView):
    """View applications for company's offers"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, offer_id=None):
        """Get applications for a specific offer or all offers"""
        if not request.user.role or request.user.role.name != 'Company':
            return Response({'error': 'Only companies can access this'}, status=status.HTTP_403_FORBIDDEN)
        
        if offer_id:
            offer = get_object_or_404(InternshipOffer, id=offer_id, company=request.user)
            applications = InternshipApplication.objects.filter(offer=offer)
        else:
            # All applications for all company's offers
            applications = InternshipApplication.objects.filter(offer__company=request.user)
        
        serializer = InternshipApplicationSerializer(applications, many=True, context={'request': request})
        return Response(serializer.data)


class CompanyReviewApplicationView(APIView):
    """Company reviews (passes to interview or rejects) an application"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(request_body=ApplicationReviewSerializer)
    def post(self, request, application_id):
        """Review an application - pass to interview or reject"""
        if not request.user.role or request.user.role.name != 'Company':
            return Response({'error': 'Only companies can review applications'}, status=status.HTTP_403_FORBIDDEN)
        
        application = get_object_or_404(
            InternshipApplication, 
            id=application_id, 
            offer__company=request.user
        )
        
        if application.status != 0:  # Only pending applications can be reviewed
            return Response({'error': 'Application already reviewed'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ApplicationReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        new_status = serializer.validated_data['status']
        feedback = serializer.validated_data.get('feedback', '')
        
        with transaction.atomic():
            application.status = new_status
            application.company_feedback = feedback
            application.save()
            
            if new_status == 1:  # Interview
                # Notify student about interview invitation
                Notification.objects.create(
                    recipient=application.student,
                    message=f"🎉 Great news! You've been selected for an interview for '{application.offer.title}'. Please select your preferred time slot."
                )
            else:  # Rejected
                Notification.objects.create(
                    recipient=application.student,
                    message=f"Your application for '{application.offer.title}' was not selected. {feedback}"
                )
        
        status_text = 'passed to interview' if new_status == 1 else 'rejected'
        return Response({
            'message': f'Application {status_text} successfully',
            'application': InternshipApplicationSerializer(application, context={'request': request}).data
        })


class CompanyInterviewDecisionView(APIView):
    """Company makes final decision after interview"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(request_body=InterviewDecisionSerializer)
    def post(self, request, application_id):
        """Make final decision after interview - accept or reject"""
        if not request.user.role or request.user.role.name != 'Company':
            return Response({'error': 'Only companies can make this decision'}, status=status.HTTP_403_FORBIDDEN)
        
        application = get_object_or_404(
            InternshipApplication, 
            id=application_id, 
            offer__company=request.user
        )
        
        # Can only decide after interview is scheduled
        if application.status != 1 or not application.selected_interview_slot:
            return Response({'error': 'Interview must be completed before making a decision'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = InterviewDecisionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        new_status = serializer.validated_data['status']
        interview_notes = serializer.validated_data.get('interview_notes', '')
        feedback = serializer.validated_data.get('feedback', '')
        
        with transaction.atomic():
            application.status = new_status
            application.interview_notes = interview_notes
            application.company_feedback = feedback
            application.save()
            
            if new_status == 2:  # Accepted
                offer = application.offer
                internship = Internship.objects.create(
                    student_id=application.student,
                    type=offer.type,
                    company_name=offer.company.first_name or offer.company.username,
                    title=offer.title,
                    description=offer.description,
                    start_date=offer.start_date,
                    end_date=offer.end_date,
                    status=1,  # Approved
                    cahier_de_charges=application.cv_file if application.cv_file else None
                )
                application.created_internship = internship
                application.save()
                
                Notification.objects.create(
                    recipient=application.student,
                    message=f"🎉 Congratulations! You've been accepted for '{offer.title}'! Your internship has been created."
                )
            else:  # Rejected
                Notification.objects.create(
                    recipient=application.student,
                    message=f"Thank you for interviewing for '{application.offer.title}'. Unfortunately, we've decided not to proceed. {feedback}"
                )
        
        status_text = 'accepted' if new_status == 2 else 'rejected'
        return Response({
            'message': f'Application {status_text} successfully',
            'application': InternshipApplicationSerializer(application, context={'request': request}).data
        })


class InterviewSlotListCreateView(APIView):
    """Manage interview time slots for an offer"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, offer_id):
        """Get all interview slots for an offer"""
        if not request.user.role or request.user.role.name != 'Company':
            return Response({'error': 'Only companies can access this'}, status=status.HTTP_403_FORBIDDEN)
        
        offer = get_object_or_404(InternshipOffer, id=offer_id, company=request.user)
        slots = InterviewSlot.objects.filter(offer=offer)
        serializer = InterviewSlotSerializer(slots, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(request_body=InterviewSlotCreateSerializer)
    def post(self, request, offer_id):
        """Create new interview time slots"""
        if not request.user.role or request.user.role.name != 'Company':
            return Response({'error': 'Only companies can create slots'}, status=status.HTTP_403_FORBIDDEN)
        
        offer = get_object_or_404(InternshipOffer, id=offer_id, company=request.user)
        
        serializer = InterviewSlotCreateSerializer(data=request.data)
        if serializer.is_valid():
            slot = serializer.save(offer=offer)
            return Response({
                'message': 'Interview slot created successfully',
                'slot': InterviewSlotSerializer(slot).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InterviewSlotDeleteView(APIView):
    """Delete an interview slot"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, slot_id):
        """Delete an interview slot (only if not booked)"""
        if not request.user.role or request.user.role.name != 'Company':
            return Response({'error': 'Only companies can delete slots'}, status=status.HTTP_403_FORBIDDEN)
        
        slot = get_object_or_404(InterviewSlot, id=slot_id, offer__company=request.user)
        
        if slot.is_booked:
            return Response({'error': 'Cannot delete a booked slot'}, status=status.HTTP_400_BAD_REQUEST)
        
        slot.delete()
        return Response({'message': 'Slot deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


# ==================== STUDENT VIEWS ====================

class BrowseOffersView(APIView):
    """Students browse available internship offers"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all approved offers"""
        # Only show approved offers
        offers = InternshipOffer.objects.filter(status=1)
        
        # Optional filtering
        offer_type = request.query_params.get('type')
        if offer_type:
            offers = offers.filter(type=offer_type)
        
        search = request.query_params.get('search')
        if search:
            offers = offers.filter(title__icontains=search) | offers.filter(description__icontains=search)
        
        serializer = InternshipOfferSerializer(offers, many=True, context={'request': request})
        return Response(serializer.data)


class StudentApplyView(APIView):
    """Student applies to an internship offer"""
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    @swagger_auto_schema(request_body=InternshipApplicationCreateSerializer)
    def post(self, request):
        """Submit an application"""
        if not request.user.role or request.user.role.name != 'Student':
            return Response({'error': 'Only students can apply'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = InternshipApplicationCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            application = serializer.save()
            
            # Notify company
            Notification.objects.create(
                recipient=application.offer.company,
                message=f"New application from {request.user.first_name} {request.user.last_name} for '{application.offer.title}'"
            )
            
            return Response({
                'message': 'Application submitted successfully',
                'application': InternshipApplicationSerializer(application, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentApplicationsView(APIView):
    """Student views their applications"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all applications by current student"""
        if not request.user.role or request.user.role.name != 'Student':
            return Response({'error': 'Only students can access this'}, status=status.HTTP_403_FORBIDDEN)
        
        applications = InternshipApplication.objects.filter(student=request.user)
        serializer = InternshipApplicationSerializer(applications, many=True, context={'request': request})
        return Response(serializer.data)


class StudentSelectInterviewSlotView(APIView):
    """Student selects their preferred interview time slot"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(request_body=SelectInterviewSlotSerializer)
    def post(self, request, application_id):
        """Select an interview time slot"""
        if not request.user.role or request.user.role.name != 'Student':
            return Response({'error': 'Only students can select slots'}, status=status.HTTP_403_FORBIDDEN)
        
        application = get_object_or_404(
            InternshipApplication, 
            id=application_id, 
            student=request.user
        )
        
        # Can only select slot if status is Interview (1) and no slot selected yet
        if application.status != 1:
            return Response({'error': 'You have not been invited to interview'}, status=status.HTTP_400_BAD_REQUEST)
        
        if application.selected_interview_slot:
            return Response({'error': 'You have already selected an interview slot'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = SelectInterviewSlotSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        slot_id = serializer.validated_data['slot_id']
        slot = get_object_or_404(InterviewSlot, id=slot_id, offer=application.offer)
        
        if slot.is_booked:
            return Response({'error': 'This time slot is no longer available'}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            slot.is_booked = True
            slot.save()
            
            application.selected_interview_slot = slot
            application.save()
            
            # Notify company
            Notification.objects.create(
                recipient=application.offer.company,
                message=f"{request.user.first_name} {request.user.last_name} has selected interview slot: {slot.date} {slot.start_time}-{slot.end_time} for '{application.offer.title}'"
            )
        
        return Response({
            'message': 'Interview slot selected successfully',
            'application': InternshipApplicationSerializer(application, context={'request': request}).data
        })


# ==================== ADMIN VIEWS ====================

class AdminPendingOffersView(APIView):
    """Admin views pending offers"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all pending offers"""
        if not request.user.role or request.user.role.name != 'Administrator':
            return Response({'error': 'Only administrators can access this'}, status=status.HTTP_403_FORBIDDEN)
        
        status_filter = request.query_params.get('status', '0')  # Default to pending
        offers = InternshipOffer.objects.filter(status=int(status_filter))
        
        serializer = InternshipOfferSerializer(offers, many=True, context={'request': request})
        return Response(serializer.data)


class AdminReviewOfferView(APIView):
    """Admin approves/rejects an offer"""
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(request_body=OfferAdminReviewSerializer)
    def post(self, request, offer_id):
        """Review an offer"""
        if not request.user.role or request.user.role.name != 'Administrator':
            return Response({'error': 'Only administrators can review offers'}, status=status.HTTP_403_FORBIDDEN)
        
        offer = get_object_or_404(InternshipOffer, id=offer_id)
        
        if offer.status != 0:
            return Response({'error': 'Offer already reviewed'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = OfferAdminReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        new_status = serializer.validated_data['status']
        feedback = serializer.validated_data.get('feedback', '')
        
        offer.status = new_status
        offer.admin_feedback = feedback
        offer.save()
        
        # Notify company
        status_text = 'approved' if new_status == 1 else 'rejected'
        Notification.objects.create(
            recipient=offer.company,
            message=f"Your internship offer '{offer.title}' has been {status_text}. {feedback}"
        )
        
        return Response({
            'message': f'Offer {status_text} successfully',
            'offer': InternshipOfferSerializer(offer, context={'request': request}).data
        })
