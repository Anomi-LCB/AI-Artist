

import React, { useCallback, useEffect, useState, useId, useRef } from 'react';

interface ImageInputProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  isLoading: boolean;
  maxFiles?: number;
  highlight?: boolean;
  replace?: boolean;
}

const FilePreview: React.FC<{ file: File; onRemove: () => void; highlight: boolean; }> = ({ file, onRemove, highlight }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    return () => {
      reader.abort();
    };
  }, [file]);

  if (!preview) return null;

  const containerClasses = `relative group w-24 h-24 flex-shrink-0 rounded-lg transition-all duration-300 ${
    highlight ? 'ring-4 ring-purple-500 shadow-lg shadow-purple-500/50' : ''
  }`;

  return (
    <div className={containerClasses}>
      <img src={preview} alt={file.name} className="w-full h-full object-cover rounded-md border border-[var(--border-color)]" />
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
        aria-label="이미지 제거"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};


export const ImageInput: React.FC<ImageInputProps> = ({ files, onFilesChange, isLoading, maxFiles, highlight, replace = false }) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();
  const errorTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
        }
    };
  }, []);

  const displayError = useCallback((message: string) => {
    if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
    }
    setError(message);
    errorTimeoutRef.current = window.setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
    }, 5000);
  }, []);

  const processFiles = useCallback((incomingFiles: FileList) => {
    const newFiles = Array.from(incomingFiles);
    if (newFiles.length === 0) return;
  
    const validNewFiles = newFiles.filter(f => {
      if (!f.type.startsWith('image/')) {
        displayError('일부 파일은 유효한 이미지가 아니므로 무시되었습니다.');
        return false;
      }
      return true;
    });
  
    if (validNewFiles.length === 0) return;
  
    if (replace) {
      // In replace mode, just take the last valid file and call onFilesChange.
      const fileToSet = validNewFiles.slice(-1);
      onFilesChange(fileToSet);
      setError(null);
      return;
    }

    // Existing logic for appending
    const currentFileCount = files.length;
    if (maxFiles && currentFileCount >= maxFiles) {
      displayError(`최대 ${maxFiles}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }
  
    let filesToAdd = validNewFiles;
    if (maxFiles && (currentFileCount + validNewFiles.length) > maxFiles) {
      const slotsAvailable = maxFiles - currentFileCount;
      filesToAdd = validNewFiles.slice(0, slotsAvailable);
      displayError(`최대 ${maxFiles}개의 이미지만 업로드할 수 있습니다. ${filesToAdd.length}개의 이미지가 추가되었습니다.`);
    } else {
      setError(null);
    }
  
    if (filesToAdd.length > 0) {
      onFilesChange([...files, ...filesToAdd]);
    }
  }, [files, onFilesChange, maxFiles, displayError, replace]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(event.target.files);
    }
    event.target.value = '';
  }, [processFiles]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      setIsDragging(true);
    }
  }, [isLoading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isLoading) return;
    processFiles(e.dataTransfer.files);
  }, [isLoading, processFiles]);
  
  const handleRemoveFile = useCallback((indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const dropzoneClasses = `
    relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer 
    transition-all
    ${isLoading ? 'cursor-not-allowed bg-black/20 border-gray-700' :
      isDragging 
        ? 'border-purple-400 bg-purple-900/20' 
        : 'bg-black/20 border-gray-600 hover:border-purple-400 hover:bg-black/30'
    }
  `;

  const showDropzone = !replace || files.length === 0;

  return (
    <div className="w-full">
       {files.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3 p-2 bg-black/20 rounded-lg">
            {files.map((file, index) => (
                <FilePreview 
                  key={`${file.name}-${index}`} 
                  file={file} 
                  onRemove={() => handleRemoveFile(index)} 
                  highlight={!!highlight && files.length === 1 && index === 0}
                />
            ))}
        </div>
      )}
      {showDropzone && (
        <label
            htmlFor={inputId}
            className={dropzoneClasses}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-purple-400">클릭하여 업로드</span>하거나 드래그 앤 드롭하세요</p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP 등 (최대 {maxFiles || '제한 없음'})</p>
            </div>
            <input 
                id={inputId}
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*"
                disabled={isLoading}
                multiple={!replace}
            />
        </label>
      )}
      {error && <p className="mt-2 text-sm text-red-500 animate-fade-in">{error}</p>}
    </div>
  );
};