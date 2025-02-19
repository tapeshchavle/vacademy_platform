import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useAssessmentStore } from "@/stores/assessment-store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect } from "react";
import {
  distribution_duration_types,
  QUESTION_TYPES,
} from "@/types/assessment";
import { processHtmlString } from "@/lib/utils";

export function QuestionDisplay() {
  const {
    currentQuestion,
    currentSection,
    answers,
    setAnswer,
    markForReview,
    clearResponse,
    questionStates,
    sectionTimers,
    questionTimers,
    assessment,
    updateQuestionTimer,
    moveToNextQuestion,
    questionTimeSpent, initializeQuestionTime, incrementQuestionTime,
  } = useAssessmentStore();

  const isTimeUp = sectionTimers[currentSection]?.timeLeft === 0;

  useEffect(() => {
    initializeQuestionTime(currentQuestion?.question_id); // Ensure the timer exists

    const interval = setInterval(() => {
      incrementQuestionTime(currentQuestion?.question_id);
    }, 1000); // Increment every second

    return () => clearInterval(interval); // Cleanup when component unmounts
  }, [currentQuestion, initializeQuestionTime, incrementQuestionTime]);

  useEffect(() => {
    if (
      !currentQuestion ||
      assessment?.distribution_duration !== distribution_duration_types.QUESTION
    )
      return;

    const timer = setInterval(() => {
      const timeLeft = questionTimers[currentQuestion.question_id] || 0;
      if (timeLeft > 0) {
        updateQuestionTimer(currentQuestion.question_id, timeLeft - 1000);
      } else {
        moveToNextQuestion();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, assessment?.distribution_duration, questionTimers]);

  if (!currentQuestion) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Select a question to begin
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isTimeUp) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Time is up for this section. Please move to the next available
          section.
        </AlertDescription>
      </Alert>
    );
  }

  const currentAnswer = answers[currentQuestion.question_id] || [];
  const isMarkedForReview =
    questionStates[currentQuestion.question_id]?.isMarkedForReview;
  const isDisabled =
    questionStates[currentQuestion.question_id]?.isDisabled ||
    questionTimers[currentQuestion.question_id] === 0;

  const handleAnswerChange = (optionId: string) => {
    if (isDisabled) return;

    const newAnswer =
      currentQuestion.question_type === QUESTION_TYPES.MCQM
        ? currentAnswer.includes(optionId)
          ? currentAnswer.filter((id) => id !== optionId)
          : [...currentAnswer, optionId]
        : [optionId];

    setAnswer(currentQuestion.question_id, newAnswer);
  };

  const calculateMarkingScheme = (marking_json: string) => {
    try {
      const marking_scheme = JSON.parse(marking_json);
      return marking_scheme;
    } catch (error) {
      console.error("Error parsing marking_json:", error);
      return 0;
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  return (
    <div className="space-y-6 mx-auto">
      <div className="flex flex-col items-start justify-between w-full">
        <div className="w-full">
          <div className="flex items-baseline justify-between gap-5 mb-2">
            <div className="flex items-baseline gap-8">
              <span className="text-lg text-gray-700">
                Question {currentQuestion.question_order}
              </span>
              <div className="flex items-center gap-2">
                {assessment?.distribution_duration ===
                  distribution_duration_types.QUESTION && (
                  <span className="text-base text-primary-500">
                    {formatTime(questionTimers[currentQuestion.question_id])}
                  </span>
                )}
              </div>
            </div>

            <div className="">
              <span className="text-base text-gray-600">
                {
                  calculateMarkingScheme(currentQuestion.marking_json).data
                    .totalMark
                }{" "}
                Marks | {" "}
              </span>
              <span>{currentQuestion.question_type}</span>
            </div>
          </div>

          <p className="text-lg text-gray-800">
            {/* {parseHtmlToString(currentQuestion.question.content)} */}
            {processHtmlString(currentQuestion.question.content).map(
              (item, index) =>
                item.type === "text" ? (
                  <span key={index}>{item.content}</span>
                ) : (
                  <img
                    key={index}
                    src={item.content}
                    alt={`Question image ${index + 1}`}
                    className=""
                  />
                )
            )}
          </p>
        </div>
        <div className="flex gap-2 mt-4 w-full justify-between">
          <Button
            variant="outline"
            size="sm"
            className={
              isMarkedForReview
                ? "text-primary-500 hover:text-primary-500 hover:bg-transparent"
                : ""
            }
            onClick={() => markForReview(currentQuestion.question_id)}
          >
            Review Later
          </Button>
          <p>Time Spent on Question: {questionTimeSpent[currentQuestion.question_id] || 0} seconds</p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => clearResponse(currentQuestion.question_id)}
            disabled={currentAnswer.length === 0 || isDisabled}
          >
            Clear Response
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {currentQuestion?.options?.map((option, index) => (
          <div
            key={option.id}
            className={`flex flex-row-reverse items-center justify-between rounded-lg border p-4 w-full ${
              currentAnswer.includes(option.id)
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200"
            }`}
          >
            <div className="relative flex items-center">
              <div
                className={`w-6 h-6 border rounded-md flex items-center justify-center 
                  ${
                    currentAnswer.includes(option.id)
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300"
                  }`}
                onClick={() => handleAnswerChange(option.id)}
              >
                {currentAnswer.includes(option.id) && (
                  <span className="text-white font-bold">✔</span>
                )}
              </div>
            </div>

            <label
              className={`flex-grow cursor-pointer text-sm 
                ${currentAnswer.includes(option.id) ? "font-semibold" : "text-gray-700"}`}
              onClick={() => handleAnswerChange(option.id)}
            >
              {`(${String.fromCharCode(97 + index)})  `}
              {processHtmlString(option.text.content).map((item, index) =>
                item.type === "text" ? (
                  <span key={index}>{item.content}</span>
                ) : (
                  <img
                    key={index}
                    src={item.content}
                    alt={`Question image ${index + 1}`}
                    className=""
                  />
                )
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
