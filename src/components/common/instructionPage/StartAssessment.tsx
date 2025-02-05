import { useState } from "react";
import { X } from "lucide-react";
import { MyButton } from "@/components/design-system/button";
import { useNavigate } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
// import { Storage } from "@capacitor/storage";
import {fetchPreviewData } from '@/routes/assessment/examination/-utils.ts/useFetchAssessment'


const AssessmentStartModal = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const assessmentId = pathSegments[3];
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsOpen(false);
  };
  const handleNavigation = async () => {
    await fetchPreviewData(assessmentId);
    // console.log(data);
    navigate({
      to: `/assessment/examination/${assessmentId}/assessmentPreview`,
    });
  };

  return (
    <div className="flex justify-center pt-4">
      <MyButton
        onClick={() => setIsOpen(true)}
        buttonType="primary"
        scale="large"
        layoutVariant="default"
      >
        Start Assessment
      </MyButton>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-rose-50 rounded-lg w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-orange-500 text-xl font-medium">
                Start Assessment
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-red-500 sm:text-sm lg:text-[16px]">
                  Attention
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="red"
                  viewBox="0 0 256 256"
                  className="text-red-500"
                >
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path>
                </svg>
              </div>

              <p className="text-gray-600 sm:text-sm lg:text-[16px]">
                Once you start the assessment, you must complete it without
                interruption. Begin only when you're ready.
              </p>
            </div>

            {/* Footer  */}
            <div className="p-4 flex justify-center">
              <MyButton
                onClick={() => handleNavigation()}
                buttonType="primary"
                scale="large"
                layoutVariant="default"
              >
                Proceed
              </MyButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentStartModal;
