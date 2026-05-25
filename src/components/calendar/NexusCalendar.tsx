import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateSelectArg, EventInput } from '@fullcalendar/core';
import { AvailabilitySlot, Meeting, MeetingRequest } from '../../types';

export type CalendarEventKind = 'availability' | 'meeting' | 'request';

export interface NexusCalendarEvent extends EventInput {
  extendedProps: {
    kind: CalendarEventKind;
    resourceId: string;
  };
}

interface NexusCalendarProps {
  availabilitySlots: AvailabilitySlot[];
  meetings: Meeting[];
  meetingRequests: MeetingRequest[];
  userId: string;
  onSelectRange?: (start: string, end: string) => void;
  onEventClick?: (kind: CalendarEventKind, resourceId: string) => void;
}

export const NexusCalendar: React.FC<NexusCalendarProps> = ({
  availabilitySlots,
  meetings,
  meetingRequests,
  userId,
  onSelectRange,
  onEventClick,
}) => {
  const events = useMemo((): NexusCalendarEvent[] => {
    const slotEvents: NexusCalendarEvent[] = availabilitySlots.map((slot) => ({
      id: `slot-${slot.id}`,
      title: slot.title,
      start: slot.startAt,
      end: slot.endAt,
      backgroundColor: '#d1fae5',
      borderColor: '#10b981',
      textColor: '#065f46',
      extendedProps: { kind: 'availability', resourceId: slot.id },
    }));

    const meetingEvents: NexusCalendarEvent[] = meetings.map((m) => ({
      id: `meet-${m.id}`,
      title: m.title,
      start: m.startAt,
      end: m.endAt,
      backgroundColor: '#dbeafe',
      borderColor: '#2563eb',
      textColor: '#1e3a8a',
      extendedProps: { kind: 'meeting', resourceId: m.id },
    }));

    const requestEvents: NexusCalendarEvent[] = meetingRequests
      .filter((r) => r.status === 'pending' && (r.senderId === userId || r.receiverId === userId))
      .map((r) => ({
        id: `req-${r.id}`,
        title: `${r.title} (pending)`,
        start: r.startAt,
        end: r.endAt,
        backgroundColor: '#fef3c7',
        borderColor: '#d97706',
        textColor: '#92400e',
        extendedProps: { kind: 'request', resourceId: r.id },
      }));

    return [...slotEvents, ...meetingEvents, ...requestEvents];
  }, [availabilitySlots, meetings, meetingRequests, userId]);

  const handleSelect = (info: DateSelectArg) => {
    onSelectRange?.(info.start.toISOString(), info.end.toISOString());
  };

  const handleEventClick = (info: EventClickArg) => {
    const kind = info.event.extendedProps.kind as CalendarEventKind;
    const resourceId = info.event.extendedProps.resourceId as string;
    onEventClick?.(kind, resourceId);
  };

  return (
    <div className="nexus-calendar bg-white rounded-lg border border-gray-200 p-2 md:p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        slotMinTime="07:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        selectable
        selectMirror
        editable={false}
        events={events}
        select={handleSelect}
        eventClick={handleEventClick}
        height="auto"
        nowIndicator
      />
    </div>
  );
};
