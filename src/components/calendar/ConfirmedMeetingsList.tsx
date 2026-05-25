import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, Users } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { ConfirmedMeeting } from '../../types';
import { findUserById } from '../../data/users';
import { formatTimeRange } from '../../data/calendarUtils';

interface ConfirmedMeetingsListProps {
  meetings: ConfirmedMeeting[];
}

export const ConfirmedMeetingsList: React.FC<ConfirmedMeetingsListProps> = ({ meetings }) => {
  if (meetings.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-600">No confirmed meetings</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {meetings.map((meeting) => {
        const participant1 = findUserById(meeting.participant1Id);
        const participant2 = findUserById(meeting.participant2Id);
        const isToday = format(parseISO(meeting.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        const isPast = parseISO(meeting.date) < new Date();

        return (
          <Card
            key={meeting.id}
            className={`hover:shadow-lg transition-shadow ${isPast ? 'opacity-60' : ''}`}
          >
            <CardBody className="space-y-3">
              {/* Header with title and date badge */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{meeting.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    {format(parseISO(meeting.date), 'EEEE, MMMM d, yyyy')}
                    {isToday && <Badge variant="success" size="sm">Today</Badge>}
                    {isPast && <Badge variant="gray" size="sm">Past</Badge>}
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={14} />
                <span>{formatTimeRange(meeting.startHour, meeting.duration)}</span>
              </div>

              {/* Participants */}
              <div className="flex items-center gap-2">
                <Users size={14} className="text-gray-600" />
                <div className="flex items-center gap-2">
                  {participant1 && (
                    <div className="flex items-center gap-1">
                      <Avatar src={participant1.avatarUrl} alt={participant1.name} size="sm" />
                      <span className="text-sm text-gray-700">{participant1.name}</span>
                    </div>
                  )}
                  <span className="text-gray-400">•</span>
                  {participant2 && (
                    <div className="flex items-center gap-1">
                      <Avatar src={participant2.avatarUrl} alt={participant2.name} size="sm" />
                      <span className="text-sm text-gray-700">{participant2.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {meeting.notes && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">Meeting Notes:</p>
                  <p className="text-sm text-gray-700">{meeting.notes}</p>
                </div>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};