import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertCircle } from 'lucide-react'

interface SubmitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function SubmitModal({ open, onOpenChange, onConfirm }: SubmitModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary-500" />
            Submit Assessment
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to submit your responses? Before submitting, make sure you have given your best responses.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            Submit
          </AlertDialogAction>
          <AlertDialogCancel className="w-full mt-0">
            Check my responses
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

