import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Meeting } from '../../types';
import { findUserById } from '../../data/users';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

interface UpcomingMeetingsListProps {
  meetings: Meeting[];
  userId: string;
  limit?: number;
}

export const UpcomingMeetingsList: React.FC<UpcomingMeetingsListProps> = ({
  meetings,
  userId,
  limit = 5,
}) => {
  const displayed = meetings.slice(0, limit);

  if (displayed.length === 0) {
    return (
      <div className="text-center py-6">
        <Calendar size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">No upcoming meetings</p>
        <Link to="/calendar" className="text-sm font-medium text-primary-600 hover:text-primary-500 mt-1 inline-block">
          Open calendar
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {displayed.map((meeting) => {
        const otherId = meeting.participantIds.find((id) => id !== userId);
        const other = otherId ? findUserById(otherId) : null;

        return (
          <li
            key={meeting.id}
            className="flex items-start gap-3 p-3 rounded-md bg-gray-50 border border-gray-100"
          >
            {other && (
              <Avatar src={other.avatarUrl} alt={other.name} size="sm" className="shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{meeting.title}</p>
              {other && (
                <p className="text-xs text-gray-500">with {other.name}</p>
              )}
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <Clock size={12} />
                {format(new Date(meeting.startAt), 'EEE, MMM d · h:mm a')}
              </p>
            </div>
            <Badge variant="success" className="shrink-0">
              Confirmed
            </Badge>
          </li>
        );
      })}
    </ul>
  );
};
