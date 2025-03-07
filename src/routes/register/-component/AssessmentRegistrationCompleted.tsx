import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import {
  RegistrationCompletedMobile,
  RegistrationCompletedWeb,
  VacademyLogoWeb,
} from "@/svgs";
import { useNavigate } from "@tanstack/react-router";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const AssessmentRegistrationCompleted = ({
  assessmentName,
  timeLeft,
  assessmentId,
}: {
  assessmentName: string;
  timeLeft: TimeLeft;
  assessmentId: string;
}) => {
  const navigate = useNavigate();
  const handleNavigateAssessment = () => {
    navigate({
      to: `/assessment/examination/${assessmentId}`,
    });
  };
  return (
    <div className="flex flex-col w-screen h-screen items-center justify-center gap-2 p-10 bg-[linear-gradient(180deg,#FFF9F4_0%,#E6E6FA_100%)]">
      <VacademyLogoWeb />
      <h1 className="text-sm sm:text-lg my-1 text-center">{assessmentName}</h1>
      <Separator className="mt-2" />
      <div className="block sm:hidden">
        <RegistrationCompletedMobile />
      </div>
      <div className="hidden sm:block">
        <RegistrationCompletedWeb />
      </div>
      <h1 className="-mt-4 text-sm sm:text-lg">Registration Completed!</h1>
      <div className="flex flex-col my-4 text-center">
        <h1 className="text-primary-500 text-sm sm:text-lg">
          Assessment goes live in
        </h1>
        {(timeLeft.hours > 0 ||
          timeLeft.minutes > 0 ||
          timeLeft.seconds > 0) && (
          <span className="font-thin">
            {timeLeft.hours} hrs : {timeLeft.minutes} min : {timeLeft.seconds}{" "}
            sec
          </span>
        )}
      </div>
      <MyButton
        type="button"
        buttonType="primary"
        scale="large"
        layoutVariant="default"
        disable={
          timeLeft.hours !== 0 ||
          timeLeft.minutes !== 0 ||
          timeLeft.seconds !== 0
        }
        onClick={handleNavigateAssessment}
      >
        Go To Assessment
      </MyButton>
    </div>
  );
};

export default AssessmentRegistrationCompleted;
