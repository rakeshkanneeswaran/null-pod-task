// components/EventList.tsx
"use client";
import React from "react";
import { CalendarEvent, Priority, SortBy } from "../types/types";

interface EventListProps {
  events: CalendarEvent[];
  sortBy: SortBy;
  onSortChange: (sortBy: SortBy) => void;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="w-full sm:w-full lg:w-3/12 bg-white rounded-xl shadow-md p-4 lg:p-6 h-fit lg:sticky lg:top-4 mb-6 lg:mb-0">
      <h2 className="text-2xl font-bold text-gray-800 pb-4 border-b border-gray-200">
        Calendar Events
      </h2>

      <SortControls sortBy={sortBy} onSortChange={onSortChange} />

      {events.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {events.map((event, index) => (
            <EventItem key={index} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

const SortControls: React.FC<{
  sortBy: SortBy;
  onSortChange: (sortBy: SortBy) => void;
}> = ({ sortBy, onSortChange }) => (
  <div className="mb-6 mt-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Sort by:
    </label>
    <div className="flex flex-wrap gap-3">
      <SortButton
        active={sortBy === "date"}
        onClick={() => onSortChange("date")}
        label="Date"
      />
      <SortButton
        active={sortBy === "priority"}
        onClick={() => onSortChange("priority")}
        label="Priority"
      />
    </div>
  </div>
);

const SortButton: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active
        ? "bg-blue-600 text-white shadow-md"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    {label}
  </button>
);

const EmptyState: React.FC = () => (
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
);

const EventItem: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  const priorityClass = {
    [Priority.HIGH]: "border-red-200 bg-gradient-to-r from-red-50 to-red-100",
    [Priority.MEDIUM]:
      "border-yellow-200 bg-gradient-to-r from-yellow-50 to-yellow-100",
    [Priority.LOW]: "border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100",
  }[event.extendedProps.priority];

  const priorityLabel = {
    [Priority.HIGH]: { text: "High", class: "bg-red-100 text-red-800" },
    [Priority.MEDIUM]: {
      text: "Medium",
      class: "bg-yellow-100 text-yellow-800",
    },
    [Priority.LOW]: { text: "Low", class: "bg-blue-100 text-blue-800" },
  }[event.extendedProps.priority];

  return (
    <div
      className={`p-4 rounded-lg border transition-all hover:shadow-md ${priorityClass}`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-800">{event.title}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${priorityLabel.class}`}
        >
          {priorityLabel.text}
        </span>
      </div>
      <EventDateRange event={event} />
    </div>
  );
};

const EventDateRange: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  const startDate = event.start
    ? new Date(event.start).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const endDate = event.end
    ? new Date(event.end).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
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
        {startDate}
        {endDate && ` - ${endDate}`}
      </span>
    </div>
  );
};
