# services/event_services.py

from prisma import Prisma


class EventServices:
    @staticmethod
    async def get_all_events(db: Prisma):
        return await db.calendarevent.find_many()

    @staticmethod
    async def create_event(db: Prisma, data: dict):
        return await db.calendarevent.create(
            data={
                "id": data["id"],
                "title": data["title"],
                "start": data["start"],
                "end": data["end"],
                "allDay": data["allDay"],
                "priority": data["priority"],
            }
        )

    @staticmethod
    async def update_event(db: Prisma, event_id: str, data: dict):
        return await db.calendarevent.update(
            where={"id": event_id},
            data={
                "title": data.get("title"),
                "start": data.get("start"),
                "end": data.get("end"),
                "allDay": data.get("allDay"),
                "priority": data.get("priority"),
            },
        )

    @staticmethod
    async def delete_event(db: Prisma, event_id: str):
        return await db.calendarevent.delete(where={"id": event_id})
