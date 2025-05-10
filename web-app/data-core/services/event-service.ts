import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.BACKEND_URL!

export type CalendarEvent = {
    id: string;
    title: string;
    start: string;  // ISO format
    end: string;
    allDay: boolean;
    priority: number;
};

export class EventService {
    static async getAppEvents(): Promise<CalendarEvent[]> {
        const response = await axios.get(`${BASE_URL}/events`);
        return response.data;
    }

    static async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
        const response = await axios.post(`${BASE_URL}/events`, event);
        return response.data;
    }

    static async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
        const response = await axios.post(`${BASE_URL}/events/update/${id}`, event);
        return response.data;
    }

    static async deleteEvent(id: string): Promise<CalendarEvent> {
        const response = await axios.delete(`${BASE_URL}/events/${id}`);
        return response.data;
    }
}
