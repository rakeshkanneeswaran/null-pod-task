"use client";
import Calendar from "@/app/components/Calander";
import React from "react";

export default function page() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center">Calendar</h1>
      <div className="flex justify-center items-center">
        <Calendar />
      </div>
    </div>
  );
}
