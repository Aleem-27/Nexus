<<<<<<< HEAD
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { AvailabilityForm, MeetingRequestModal, MeetingRequestList, ConfirmedMeetingsList } from '../../components/calendar';
import { format, parseISO } from 'date-fns';
import { availabilitySlots, meetingRequests, confirmedMeetings } from '../../data/calendar';
import 'react-calendar/dist/Calendar.css';
import './CalendarPage.css';

export const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'availability' | 'requests' | 'meetings'>('availability');

  // Get slots and meetings for selected date
  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const slotsForDate = availabilitySlots.filter(slot => slot.date === dateStr);
  const pendingRequests = meetingRequests.filter(req => req.status === 'pending');
  const upcomingMeetings = confirmedMeetings.filter(m => parseISO(m.date) >= new Date());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Manage your availability and meetings</p>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          Request Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <Card>
            <CardBody>
              <Calendar
                value={selectedDate}
                onChange={setSelectedDate}
                className="w-full border-0"
              />
            </CardBody>
          </Card>

          {/* Add Availability Form */}
          <div className="mt-6">
            <AvailabilityForm />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {[
              { id: 'availability', label: 'My Availability' },
              { id: 'requests', label: 'Meeting Requests' },
              { id: 'meetings', label: 'Confirmed Meetings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as any)}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  currentView === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {currentView === 'availability' && (
            <div>
              {selectedDate && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Availability for {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  {slotsForDate.length > 0 ? (
                    <div className="space-y-2">
                      {slotsForDate.map((slot) => (
                        <Card key={slot.id}>
                          <CardBody className="py-3">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-900">
                                {slot.startHour}:00 - {slot.endHour}:00
                              </span>
                              <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                                Available
                              </span>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No availability slots for this date</p>
                  )}
                </div>
              )}
            </div>
          )}

          {currentView === 'requests' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Meeting Requests</h3>
              <MeetingRequestList requests={pendingRequests} />
            </div>
          )}

          {currentView === 'meetings' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Meetings</h3>
              <ConfirmedMeetingsList meetings={upcomingMeetings} />
            </div>
          )}
        </div>
      </div>

      {/* Meeting Request Modal */}
      <MeetingRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUserId="i1"
        userRole="investor"
      />
    </div>
  );
};
=======
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
>>>>>>> c1c0d7a (feat: add calender component and ui)
