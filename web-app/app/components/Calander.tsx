"use client";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { DateSelectArg, EventClickArg, EventApi } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import { EventView } from "./EventView";
import { DialogBox } from "./DialogBox";
import { Priority } from "../types/types";
import { SortBy } from "../types/types";
import {
  createEvent,
  updateEvent,
  getAppEvents,
  deleteEvent,
} from "@/server-actions/action";
import { EventList } from "./EventList";

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

  const sortedEvents = React.useMemo(() => {
    const events = [...currentEvents];
    if (sortBy === "date") {
      return events.sort((a, b) => {
        const dateA = a.start ? new Date(a.start.toString()).getTime() : 0;
        const dateB = b.start ? new Date(b.start.toString()).getTime() : 0;
        return dateA - dateB;
      });
    } else {
      return events.sort((a, b) => {
        const priorityA = a.extendedProps?.priority || Priority.LOW;
        const priorityB = b.extendedProps?.priority || Priority.LOW;
        return priorityB - priorityA; // Higher priority first
      });
    }
  }, [currentEvents, sortBy]);

  useEffect(() => {
    const fetchEvents = async () => {
      const savedEvents = await getAppEvents();
      console.log("Fetched events from server:", savedEvents);
      if (savedEvents) {
        try {
          const parsedEvents = Array.isArray(savedEvents)
            ? savedEvents
            : JSON.parse(savedEvents);
          const transformedEvents = parsedEvents.map(
            (event: {
              id: string;
              title: string;
              start: string;
              end?: string;
              allDay: boolean;
              priority?: Priority;
            }) => ({
              ...event,
              extendedProps: {
                priority: event.priority ?? Priority.LOW,
              },
            })
          );
          setCurrentEvents(transformedEvents);
        } catch (error) {
          console.error("Failed to parse events from localStorage", error);
        }
      }
    };

    fetchEvents();
  }, [refreshTrigger]);

  // Save the events to local storage when changed
  useEffect(() => {
    const simplifiedEvents = currentEvents.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      extendedProps: {
        priority: event.extendedProps?.priority || Priority.LOW,
      },
    }));
    localStorage.setItem("events", JSON.stringify(simplifiedEvents));
  }, [currentEvents]);

  const handleDateClick = (selectedInfo: DateSelectArg) => {
    setSelectedDate(selectedInfo);
    setClickedEvent(null);
    setIsEditing(false);
    setEventTitle("");
    setIsDialogOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setClickedEvent(clickInfo);
    setSelectedDate(null);
    setEventTitle(clickInfo.event.title);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
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
      priority: priority,
      extendedProps: {
        priority: priority,
      },
    };

    await createEvent(newEvent);
    setRefreshTrigger((prev) => prev + 1);

    calendarApi.addEvent(newEvent);
    handleCloseDialog();
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !clickedEvent) return;

    // Update the event in FullCalendar
    clickedEvent.event.setProp("title", eventTitle);
    clickedEvent.event.setProp("priority", priority);

    await updateEvent(clickedEvent.event.id, {
      id: clickedEvent.event.id,
      title: eventTitle,
      start: clickedEvent.event.start
        ? clickedEvent.event.start.toISOString()
        : undefined,
      end: clickedEvent.event.end
        ? clickedEvent.event.end.toISOString()
        : undefined,
      allDay: clickedEvent.event.allDay,
      priority: priority,
    });
    // Update the event in currentEvents state
    setCurrentEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === clickedEvent.event.id
          ? {
              ...event,
              title: eventTitle,
              priority: priority,
              extendedProps: {
                ...event.extendedProps,
                priority: priority,
              },
            }
          : event
      )
    );
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
    <div className="flex flex-col lg:flex-row w-full px-4 sm:px-6 lg:px-10 gap-4 lg:gap-8 min-h-screen bg-gray-50 text-black">
      {/* Sidebar */}
      <EventList
        events={sortedEvents.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.start ? new Date(event.start) : null,
          end: event.end ? new Date(event.end) : null,
          allDay: event.allDay,
          extendedProps: {
            priority: event.extendedProps?.priority || Priority.LOW,
          },
        }))}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Calendar */}
      <div className="w-full lg:w-9/12 bg-white rounded-xl shadow-md p-4 lg:p-6">
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
          eventsSet={(events) => setCurrentEvents(events)}
          initialEvents={
            typeof window !== "undefined"
              ? JSON.parse(localStorage.getItem("events") || "[]")
              : []
          }
          height="auto"
          aspectRatio={1.5}
          eventClassNames="hover:cursor-pointer"
          dayHeaderClassNames="font-medium text-gray-700"
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
          }}
          eventColor="#3b82f6"
          eventBackgroundColor="#3b82f6"
          eventBorderColor="#3b82f6"
        />
      </div>

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
