import { UPDATE_ROLE } from '@/constants/urls';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { removeTokensAndLogout } from '@/lib/auth/sessionUtility';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react';
import { Preferences } from "@capacitor/preferences";
import { toast } from 'sonner';


export const Route = createFileRoute('/delete-user/')({
  component: RouteComponent,
})

// function RouteComponent() {
//   const navigate = useNavigate();
  
//     useEffect(() => {
//       removeTokensAndLogout();
//       navigate({
//         to: "/login",
//       });
//     }, []);
//   return <div>Deleting Account ....</div>
// }



function RouteComponent() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const updateUserRoleStatus = async () => {
      try {
        const studentDetailsString = await Preferences.get({ key: 'StudentDetails' });
        const instituteDetailsString = await Preferences.get({ key: 'InstituteDetails' });
        
        // Parse the JSON strings to objects
        const studentDetails = studentDetailsString.value ? JSON.parse(studentDetailsString.value) : {};
        const institute = instituteDetailsString.value ? JSON.parse(instituteDetailsString.value) : {};
        console.log("studentDetails",studentDetails,"instituteDetails", institute);
        console.log("studentDetails.user_id",studentDetails.user_id,"instituteDetails.id", institute.id);        
        // Extract specific IDs
        const studentId = studentDetails.user_id;

        const response = await authenticatedAxiosInstance.put(
          `${UPDATE_ROLE}`,
          [studentId],
          {
            params: {
              instituteId: institute.id, 
              status: "DELETED"
            }
          }
        );
        
        // After successful API call, proceed with logout
        removeTokensAndLogout();
        if (response.status === 200) {
          navigate({
            to: "/login",
          });
        toast.success("User role status updated successfully");
        } else {
          // Show toast notification for failure
          console.error("Failed to update user role status");
          toast.error("Failed to update user role status");}
      } catch {
        // Still attempt to logout even if the API call fails
        removeTokensAndLogout();
        navigate({
          to: "/login",
        });
        toast.error("Failed to update user role status");
      }
    };
    updateUserRoleStatus();
  }, []);
  
  return <div>Deleting Account ....</div>;
}