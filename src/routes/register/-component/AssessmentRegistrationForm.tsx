import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { SSDCLogoMobile, SSDCLogoWeb } from "@/svgs";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a valid string",
    })
    .trim()
    .email("Invalid email address")
    .max(255, { message: "Email must be less than 255 characters" }),
});

type FormValues = z.infer<typeof forgotPasswordSchema>;
const AssessmentRegistrationForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onTouched",
  });

  return (
    <div className="flex w-full items-center justify-center bg-[linear-gradient(180deg,#FFF9F4_0%,#E6E6FA_100%)] gap-8 flex-col sm:flex-row">
      <div className="flex justify-center items-center w-full mt-4">
        <div className="flex flex-col w-full sm:w-3/4 items-center justify-center gap-6">
          <div className="block sm:hidden">
            <SSDCLogoMobile />
          </div>
          <div className="hidden sm:block">
            <SSDCLogoWeb />
          </div>
          <h1 className="text-xl whitespace-normal sm:whitespace-nowrap p-4 sm:p-0">
            The Human Eye and The Colourful World
          </h1>
          <div className="flex items-center gap-4 text-sm flex-col sm:flex-row">
            <span className="text-primary-500 cursor-pointer hidden sm:block">
              Register Now!
            </span>
            <MyButton
              type="button"
              buttonType="primary"
              scale="large"
              layoutVariant="default"
              className="block sm:hidden"
            >
              Register Now!
            </MyButton>
            <span className="font-thin">27 hrs : 19 min : 43 sec</span>
          </div>
          <div className="text-sm flex items-center gap-2">
            <span className="text-neutral-400">Already Registered?</span>
            <span className="text-primary-500 cursor-pointer">
              Login with Email
            </span>
          </div>
          <Separator />
          <h1 className="text-sm font-thin">
            Important Dates - Mark Your Calendar!
          </h1>
          <div className="text-sm flex flex-col gap-4 px-4">
            <div className="flex flex-col">
              <h1>Registration Window:</h1>
              <span className="font-thin">Opens: 16/11/2024, 10:00 AM</span>
              <span className="font-thin">Closes: 16/11/2024, 10:00 AM</span>
            </div>
            <div className="flex flex-col">
              <h1>Assessment Live Dates</h1>
              <span className="font-thin">Starts: 24/11/2024, 10:00 AM </span>
              <span className="font-thin">Ends: 24/11/2024, 10:00 AM </span>
            </div>
            <div className="flex flex-col">
              <h1>About Assessment</h1>
              <span className="font-thin">
                This assessment is designed to evaluate your knowledge, skills,
                and aptitude in the respective field. It provides an opportunity
                to showcase your capabilities and gain insights into your
                performance. Ensure you complete the registration within the
                specified period to participate.
              </span>
            </div>
          </div>
        </div>
      </div>
      <Separator className="block sm:hidden mx-4" />
      <div className="flex justify-center items-center w-full">
        <div className="flex justify-center items-start w-full  sm:w-3/4 flex-col bg-white rounded-xl p-4 shadow-md mx-4 mb-4">
          <h1>Assessment Registration Form</h1>
          <span className="text-sm text-neutral-500">
            Register for the assessment by completing the details below.
          </span>
          <FormProvider {...form}>
            <form className="w-full flex flex-col gap-6 mt-4 max-h-[70vh] overflow-auto">
              <FormField
                control={form.control}
                name="email"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <MyInput
                        inputType="text"
                        inputPlaceholder="Enter your email"
                        input={value}
                        onChangeFunction={onChange}
                        required
                        size="large"
                        label="Email"
                        labelStyle="font-thin"
                        {...field}
                        className="max-w-full !w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <MyInput
                        inputType="text"
                        inputPlaceholder="Enter your email"
                        input={value}
                        onChangeFunction={onChange}
                        required
                        size="large"
                        label="Email"
                        labelStyle="font-thin"
                        {...field}
                        className="max-w-full !w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <MyInput
                        inputType="text"
                        inputPlaceholder="Enter your email"
                        input={value}
                        onChangeFunction={onChange}
                        required
                        size="large"
                        label="Email"
                        labelStyle="font-thin"
                        {...field}
                        className="max-w-full !w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <MyInput
                        inputType="text"
                        inputPlaceholder="Enter your email"
                        input={value}
                        onChangeFunction={onChange}
                        required
                        size="large"
                        label="Email"
                        labelStyle="font-thin"
                        {...field}
                        className="max-w-full !w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <MyInput
                        inputType="text"
                        inputPlaceholder="Enter your email"
                        input={value}
                        onChangeFunction={onChange}
                        required
                        size="large"
                        label="Email"
                        labelStyle="font-thin"
                        {...field}
                        className="max-w-full !w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <MyInput
                        inputType="text"
                        inputPlaceholder="Enter your email"
                        input={value}
                        onChangeFunction={onChange}
                        required
                        size="large"
                        label="Email"
                        labelStyle="font-thin"
                        {...field}
                        className="max-w-full !w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <MyInput
                        inputType="text"
                        inputPlaceholder="Enter your email"
                        input={value}
                        onChangeFunction={onChange}
                        required
                        size="large"
                        label="Email"
                        labelStyle="font-thin"
                        {...field}
                        className="max-w-full !w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormControl>
                      <MyInput
                        inputType="text"
                        inputPlaceholder="Enter your email"
                        input={value}
                        onChangeFunction={onChange}
                        required
                        size="large"
                        label="Email"
                        labelStyle="font-thin"
                        {...field}
                        className="max-w-full !w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-center flex-col gap-4">
                <MyButton
                  type="button"
                  buttonType="primary"
                  scale="large"
                  layoutVariant="default"
                >
                  Submit
                </MyButton>
                <p className="border-none !text-primary-500 !text-sm mb-2 cursor-pointer">
                  Reset Form
                </p>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default AssessmentRegistrationForm;
