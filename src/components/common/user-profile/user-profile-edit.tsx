"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  User,
  Phone,
  EnvelopeSimple,
  MapPin,
  Buildings,
  Users,
  GraduationCap,
} from "@phosphor-icons/react";
import { STUDENT_DETAIL_EDIT } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { useNavigate } from "@tanstack/react-router";
import { Preferences } from "@capacitor/preferences";
import { MyButton } from "@/components/design-system/button";
import { Loader2 } from "lucide-react";
import { Student } from "@/types/user/user-detail";

// Define the update request body interface
interface UpdateStudentRequest {
  user_id: string;
  email: string;
  full_name: string;
  contact_number: string;
  gender: string;
  address_line: string;
  city: string;
  state: string;
  pin_code: string;
  institute_name: string;
  father_name: string;
  mother_name: string;
  parents_mobile_number: string;
  parents_email: string;
}

export default function EditProfile() {
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [formData, setFormData] = useState<UpdateStudentRequest>({
    user_id: "",
    email: "",
    full_name: "",
    contact_number: "",
    gender: "",
    address_line: "",
    city: "",
    state: "",
    pin_code: "",
    institute_name: "",
    father_name: "",
    mother_name: "",
    parents_mobile_number: "",
    parents_email: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  // const [submitLoading, setSubmitLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch student data from Preferences
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsFetching(true);
        console.log("Fetching student data from Preferences...");

        const { value } = await Preferences.get({ key: "StudentDetails" });
        console.log("Raw student details from Preferences:", value);

        if (!value) {
          console.log("No data found in Preferences with key 'StudentDetails'");
          setIsFetching(false);
          return;
        }

        try {
          // Parse the JSON data
          const parsedData = JSON.parse(value);
          console.log("Parsed student details:", parsedData);

          // Handle both array and object formats
          let studentDetails: Student;

          if (Array.isArray(parsedData)) {
            if (parsedData.length === 0) {
              console.log("Student details array is empty");
              setIsFetching(false);
              return;
            }
            studentDetails = parsedData[0];
          } else if (typeof parsedData === "object" && parsedData !== null) {
            studentDetails = parsedData;
          } else {
            console.error("Unexpected data format:", parsedData);
            setIsFetching(false);
            return;
          }

          console.log("Student details to use:", studentDetails);
          setStudentData(studentDetails);

          // Pre-fill the form with student data
          setFormData({
            user_id: studentDetails.user_id || "",
            email: studentDetails.email || "",
            full_name: studentDetails.full_name || "",
            contact_number: studentDetails.mobile_number || "",
            gender: studentDetails.gender || "",
            address_line: studentDetails.address_line || "",
            city: studentDetails.city || "",
            state: studentDetails.region || "",
            pin_code: studentDetails.pin_code || "",
            institute_name: studentDetails.linked_institute_name || "",
            father_name: studentDetails.father_name || "",
            mother_name: studentDetails.mother_name || "",
            parents_mobile_number: studentDetails.parents_mobile_number || "",
            parents_email: studentDetails.parents_email || "",
          });

          console.log("Form data pre-filled:", formData);
        } catch (parseError) {
          console.error("Error parsing JSON from Preferences:", parseError);
        }
      } catch (error) {
        console.error("Error fetching student data from Preferences:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchStudentData();
  }, []);

  const handleChange = (field: keyof UpdateStudentRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Submitting form data:", formData);

      const response = await authenticatedAxiosInstance.put(
        `${STUDENT_DETAIL_EDIT}`,
        formData
      );

      console.log("API response:", response.data);

      // Update the stored data in Preferences
      if (studentData) {
        const updatedStudentData = {
          ...studentData,
          user_id: formData.user_id,
          email: formData.email,
          full_name: formData.full_name,
          mobile_number: formData.contact_number,
          gender: formData.gender,
          address_line: formData.address_line,
          city: formData.city,
          region: formData.state,
          pin_code: formData.pin_code,
          linked_institute_name: formData.institute_name,
          father_name: formData.father_name,
          mother_name: formData.mother_name,
          parents_mobile_number: formData.parents_mobile_number,
          parents_email: formData.parents_email,
        };

        // Get the current stored data
        const { value } = await Preferences.get({ key: "StudentDetails" });

        if (value) {
          try {
            const parsedData = JSON.parse(value);

            // Update the data based on its format
            if (Array.isArray(parsedData)) {
              parsedData[0] = updatedStudentData;
              await Preferences.set({
                key: "StudentDetails",
                value: JSON.stringify(parsedData),
              });
            } else {
              await Preferences.set({
                key: "StudentDetails",
                value: JSON.stringify(updatedStudentData),
              });
            }

            console.log("Updated student data in Preferences");
          } catch (error) {
            console.error("Error updating data in Preferences:", error);
          }
        }
      }

      // Redirect back to profile page after successful update
      navigate({ to: "/user-profile" });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate({ to: "/user-profile" });
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg w-full max-w-md mx-auto shadow-lg sm:max-w-md md:max-w-lg lg:max-w-xl">
      <div className=" flex items-center justify-between border-b">
        <h2 className="text-lg font-medium">Edit Profile</h2>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Profile Image */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img
              src={
                studentData?.face_file_id ||
                "/placeholder.svg?height=80&width=80" ||
                "/placeholder.svg"
              }
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>
        </div>

        {/* General Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <User size={18} weight="bold" />
            <h3>General Details</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-xs">
              Full Name*
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder="Enter your full name"
              required
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-xs">
              Gender*
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleChange("gender", value)}
            >
              <SelectTrigger className="h-10 text-sm">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="institute_name" className="text-xs">
              College/School Name
            </Label>
            <div className="relative">
              <Input
                id="institute_name"
                value={formData.institute_name}
                onChange={(e) => handleChange("institute_name", e.target.value)}
                placeholder="Enter college/school name"
                className="h-10 text-sm pl-9"
              />
              <GraduationCap
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Phone size={18} weight="bold" />
            <h3>Contact Information</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_number" className="text-xs">
              Mobile Number*
            </Label>
            <div className="flex">
              <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500 text-sm">
                +91
              </div>
              <Input
                id="contact_number"
                value={formData.contact_number}
                onChange={(e) => handleChange("contact_number", e.target.value)}
                placeholder="Enter mobile number"
                className="rounded-l-none h-10 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs">
              Email*
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                required
                className="h-10 text-sm pl-9"
              />
              <EnvelopeSimple
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <MapPin size={18} weight="bold" />
            <h3>Location Details</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address_line" className="text-xs">
              Address Line 1
            </Label>
            <div className="relative">
              <Input
                id="address_line"
                value={formData.address_line}
                onChange={(e) => handleChange("address_line", e.target.value)}
                placeholder="Enter address"
                className="h-10 text-sm pl-9"
              />
              <Buildings
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-xs">
                City/Village
              </Label>
              <Input
                id="city"
                value={formData?.city || ""}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Enter city/village"
                className="h-10 text-sm"
                // disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-xs">
                State
              </Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                placeholder="Enter state"
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin_code" className="text-xs">
              Pincode
            </Label>
            <Input
              id="pin_code"
              value={formData.pin_code}
              onChange={(e) => handleChange("pin_code", e.target.value)}
              placeholder="Enter pincode"
              className="h-10 text-sm"
            />
          </div>
        </div>

        {/* Parent/Guardian's Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Users size={18} weight="bold" />
            <h3>Parent/Guardian's Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="father_name" className="text-xs">
                Father/Male Guardian's Name
              </Label>
              <Input
                id="father_name"
                value={formData.father_name}
                onChange={(e) => handleChange("father_name", e.target.value)}
                placeholder="Enter father's name"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mother_name" className="text-xs">
                Mother/Female Guardian's Name
              </Label>
              <Input
                id="mother_name"
                value={formData.mother_name}
                onChange={(e) => handleChange("mother_name", e.target.value)}
                placeholder="Enter mother's name"
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parents_email" className="text-xs">
              Parent/Guardian's Email
            </Label>
            <div className="relative">
              <Input
                id="parents_email"
                type="email"
                value={formData.parents_email}
                onChange={(e) => handleChange("parents_email", e.target.value)}
                placeholder="Enter parent's email"
                className="h-10 text-sm pl-9"
              />
              <EnvelopeSimple
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parents_mobile_number" className="text-xs">
              Parent/Guardian's Mobile Number
            </Label>
            <div className="flex">
              <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-gray-500 text-sm">
                +91
              </div>
              <Input
                id="parents_mobile_number"
                value={formData.parents_mobile_number}
                onChange={(e) =>
                  handleChange("parents_mobile_number", e.target.value)
                }
                placeholder="Enter parent's mobile number"
                className="rounded-l-none h-10 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-between">
          <MyButton
            type="submit"
            scale="medium"
            buttonType="secondary"
            layoutVariant="default"
            onClick={handleCancel}
          >
            Back
          </MyButton>
          <MyButton
            type="submit"
            scale="medium"
            buttonType="primary"
            layoutVariant="default"
            // onClick={handleConfirm}
            className="test-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}{" "}
          </MyButton>
        </div>
      </form>
    </div>
  );
}
