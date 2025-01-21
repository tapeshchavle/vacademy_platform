import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, CircleDot } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Assessment,
  AssessmentCardProps,
} from "@/types/previewInstructionAssessment";
import { UpcomingAssessment } from "../-utils.ts/dummyData";
import { StatusChip, StatusChips } from "@/components/design-system/chips";

const ITEMS_PER_PAGE = 3;

const AssessmentCard = ({ assessment }: AssessmentCardProps) => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPopup) {
      timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showPopup]);

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <>
      <Card
        className="w-full  hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setShowPopup(true)}
      >
        <CardContent className="p-4 gap-2">
          <div className="font-semibold text-sm mb-4">{assessment.title}</div>

          <div className="flex gap-3 pb-4">
            <StatusChip mode={assessment.mode}  />
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Live Date: {assessment.liveDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <span>Live Availability: {assessment.availability}</span>
            </div>

            <p className="font-medium">Subject: {assessment.subject}</p>
            <p>Duration: {assessment.duration}</p>
          </div>
        </CardContent>
      </Card>

     
<div className="sm:max-w-[90%] md:max-w-[400px] lg:max-w-[500px]">
  <AlertDialog open={showPopup} onOpenChange={handleClose}>
    <AlertDialogOverlay className="bg-black/50" onClick={handleClose} />
    <AlertDialogContent 
      className="max-w-sm bg-[#FDFAF6] rounded-lg p-4 sm:mx-4 sm:p-6 ">
      <div className="text-gray-700">
        The assessment{" "}
        <span className="text-orange-500">{assessment.title}</span> is not live currently. 
        You can appear for the assessment when it goes live.
      </div>
    </AlertDialogContent>
  </AlertDialog>
</div>

    </>
  );
};

const UpcomingAssessmentList = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const assessments = UpcomingAssessment;

  const totalPages = Math.ceil(assessments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAssessments = assessments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="">
      <div className="space-y-4">
        {currentAssessments.map((assessment, index) => (
          <AssessmentCard key={index} assessment={assessment} />
        ))}
      </div>

      <div className="mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index + 1}>
                <PaginationLink
                  onClick={() => handlePageChange(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default UpcomingAssessmentList;
