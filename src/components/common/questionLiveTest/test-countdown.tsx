import { useEffect, useState } from 'react'
import { useAssessmentStore } from '@/stores/assessment-store'
// import { toast } from '@/components/ui/use-toast'
import { toast } from "sonner";

import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogAction } from '@/components/ui/alert-dialog'

// export function TestCountdown() {
//   const { assessment, testEndTime, submitAssessment, loadTestDuration, updateTestDuration } = useAssessmentStore()
//   const [timeLeft, setTimeLeft] = useState<number | null>(null)
//   const [showFinalCountdown, setShowFinalCountdown] = useState(false)

//   useEffect(() => {
//     if (!assessment?.testDuration.entireTestDuration || !testEndTime) return

//     const updateTimeLeft = () => {
//       const now = Date.now()
//       const diff = testEndTime - now
//       setTimeLeft(Math.max(0, Math.floor(diff / 1000)))
//     }

//     updateTimeLeft()
//     const timer = setInterval(updateTimeLeft, 1000)

//     return () => clearInterval(timer)
//   }, [assessment, testEndTime])

//   useEffect(() => {
//     const { loadTestDuration, updateTestDuration } = useAssessmentStore.getState()
//     loadTestDuration()

//     const interval = setInterval(() => {
//       const { testDuration } = useAssessmentStore.getState()
//       if (testDuration) {
//         const updatedDuration = {
//           entireTestDurationLeft: formatTime(timeLeft),
//           sectionWiseDurationLeft: testDuration.sectionWiseDurationLeft,
//           questionWiseDurationLeft: testDuration.questionWiseDurationLeft
//         }
//         updateTestDuration(updatedDuration)
//       }
//     }, 1000)

//     return () => clearInterval(interval)
//   }, [])

//   useEffect(() => {
//     if (timeLeft === null) return

//     if (timeLeft === 600) { // 10 minutes left
//       toast({
//         title: "10 minutes left!",
//         description: "The test will end soon.",
//         duration: 10000,
//       })
      
//     } else if (timeLeft === 60) { // 1 minute left
//       toast({
//         title: "1 minute left!",
//         description: "The test is about to end.",
//         duration: 10000,
//       })
//     } else if (timeLeft === 10) { // 10 seconds left
//       setShowFinalCountdown(true)
//     } else if (timeLeft === 0) {
//       submitAssessment()
//     }
//   }, [timeLeft, submitAssessment])

//   if (timeLeft === null || timeLeft > 600) return null

//   return (
//     <>
//       <div className="fixed bottom-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg">
//         Test ends in: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
//       </div>
//       <AlertDialog open={showFinalCountdown} onOpenChange={setShowFinalCountdown}>
//         <AlertDialogContent>
//           <AlertDialogDescription>
//             Test ending in {timeLeft} seconds! Your responses will be submitted automatically.
//           </AlertDialogDescription>
//           <AlertDialogAction onClick={() => setShowFinalCountdown(false)}>
//             Close
//           </AlertDialogAction>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   )
// }

// const formatTime = (seconds: number) => {
//   const minutes = Math.floor(seconds / 60)
//   const remainingSeconds = seconds % 60
//   return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
// }





// import { useEffect, useState } from 'react'
// import { useAssessmentStore } from '../store/assessment-store'
// import { toast } from '@/components/ui/use-toast'
// import { Button } from '@/components/ui/button'
// import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogAction } from '@/components/ui/alert-dialog'
// import { getAssessmentData, saveAssessmentData } from '../utils/capacitor'

export function TestCountdown() {
  const { assessment, testEndTime, submitAssessment, loadTestDuration, updateTestDuration } = useAssessmentStore()
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showFinalCountdown, setShowFinalCountdown] = useState(false)

  useEffect(() => {
    if (!assessment?.testDuration.entireTestDuration || !testEndTime) return

    const updateTimeLeft = () => {
      const now = Date.now()
      const diff = testEndTime - now
      setTimeLeft(Math.max(0, Math.floor(diff / 1000)))
    }

    updateTimeLeft()
    const timer = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [assessment, testEndTime])

  useEffect(() => {
    const { loadTestDuration, updateTestDuration } = useAssessmentStore.getState()
    loadTestDuration()

    const interval = setInterval(async () => {
      const assessmentData = await getAssessmentData()
      if (assessmentData.testDuration) {
        const updatedDuration = {
          entireTestDurationLeft: formatTime(timeLeft),
          sectionDurationLeft: assessmentData.testDuration.sectionDurationLeft
        }
        await saveAssessmentData({
          ...assessmentData,
          testDuration: updatedDuration
        })
        updateTestDuration(updatedDuration)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (timeLeft === null) return

    if (timeLeft === 600) { // 10 minutes left
      toast({
        title: "10 minutes left!",
        description: "The test will end soon.",
        duration: 10000,
      })
    } else if (timeLeft === 60) { // 1 minute left
      toast({
        title: "1 minute left!",
        description: "The test is about to end.",
        duration: 10000,
      })
    } else if (timeLeft === 10) { // 10 seconds left
      setShowFinalCountdown(true)
    } else if (timeLeft === 0) {
      submitAssessment()
    }
  }, [timeLeft, submitAssessment])

  if (timeLeft === null || timeLeft > 600) return null

  return (
    <>
      <div className="fixed bottom-4 left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg">
        Test ends in: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
      </div>
      <AlertDialog open={showFinalCountdown} onOpenChange={setShowFinalCountdown}>
        <AlertDialogContent>
          <AlertDialogDescription>
            Test ending in {timeLeft} seconds! Your responses will be submitted automatically.
          </AlertDialogDescription>
          <AlertDialogAction onClick={() => setShowFinalCountdown(false)}>
            Close
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const formatTime = (seconds: number | null) => {
  if (seconds === null) return '00:00'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

