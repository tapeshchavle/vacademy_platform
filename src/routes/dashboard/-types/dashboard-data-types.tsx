export type DashboardSlide = {
  slide_description: string;
  document_cover_file_id: string;
  video_description: string;
  document_last_page: number;
  video_last_time_stamp: number;
  video_title: string;
  video_url: string;
  slide_title: string;
  document_id: string;
  document_title: string;
  document_type: string;
  document_data: string;
  video_id: string;
  video_source_type: string;
  slide_order: number;
  published_url: string;
  published_data: string;
  image_file_id: string;
  slide_id: string;
  package_id: string;
  module_id: string;
  chapter_id: string;
  subject_id: string;
  source_type: string;
  status: string;
  level_id: string;
};

export type DashbaordResponse = {
  courses: number;
  tests_assigned: number;
  slides: DashboardSlide[];
};
