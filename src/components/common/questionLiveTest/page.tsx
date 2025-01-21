
"use client";

import { useEffect, useState } from "react";
import { QuestionDisplay } from "./question-display";
import { SectionTabs } from "./section-tabs";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { Sidebar } from "./sidebar";
import { useAssessmentStore } from "@/stores/assessment-store";
import { AssessmentPreview } from "./assessment-preview";
// import { useSearchParams } from 'next/navigation'
// import { initNetworkListeners } from '../utils/network'
import { Toaster } from "@/components/ui/toaster";
// import { NetworkStatus } from '@/components/network-status'

// import { TestCountdown } from './test-countdown'
import { initNetworkListeners } from "@/routes/assessment/examination/-utils.ts/network";
// import { NetworkStatus } from './network-status'



const dummyAssessment = {
  assessmentId: "A001",
  title: "The Human Eye and The Colourful World",
  mode: "Online",
  status: "Active",
  startDate: "13/10/2024, 11:15 AM",
  endDate: "15/10/2024, 08:30 PM",
  testDuration: {
    entireTestDuration: "00:01:00",
    sectionWiseDuration: true,
    questionWiseDuration: true,
  },
  subject: "Physics",
  assessmentInstruction: `1. Attempt All Questions: Answer all questions. Ensure accuracy and completeness in each response.`,
  assessmentPreview: {
    checked: true,
    Duration: "01:00",
  },
  canSwitchSections: false,
  sections: [
    {
      subject: "Biology",
      sectionDesc: "Challenge your understanding of the chapter 'Human Eye'",
      sectionDuration: "03:00",
      negativeMarking: {
        checked: true,
        value: "1",
      },
      partialMarking: true,
      cutoffMarking: {
        checked: true,
        value: "08",
      },
      totalMark: "20",
      questions: [
        {
          "questionType": "MCQ (Multiple Correct)",
          "questionId": "Q1",
          "questionName": "What is the primary function of the human eye?",
          "questionMark": "2",
          "questionDuration": "00:03",
          "imageDetails": [],
          "options": [
            { "optionId": "O001", "optionName": "To detect UFOs" },
            { "optionId": "O002", "optionName": "To judge people silently" },
            { "optionId": "O003", "optionName": "To find lost socks" },
            { "optionId": "O004", "optionName": "To scroll social media endlessly" }
          ]
        },
        {
          "questionType": "MCQ (Single Correct)",
          "questionId": "Q2",
          "questionName": "Which part of the eye controls the amount of light entering it?",
          "questionMark": "2",
          "questionDuration": "00:03",
          "imageDetails": [],
          "options": [
            { "optionId": "O001", "optionName": "Cornea (also a great name for a sci-fi villain)" },
            { "optionId": "O002", "optionName": "Iris (because it's always watching)" },
            { "optionId": "O003", "optionName": "Lens (just like in your phone camera)" },
            { "optionId": "O004", "optionName": "Retina (sounds like a fancy dessert)" }
          ]
        },
        {
          "questionType": "MCQ (Single Correct)",
          "questionId": "Q3",
          "questionName": "Which eye defect is caused by the elongation of the eyeball?",
          "questionMark": "2",
          "questionDuration": "01:00",
          "imageDetails": [],
          "options": [
            { "optionId": "O001", "optionName": "Hypermetropia (when your eyeball says 'I’m too long!')" },
            { "optionId": "O002", "optionName": "Myopia (aka Netflix syndrome)" },
            { "optionId": "O003", "optionName": "Astigmatism (when your eyes party too hard)" },
            { "optionId": "O004", "optionName": "Presbyopia (don’t Google this, you’ll squint)" }
          ]
        },
        {
          "questionType": "MCQ (Single Correct)",
          "questionId": "Q4",
          "questionName": "Which structure in the eye focuses light onto the retina?",
          "questionMark": "2",
          "questionDuration": "01:00",
          "imageDetails": [],
          "options": [
            { "optionId": "O001", "optionName": "Lens (basically your eye’s photographer)" },
            { "optionId": "O002", "optionName": "Cornea (the unpaid intern doing the first shift)" },
            { "optionId": "O003", "optionName": "Retina (the canvas for light graffiti)" },
            { "optionId": "O004", "optionName": "Pupil (just there for the vibes)" }
          ]
        },
        {
          "questionType": "MCQ (Single Correct)",
          "questionId": "Q5",
          "questionName": "Which part of the eye is responsible for detecting color?",
          "questionMark": "2",
          "questionDuration": "01:00",
          "imageDetails": [],
          "options": [
            { "optionId": "O001", "optionName": "Lens (but only if it’s wearing color contacts)" },
            { "optionId": "O002", "optionName": "Retina (the eye’s personal rainbow collector)" },
            { "optionId": "O003", "optionName": "Pupil (it's too busy posing for pictures)" },
            { "optionId": "O004", "optionName": "Iris (always outshining everyone else)" }
          ]
        }
      ]
      ,
    },
    {
      subject: "Biology",
      sectionDesc: "Challenge your understanding of the chapter 'Human Eye'",
      sectionDuration: "02:09",
      negativeMarking: {
        checked: true,
        value: "1",
      },
      partialMarking: true,
      cutoffMarking: {
        checked: true,
        value: "08",
      },
      totalMark: "20",
      questions: [
        {
          questionType: "MCQ (Multiple Correct)",
          questionId: "Q001",
          questionName: "What is the primary function of the human eye?",
          questionMark: "2",
          questionDuration: "00:03",
          imageDetails: [],
          options: [
            { optionId: "O001", optionName: "To detect sound" },
            { optionId: "O002", optionName: "To detect light" },
            { optionId: "O003", optionName: "To pump blood" },
            { optionId: "O004", optionName: "To support breathing" },
          ],
        },
        {
          questionType: "MCQ (Single Correct)",
          questionId: "Q002",
          questionName:
            "Which part of the eye controls the amount of light entering it?",
          questionMark: "2",
          questionDuration: "00:03",
          imageDetails: [],
          options: [
            { optionId: "O001", optionName: "Cornea" },
            { optionId: "O002", optionName: "Iris" },
            { optionId: "O003", optionName: "Lens" },
            { optionId: "O004", optionName: "Retina" },
          ],
        },
        {
          questionType: "MCQ (Single Correct)",
          questionId: "Q003",
          questionName: "What is the function of the cornea?",
          questionMark: "2",
          questionDuration: "01:00",
          imageDetails: [],
          options: [
            { optionId: "O001", optionName: "Focus light" },
            { optionId: "O002", optionName: "Block dust particles" },
            { optionId: "O003", optionName: "Protect the eye from UV light" },
            { optionId: "O004", optionName: "Support the lens" },
          ],
        },
        {
          questionType: "MCQ (Single Correct)",
          questionId: "Q004",
          questionName:
            "Which eye defect is caused by the elongation of the eyeball?",
          questionMark: "2",
          questionDuration: "01:00",
          imageDetails: [],
          options: [
            { optionId: "O001", optionName: "Hypermetropia" },
            { optionId: "O002", optionName: "Myopia" },
            { optionId: "O003", optionName: "Astigmatism" },
            { optionId: "O004", optionName: "Presbyopia" },
          ],
        },
        {
          questionType: "MCQ (Single Correct)",
          questionId: "Q005",
          questionName:
            "Which structure in the eye focuses light onto the retina?",
          questionMark: "2",
          questionDuration: "01:00",
          imageDetails: [],
          options: [
            { optionId: "O001", optionName: "Lens" },
            { optionId: "O002", optionName: "Cornea" },
            { optionId: "O003", optionName: "Retina" },
            { optionId: "O004", optionName: "Pupil" },
          ],
        },
        {
          questionType: "MCQ (Single Correct)",
          questionId: "Q006",
          questionName: "Which of these is a common cause of cataracts?",
          questionMark: "2",
          questionDuration: "01:00",
          imageDetails: [],
          options: [
            { optionId: "O001", optionName: "High blood pressure" },
            { optionId: "O002", optionName: "Diabetes" },
            { optionId: "O003", optionName: "Aging" },
            { optionId: "O004", optionName: "Lack of sleep" },
          ],
        },
        {
          questionType: "MCQ (Single Correct)",
          questionId: "Q007",
          questionName:
            "Which part of the eye is responsible for detecting color?",
          questionMark: "2",
          questionDuration: "01:00",
          imageDetails: [],
          options: [
            { optionId: "O001", optionName: "Lens" },
            { optionId: "O002", optionName: "Retina" },
            { optionId: "O003", optionName: "Pupil" },
            { optionId: "O004", optionName: "Iris" },
          ],
        },
        {
          questionType: "MCQ (Single Correct)",
          questionId: "Q008",
          questionName: "What is the effect of hypermetropia?",
          questionMark: "2",
          questionDuration: "01:00",
          imageDetails: [],
          options: [
            { optionId: "O001", optionName: "Inability to see far objects" },
            {
              optionId: "O002",
              optionName: "Inability to see nearby objects",
            },
            {
              optionId: "O003",
              optionName: "Blurred vision at all distances",
            },
            { optionId: "O004", optionName: "Complete blindness" },
          ],
        },
        {
          questionType: "MCQ (Single Correct)",
          questionId: "Q009",
          questionName: "What does the retina contain?",
          questionMark: "2",
          questionDuration: "01:00",
          imageDetails: [],
          options: [
            { optionId: "O001", optionName: "Photoreceptor cells" },
            { optionId: "O002", optionName: "Ciliary muscles" },
            { optionId: "O003", optionName: "Optic nerves" },
            { optionId: "O004", optionName: "Corneal cells" },
          ],
        },
        {
          questionType: "MCQ (Single Correct)",
          questionId: "Q010",
          questionName: "What is the role of the pupil?",
          questionMark: "2",
          questionDuration: "01:00",
          imageDetails: [],
          options: [
            {
              optionId: "O001",
              optionName: "Regulate the amount of light entering the eye",
            },
            { optionId: "O002", optionName: "Focus light onto the retina" },
            { optionId: "O003", optionName: "Detect colors" },
            { optionId: "O004", optionName: "Control eye movement" },
          ],
        },
      ],
    },
    {
      subject: "Physics",
      sectionDesc: "Explore the fascinating topics of the colorful world",
      sectionDuration: "00:29",
      negativeMarking: {
        checked: true,
        value: "1",
      },
      partialMarking: true,
      cutoffMarking: {
        checked: true,
        value: "08",
      },
      totalMark: "20",
      questions: [
        {
          questionType: "MCQ (Multiple Correct)",
          questionId: "Q011",
          questionName: "What is the speed of light in a vacuum?",
          questionMark: "2",
          questionDuration: "00:07",
          imageDetails: [],
          options: [
            { optionId: "O001", optionName: "300,000 km/s" },
            { optionId: "O002", optionName: "150,000 km/s" },
            { optionId: "O003", optionName: "450,000 km/s" },
            { optionId: "O004", optionName: "500,000 km/s" },
          ],
        },
      ],
    },
    {
      subject: "Physics",
      sectionDesc: "Explore the fascinating topics of the colorful world",
      sectionDuration: "10:00",
      negativeMarking: {
        checked: true,
        value: "1",
      },
      partialMarking: true,
      cutoffMarking: {
        checked: true,
        value: "08",
      },
      totalMark: "20",
      questions: [
        {
          questionType: "MCQ (Multiple Correct)",
          questionId: "Q012",
          questionName: "What is the speed of light in a vacuum?",
          questionMark: "2",
          questionDuration: "01:00",
          imageDetails: [],
          options: [
            { optionId: "O001", optionName: "300,000 km/s" },
            { optionId: "O002", optionName: "150,000 km/s" },
            { optionId: "O003", optionName: "450,000 km/s" },
            { optionId: "O004", optionName: "500,000 km/s" },
          ],
        },
      ],
    },
    // {
    //   subject: "Physics",
    //   sectionDesc: "Explore the fascinating topics of the colorful world",
    //   sectionDuration: "10:00",
    //   negativeMarking: {
    //     checked: true,
    //     value: "1",
    //   },
    //   partialMarking: true,
    //   cutoffMarking: {
    //     checked: true,
    //     value: "08",
    //   },
    //   totalMark: "20",
    //   questions: [
    //     {
    //       questionType: "MCQ (Multiple Correct)",
    //       questionId: "Q011",
    //       questionName: "What is the speed of light in a vacuum?",
    //       questionMark: "2",
    //       questionDuration: "01:00",
    //       imageDetails: [],
    //       options: [
    //         { optionId: "O001", optionName: "300,000 km/s" },
    //         { optionId: "O002", optionName: "150,000 km/s" },
    //         { optionId: "O003", optionName: "450,000 km/s" },
    //         { optionId: "O004", optionName: "500,000 km/s" },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   subject: "Physics",
    //   sectionDesc: "Explore the fascinating topics of the colorful world",
    //   sectionDuration: "10:00",
    //   negativeMarking: {
    //     checked: true,
    //     value: "1",
    //   },
    //   partialMarking: true,
    //   cutoffMarking: {
    //     checked: true,
    //     value: "08",
    //   },
    //   totalMark: "20",
    //   questions: [
    //     {
    //       questionType: "MCQ (Multiple Correct)",
    //       questionId: "Q011",
    //       questionName: "What is the speed of light in a vacuum?",
    //       questionMark: "2",
    //       questionDuration: "01:00",
    //       imageDetails: [],
    //       options: [
    //         { optionId: "O001", optionName: "300,000 km/s" },
    //         { optionId: "O002", optionName: "150,000 km/s" },
    //         { optionId: "O003", optionName: "450,000 km/s" },
    //         { optionId: "O004", optionName: "500,000 km/s" },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   subject: "Physics",
    //   sectionDesc: "Explore the fascinating topics of the colorful world",
    //   sectionDuration: "10:00",
    //   negativeMarking: {
    //     checked: true,
    //     value: "1",
    //   },
    //   partialMarking: true,
    //   cutoffMarking: {
    //     checked: true,
    //     value: "08",
    //   },
    //   totalMark: "20",
    //   questions: [
    //     {
    //       questionType: "MCQ (Multiple Correct)",
    //       questionId: "Q011",
    //       questionName: "What is the speed of light in a vacuum?",
    //       questionMark: "2",
    //       questionDuration: "01:00",
    //       imageDetails: [],
    //       options: [
    //         { optionId: "O001", optionName: "300,000 km/s" },
    //         { optionId: "O002", optionName: "150,000 km/s" },
    //         { optionId: "O003", optionName: "450,000 km/s" },
    //         { optionId: "O004", optionName: "500,000 km/s" },
    //       ],
    //     },
    //   ],
    // },
    // {
    //   subject: "Physics",
    //   sectionDesc: "Explore the fascinating topics of the colorful world",
    //   sectionDuration: "10:00",
    //   negativeMarking: {
    //     checked: true,
    //     value: "1",
    //   },
    //   partialMarking: true,
    //   cutoffMarking: {
    //     checked: true,
    //     value: "08",
    //   },
    //   totalMark: "20",
    //   questions: [
    //     {
    //       questionType: "MCQ (Multiple Correct)",
    //       questionId: "Q011",
    //       questionName: "What is the speed of light in a vacuum?",
    //       questionMark: "2",
    //       questionDuration: "01:00",
    //       imageDetails: [],
    //       options: [
    //         { optionId: "O001", optionName: "300,000 km/s" },
    //         { optionId: "O002", optionName: "150,000 km/s" },
    //         { optionId: "O003", optionName: "450,000 km/s" },
    //         { optionId: "O004", optionName: "500,000 km/s" },
    //       ],
    //     },
    //   ],
    // },
    
  ],
};

export default function Page() {
  const { setAssessment } = useAssessmentStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    setAssessment(dummyAssessment)
  }, [setAssessment])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="flex flex-col w-full bg-gray-50">
      <Navbar />
      <SectionTabs />
      <div className="flex-1 overflow-hidden">
        <main className="w-full h-full p-4 md:p-6 overflow-auto">
          <QuestionDisplay />
        </main>
      </div>
      <Footer onToggleSidebar={toggleSidebar} />
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  )
}
