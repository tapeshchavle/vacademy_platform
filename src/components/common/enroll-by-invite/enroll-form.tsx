"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Loader2 } from "lucide-react";
import { z } from "zod";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { ENROLL_DETAILS_RESPONSE, GET_ENROLL_DETAILS } from "@/constants/urls";
import { toast } from "sonner";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { useSearch } from "@tanstack/react-router";
import { MyButton } from "@/components/design-system/button";
import { getPublicUrl } from "@/services/upload_file";
import { Route } from "@/routes/enroll";

// Type definitions
interface CustomField {
  id: string;
  field_name: string;
  field_type: "TEXT" | "DROPDOWN";
  default_value: string;
  description: string;
  is_mandatory: boolean;
  comma_separated_options: string;
}

interface Level {
  id: string;
  name: string;
  package_session_id: string;
}

interface Session {
  id: string;
  name: string;
  institute_assigned?: boolean;
  max_selectable_levels: number;
  pre_selected_levels?: Level[];
  learner_choice_levels?: Level[];
}

interface Package {
  id: string;
  name: string;
  institute_assigned?: boolean;
  max_selectable_sessions: number;
  pre_selected_session_dtos?: Session[];
  learner_choice_sessions?: Session[];
}

interface BatchOptions {
  institute_assigned: boolean;
  max_selectable_packages: number;
  pre_selected_packages: Package[];
  learner_choice_packages: Package[];
}
interface LearnerInvitation {
  id: string;
  name: string;
  status: string;
  date_generated: string;
  expiry_date: string;
  institute_id: string;
  invite_code: string;
  batch_options_json: string;
  custom_fields: CustomField[];
}

interface ApiResponse {
  learner_invitation: LearnerInvitation;
  institute_name: string;
  institute_logo_file_id: string | null;
}

// Validation schemas
const emailSchema = z.string().email("Please enter a valid email address");
const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
  .transform((val) => val.trim());

