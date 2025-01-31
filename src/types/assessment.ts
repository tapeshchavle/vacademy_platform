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

export interface Question_dto {
  question_id: string;
  parent_rich_text: string | null;
  question: {
    id: string;
    type: string;
    content: string;
  };
  section_id: string;
  question_duration: number;
  question_order: number;
  marking_json: {
    type: string;
    data: {
      totalMark: string;
      negativeMark: string;
      negativeMarkingPercentage: number;
      partialMarking: number;
      partialMarkingPercentage: number;
    };
  };
  evaluation_json: {
    type: string;
    data: {
      correctOptionIds: string[];
    };
  };
  question_type: string;
  options: Option_dto[];
}

interface Option_dto {
  id: string;
  preview_id: string | null;
  question_id: string;
  text: {
    id: string;
    type: string;
    content: string;
  };
  media_id: string | null;
  option_order: number | null;
  created_on: string;
  updated_on: string;
}

export interface Section_dto {
  id: string;
  name: string;
  description: {
    id: string;
    type: string;
    content: string;
  };
  section_type: string | null;
  duration: number | null;
  total_marks: number;
  cutoff_marks: number;
  section_order: number;
  problem_randomization: string;
  status: string;
  created_at: string;
  updated_at: string;
}
export interface Section {
  id: string;
  name: string;
  description: {
    id: string;
    type: string;
    content: string;
  };
  section_type: string | null;
  duration: number | null;
  total_marks: number;
  cutoff_marks: number;
  section_order: number;
  problem_randomization: string;
  status: string;
  created_at: string;
  updated_at: string;
  questions:Question_dto[];
}

export interface AssessmentPreviewData {
  preview_total_time: number;
  question_preview_dto_list: Question_dto[];
  section_dtos:Section_dto[]
  attempt_id: string;
  assessment_user_registration_id: string;
}

// export interface Section {
//   assesmentDuration: string;
//   subject: string;
//   sectionDesc: string;
//   sectionDuration: string;
//   negativeMarking: {
//     checked: boolean;
//     value: string;
//   };
//   partialMarking: boolean;
//   cutoffMarking: {
//     checked: boolean;
//     value: string;
//   };
//   totalMark: string;
//   questions: Question[];
// }

export type Assessment = {
  assessment_id: string;
  name: string;
  about_id: string | null;
  instruction_id: string;
  play_mode: string;
  evaluation_type: string;
  submission_type: string;
  duration: number;
  assessment_visibility: string;
  status: string;
  registration_close_date: string | null;
  registration_open_date: string | null;
  expected_participants: number | null;
  cover_file_id: string | null;
  bound_start_time: string;
  bound_end_time: string;
  created_at: string;
  updated_at: string;
  recent_attempt_status: string | null;
  recent_attempt_start_date: string | null;
  assessment_attempts: number;
  user_attempts: number | null;
  preview_time: number;
  last_attempt_id: string | null;
  assessment_user_registration_id: string | null;
};

export interface QuestionState {
  isAnswered: boolean;
  isVisited: boolean;
  isMarkedForReview: boolean;
}

export enum assessmentTypes {
  LIVE = "LIVE",
  UPCOMING = "UPCOMING",
  PAST = "PAST",
}