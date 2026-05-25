import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Card, CardBody, CardHeader, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { ConfirmedMeeting } from '../../types';
import { findUserById } from '../../data/users';
import { format, parseISO } from 'date-fns';
import { formatTimeRange } from '../../data/calendarUtils';

interface DashboardMeetingsWidgetProps {
  meetings: ConfirmedMeeting[];
}

export const DashboardMeetingsWidget: React.FC<DashboardMeetingsWidgetProps> = ({ meetings }) => {
  const navigate = useNavigate();

  // Get next 3 upcoming meetings
  const upcomingMeetings = meetings
    .filter((m) => parseISO(m.date) >= new Date())
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 3);

  const handleViewCalendar = () => {
    navigate('/calendar');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h3>
          </div>
          {upcomingMeetings.length > 0 && (
            <span className="inline-block bg-primary-100 text-primary-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
              {upcomingMeetings.length}
            </span>
          )}
        </div>
      </CardHeader>

      <CardBody className="space-y-3">
        {upcomingMeetings.length > 0 ? (
          upcomingMeetings.map((meeting, index) => {
            const otherParticipant = findUserById(meeting.participant1Id);

            return (
              <div key={meeting.id} className="pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <Avatar
                    src={otherParticipant?.avatarUrl || ''}
                    alt={otherParticipant?.name || 'Unknown'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{meeting.title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {otherParticipant?.name || 'Unknown User'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock size={12} />
                      {format(parseISO(meeting.date), 'MMM d')} at{' '}
                      {formatTimeRange(meeting.startHour, meeting.duration)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-4">
            <Calendar size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-600">No upcoming meetings</p>
          </div>
        )}
      </CardBody>

      <CardFooter className="bg-gray-50 border-t border-gray-100">
        <Button variant="ghost" size="sm" fullWidth onClick={handleViewCalendar}>
          <span className="flex items-center justify-center gap-2">
            View Calendar
            <ArrowRight size={16} />
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
};