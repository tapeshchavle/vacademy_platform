export interface Option {
  optionId: string;
  optionName: string;
}

export interface Question {
  questionType: string;
  questionId: string;
  questionName: string;
  questionMark: string;
  imageDetails: any[];
  options: Option[];
}

export interface Section {
  assesmentDuration: string;
  subject: string;
  sectionDesc: string;
  sectionDuration: string;
  negativeMarking: {
    checked: boolean;
    value: string;
  };
  partialMarking: boolean;
  cutoffMarking: {
    checked: boolean;
    value: string;
  };
  totalMark: string;
  questions: Question[];
}

export interface Assessment {
  assessmentId: string;
  title: string;
  mode: string;
  status: string;
  startDate: string;
  endDate: string;
  assessmentDuration: string;
  subject: string;
  assessmentInstruction: string;
  assessmentPreview: string;
  canSwitchSections: boolean;
  sections: Section[];
}

export interface QuestionState {
  isAnswered: boolean;
  isVisited: boolean;
  isMarkedForReview: boolean;
}

