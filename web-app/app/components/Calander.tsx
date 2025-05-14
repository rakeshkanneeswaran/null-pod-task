"use client";
import React, { useState, useEffect, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg, EventApi } from "@fullcalendar/core";
import { EventView } from "./EventView";
import { DialogBox } from "./DialogBox";
import { EventList } from "./EventList";
import { Priority, SortBy } from "../types/types";
import {
  createEvent,
  updateEvent,
  getAppEvents,
  deleteEvent,
} from "@/app/server-actions/action";

export default function Calendar() {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [clickedEvent, setClickedEvent] = useState<EventClickArg | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [priority, setPriority] = useState<Priority>(Priority.LOW);
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const sortedEvents = useMemo(() => {
    const events = [...currentEvents];
    return sortBy === "date"
      ? events.sort((a, b) => {
          const dateA = new Date(a.start?.toString() || 0).getTime();
          const dateB = new Date(b.start?.toString() || 0).getTime();
          return dateA - dateB;
        })
      : events.sort((a, b) => {
          const priorityA = a.extendedProps?.priority || Priority.LOW;
          const priorityB = b.extendedProps?.priority || Priority.LOW;
          return priorityB - priorityA;
        });
  }, [currentEvents, sortBy]);

  useEffect(() => {
    const saveEvents = async () => {
      for (const event of currentEvents) {
        await updateEvent(event.id, {
          id: event.id,
          title: event.title,
          start: event.start?.toISOString(),
          end: event.end?.toISOString(),
          allDay: event.allDay,
          priority: event.extendedProps?.priority || Priority.LOW,
        });
      }
    };
    saveEvents();
  }, [currentEvents]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const savedEvents = await getAppEvents();
        const parsed = Array.isArray(savedEvents)
          ? savedEvents
          : JSON.parse(savedEvents);

        const transformed = parsed.map(
          ({
            id,
            title,
            start,
            end,
            allDay,
            priority,
          }: {
            id: string;
            title: string;
            start: string;
            end: string;
            allDay: boolean;
            priority?: Priority;
          }) => ({
            id,
            title,
            start,
            end,
            allDay,
            extendedProps: { priority: priority ?? Priority.LOW },
          })
        );
        setCurrentEvents(transformed);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [refreshTrigger]);

  const handleDateClick = (info: DateSelectArg) => {
    setSelectedDate(info);
    setClickedEvent(null);
    setIsEditing(false);
    setEventTitle("");
    setIsDialogOpen(true);
  };

  const handleEventClick = (info: EventClickArg) => {
    setSelectedEventId(info.event.id);
    setClickedEvent(info);
    setSelectedDate(null);
    setEventTitle(info.event.title);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedEventId("");
    setIsDialogOpen(false);
    setEventTitle("");
    setSelectedDate(null);
    setClickedEvent(null);
    setIsEditing(false);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !selectedDate) return;

    const calendarApi = selectedDate.view.calendar;
    calendarApi.unselect();

    const newEvent = {
      id: `${Date.now()}-${eventTitle}`,
      title: eventTitle,
      start: selectedDate.startStr,
      end: selectedDate.endStr,
      allDay: selectedDate.allDay,
      priority,
      extendedProps: { priority },
    };

    await createEvent(newEvent);
    setRefreshTrigger((prev) => prev + 1);
    calendarApi.addEvent(newEvent);
    handleCloseDialog();
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !clickedEvent) return;

    clickedEvent.event.setProp("title", eventTitle);
    clickedEvent.event.setExtendedProp("priority", priority);

    await updateEvent(selectedEventId, {
      id: clickedEvent.event.id,
      title: eventTitle,
      start: clickedEvent.event.start?.toISOString(),
      end: clickedEvent.event.end?.toISOString(),
      allDay: clickedEvent.event.allDay,
      priority,
    });

    setCurrentEvents((prev) =>
      prev.map((ev) =>
        ev.id === clickedEvent.event.id
          ? {
              ...ev,
              title: eventTitle,
              extendedProps: { priority },
            }
          : ev
      )
    );
    setSelectedEventId("");
    setRefreshTrigger((prev) => prev + 1);
    handleCloseDialog();
  };

  const handleDeleteEvent = async () => {
    if (clickedEvent) {
      await deleteEvent(clickedEvent.event.id);
      clickedEvent.event.remove();
      setRefreshTrigger((prev) => prev + 1);
      handleCloseDialog();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full px-2 sm:px-4 lg:px-6 gap-3 lg:gap-6 min-h-screen bg-gray-50 text-black">
      {/* Event List - Full width on mobile, 1/3 on desktop */}
      <div className="w-full lg:w-1/3 min-w-[280px] bg-white rounded-lg lg:rounded-xl shadow-sm lg:shadow-md p-3 lg:p-4 h-fit lg:sticky lg:top-4 max-h-[70vh] lg:max-h-[80vh] overflow-y-auto">
        <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">
          Event List
        </h2>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 lg:h-8 lg:w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : currentEvents.length > 0 ? (
          <EventList
            events={sortedEvents.map((eachEvent) => ({
              id: eachEvent.id,
              title: eachEvent.title,
              start: eachEvent.start ? new Date(eachEvent.start) : null,
              end: eachEvent.end ? new Date(eachEvent.end) : null,
              allDay: eachEvent.allDay,
              extendedProps: {
                priority: eachEvent.extendedProps?.priority || Priority.LOW,
              },
            }))}
            sortBy={sortBy}
            onSortChange={(newSortBy) => {
              setSortBy(newSortBy);
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-sm lg:text-base text-gray-500 italic">
              No events scheduled
            </p>
          </div>
        )}
      </div>

      {/* Calendar - Full width on mobile, 2/3 on desktop */}
      <div className="w-full lg:w-2/3 bg-white rounded-lg lg:rounded-xl shadow-sm lg:shadow-md p-3 lg:p-4">
        {isLoading ? (
          <div className="w-full flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 lg:h-12 lg:w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateClick}
            eventClick={handleEventClick}
            eventsSet={(events) => {
              setCurrentEvents(events);
            }}
            initialEvents={currentEvents.map((event) => ({
              id: event.id,
              title: event.title,
              start:
                typeof event.start === "string"
                  ? event.start
                  : event.start?.toISOString(),
              end:
                typeof event.end === "string"
                  ? event.end
                  : event.end?.toISOString(),
              allDay: event.allDay,
              extendedProps: {
                priority: event.extendedProps?.priority || Priority.LOW,
              },
            }))}
            height="auto"
            aspectRatio={1.2} // Slightly reduced for mobile
            eventClassNames="hover:cursor-pointer text-xs lg:text-sm"
            dayHeaderClassNames="font-medium text-gray-700 text-xs lg:text-sm"
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
              list: "List",
            }}
            views={{
              dayGridMonth: {
                titleFormat: { year: "numeric", month: "long" },
              },
              timeGridWeek: {
                titleFormat: {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                },
              },
              timeGridDay: {
                titleFormat: {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                },
              },
            }}
            eventColor="#3b82f6"
            eventBackgroundColor="#3b82f6"
            eventBorderColor="#3b82f6"
          />
        )}
      </div>

      {/* Dialog - remains unchanged */}
      {isDialogOpen && (
        <DialogBox isOpen={isDialogOpen} onClose={handleCloseDialog}>
          <EventView
            eventTitle={eventTitle}
            setEventTitle={setEventTitle}
            handleSubmit={isEditing ? handleUpdateEvent : handleAddEvent}
            isEditing={isEditing}
            onDelete={isEditing ? handleDeleteEvent : undefined}
            priority={priority}
            setPriority={setPriority}
          />
        </DialogBox>
      )}
    </div>
  );
}
