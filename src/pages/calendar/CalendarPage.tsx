import React, { useCallback, useMemo, useState } from 'react';
import { PlusCircle, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { NexusCalendar } from '../../components/calendar/NexusCalendar';
import { MeetingRequestCard } from '../../components/calendar/MeetingRequestCard';
import { SlotFormModal } from '../../components/calendar/SlotFormModal';
import { SendMeetingModal } from '../../components/calendar/SendMeetingModal';
import {
  availabilitySlots,
  meetingRequests,
  getAvailabilityForUser,
  getConfirmedMeetingsForUser,
  getIncomingMeetingRequests,
  getOutgoingMeetingRequests,
} from '../../data/meetings';
import { entrepreneurs, investors } from '../../data/users';
import { AvailabilitySlot } from '../../types';
import type { CalendarEventKind } from '../../components/calendar/NexusCalendar';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [slotModal, setSlotModal] = useState<{
    slot?: AvailabilitySlot | null;
    defaultStart?: string;
    defaultEnd?: string;
  } | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendDefaults, setSendDefaults] = useState<{ start?: string; end?: string }>({});

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const data = useMemo(() => {
    if (!user) {
      return {
        slots: [] as AvailabilitySlot[],
        confirmed: [],
        incoming: [],
        outgoing: [],
      };
    }
    void refreshKey;
    return {
      slots: getAvailabilityForUser(user.id),
      confirmed: getConfirmedMeetingsForUser(user.id),
      incoming: getIncomingMeetingRequests(user.id),
      outgoing: getOutgoingMeetingRequests(user.id),
    };
  }, [user, refreshKey]);

  const contacts = useMemo(() => {
    if (!user) return [];
    return user.role === 'entrepreneur' ? investors : entrepreneurs;
  }, [user]);

  const allRequests = useMemo(
    () => [...data.incoming, ...data.outgoing].filter(
      (r, i, arr) => arr.findIndex((x) => x.id === r.id) === i
    ),
    [data.incoming, data.outgoing]
  );

  const pendingCount = allRequests.filter((r) => r.status === 'pending').length;

  if (!user) return null;

  const handleSelectRange = (start: string, end: string) => {
    setSlotModal({ defaultStart: start, defaultEnd: end });
  };

  const handleEventClick = (kind: CalendarEventKind, resourceId: string) => {
    if (kind === 'availability') {
      const slot = availabilitySlots.find((s) => s.id === resourceId);
      if (slot) setSlotModal({ slot });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">
            Manage availability, send meeting requests, and view confirmed sessions
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            leftIcon={<PlusCircle size={18} />}
            onClick={() => setSlotModal({})}
          >
            Add availability
          </Button>
          <Button
            leftIcon={<Send size={18} />}
            onClick={() => {
              setSendDefaults({});
              setShowSendModal(true);
            }}
          >
            Send meeting request
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-500" />
          Your availability
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-200 border border-blue-600" />
          Confirmed meetings
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-200 border border-amber-600" />
          Pending requests
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <NexusCalendar
            availabilitySlots={data.slots}
            meetings={data.confirmed}
            meetingRequests={meetingRequests}
            userId={user.id}
            onSelectRange={handleSelectRange}
            onEventClick={handleEventClick}
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Meeting requests</h2>
              {pendingCount > 0 && (
                <Badge variant="warning">{pendingCount} pending</Badge>
              )}
            </CardHeader>
            <CardBody className="space-y-4 max-h-[480px] overflow-y-auto">
              {allRequests.length > 0 ? (
                allRequests.map((req) => (
                  <MeetingRequestCard key={req.id} request={req} onUpdate={refresh} />
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No meeting requests yet. Send one to schedule a call.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Confirmed meetings</h2>
            </CardHeader>
            <CardBody>
              {data.confirmed.length > 0 ? (
                <ul className="space-y-2 text-sm text-gray-700">
                  {data.confirmed.map((m) => (
                    <li key={m.id} className="py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-gray-900">{m.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Accepted requests appear here and on your dashboard.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {slotModal !== null && (
        <SlotFormModal
          userId={user.id}
          slot={slotModal.slot}
          defaultStart={slotModal.defaultStart}
          defaultEnd={slotModal.defaultEnd}
          onClose={() => setSlotModal(null)}
          onSaved={refresh}
        />
      )}

      {showSendModal && contacts.length > 0 && (
        <SendMeetingModal
          senderId={user.id}
          contacts={contacts}
          defaultStart={sendDefaults.start}
          defaultEnd={sendDefaults.end}
          onClose={() => setShowSendModal(false)}
          onSent={refresh}
        />
      )}
    </div>
  );
};
