'use client'

import {
  ReactNode,
  useEffect,
} from 'react'
import { X } from 'lucide-react'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxWidth?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener(
        'keydown',
        handleKeyDown,
      )
    }

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
      />

      <div
        className={`relative z-10 w-full ${maxWidth} overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          {title ? (
            <h2 className="text-lg font-semibold text-text-primary">
              {title}
            </h2>
          ) : (
            <div />
          )}

          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}