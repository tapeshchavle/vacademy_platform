import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUploader } from "./file-uploader";
import { useMutation } from "@tanstack/react-query";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { SUBMIT_SLIDE_ANSWERS } from "@/constants/urls";
import { v4 as uuidv4 } from "uuid";
import { useContentStore } from "@/stores/study-library/chapter-sidebar-store";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getUserId } from "@/constants/getUserId";

interface AssignmentSlideProps {
  assignmentData: any;
  onUpload: (
    file: File
  ) => Promise<{ success: boolean; fileId?: string; error?: string }>;
  isUploading: boolean;
}

const AssignmentSlide = ({
  assignmentData,
  onUpload,
  isUploading,
}: AssignmentSlideProps) => {
  const { activeItem } = useContentStore();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [questionResponses, setQuestionResponses] = useState<
    Record<string, any>
  >({});

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const result = await onUpload(file);
      if (result.success && result.fileId) {
        setUploadedFiles((prev) => [...prev, file]);
        setUploadedFileIds((prev) => [...prev, result.fileId!]);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error uploading file:", error);
      return false;
    }
  };

  // Handle question response change
  const handleResponseChange = (questionId: string, value: any) => {
    setQuestionResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Submit assignment mutation
  const submitAssignmentMutation = useMutation({
    mutationFn: async () => {
      if (!activeItem) throw new Error("No active item");

      const payload = {
        id: uuidv4(),
        source_id: activeItem.source_id || "",
        source_type: activeItem.source_type || "",
        user_id: "current-user-id", // Replace with actual user ID
        slide_id: activeItem.id || "",
        start_time_in_millis: Date.now() - 60000, // Assuming started 1 minute ago
        end_time_in_millis: Date.now(),
        percentage_watched: 100,
        videos: [],
        documents: [],
        question_slides: [],
        assignment_slides: [
          {
            id: assignmentData.id,
            comma_separated_file_ids: uploadedFileIds.join(","),
            date_submitted: new Date().toISOString(),
            marks: 0,
          },
        ],
        video_slides_questions: [],
        new_activity: true,
        concentration_score: {
          id: uuidv4(),
          concentration_score: 100,
          tab_switch_count: 0,
          pause_count: 0,
          answer_times_in_seconds: [],
        },
      };

      // // Add question responses if there are any
      // if (Object.keys(questionResponses).length > 0) {
      //   payload.question_slides = Object.entries(questionResponses).map(
      //     ([id, response]) => ({
      //       id,
      //       attempt_number: 1,
      //       response_json: JSON.stringify(response),
      //       response_status: "SUBMITTED",
      //       marks: 0,
      //     })
      //   );
      // }
      const urlParams = new URLSearchParams(window.location.search);
      const slideId = urlParams.get("slideId") || "";
      const userId = await getUserId();
      return authenticatedAxiosInstance.post(SUBMIT_SLIDE_ANSWERS, payload, {
        params: {
          slideId,
          userId,
        },
      });
    },
    onSuccess: () => {
      setSubmitSuccess(true);
      setSubmitError(null);
    },
    onError: (error: any) => {
      setSubmitSuccess(false);
      setSubmitError(error.message || "Failed to submit assignment");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Handle assignment submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    submitAssignmentMutation.mutate();
  };

  // Render question based on type
  const renderQuestion = (question: any, index: number) => {
    if (!question.text_data?.content) return null;

    switch (question.question_type) {
      case "MCQS": // Single choice
        return (
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3">
              {index + 1}. {question.text_data.content}
            </h3>
            <RadioGroup
              value={questionResponses[question.id] || ""}
              onValueChange={(value) =>
                handleResponseChange(question.id, value)
              }
              className="space-y-2"
            >
              {question.options?.map((option: any, optIndex: number) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id}>
                    {String.fromCharCode(65 + optIndex)}. {option.text?.content}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "MCQM": // Multiple choice
        return (
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3">
              {index + 1}. {question.text_data.content}
            </h3>
            <div className="space-y-2">
              {question.options?.map((option: any, optIndex: number) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.id}
                    checked={(questionResponses[question.id] || []).includes(
                      option.id
                    )}
                    onCheckedChange={(checked) => {
                      const currentValues =
                        questionResponses[question.id] || [];
                      const newValues = checked
                        ? [...currentValues, option.id]
                        : currentValues.filter(
                            (id: string) => id !== option.id
                          );
                      handleResponseChange(question.id, newValues);
                    }}
                  />
                  <Label htmlFor={option.id}>
                    {String.fromCharCode(65 + optIndex)}. {option.text?.content}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3">
              {index + 1}. {question.text_data.content}
            </h3>
            <p className="text-sm text-gray-500">
              Question type not supported: {question.question_type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            Assignment: {assignmentData.text_data?.content || activeItem?.title}
          </CardTitle>
          <CardDescription>
            <div className="flex flex-col space-y-1 mt-2">
              <span>
                <strong>Start Date:</strong>{" "}
                {formatDate(assignmentData.live_date)}
              </span>
              <span>
                <strong>Due Date:</strong> {formatDate(assignmentData.end_date)}
              </span>
              <span>
                <strong>Attempts Allowed:</strong>{" "}
                {assignmentData.re_attempt_count || "Unlimited"}
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignmentData.parent_rich_text?.content && (
            <div className="mb-6 prose max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: assignmentData.parent_rich_text.content,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions Section */}
      {assignmentData.questions && assignmentData.questions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <CardDescription>Please answer all questions below</CardDescription>
          </CardHeader>
          <CardContent>
            {assignmentData.questions
              .filter((q: any) => q.text_data?.content)
              .map((question: any, index: number) => (
                <div
                  key={question.id}
                  className="mb-8 pb-6 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0"
                >
                  {renderQuestion(question, index)}
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* File Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Upload any required files for this assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader
            onUpload={handleFileUpload}
            isUploading={isUploading}
            uploadedFiles={uploadedFiles}
            onRemove={(index) => {
              setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
              setUploadedFileIds((prev) => prev.filter((_, i) => i !== index));
            }}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || isUploading}
          className="px-6 py-2.5"
        >
          {isSubmitting ? "Submitting..." : "Submit Assignment"}
        </Button>
      </div>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
          Assignment submitted successfully!
        </div>
      )}
      {submitError && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          Error: {submitError}
        </div>
      )}
    </div>
  );
};

export default AssignmentSlide;
