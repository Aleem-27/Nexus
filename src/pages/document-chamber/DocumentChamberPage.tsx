import React, { useCallback, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  FileSignature,
  Send,
  PenLine,
  Trash2,
  X,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DealContractDocument, DealDocumentStatus } from '../../types';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DocumentStatusBadge } from '../../components/document-chamber/DocumentStatusBadge';
import { DocumentPreview } from '../../components/document-chamber/DocumentPreview';
import { DocumentUploadZone } from '../../components/document-chamber/DocumentUploadZone';
import { SignaturePad } from '../../components/document-chamber/SignaturePad';
import {
  getDocumentsForUser,
  uploadDealDocument,
  updateDocumentStatus,
  applyDocumentSignature,
  deleteDealDocument,
  formatFileSize,
} from '../../data/dealDocuments';
import { findUserById } from '../../data/users';

const STATUS_FILTERS: { value: DealDocumentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In Review' },
  { value: 'signed', label: 'Signed' },
];

export const DocumentChamberPage: React.FC = () => {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DealDocumentStatus | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [uploadDealTitle, setUploadDealTitle] = useState('New investment contract');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const documents = useMemo(() => {
    if (!user) return [];
    void refreshKey;
    return getDocumentsForUser(user.id);
  }, [user, refreshKey]);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return documents;
    return documents.filter((d) => d.status === statusFilter);
  }, [documents, statusFilter]);

  const selected = useMemo(
    () => filtered.find((d) => d.id === selectedId) ?? documents.find((d) => d.id === selectedId) ?? null,
    [filtered, documents, selectedId]
  );

  React.useEffect(() => {
    if (filtered.length > 0 && !selectedId) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const handleUploadFile = (file: File) => {
    setPendingFile(file);
    setShowUploadModal(true);
  };

  const confirmUpload = () => {
    if (!user || !pendingFile) return;
    const counterpartyId = user.role === 'entrepreneur' ? 'i1' : 'e1';
    const doc = uploadDealDocument(
      pendingFile,
      user.id,
      uploadDealTitle.trim() || 'Untitled deal',
      `deal${Date.now()}`,
      counterpartyId
    );
    setPendingFile(null);
    setShowUploadModal(false);
    setSelectedId(doc.id);
    refresh();
  };

  const handleSubmitForReview = () => {
    if (!selected) return;
    updateDocumentStatus(selected.id, 'in_review');
    refresh();
  };

  const handleSign = (dataUrl: string) => {
    if (!selected || !user) return;
    applyDocumentSignature(selected.id, dataUrl, user.name);
    setShowSignModal(false);
    refresh();
  };

  const handleDelete = () => {
    if (!selected || !window.confirm('Remove this document from the chamber?')) return;
    deleteDealDocument(selected.id);
    setSelectedId(null);
    refresh();
  };

  if (!user) return null;

  const counterparty = selected
    ? findUserById(
        selected.ownerId === user.id ? selected.counterpartyId : selected.ownerId
      )
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileSignature className="text-primary-600" size={28} />
            Document Chamber
          </h1>
          <p className="text-gray-600">
            Upload, preview, and e-sign deal contracts and term sheets
          </p>
        </div>
        <DocumentUploadZone compact onFileAccepted={handleUploadFile} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter size={16} className="text-gray-500" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-primary-100 text-primary-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[560px]">
        <Card className="lg:col-span-1 flex flex-col max-h-[720px]">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Contracts</h2>
            <p className="text-sm text-gray-500">{filtered.length} document(s)</p>
          </CardHeader>
          <CardBody className="flex-1 overflow-y-auto space-y-2 p-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No documents match this filter.</p>
            ) : (
              filtered.map((doc) => (
                <DocumentListItem
                  key={doc.id}
                  doc={doc}
                  isSelected={doc.id === selectedId}
                  onSelect={() => setSelectedId(doc.id)}
                />
              ))
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          {selected ? (
            <>
              <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-gray-100">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-medium text-gray-900 truncate">{selected.name}</h2>
                    <DocumentStatusBadge status={selected.status} />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{selected.dealTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(selected.sizeBytes)} · Updated{' '}
                    {format(new Date(selected.lastModified), 'MMM d, yyyy')}
                    {counterparty && ` · With ${counterparty.name}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {selected.status === 'draft' && (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Send size={16} />}
                      onClick={handleSubmitForReview}
                    >
                      Submit for review
                    </Button>
                  )}
                  {selected.status === 'in_review' && (
                    <Button
                      size="sm"
                      leftIcon={<PenLine size={16} />}
                      onClick={() => setShowSignModal(true)}
                    >
                      Sign document
                    </Button>
                  )}
                  {selected.status !== 'signed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-error-600"
                      leftIcon={<Trash2 size={16} />}
                      onClick={handleDelete}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardBody className="flex-1 flex flex-col min-h-0 p-4">
                <DocumentPreview document={selected} />
              </CardBody>
            </>
          ) : (
            <CardBody className="flex-1 flex flex-col items-center justify-center py-16">
              <FileSignature size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-600">Select a contract or upload a new document</p>
              <div className="mt-6 w-full max-w-md">
                <DocumentUploadZone onFileAccepted={handleUploadFile} />
              </div>
            </CardBody>
          )}
        </Card>
      </div>

      {showUploadModal && pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add to chamber</h3>
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  setPendingFile(null);
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4 truncate">{pendingFile.name}</p>
            <Input
              label="Deal / contract title"
              value={uploadDealTitle}
              onChange={(e) => setUploadDealTitle(e.target.value)}
              fullWidth
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadModal(false);
                  setPendingFile(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={confirmUpload}>Upload</Button>
            </div>
          </div>
        </div>
      )}

      {showSignModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">E-Signature</h3>
              <button
                type="button"
                onClick={() => setShowSignModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <SignaturePad
              signerName={user.name}
              onSave={handleSign}
              onCancel={() => setShowSignModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface DocumentListItemProps {
  doc: DealContractDocument;
  isSelected: boolean;
  onSelect: () => void;
}

const DocumentListItem: React.FC<DocumentListItemProps> = ({ doc, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`w-full text-left p-3 rounded-lg border transition-colors ${
      isSelected
        ? 'border-primary-300 bg-primary-50'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
    }`}
  >
    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
    <p className="text-xs text-gray-500 truncate mt-0.5">{doc.dealTitle}</p>
    <div className="mt-2">
      <DocumentStatusBadge status={doc.status} />
    </div>
  </button>
);
