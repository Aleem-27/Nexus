import React from 'react';
import { Check, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { MeetingRequest } from '../../types';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { findUserById } from '../../data/users';
import { respondToMeetingRequest } from '../../data/meetings';
import { useAuth } from '../../context/AuthContext';

interface MeetingRequestCardProps {
  request: MeetingRequest;
  onUpdate?: () => void;
}

export const MeetingRequestCard: React.FC<MeetingRequestCardProps> = ({
  request,
  onUpdate,
}) => {
  const { user } = useAuth();
  const isIncoming = user?.id === request.receiverId;
  const otherUserId = isIncoming ? request.senderId : request.receiverId;
  const otherUser = findUserById(otherUserId);

  if (!otherUser || !user) return null;

  const handleAccept = () => {
    respondToMeetingRequest(request.id, 'accepted');
    onUpdate?.();
  };

  const handleDecline = () => {
    respondToMeetingRequest(request.id, 'declined');
    onUpdate?.();
  };

  const statusBadge = () => {
    switch (request.status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'declined':
        return <Badge variant="error">Declined</Badge>;
      default:
        return null;
    }
  };

  const timeRange = `${format(new Date(request.startAt), 'MMM d, yyyy · h:mm a')} – ${format(
    new Date(request.endAt),
    'h:mm a'
  )}`;

  return (
    <Card>
      <CardBody>
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start min-w-0">
            <Avatar
              src={otherUser.avatarUrl}
              alt={otherUser.name}
              size="md"
              className="mr-3 shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{request.title}</h3>
              <p className="text-sm text-gray-600">
                {isIncoming ? `From ${otherUser.name}` : `To ${otherUser.name}`}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Calendar size={12} />
                {timeRange}
              </p>
            </div>
          </div>
          {statusBadge()}
        </div>
        {request.message && (
          <p className="mt-3 text-sm text-gray-600">{request.message}</p>
        )}
      </CardBody>

      {request.status === 'pending' && isIncoming && (
        <CardFooter className="border-t border-gray-100 bg-gray-50">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<X size={16} />}
              onClick={handleDecline}
            >
              Decline
            </Button>
            <Button
              variant="success"
              size="sm"
              leftIcon={<Check size={16} />}
              onClick={handleAccept}
            >
              Accept
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
