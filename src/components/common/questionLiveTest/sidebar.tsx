'use client'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { QuestionNavigator } from './question-navigator'


interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 w-80">
        <QuestionNavigator onClose={onClose} />
      </SheetContent>
    </Sheet>
  )
}
