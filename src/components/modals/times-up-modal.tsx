import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertCircle } from 'lucide-react'

interface TimesUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFinish: () => void
}

export function TimesUpModal({ open, onOpenChange, onFinish }: TimesUpModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary-500" />
            Time is up!
          </AlertDialogTitle>
          <AlertDialogDescription>
            Time for the Assessment has ended. Your responses will now be automatically submitted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onFinish}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            Finish
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

