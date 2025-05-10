# server.py

from fastapi import FastAPI, Request
from prisma import Prisma
from services.event_services import EventServices
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
    data = await EventServices.get_all_events(db)
    print(data)
    return data


@app.post("/events")
async def create_event(request: Request):
    data = await request.json()

    return await EventServices.create_event(db, data)


@app.post("/events/update/{event_id}")
async def update_event(event_id: str, request: Request):
    data = await request.json()
    print(data)
    return await EventServices.update_event(db, event_id, data)


@app.delete("/events/{event_id}")
async def delete_event(event_id: str):
    return await EventServices.delete_event(db, event_id)


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=3001, reload=True)
