import { AvailabilitySlot, Meeting, MeetingRequest } from '../types';

const addDays = (days: number, hour = 10, minute = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const availabilitySlots: AvailabilitySlot[] = [
  {
    id: 'slot1',
    userId: 'i1',
    title: 'Open for intro calls',
    startAt: addDays(1, 9, 0),
    endAt: addDays(1, 12, 0),
  },
  {
    id: 'slot2',
    userId: 'i1',
    title: 'Open for intro calls',
    startAt: addDays(3, 14, 0),
    endAt: addDays(3, 17, 0),
  },
  {
    id: 'slot3',
    userId: 'e1',
    title: 'Pitch meetings',
    startAt: addDays(2, 10, 0),
    endAt: addDays(2, 16, 0),
  },
];

export const meetingRequests: MeetingRequest[] = [
  {
    id: 'mreq1',
    senderId: 'i1',
    receiverId: 'e1',
    title: 'TechWave AI — intro call',
    message: 'Would love to discuss your traction and roadmap.',
    startAt: addDays(4, 14, 0),
    endAt: addDays(4, 15, 0),
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mreq2',
    senderId: 'e1',
    receiverId: 'i2',
    title: 'GreenTech partnership sync',
    message: 'Following up on our accepted collaboration request.',
    startAt: addDays(5, 11, 0),
    endAt: addDays(5, 12, 0),
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mreq3',
    senderId: 'i2',
    receiverId: 'e1',
    title: 'Sustainability strategy review',
    startAt: addDays(6, 15, 0),
    endAt: addDays(6, 16, 0),
    status: 'accepted',
    createdAt: addDays(-2, 9, 0),
  },
];

export const meetings: Meeting[] = [
  {
    id: 'meet1',
    participantIds: ['e1', 'i2'],
    title: 'Sustainability strategy review',
    startAt: addDays(6, 15, 0),
    endAt: addDays(6, 16, 0),
    meetingRequestId: 'mreq3',
    createdAt: addDays(-1, 10, 0),
  },
  {
    id: 'meet2',
    participantIds: ['e1', 'i1'],
    title: 'Q2 metrics deep dive',
    startAt: addDays(8, 10, 0),
    endAt: addDays(8, 11, 0),
    createdAt: addDays(-3, 14, 0),
  },
];

export const getAvailabilityForUser = (userId: string): AvailabilitySlot[] =>
  availabilitySlots
    .filter((slot) => slot.userId === userId)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

export const createAvailabilitySlot = (
  userId: string,
  title: string,
  startAt: string,
  endAt: string
): AvailabilitySlot => {
  const slot: AvailabilitySlot = {
    id: `slot${availabilitySlots.length + 1}`,
    userId,
    title,
    startAt,
    endAt,
  };
  availabilitySlots.push(slot);
  return slot;
};

export const updateAvailabilitySlot = (
  slotId: string,
  updates: Partial<Pick<AvailabilitySlot, 'title' | 'startAt' | 'endAt'>>
): AvailabilitySlot | null => {
  const index = availabilitySlots.findIndex((s) => s.id === slotId);
  if (index === -1) return null;
  availabilitySlots[index] = { ...availabilitySlots[index], ...updates };
  return availabilitySlots[index];
};

export const deleteAvailabilitySlot = (slotId: string): boolean => {
  const index = availabilitySlots.findIndex((s) => s.id === slotId);
  if (index === -1) return false;
  availabilitySlots.splice(index, 1);
  return true;
};

export const getIncomingMeetingRequests = (userId: string): MeetingRequest[] =>
  meetingRequests
    .filter((req) => req.receiverId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const getOutgoingMeetingRequests = (userId: string): MeetingRequest[] =>
  meetingRequests
    .filter((req) => req.senderId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const getPendingMeetingRequests = (userId: string): MeetingRequest[] =>
  meetingRequests.filter(
    (req) =>
      req.status === 'pending' && (req.receiverId === userId || req.senderId === userId)
  );

export const createMeetingRequest = (
  senderId: string,
  receiverId: string,
  title: string,
  startAt: string,
  endAt: string,
  message?: string
): MeetingRequest => {
  const request: MeetingRequest = {
    id: `mreq${meetingRequests.length + 1}`,
    senderId,
    receiverId,
    title,
    message,
    startAt,
    endAt,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  meetingRequests.push(request);
  return request;
};

export const respondToMeetingRequest = (
  requestId: string,
  status: 'accepted' | 'declined'
): { request: MeetingRequest; meeting?: Meeting } | null => {
  const index = meetingRequests.findIndex((r) => r.id === requestId);
  if (index === -1) return null;

  meetingRequests[index] = { ...meetingRequests[index], status };
  const request = meetingRequests[index];

  if (status === 'accepted') {
    const meeting: Meeting = {
      id: `meet${meetings.length + 1}`,
      participantIds: [request.senderId, request.receiverId],
      title: request.title,
      startAt: request.startAt,
      endAt: request.endAt,
      meetingRequestId: request.id,
      createdAt: new Date().toISOString(),
    };
    meetings.push(meeting);
    return { request, meeting };
  }

  return { request };
};

export const getConfirmedMeetingsForUser = (userId: string): Meeting[] =>
  meetings
    .filter((m) => m.participantIds.includes(userId))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

export const getUpcomingMeetingsForUser = (userId: string): Meeting[] => {
  const now = Date.now();
  return getConfirmedMeetingsForUser(userId).filter(
    (m) => new Date(m.startAt).getTime() >= now
  );
};
