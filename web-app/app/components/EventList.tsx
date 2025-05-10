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
    <div className="w-full bg-white rounded-xl shadow-md p-4 lg:p-6 h-fit lg:sticky lg:top-4">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Calendar Events</h2>
        </div>

        {/* Sort Controls */}
        <div className="mt-4 mb-4">
          <SortControls sortBy={sortBy} onSortChange={onSortChange} />
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto">
          {events.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3 pr-2">
              {events.map((event, index) => (
                <EventItem key={index} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SortControls: React.FC<{
  sortBy: SortBy;
  onSortChange: (sortBy: SortBy) => void;
}> = ({ sortBy, onSortChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Sort by:
    </label>
    <div className="flex gap-2">
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
    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex-1 ${
      active
        ? "bg-blue-600 text-white shadow-sm"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    {label}
  </button>
);

const EmptyState: React.FC = () => (
  <div className="text-center py-8 flex flex-col items-center justify-center h-full">
    <div className="text-gray-400 mb-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 mx-auto"
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
    <p className="text-gray-500 text-sm">No events scheduled</p>
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
      className={`p-3 rounded-lg border transition-all hover:shadow-sm ${priorityClass}`}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-medium text-gray-800 text-sm line-clamp-2 flex-1">
          {event.title}
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${priorityLabel.class}`}
        >
          {priorityLabel.text}
        </span>
      </div>
      <EventDateRange event={event} />
    </div>
  );
};

const EventDateRange: React.FC<{ event: CalendarEvent }> = ({ event }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "2-digit" : undefined,
    });
  };

  const startDate = event.start ? formatDate(new Date(event.start)) : "";
  const endDate = event.end ? formatDate(new Date(event.end)) : "";

  return (
    <div className="flex items-center mt-1.5 text-xs text-gray-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3.5 w-3.5 mr-1 flex-shrink-0"
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
      <span className="truncate">
        {startDate}
        {endDate && startDate !== endDate && ` - ${endDate}`}
      </span>
    </div>
  );
};
