

import React, { useState } from 'react';
import { EditIcon } from './icons/EditIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CopyIcon } from './icons/CopyIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';
import { WorkspaceCreation } from '../types';

interface WorkspaceProps {
  userName: string;
  creations: WorkspaceCreation[];
  onSelectForEditing: (base64: string) => void;
  onDelete: (id: number) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ userName, creations, onSelectForEditing, onDelete }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleDownload = (base64: string, id: number) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `creation-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async (base64: string, id: number) => {
    try {
      const dataUrl = `data:image/png;base64,${base64}`;
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error("이미지 복사에 실패했습니다:", error);
    }
  };

  const ActionButton: React.FC<{ onClick: () => void; title: string; children: React.ReactNode; className?: string }> = ({ onClick, title, children, className }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-full bg-black/50 backdrop-blur-sm text-white transition-all duration-200 ease-in-out transform hover:scale-110 ${className}`}
    >
      {children}
    </button>
  );
  
  if (creations.length === 0) {
    return (
        <div className="w-full max-w-6xl mt-8 p-6 bg-gray-800/50 border border-gray-700 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-teal-300">{userName}님의 워크스페이스</h2>
            <div className="text-center py-8 text-gray-500">
                <p>생성된 이미지를 저장하면 여기에 표시됩니다.</p>
                <p className="text-sm mt-1">아트 갤러리에서 '워크스페이스에 저장' 버튼을 클릭해보세요.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mt-8 p-6 bg-gray-800/50 border border-gray-700 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-teal-300">{userName}님의 워크스페이스</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {creations.map((creation) => (
          <div key={creation.id} className="relative group bg-gray-900/50 rounded-lg flex items-center justify-center">
            <img
              src={`data:image/png;base64,${creation.base64}`}
              alt={`생성된 아트 ${creation.id}`}
              className="w-full h-full object-contain rounded-lg border-2 border-transparent group-hover:border-purple-400 transition-all max-h-48"
            />
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2">
                 <ActionButton onClick={() => onSelectForEditing(creation.base64)} title="수정하기" className="hover:bg-purple-600">
                  <EditIcon className="w-5 h-5" />
                </ActionButton>
                 <ActionButton onClick={() => handleDownload(creation.base64, creation.id)} title="다운로드" className="hover:bg-purple-600">
                  <DownloadIcon className="w-5 h-5" />
                </ActionButton>
                 <ActionButton onClick={() => handleCopy(creation.base64, creation.id)} title={copiedId === creation.id ? '복사됨!' : '복사하기'} className="hover:bg-purple-600">
                  {copiedId === creation.id ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                </ActionButton>
                 <ActionButton onClick={() => onDelete(creation.id)} title="삭제하기" className="hover:bg-red-600">
                  <TrashIcon className="w-5 h-5" />
                </ActionButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};