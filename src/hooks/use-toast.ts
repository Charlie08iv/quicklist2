
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

type ToastOptions = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  action?: ToastActionElement
}

// Completely disable toast functionality but accept parameters for type compatibility
function useToast() {
  return {
    toast: (options?: ToastOptions) => ({}),
    dismiss: (toastId?: string) => {},
    toasts: []
  }
}

function toast(options?: ToastOptions) {
  return {}
}

export { useToast, toast }
