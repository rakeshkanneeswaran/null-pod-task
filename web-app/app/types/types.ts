// types.ts
export enum Priority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
}

export type CalendarEvent = {
    id: string;
    title: string;
    start: Date | null;
    end: Date | null;
    allDay: boolean;
    extendedProps: {
        priority: Priority;
    };
};

export type SortBy = "date" | "priority";