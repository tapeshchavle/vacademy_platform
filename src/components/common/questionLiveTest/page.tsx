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
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { ASSESSMENT_SAVE } from "@/constants/urls";
import { toast } from "sonner";

export default function Page() {
  const { loadState, saveState } = useAssessmentStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to format data from assessment-store
  const formatDataFromStore = (assessment_id: string) => {
    const state = useAssessmentStore.getState();
    console.log(state.questionStates[1]);
    return {
      attemptId: state.assessment?.attempt_id,
      clientLastSync: new Date().toISOString(),
      assessment: {
        assessmentId: assessment_id,
        entireTestDurationLeftInSeconds: state.entireTestTimer,
        timeElapsedInSeconds: state.assessment?.duration
          ? state.assessment.duration * 60 - state.entireTestTimer
          : 0,
        status: "LIVE",
        tabSwitchCount: state.tabSwitchCount || 0,
      },
      sections: state.assessment?.section_dtos?.map((section, idx) => ({
        sectionId: section.id,
        sectionDurationLeftInSeconds: state.sectionTimers?.[idx]?.timeLeft || 0,
        timeElapsedInSeconds: section.duration
          ? section.duration * 60 - (state.sectionTimers?.[idx]?.timeLeft || 0)
          : 0,
        questions: section.question_preview_dto_list?.map((question) => ({
          questionId: question.question_id,
          questionDurationLeftInSeconds:
            state.questionTimers?.[question.question_id] || 0,
          timeTakenInSeconds:
          state.questionTimeSpent[question.question_id] || 0,
          isMarkedForReview:
            state.questionStates[question.question_id].isMarkedForReview ||
            false,
          isVisited:
            state.questionStates[question.question_id].isVisited || false,
          responseData: {
            type: question.question_type,
            optionIds: state.answers?.[question.question_id] || [],
          },
        })),
      })),
    };
  };

  // update API function to send data
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

  const { isSubmitted } = useAssessmentStore();

  useEffect(() => {
    const sendData = async () => {
      console.log("Sending data...");
      try {
        await sendFormattedData();
      } catch (error) {
        console.error("Error in periodic data sending:", error);
        // Show toast notification for failure
        toast.error("Your responses are not being recorded");
      }
    };

    const sent = async () => {
      // Check if isSubmitted is false and time is not up before sending data
      const state = useAssessmentStore.getState();
      const InstructionID_and_AboutID = await Preferences.get({
        key: "InstructionID_and_AboutID",
      });
      const assessment_id_json = InstructionID_and_AboutID.value
        ? JSON.parse(InstructionID_and_AboutID.value)
        : null;

      if (
        !isSubmitted &&
        state.entireTestTimer > 0 &&
        assessment_id_json?.play_mode === "EXAM"
      ) {
        await sendData();
      }
    };

    sent();

    const interval = setInterval(() => {
      sent();
    }, 60000);

    // Cleanup function to clear the interval
    return () => clearInterval(interval);
  }, [isSubmitted]);

  useEffect(() => {
    const initializeAssessment = async () => {
      await loadState();
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
