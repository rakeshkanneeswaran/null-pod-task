
import dotenv from 'dotenv';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


dotenv.config();

/**
 * Service class to interact with the backend event APIs.
 */
export type CalendarEvent = {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay: boolean;
    priority: number;
};

export class EventService {
    /**
     * Fetch all calendar events.
     */
    static async getAppEvents(): Promise<CalendarEvent[]> {
        return await prisma.calendarEvent.findMany();
    }

    /**
     * Create a new calendar event.
     */
    static async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
        return await prisma.calendarEvent.create({
            data: {
                id: event.id,
                title: event.title,
                start: event.start,
                end: event.end,
                allDay: event.allDay,
                priority: event.priority,
            },
        });
    }

    /**
     * Update an existing calendar event.
     */
    static async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
        return await prisma.calendarEvent.update({
            where: { id },
            data: {
                title: event.title,
                start: event.start,
                end: event.end,
                allDay: event.allDay,
                priority: event.priority,
            },
        });
    }

    /**
     * Delete a calendar event.
     */
    static async deleteEvent(id: string): Promise<CalendarEvent> {
        return await prisma.calendarEvent.delete({
            where: { id },
        });
    }
}
