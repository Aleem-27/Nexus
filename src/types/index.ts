export type UserRole = 'entrepreneur' | 'investor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  isOnline?: boolean;
  createdAt: string;
}

export interface Entrepreneur extends User {
  role: 'entrepreneur';
  startupName: string;
  pitchSummary: string;
  fundingNeeded: string;
  industry: string;
  location: string;
  foundedYear: number;
  teamSize: number;
}

export interface Investor extends User {
  role: 'investor';
  investmentInterests: string[];
  investmentStage: string[];
  portfolioCompanies: string[];
  totalInvestments: number;
  minimumInvestment: string;
  maximumInvestment: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface CollaborationRequest {
  id: string;
  investorId: string;
  entrepreneurId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  url: string;
  ownerId: string;
}

export type DealDocumentStatus = 'draft' | 'in_review' | 'signed';

export interface DealContractDocument {
  id: string;
  name: string;
  dealTitle: string;
  dealId: string;
  mimeType: string;
  sizeBytes: number;
  status: DealDocumentStatus;
  ownerId: string;
  counterpartyId: string;
  previewUrl: string;
  signatureDataUrl?: string;
  signedAt?: string;
  signedByName?: string;
  lastModified: string;
  uploadedAt: string;
}

export type MeetingRequestStatus = 'pending' | 'accepted' | 'declined';

export interface AvailabilitySlot {
  id: string;
  userId: string;
  title: string;
  startAt: string;
  endAt: string;
}

export interface MeetingRequest {
  id: string;
  senderId: string;
  receiverId: string;
  title: string;
  message?: string;
  startAt: string;
  endAt: string;
  status: MeetingRequestStatus;
  createdAt: string;
}

export interface Meeting {
  id: string;
  participantIds: string[];
  title: string;
  startAt: string;
  endAt: string;
  meetingRequestId?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}