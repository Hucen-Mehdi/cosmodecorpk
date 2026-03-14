
"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/src/api/config';

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (url: string) => void;
  label: string;
  folder: 'products' | 'banners' | 'categories' | 'general';
  productId?: number;
}

export function ImageUploader({ currentImage, onImageChange, label, folder }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('folder', folder);
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      onImageChange(result.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">
        {label}
      </label>

      <div
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group h-48 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-3 bg-gray-50
          ${dragActive ? 'border-rose-400 bg-rose-50/30' : 'border-gray-200 hover:border-rose-300 hover:bg-gray-100/50'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onFileChange}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Uploading to VPS...</p>
          </div>
        ) : currentImage ? (
          <>
            <img 
              src={currentImage.startsWith('http') ? currentImage : `${API_BASE_URL.replace('/api', '')}${currentImage}`} 
              alt="Preview" 
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <Upload className="w-8 h-8 text-white" />
              <p className="text-white text-[10px] font-bold uppercase tracking-widest">Change Image</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 group-hover:text-rose-500 transition-colors">
              <Upload className="w-8 h-8" />
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Click or Drag Image</p>
              <p className="text-[10px] text-gray-400 mt-1">Direct upload to VPS storage</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest ml-1 animate-in slide-in-from-top-2">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}

      {/* URL Fallback */}
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-gray-300 group-focus-within:text-rose-400 transition-colors" />
        </div>
        <input
            type="text"
            value={currentImage || ''}
            onChange={(e) => onImageChange(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-50/50 focus:border-rose-400 transition-all font-medium text-xs text-gray-500"
            placeholder="Or paste external image URL..."
        />
      </div>
    </div>
  );
}
