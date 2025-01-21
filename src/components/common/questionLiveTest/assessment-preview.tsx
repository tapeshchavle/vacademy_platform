'use client'

import React, { useState, useEffect } from 'react';
import { useAssessmentStore } from '@/stores/assessment-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNavigate } from "@tanstack/react-router";
import { MyButton } from '@/components/design-system/button';

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
    Duration: "05:10"
  },
  canSwitchSections: false,
  sections: [
    
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
    
    
  ],
};

export function AssessmentPreview() {
  const { assessment } = useAssessmentStore();
  const { setAssessment } = useAssessmentStore()
  const [activeSection, setActiveSection] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => {
    const [minutes, seconds] = dummyAssessment.assessmentPreview.Duration.split(':').map(Number);
    return minutes * 60 + seconds;
  });
  const navigate = useNavigate();

   useEffect(() => {
      setAssessment(dummyAssessment)
    }, [setAssessment])

  useEffect(() => {
    if (timeLeft <= 0) {
      navigate({ to: "/assessment/examination/$assessmentId/LearnerLiveTest/" });
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  if (!assessment) return null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col w-full bg-gray-50">

      {/* Navbar with Timer */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="flex flex-col sm:flex-row items-center justify-between p-4">
          <h1 className="text-base font-semibold">{assessment.title}</h1>
          <div className="flex items-center gap-2  mt-2 sm:mt-0 lg:mr-10 md:mr-10">
            {formatTime(timeLeft).split(':').map((time, index) => (
              <span key={index} className="border border-gray-400 px-2 py-1 rounded">
                {time}
              </span>
            ))}
          </div>
        </div>

      {/* Section Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex overflow-x-auto items-center justify-between p-4 pb-0">
          <div className="flex flex-nowrap items-center space-x-4">
        {assessment.sections.map((section, index) => (
          <button
        key={index}
        onClick={() => setActiveSection(index)}
        className={`px-4 py-2 text-sm rounded-t-lg ${
          activeSection === index
        ? 'bg-orange-50 text-orange-500 border border-b-0 border-orange-500'
        : 'text-gray-600'
        }`}
          >
        <div className="flex items-center gap-2 min-w-max">
          <span>Section {index + 1}</span>
        </div>
          </button>
        ))}
          </div>
        </div>
      </div>
      </div>

      {/* Main content */}
      <ScrollArea className="flex-1 p-4 sm:p-6">
        {assessment.sections[activeSection].questions.map((question, idx) => (
          <div key={question.questionId} className="mb-8 bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex flex-row  gap-2 mb-4">
              <span className="text-sm text-gray-500">Question {idx + 1}</span>
              <span className="text-sm text-gray-500 items-end">{question.questionMark} Marks</span>
            </div>
            
            <p className="text-base mb-4">{question.questionName}</p>

            {question.questionImage && (
              <div className="mb-4">
                <img 
                  src={question.questionImage} 
                  alt="Question illustration"
                  className="max-w-full rounded-lg"
                />
              </div>
            )}

            <div className="space-y-3">
              {question.options.map((option) => (
                <div 
                  key={option.optionId}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  {option.optionName}
                </div>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* Footer */}
      <div className="sticky bottom-0 p-4 bg-white border-t">
        <div className="flex justify-center">
          <Button 
            onClick={() => navigate({ to: "/assessment/examination/$assessmentId/LearnerLiveTest/" })}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Start Test
          </Button>
        </div>
      </div>
    </div>
  );
}
