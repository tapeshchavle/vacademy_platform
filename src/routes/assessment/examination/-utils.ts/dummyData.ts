import { Assessment } from "@/types/previewInstructionAssessment";

const dummyAssessment = [
  {
    assessmentId: "A001",
    title: "The Human Eye and The Colourful World",
    mode: "Online",
    status: "Active",
    startDate: "13/10/2024, 11:15 AM",
    endDate: "15/10/2024, 08:30 PM",
    assessmentDuration: "30 min", 
    subject: "Physics",
    assessmentInstruction: `
    1. Attempt All Questions: Answer all questions. Ensure accuracy and completeness in each response.
          2. Objective Format: All questions are multiple-choice. Select the best answer for each question.
          3. Single Attempt Only: This Assessment allows for one submission only. Once you submit, you cannot change your answers.
          4. Negative Marking: Incorrect answers may result in a deduction of points.
          5. Submission Guidelines: Double-check all answers before submitting. Click Submit only when you are ready.
          6. No External Help: This is an individual Assessment. Using textbooks, notes, or assistance from others is not permitted.
          7. Stay Focused: Avoid switching tabs or leaving the exam screen, as it may be flagged as suspicious behavior.
          8. Good Luck! Answer carefully and review each question before proceeding.`,
    assessmentPreview: "5 min",
    canSwitchSections: true,
    sections: [
      {
        assesmentDuration: "10 min",
        subject: "Biology",
        sectionDesc: `
          Challenge your understanding of the chapter "Human Eye" with this test. Dive into topics such as the structure of the eye, vision mechanisms, common visual defects, and their corrections. Sharpen your knowledge and prepare effectively!`,
        sectionDuration: "20min",
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
            questionType: "Multiple Choice",
            questionId: "Q001",
            questionName: "What is the primary function of the human eye?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "To detect sound" },
              { optionId: "O002", optionName: "To detect light" },
              { optionId: "O003", optionName: "To pump blood" },
              { optionId: "O004", optionName: "To support breathing" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q002",
            questionName:
              "Which part of the eye controls the amount of light entering it?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Cornea" },
              { optionId: "O002", optionName: "Iris" },
              { optionId: "O003", optionName: "Lens" },
              { optionId: "O004", optionName: "Retina" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q003",
            questionName: "What is the function of the cornea?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Focus light" },
              { optionId: "O002", optionName: "Block dust particles" },
              { optionId: "O003", optionName: "Protect the eye from UV light" },
              { optionId: "O004", optionName: "Support the lens" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q004",
            questionName:
              "Which eye defect is caused by the elongation of the eyeball?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Hypermetropia" },
              { optionId: "O002", optionName: "Myopia" },
              { optionId: "O003", optionName: "Astigmatism" },
              { optionId: "O004", optionName: "Presbyopia" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q005",
            questionName:
              "Which structure in the eye focuses light onto the retina?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Lens" },
              { optionId: "O002", optionName: "Cornea" },
              { optionId: "O003", optionName: "Retina" },
              { optionId: "O004", optionName: "Pupil" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q006",
            questionName: "Which of these is a common cause of cataracts?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "High blood pressure" },
              { optionId: "O002", optionName: "Diabetes" },
              { optionId: "O003", optionName: "Aging" },
              { optionId: "O004", optionName: "Lack of sleep" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q007",
            questionName:
              "Which part of the eye is responsible for detecting color?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Lens" },
              { optionId: "O002", optionName: "Retina" },
              { optionId: "O003", optionName: "Pupil" },
              { optionId: "O004", optionName: "Iris" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q008",
            questionName: "What is the effect of hypermetropia?",
            questionMark: "2",
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
            questionType: "Multiple Choice",
            questionId: "Q009",
            questionName: "What does the retina contain?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Photoreceptor cells" },
              { optionId: "O002", optionName: "Ciliary muscles" },
              { optionId: "O003", optionName: "Optic nerves" },
              { optionId: "O004", optionName: "Corneal cells" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q010",
            questionName: "What is the role of the pupil?",
            questionMark: "2",
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
        assesmentDuration: "20 min",
        subject: "Physics",
        sectionDesc: `
          Explore the fascinating topics of the colorful world around us. Delve into the physical principles behind light, color, and the human eye's ability to perceive these colors.`,
        sectionDuration: "NA",
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
            questionType: "Multiple Choice",
            questionId: "Q01",
            questionName: "What is the speed of light in a vacuum?",
            questionMark: "2",
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
  },

  {
    assessmentId: "A002",
    title: "The Human Eye and The Colourful World",
    mode: "Online",
    status: "Paused",
    startDate: "13/10/2024, 11:15 AM",
    endDate: "15/10/2024, 08:30 PM",
    assessmentDuration: "20 min",
    subject: "Physics",
    assessmentInstruction: `
          1. Attempt in each response.`,
    assessmentPreview: "1 min",
    canSwitchSections: true,
    sections: [
      {
        assesmentDuration: "20 min",
        subject: "Biology",
        sectionDesc: `
              Challenge your understanding of the chapter "Human Eye" with this test. Dive into topics such as the structure of the eye, vision mechanisms, common visual defects, and their corrections. Sharpen your knowledge and prepare effectively!`,
        sectionDuration: "NA",
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
            questionType: "Multiple Choice",
            questionId: "Q001",
            questionName: "What is the primary function of the human eye?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "To detect sound" },
              { optionId: "O002", optionName: "To detect light" },
              { optionId: "O003", optionName: "To pump blood" },
              { optionId: "O004", optionName: "To support breathing" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q002",
            questionName:
              "Which part of the eye controls the amount of light entering it?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Cornea" },
              { optionId: "O002", optionName: "Iris" },
              { optionId: "O003", optionName: "Lens" },
              { optionId: "O004", optionName: "Retina" },
            ],
          },
        ],
      },
      {
        assesmentDuration: "20 min",
        subject: "Biology",
        sectionDesc: `
              Challenge your understanding of the chapter "Human Eye" with this test. Dive into topics such as the structure of the eye, vision mechanisms, common visual defects, and their corrections. Sharpen your knowledge and prepare effectively!`,
        sectionDuration: "NA",
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
            questionType: "Multiple Choice",
            questionId: "Q001",
            questionName: "What is the primary human eye?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "To detect sound" },
              { optionId: "O002", optionName: "To detect light" },
              { optionId: "O003", optionName: "To pump blood" },
              { optionId: "O004", optionName: "To support breathing" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q002",
            questionName: "Which part ntering it?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Cornea" },
              { optionId: "O002", optionName: "Iris" },
              { optionId: "O003", optionName: "Lens" },
              { optionId: "O004", optionName: "Retina" },
            ],
          },
        ],
      },
    ],
  },
  
  {
    assessmentId: "A003",
    title: "Circles",
    mode: "Online",
    status: "Active",
    startDate: "13/10/2024, 11:15 AM",
    endDate: "15/10/2024, 08:30 PM",
    assessmentDuration: "20 min",
    subject: "Physics",
    assessmentInstruction: `
          1. Attempt All Questions: Answer all questions. Ensure accuracy and completeness in each response.
          2. Objective Format: All questions are multiple-choice. Select the best answer for each question.
          3. Single Attempt Only: This Assessment allows for one submission only. Once you submit, you cannot change your answers.
          4. Negative Marking: Incorrect answers may result in a deduction of points.
          5. Submission Guidelines: Double-check all answers before submitting. Click Submit only when you are ready.
          6. No External Help: This is an individual Assessment. Using textbooks, notes, or assistance from others is not permitted.
          7. Stay Focused: Avoid switching tabs or leaving the exam screen, as it may be flagged as suspicious behavior.
          8. Good Luck! Answer carefully and review each question before proceeding.`,
    assessmentPreview: "5 min",
    canSwitchSections: true,
    sections: [
      {
        assesmentDuration: "20 min",
        subject: "Biology",
        sectionDesc: `
              Challenge your understanding of the chapter "Human Eye" with this test. Dive into topics such as the structure of the eye, vision mechanisms, common visual defects, and their corrections. Sharpen your knowledge and prepare effectively!`,
        sectionDuration: "NA",
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
            questionType: "Multiple Choice",
            questionId: "Q001",
            questionName: "What is the primary function of the human eye?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "To detect sound" },
              { optionId: "O002", optionName: "To detect light" },
              { optionId: "O003", optionName: "To pump blood" },
              { optionId: "O004", optionName: "To support breathing" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q002",
            questionName:
              "Which part of the eye controls the amount of light entering it?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Cornea" },
              { optionId: "O002", optionName: "Iris" },
              { optionId: "O003", optionName: "Lens" },
              { optionId: "O004", optionName: "Retina" },
            ],
          },
        ],
      },
    ],
  },
  {
    assessmentId: "A004",
    title: "Quadratic Equations",
    mode: "Offline",
    status: "Active",
    startDate: "13/10/2024, 11:15 AM",
    endDate: "15/10/2024, 08:30 PM",
    assessmentDuration: "20 min",
    subject: "Mathematics",
    assessmentInstruction: `
          Follow the general assessment guidelines as mentioned in other assessments.`,
    assessmentPreview: "5 min",
    canSwitchSections: false,
    sections: [
      {
        assesmentDuration: "20 min",
        subject: "Mathematics",
        sectionDesc: `
              Solve polynomial equations and test your algebraic understanding. Learn to identify polynomial degrees, roots, and factorization methods.`,
        sectionDuration: "NA",
        negativeMarking: {
          checked: false,
          value: "0",
        },
        partialMarking: false,
        cutoffMarking: {
          checked: false,
          value: "0",
        },
        totalMark: "25",
        questions: [
          {
            questionType: "Short Answer",
            questionId: "Q101",
            questionName: "Find the roots of the polynomial x^2 - 5x + 6 = 0.",
            questionMark: "5",
            imageDetails: [],
            options: [],
          },
        ],
      },
    ],
  },

  {
    assessmentId: "A001",
    title: "Applications of Trigonometry",
    mode: "Online",
    status: "Active",
    startDate: "13/10/2024, 11:15 AM",
    endDate: "15/10/2024, 08:30 PM",
    assessmentDuration: "30 min",
    subject: "Physics",
    assessmentInstruction: `
    1. Attempt All Questions: Answer all questions. Ensure accuracy and completeness in each response.
          2. Objective Format: All questions are multiple-choice. Select the best answer for each question.
          3. Single Attempt Only: This Assessment allows for one submission only. Once you submit, you cannot change your answers.
          4. Negative Marking: Incorrect answers may result in a deduction of points.
          5. Submission Guidelines: Double-check all answers before submitting. Click Submit only when you are ready.
          6. No External Help: This is an individual Assessment. Using textbooks, notes, or assistance from others is not permitted.
          7. Stay Focused: Avoid switching tabs or leaving the exam screen, as it may be flagged as suspicious behavior.
          8. Good Luck! Answer carefully and review each question before proceeding.`,
    assessmentPreview: "5 min",
    canSwitchSections: true,
    sections: [
      {
        assesmentDuration: "10 min",
        subject: "Biology",
        sectionDesc: `
          Challenge your understanding of the chapter "Human Eye" with this test. Dive into topics such as the structure of the eye, vision mechanisms, common visual defects, and their corrections. Sharpen your knowledge and prepare effectively!`,
        sectionDuration: "20min",
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
            questionType: "Multiple Choice",
            questionId: "Q001",
            questionName: "What is the primary function of the human eye?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "To detect sound" },
              { optionId: "O002", optionName: "To detect light" },
              { optionId: "O003", optionName: "To pump blood" },
              { optionId: "O004", optionName: "To support breathing" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q002",
            questionName:
              "Which part of the eye controls the amount of light entering it?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Cornea" },
              { optionId: "O002", optionName: "Iris" },
              { optionId: "O003", optionName: "Lens" },
              { optionId: "O004", optionName: "Retina" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q003",
            questionName: "What is the function of the cornea?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Focus light" },
              { optionId: "O002", optionName: "Block dust particles" },
              { optionId: "O003", optionName: "Protect the eye from UV light" },
              { optionId: "O004", optionName: "Support the lens" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q004",
            questionName:
              "Which eye defect is caused by the elongation of the eyeball?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Hypermetropia" },
              { optionId: "O002", optionName: "Myopia" },
              { optionId: "O003", optionName: "Astigmatism" },
              { optionId: "O004", optionName: "Presbyopia" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q005",
            questionName:
              "Which structure in the eye focuses light onto the retina?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Lens" },
              { optionId: "O002", optionName: "Cornea" },
              { optionId: "O003", optionName: "Retina" },
              { optionId: "O004", optionName: "Pupil" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q006",
            questionName: "Which of these is a common cause of cataracts?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "High blood pressure" },
              { optionId: "O002", optionName: "Diabetes" },
              { optionId: "O003", optionName: "Aging" },
              { optionId: "O004", optionName: "Lack of sleep" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q007",
            questionName:
              "Which part of the eye is responsible for detecting color?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Lens" },
              { optionId: "O002", optionName: "Retina" },
              { optionId: "O003", optionName: "Pupil" },
              { optionId: "O004", optionName: "Iris" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q008",
            questionName: "What is the effect of hypermetropia?",
            questionMark: "2",
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
            questionType: "Multiple Choice",
            questionId: "Q009",
            questionName: "What does the retina contain?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Photoreceptor cells" },
              { optionId: "O002", optionName: "Ciliary muscles" },
              { optionId: "O003", optionName: "Optic nerves" },
              { optionId: "O004", optionName: "Corneal cells" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q010",
            questionName: "What is the role of the pupil?",
            questionMark: "2",
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
        assesmentDuration: "20 min",
        subject: "Physics",
        sectionDesc: `
          Explore the fascinating topics of the colorful world around us. Delve into the physical principles behind light, color, and the human eye's ability to perceive these colors.`,
        sectionDuration: "NA",
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
            questionType: "Multiple Choice",
            questionId: "Q01",
            questionName: "What is the speed of light in a vacuum?",
            questionMark: "2",
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
  },
  {
    assessmentId: "A001",
    title: "Surface Areas and Volumes",
    mode: "Online",
    status: "Active",
    startDate: "13/10/2024, 11:15 AM",
    endDate: "15/10/2024, 08:30 PM",
    assessmentDuration: "30 min",
    subject: "Physics",
    assessmentInstruction: `
    1. Attempt All Questions: Answer all questions. Ensure accuracy and completeness in each response.
          2. Objective Format: All questions are multiple-choice. Select the best answer for each question.
          3. Single Attempt Only: This Assessment allows for one submission only. Once you submit, you cannot change your answers.
          4. Negative Marking: Incorrect answers may result in a deduction of points.
          5. Submission Guidelines: Double-check all answers before submitting. Click Submit only when you are ready.
          6. No External Help: This is an individual Assessment. Using textbooks, notes, or assistance from others is not permitted.
          7. Stay Focused: Avoid switching tabs or leaving the exam screen, as it may be flagged as suspicious behavior.
          8. Good Luck! Answer carefully and review each question before proceeding.`,
    assessmentPreview: "5 min",
    canSwitchSections: true,
    sections: [
      {
        assesmentDuration: "10 min",
        subject: "Biology",
        sectionDesc: `
          Challenge your understanding of the chapter "Human Eye" with this test. Dive into topics such as the structure of the eye, vision mechanisms, common visual defects, and their corrections. Sharpen your knowledge and prepare effectively!`,
        sectionDuration: "20min",
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
            questionType: "Multiple Choice",
            questionId: "Q001",
            questionName: "What is the primary function of the human eye?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "To detect sound" },
              { optionId: "O002", optionName: "To detect light" },
              { optionId: "O003", optionName: "To pump blood" },
              { optionId: "O004", optionName: "To support breathing" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q002",
            questionName:
              "Which part of the eye controls the amount of light entering it?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Cornea" },
              { optionId: "O002", optionName: "Iris" },
              { optionId: "O003", optionName: "Lens" },
              { optionId: "O004", optionName: "Retina" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q003",
            questionName: "What is the function of the cornea?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Focus light" },
              { optionId: "O002", optionName: "Block dust particles" },
              { optionId: "O003", optionName: "Protect the eye from UV light" },
              { optionId: "O004", optionName: "Support the lens" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q004",
            questionName:
              "Which eye defect is caused by the elongation of the eyeball?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Hypermetropia" },
              { optionId: "O002", optionName: "Myopia" },
              { optionId: "O003", optionName: "Astigmatism" },
              { optionId: "O004", optionName: "Presbyopia" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q005",
            questionName:
              "Which structure in the eye focuses light onto the retina?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Lens" },
              { optionId: "O002", optionName: "Cornea" },
              { optionId: "O003", optionName: "Retina" },
              { optionId: "O004", optionName: "Pupil" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q006",
            questionName: "Which of these is a common cause of cataracts?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "High blood pressure" },
              { optionId: "O002", optionName: "Diabetes" },
              { optionId: "O003", optionName: "Aging" },
              { optionId: "O004", optionName: "Lack of sleep" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q007",
            questionName:
              "Which part of the eye is responsible for detecting color?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Lens" },
              { optionId: "O002", optionName: "Retina" },
              { optionId: "O003", optionName: "Pupil" },
              { optionId: "O004", optionName: "Iris" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q008",
            questionName: "What is the effect of hypermetropia?",
            questionMark: "2",
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
            questionType: "Multiple Choice",
            questionId: "Q009",
            questionName: "What does the retina contain?",
            questionMark: "2",
            imageDetails: [],
            options: [
              { optionId: "O001", optionName: "Photoreceptor cells" },
              { optionId: "O002", optionName: "Ciliary muscles" },
              { optionId: "O003", optionName: "Optic nerves" },
              { optionId: "O004", optionName: "Corneal cells" },
            ],
          },
          {
            questionType: "Multiple Choice",
            questionId: "Q010",
            questionName: "What is the role of the pupil?",
            questionMark: "2",
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
        assesmentDuration: "20 min",
        subject: "Physics",
        sectionDesc: `
          Explore the fascinating topics of the colorful world around us. Delve into the physical principles behind light, color, and the human eye's ability to perceive these colors.`,
        sectionDuration: "NA",
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
            questionType: "Multiple Choice",
            questionId: "Q01",
            questionName: "What is the speed of light in a vacuum?",
            questionMark: "2",
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
  },
];

// const UpcomingAssessment = [
//   {
//     title: "The Human Eye and The Colourful World",
//     subject: "Physics",
//     liveDate: "17 Oct - 19 Oct",
//     availability: "11:00 am - 6:00 pm",
//     duration: "20 min",
//     isLive: false,
//   },
//   {
//     title: "Polynomials",
//     subject: "Mathematics",
//     liveDate: "17 Oct",
//     availability: "Whole day",
//     duration: "20 min",
//     isLive: true,
//   },
//   {
//     title: "Chemical Reactions",
//     subject: "Chemistry",
//     liveDate: "18 Oct",
//     availability: "9:00 am - 5:00 pm",
//     duration: "30 min",
//     isLive: false,
//   },
//   {
//     title: "Trigonometry",
//     subject: "Mathematics",
//     liveDate: "19 Oct",
//     availability: "Whole day",
//     duration: "25 min",
//     isLive: true,
//   },
//   {
//     title: "Electricity",
//     subject: "Physics",
//     liveDate: "20 Oct",
//     availability: "10:00 am - 4:00 pm",
//     duration: "35 min",
//     isLive: false,
//   },
// ];
const UpcomingAssessment = [
  {
    title: "The Human Eye and The Colourful World",
    subject: "Physics",
    liveDate: "17 Oct - 19 Oct",
    availability: "11:00 am - 6:00 pm",
    duration: "20 min",
    isLive: false,
    mode: "Offline",
  },
  {
    title: "Polynomials",
    subject: "Mathematics",
    liveDate: "17 Oct",
    availability: "Whole day",
    duration: "20 min",
    isLive: true,
    mode: "Online",
  },
  {
    title: "Chemical Reactions",
    subject: "Chemistry",
    liveDate: "18 Oct",
    availability: "9:00 am - 5:00 pm",
    duration: "30 min",
    isLive: false,
    mode: "Offline",
  },
  {
    title: "Trigonometry",
    subject: "Mathematics",
    liveDate: "19 Oct",
    availability: "Whole day",
    duration: "25 min",
    isLive: true,
    mode: "Online",
  },
  {
    title: "Electricity",
    subject: "Physics",
    liveDate: "20 Oct",
    availability: "10:00 am - 4:00 pm",
    duration: "35 min",
    isLive: false,
    mode: "Offline",
  },
];

export default dummyAssessment;
export { UpcomingAssessment };