const EnrollByInvite = () => {
  // const { instituteId, inviteCode } = useSearch({
  //   instituteId: "",
  //   inviteCode: "",
  // });

  // const { instituteId, inviteCode } = useSearch<{
  //   instituteId: string;
  //   inviteCode: string;
  // }>();

  //   const searchParams = useSearch<{
  //     instituteId?: string;
  //     inviteCode?: string;
  //   }>();
  //   const instituteId = searchParams.instituteId ?? "";
  // const inviteCode = searchParams.inviteCode ?? "";

  // const { instituteId = "", inviteCode = "" } = useSearch<{
  //   instituteId?: string;
  //   inviteCode?: string;
  // }>( { instituteId: "", inviteCode: "" });

  // console.log("instituteId", instituteId, "inviteCode", inviteCode);
  const instituteId = "0f1a4bb6-90ec-4e91-bbbf-2184a39c986e";
  const inviteCode = "053OO";

  // Form state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [inviteData, setInviteData] = useState<LearnerInvitation | null>(null);
  // const [instituteName, setInstituteName] = useState<string>("");
  // const [instituteLogo, setInstituteLogo] = useState<string | null>(null);
  const [batchOptions, setBatchOptions] = useState<BatchOptions | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  // Selection states
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<
    Record<string, string[]>
  >({});
  const [selectedLevels, setSelectedLevels] = useState<
    Record<string, string[]>
  >({});

  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    mobile: "",
  });

  // Custom fields state
  const [customFieldValues, setCustomFieldValues] = useState<
    Record<string, string>
  >({});

  // Validation errors state
  const [errors, setErrors] = useState({
    packages: "",
    sessions: {} as Record<string, string>,
    levels: {} as Record<string, string>,
    fullName: "",
    email: "",
    mobile: "",
    customFields: {} as Record<string, string>,
  });

  // Fetch invite data on component mount
  useEffect(() => {
    if (instituteId && inviteCode) {
      fetchInviteData();
    }
  }, [instituteId, inviteCode]);

  // Fetch invite data from API
  const fetchInviteData = async () => {
    setLoading(true);
    try {
      const response = await authenticatedAxiosInstance.get(
        GET_ENROLL_DETAILS,
        {
          params: {
            instituteId: instituteId,
            inviteCode: inviteCode,
          },
        }
      );
      console.log("Invite data:", response.data);

      // Store the full API response
      setApiResponse(response.data);

      // Extract the learner invitation data
      const learnerInvitation = response.data.learner_invitation;
      setInviteData(learnerInvitation);
      if (response.data.institute_logo_file_id) {
        try {
          const institute_logo = await getPublicUrl(
            response.data.institute_logo_file_id
          );
          setImageUrl(institute_logo);
        } catch (error) {
          console.error("Error fetching institute logo:", error);
        }
      }

      // Set institute name and logo
      // setInstituteName(response.data.institute_name);
      // setInstituteLogo(response.data.institute_logo_file_id);

      // Parse batch options JSON
      const batchOptionsData = JSON.parse(learnerInvitation.batch_options_json);
      setBatchOptions(batchOptionsData);

      // Initialize custom fields
      const initialCustomFields: Record<string, string> = {};
      learnerInvitation.custom_fields.forEach((field: CustomField) => {
        initialCustomFields[field.id] = field.default_value || "";
      });
      setCustomFieldValues(initialCustomFields);

      // Pre-select packages, sessions, and levels
      if (batchOptionsData.pre_selected_packages) {
        const preSelectedPackages = batchOptionsData.pre_selected_packages.map(
          (pkg: Package) => pkg.id
        );
        setSelectedPackages(preSelectedPackages);

        // Pre-select sessions for each package
        const sessionsMap: Record<string, string[]> = {};
        const levelsMap: Record<string, string[]> = {};

        batchOptionsData.pre_selected_packages.forEach((pkg: Package) => {
          if (pkg.pre_selected_session_dtos) {
            const sessionIds = pkg.pre_selected_session_dtos.map(
              (session: Session) => session.id
            );
            sessionsMap[pkg.id] = sessionIds;

            // Pre-select levels for each session
            pkg.pre_selected_session_dtos.forEach((session: Session) => {
              if (session.pre_selected_levels) {
                const levelIds = session.pre_selected_levels.map(
                  (level: Level) => level.id
                );
                levelsMap[session.id] = levelIds;
              }
            });
          }
        });

        setSelectedSessions(sessionsMap);
        setSelectedLevels(levelsMap);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching invite data:", error);
      setLoading(false);
      // Handle error (show message to user)
    }
  };

  // Add package if not already selected and within max limit
  const addPackage = (packageId: string) => {
    if (
      !selectedPackages.includes(packageId) &&
      batchOptions &&
      selectedPackages.length < batchOptions.max_selectable_packages
    ) {
      setSelectedPackages([...selectedPackages, packageId]);
      setErrors({ ...errors, packages: "" });
    }
  };

  // Remove package (only for learner choice packages)
  const removePackage = (packageId: string) => {
    // Check if it's a pre-selected package
    const isPreSelected = batchOptions?.pre_selected_packages.some(
      (pkg) => pkg.id === packageId
    );

    if (!isPreSelected) {
      setSelectedPackages(selectedPackages.filter((id) => id !== packageId));

      // Also remove any sessions and levels associated with this package
      const newSelectedSessions = { ...selectedSessions };
      delete newSelectedSessions[packageId];
      setSelectedSessions(newSelectedSessions);

      // Remove levels from sessions of this package
      const packageSessions = getAllSessionsForPackage(packageId);
      const newSelectedLevels = { ...selectedLevels };
      packageSessions.forEach((sessionId) => {
        delete newSelectedLevels[sessionId];
      });
      setSelectedLevels(newSelectedLevels);
      // Clear any package-related errors
      if (errors.packages) {
        setErrors({ ...errors, packages: "" });
      }
    }
  };

  // Add session if not already selected and within max limit for the package
  const addSession = (packageId: string, sessionId: string) => {
    const packageData = findPackageById(packageId);
    if (!packageData) return;

    const maxSessions = packageData.max_selectable_sessions;
    const currentSessions = selectedSessions[packageId] || [];

    if (
      !currentSessions.includes(sessionId) &&
      currentSessions.length < maxSessions
    ) {
      setSelectedSessions({
        ...selectedSessions,
        [packageId]: [...currentSessions, sessionId],
      });

      // Clear error
      const newSessionErrors = { ...errors.sessions };
      delete newSessionErrors[packageId];
      setErrors({ ...errors, sessions: newSessionErrors });
    }
  };

  // Remove session (only for learner choice sessions)
  const removeSession = (packageId: string, sessionId: string) => {
    const packageData = findPackageById(packageId);
    if (!packageData) return;

    // Check if it's a pre-selected session
    const isPreSelected = packageData.pre_selected_session_dtos?.some(
      (session) => session.id === sessionId
    );

    if (!isPreSelected) {
      const newSessions = { ...selectedSessions };
      if (newSessions[packageId]) {
        newSessions[packageId] = newSessions[packageId].filter(
          (id) => id !== sessionId
        );
      }
      setSelectedSessions(newSessions);

      // Also remove any levels associated with this session
      const newLevels = { ...selectedLevels };
      delete newLevels[sessionId];
      setSelectedLevels(newLevels);
    }
  };

  // Add level if not already selected and within max limit for the session
  const addLevel = (sessionId: string, levelId: string) => {
    const sessionData = findSessionById(sessionId);
    if (!sessionData) return;

    const maxLevels = sessionData.max_selectable_levels;
    const currentLevels = selectedLevels[sessionId] || [];

    if (!currentLevels.includes(levelId) && currentLevels.length < maxLevels) {
      setSelectedLevels({
        ...selectedLevels,
        [sessionId]: [...currentLevels, levelId],
      });

      // Clear error
      const newLevelErrors = { ...errors.levels };
      delete newLevelErrors[sessionId];
      setErrors({ ...errors, levels: newLevelErrors });
    }
  };

  // Remove level (only for learner choice levels)
  const removeLevel = (sessionId: string, levelId: string) => {
    const sessionData = findSessionById(sessionId);
    if (!sessionData) return;

    // Check if it's a pre-selected level
    const isPreSelected = sessionData.pre_selected_levels?.some(
      (level) => level.id === levelId
    );

    if (!isPreSelected) {
      const newLevels = { ...selectedLevels };
      if (newLevels[sessionId]) {
        newLevels[sessionId] = newLevels[sessionId].filter(
          (id) => id !== levelId
        );
      }
      setSelectedLevels(newLevels);
    }
  };

  // Helper function to find package by ID
  const findPackageById = (packageId: string): Package | undefined => {
    if (!batchOptions) return undefined;

    const preSelected = batchOptions.pre_selected_packages.find(
      (pkg) => pkg.id === packageId
    );
    if (preSelected) return preSelected;

    return batchOptions.learner_choice_packages.find(
      (pkg) => pkg.id === packageId
    );
  };

  // Helper function to find session by ID
  const findSessionById = (sessionId: string): Session | null => {
    if (!batchOptions) return null;

    // Search in all packages
    for (const pkg of [
      ...batchOptions.pre_selected_packages,
      ...batchOptions.learner_choice_packages,
    ]) {
      // Check in pre-selected sessions
      if (pkg.pre_selected_session_dtos) {
        const session = pkg.pre_selected_session_dtos.find(
          (s) => s.id === sessionId
        );
        if (session) return session;
      }

      // Check in learner choice sessions
      if (pkg.learner_choice_sessions) {
        const session = pkg.learner_choice_sessions.find(
          (s) => s.id === sessionId
        );
        if (session) return session;
      }
    }
    return null;
  };

  // Helper function to get all sessions for a package
  const getAllSessionsForPackage = (packageId: string): string[] => {
    const pkg = findPackageById(packageId);
    if (!pkg) return [];

    const sessionIds: string[] = [];

    // Add pre-selected sessions
    if (pkg.pre_selected_session_dtos) {
      pkg.pre_selected_session_dtos.forEach((session) => {
        sessionIds.push(session.id);
      });
    }

    // Add learner choice sessions
    if (pkg.learner_choice_sessions) {
      pkg.learner_choice_sessions.forEach((session) => {
        sessionIds.push(session.id);
      });
    }

    return sessionIds;
  };

  // Helper function to get all available levels for a session
  const getAllLevelsForSession = (sessionId: string): Level[] => {
    const session = findSessionById(sessionId);
    if (!session) return [];

    const levels: Level[] = [];

    // Add pre-selected levels
    if (session.pre_selected_levels) {
      levels.push(...session.pre_selected_levels);
    }

    // Add learner choice levels
    if (session.learner_choice_levels) {
      levels.push(...session.learner_choice_levels);
    }

    return levels;
  };

  // Get learner choice packages that haven't been selected
  const getRemainingPackages = (): Package[] => {
    if (!batchOptions || !batchOptions.learner_choice_packages) return [];

    return batchOptions.learner_choice_packages.filter(
      (pkg) => !selectedPackages.includes(pkg.id)
    );
  };

  // Get learner choice sessions for a package that haven't been selected
  const getRemainingSessions = (packageId: string): Session[] => {
    const pkg = findPackageById(packageId);
    if (!pkg || !pkg.learner_choice_sessions) return [];

    const selectedSessionsForPackage = selectedSessions[packageId] || [];

    return pkg.learner_choice_sessions.filter(
      (session) => !selectedSessionsForPackage.includes(session.id)
    );
  };

  // Get learner choice levels for a session that haven't been selected
  const getRemainingLevels = (sessionId: string): Level[] => {
    const session = findSessionById(sessionId);
    if (!session || !session.learner_choice_levels) return [];

    const selectedLevelsForSession = selectedLevels[sessionId] || [];

    return session.learner_choice_levels.filter(
      (level) => !selectedLevelsForSession.includes(level.id)
    );
  };

  // Update personal info
  const updatePersonalInfo = (field: string, value: string) => {
    setPersonalInfo({ ...personalInfo, [field]: value });

    // Clear error when typing
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  // Update custom field value
  const updateCustomField = (fieldId: string, value: string) => {
    setCustomFieldValues({ ...customFieldValues, [fieldId]: value });

    // Clear error when typing
    const newCustomErrors = { ...errors.customFields };
    delete newCustomErrors[fieldId];
    setErrors({ ...errors, customFields: newCustomErrors });
  };

  // Handle next button click with validation
  const handleNext = () => {
    const newErrors = { ...errors };
    let hasError = false;

    // Validate packages
    if (selectedPackages.length === 0) {
      newErrors.packages = "Please select at least one package";
      hasError = true;
    }

    // Validate sessions for each selected package
    selectedPackages.forEach((packageId) => {
      const packageData = findPackageById(packageId);
      if (!packageData) return;

      const selectedSessionsForPackage = selectedSessions[packageId] || [];
      if (selectedSessionsForPackage.length === 0) {
        newErrors.sessions = {
          ...newErrors.sessions,
          [packageId]: "Please select at least one session for this package",
        };
        hasError = true;
      }
    });

    // Validate levels for each selected session
    Object.keys(selectedSessions).forEach((packageId) => {
      const sessions = selectedSessions[packageId] || [];

      sessions.forEach((sessionId) => {
        const sessionData = findSessionById(sessionId);
        if (!sessionData) return;

        const selectedLevelsForSession = selectedLevels[sessionId] || [];
        if (selectedLevelsForSession.length === 0) {
          newErrors.levels = {
            ...newErrors.levels,
            [sessionId]: "Please select at least one level for this session",
          };
          hasError = true;
        }
      });
    });

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setStep(2);
  };

  // Handle back button click
  const handleBack = () => {
    setStep(1);
  };

  // Handle confirm button click with validation
  const handleConfirm = async () => {
    const newErrors = { ...errors };
    let hasError = false;

    // Validate personal info
    if (!personalInfo.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      hasError = true;
    }

    try {
      emailSchema.parse(personalInfo.email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message;
        hasError = true;
      }
    }

    // Validation logic
    try {
      phoneSchema.parse(personalInfo.mobile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.mobile = error.errors[0].message;
        hasError = true;
      }
    }

    // Validate custom fields
    if (inviteData && inviteData.custom_fields) {
      inviteData.custom_fields.forEach((field) => {
        if (field.is_mandatory && !customFieldValues[field.id]) {
          newErrors.customFields = {
            ...newErrors.customFields,
            [field.id]: `${field.field_name} is required`,
          };
          hasError = true;
        }
      });
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Prepare data for submission
    const submissionData = {
      id: null,
      institute_id: inviteData?.institute_id,
      learner_invitation_id: inviteData?.id,
      status: "ACTIVE",
      full_name: personalInfo.fullName,
      email: personalInfo.email,
      contact_number: personalInfo.mobile,
      batch_options_json: inviteData?.batch_options_json,
      batch_selection_response_json: JSON.stringify(
        selectedPackages.map((packageId) => {
          const packageSessions = selectedSessions[packageId] || [];

          return {
            package_id: packageId,
            selected_sessions: packageSessions.map((sessionId) => {
              const sessionLevels = selectedLevels[sessionId] || [];

              return {
                session_id: sessionId,
                selected_levels: sessionLevels,
              };
            }),
          };
        })
      ),
      recorded_on: new Date().toISOString(),
      custom_fields_response: Object.keys(customFieldValues).map((fieldId) => ({
        custom_field_id: fieldId,
        id: null,
        value: customFieldValues[fieldId],
        field_name: null,
      })),
    };
    console.log("customFieldValues", customFieldValues);

    // Submit data
    setSubmitLoading(true);
    try {
      //   const response = await authenticatedAxiosInstance.post(
      //     `/admin-core-service/learner-invitation-response/confirm`,
      //     submissionData
      //   );
      const response = await authenticatedAxiosInstance.post(
        `${ENROLL_DETAILS_RESPONSE}`,
        submissionData
      );
      console.log("Enrollment response:", response.data);
      toast.success("Enrollment submitted successfully!");
    } catch (error) {
      console.error("Error submitting enrollment:", error);
      // if (error.response && error.response.data && error.response.data.ex) {
      //   toast.error(error.response.data.ex);
      // } else {
      //   toast.error("An unexpected error occurred. Please try again later.");
      // }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Function to render custom fields based on their type
  const renderCustomField = (field: CustomField) => {
    switch (field.field_type) {
      case "TEXT":
        return (
          <Input
            id={field.id}
            placeholder={field.description || `Enter ${field.field_name}`}
            value={customFieldValues[field.id] || ""}
            onChange={(e) => updateCustomField(field.id, e.target.value)}
            className={errors.customFields[field.id] ? "border-red-500" : ""}
          />
        );
      case "DROPDOWN":
        const options = field.comma_separated_options
          ? field.comma_separated_options.split(",")
          : [];
        return (
          <Select
            onValueChange={(value) => updateCustomField(field.id, value)}
            value={customFieldValues[field.id] || ""}
          >
            <SelectTrigger
              className={errors.customFields[field.id] ? "border-red-500" : ""}
            >
              <SelectValue placeholder={`Select ${field.field_name}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option, index) => (
                <SelectItem key={index} value={option.trim()}>
                  {option.trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            id={field.id}
            placeholder={field.description || `Enter ${field.field_name}`}
            value={customFieldValues[field.id] || ""}
            onChange={(e) => updateCustomField(field.id, e.target.value)}
            className={errors.customFields[field.id] ? "border-red-500" : ""}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <DashboardLoader />
      </div>
    );
  }
  console.log("inviteData", inviteData, batchOptions);
  if (!inviteData || !batchOptions) {
    return (
      <div className="flex items-center w-full justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 font-medium">
            Invalid or expired invite code.
          </p>
          <p className="mt-2 text-gray-500">
            Please contact the institute for a valid invite code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full bg-gray-50 p-4">
      <Card className="w-full max-w-md md:max-w-md lg:max-w-lg">
        <CardHeader className="text-center">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Institute Logo"
              className="h-12 w-12 rounded-full object-cover"
            />
          )}
          <CardTitle className="text-orange-500">
            {apiResponse?.institute_name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-6">
            You have been invited to enroll in:{" "}
            <span className="font-medium">{inviteData.name}</span>
          </p>

          {step === 1 ? (
            // Step 1: Package, Session, and Level Selection
            <div className="space-y-6">
              {/* Learner choice packages */}
              {batchOptions.learner_choice_packages &&
                batchOptions.learner_choice_packages.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="package">
                      Select Package
                      <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">
                        (Max{" "}
                        {batchOptions.max_selectable_packages -
                          batchOptions.pre_selected_packages.length}
                        )
                      </span>
                    </Label>
                    <Select
                      onValueChange={(value) => addPackage(value)}
                      disabled={
                        getRemainingPackages().length === 0 ||
                        selectedPackages.length >=
                          batchOptions.max_selectable_packages
                      }
                    >
                      <SelectTrigger
                        id="package"
                        className={errors.packages ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select Package" />
                      </SelectTrigger>
                      <SelectContent>
                        {getRemainingPackages().map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.packages && (
                      <p className="text-red-500 text-sm">{errors.packages}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedPackages.map((packageId) => {
                        const pkg = findPackageById(packageId);
                        if (!pkg) return null;

                        // Check if it's a learner choice package
                        const isLearnerChoice =
                          batchOptions.learner_choice_packages.some(
                            (p) => p.id === packageId
                          );

                        return (
                          <Badge
                            key={packageId}
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            {pkg.name}
                            {isLearnerChoice && (
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removePackage(packageId)}
                              />
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Session selection for each package */}
              {selectedPackages.length > 0 && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Select Sessions</h3>
                  </div>

                  {selectedPackages.map((packageId) => {
                    const pkg = findPackageById(packageId);
                    if (!pkg) return null;

                    return (
                      <div
                        key={packageId}
                        className="space-y-2 border p-3 rounded-md"
                      >
                        <Label className="font-medium">{pkg.name}</Label>

                        {/* Learner choice sessions */}
                        {pkg.learner_choice_sessions &&
                          pkg.learner_choice_sessions.length > 0 && (
                            <div className="space-y-2">
                              <Label
                                htmlFor={`session-${packageId}`}
                                className="text-sm"
                              >
                                Select Session
                                <span className="text-red-500">*</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  (Max{" "}
                                  {pkg.max_selectable_sessions -
                                    (pkg.pre_selected_session_dtos?.length ||
                                      0)}
                                  )
                                </span>
                              </Label>
                              <Select
                                onValueChange={(value) =>
                                  addSession(packageId, value)
                                }
                                disabled={
                                  getRemainingSessions(packageId).length ===
                                    0 ||
                                  (selectedSessions[packageId]?.length || 0) >=
                                    pkg.max_selectable_sessions
                                }
                              >
                                <SelectTrigger
                                  id={`session-${packageId}`}
                                  className={
                                    errors.sessions[packageId]
                                      ? "border-red-500"
                                      : ""
                                  }
                                >
                                  <SelectValue placeholder="Select Session" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getRemainingSessions(packageId).map(
                                    (session) => (
                                      <SelectItem
                                        key={session.id}
                                        value={session.id}
                                      >
                                        {session.name}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                              {errors.sessions[packageId] && (
                                <p className="text-red-500 text-sm">
                                  {errors.sessions[packageId]}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {(selectedSessions[packageId] || []).map(
                                  (sessionId) => {
                                    const session = findSessionById(sessionId);
                                    if (!session) return null;

                                    // Check if it's a learner choice session
                                    const isLearnerChoice =
                                      pkg.learner_choice_sessions?.some(
                                        (s) => s.id === sessionId
                                      );

                                    return (
                                      <Badge
                                        key={sessionId}
                                        variant="outline"
                                        className="flex items-center gap-1"
                                      >
                                        {session.name}
                                        {isLearnerChoice && (
                                          <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() =>
                                              removeSession(
                                                packageId,
                                                sessionId
                                              )
                                            }
                                          />
                                        )}
                                      </Badge>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Level selection for each session */}
              {Object.keys(selectedSessions).length > 0 && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Select Levels</h3>
                  </div>

                  {Object.keys(selectedSessions).flatMap((packageId) => {
                    return (selectedSessions[packageId] || []).map(
                      (sessionId) => {
                        const session = findSessionById(sessionId);
                        if (!session) return null;

                        return (
                          <div
                            key={sessionId}
                            className="space-y-2 border p-3 rounded-md"
                          >
                            <Label className="font-medium">
                              {session.name}
                            </Label>

                            {/* Learner choice levels */}
                            {session.learner_choice_levels &&
                              session.learner_choice_levels.length > 0 && (
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`level-${sessionId}`}
                                    className="text-sm"
                                  >
                                    Select Level
                                    <span className="text-red-500">*</span>
                                    <span className="text-xs text-gray-500 ml-2">
                                      (Max{" "}
                                      {session.max_selectable_levels -
                                        (session.pre_selected_levels?.length ||
                                          0)}
                                      )
                                    </span>
                                  </Label>
                                  <Select
                                    onValueChange={(value) =>
                                      addLevel(sessionId, value)
                                    }
                                    disabled={
                                      getRemainingLevels(sessionId).length ===
                                        0 ||
                                      (selectedLevels[sessionId]?.length ||
                                        0) >= session.max_selectable_levels
                                    }
                                  >
                                    <SelectTrigger
                                      id={`level-${sessionId}`}
                                      className={
                                        errors.levels[sessionId]
                                          ? "border-red-500"
                                          : ""
                                      }
                                    >
                                      <SelectValue placeholder="Select Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getRemainingLevels(sessionId).map(
                                        (level) => (
                                          <SelectItem
                                            key={level.id}
                                            value={level.id}
                                          >
                                            {level.name}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>
                                  {errors.levels[sessionId] && (
                                    <p className="text-red-500 text-sm">
                                      {errors.levels[sessionId]}
                                    </p>
                                  )}
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {(selectedLevels[sessionId] || []).map(
                                      (levelId) => {
                                        const level = getAllLevelsForSession(
                                          sessionId
                                        ).find((l) => l.id === levelId);
                                        if (!level) return null;

                                        // Check if it's a learner choice level
                                        const isLearnerChoice =
                                          session.learner_choice_levels?.some(
                                            (l) => l.id === levelId
                                          );

                                        return (
                                          <Badge
                                            key={levelId}
                                            variant="outline"
                                            className="flex items-center gap-1"
                                          >
                                            {level.name}
                                            {isLearnerChoice && (
                                              <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() =>
                                                  removeLevel(
                                                    sessionId,
                                                    levelId
                                                  )
                                                }
                                              />
                                            )}
                                          </Badge>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      }
                    );
                  })}
                </div>
              )}

              <div className="flex justify-center">
                <MyButton
                  type="submit"
                  scale="medium"
                  buttonType="primary"
                  layoutVariant="default"
                  onClick={handleNext}
                >
                  Next
                </MyButton>
              </div>
            </div>
          ) : (
            // Step 2: Personal Information
            <div className="space-y-6">
              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Personal Information</h3>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={personalInfo.fullName}
                  onChange={(e) =>
                    updatePersonalInfo("fullName", e.target.value)
                  }
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={personalInfo.email}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Mobile */}
              {/* <div className="space-y-2">
                <Label htmlFor="mobile">
                  Mobile <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobile"
                  placeholder="+91 XXX XXX XXX"
                  value={personalInfo.mobile}
                  onChange={(e) => updatePersonalInfo("mobile", e.target.value)}
                  className={errors.mobile ? "border-red-500" : ""}
                />
                <p className="text-xs text-gray-500">Format: +91 XXX XXX XXX</p>
                {errors.mobile && (
                  <p className="text-red-500 text-sm">{errors.mobile}</p>
                )}
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="mobile">
                  Mobile <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobile"
                  placeholder="10 digit mobile number"
                  value={personalInfo.mobile}
                  onChange={(e) => updatePersonalInfo("mobile", e.target.value)}
                  className={errors.mobile ? "border-red-500" : ""}
                />
                <p className="text-xs text-gray-500">Enter 10 digits only</p>
                {errors.mobile && (
                  <p className="text-red-500 text-sm">{errors.mobile}</p>
                )}
              </div>

              {/* Custom Fields */}
              {inviteData &&
                inviteData.custom_fields &&
                inviteData.custom_fields.length > 0 && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-2">
                        Additional Information
                      </h3>
                    </div>

                    {inviteData.custom_fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id}>
                          {field.field_name}
                          {field.is_mandatory && (
                            <span className="text-red-500">*</span>
                          )}
                        </Label>
                        {renderCustomField(field)}
                        {errors.customFields[field.id] && (
                          <p className="text-red-500 text-sm">
                            {errors.customFields[field.id]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              <div className="pt-4 flex justify-between">
                <MyButton
                  type="submit"
                  scale="medium"
                  buttonType="secondary"
                  layoutVariant="default"
                  onClick={handleBack}
                >
                  Back
                </MyButton>
                <MyButton
                  type="submit"
                  scale="medium"
                  buttonType="primary"
                  layoutVariant="default"
                  onClick={handleConfirm}
                  className="test-sm"
                  disabled={submitLoading}
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Enrollment"
                  )}{" "}
                </MyButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollByInvite;
