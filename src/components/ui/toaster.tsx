
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="p-3 space-x-2 items-center">
            <div className="grid gap-1 flex-grow">
              {title && <ToastTitle className="text-xs">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs text-muted-foreground">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-4 right-4 z-[100] flex flex-col-reverse p-2 md:max-w-[320px] w-full" />
    </ToastProvider>
  )
}
