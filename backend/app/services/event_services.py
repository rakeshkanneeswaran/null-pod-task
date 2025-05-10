# services/event_services.py
from prisma import Prisma
from prisma.errors import PrismaError, UniqueViolationError, DataError
from typing import Optional, Dict, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class EventServicesError(Exception):
    """Base exception class for EventServices errors"""

    pass


class EventNotFoundError(EventServicesError):
    """Raised when an event is not found"""

    pass


class InvalidEventDataError(EventServicesError):
    """Raised when event data is invalid"""

    pass


class EventConflictError(EventServicesError):
    """Raised when there's a conflict with event data"""

    pass


class EventServices:
    @staticmethod
    async def get_all_events(db: Prisma) -> List[Dict]:
        """
        Retrieve all calendar events
        Returns:
            List of event dictionaries
        Raises:
            EventServicesError: If there's an error fetching events
        """
        try:
            events = await db.calendarevent.find_many()
            return [event.dict() for event in events]
        except PrismaError as e:
            logger.error(f"Error fetching events: {str(e)}")
            raise EventServicesError("Failed to retrieve events") from e
        except Exception as e:
            logger.error(f"Unexpected error fetching events: {str(e)}")
            raise EventServicesError("An unexpected error occurred") from e

    @staticmethod
    async def create_event(db: Prisma, data: Dict) -> Dict:
        """
        Create a new calendar event
        Args:
            data: Dictionary containing event data
        Returns:
            Created event dictionary
        Raises:
            InvalidEventDataError: If required fields are missing or invalid
            EventConflictError: If there's a conflict (e.g., duplicate ID)
            EventServicesError: For other database errors
        """
        try:
            # Validate required fields
            required_fields = ["id", "title", "start", "allDay", "priority"]
            if not all(field in data for field in required_fields):
                raise InvalidEventDataError("Missing required event fields")

            # Validate date formats
            try:
                datetime.fromisoformat(data["start"])
                if "end" in data and data["end"]:
                    datetime.fromisoformat(data["end"])
            except (ValueError, TypeError) as e:
                raise InvalidEventDataError("Invalid date format") from e

            # Validate priority
            if data["priority"] not in {1, 2, 3}:
                raise InvalidEventDataError("Priority must be 1, 2, or 3")

            event = await db.calendarevent.create(
                data={
                    "id": data["id"],
                    "title": data["title"],
                    "start": data["start"],
                    "end": data.get("end"),
                    "allDay": data["allDay"],
                    "priority": data["priority"],
                }
            )
            return event.dict()
        except UniqueViolationError as e:
            logger.error(f"Duplicate event ID: {data.get('id')}")
            raise EventConflictError("Event with this ID already exists") from e
        except DataError as e:
            logger.error(f"Data error creating event: {str(e)}")
            raise InvalidEventDataError("Invalid event data") from e
        except PrismaError as e:
            logger.error(f"Database error creating event: {str(e)}")
            raise EventServicesError("Failed to create event") from e
        except Exception as e:
            logger.error(f"Unexpected error creating event: {str(e)}")
            raise EventServicesError("An unexpected error occurred") from e

    @staticmethod
    async def update_event(db: Prisma, event_id: str, data: Dict) -> Dict:
        """
        Update an existing calendar event
        Args:
            event_id: ID of the event to update
            data: Dictionary containing fields to update
        Returns:
            Updated event dictionary
        Raises:
            EventNotFoundError: If event doesn't exist
            InvalidEventDataError: If update data is invalid
            EventServicesError: For other database errors
        """
        try:
            # Validate data if present
            if "start" in data:
                try:
                    datetime.fromisoformat(data["start"])
                except (ValueError, TypeError) as e:
                    raise InvalidEventDataError("Invalid start date format") from e

            if "end" in data and data["end"]:
                try:
                    datetime.fromisoformat(data["end"])
                except (ValueError, TypeError) as e:
                    raise InvalidEventDataError("Invalid end date format") from e

            if "priority" in data and data["priority"] not in {1, 2, 3}:
                raise InvalidEventDataError("Priority must be 1, 2, or 3")

            event = await db.calendarevent.update(
                where={"id": event_id},
                data={
                    "title": data.get("title"),
                    "start": data.get("start"),
                    "end": data.get("end"),
                    "allDay": data.get("allDay"),
                    "priority": data.get("priority"),
                },
            )
            return event.dict()
        except PrismaError as e:
            if "RecordNotFound" in str(e):
                logger.error(f"Event not found: {event_id}")
                raise EventNotFoundError("Event not found") from e
            logger.error(f"Database error updating event {event_id}: {str(e)}")
            raise EventServicesError("Failed to update event") from e
        except Exception as e:
            logger.error(f"Unexpected error updating event {event_id}: {str(e)}")
            raise EventServicesError("An unexpected error occurred") from e

    @staticmethod
    async def delete_event(db: Prisma, event_id: str) -> bool:
        """
        Delete a calendar event
        Args:
            event_id: ID of the event to delete
        Returns:
            True if deletion was successful
        Raises:
            EventNotFoundError: If event doesn't exist
            EventServicesError: For other database errors
        """
        try:
            await db.calendarevent.delete(where={"id": event_id})
            return True
        except PrismaError as e:
            if "RecordNotFound" in str(e):
                logger.error(f"Event not found for deletion: {event_id}")
                raise EventNotFoundError("Event not found") from e
            logger.error(f"Database error deleting event {event_id}: {str(e)}")
            raise EventServicesError("Failed to delete event") from e
        except Exception as e:
            logger.error(f"Unexpected error deleting event {event_id}: {str(e)}")
            raise EventServicesError("An unexpected error occurred") from e
