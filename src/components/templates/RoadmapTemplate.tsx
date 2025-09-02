import React, { useState } from "react";
import { Plus, Calendar, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { RoadmapTask } from "../../types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";

const RoadmapTemplate: React.FC = () => {
  const { roadmapTasks, addRoadmapTask, updateRoadmapTask, deleteRoadmapTask } =
    useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Calculate statistics
  const completedTasks = roadmapTasks.filter(
    (task) => task.status === "Completed"
  ).length;
  const inProgressTasks = roadmapTasks.filter(
    (task) => task.status === "In Progress"
  ).length;
  const notStartedTasks = roadmapTasks.filter(
    (task) => task.status === "Not Started"
  ).length;
  const overallProgress =
    roadmapTasks.length > 0
      ? Math.round(
          roadmapTasks.reduce((sum, task) => sum + task.progress, 0) /
            roadmapTasks.length
        )
      : 0;

  const handleProgressChange = (taskId: string, progress: number) => {
    updateRoadmapTask(taskId, { progress });
  };

  const handleStatusChange = (
    taskId: string,
    status: RoadmapTask["status"]
  ) => {
    const progress =
      status === "Completed" ? 100 : status === "In Progress" ? 50 : 0;
    updateRoadmapTask(taskId, { status, progress });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Planning":
        return "bg-primary/10 text-primary";
      case "Design":
        return "bg-chart-2/10 text-chart-2";
      case "Development":
        return "bg-chart-3/10 text-chart-3";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-chart-3";
      case "In Progress":
        return "text-chart-2";
      case "Not Started":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="flex-1 bg-background">
      {/* Header */}
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Project Roadmap
        </h1>
        <p className="text-muted-foreground">
          Track your project milestones and progress
        </p>
      </div>

      {/* Statistics Bar */}
      <div className="px-8 py-6 bg-muted border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-chart-3">
              {completedTasks}
            </div>
            <div className="text-sm text-muted-foreground">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-chart-2">
              {inProgressTasks}
            </div>
            <div className="text-sm text-muted-foreground">
              Tasks In Progress
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {notStartedTasks}
            </div>
            <div className="text-sm text-muted-foreground">
              Tasks Not Started
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {overallProgress}%
            </div>
            <div className="text-sm text-muted-foreground">
              Overall Progress
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* Add Milestone Button */}
        <div className="mb-6">
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={16} className="mr-2" />
            Add Milestone
          </Button>
        </div>

        {/* Task Cards */}
        <div className="space-y-4">
          {roadmapTasks.map((task) => (
            <Card key={task.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-card-foreground mr-3">
                      {task.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        task.category
                      )}`}
                    >
                      {task.category}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    {task.description}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground space-x-4">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {task.startDate} - {task.endDate}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteRoadmapTask(task.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              {/* Progress Slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-card-foreground">
                    Progress
                  </span>
                  <span className="text-sm font-medium text-card-foreground">
                    {task.progress}%
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progress}
                    onChange={(e) =>
                      handleProgressChange(task.id, parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${task.progress}%, hsl(var(--muted)) ${task.progress}%, hsl(var(--muted)) 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="flex items-center justify-between">
                <select
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(
                      task.id,
                      e.target.value as RoadmapTask["status"]
                    )
                  }
                  className={`px-3 py-1 rounded-md border border-input text-sm font-medium bg-background text-foreground ${getStatusColor(
                    task.status
                  )} focus:outline-none focus:ring-2 focus:ring-ring`}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Milestone Modal */}
      <AddMilestoneModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
};

const AddMilestoneModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const { addRoadmapTask } = useApp();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Planning" as RoadmapTask["category"],
    startDate: "",
    endDate: "",
    progress: 0,
    status: "Not Started" as RoadmapTask["status"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      addRoadmapTask(formData);
      onOpenChange(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Milestone</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Title <span className="text-destructive">*</span>
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
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Planning">Planning</option>
              <option value="Design">Design</option>
              <option value="Development">Development</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Start Date
              </label>
              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                End Date
              </label>
              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Milestone</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoadmapTemplate;
