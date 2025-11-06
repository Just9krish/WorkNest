import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { CalendarEvent } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DatePicker } from "../ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import {
  CalendarProvider,
  CalendarHeader,
  CalendarBody,
  CalendarDate,
  CalendarDatePagination,
  CalendarItem,
  useCalendarMonth,
  useCalendarYear,
  monthsForLocale,
} from "../kibo-ui/calendar";

// Component to display month and year as text
const MonthYearDisplay: React.FC = () => {
  const [month] = useCalendarMonth();
  const [year] = useCalendarYear();

  // Get month name using the locale-aware function
  const monthNames = monthsForLocale("en-US", "long");
  const monthName = monthNames[month];

  return (
    <div className="flex items-center justify-center px-4">
      <span className="text-lg font-bold text-foreground">
        {monthName} {year}
      </span>
    </div>
  );
};

const CalendarTemplate: React.FC = () => {
  const { calendarEvents } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Get view mode from query params, validate and default to "month"
  const viewParam = searchParams.get("view");
  const isValidView = viewParam === "month" || viewParam === "week";
  const viewMode: "month" | "week" = isValidView ? viewParam : "month";

  // Update query params when view mode changes
  const handleViewModeChange = (mode: "month" | "week") => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set("view", mode);
      return newParams;
    });
  };

  // Initialize view param if not present or invalid
  useEffect(() => {
    if (!isValidView) {
      setSearchParams(
        prev => {
          const newParams = new URLSearchParams(prev);
          newParams.set("view", "month");
          return newParams;
        },
        { replace: true }
      );
    }
  }, [isValidView, setSearchParams]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateClick = (_day: number, date: Date) => {
    const dateString = formatDate(date);
    setSelectedDate(dateString);
    setShowAddModal(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setShowAddModal(true);
  };

  const tagColors = [
    { name: "Meeting", color: "bg-primary" },
    { name: "Review", color: "bg-chart-2" },
    { name: "Planning", color: "bg-chart-3" },
    { name: "Deadline", color: "bg-destructive" },
    { name: "Personal", color: "bg-chart-4" },
  ];

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Calendar
            </h1>
            <p className="text-muted-foreground">
              Organize events and deadlines
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              onClick={() => handleViewModeChange("month")}
            >
              Month
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              onClick={() => handleViewModeChange("week")}
            >
              Week
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Controls and Grid */}
      <CalendarProvider>
        <div className="px-8 py-4 border-b border-border flex items-center justify-between">
          <CalendarDate>
            <CalendarDatePagination>
              <MonthYearDisplay />
            </CalendarDatePagination>
          </CalendarDate>
          <Button
            onClick={() => {
              setSelectedDate(formatDate(new Date()));
              setShowAddModal(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Add Event
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="px-8 py-6">
          {viewMode === "month" && (
            <div className="border border-border rounded-lg overflow-hidden">
              <CalendarHeader className="bg-muted border-b" />
              <CalendarBody
                events={calendarEvents}
                onDayClick={handleDateClick}
              >
                {({ event }) =>
                  event ? (
                    <CalendarItem
                      event={event}
                      onClick={e => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                    />
                  ) : null
                }
              </CalendarBody>
            </div>
          )}

          {viewMode === "week" && (
            <div className="text-center text-muted-foreground py-12">
              <CalendarIcon
                size={48}
                className="mx-auto mb-4 text-muted-foreground/50"
              />
              <p className="text-lg">Week view coming soon!</p>
              <p className="text-sm">
                For now, enjoy the month view with full functionality.
              </p>
            </div>
          )}
        </div>
      </CalendarProvider>

      {/* Add/Edit Event Modal */}
      <EventModal
        event={editingEvent}
        selectedDate={selectedDate}
        tagColors={tagColors}
        open={showAddModal}
        onOpenChange={open => {
          setShowAddModal(open);
          if (!open) {
            setEditingEvent(null);
            setSelectedDate("");
          }
        }}
      />
    </div>
  );
};

const EventModal: React.FC<{
  event: CalendarEvent | null;
  selectedDate: string;
  tagColors: { name: string; color: string; }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ event, selectedDate, tagColors, open, onOpenChange }) => {
  const { addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } =
    useApp();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const [formData, setFormData] = useState<
    Omit<CalendarEvent, "$id" | "userId" | "$createdAt" | "$updatedAt">
  >({
    title: event?.title || "",
    date: event?.date || selectedDate,
    time: event?.time || "09:00",
    tag: event?.tag || "Meeting",
    color: event?.color || "bg-blue-500",
    description: event?.description || null,
  });

  // Update form data when selectedDate changes (only when adding new event, not editing)
  useEffect(() => {
    if (!event && selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
      }));
    }
  }, [selectedDate, event]);

  // Reset form data when modal opens/closes or event changes
  useEffect(() => {
    if (open) {
      setFormData({
        title: event?.title || "",
        date: event?.date || selectedDate,
        time: event?.time || "09:00",
        tag: event?.tag || "Meeting",
        color: event?.color || "bg-blue-500",
        description: event?.description || null,
      });
    }
  }, [open, event, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      if (event) {
        updateCalendarEvent(event.$id, formData);
      } else {
        // Type assertion needed due to AppContext type definition mismatch
        addCalendarEvent(
          formData as Omit<CalendarEvent, "id" | "userId" | "createdAt">
        );
      }
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (event) {
      deleteCalendarEvent(event.$id);
      onOpenChange(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Add New Event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Event Title <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <Textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Add event description..."
              className="min-h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <DatePicker
                label="Date"
                date={formData.date ? new Date(formData.date) : undefined}
                onChange={date => {
                  const dateString = formatDate(date);
                  setFormData(prev => ({ ...prev, date: dateString }));
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Time
              </label>
              <Input
                type="time"
                name="time"
                value={formData.time || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Tag
            </label>
            <Select
              value={formData.tag}
              onValueChange={value => {
                const selectedTag = tagColors.find(t => t.name === value);
                setFormData(prev => ({
                  ...prev,
                  tag: value,
                  color: selectedTag?.color || "bg-blue-500",
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a tag" />
              </SelectTrigger>
              <SelectContent>
                {tagColors.map(tag => (
                  <SelectItem key={tag.name} value={tag.name}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${tag.color}`} />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex justify-between items-center pt-4">
            {event && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            )}
            <div className="flex space-x-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{event ? "Update" : "Add"} Event</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarTemplate;
