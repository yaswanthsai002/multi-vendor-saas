'use client';

import { AlertCircle, Film, FileUp, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { useUploadMedia } from '../hooks/use-media';
import { validateMediaFiles } from '../types/media.types';

interface MediaUploadDialogProps {
  open: boolean;
  onClose: () => void;
  initialFiles?: File[];
  onUploadInBackground?: (files: File[]) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaUploadDialog({
  open,
  onClose,
  initialFiles,
  onUploadInBackground,
}: MediaUploadDialogProps) {
  const [files, setFiles] = React.useState<File[]>(() => {
    if (initialFiles && initialFiles.length > 0) {
      const { valid } = validateMediaFiles(initialFiles);
      return valid;
    }
    return [];
  });

  const [validationError, setValidationError] = React.useState<string | null>(() => {
    if (initialFiles && initialFiles.length > 0) {
      const { errors } = validateMediaFiles(initialFiles);
      return errors.length > 0 ? errors.join('. ') : null;
    }
    return null;
  });

  const [isDragging, setIsDragging] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadMedia();

  const handleClose = React.useCallback(() => {
    setFiles([]);
    setValidationError(null);
    onClose();
  }, [onClose]);

  // Reactive object URL generation for image previews without memory leaks
  const previews = React.useMemo(() => {
    return files.map((f) => {
      if (f.type.startsWith('image/')) {
        return URL.createObjectURL(f);
      }
      return null;
    });
  }, [files]);

  React.useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  if (!open) return null;

  const validateAndAddFiles = (incoming: FileList | File[]) => {
    setValidationError(null);
    const { valid, errors } = validateMediaFiles(incoming);

    const newFiles: File[] = [];
    valid.forEach((f) => {
      const exists = files.some((existing) => existing.name === f.name && existing.size === f.size);
      if (!exists && !newFiles.some((item) => item.name === f.name && item.size === f.size)) {
        newFiles.push(f);
      }
    });

    if (errors.length > 0) {
      setValidationError(errors.join('. '));
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleForegroundUpload = async () => {
    if (files.length === 0) return;

    try {
      await uploadMutation.mutateAsync(files);
      handleClose();
    } catch {
      // Error handled by hook's toast
    }
  };

  const handleBackgroundUpload = () => {
    if (files.length === 0) return;

    const filesToUpload = [...files];
    handleClose();

    if (onUploadInBackground) {
      onUploadInBackground(filesToUpload);
    } else {
      uploadMutation.mutate(filesToUpload);
    }
  };

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg rounded-2xl bg-surface-raised dark:bg-surface border border-border-default shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <h2 id="upload-dialog-title" className="text-lg font-semibold text-text-primary">
            Upload Media
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors text-center ${
              isDragging
                ? 'border-accent bg-accent/5'
                : 'border-border-default hover:border-border-strong bg-surface dark:bg-surface-subtle'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.mp4,.webm,.mov"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  validateAndAddFiles(e.target.files);
                }
              }}
              className="hidden"
            />

            <div className="p-3 rounded-full bg-surface-subtle text-accent mb-3">
              <Upload className="h-6 w-6" />
            </div>

            <p className="text-sm font-medium text-text-primary">
              Click to browse or drag and drop files here
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              Supports multiple images (JPEG, PNG, WebP up to 10MB) and videos (MP4, WebM up to
              100MB)
            </p>
          </div>

          {/* Validation Error */}
          {validationError ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-100 text-danger-500 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          ) : null}

          {/* Selected Files List */}
          {files.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-text-tertiary px-1">
                <span>
                  {files.length} {files.length === 1 ? 'file' : 'files'} selected (
                  {formatFileSize(totalBytes)})
                </span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-text-tertiary hover:text-danger-500 cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {files.map((f, index) => {
                  const url = previews[index];
                  const isVideo = f.type.startsWith('video/');

                  return (
                    <div
                      key={`${f.name}-${index}`}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border-default bg-surface dark:bg-surface-subtle"
                    >
                      <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        {url ? (
                          <Image
                            src={url}
                            alt="Preview"
                            width={40}
                            height={40}
                            unoptimized
                            className="h-10 w-10 object-cover rounded-md border border-border-subtle shrink-0"
                          />
                        ) : isVideo ? (
                          <div className="h-10 w-10 rounded-md bg-accent/15 text-accent flex items-center justify-center shrink-0">
                            <Film className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-secondary-accent/15 text-secondary-accent flex items-center justify-center shrink-0">
                            <FileUp className="h-5 w-5" />
                          </div>
                        )}
                        <div className="truncate text-xs">
                          <p className="font-semibold text-text-primary truncate">{f.name}</p>
                          <p className="text-text-tertiary">
                            {formatFileSize(f.size)} • {f.type || 'file'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="text-text-tertiary hover:text-danger-500 p-1 cursor-pointer shrink-0 ml-2"
                        aria-label={`Remove ${f.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border-default bg-surface dark:bg-surface-subtle">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploadMutation.isPending}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {files.length > 0 ? (
              <button
                type="button"
                onClick={handleBackgroundUpload}
                disabled={uploadMutation.isPending}
                className="px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border border-border-default text-text-primary hover:bg-surface-hover transition-colors cursor-pointer disabled:opacity-50"
              >
                Upload in background
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleForegroundUpload}
              disabled={files.length === 0 || uploadMutation.isPending}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-active transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    Uploading {files.length} {files.length === 1 ? 'file' : 'files'}...
                  </span>
                </>
              ) : (
                <span>Upload {files.length > 1 ? `${files.length} files` : 'file'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
