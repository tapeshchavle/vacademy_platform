"use client";

import * as React from "react";
import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAssessmentStore } from "@/stores/assessment-store";
import { ViewToggle } from "./view-toggle";
import { QuestionListView } from "./question-list-view";

interface QuestionNavigatorProps {
  onClose: () => void;
}

export function QuestionNavigator({ onClose }: QuestionNavigatorProps) {
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const {
    assessment,
    currentSection,
    currentQuestion,
    questionStates,
    setCurrentQuestion,
    setQuestionState,
  } = useAssessmentStore();

  if (!assessment) return null;

  const currentSectionQuestions = assessment.sections[currentSection].questions;

  const handleQuestionClick = (question: Question) => {
    setCurrentQuestion(question);
    setQuestionState(question.questionId, { isVisited: true });
    onClose();
  };

  const getQuestionButtonClass = (state: QuestionState) => {
    if (state.isAnswered)
      return "bg-green-100 hover:bg-green-200 text-green-700";
    if (!state.isVisited) return "bg-white hover:bg-gray-100 text-gray-700";
    return "bg-pink-100 hover:bg-pink-200 text-pink-700";
  };

  const getCounts = () => {
    const counts = {
      "Answered": 0,
      "Not Answered": 0,
      "Not Visited": 0,
      "Marked for review": 0,
      "Answered & Marked for review": 0,
    };

    currentSectionQuestions.forEach((question) => {
      const state = questionStates[question.questionId];
      if (state) {
        if (state.isAnswered && state.isMarkedForReview) {
          counts["Answered & Marked for review"]++;
          counts["Answered"]++;
        } else if (state.isAnswered) {
          counts["Answered"]++;
        } else if (state.isMarkedForReview) {
          counts["Marked for review"]++;
          counts["Not Answered"]++;
        } else if (state.isVisited) {
          counts["Not Answered"]++;
        } else {
          counts["Not Visited"]++;
        }
      } else {
        counts["Not Visited"]++;
      }
    });

    return counts;
  };
  

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b ">
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      
        <div className="p-4">
          {/* answred and not answerd section */}
          <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
            {Object.entries(getCounts()).map(([key, count]) => (
              <div key={key} className="flex items-center gap-2">
                <div className="relative">
                  <div
                    className={cn(
                      "w-6 h-6 rounded border flex items-center justify-center",
                      key === "Answered" && "bg-emerald-100 border-emerald-200",
                      key === "Not Answered" && "bg-pink-100 border-pink-200",
                      key === "Not Visited" && "bg-white border-gray-200",
                      key === "Marked for review" &&
                        "bg-pink-100 border-pink-200",
                      key === "Answered & Marked for review" &&
                        "bg-emerald-100 border-emerald-200"
                    )}
                  >
                    {count}
                  </div>
                  {(key === "Marked for review" ||
                    key === "Answered & Marked for review") && (
                    <Flag className="absolute -top-1 -right-1 w-3 h-3 text-orange-500" />
                  )}
                </div>
                <span>{key}</span>
              </div>
            ))}
          </div>
        </div>
        <ScrollArea className="flex-1">
        {view === "grid" ? (
          <div className="grid grid-cols-5 gap-2 p-1 px-4">
            {currentSectionQuestions.map((question, index) => {
              const state = questionStates[question.questionId];
              const isActive =
                currentQuestion?.questionId === question.questionId;
              return (
                <div key={question.questionId} className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full aspect-square text-sm font-medium p-0",
                      state && getQuestionButtonClass(state),
                      isActive && "ring-2 ring-primary"
                    )}
                    onClick={() => handleQuestionClick(question)}
                  >
                    {index + 1}
                  </Button>
                  {state?.isMarkedForReview && (
                    <Flag className="absolute -top-1 -right-1 w-2 h-2 text-orange-500" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <QuestionListView onQuestionClick={handleQuestionClick} />
        )}
      </ScrollArea>
    </div>
  );
}
