import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { MyButton } from "@/components/design-system/button";
import { useNavigate } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog";
import { fetchPreviewData } from "@/routes/assessment/examination/-utils.ts/useFetchAssessment";
import { useProctoring } from "@/hooks/proctoring/useProctoring";
import { AssessmentPreview } from "../questionLiveTest/assessment-preview";
import { PrivacyScreen } from "@capacitor-community/privacy-screen";

const AssessmentStartModal = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const assessmentId = pathSegments[3];
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [examHasStarted, setExamHasStarted] = useState(false);
  const navigate = useNavigate();
  const enableProtection = async () => {
    await PrivacyScreen.enable();
  };

  // const disableProtection = async () => {
  //   await PrivacyScreen.disable();
  // };
  const { fullScreen } = useProctoring({
    forceFullScreen: true,
    // preventTabSwitch: true,
    // preventContextMenu: true,
    // preventUserSelection: true,
    // preventCopy: true,
  });

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

  const handleAssessmentAction = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetchPreviewData(assessmentId);

      if (response) {
        fullScreen.trigger();
        // Wait before react finishes updating state
        setTimeout(() => {
          setIsOpen(false);
          setExamHasStarted(true);
          enableProtection();
          navigate({
            to: `/assessment/examination/${assessmentId}/assessmentPreview`,
            replace: true,
          });
        }, 100);
      } else {
        setShowErrorAlert(true);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error during assessment action:", error);
      setShowErrorAlert(true);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getContent = () => {
    return <AssessmentPreview />;
  };

  return (
    <div className="flex flex-col items-center pt-4">
      {examHasStarted ? (
        <>
          <div className="test-container">{getContent()}</div>
        </>
      ) : (
        <MyButton
          onClick={() => setIsOpen(true)}
          buttonType="primary"
          scale="large"
          layoutVariant="default"
        >
          Start Assessment
        </MyButton>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex justify-between bg-primary-50 rounded-lg items-center p-4 border-b border-gray-200">
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

            <div className="p-6">
              <p className="text-gray-600 sm:text-sm lg:text-[16px]">
                {
                  "Once you start the assessment, you must complete it without interruption. Begin only when you're ready."
                }
              </p>
            </div>

            <div className="p-4 flex justify-center">
              <MyButton
                onClick={handleAssessmentAction}
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

      {showErrorAlert && (
        <div className="sm:max-w-[90%] md:max-w-[400px] lg:max-w-[500px]">
          <AlertDialog open={showErrorAlert} onOpenChange={handleAlertClose}>
            <AlertDialogOverlay
              className="bg-white/50"
              onClick={handleAlertClose}
            />
            <AlertDialogContent className="max-w-sm bg-white rounded-lg p-4 sm:mx-4 sm:p-6">
              <div className="text-gray-700">
                The assessment is already in{" "}
                <span className="text-primary-500">preview mode</span>. You
                cannot start this test at this time. Contact the admin for more
                information.
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default AssessmentStartModal;
