import { createFileRoute } from "@tanstack/react-router";
import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { SSDCLogoMobile, SSDCLogoWeb } from "@/svgs";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const openTestForgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

type FormValues = z.infer<typeof openTestForgotPasswordSchema>;

export const Route = createFileRoute("/register/login/forgot-password/")({
  component: RouteComponent,
});

function RouteComponent() {
  const form = useForm<FormValues>({
    resolver: zodResolver(openTestForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });
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
      <h1 className="text-primary-500 font-thin">Assessment goes live in</h1>
      <span className="font-thin text-sm">27 hrs : 19 min : 43 sec</span>
      <Separator className="mt-2" />
      <div className="flex justify-center items-center w-1/2">
        <div className="flex justify-center items-start w-1/2 flex-col">
          <FormProvider {...form}>
            <form className="w-full flex flex-col gap-6 mt-4">
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
                        error={form.formState.errors.email?.message}
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
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
