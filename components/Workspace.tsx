

import React, { useState } from 'react';
import { EditIcon } from './icons/EditIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CopyIcon } from './icons/CopyIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';
import { PlayIcon } from './icons/PlayIcon';
import { WorkspaceCreation, LightboxContent } from '../types';

interface WorkspaceProps {
  creations: WorkspaceCreation[];
  onSelectForEditing: (creation: WorkspaceCreation) => void;
  onDelete: (id: number) => void;
  onCreationClick: (content: LightboxContent) => void;
  editingCreationId: number | null;
}

export const Workspace: React.FC<WorkspaceProps> = ({ creations, onSelectForEditing, onDelete, onCreationClick, editingCreationId }) => {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleDownload = (creation: WorkspaceCreation) => {
    const extension = creation.type === 'video' ? 'mp4' : 'png';
    
    const link = document.createElement('a');
    link.href = creation.base64;
    link.download = `creation-${creation.id}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async (creation: WorkspaceCreation) => {
    if (creation.type === 'video') {
      return;
    }
    try {
      const response = await fetch(creation.base64);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopiedId(creation.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error("이미지 복사에 실패했습니다:", error);
    }
  };
  
  const handleCreationClick = (creation: WorkspaceCreation) => {
    const extension = creation.type === 'video' ? 'mp4' : 'png';
    onCreationClick({
        ...creation,
        downloadName: `creation-${creation.id}.${extension}`,
        saveData: creation.base64.split(',')[1]
    });
  };

  const ActionButton: React.FC<{ onClick: (e: React.MouseEvent) => void; title: string; children: React.ReactNode; className?: string; disabled?: boolean }> = ({ onClick, title, children, className, disabled }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      title={title}
      disabled={disabled}
      className={`p-2 rounded-full bg-black/50 backdrop-blur-sm text-white transition-all duration-200 ease-in-out transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
  
  return (
    <div className="w-full max-w-6xl mt-8 p-6 panel-glass rounded-2xl">
      <h2 className="text-2xl font-bold mb-4 text-teal-300">나의 워크스페이스</h2>
      {creations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
            <p>생성된 창작물을 저장하면 여기에 표시됩니다.</p>
            <p className="text-sm mt-1">갤러리에서 '워크스페이스에 저장' 버튼을 클릭해보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {creations.map((creation) => (
            <div 
              key={creation.id} 
              className={`relative group bg-black/30 rounded-lg aspect-square flex items-center justify-center cursor-pointer ${editingCreationId === creation.id ? 'animate-pulse-glow' : ''}`}
              onClick={() => handleCreationClick(creation)}
            >
              {creation.type === 'image' ? (
                <img
                  src={creation.base64}
                  alt={`생성된 아트 ${creation.id}`}
                  className="w-full h-full object-contain rounded-lg border-2 border-transparent group-hover:border-purple-400 transition-all"
                />
              ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-lg border-2 border-transparent group-hover:border-teal-400 transition-all bg-black">
                      <div className="text-center text-gray-300">
                          <PlayIcon className="w-12 h-12 mx-auto text-teal-400" />
                          <p className="text-sm font-semibold mt-2">비디오</p>
                      </div>
                  </div>
              )}
              
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                <div className="flex items-center gap-2">
                   <ActionButton onClick={() => onSelectForEditing(creation)} title="수정하기" className="hover:bg-purple-600" disabled={creation.type === 'video'}>
                    <EditIcon className="w-5 h-5" />
                  </ActionButton>
                   <ActionButton onClick={() => handleDownload(creation)} title="다운로드" className="hover:bg-purple-600">
                    <DownloadIcon className="w-5 h-5" />
                  </ActionButton>
                   <ActionButton onClick={() => handleCopy(creation)} title={copiedId === creation.id ? '복사됨!' : '복사하기'} className="hover:bg-purple-600" disabled={creation.type === 'video'}>
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
      )}
    </div>
  );
};