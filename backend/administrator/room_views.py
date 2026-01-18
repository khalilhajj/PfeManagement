from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.shortcuts import get_object_or_404

from internship.models import Room
from internship.serializers import RoomSerializer


class ListRoomsView(APIView):
    """List all rooms"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        responses={200: RoomSerializer(many=True)}
    )
    def get(self, request):
        rooms = Room.objects.all()
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CreateRoomView(APIView):
    """Create a new room"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        request_body=RoomSerializer,
        responses={
            201: RoomSerializer,
            400: 'Bad Request',
            403: 'Forbidden'
        }
    )
    def post(self, request):
        # Check if user is admin
        if not request.user.role or request.user.role.name != 'Administrator':
            return Response({
                'error': 'Only administrators can create rooms.'
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            room = serializer.save()
            return Response({
                'message': 'Room created successfully.',
                'data': RoomSerializer(room).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateRoomView(APIView):
    """Update a room"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description="Room ID",
                type=openapi.TYPE_INTEGER
            )
        ],
        request_body=RoomSerializer,
        responses={
            200: RoomSerializer,
            400: 'Bad Request',
            403: 'Forbidden',
            404: 'Not Found'
        }
    )
    def put(self, request, id):
        # Check if user is admin
        if not request.user.role or request.user.role.name != 'Administrator':
            return Response({
                'error': 'Only administrators can update rooms.'
            }, status=status.HTTP_403_FORBIDDEN)

        room = get_object_or_404(Room, id=id)
        serializer = RoomSerializer(room, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Room updated successfully.',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteRoomView(APIView):
    """Delete a room"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'id',
                openapi.IN_PATH,
                description="Room ID",
                type=openapi.TYPE_INTEGER
            )
        ],
        responses={
            200: 'Room deleted successfully',
            403: 'Forbidden',
            404: 'Not Found'
        }
    )
    def delete(self, request, id):
        # Check if user is admin
        if not request.user.role or request.user.role.name != 'Administrator':
            return Response({
                'error': 'Only administrators can delete rooms.'
            }, status=status.HTTP_403_FORBIDDEN)

        room = get_object_or_404(Room, id=id)
        room.delete()
        
        return Response({
            'message': 'Room deleted successfully.'
        }, status=status.HTTP_200_OK)


class GetAvailableRoomsView(APIView):
    """Get all available rooms"""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        responses={200: RoomSerializer(many=True)}
    )
    def get(self, request):
        rooms = Room.objects.filter(is_available=True)
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
