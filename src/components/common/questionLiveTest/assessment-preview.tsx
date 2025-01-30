"use client";

import React, { useState, useEffect } from "react";
import { useAssessmentStore } from "@/stores/assessment-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { MyButton } from "@/components/design-system/button";
import { dummyAssessment } from "./page";

export function AssessmentPreview() {
  const { assessment } = useAssessmentStore();
  const { setAssessment } = useAssessmentStore();
  const [activeSection, setActiveSection] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => {
    const [minutes, seconds] =
      dummyAssessment.assessmentPreview.Duration.split(":").map(Number);
    return minutes * 60 + seconds;
  });
  const navigate = useNavigate();

  useEffect(() => {
    setAssessment(dummyAssessment);
  }, [setAssessment]);

  useEffect(() => {
    if (timeLeft <= 0) {
      navigate({
        to: "/assessment/examination/$assessmentId/LearnerLiveTest/",
      });
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  if (!assessment) return null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col w-full bg-gray-50">
      {/* Navbar with Timer */}
      <div className="sticky  top-0 z-20 bg-white border-b">
        <div className="flex flex-col bg-primary-50 sm:flex-row items-center justify-between p-4">
          <h1 className="text-base font-semibold">{assessment.title}</h1>
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
              {assessment.sections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSection(index)}
                  className={`px-4 py-2 text-sm rounded-t-lg ${
                    activeSection === index
                      ? "bg-orange-50 text-orange-500 border border-b-0 border-orange-500"
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
        {assessment.sections[activeSection].questions.map((question, idx) => (
          <div
            key={question.questionId}
            className="mb-8 bg-white rounded-lg p-4 sm:p-6 shadow-sm"
          >
            <div className="flex flex-row  gap-2 mb-4">
              <span className="text-sm text-gray-500">Question {idx + 1}</span>
              <span className="text-sm text-gray-500 items-end">
                {question.questionMark} Marks
              </span>
            </div>

            <p className="text-base mb-4">{question.questionName}</p>

            {question.questionImage && (
              <div className="mb-4">
                <img
                  src={question.questionImage}
                  alt="Question illustration"
                  className="max-w-full rounded-lg"
                />
              </div>
            )}

            <div className="space-y-3">
              {question.options.map((option) => (
                <div
                  key={option.optionId}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  {option.optionName}
                </div>
              ))}
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* Footer */}
      <div className="sticky bg-primary-50 bottom-0 p-4 bg-white border-t">
        <div className="flex  justify-center">
          
          <MyButton
            onClick={() =>
              navigate({
                to: "/assessment/examination/$assessmentId/LearnerLiveTest/",
              })
            }
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
