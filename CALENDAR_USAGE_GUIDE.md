## Calendar Components Usage Guide

This guide shows how to use the newly created calendar components in your Business Nexus application.

### 1. Import Calendar Components

```typescript
// Import individual components
import { AvailabilityForm, MeetingRequestModal, MeetingRequestList, ConfirmedMeetingsList } from '@/components/calendar';

// Or use the barrel export
import { 
  AvailabilityForm, 
  MeetingRequestModal, 
  MeetingRequestList, 
  ConfirmedMeetingsList 
} from '@/components/calendar';

// Import dashboard widget
import { DashboardMeetingsWidget } from '@/components/dashboard/DashboardMeetingsWidget';

// Import main calendar page
import { CalendarPage } from '@/pages/calendar/CalendarPage';
```

### 2. AvailabilityForm Component

Used to add availability slots to the calendar.

```typescript
<AvailabilityForm 
  onSubmit={(slot) => {
    // Handle the submitted availability slot
    console.log('New slot:', slot);
    // Make API call to save the slot
  }}
/>
```

**Props:**
- `onSubmit?: (slot: Omit<AvailabilitySlot, 'id' | 'createdAt'>) => void` - Callback when form is submitted

### 3. MeetingRequestModal Component

Modal dialog for creating meeting requests.

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);

return (
  <>
    <button onClick={() => setIsModalOpen(true)}>Request Meeting</button>
    
    <MeetingRequestModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      currentUserId={user.id}
      userRole={user.role}
      onSubmit={(request) => {
        // Handle submitted meeting request
        console.log('New meeting request:', request);
        // Make API call to save the request
      }}
    />
  </>
);
```

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Called when modal should close
- `currentUserId?: string` - Current user's ID (defaults to empty string)
- `userRole?: 'entrepreneur' | 'investor'` - User's role (defaults to 'entrepreneur')
- `onSubmit?: (request: Omit<MeetingRequest, 'id' | 'createdAt'>) => void` - Callback when request is submitted

### 4. MeetingRequestList Component

Displays list of meeting requests with accept/decline buttons.

```typescript
import { meetingRequests } from '@/data/calendar';

<MeetingRequestList
  requests={meetingRequests.filter(r => r.status === 'pending')}
  onAccept={(requestId, notes) => {
    // Handle accepting meeting request
    console.log(`Accepted request ${requestId} with notes:`, notes);
    // Make API call to update request status
  }}
  onDecline={(requestId) => {
    // Handle declining meeting request
    console.log(`Declined request ${requestId}`);
    // Make API call to update request status
  }}
  showSender={true}
/>
```

**Props:**
- `requests: MeetingRequest[]` - Array of meeting requests to display
- `onAccept?: (requestId: string, notes?: string) => void` - Callback when accepting a request
- `onDecline?: (requestId: string) => void` - Callback when declining a request
- `showSender?: boolean` - Show sender information (defaults to true)

### 5. ConfirmedMeetingsList Component

Displays list of confirmed meetings.

```typescript
import { confirmedMeetings } from '@/data/calendar';

<ConfirmedMeetingsList
  meetings={confirmedMeetings.filter(m => parseISO(m.date) >= new Date())}
/>
```

**Props:**
- `meetings: ConfirmedMeeting[]` - Array of confirmed meetings to display

### 6. DashboardMeetingsWidget Component

Compact widget showing next 3 upcoming meetings, typically displayed on the dashboard.

```typescript
import { confirmedMeetings } from '@/data/calendar';

<DashboardMeetingsWidget
  meetings={confirmedMeetings}
/>
```

**Props:**
- `meetings: ConfirmedMeeting[]` - Array of all meetings to filter from

**Features:**
- Shows only upcoming meetings (max 3)
- Sorted by date
- Clicking "View Calendar" navigates to `/calendar`

### 7. CalendarPage Component

Main calendar page with all features integrated.

The page is already integrated into the routing at `/calendar`.

```typescript
// Access via navigation
navigate('/calendar');

// Or via sidebar link (automatically available for both entrepreneur and investor roles)
```

**Features:**
- React Calendar for date selection
- Tabbed interface:
  - My Availability - Show availability slots for selected date
  - Meeting Requests - Show pending meeting requests
  - Confirmed Meetings - Show confirmed meetings
- Add Availability form in sidebar
- Request Meeting button in header
- Responsive layout (1 col mobile, 3 col desktop)

### Complete Example: Integration in Dashboard

```typescript
import { ConfirmedMeetingsList, DashboardMeetingsWidget } from '@/components/calendar';
import { confirmedMeetings } from '@/data/calendar';

export const MyDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Upcoming meetings widget */}
      <DashboardMeetingsWidget meetings={confirmedMeetings} />
      
      {/* More dashboard content */}
    </div>
  );
};
```

### Data Structures

**AvailabilitySlot:**
```typescript
{
  id: string;
  userId: string;
  date: string; // ISO date (YYYY-MM-DD)
  startHour: number; // 0-23
  endHour: number; // 0-23
  status: 'available' | 'booked' | 'unavailable';
  createdAt: string;
}
```

**MeetingRequest:**
```typescript
{
  id: string;
  senderId: string;
  receiverId: string;
  proposedDate: string; // ISO date
  proposedHour: number;
  duration: number; // minutes
  title: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  respondedAt?: string;
  responseNotes?: string;
}
```

**ConfirmedMeeting:**
```typescript
{
  id: string;
  requestId: string;
  participant1Id: string;
  participant2Id: string;
  date: string; // ISO date
  startHour: number;
  duration: number; // minutes
  title: string;
  notes: string;
  createdAt: string;
}
```

### Utility Functions

Available from `src/data/calendarUtils.ts`:

```typescript
// Check for time conflicts
hasTimeConflict(userId, date, startHour, endHour, slots, meetings);

// Get available hours
getAvailableHours(userId, date, slots); // Returns number[]

// Format time
formatTime(hour); // "9:00 AM"
formatTimeRange(startHour, duration); // "9:00 - 10:00 AM"

// Check date status
isSlotInPast(date, hour); // boolean
isToday(date); // boolean
isFutureDate(date); // boolean

// Get options
DURATION_OPTIONS; // [15, 30, 45, 60, 90, 120]
WORKING_HOURS; // { start: 9, end: 18 }
```

### Styling

All components use:
- **Tailwind CSS** for styling
- **lucide-react** for icons
- Responsive design with mobile-first approach
- Color scheme: primary (blue), secondary, accent colors
- Consistent spacing and typography

### Next Steps

1. **Connect to Backend:**
   - Replace mock data with API calls
   - Implement persistence
   - Add real-time updates

2. **User Context:**
   - Replace hardcoded `currentUserId` with actual user from auth context
   - Dynamically set `userRole` based on logged-in user

3. **Notifications:**
   - Integrate email notifications for meeting requests
   - Add push notifications for upcoming meetings

4. **Enhancements:**
   - Add timezone support
   - Implement video call integration
   - Add recurring availability
   - Export meetings to calendar files
   - Send calendar invitations

---

**Version:** 1.0  
**Last Updated:** 2024