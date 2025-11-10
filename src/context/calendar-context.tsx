import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CalendarEvent } from "../types";
import {
  listRows,
  createRow,
  updateRow,
  deleteRow,
  TABLES,
  queryByUserId,
} from "../lib/appwrite";
import { useAuth } from "./auth-context";
import { mapCalendarEventFromDocument } from "../lib/mappers";
import { ID } from "appwrite";

interface CalendarContextValue {
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (
    event: Omit<CalendarEvent, "$id" | "userId" | "$createdAt" | "$updatedAt">
  ) => Promise<void>;
  updateCalendarEvent: (
    eventId: string,
    updates: Partial<CalendarEvent>
  ) => Promise<void>;
  deleteCalendarEvent: (eventId: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextValue | undefined>(
  undefined
);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const loadEvents = useCallback(async () => {
    if (!user) {
      setCalendarEvents([]);
      return;
    }
    try {
      const response = await listRows(TABLES.calendarEvents, [
        queryByUserId(user.$id),
      ]);
      setCalendarEvents(response.rows.map(mapCalendarEventFromDocument));
    } catch (err) {
      console.error("Unexpected error loading calendar events:", err);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await loadEvents();
      if (cancelled) return;
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [loadEvents]);

  const addCalendarEvent = useCallback(
    async (
      event: Omit<CalendarEvent, "$id" | "userId" | "$createdAt" | "$updatedAt">
    ) => {
      if (!user) throw new Error("User not authenticated");
      await createRow(
        TABLES.calendarEvents,
        {
          userId: user.$id,
          title: event.title,
          date: event.date,
          time: event.time,
          tag: event.tag,
          color: event.color,
          description: event.description,
        },
        ID.unique()
      );
      // Reload events after adding
      await loadEvents();
    },
    [user, loadEvents]
  );

  const updateCalendarEvent = useCallback(
    async (eventId: string, updates: Partial<CalendarEvent>) => {
      await updateRow(TABLES.calendarEvents, eventId, updates);
      // Reload events after updating
      await loadEvents();
    },
    [loadEvents]
  );

  const deleteCalendarEvent = useCallback(
    async (eventId: string) => {
      await deleteRow(TABLES.calendarEvents, eventId);
      // Reload events after deleting
      await loadEvents();
    },
    [loadEvents]
  );

  const value = useMemo(
    () => ({
      calendarEvents,
      addCalendarEvent,
      updateCalendarEvent,
      deleteCalendarEvent,
    }),
    [calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent]
  );
  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within CalendarProvider");
  return ctx;
}
