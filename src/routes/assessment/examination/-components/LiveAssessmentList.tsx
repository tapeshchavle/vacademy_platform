import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Circle, CheckCircle2, PauseCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { MyButton } from "@/components/design-system/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Assessment,
  AssessmentCardProps,
  AssessmentListProps,
} from "@/types/previewInstructionAssessment";
import assessments from "../-utils.ts/dummyData";
import { StatusChip } from "@/components/design-system/chips";
// import { StatusChips } from "@/components/design-system/chips";

// Card Component
const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment }) => {
  const navigate = useNavigate();
  const {
    assessmentId,
    title,
    mode,
    status,
    startDate,
    endDate,
    subject,
    assessmentDuration,
  } = assessment;

  const handleJoinAssessment = () => {
    navigate({ to: `/assessment/examination/${assessmentId}` });
};

  return (
    <Card className="w-full p-6 space-y-6">
      <h2 className="text-sm lg:text-base font-semibold">{title}</h2>
      <div className="lg:flex md:flex justify-between items-center ">
        <div className="">
            <div className="flex gap-3 pb-3 items-center">
            <StatusChip mode={mode} />
            <div className="h-8 border-l border-gray-400"></div>
            <StatusChip status={status} />
            </div>
          <div className="space-y-2 text-xs lg:text-sm text-gray-600">
            <div>Start Date and Time: {startDate}</div>
            <div>End Date and Time: {endDate}</div>
            <div>Subject: {subject}</div>
            <div>Duration: {assessmentDuration}</div>
          </div>
        </div>
        <div className="sm:justify-center">
        <div className="pt-6 md:pt-14 lg:pt-24 sm:items-center">
          <MyButton
            buttonType="secondary"
            className="w-full max-w-xs md:w-[200px] lg:w-[300px]"
            disabled={status.toLowerCase() !== "active"}
            onClick={handleJoinAssessment}
          >
            Join Assessment
          </MyButton>
        </div></div>
      </div>
    </Card>
  );
};

// List Component with Pagination
const AssessmentList: React.FC<AssessmentListProps> = ({ assessments }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Paginated assessments
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssessments = assessments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const totalPages = Math.ceil(assessments.length / itemsPerPage);

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {currentAssessments.map((assessment) => (
          <AssessmentCard
            key={assessment.assessmentId}
            assessment={assessment}
          />
        ))}
      </div>
      <Pagination>
        <PaginationPrevious
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        />
        <PaginationContent>
          {Array.from({ length: totalPages }).map((_, index) => (
            <PaginationItem key={index} isCurrent={index + 1 === currentPage}>
              <PaginationLink onClick={() => setCurrentPage(index + 1)}>
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          {totalPages > 5 && <PaginationEllipsis />}
        </PaginationContent>
        <PaginationNext
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
        />
      </Pagination>
    </div>
  );
};

const LiveAssessmentList: React.FC = () => {
  return <AssessmentList assessments={assessments} />;
};
export default LiveAssessmentList;
