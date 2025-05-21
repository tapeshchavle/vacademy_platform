"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { SUBMIT_SLIDE_ANSWERS } from "@/constants/urls";
import { v4 as uuidv4 } from "uuid";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { Checkbox } from "@/components/ui/checkbox";
import { getUserId } from "@/constants/getUserId";

interface VideoQuestionProps {
  question: {
    id: string;
    text_data: {
      content: string;
    };
    parent_rich_text?: {
      content: string;
    };
    options: Array<{
      id: string;
      text: {
        content: string;
      };
    }>;
    can_skip?: boolean;
    question_type?: string;
    auto_evaluation_json?: string;
  };
  onSubmit: (optionId: string | string[]) => Promise<any>;
  onClose: () => void;
}

const VideoQuestionOverlay = ({
  question,
  onSubmit,
  onClose,
}: VideoQuestionProps) => {
  const { activeItem } = useContentStore();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<{
    isCorrect: boolean;
    explanation?: string;
  } | null>(null);

  // Determine if this is a multiple choice question
  const isMultipleChoice = question.question_type === "MCQM";

  const handleOptionToggle = (optionId: string) => {
    if (response) return; // Don't allow changes after submission

    setSelectedOptions((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  // Submit question answer mutation
  const submitQuestionMutation = useMutation({
    mutationFn: async (optionId: string | string[]) => {
      if (!activeItem) throw new Error("No active item");

      // Extract slideId and chapterId from URL
      const urlParams = new URLSearchParams(window.location.search);
      const slideId = urlParams.get("slideId") || "";
      const userId = await getUserId();

      if (!slideId || !userId) {
        throw new Error("Missing slideId or userId in URL");
      }

      const payload = {
        id: uuidv4(),
        source_id: activeItem.source_id || "",
        source_type: activeItem.source_type || "",
        user_id: userId,
        slide_id: slideId,
        start_time_in_millis: Date.now() - 60000, // Assuming started 1 minute ago
        end_time_in_millis: Date.now(),
        percentage_watched: 0,
        videos: [],
        documents: [],
        question_slides: [],
        assignment_slides: [],
        video_slides_questions: [
          {
            id: question.id,
            response_json: JSON.stringify({
              selectedOption: Array.isArray(optionId) ? optionId : [optionId],
            }),
            response_status: "SUBMITTED",
          },
        ],
        new_activity: true,
        concentration_score: {
          id: uuidv4(),
          concentration_score: 100,
          tab_switch_count: 0,
          pause_count: 0,
          answer_times_in_seconds: [5],
        },
      };

      return authenticatedAxiosInstance.post(SUBMIT_SLIDE_ANSWERS, payload, {
        params: {
          slideId,
          userId,
        },
      });
    },
    onSuccess: () => {
      console.log("Question answer submitted successfully");
    },
    onError: (error: any) => {
      console.error("Error submitting question answer:", error);
    },
  });

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Check if we have a valid selection
    if (!isMultipleChoice && !selectedOption) return;
    if (isMultipleChoice && selectedOptions.length === 0) return;

    setIsSubmitting(true);
    try {
      // Get the selected option(s)
      const selection = isMultipleChoice ? selectedOptions : selectedOption;

      // Submit to local API
      const result = await onSubmit(selection!);

      // Submit to server API
      submitQuestionMutation.mutate(selection!);

      setResponse({
        isCorrect: result.isCorrect,
        explanation: result.explanation,
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      setResponse({
        isCorrect: false,
        explanation:
          "There was an error processing your answer. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold text-orange-500">
            Video Question
          </h3>
          {question.can_skip && !response && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Skip Question
            </button>
          )}
          {!question.can_skip && !response && (
            <div className="text-sm text-gray-500">
              Answer required to continue
            </div>
          )}
          {response && (
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="p-5 overflow-y-auto">
          <div className="mb-6">
            <p className="text-lg text-neutral-800 font-medium mb-4">
              {question.text_data.content}
            </p>

            {question.parent_rich_text?.content && (
              <div className="mt-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <img
                  src="/placeholder.svg?height=250&width=500"
                  alt="Question diagram"
                  className="mx-auto rounded-lg mb-3"
                />
                <p className="text-sm text-neutral-600">
                  {question.parent_rich_text.content}
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <p className="text-md font-medium text-neutral-700 mb-3">
              {isMultipleChoice
                ? "Select all that apply:"
                : "Select your answer:"}
            </p>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div
                  key={option.id}
                  onClick={() => {
                    if (!response) {
                      if (isMultipleChoice) {
                        handleOptionToggle(option.id);
                      } else {
                        setSelectedOption(option.id);
                      }
                    }
                  }}
                  className={`flex items-center p-3 border rounded-md transition-all ${
                    isMultipleChoice
                      ? selectedOptions.includes(option.id)
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                      : selectedOption === option.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                  } ${response ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex-1">
                    <span className="text-neutral-700">
                      ({String.fromCharCode(65 + index)}) {option.text.content}
                    </span>
                  </div>
                  <div className="ml-2">
                    {isMultipleChoice ? (
                      <Checkbox
                        checked={selectedOptions.includes(option.id)}
                        onCheckedChange={() => {
                          if (!response) handleOptionToggle(option.id);
                        }}
                        disabled={!!response}
                      />
                    ) : (
                      selectedOption === option.id && (
                        <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {response && (
            <div
              className={`p-4 rounded-md mb-6 ${
                response.isCorrect
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p
                className={`text-md font-medium ${response.isCorrect ? "text-green-700" : "text-red-700"}`}
              >
                {response.isCorrect ? "Correct!" : "Incorrect"}
              </p>
              {response.explanation && (
                <p className="mt-2 text-neutral-600">{response.explanation}</p>
              )}
            </div>
          )}

          <div className="flex justify-center">
            {response ? (
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-colors"
              >
                Continue Video
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={
                  (!isMultipleChoice && !selectedOption) ||
                  (isMultipleChoice && selectedOptions.length === 0) ||
                  isSubmitting
                }
                className={`px-6 py-2.5 rounded-md font-medium transition-colors ${
                  (!isMultipleChoice && !selectedOption) ||
                  (isMultipleChoice && selectedOptions.length === 0) ||
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoQuestionOverlay;
