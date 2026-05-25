import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, MessageCircle, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { MeetingRequest } from '../../types';
import { findUserById } from '../../data/users';
import { formatTimeRange } from '../../data/calendarUtils';
import toast from 'react-hot-toast';

interface MeetingRequestListProps {
  requests: MeetingRequest[];
  onAccept?: (requestId: string, notes?: string) => void;
  onDecline?: (requestId: string) => void;
  showSender?: boolean;
}

export const MeetingRequestList: React.FC<MeetingRequestListProps> = ({
  requests,
  onAccept,
  onDecline,
  showSender = true,
}) => {
  const handleAccept = (requestId: string) => {
    const notes = window.prompt('Add any notes about the meeting:');
    onAccept?.(requestId, notes || undefined);
    toast.success('Meeting request accepted');
  };

  const handleDecline = (requestId: string) => {
    onDecline?.(requestId);
    toast.success('Meeting request declined');
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <MessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-600">No meeting requests</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => {
        const senderUser = findUserById(request.senderId);
        const statusColor =
          request.status === 'pending'
            ? 'warning'
            : request.status === 'accepted'
              ? 'success'
              : 'error';

        return (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardBody className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {showSender && senderUser && (
                    <Avatar src={senderUser.avatarUrl} alt={senderUser.name} size="md" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                      <Badge variant={statusColor} size="sm">
                        {request.status}
                      </Badge>
                    </div>
                    {showSender && senderUser && (
                      <p className="text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {senderUser.name}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>
                  {format(parseISO(request.proposedDate), 'MMM d, yyyy')} at{' '}
                  {formatTimeRange(request.proposedHour, request.duration)}
                </span>
              </div>

              {/* Message */}
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">{request.message}</p>

              {/* Response Notes (if accepted) */}
              {request.status === 'accepted' && request.responseNotes && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">Response:</p>
                  <p className="text-sm text-gray-700">{request.responseNotes}</p>
                </div>
              )}

              {/* Actions */}
              {request.status === 'pending' && (
                <div className="flex gap-2 pt-3">
                  <Button
                    variant="error"
                    size="sm"
                    fullWidth
                    onClick={() => handleDecline(request.id)}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    fullWidth
                    onClick={() => handleAccept(request.id)}
                  >
                    Accept
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
};