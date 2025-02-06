export interface TrackingDataType {
    id: string,
    source_id: string | null,
    source_type: string | null,
    user_id: string,
    slide_id: string | null,
    start_time: string | null,
    end_time: string | null,
    percentage_watched: number | null,
    videos: [
      {
        id: string,
        start_time: string ,
        end_time: string 
      }
    ] | null,
    documents: [
      {
        id: string,
        start_time: string,
        end_time: string,
        page_number: number
      }
    ] | null
  }