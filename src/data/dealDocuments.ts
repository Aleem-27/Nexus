import { DealContractDocument, DealDocumentStatus } from '../types';

const SAMPLE_PDF =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

export const dealContractDocuments: DealContractDocument[] = [
  {
    id: 'doc1',
    name: 'Series A Term Sheet.pdf',
    dealTitle: 'TechWave AI — Series A',
    dealId: 'deal1',
    mimeType: 'application/pdf',
    sizeBytes: 2457600,
    status: 'draft',
    ownerId: 'e1',
    counterpartyId: 'i1',
    previewUrl: SAMPLE_PDF,
    lastModified: new Date().toISOString(),
    uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'doc2',
    name: 'Investment Agreement.pdf',
    dealTitle: 'GreenLife Solutions — Seed',
    dealId: 'deal2',
    mimeType: 'application/pdf',
    sizeBytes: 3145728,
    status: 'in_review',
    ownerId: 'i2',
    counterpartyId: 'e2',
    previewUrl: SAMPLE_PDF,
    lastModified: new Date(Date.now() - 86400000).toISOString(),
    uploadedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'doc3',
    name: 'SAFE Addendum.pdf',
    dealTitle: 'HealthPulse — Pre-seed',
    dealId: 'deal3',
    mimeType: 'application/pdf',
    sizeBytes: 1048576,
    status: 'signed',
    ownerId: 'e3',
    counterpartyId: 'i1',
    previewUrl: SAMPLE_PDF,
    signatureDataUrl: undefined,
    signedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    signedByName: 'Sarah Johnson',
    lastModified: new Date(Date.now() - 86400000 * 2).toISOString(),
    uploadedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getDocumentsForUser = (userId: string): DealContractDocument[] =>
  dealContractDocuments
    .filter((d) => d.ownerId === userId || d.counterpartyId === userId)
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

export const getDocumentById = (id: string): DealContractDocument | undefined =>
  dealContractDocuments.find((d) => d.id === id);

export const uploadDealDocument = (
  file: File,
  ownerId: string,
  dealTitle: string,
  dealId: string,
  counterpartyId: string
): DealContractDocument => {
  const previewUrl = URL.createObjectURL(file);
  const doc: DealContractDocument = {
    id: `doc${dealContractDocuments.length + 1}`,
    name: file.name,
    dealTitle,
    dealId,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    status: 'draft',
    ownerId,
    counterpartyId,
    previewUrl,
    lastModified: new Date().toISOString(),
    uploadedAt: new Date().toISOString(),
  };
  dealContractDocuments.unshift(doc);
  return doc;
};

export const updateDocumentStatus = (
  docId: string,
  status: DealDocumentStatus
): DealContractDocument | null => {
  const index = dealContractDocuments.findIndex((d) => d.id === docId);
  if (index === -1) return null;
  dealContractDocuments[index] = {
    ...dealContractDocuments[index],
    status,
    lastModified: new Date().toISOString(),
  };
  return dealContractDocuments[index];
};

export const applyDocumentSignature = (
  docId: string,
  signatureDataUrl: string,
  signedByName: string
): DealContractDocument | null => {
  const index = dealContractDocuments.findIndex((d) => d.id === docId);
  if (index === -1) return null;
  dealContractDocuments[index] = {
    ...dealContractDocuments[index],
    status: 'signed',
    signatureDataUrl,
    signedByName,
    signedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
  return dealContractDocuments[index];
};

export const deleteDealDocument = (docId: string): boolean => {
  const index = dealContractDocuments.findIndex((d) => d.id === docId);
  if (index === -1) return false;
  const doc = dealContractDocuments[index];
  if (doc.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(doc.previewUrl);
  }
  dealContractDocuments.splice(index, 1);
  return true;
};
