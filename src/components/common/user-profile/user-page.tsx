"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Preferences } from "@capacitor/preferences";
import {
  X,
  Trophy,
  Coins,
  GraduationCap,
  Phone,
  MapPin,
  Users,
  PencilSimple,
} from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Student } from "@/types/user/user-detail";
import { MyButton } from "@/components/design-system/button";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch student data from Preferences
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        console.log("Fetching student data from Preferences...");
        const { value } = await Preferences.get({ key: "StudentDetails" });
        console.log("Raw student details from Preferences:", value);

        if (!value) {
          console.log("No data found in Preferences with key 'StudentDetails'");
          setIsLoading(false);
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
              setIsLoading(false);
              return;
            }
            studentDetails = parsedData[0];
          } else if (typeof parsedData === "object" && parsedData !== null) {
            studentDetails = parsedData;
          } else {
            console.error("Unexpected data format:", parsedData);
            setIsLoading(false);
            return;
          }

          // Add mock data for fields shown in the image but not in your data structure
          const enhancedStudentData = {
            ...studentDetails,
            course:
              studentDetails.linked_institute_name || "Premium Pro Group 1",
            session: "2025-2026",
            level: "10th Standard",
            school: "St. Joseph's School",
            session_expiry_days: studentDetails.session_expiry_days || "125",
          };

          console.log("Enhanced student details:", enhancedStudentData);
          setStudentData(enhancedStudentData);
        } catch (parseError) {
          console.error("Error parsing JSON from Preferences:", parseError);
        }
      } catch (error) {
        console.error("Error fetching student data from Preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  const handleEditProfile = () => {
    navigate({ to: "/user-profile/edit" });
  };

  const handleClose = () => {
    navigate({ to: "/dashboard" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen max-w-4xl mx-auto shadow-sm">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b">
        <h1 className="text-lg font-medium text-orange-500">Profile Details</h1>
        <button onClick={handleClose} className="text-gray-500">
          <X size={20} weight="bold" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="p-6 flex flex-col items-center md:flex-row md:items-start md:gap-6">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-3 md:mb-0">
          <img
            src={
              studentData?.face_file_id || "/placeholder.svg?height=96&width=96"
            }
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-xl font-medium mb-2">
            {studentData?.full_name || "Student Name"}
          </h2>
          <p className="text-sm text-gray-500">{studentData?.username}</p>
        </div>
      </div>
      <Separator className="my-4" />

      {/* Badges */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Badges</span>
          <span className="text-sm font-medium">2</span>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 mb-4">
          <div className="bg-orange-50 rounded-lg p-3 flex flex-col items-center">
            <Trophy className="text-orange-500 mb-1" size={24} weight="fill" />
            <span className="text-xs text-gray-600 text-center">
              Elite Scholar
            </span>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 flex flex-col items-center">
            <Trophy className="text-orange-500 mb-1" size={24} weight="fill" />
            <span className="text-xs text-gray-600 text-center">
              Curious Learner
            </span>
          </div>
        </div>
      </div>
      <Separator className="my-4" />

      {/* Coins */}
      <div className="p-6">
        <div className="flex items-center mb-3">
          <span className="text-sm font-medium">Coins</span>
          <div className="ml-auto flex items-center">
            <span className="text-sm font-medium mr-2">350</span>
            <div className="bg-yellow-100 p-1 rounded">
              <Coins className="text-yellow-500" size={16} weight="fill" />
            </div>
          </div>
        </div>
      </div>
      <Separator className="my-4" />

      {/* Session Expiry */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Session Expiry (Days)</span>
          <span className="text-sm font-medium">
            {studentData?.session_expiry_days || "125"}
          </span>
        </div>
        <Progress
          value={Number.parseInt(studentData?.session_expiry_days || "125") / 2}
          className="h-2 bg-gray-200 bg-green-500"
        />
      </div>
      <Separator className="my-4" />

      {/* General Details */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={18} weight="bold" className="text-gray-500" />
          <h3 className="text-sm font-medium">General Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Course:</span>
            <span className="text-xs">{studentData?.course || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Session:</span>
            <span className="text-xs">{studentData?.session || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Level:</span>
            <span className="text-xs">{studentData?.level || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Enrollment No.:</span>
            <span className="text-xs">
              {studentData?.institute_enrollment_id || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Gender:</span>
            <span className="text-xs">{studentData?.gender || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">School:</span>
            <span className="text-xs">{studentData?.school || "N/A"}</span>
          </div>
        </div>
      </div>
      <Separator className="my-4" />

      {/* Contact Information */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Phone size={18} weight="bold" className="text-gray-500" />
          <h3 className="text-sm font-medium">Contact Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Mobile No.:</span>
            <span className="text-xs">
              {studentData?.mobile_number || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Email ID:</span>
            <span className="text-xs">{studentData?.email || "N/A"}</span>
          </div>
        </div>
      </div>
      <Separator className="my-4" />

      {/* Location Details */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={18} weight="bold" className="text-gray-500" />
          <h3 className="text-sm font-medium">Location Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Address Line 1:</span>
            <span className="text-xs">
              {studentData?.address_line || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">City/Village:</span>
            <span className="text-xs">{studentData?.city || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">State:</span>
            <span className="text-xs">{studentData?.region || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">Pincode:</span>
            <span className="text-xs">{studentData?.pin_code || "N/A"}</span>
          </div>
        </div>
      </div>
      <Separator className="my-4" />

      {/* Parent/Guardian's Details */}
      <div className="p-6 gap-4 sm:gap-2">
        <div className="flex items-center gap-2 mb-3">
          <Users size={18} weight="bold" className="text-gray-500" />
          <h3 className="text-sm font-medium">Parent/Guardian's Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">
            Father/Male Guardian's Name:
          </span>
          <span className="text-xs">{studentData?.father_name || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">
            Mother/Female Guardian's Name:
          </span>
          <span className="text-xs">{studentData?.mother_name || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">
            Parent/Guardian's Email:
          </span>
          <span className="text-xs">{studentData?.parents_email || "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500">
            Parent/Guardian's Mobile Number:
          </span>
          <span className="text-xs">
            {studentData?.parents_mobile_number || "N/A"}
          </span>
        </div>
      </div>
    {/* </div> */}

      {/* Edit Profile Button */}
      <div className="p-4 border-t flex justify-center pt-6">
      <MyButton
        type="submit"
        scale="large"
        buttonType="secondary"
        layoutVariant="default"
        onClick={handleEditProfile}
      >
        <PencilSimple size={16} className="mr-2" weight="bold" />
        Edit Profile
      </MyButton>
      </div>
    </div>
  );
}
