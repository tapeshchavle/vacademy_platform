import { Storage } from '@capacitor/storage';
import { useAssessmentStore } from "@/stores/assessment-store";
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { RESTART_ASSESSMENT } from '@/constants/urls';
// import { formatDataFromStore } from '@/components/common/questionLiveTest/page';

// export async function restartAssessment(assessmentId, attemptId) {
//   try {
//     // Simulating API call to restart assessment
//     const restartApiResponse = await authenticatedAxiosInstance.post(
//       `${RESTART_ASSESSMENT}`,
//       { json_content: JSON.stringify(formatDataFromStore(assessmentId))},
//         {
//           params: {
//             assessmentId: assessmentId,
//             attemptId: attemptId,
//           },
//         }
//     );
//     console.log('Restart assessment API response:', restartApiResponse);
    
//     const data = await restartApiResponse;

//     // Destructure the response data
//     const { preview_response, learner_assessment_attempt_data_dto, update_status_response } = data;

//     // 1. Store assessment data
//     await Storage.set({
//       key: 'Assessment_questions',
//       value: JSON.stringify(preview_response)
//     });

//     // 2. Handle assessment responses
//     storeFormattedData(learner_assessment_attempt_data_dto);
//     // const existingState = await Storage.get({ key: `ASSESSMENT_STATE_${attemptId}` });
//     // if (!existingState.value) {
//     //   // If no existing state, store the new responses
//     //   useAssessmentStore.getState().setAssessment(learner_assessment_attempt_data_dto);
//     //   await useAssessmentStore.getState().saveState();
//     // }

//     // 3. Store update_status_response
//     await Storage.set({
//       key: 'Announcements',
//       value: JSON.stringify(update_status_response)
//     });

//     console.log('Assessment restart completed successfully');
//     return true;
//   } catch (error) {
//     console.error('Error restarting assessment:', error);
//     return false;
//   }
// }

const formatStoredAssessmentData = (storedData) => {
  if (!storedData || !storedData.assessment) {
    console.error("Invalid stored assessment data.");
    return null;
  }

  return {
    attemptId: storedData.assessment?.attempt_id,
    clientLastSync: new Date().toISOString(),
    assessment: {
      assessmentId: storedData.assessment?.assessment_id,
      entireTestDurationLeftInSeconds: storedData.entireTestTimer || 0,
      timeElapsedInSeconds: storedData.assessment?.preview_total_time
        ? storedData.assessment.preview_total_time * 60 - storedData.entireTestTimer
        : 0,
      status: "LIVE",
      tabSwitchCount: storedData.tabSwitchCount || 0,
    },
    sections: storedData.assessment?.section_dtos?.map((section, idx) => ({
      sectionId: section.id,
      sectionDurationLeftInSeconds: storedData.sectionTimers?.[section.id]?.timeLeft || 0,
      timeElapsedInSeconds: section.duration
        ? section.duration * 60 - (storedData.sectionTimers?.[section.id]?.timeLeft || 0)
        : 0,
      questions: section.question_preview_dto_list?.map((question) => ({
        questionId: question.question_id,
        questionDurationLeftInSeconds:
          storedData.questionTimers?.[question.question_id] || 0,
        timeTakenInSeconds: storedData.questionTimeSpent?.[question.question_id] || 0,
        isMarkedForReview:
          storedData.questionStates?.[question.question_id]?.isMarkedForReview || false,
        isVisited:
          storedData.questionStates?.[question.question_id]?.isVisited || false,
        responseData: {
          type: question.question_type,
          optionIds: storedData.answers?.[question.question_id] || [],
        },
      })),
    })),
  };
};


// const formatStoredAssessmentData = (storedData) => {
//   if (!storedData || !storedData.assessment) {
//     console.error("Invalid stored assessment data.");
//     return null;
//   }

//   return {
//     attemptId: storedData.assessment?.attempt_id,
//     clientLastSync: new Date().toISOString(),
//     assessment: {
//       assessmentId: storedData.assessment?.assessment_id,
//       entireTestDurationLeftInSeconds: storedData.entireTestTimer || 0,
//       timeElapsedInSeconds: storedData.assessment?.preview_total_time
//         ? storedData.assessment.preview_total_time * 60 - storedData.entireTestTimer
//         : 0,
//       status: "LIVE",
//       tabSwitchCount: storedData.tabSwitchCount || 0,
//     },
//     sections: storedData.assessment?.section_dtos?.map((section, idx) => ({
//       sectionId: section.id,
//       sectionDurationLeftInSeconds: storedData.sectionTimers?.[section.id]?.timeLeft || 0,
//       timeElapsedInSeconds: section.duration
//         ? section.duration * 60 - (storedData.sectionTimers?.[section.id]?.timeLeft || 0)
//         : 0,
//       questions: section.question_preview_dto_list?.map((question) => ({
//         questionId: question.question_id,
//         questionDurationLeftInSeconds: storedData.questionTimers?.[question.question_id] || 0,
//         timeTakenInSeconds: storedData.questionTimeSpent?.[question.question_id] || 0,
//         isMarkedForReview: storedData.questionStates?.[question.question_id]?.isMarkedForReview || false,
//         isVisited: storedData.questionStates?.[question.question_id]?.isVisited || false,
//         responseData: {
//           type: question.question_type,
//           optionIds: storedData.answers?.[question.question_id] || [],
//         },
//       })),
//     })),
//   };
// };


