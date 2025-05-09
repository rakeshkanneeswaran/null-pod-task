'use server';


import { EventService } from '@/data-core/services/event-service';

export type CalendarEvent = {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    priority: number;
};

export async function getAppEvents(): Promise<CalendarEvent[]> {
    const response = await EventService.getAppEvents();
    return response;
}

export async function createEvent(event: CalendarEvent): Promise<CalendarEvent> {
    const response = await EventService.createEvent(event)
    return response;
}

export async function updateEvent(
    id: string,
    event: Partial<CalendarEvent>
): Promise<CalendarEvent> {
    const response = await EventService.updateEvent(id, event);
    return response;
}

export async function deleteEvent(id: string): Promise<CalendarEvent> {
    const response = await EventService.deleteEvent(id);
    return response
}
