"use client";

import { useEffect, useState } from "react";
import { QuestionDisplay } from "./question-display";
import { SectionTabs } from "./section-tabs";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { Sidebar } from "./sidebar";
import { useAssessmentStore } from "@/stores/assessment-store";
import NetworkStatus from "./network-status";

import { useMutation } from "@tanstack/react-query";
import { Preferences } from "@capacitor/preferences";
import { AssessmentPreviewData } from "@/types/assessment";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { ASSESSMENT_SAVE } from "@/constants/urls";
import { Storage } from "@capacitor/storage";

interface AssessmentData {
  attemptId: string;
  clientLastSync: string;
  assessment: {
    assessmentId: string;
    entireTestDurationLeftInSeconds: number;
    timeElapsedInSeconds: number;
    status: string;
    tabSwitchCount: number;
  };
  sections: Array<{
    sectionId: string;
    timeElapsedInSeconds: number;
    questions: Array<{
      questionId: string;
      questionDurationLeftInSeconds: number;
      timeTakenInSeconds: number;
      responseData: {
        type: string;
        optionIds: string[];
      };
    }>;
  }>;
}

export default function Page() {
  const { loadState, saveState } = useAssessmentStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // const formatData = ({
  //   jsonContent,
  //   attemptId,
  //   assessmentId,
  // }: {
  //   jsonContent: AssessmentPreviewData;
  //   attemptId: string;
  //   assessmentId: string;
  // }): AssessmentData => {
  //   return {
  //     attemptId,
  //     clientLastSync: new Date().toISOString(),
  //     assessment: {
  //       assessmentId,
  //       entireTestDurationLeftInSeconds: jsonContent.duration,
  //       timeElapsedInSeconds: 0,
  //       status: 'LIVE',
  //       tabSwitchCount: 0,
  //     },
  //     sections: jsonContent.section_dtos.map((section) => ({
  //       sectionId: section.id,
  //       timeElapsedInSeconds: section.duration,
  //       questions: section.question_preview_dto_list.map((question) => ({
  //         questionId: question.question_id,
  //         questionDurationLeftInSeconds: question.question_duration,
  //         timeTakenInSeconds: 0,
  //         responseData: {
  //           type: question.question_type,
  //           optionIds: [],
  //         },
  //       })),
  //     })),
  //   };
  // };
  
  // // API function to send data
  // const sendFormattedData = async ({
  //   jsonContent,
  //   attemptId,
  //   assessmentId,
  // }: {
  //   jsonContent: AssessmentPreviewData;
  //   attemptId: string;
  //   assessmentId: string;
  // }) => {
  //   const formattedData = formatData({ jsonContent, attemptId, assessmentId });
  //   console.log('Sending formatted data:', JSON.stringify(formattedData, null, 2));
  //   const response = await authenticatedAxiosInstance.post(ASSESSMENT_SAVE, formattedData);

  
  //   // Save the announcements in local storage
  //   await Preferences.set({ key: 'announcements', value: JSON.stringify(response.data) });
  
  //   return response.data;
  // };
  
  // // Custom hook for mutation
  // const SendAssessmentData = () => {
  //   return useMutation({
  //     mutationFn: sendFormattedData,
  //     onSuccess: (data) => {
  //       console.log('Data sent successfully:', data);
  //     },
  //     onError: (error) => {
  //       console.error('Error sending data:', error);
  //     },
  //   });
  // };
  
  // useEffect(() => {
  //   console.log('here')
  //   const interval = setInterval(() => {
  //     console.log('sending data')
  //     SendAssessmentData();
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);









  // const formatData = ({
  //   jsonContent,
  //   attemptId,
  //   assessmentId,
  // }: {
  //   jsonContent: AssessmentPreviewData;
  //   attemptId: string;
  //   assessmentId: string;
  // }): AssessmentData => {
  //   return {
  //     attemptId,
  //     clientLastSync: new Date().toISOString(),
  //     assessment: {
  //       assessmentId,
  //       entireTestDurationLeftInSeconds: jsonContent.duration,
  //       timeElapsedInSeconds: 0,
  //       status: "LIVE",
  //       tabSwitchCount: 0,
  //     },
  //     sections: jsonContent.section_dtos.map((section) => ({
  //       sectionId: section.id,
  //       timeElapsedInSeconds: section.duration,
  //       questions: section.question_preview_dto_list.map((question) => ({
  //         questionId: question.question_id,
  //         questionDurationLeftInSeconds: question.question_duration,
  //         timeTakenInSeconds: 0,
  //         responseData: {
  //           type: question.question_type,
  //           optionIds: [],
  //         },
  //       })),
  //     })),
  //   };
  // };
  
  // // API function to send data
  // const sendFormattedData = async ({
  //   jsonContent,
  //   attemptId,
  //   assessmentId,
  // }: {
  //   jsonContent: AssessmentPreviewData;
  //   attemptId: string;
  //   assessmentId: string;
  // }) => {
  //   try {
  //     const formattedData = formatData({ jsonContent, attemptId, assessmentId });
  //     console.log("Sending formatted data:", JSON.stringify(formattedData, null, 2));
  
  //     const response = await authenticatedAxiosInstance.post(ASSESSMENT_SAVE, formattedData);
  
  //     // Save the announcements in local storage
  //     await Preferences.set({ key: "announcements", value: JSON.stringify(response.data) });
  
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error sending data:", error);
  //     throw error;
  //   }
  // };
  
  // // UseEffect to call sendFormattedData every 10 seconds
  // useEffect(() => {
  //   const sendData = async () => {
  //     const jsonContent = useAssessmentStore.getState();
  //     const attemptId = "12345";
  //     const assessmentId = "67890";
  //     console.log("Sending data...");
  //     try {
  //       await sendFormattedData({ jsonContent, attemptId, assessmentId });
  //     } catch (error) {
  //       console.error("Error in periodic data sending:", error);
  //     }
  //   };
  
  //   sendData(); // Call once immediately when component mounts
  
  //   const interval = setInterval(() => {
  //     sendData();
  //   }, 10000); // 10-second interval
  
  //   return () => clearInterval(interval);
  // }, );
  


