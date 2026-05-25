import React from 'react';
import { FileText, Image as ImageIcon } from 'lucide-react';
import { DealContractDocument } from '../../types';

interface DocumentPreviewProps {
  document: DealContractDocument;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document }) => {
  const { mimeType, previewUrl, name, signatureDataUrl } = document;
  const isPdf = mimeType === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
  const isImage = mimeType.startsWith('image/');

  return (
    <div className="relative flex-1 min-h-[420px] bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
      {isPdf && (
        <iframe
          title={`Preview: ${name}`}
          src={previewUrl}
          className="w-full h-full min-h-[420px]"
        />
      )}

      {isImage && !isPdf && (
        <div className="flex items-center justify-center h-full min-h-[420px] p-4">
          <img src={previewUrl} alt={name} className="max-w-full max-h-full object-contain shadow-md rounded" />
        </div>
      )}

      {!isPdf && !isImage && (
        <div className="flex flex-col items-center justify-center h-full min-h-[420px] text-center p-8">
          <FileText size={48} className="text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium">Preview not available for this file type</p>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            Word and spreadsheet files can be downloaded. Upload PDFs for inline preview.
          </p>
          <a
            href={previewUrl}
            download={name}
            className="mt-4 text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Download file
          </a>
        </div>
      )}

      {signatureDataUrl && (
        <div className="absolute bottom-4 right-4 bg-white/95 border border-gray-200 rounded-lg p-3 shadow-lg max-w-[220px]">
          <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">E-Signature</p>
          <img src={signatureDataUrl} alt="Signature" className="h-12 w-auto object-contain" />
          {document.signedByName && (
            <p className="text-xs text-gray-700 mt-1 font-medium">{document.signedByName}</p>
          )}
          {document.signedAt && (
            <p className="text-[10px] text-gray-500">
              {new Date(document.signedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {!isPdf && !isImage && mimeType.includes('word') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <ImageIcon size={64} className="text-gray-400" />
        </div>
      )}
    </div>
  );
};