// const formatDataFromStore = (assessment_id: string) => {
//   const state = useAssessmentStore.getState();
//   console.log("state in formatDataFromStore",state, "assessment_id", assessment_id);
//   return {
//     attemptId: state.assessment?.attempt_id,
//     clientLastSync: new Date().toISOString(),
//     assessment: {
//       assessmentId: assessment_id,
//       entireTestDurationLeftInSeconds: state.entireTestTimer,
//       timeElapsedInSeconds: state.assessment?.duration
//         ? state.assessment.duration * 60 - state.entireTestTimer
//         : 0,
//       status: "LIVE",
//       tabSwitchCount: state.tabSwitchCount || 0,
//     },
//     sections: state.assessment?.section_dtos?.map((section, idx) => ({
//       sectionId: section.id,
//       sectionDurationLeftInSeconds: state.sectionTimers?.[idx]?.timeLeft || 0,
//       timeElapsedInSeconds: section.duration
//         ? section.duration * 60 - (state.sectionTimers?.[idx]?.timeLeft || 0)
//         : 0,
//       questions: section.question_preview_dto_list?.map((question) => ({
//         questionId: question.question_id,
//         questionDurationLeftInSeconds:
//           state.questionTimers?.[question.question_id] || 0,
//         timeTakenInSeconds:
//         state.questionTimeSpent[question.question_id] || 0,
//         isMarkedForReview:
//           state.questionStates[question.question_id].isMarkedForReview ||
//           false,
//         isVisited:
//           state.questionStates[question.question_id].isVisited || false,
//         responseData: {
//           type: question.question_type,
//           optionIds: state.answers?.[question.question_id] || [],
//         },
//       })),
//     })),
//   };
// };


export async function restartAssessment(assessmentId, attemptId) { 
    console.log('Restarting assessment:', { assessmentId, attemptId });
    const storedAssessmentData = await Storage.get({ key: `ASSESSMENT_STATE_${attemptId}` });

    console.log('Stored Assessment Data:', storedAssessmentData);
    const body = storedAssessmentData.value ? formatStoredAssessmentData(JSON.parse(storedAssessmentData.value)) : {};
    console.log('Restarting assessment with body:', body);
    try {
      // API Call
      const restartApiResponse = await authenticatedAxiosInstance.post(
        `${RESTART_ASSESSMENT}`,
        body, //api body
        { params: { assessmentId, attemptId } }
      );
  
      console.log('Restart API Response:', restartApiResponse);
  
      // Ensure we get the correct data
      const { data } = restartApiResponse;
      if (!data) throw new Error("Empty API response");
  
      const { preview_response, learner_assessment_attempt_data_dto, update_status_response } = data;
      if (!preview_response || !learner_assessment_attempt_data_dto || !update_status_response) {
        console.error("Missing API data:", { preview_response, learner_assessment_attempt_data_dto, update_status_response });
        return false;
      }
  
      // Store data properly
      await Storage.set({ key: 'Assessment_questions', value: JSON.stringify(preview_response) });
      console.log('Stored Assessment Data:', await Storage.get({ key: 'Assessment_questions' }));
      
      console.log('preview_response.attemptId', preview_response, preview_response.attempt_id);
      storeFormattedData(learner_assessment_attempt_data_dto, preview_response );
  
      await Storage.set({ key: 'Announcements', value: JSON.stringify(update_status_response) });
      console.log('Stored Announcements:', await Storage.get({ key: 'Announcements' }));
  
      console.log('Assessment restart completed successfully');
      return true;
    } catch (error) {
      console.error('Error restarting assessment:', error);
      return false;
    }
  }
  



export const storeFormattedData = async (formattedData: any, preview_response : any) => {
    const state = useAssessmentStore.getState();
    const attemptId = preview_response.attempt_id;
    console.log("formattedData",formattedData,"preview_response",preview_response, "attemptId", attemptId);
  console.log(attemptId);
    if (!attemptId) {
      console.error("Attempt ID is missing in formatted data");
      return;
    }
  
    state.setAssessment(preview_response);
    useAssessmentStore.setState({
      assessment: preview_response,
      currentSection: 0, 
      currentQuestion: preview_response.section_dtos[0].question_preview_dto_list[0], 
      questionStates: Object.fromEntries(
        formattedData.sections.flatMap((section: any) =>
          section.questions.map((question: any) => [
            question.questionId,
            {
              isAnswered: question.responseData.optionIds.length > 0,
              isVisited: question.isVisited,
              isMarkedForReview: question.isMarkedForReview,
              isDisabled: false, // Assuming default value
            },
          ])
        )
      ),
      answers: Object.fromEntries(
        formattedData.sections.flatMap((section: any) =>
          section.questions.map((question: any) => [
            question.questionId,
            question.responseData.optionIds || [],
          ])
        )
      ),
      sectionTimers: Object.fromEntries(
        formattedData.sections.map((section: any) => [
          section.sectionId,
          { timeLeft: section.sectionDurationLeftInSeconds },
        ])
      ),
      questionTimers: Object.fromEntries(
        formattedData.sections.flatMap((section: any) =>
          section.questions.map((question: any) => [
            question.questionId,
            question.questionDurationLeftInSeconds,
          ])
        )
      ),
      questionTimeSpent: Object.fromEntries(
        formattedData.sections.flatMap((section: any) =>
          section.questions.map((question: any) => [
            question.questionId,
            question.timeTakenInSeconds,
          ])
        )
      ),
      entireTestTimer: formattedData.assessment.entireTestDurationLeftInSeconds,
      tabSwitchCount: formattedData.assessment.tabSwitchCount,
      questionStartTime: {}, // Needs separate handling
    });
  
    // Save state to storage
    await useAssessmentStore.getState().saveState();
  };
  