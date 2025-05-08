"use client";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { DateSelectArg, EventClickArg, EventApi } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";

enum Priority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

interface DialogBoxProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface EventViewProps {
  eventTitle: string;
  setEventTitle: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  onDelete?: () => void;
  priority: Priority; // Add this
  setPriority: React.Dispatch<React.SetStateAction<Priority>>; // Add this
}

export default function Calendar() {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | null>(null);
  const [clickedEvent, setClickedEvent] = useState<EventClickArg | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [priority, setPriority] = useState<Priority>(Priority.LOW);

  // Get the events from local storage
  useEffect(() => {
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) {
      setCurrentEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Save the events to local storage when changed
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(currentEvents));
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

  const handleAddEvent = (e: React.FormEvent) => {
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
      priority: priority, // Add priority to the event
    };

    calendarApi.addEvent(newEvent);
    handleCloseDialog();
  };

  const handleUpdateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle || !clickedEvent) return;

    clickedEvent.event.setProp("title", eventTitle);
    clickedEvent.event.setProp("priority", priority); // Update priority
    handleCloseDialog();
  };

  const handleDeleteEvent = () => {
    if (clickedEvent) {
      clickedEvent.event.remove();
      handleCloseDialog();
    }
  };

  return (
    <div className="flex w-full px-10 gap-8">
      <div className="w-3/12">
        <h2 className="text-2xl font-bold py-10 px-7">Calendar Events</h2>
        <ul className="space-y-4">
          {currentEvents.length === 0 && (
            <p className="text-center italic text-gray-400">
              No Events Present
            </p>
          )}
          {currentEvents.map((event) => (
            <li
              key={event.id}
              className="border px-4 py-2 rounded-md shadow text-blue-800"
            >
              <p>{event.title}</p>
              <p className="text-slate-900 text-sm">
                {event.start?.toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-9/12 mt-8">
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
          height="85vh"
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

const DialogBox: React.FC<DialogBoxProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

const EventView: React.FC<EventViewProps> = ({
  eventTitle,
  setEventTitle,
  handleSubmit,
  isEditing,
  onDelete,
  priority,
  setPriority,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {isEditing ? "Edit Event" : "Add New Event"}
        </h2>
        <label className="block mb-2">
          Event Title:
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            className="border rounded-md p-2 w-full"
            required
          />
        </label>

        <label className="block mb-4">
          Priority:
          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) as Priority)}
            className="border rounded-md p-2 w-full"
          >
            <option value={Priority.LOW}>Low</option>
            <option value={Priority.MEDIUM}>Medium</option>
            <option value={Priority.HIGH}>High</option>
          </select>
        </label>

        <div className="flex justify-end gap-2">
          {isEditing && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {isEditing ? "Update" : "Add"} Event
          </button>
        </div>
      </div>
    </form>
  );
};
