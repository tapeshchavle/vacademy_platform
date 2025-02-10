import { MyButton } from "@/components/design-system/button";
import { Separator } from "@/components/ui/separator";
import {
  RegistrationCompletedMobile,
  RegistrationCompletedWeb,
  SSDCLogoMobile,
  SSDCLogoWeb,
} from "@/svgs";

const AssessmentRegistrationCompleted = () => {
  return (
    <div className="flex flex-col w-screen h-screen items-center justify-center gap-2 p-10 bg-[linear-gradient(180deg,#FFF9F4_0%,#E6E6FA_100%)]">
      <div className="block sm:hidden">
        <SSDCLogoMobile />
      </div>
      <div className="hidden sm:block">
        <SSDCLogoWeb />
      </div>
      <h1 className="text-sm sm:text-lg my-1 text-center">
        The Human Eye and The Colourful World
      </h1>
      <Separator className="mt-2" />
      <div className="block sm:hidden">
        <RegistrationCompletedMobile />
      </div>
      <div className="hidden sm:block">
        <RegistrationCompletedWeb />
      </div>
      <h1 className="-mt-4 text-sm sm:text-lg">Registration Completed!</h1>
      <h1 className="mt-4 text-sm sm:text-lg text-center">
        Assessment joining credentials will be sent to your registered email ID
      </h1>
      <div className="flex flex-col my-4 text-center">
        <h1 className="text-primary-500 text-sm sm:text-lg">
          Assessment goes live in
        </h1>
        <span className="font-thin text-sm">27 hrs : 19 min : 43 sec</span>
      </div>
      <MyButton
        type="button"
        buttonType="primary"
        scale="large"
        layoutVariant="default"
      >
        Go To Login Page
      </MyButton>
    </div>
  );
};

export default AssessmentRegistrationCompleted;