// Function to format data from assessment-store
const formatDataFromStore = (state: any) => {
  return {
    attemptId: state.assessment.attemptId || "", // Ensure attemptId is present
    clientLastSync: new Date().toISOString(),
    assessment: {
      assessmentId: state.assessment.assessmentId || "",
      entireTestDurationLeftInSeconds: state.entireTestTimer || 0,
      timeElapsedInSeconds: 0, // You can calculate if needed
      status: "LIVE",
      tabSwitchCount: state.tabSwitchCount || 0,
    },
    sections: state.assessment.sections?.map((section: any) => ({
      sectionId: section.id,
      timeElapsedInSeconds: state.sectionTimers?.[section.id] || 0,
      questions: section.questions?.map((question: any) => ({
        questionId: question.id,
        questionDurationLeftInSeconds: state.questionTimers?.[question.id] || 0,
        timeTakenInSeconds: 0, // You can update this dynamically
        responseData: {
          type: question.type,
          optionIds: state.answers?.[question.id] || [],
        },
      })),
    })) || [],
  };
};

// API function to send data
const sendFormattedData = async () => {
  try {
    const state = await Storage.get({
      key: "ASSESSMENT_STATE",
    })
    const formattedData = formatDataFromStore(state); // Format data

    console.log("Sending formatted data:", JSON.stringify(formattedData, null, 2));

    const response = await authenticatedAxiosInstance.post(ASSESSMENT_SAVE, formattedData);

    // Save announcements in local storage
    await Preferences.set({ key: "announcements", value: JSON.stringify(response.data) });

    return response.data;
  } catch (error) {
    console.error("Error sending data:", error);
    throw error;
  }
};

// UseEffect to call sendFormattedData every 10 seconds
useEffect(() => {
  const sendData = async () => {
    console.log("Sending data...");
    try {
      await sendFormattedData();
    } catch (error) {
      console.error("Error in periodic data sending:", error);
    }
  };

  sendData(); // Send once immediately on mount

  const interval = setInterval(() => {
    sendData();
  }, 10000); // 10-second interval

  return () => clearInterval(interval);
}, []);


  
  useEffect(() => {
    const initializeAssessment = async () => {
      await loadState();
      // const currentState = useAssessmentStore.getState()

      // if (!currentState.assessment) {
      //   setAssessment(dummyAssessment)
      // }
    };

    initializeAssessment();

    const saveInterval = setInterval(() => {
      
      saveState();
    }, 1000);

    return () => {
      clearInterval(saveInterval);
      saveState();
    };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <NetworkStatus />
    </div>
  );
}
