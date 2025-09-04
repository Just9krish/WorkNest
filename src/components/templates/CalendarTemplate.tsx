import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Trash2,
} from "lucide-react";
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

const CalendarTemplate: React.FC = () => {
  const { calendarEvents } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(
      new Date(currentYear, currentMonth + (direction === "next" ? 1 : -1), 1)
    );
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getEventsForDate = (date: string) => {
    return calendarEvents.filter(event => event.date === date);
  };

  const handleDateClick = (day: number) => {
    console.log('Date clicked:', day);
    const clickedDate = new Date(currentYear, currentMonth, day);
    const dateString = formatDate(clickedDate);
    console.log('Formatted date:', dateString);
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

  const renderCalendarGrid = () => {
    const days = [];
    const totalCells = 42; // 6 weeks × 7 days

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="h-24 p-1 border border-border bg-muted"
        ></div>
      );
    }

    // Days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = formatDate(date);
      const events = getEventsForDate(dateString);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 p-1 border border-border cursor-pointer hover:bg-muted transition-colors ${
            isToday ? "bg-primary/10 border-primary/30" : "bg-card"
          }`}
          onClick={() => handleDateClick(day)}
        >
          <div
            className={`text-sm font-medium mb-1 ${
              isToday ? "text-primary" : "text-card-foreground"
            }`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {events.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded text-white truncate ${event.color}`}
                onClick={e => {
                  e.stopPropagation();
                  handleEditEvent(event);
                }}
              >
                {event.title}
              </div>
            ))}
            {events.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{events.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    // Fill remaining cells
    const remainingCells = totalCells - firstDayOfMonth - daysInMonth;
    for (let i = 0; i < remainingCells; i++) {
      days.push(
        <div
          key={`empty-end-${i}`}
          className="h-24 p-1 border border-border bg-muted"
        ></div>
      );
    }

    return days;
  };

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
              onClick={() => setViewMode("month")}
            >
              Month
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              onClick={() => setViewMode("week")}
            >
              Week
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="px-8 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth("prev")}
          >
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-xl font-semibold text-foreground">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth("next")}
          >
            <ChevronRight size={20} />
          </Button>
        </div>
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
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div
                key={day}
                className="bg-muted p-3 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
            {/* Calendar cells */}
            {renderCalendarGrid()}
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
  tagColors: { name: string; color: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ event, selectedDate, tagColors, open, onOpenChange }) => {
  const { addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } =
    useApp();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [formData, setFormData] = useState({
    title: event?.title || "",
    date: event?.date || selectedDate,
    time: event?.time || "09:00",
    tag: event?.tag || "Meeting",
    color: event?.color || "bg-blue-500",
    description: (event as CalendarEvent)?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      if (event) {
        updateCalendarEvent(event.id, formData);
      } else {
        addCalendarEvent(formData);
      }
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (event) {
      deleteCalendarEvent(event.id);
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
              value={formData.description}
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
                value={formData.time}
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
