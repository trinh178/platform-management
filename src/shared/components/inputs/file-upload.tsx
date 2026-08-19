'use client';

import * as React from 'react';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export interface FileUploadValue {
  id?: string;
  name: string;
  size?: number;
  type?: string;
  url?: string;
  file?: File;
}

export interface FileUploadProps {
  value?: FileUploadValue | FileUploadValue[];
  onValueChange: (
    value: FileUploadValue | FileUploadValue[] | undefined,
  ) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  isError?: boolean;
  placeholder?: string;
  browseText?: string;
  emptyText?: string;
  maxVisibleFiles?: number;
  formatFileSize?: (size: number) => string;
  className?: string;
  inputStyle?: React.CSSProperties;
  controlStyle?: React.CSSProperties;
  controlClassName?: string;
  openFileDialogRef?: React.MutableRefObject<(() => void) | null>;
}

function toFileUploadValue(file: File): FileUploadValue {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    file,
  };
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;

  const units = ['KB', 'MB', 'GB'];
  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function getFiles(value: FileUploadProps['value']) {
  if (!value) return [];

  return Array.isArray(value) ? value : [value];
}

export default function FileUpload({
  value,
  onValueChange,
  multiple,
  accept,
  maxFiles,
  maxSize,
  disabled,
  readOnly,
  loading,
  isError,
  placeholder,
  browseText = 'Choose file',
  emptyText,
  maxVisibleFiles = 2,
  formatFileSize = formatBytes,
  className,
  inputStyle,
  controlStyle,
  controlClassName,
  openFileDialogRef,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const files = React.useMemo(() => getFiles(value), [value]);
  const visibleFiles = files.slice(0, maxVisibleFiles);
  const hiddenCount = Math.max(files.length - visibleFiles.length, 0);
  const isDisabled = disabled || loading;

  const handleOpenFileDialog = React.useCallback(() => {
    if (isDisabled || readOnly) return;
    inputRef.current?.click();
  }, [isDisabled, readOnly]);

  React.useEffect(() => {
    if (!openFileDialogRef) return;

    openFileDialogRef.current = handleOpenFileDialog;

    return () => {
      openFileDialogRef.current = null;
    };
  }, [openFileDialogRef, handleOpenFileDialog]);

  const commitFiles = React.useCallback(
    (selectedFiles: File[]) => {
      const nextFiles = selectedFiles
        .filter(file => !maxSize || file.size <= maxSize)
        .slice(0, multiple ? maxFiles : 1)
        .map(toFileUploadValue);

      onValueChange(multiple ? nextFiles : nextFiles[0]);
    },
    [maxFiles, maxSize, multiple, onValueChange],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    commitFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isDisabled || readOnly) return;

    commitFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div
      className={cn(
        'relative h-9 w-full rounded-md border border-input bg-background',
        {
          'border-destructive': isError,
          'opacity-50 pointer-events-none': isDisabled,
        },
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={isDisabled || readOnly}
        className="sr-only"
        onChange={handleChange}
      />

      <div
        role="button"
        tabIndex={isDisabled || readOnly ? -1 : 0}
        className="flex h-full w-full min-w-0 items-center gap-2 overflow-hidden px-3 text-left text-sm"
        style={inputStyle}
        onClick={handleOpenFileDialog}
        onDragOver={e => {
          e.preventDefault();
        }}
        onDrop={handleDrop}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenFileDialog();
          }
        }}
      >
        {files.length === 0 ? (
          <span className="truncate text-muted-foreground">
            {placeholder ?? emptyText ?? browseText}
          </span>
        ) : (
          <>
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
              {visibleFiles.map((file, index) => (
                <span
                  key={`${file.id ?? file.url ?? file.name}-${index}`}
                  className="min-w-0 truncate"
                  title={file.name}
                >
                  {file.url ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                      onClick={e => e.stopPropagation()}
                    >
                      {file.name}
                    </a>
                  ) : (
                    file.name
                  )}
                </span>
              ))}
            </span>
            {hiddenCount > 0 && (
              <span className="shrink-0 text-muted-foreground">
                +{hiddenCount}
              </span>
            )}
            {files.length === 1 && files[0]?.size !== undefined && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatFileSize(files[0].size)}
              </span>
            )}
          </>
        )}
      </div>

      {!readOnly && (
        <Button
          type="button"
          variant="link"
          size="icon-sm"
          className={cn(
            'absolute top-1/2 h-8! w-8! -translate-y-1/2',
            controlClassName,
          )}
          style={controlStyle ?? { right: '0.5rem' }}
          disabled={isDisabled}
          onPointerDown={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            handleOpenFileDialog();
          }}
        >
          <Upload />
          <span className="sr-only">{browseText}</span>
        </Button>
      )}
    </div>
  );
}
