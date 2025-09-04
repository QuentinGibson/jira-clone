import {
  format,
  getDay,
  parse,
  startOfWeek,
  addMonths,
  subMonths,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { TaskStatus, TaskWithDetails } from "types";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/data-calendar.css";
import EventCard from "./event-card";

interface DataCalandarProps {
  data: TaskWithDetails[];
}

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function DataCalendar({ data }: DataCalandarProps) {
  const [values, setValues] = useState(
    data.length > 0 ? new Date(data[0]!.dueDate) : new Date(),
  );

  const events = data.map((task) => ({
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    title: task.name,
    project: task.project,
    assignee: task.assignee,
    status: task.status,
    id: task._id,
  }));

  const handleNavigation = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") {
      setValues(subMonths(values, 1));
    } else if (action === "NEXT") {
      setValues(addMonths(values, 1));
    } else if (action === "TODAY") {
      setValues(new Date());
    }
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        date={values}
        events={events}
        views={["month"]}
        defaultView="month"
        toolbar
        showAllEvents
        className="h-full"
        max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
        formats={{
          weekdayFormat: (date, culture, localizer) =>
            localizer?.format(date, "EEE", culture) ?? "",
        }}
        components={{
          eventWrapper: ({ event }) => (
            <EventCard
              id={event.id}
              title={event.title}
              assignee={event.assignee}
              project={event.project}
              status={event.status as TaskStatus}
            />
          ),
        }}
      />
    </div>
  );
}

export default DataCalendar;
