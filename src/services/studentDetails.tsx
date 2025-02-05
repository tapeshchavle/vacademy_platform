// import { useMutation } from '@tanstack/react-query';
// import { Storage } from '@capacitor/storage';

// // Type definitions
// interface StudentDetails {
//   id: string;
//   name: string;
//   // Add other student properties as needed
// }

// interface FetchStudentParams {
//   userId: string;
//   instituteId: string;
// }

// // Function to fetch student details from API
// const fetchStudentDetailsFromAPI = async ({ userId, instituteId }: FetchStudentParams) => {
//   const response = await fetch(`https://backend-stage.vacademy.io/admin-core-service/learner/info/v1/details${userId}&instituteId=${instituteId}`);
//   if (!response.ok) {
//     throw new Error('Failed to fetch student details');
//   }
//   return response.json();
// };

// // Custom hook to fetch and store student details
// export const useFetchStudentDetails = () => {
//   const mutation = useMutation({
//     mutationFn: fetchStudentDetailsFromAPI,
//     onSuccess: async (data: StudentDetails) => {
//       try {
//         // Store the fetched data in Capacitor Storage
//         await Storage.set({
//           key: `student-${data.id}`,
//           value: JSON.stringify(data)
//         });
        
//         console.log('Student details stored successfully');
//       } catch (error) {
//         console.error('Error storing student details:', error);
//       }
//     },
//     onError: (error) => {
//       console.error('Error fetching student details:', error);
//     }
//   });

//   // Function to retrieve stored student details
//   const getStoredStudentDetails = async (studentId: string): Promise<StudentDetails | null> => {
//     try {
//       const { value } = await Storage.get({ key: `student-${studentId}` });
//       return value ? JSON.parse(value) : null;
//     } catch (error) {
//       console.error('Error retrieving stored student details:', error);
//       return null;
//     }
//   };

//   return {
//     fetchAndStoreStudentDetails: mutation.mutate,
//     getStoredStudentDetails,
//     isLoading: mutation.isPending,
//     error: mutation.error,
//     data: mutation.data
//   };
// };






import { Preferences } from "@capacitor/preferences";
import { toast } from "sonner"; // Assuming you're using sonner for toasts
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { STUDENT_DETAIL } from "@/constants/urls";

interface StudentDetails {
  id: string;
  username: string;
  user_id: string;
  email: string;
  full_name: string;
  address_line: string;
  region: string | null;
  city: string;
  pin_code: string | null;
  mobile_number: string;
  date_of_birth: string | null;
  gender: "MALE" | "FEMALE" | "OTHER";
  father_name: string;
  mother_name: string;
  parents_mobile_number: string;
  parents_email: string;
  linked_institute_name: string;
  package_session_id: string;
  institute_enrollment_id: string;
  status: "ACTIVE" | "INACTIVE";
  session_expiry_days: number | null;
  institute_id: string;
  face_file_id: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export const fetchAndStoreStudentDetails = async (
  instituteId: string,
  userId: string
): Promise<StudentDetails | null> => {
  try {
    // Call API to get student details
    const studentDetailsResponse = await authenticatedAxiosInstance({
      method: "GET",
      url: STUDENT_DETAIL,
      params: {
        instituteId,
        userId,
      },
    });

    // Ensure response data is valid
    if (!studentDetailsResponse?.data) {
      throw new Error("Invalid response data");
    }

    const studentDetails: StudentDetails = studentDetailsResponse.data;

    // Store student details in Capacitor Preferences
    await Preferences.set({
      key: "StudentDetails",
      value: JSON.stringify(studentDetails), // Convert object to string before storing
    });

    return studentDetails;
  } catch (error) {
    console.error("Failed to fetch student details:", error);
    toast.error("Failed to fetch student details. Please try again.");
    return null;
  }
};

// Helper function to retrieve stored student details
export const getStoredStudentDetails = async (): Promise<StudentDetails | null> => {
  try {
    const { value } = await Preferences.get({ key: "StudentDetails" });

    if (!value) return null;

    return JSON.parse(value) as StudentDetails;
  } catch (error) {
    console.error("Error parsing stored student details:", error);
    return null;
  }
};