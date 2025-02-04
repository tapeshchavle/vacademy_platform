"use client";

import { useEffect, useState } from "react";
import { QuestionDisplay } from "./question-display";
import { SectionTabs } from "./section-tabs";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { Sidebar } from "./sidebar";
import { useAssessmentStore } from "@/stores/assessment-store";
import NetworkStatus from "./network-status";

import { Preferences } from "@capacitor/preferences";
// import { AssessmentPreviewData } from "@/types/assessment";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { ASSESSMENT_SAVE } from "@/constants/urls";
// import { Storage } from "@capacitor/storage";

// interface AssessmentData {
//   attemptId: string;
//   clientLastSync: string;
//   assessment: {
//     assessmentId: string;
//     entireTestDurationLeftInSeconds: number;
//     timeElapsedInSeconds: number;
//     status: string;
//     tabSwitchCount: number;
//   };
//   sections: Array<{
//     sectionId: string;
//     timeElapsedInSeconds: number;
//     questions: Array<{
//       questionId: string;
//       questionDurationLeftInSeconds: number;
//       timeTakenInSeconds: number;
//       responseData: {
//         type: string;
//         optionIds: string[];
//       };
//     }>;
//   }>;
// }

export default function Page() {
  const { loadState, saveState } = useAssessmentStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const state = useAssessmentStore();
  console.log(state);
  // Function to format data from assessment-store
  const formatDataFromStore = (assessment_id: string) => {
    console.log("here   ");
    const state = useAssessmentStore.getState();
    console.log(state);
    return {
      attemptId: state.assessment?.attempt_id, // Ensure attemptId is present
      clientLastSync: new Date().toISOString(),
      assessment: {
        assessmentId: assessment_id,
        entireTestDurationLeftInSeconds: state.entireTestTimer,
        timeElapsedInSeconds: 0, // You can calculate if needed
        status: "LIVE",
        tabSwitchCount: state.tabSwitchCount || 0,
      },
      sections: state.assessment?.section_dtos?.map((section, idx) => ({
        sectionId: section.id,
        timeElapsedInSeconds: state.sectionTimers?.[idx] || 0,
        questions: section.question_preview_dto_list?.map((question, qidx) => ({
          questionId: question.question_id,
          questionDurationLeftInSeconds: state.questionTimers?.[qidx] || 0,
          timeTakenInSeconds: 0, // You can update this dynamically
          responseData: {
            type: question.question_type,
            optionIds: state.answers?.[question.question_id] || [],
          },
        })),
      })),
    };
  };

  // API function to send data
  const sendFormattedData = async () => {
    try {
      const state = useAssessmentStore.getState();
      const InstructionID_and_AboutID = await Preferences.get({
        key: "InstructionID_and_AboutID",
      });

      const assessment_id_json = InstructionID_and_AboutID.value
        ? JSON.parse(InstructionID_and_AboutID.value)
        : null;
      const formattedData = formatDataFromStore(
        assessment_id_json?.assessment_id
      );
      console.log("Formatted Data:", formattedData);
      const response = await authenticatedAxiosInstance.post(
        `${ASSESSMENT_SAVE}`,
        { json_content: JSON.stringify(formattedData) },
        {
          params: {
            attemptId: state.assessment?.attempt_id,
            assessmentId: assessment_id_json?.assessment_id,
          },
        }
      );
      console.log(response.data);

      // Save announcements in local storage
      await Preferences.set({
        key: "announcements",
        value: JSON.stringify(response.data),
      });

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
    const sent = async () => {
      await sendData();
    };

    sent(); // Send once immediately on mount

    const interval = setInterval(() => {
      console.log("here");
      sent();
    }, 10000); // 10-second interval

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('main component')
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
