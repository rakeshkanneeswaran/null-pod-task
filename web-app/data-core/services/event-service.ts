import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BACKEND_URL!;

export type CalendarEvent = {
    id: string;
    title: string;
    start: string;  // ISO format
    end: string;
    allDay: boolean;
    priority: number;
};

/**
 * Service class to interact with the backend event APIs.
 */
export class EventService {
    /**
     * Fetch all calendar events.
     * @returns A promise that resolves to an array of CalendarEvent.
     * @throws Error if the request fails.
     */
    static async getAppEvents(): Promise<CalendarEvent[]> {
        try {
            const response = await axios.get(`${BASE_URL}/events`);
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error('Axios error while fetching events:', error.message);
                throw new Error(error.response?.data?.message || 'Failed to fetch events.');
            }
            console.error('Unexpected error while fetching events:', error);
            throw new Error('Unexpected error occurred while fetching events.');
        }
    }

    /**
     * Create a new calendar event.
     * @param event - The calendar event data to create.
     * @returns A promise that resolves to the created CalendarEvent.
     * @throws Error if the request fails.
     */
    static async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
        try {
            const response = await axios.post(`${BASE_URL}/events`, event);
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error('Axios error while creating event:', error.message);
                throw new Error(error.response?.data?.message || 'Failed to create event.');
            }
            console.error('Unexpected error while creating event:', error);
            throw new Error('Unexpected error occurred while creating event.');
        }
    }

    /**
     * Update an existing calendar event.
     * @param id - The ID of the event to update.
     * @param event - Partial event data containing fields to update.
     * @returns A promise that resolves to the updated CalendarEvent.
     * @throws Error if the request fails.
     */
    static async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
        try {
            const response = await axios.post(`${BASE_URL}/events/update/${id}`, event);
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error(`Axios error while updating event ${id}:`, error.message);
                throw new Error(error.response?.data?.message || 'Failed to update event.');
            }
            console.error('Unexpected error while updating event:', error);
            throw new Error('Unexpected error occurred while updating event.');
        }
    }

    /**
     * Delete a calendar event.
     * @param id - The ID of the event to delete.
     * @returns A promise that resolves to the deleted CalendarEvent.
     * @throws Error if the request fails.
     */
    static async deleteEvent(id: string): Promise<CalendarEvent> {
        try {
            const response = await axios.delete(`${BASE_URL}/events/${id}`);
            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error(`Axios error while deleting event ${id}:`, error.message);
                throw new Error(error.response?.data?.message || 'Failed to delete event.');
            }
            console.error('Unexpected error while deleting event:', error);
            throw new Error('Unexpected error occurred while deleting event.');
        }
    }
}
