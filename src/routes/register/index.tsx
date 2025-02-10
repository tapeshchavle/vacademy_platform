import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
// import AssessmentClosedExpiredComponent from "./-component/AssessmentClosedExpiredComponent";
import AssessmentRegistrationForm from "./-component/AssessmentRegistrationForm";
// import AssessmentRegistrationCompleted from "./-component/AssessmentRegistrationCompleted";
// import AssessmentClosedExpiredComponent from "./-component/AssessmentClosedExpiredComponent";
// import AssessmentRegistrationForm from "./-component/AssessmentRegistrationForm";

const registerParamsSchema = z.object({
  code: z.union([z.string(), z.number()]),
});

export const Route = createFileRoute("/register/")({
  validateSearch: registerParamsSchema,
  component: RouteComponent,
});

function RouteComponent() {
  return <AssessmentRegistrationForm />;
}
