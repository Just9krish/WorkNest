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

  useEffect(() => {
    if (!user) {
      setCalendarEvents([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const response = await listRows(TABLES.calendarEvents, [
          queryByUserId(user.$id),
        ]);
        if (cancelled) return;

        setCalendarEvents(response.rows.map(mapCalendarEventFromDocument));
      } catch (err) {
        if (!cancelled)
          console.error("Unexpected error loading calendar events:", err);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const addCalendarEvent = useCallback(
    async (
      event: Omit<CalendarEvent, "$id" | "userId" | "$createdAt" | "$updatedAt">
    ) => {
      if (!user) throw new Error("User not authenticated");
      try {
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
      } catch (error) {
        throw error;
      }
    },
    [user]
  );

  const updateCalendarEvent = useCallback(
    async (eventId: string, updates: Partial<CalendarEvent>) => {
      try {
        await updateRow(TABLES.calendarEvents, eventId, updates);
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const deleteCalendarEvent = useCallback(async (eventId: string) => {
    try {
      await deleteRow(TABLES.calendarEvents, eventId);
    } catch (error) {
      throw error;
    }
  }, []);

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
