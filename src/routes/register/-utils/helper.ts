import { AssessmentCustomFieldOpenRegistration } from "@/types/assessment-open-registration";
import { z } from "zod";

export const calculateTimeLeft = (startDate: string) => {
  const now: number = new Date().getTime(); // Get current time in milliseconds

  // Parse the startDate correctly
  const startTime: number = new Date(Date.parse(startDate)).getTime();

  if (isNaN(startTime)) {
    console.error("Invalid date format");
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const difference: number = startTime - now;

  if (difference <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 }; // Assessment already started
  }

  return {
    hours: Math.floor(difference / (1000 * 60 * 60)),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

export const getDynamicSchema = (
  formFields: AssessmentCustomFieldOpenRegistration[]
) => {
  const dynamicSchema = z.object(
    formFields.reduce<Record<string, z.ZodTypeAny>>((schema, field) => {
      if (field.field_type === "dropdown") {
        const options = field.comma_separated_options
          ? field.comma_separated_options.split(",").map((opt) => opt.trim())
          : [];
        schema[field.field_key] =
          field.is_mandatory && options.length > 0
            ? z.enum([...(options as [string, ...string[]])], {
                message: `${field.field_key} is required`,
              })
            : z.enum([...(options as [string, ...string[]])]).optional();
      } else {
        schema[field.field_key] = field.is_mandatory
          ? z.string().min(1, `${field.field_key} is required`)
          : z.string().optional();
      }
      return schema;
    }, {})
  );
  return dynamicSchema;
};
