import { useEffect, useState } from "react";
import { SplashScreen } from "@/components/common/LoginPages/layout/splash-container";
import { useAnimationStore } from "@/stores/login/animationStore";
import { Heading } from "@/components/common/LoginPages/ui/heading";
import { MyInput } from "@/components/design-system/input";
import { MyButton } from "@/components/design-system/button";
// import { Link } from "@tanstack/react-router";
import { loginSchema } from "@/schemas/login/login";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { loginUser } from "@/hooks/login/login-button";
// import { Storage } from "@capacitor/storage";
import { TokenKey } from "@/constants/auth/tokens";
import { useNavigate } from "@tanstack/react-router";
import HeaderLogo from "../ui/header_logo";

import { isNullOrEmptyOrUndefined } from "@/lib/utils";
import {
  getTokenFromStorage,
  setTokenInStorage,
} from "@/lib/auth/sessionUtility";
type FormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { hasSeenAnimation, setHasSeenAnimation } = useAnimationStore();
  const [showSplash, setShowSplash] = useState(!hasSeenAnimation);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onTouched",
  });
  useEffect(() => {
    const redirect = async () => {
      const token = await getTokenFromStorage(TokenKey.accessToken);
      if (!isNullOrEmptyOrUndefined(token)) {
        navigate({ to: "/dashboard" });
      }
    };
    redirect();
  }, []);
  // Handle splash screen timing
  useEffect(() => {
    if (!hasSeenAnimation) {
      const timer = setTimeout(() => {
        setHasSeenAnimation();
        setShowSplash(false);
      }, 2000); // Splash screen duration
      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [hasSeenAnimation, setHasSeenAnimation]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      loginUser(values.username, values.password),
    onSuccess: async (response) => {
      if (response) {
        // Store tokens in Capacitor Storage
        await setTokenInStorage(TokenKey.accessToken, response.accessToken);
        await setTokenInStorage(TokenKey.refreshToken, response.refreshToken);
        navigate({ to: "/dashboard" });
      } else {
        toast.error("Login Error", {
          description: "Invalid credentials",
          className: "error-toast",
          duration: 3000,
        });
        form.reset();
      }
    },
    onError: () => {
      toast.error("Login Error", {
        description: "Invalid username or password",
        className: "error-toast",
        duration: 3000,
      });
      form.reset();
    },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  // Conditionally render the splash screen
  if (showSplash) {
    return <SplashScreen isAnimationEnabled  />;
  }

  // Login form content
  return (
    <div className="w-screen bg-white gap-4 md:gap-8 lg:gap-10">
      {/* Logo Section */}
      <HeaderLogo />

      {/* Login Form Section */}
      <div className="flex w-full flex-col items-center justify-center gap-4 md:gap-8 lg:gap-12 px-4 md:px-8 lg:px-12">
        <Heading
          heading="Hello, Student!"
          subHeading="Ready to learn something new? Log in and continue your academic adventure!"
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full ">
            <div className="flex w-full flex-col items-center justify-center gap-4 md:gap-8 px-4 md:px-8 lg:px-12">
              <div className="flex flex-col ">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormControl>
                        <MyInput
                          inputType="text"
                          inputPlaceholder="Enter your username"
                          input={value}
                          onChangeFunction={onChange}
                          error={form.formState.errors.username?.message}
                          required
                          size="large"
                          label="Username"
                          {...field}
                          className="w-[300px] md:w-[348px] lg:w-[348px] "
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <span>
                  <MyButton
                    type="button"
                    scale="medium"
                    buttonType="text"
                    layoutVariant="default"
                    className="text-primary-500"
                    onClick={() => navigate({ to: "/login/forgot-password" })}
                  >
                    Forgot Username?
                  </MyButton>
                </span>
              </div>
              <div className="flex flex-col ">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormControl>
                        <MyInput
                          inputType="password"
                          inputPlaceholder="••••••••"
                          input={value}
                          onChangeFunction={onChange}
                          error={form.formState.errors.password?.message}
                          required
                          size="large"
                          label="Password"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <span>
                  <MyButton
                    type="button"
                    scale="medium"
                    buttonType="text"
                    layoutVariant="default"
                    className="text-primary-500"
                    onClick={() => navigate({ to: "/login/forgot-password" })}
                  >
                    Forgot Password?
                  </MyButton>
                </span>
              </div>
            </div>
            <div className="mt-16 md:mt-16 lg:mt-18 flex flex-col items-center gap-2 md:gap-3 lg:gap-4">
              <MyButton
                type="submit"
                scale="large"
                buttonType="primary"
                layoutVariant="default"
              >
                Login
              </MyButton>
                <div className="flex font-regular pb-5 items-center">
                <div className="text-neutral-500 text-sm md:text-base lg:text-base">
                  Don’t have an account?
                </div>
                <MyButton
                  type="button"
                  scale="medium"
                  buttonType="text"
                  layoutVariant="default"
                  className="text-primary-500"
                  onClick={() => navigate({ to: "/login" })}
                >
                  Create Account
                </MyButton>
                </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
