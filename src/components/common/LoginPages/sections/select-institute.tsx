import { FormContainer } from "@/components/common/LoginPages/layout/form-container";
import { Heading } from "@/components/common/LoginPages/ui/heading";
import { MyInput } from "@/components/design-system/input";
import { Link } from "@tanstack/react-router";
import { forgotPasswordSchema } from "@/schemas/login/login";
import { z } from "zod";
import { forgotPassword } from "@/hooks/login/send-link-button";
import { sendResetLink } from "@/hooks/login/reset-link-click";
import { useMutation } from "@tanstack/react-query";
import { MyButton } from "@/components/design-system/button";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useNavigate } from "@tanstack/react-router";
import { MyDropdown } from "@/components/design-system/dropdown";
import { fetchAndStoreInstituteDetails } from "@/services/fetchAndStoreInstituteDetails";
import { getTokenDecodedData, setTokenInStorage } from "@/lib/auth/sessionUtility";
import { TokenKey } from "@/constants/auth/tokens";

type FormValues = z.infer<typeof forgotPasswordSchema>;

export function InstituteSelection() {
  const navigate = useNavigate();
  const form = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onTouched",
  });

  const loginToInstitute = useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: async (response) => {
      // Store tokens in Capacitor Storage
      await setTokenInStorage(TokenKey.accessToken, response.accessToken);
      await setTokenInStorage(TokenKey.refreshToken, response.refreshToken);
      console.log("Access Token:", response.accessToken);
          
      // Decode token to get user data
      const decodedData = await getTokenDecodedData(response.accessToken);

      // Check authorities in decoded data
      const authorities = decodedData.authorities;
      const userId = decodedData.user;
      const authorityKeys = authorities ? Object.keys(authorities) : [];

      const instituteId = Object.keys(authorities)[0];

      // await fetchAndStoreInstituteDetails(instituteId, userId);
      const details = await fetchAndStoreInstituteDetails(instituteId, userId);

      if (details) {
        navigate({ to: "/dashboard" });
        // Navigate after successful fetch
      }
    },
    onError: () => {
      toast.error(" Error entring Institute", {
        description: "This account doesn't exist",
        className: "error-toast",
        duration: 2000,
      });
    },
  });

  const sendResetLinkMutation = useMutation({
    mutationFn: sendResetLink,
    onSuccess: (response) => {
      if (response.status != "success") {
        toast.error("Failed to reset the password", {
          className: "error-toast",
          duration: 3000,
        });
      }
    },
    onError: () => {
      toast.error("Failed to reset the password", {
        className: "error-toast",
        duration: 3000,
      });
    },
  });

  function onSubmit(values: FormValues) {
    loginToInstitute.mutate(values.email);
  }

  return (
    <div>
      <FormContainer>
        <div className="flex w-full flex-col items-center justify-center gap-10 md:gap-8 lg:gap-6 px-4 md:px-8 lg:px-12">
          <Heading
            heading="Welcome, Student!"
            subHeading="Ready to make things happen? Enter your Institute ID to create your request and start now!"
          />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
              <div className="flex w-full flex-col items-center justify-center gap-20 md:gap-25 lg:gap-30">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormControl>
                        <MyDropdown
                          dropdownList={[
                            "Institute A",
                            "Institute B",
                            "Institute C",
                            "Institute D",
                          ]}
                          placeholder="Select an Institute"
                          handleChange={onChange}
                          currentValue={value}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col items-center gap-4 md:gap-6 lg:gap-8 justify-center">
                  <MyButton
                    type="submit"
                    scale="large"
                    buttonType="primary"
                    layoutVariant="default"
                  >
                    Login to Institute
                  </MyButton>
                  <div className="flex flex-row font-regular items-center justify-center">
                    <div className="text-neutral-500 text-sm md:text-base lg:text-base text-center">
                      Want to Login with other account?
                      <MyButton
                        type="button"
                        scale="medium"
                        buttonType="text"
                        layoutVariant="default"
                        className="text-primary-500"
                        onClick={() => navigate({ to: "/login" })}
                      >
                        Back to Login
                      </MyButton>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </FormContainer>
    </div>
  );
}
