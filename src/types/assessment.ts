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