"use client";

import { useState, useEffect } from "react";
import { useAssessmentStore } from "@/stores/assessment-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MyButton } from "@/components/design-system/button";
import { useRouter } from "@tanstack/react-router";
import { startAssessment } from "@/routes/assessment/examination/-utils.ts/useFetchAssessment";
import { Storage } from "@capacitor/storage";
import { AssessmentPreviewData } from "@/types/assessment";
import { parseHtmlToString } from "@/lib/utils";

export function AssessmentPreview() {
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  const newPath = currentPath.replace(/\/[^/]+$/, "/LearnerLiveTest");

  // Navigate to the new path

  const { assessment } = useAssessmentStore();
  const { setAssessment } = useAssessmentStore();
  const [activeSection, setActiveSection] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => {
    return (
      (assessment?.preview_total_time ? assessment.preview_total_time : 0) * 60
    );
  });

  useEffect(() => {
    const setAssessmentData = async () => {
      try {
        const { value } = await Storage.get({ key: "Assessment_questions" });

        if (!value) {
          console.warn("No assessment data found in storage.");
          return;
        }

        const parsedData: AssessmentPreviewData = JSON.parse(value);
        setAssessment(parsedData);
      } catch (error) {
        console.error("Error parsing assessment data:", error);
      }
    };

    setAssessmentData();
  }, []);
  // useEffect(() => {
  //   if (timeLeft <= 0) {
  //     router.navigate({ to: newPath });
  //     return;
  //   }

  //   const timer = setInterval(() => {
  //     setTimeLeft((prev) => Math.max(0, prev - 1));
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, [timeLeft, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleStartAssessment();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  if (!assessment) return null;

  const calculateMarkingScheme = (marking_json: string) => {
    try {
      const marking_scheme = JSON.parse(marking_json);
      return marking_scheme; // Ensure the JSON contains a number or string
    } catch (error) {
      console.error("Error parsing marking_json:", error);
      return 0; // Default value in case of an error
    }
  };

  // const QuestionContent = ({ content }: { content: string }) => {
  //   return <div dangerouslySetInnerHTML={{ __html: content }} />;
  // };
   

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };
  const handleStartAssessment = async () => {
     await startAssessment();
    // console.log(data);
    router.navigate({ to: newPath });
  };
  return (
    <div className="flex flex-col w-full bg-gray-50">
      {/* Navbar with Timer */}
      <div className="sticky  top-0 z-20 bg-white border-b">
        <div className="flex flex-col bg-primary-50 sm:flex-row items-center justify-between p-4">
          {/* <h1 className="text-base font-semibold">{assessment.title}</h1> */}
          <div className="flex items-center gap-2  mt-2 sm:mt-0 lg:mr-10 md:mr-10">
            {formatTime(timeLeft)
              .split(":")
              .map((time, index) => (
                <span
                  key={index}
                  className="border border-gray-400 px-2 py-1 rounded"
                >
                  {time}
                </span>
              ))}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <div className="flex overflow-x-auto items-center justify-between p-4 pb-0">
            <div className="flex flex-nowrap items-center space-x-4">
              {assessment.section_dtos?.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(index)}
                  className={`px-4 py-2 text-sm rounded-t-lg ${
                    activeSection === index
                      ? "bg-orange-50 text-primary-500 border border-b-0 border-orange-500"
                      : "text-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-max">
                    <span>Section {index + 1}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <ScrollArea className="flex-1  p-4 sm:p-6">
        {assessment.section_dtos[activeSection].question_preview_dto_list.map(
          (question, idx) => (
            <div
              key={question.question_id}
              className="mb-8 bg-white rounded-lg p-4 sm:p-6 shadow-sm"
            >
              <div className="flex flex-row  gap-2 mb-4">
                <span className="text-sm text-gray-500">
                  Question {idx + 1}
                </span>
                <span className="text-sm text-gray-500 items-end">
                  {calculateMarkingScheme(question.marking_json).data.totalMark}{" "}
                  Marks
                </span>
              </div>

              <p className="text-base mb-4">{question.question.content}</p>

              {/* {question.questionImage && (
              <div className="mb-4">
                <img
                  src={question.questionImage}
                  alt="Question illustration"
                  className="max-w-full rounded-lg"
                />
              </div>
            )} */}

              <div className="space-y-3">
                {question.options.map((option) => (
                  <div
                    key={option.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    {parseHtmlToString(option.text.content)}
                    {/* <QuestionContent content={option.text.content} /> */}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="sticky bg-primary-50 bottom-0 p-4 bg-white border-t">
        <div className="flex  justify-center">
          <MyButton
            onClick={() => handleStartAssessment()}
            buttonType="primary"
            scale="large"
            layoutVariant="default"
          >
            Start Test
          </MyButton>
        </div>
      </div>
    </div>
  );
}
