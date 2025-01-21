'use client'

import { useEffect } from 'react'
import { Clock } from 'lucide-react'
import { useAssessmentStore } from '@/stores/assessment-store'

export function SectionTimer() {
  const { 
    currentSection,
    sectionTimers,
    updateSectionTimer,
    moveToNextAvailableSection,
    findNextAvailableSection
  } = useAssessmentStore()

  const currentTimer = sectionTimers[currentSection]

  useEffect(() => {
    if (!currentTimer?.isRunning) return

    const timer = setInterval(() => {
      const newTime = Math.max(0, currentTimer.timeLeft - 1000)
      updateSectionTimer(currentSection, newTime)
      
      // If time is up for current section, move to next available section
      if (newTime === 0) {
        const nextSection = findNextAvailableSection()
        if (nextSection !== null && nextSection !== currentSection) {
          moveToNextAvailableSection()
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [currentTimer?.isRunning, currentTimer?.timeLeft, currentSection])

  if (!currentTimer) return null

  const minutes = Math.floor(currentTimer.timeLeft / 60000)
  const seconds = Math.floor((currentTimer.timeLeft % 60000) / 1000)

  return (
    <div className="flex items-center gap-2 text-lg font-mono">
      <Clock className="h-5 w-5" />
      <span className={currentTimer.timeLeft < 60000 ? "text-red-500" : ""}>
        {String(minutes).padStart(2, '0')}:
        {String(seconds).padStart(2, '0')}
      </span>
    </div>
  )
}

