
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

// Completely disable toast functionality
function useToast() {
  return {
    toast: () => ({}),
    dismiss: () => {},
    toasts: []
  }
}

function toast() {
  return {}
}

export { useToast, toast }
