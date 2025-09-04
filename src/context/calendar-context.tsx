import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CalendarEvent } from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "./auth-context";

interface CalendarContextValue {
  calendarEvents: CalendarEvent[];
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
      const { data } = await supabase.from("calendar_events").select("*");
      if (cancelled) return;
      setCalendarEvents((data || []) as CalendarEvent[]);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const value = useMemo(() => ({ calendarEvents }), [calendarEvents]);
  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within CalendarProvider");
  return ctx;
}


