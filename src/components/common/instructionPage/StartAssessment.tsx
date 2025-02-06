import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { MyButton } from "@/components/design-system/button";
import { useNavigate } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import { AlertDialog, AlertDialogContent, AlertDialogOverlay } from "@/components/ui/alert-dialog";
import { fetchPreviewData } from '@/routes/assessment/examination/-utils.ts/useFetchAssessment';
import { Storage } from "@capacitor/storage";

const AssessmentStartModal = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const assessmentId = pathSegments[3];
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (showErrorAlert) {
      timeoutId = setTimeout(() => {
        setShowErrorAlert(false);
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [showErrorAlert]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAlertClose = () => {
    setShowErrorAlert(false);
  };



  const handleNavigation = async () => {
    if (isLoading) return;
  
    setIsLoading(true);
  
    try {
      // Remove ASSESSMENT_STATE from Capacitor Storage
      const { value } = await Storage.get({ key: 'ASSESSMENT_STATE' });
      if (value) {
        await Storage.remove({ key: 'ASSESSMENT_STATE' });
        console.log("ASSESSMENT_STATE removed from Capacitor Storage");
      }
  
      // Remove ASSESSMENT_STATE from Local Storage
      if (localStorage.getItem('ASSESSMENT_STATE')) {
        localStorage.removeItem('ASSESSMENT_STATE');
        console.log("ASSESSMENT_STATE removed from Local Storage");
      }
  
      const response = await fetchPreviewData(assessmentId);
  
      if (response) {
        // Close the modal first
        setIsOpen(false);
  
        // Use setTimeout to ensure state updates are processed
        setTimeout(() => {
          navigate({
            to: `/assessment/examination/${assessmentId}/assessmentPreview`,
            replace: true // Use replace to prevent back navigation
          });
        }, 0);
      
      } else {
        setShowErrorAlert(true);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error during navigation:", error);
      setShowErrorAlert(true);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
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
              <h3 className="text-primary-500 text-xl font-medium">
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

            {/* Footer */}
            <div className="p-4 flex justify-center">
              <MyButton
                onClick={handleNavigation}
                buttonType="primary"
                scale="large"
                layoutVariant="default"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Proceed"}
              </MyButton>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert Dialog */}
      {showErrorAlert && (
        <div className="sm:max-w-[90%] md:max-w-[400px] lg:max-w-[500px]">
          <AlertDialog open={showErrorAlert} onOpenChange={handleAlertClose}>
            <AlertDialogOverlay className="bg-black/50" onClick={handleAlertClose} />
            <AlertDialogContent className="max-w-sm bg-[#FDFAF6] rounded-lg p-4 sm:mx-4 sm:p-6">
              <div className="text-gray-700">
                The assessment is already in <span className="text-primary-500">preview mode</span>. 
                You cannot start a this test at this time.
                contact the admin for more information.
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default AssessmentStartModal;