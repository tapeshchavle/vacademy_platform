'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SectionTimer } from './section-timer'
import { HelpModal } from '@/components/modals/help-modals'
import { useAssessmentStore } from "@/stores/assessment-store";
import { SubmitModal } from "@/components/modals/submit-modal";
import { TimesUpModal } from "@/components/modals/times-up-modal";
import { useRouter } from "@tanstack/react-router";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogAction } from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HelpCircle, Clock } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const { 
    assessment,
    sectionTimers,
    submitAssessment,
    currentSection,
    setCurrentSection,
    moveToNextAvailableSection,
    testEndTime
  } = useAssessmentStore()

  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showTimesUpModal, setShowTimesUpModal] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [warningCount, setWarningCount] = useState(0)
  const [helpType, setHelpType] = useState<'instructions' | 'alerts' | 'reattempt' | 'time' | null>(null)
  const [entireTimeLeft, setEntireTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount((prev) => prev + 1)
        setShowWarningModal(true)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (!testEndTime) return

    const updateTimeLeft = () => {
      const now = Date.now()
      const diff = testEndTime - now
      setEntireTimeLeft(Math.max(0, Math.floor(diff / 1000)))
    }

    updateTimeLeft()
    const timer = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [testEndTime])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  if (!assessment) return null

  const isAllTimeUp = Object.values(sectionTimers).every(timer => timer.timeLeft === 0)

  const handleSubmit = () => {
    submitAssessment()
    router.push('/assessment/completed')
  }


  if (isAllTimeUp && !showTimesUpModal) {
    setShowTimesUpModal(true)
  }

  const handleWarningClose = () => {
    setShowWarningModal(false)
    if (warningCount >= 3) {
      handleSubmit()
    }
  }

  return (
    <>
      <div className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setHelpType('instructions')}>
                Instructions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setHelpType('alerts')}>
                Assessment Alerts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setHelpType('reattempt')}>
                Request Reattempt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setHelpType('time')}>
                Request Time Increase
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-4">
          <SectionTimer />
          {assessment.testDuration.entireTestDuration && entireTimeLeft !== null && (
            <div className="flex items-center gap-2 text-lg font-mono mr-4">
              <Clock className="h-5 w-5" />
              <span>
                {formatTime(entireTimeLeft)}
              </span>
            </div>
          )}
          <Button 
            variant="default"
            onClick={() => setShowSubmitModal(true)}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Submit
          </Button>
        </div>
      </div>

      <SubmitModal 
        open={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        onConfirm={handleSubmit}
      />

      <TimesUpModal
        open={showTimesUpModal}
        onOpenChange={setShowTimesUpModal}
        onFinish={handleSubmit}
      />

      <AlertDialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <AlertDialogContent>
          <AlertDialogDescription>
            Warning: You are attempting to leave the test environment. This is warning {warningCount} of 3. 
            If you attempt to leave again, your test will be automatically submitted.
          </AlertDialogDescription>
          <AlertDialogAction onClick={handleWarningClose}>
            Return to Test
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <HelpModal
        open={helpType !== null}
        onOpenChange={(open) => !open && setHelpType(null)}
        type={helpType || 'instructions'}
      />
    </>
  )
}

