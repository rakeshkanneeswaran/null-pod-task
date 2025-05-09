from fastapi import FastAPI, Request
from prisma import Prisma
import uvicorn

app = FastAPI()
db = Prisma()


@app.on_event("startup")
async def startup():
    await db.connect()


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()


@app.get("/events")
async def get_events():
    events = await db.calendarevent.find_many()
    return events


@app.post("/events")
async def create_event(request: Request):
    data = await request.json()
    print("Received data:", data)

    event = await db.calendarevent.create(
        data={
            "id": data["id"],
            "title": data["title"],
            "start": data["start"],
            "end": data["end"],
            "allDay": data["allDay"],
            "priority": data["priority"],
        }
    )
    return event


@app.post("/events/update/{event_id}")
async def update_event(event_id: str, request: Request):
    data = await request.json()
    updated = await db.calendarevent.update(
        where={"id": event_id},
        data={
            "title": data.get("title"),
            "start": data.get("start"),
            "end": data.get("end"),
            "allDay": data.get("allDay"),
            "priority": data.get("priority"),
        },
    )
    return updated


@app.delete("/events/{event_id}")
async def delete_event(event_id: str):
    deleted = await db.calendarevent.delete(where={"id": event_id})
    return deleted


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=3001, reload=True)
