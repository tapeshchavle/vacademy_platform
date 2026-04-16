import { MyButton } from "@/components/design-system/button";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, FormProvider, useForm } from "react-hook-form";
import SelectField from "@/components/design-system/select-field";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { generateZodSchema } from "../-types/registrationFormSchema";
import {
  RegistrationFormValues,
  CustomField,
} from "../-types/type";
import { useEffect } from "react";
import { CustomFieldRenderer } from "@/components/common/custom-fields/CustomFieldRenderer";
import { getFieldRenderType } from "@/components/common/enroll-by-invite/-utils/custom-field-helpers";

interface RegistrationFormProps {
  customFields: CustomField[];
  verifiedEmail: string;
  verifiedEmails: string[];
  onSubmit: (formValues: RegistrationFormValues) => void;
  onError: (errors: FieldErrors) => void;
  onEmailChange: (email: string) => void;
}

export default function RegistrationForm({
  customFields,
  verifiedEmail,
  verifiedEmails,
  onSubmit,
  onError,
  onEmailChange,
}: RegistrationFormProps) {
  const schema = generateZodSchema(customFields);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: verifiedEmail,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = form;

  // Update form email when verified email changes
  useEffect(() => {
    if (verifiedEmail) {
      form.setValue("email", verifiedEmail);
    }
  }, [verifiedEmail, form]);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="flex flex-col gap-4 justify-between p-4 sm:p-6 w-full max-w-md mx-auto"
      >
        <div className="font-bold text-lg sm:text-xl">Registration Form</div>
        <div className="flex flex-col gap-4 overflow-auto max-h-[60vh] sm:max-h-[50vh]">
          {customFields?.map((responseField) => {
            const renderType = getFieldRenderType(
              responseField.fieldKey,
              responseField.fieldType
            );
            const isEmailWithVerifiedList =
              responseField.fieldKey === "email" && verifiedEmails.length > 0;
            const isMobileNumber = responseField.fieldKey === "mobile_number";

            return (
              <div key={responseField.id} className="flex flex-col gap-4">
                {isMobileNumber ? (
                  <FormField
                    control={form.control}
                    name={responseField.fieldKey as never}
                    render={({ field }) => (
                      <FormItem className="!w-full">
                        <FormLabel>
                          {responseField.fieldName}
                          {responseField.mandatory && (
                            <span className="text-danger-600">*</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <PhoneInput
                            {...field}
                            country="gb"
                            enableSearch={true}
                            placeholder={`Enter ${responseField.fieldName.toLowerCase()}`}
                            onChange={(val) => {
                              const formattedValue = val.startsWith("+")
                                ? val
                                : `+${val}`;
                              field.onChange(formattedValue);
                            }}
                            inputClass="!w-full h-10 sm:h-12 !rounded-md !border-input !text-sm sm:!text-base"
                            buttonClass="!rounded-l-md !border-input !h-10 sm:!h-12"
                            disabled={false}
                            value={field.value}
                            countryCodeEditable={false}
                            enableAreaCodes={true}
                            disableCountryGuess={false}
                            preferredCountries={["us", "gb", "in"]}
                            inputProps={{
                              maxLength: 15,
                              minLength: 11,
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : isEmailWithVerifiedList ? (
                  // Special handling for email field - show dropdown of verified emails
                  <SelectField
                    label={responseField.fieldName}
                    name={responseField.fieldKey}
                    options={verifiedEmails.map((email, idx) => ({
                      value: email,
                      label: email,
                      _id: idx,
                    }))}
                    control={form.control}
                    className="mt-[8px] w-full font-thin"
                    onSelect={(value) => {
                      form.setValue("email", value);
                      onEmailChange(value);
                    }}
                  />
                ) : (
                  // All other field types handled by shared renderer:
                  // text, number, email, url, date, textarea, checkbox,
                  // radio, dropdown, file
                  <FormField
                    control={form.control}
                    name={responseField.fieldKey as never}
                    render={({ field }) => {
                      const isVerifiedEmailField =
                        responseField.fieldKey === "email" &&
                        verifiedEmail !== "";
                      return (
                        <FormItem>
                          <FormLabel>
                            {responseField.fieldName}
                            {responseField.mandatory && (
                              <span className="text-danger-600">*</span>
                            )}
                          </FormLabel>
                          <FormControl>
                            <CustomFieldRenderer
                              type={renderType}
                              name={responseField.fieldName}
                              value={field.value || ""}
                              onChange={(val) => field.onChange(val)}
                              config={responseField.config}
                              required={responseField.mandatory}
                              disabled={isVerifiedEmailField}
                            />
                          </FormControl>
                          {isVerifiedEmailField && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <span>✓</span> Email verified and auto-filled
                            </p>
                          )}
                        </FormItem>
                      );
                    }}
                  />
                )}

                {typeof responseField.fieldKey === "string" &&
                  !!errors &&
                  Object.prototype.hasOwnProperty.call(
                    errors,
                    responseField.fieldKey
                  ) &&
                  (errors as Record<string, FieldErrors>)[
                    responseField.fieldKey
                  ] && (
                    <p style={{ color: "red" }}>
                      {(errors as Record<string, FieldErrors>)[
                        responseField.fieldKey
                      ]?.message?.toString()}
                    </p>
                  )}
              </div>
            );
          })}
        </div>

        <MyButton buttonType="primary" type="submit" className="mt-4 w-full">
          Join Now
        </MyButton>
      </form>
    </FormProvider>
  );
}
