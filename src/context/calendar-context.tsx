import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CalendarEvent } from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "./auth-context";
import { mapCalendarEventFromRow } from "../lib/mappers";

interface CalendarContextValue {
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, "id" | "userId" | "createdAt">) => Promise<void>;
  updateCalendarEvent: (eventId: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteCalendarEvent: (eventId: string) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextValue | undefined>(undefined);

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
      const { data } = await supabase.from("calendar_events").select("*").order("date", { ascending: true });
      if (cancelled) return;
      setCalendarEvents((data || []).map(mapCalendarEventFromRow));
    };
    load();

    const channel = supabase
      .channel("public:calendar_events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "calendar_events" },
        payload => {
          if (payload.eventType === "INSERT") {
            setCalendarEvents(prev => [...prev, mapCalendarEventFromRow(payload.new)]);
          }
          if (payload.eventType === "UPDATE") {
            setCalendarEvents(prev =>
              prev.map(event =>
                event.id === payload.new.id ? mapCalendarEventFromRow(payload.new) : event
              )
            );
          }
          if (payload.eventType === "DELETE") {
            setCalendarEvents(prev => prev.filter(event => event.id !== (payload.old.id as string)));
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addCalendarEvent = useCallback(
    async (event: Omit<CalendarEvent, "id" | "userId" | "createdAt">) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase.from("calendar_events").insert({
        user_id: user.id,
        title: event.title,
        date: event.date,
        time: event.time,
        tag: event.tag,
        color: event.color,
        // description: event.description, // Temporarily commented out
      });
      if (error) throw error;
    },
    [user]
  );

  const updateCalendarEvent = useCallback(
    async (eventId: string, updates: Partial<CalendarEvent>) => {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.time !== undefined) dbUpdates.time = updates.time;
      if (updates.tag !== undefined) dbUpdates.tag = updates.tag;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      // if (updates.description !== undefined) dbUpdates.description = updates.description; // Temporarily commented out

      const { error } = await supabase.from("calendar_events").update(dbUpdates).eq("id", eventId);
      if (error) throw error;
    },
    []
  );

  const deleteCalendarEvent = useCallback(async (eventId: string) => {
    const { error } = await supabase.from("calendar_events").delete().eq("id", eventId);
    if (error) throw error;
  }, []);

  const value = useMemo(
    () => ({ calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent }),
    [calendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent]
  );
  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within CalendarProvider");
  return ctx;
}


