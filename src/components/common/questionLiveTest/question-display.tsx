import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Flag, X, AlertCircle } from 'lucide-react';
import { useAssessmentStore } from '@/stores/assessment-store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

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
  } = useAssessmentStore();

  const isTimeUp = sectionTimers[currentSection]?.timeLeft === 0;

  useEffect(() => {
    if (!currentQuestion || !assessment?.testDuration.questionWiseDuration)
      return;

    const timer = setInterval(() => {
      const timeLeft = questionTimers[currentQuestion.questionId];
      if (timeLeft > 0) {
        updateQuestionTimer(currentQuestion.questionId, timeLeft - 1000);
      } else {
        moveToNextQuestion();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    currentQuestion,
    assessment,
    questionTimers,
    updateQuestionTimer,
    moveToNextQuestion,
  ]);

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

  const currentAnswer = answers[currentQuestion.questionId] || [];
  const isMarkedForReview =
    questionStates[currentQuestion.questionId]?.isMarkedForReview;
  const isDisabled =
    questionStates[currentQuestion.questionId]?.isDisabled ||
    questionTimers[currentQuestion.questionId] === 0;

  const handleAnswerChange = (optionId: string) => {
    if (isDisabled) return;

    const newAnswer =
      currentQuestion.questionType === 'MCQ (Multiple Correct)'
        ? currentAnswer.includes(optionId)
          ? currentAnswer.filter((id) => id !== optionId)
          : [...currentAnswer, optionId]
        : [optionId];

    setAnswer(currentQuestion.questionId, newAnswer);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 mx-auto">
      <div className="flex flex-col items-start justify-between">
        <div className="w-full sm:w-3/4">
          <div className="flex items-baseline gap-5 sm:mb-2">
            <div className="flex items-baseline gap-8">
              <span className="text-lg text-gray-700">
                Question {currentQuestion.questionId.slice(1)}
              </span>
              <span className="text-base text-gray-600">
                {currentQuestion.questionMark} Marks
              </span>
            </div>

            <div className="flex items-center gap-2">
              {assessment?.testDuration.questionWiseDuration && (
                <span className="text-base text-orange-500">
                  {formatTime(questionTimers[currentQuestion.questionId])}
                </span>
              )}
            </div>
          </div>

          <p className="text-lg text-gray-800">
            {currentQuestion.questionName}
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-4 sm:mt-0 w-full sm:w-auto justify-between">
          <Button
            variant="outline"
            size="sm"
            className={isMarkedForReview ? 'text-orange-500' : ''}
            onClick={() => markForReview(currentQuestion.questionId)}
            disabled={isDisabled}
          >
            <Flag className="mr-2 h-4 w-4" />
            Review Later
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearResponse(currentQuestion.questionId)}
            disabled={currentAnswer.length === 0 || isDisabled}
          >
            <X className="mr-2 h-4 w-4" />
            Clear Response
          </Button>
        </div>
      </div>

      {currentQuestion.imageDetails &&
        currentQuestion.imageDetails.length > 0 && (
          <div className="relative h-64 w-full mt-4">
            {/* <Image
            src="/placeholder.svg"
            alt="Question diagram"
            fill
            className="object-contain"
          /> */}
          </div>
        )}

      <div className="space-y-4">
        {currentQuestion.options.map((option) => (
          <div
            key={option.optionId}
            className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent w-full"
          >
            <Checkbox
              id={option.optionId}
              checked={currentAnswer.includes(option.optionId)}
              onCheckedChange={() => handleAnswerChange(option.optionId)}
              disabled={isDisabled}
            />
            <Label
              htmlFor={option.optionId}
              className="flex-grow cursor-pointer"
            >
              {option.optionName}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
