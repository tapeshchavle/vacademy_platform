import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, X } from 'lucide-react'
import { useState } from "react"

interface HelpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'instructions' | 'alerts' | 'reattempt' | 'time'
}

export function HelpModal({ open, onOpenChange, type }: HelpModalProps) {
  const [reason, setReason] = useState('')

  const getTitle = () => {
    switch (type) {
      case 'instructions':
        return 'Assessment Instructions'
      case 'alerts':
        return 'Assessment Alerts'
      case 'reattempt':
        return 'Request Reattempt'
      case 'time':
        return 'Request Time Increase'
    }
  }

  const getContent = () => {
    switch (type) {
      case 'instructions':
        return (
          <div className="space-y-4 mt-4">
            <p>1. Attempt All Questions: Answer all questions. Ensure accuracy and completeness in each response.</p>
            <p>2. Time Management: Keep track of time for each section.</p>
            <p>3. Review: Use the review feature to mark questions for later review.</p>
          </div>
        )
      case 'alerts':
        return (
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              <p>No active alerts at this time.</p>
            </div>
          </div>
        )
      case 'reattempt':
      case 'time':
        return (
          <div className="space-y-4">
            <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg mt-4">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-600">
                Please provide a reason for requesting a {type === 'reattempt' ? 'reattempt' : 'time extension'} for the Assessment to submit to the admin.
              </p>
            </div>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Type your reason here"
              className="min-h-[100px]"
            />
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                // Handle submission
                setReason('')
                onOpenChange(false)
              }}
            >
              Submit
            </Button>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{getTitle()}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        {getContent()}
      </DialogContent>
    </Dialog>
  )
}


