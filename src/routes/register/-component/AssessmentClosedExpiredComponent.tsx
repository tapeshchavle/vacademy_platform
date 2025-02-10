import { Separator } from "@/components/ui/separator";
import {
  CloseRegistrationMobile,
  CloseRegistrationWeb,
  SSDCLogoMobile,
  SSDCLogoWeb,
} from "@/svgs";

const AssessmentClosedExpiredComponent = ({
  isExpired,
}: {
  isExpired: boolean;
}) => {
  return (
    <div className="flex flex-col w-screen h-screen items-center justify-center gap-2 p-10">
      <div className="block sm:hidden">
        <SSDCLogoMobile />
      </div>
      <div className="hidden sm:block">
        <SSDCLogoWeb />
      </div>
      <h1 className="text-sm sm:text-lg">
        The Human Eye and The Colourful World
      </h1>
      <Separator className="mt-2" />
      <div className="block sm:hidden">
        <CloseRegistrationMobile />
      </div>
      <div className="hidden sm:block">
        <CloseRegistrationWeb />
      </div>
      <h1 className="-mt-4 text-sm sm:text-lg">
        {isExpired ? "Assessment Expired" : "Registration Closed"}
      </h1>
      <h1 className="mt-4 text-sm sm:text-lg">
        {isExpired
          ? "This assessment is no longer available. "
          : "Registration for this assessment has closed."}
      </h1>
      <h1 className="text-primary-500 text-sm sm:text-lg">
        Stay tuned for upcoming opportunities!
      </h1>
    </div>
  );
};

export default AssessmentClosedExpiredComponent;
