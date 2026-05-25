import React from 'react';
import { Badge } from '../ui/Badge';
import { DealDocumentStatus } from '../../types';

const statusConfig: Record<
  DealDocumentStatus,
  { label: string; variant: 'gray' | 'warning' | 'success' }
> = {
  draft: { label: 'Draft', variant: 'gray' },
  in_review: { label: 'In Review', variant: 'warning' },
  signed: { label: 'Signed', variant: 'success' },
};

interface DocumentStatusBadgeProps {
  status: DealDocumentStatus;
  size?: 'sm' | 'md';
}

export const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({
  status,
  size = 'sm',
}) => {
  const { label, variant } = statusConfig[status];
  return (
    <Badge variant={variant} size={size} className="cursor-default pointer-events-none">
      {label}
    </Badge>
  );
};
