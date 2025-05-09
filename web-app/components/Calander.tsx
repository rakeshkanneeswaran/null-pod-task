"use client";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { DateSelectArg, EventClickArg, EventApi } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import { EventView } from "./EventView";
import { DialogBox } from "./DialogBox";
import {
  createEvent,
  updateEvent,
  getAppEvents,
  deleteEvent,
} from "@/server-actions/action";

enum Priority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

export default function Calendar() {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [clickedEvent, setClickedEvent] = useState<EventClickArg | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [priority, setPriority] = useState<Priority>(Priority.LOW);
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");
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
    <div className="flex flex-col lg:flex-row w-full px-4 sm:px-6 lg:px-10 gap-4 lg:gap-8 min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-full lg:w-3/12 bg-white rounded-xl shadow-md p-4 lg:p-6 h-fit lg:sticky lg:top-4">
        <h2 className="text-2xl font-bold text-gray-800 pb-4 border-b border-gray-200">
          Calendar Events
        </h2>

        {/* Sorting Controls */}
        <div className="mb-6 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort by:
          </label>
          <div className="flex space-x-3">
            <button
              onClick={() => setSortBy("date")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                sortBy === "date"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Date
            </button>
            <button
              onClick={() => setSortBy("priority")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                sortBy === "priority"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Priority
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {currentEvents.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-gray-400 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 italic">No events scheduled</p>
            </div>
          ) : (
            sortedEvents.map((event, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  event.extendedProps?.priority === Priority.HIGH
                    ? "border-red-200 bg-gradient-to-r from-red-50 to-red-100"
                    : event.extendedProps?.priority === Priority.MEDIUM
                    ? "border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100"
                    : "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">{event.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      event.extendedProps?.priority === Priority.HIGH
                        ? "bg-red-100 text-red-800"
                        : event.extendedProps?.priority === Priority.MEDIUM
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {event.extendedProps?.priority === Priority.HIGH
                      ? "High"
                      : event.extendedProps?.priority === Priority.MEDIUM
                      ? "Medium"
                      : "Low"}
                  </span>
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    {event.start
                      ? new Date(event.start).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : ""}
                    {event.end &&
                      ` - ${new Date(event.end).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
