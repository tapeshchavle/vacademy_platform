export interface TrackingDataType {
    id: string,
    source_id: string | null,
    source_type: string | null,
    user_id: string,
    slide_id: string | null,
    start_time_in_millis: number,
    end_time_in_millis: number,
    percentage_watched: number | null,
    videos: 
      {
        id: string,
        start_time_in_millis: number,
        end_time_in_millis: number
      }[] | null,
    documents: 
      {
        id: string,
        start_time_in_millis: number,
        end_time_in_millis: number,
        page_number: number
      }[]
     | null
  }