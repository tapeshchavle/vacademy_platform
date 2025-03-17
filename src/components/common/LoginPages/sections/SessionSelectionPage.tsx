import { useEffect, useState } from "react";
import { Preferences } from "@capacitor/preferences";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { DashboardLoader } from "@/components/core/dashboard-loader";

interface Session {
  id: string;
  level: { level_name: string };
  session: { session_name: string };
  package_dto: { package_name: string };
  status: string;
  start_time: string;
}

const SessionSelectionPage = () => {
  const [sessionList, setSessionList] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { redirect } = useSearch<any>({ from: "/SessionSelectionPage/" });

  useEffect(() => {
    fetchSessionList();
  }, []);

  useEffect(() => {
    if (sessionList.length === 1) {
      handleSessionSelect(sessionList[0]);
    }
  }, [sessionList]);

  const fetchSessionList = async () => {
    try {
      setLoading(true);
      const { value } = await Preferences.get({ key: "sessionList" });

      if (!value) {
        toast.error("No sessions found");
        setSessionList([]);
        return;
      }

      const sessions = JSON.parse(value) as Session[];
      setSessionList(sessions);
    } catch (error) {
      toast.error("Failed to load sessions.");
      console.error("Error fetching sessions:", error);
      setSessionList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionSelect = async (selectedSession: Session) => {
    try {
      // Fetch stored student details
      const studentData = await Preferences.get({ key: "students" });

      if (!studentData.value) {
        throw new Error("No student data found!");
      }

      const studentList = JSON.parse(studentData.value);

      // Find the student where package_session_id matches the selected session id
      const selectedStudent = studentList.find(
        (student: any) => student.package_session_id === selectedSession.id
      );

      if (!selectedStudent) {
        throw new Error("No matching student found for selected session!");
      }

      // Store the selected student in the new storage key "student"
      await Preferences.set({
        key: "StudentDetails",
        value: JSON.stringify(selectedStudent),
      });

      console.log("Stored selected student:", selectedStudent);

      // Cleanup: Remove previous studentData & sessionList from storage
      await Preferences.remove({ key: "studentData" });
      await Preferences.remove({ key: "sessionList" });
      await Preferences.remove({ key: "students" });

      // Navigate to Dashboard after selection
      navigate({ to: redirect });
    } catch (error) {
      toast.error("Failed to select session. Please try again.");
      console.error("Error selecting session:", error);
      setSelectedId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <DashboardLoader />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl text-primary-500 font-bold mb-6">
        Select Your Course
      </h2>

      {sessionList.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">
            You are not currently enrolled in any courses.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {sessionList.map((session) => (
            <Card
              key={session.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedId === session.id
                  ? "border-2 border-primary"
                  : "hover:border-gray-300"
              }`}
              onClick={() => handleSessionSelect(session)}
            >
              <CardHeader>
                <h3 className="text-xl font-semibold">
                  {session.package_dto.package_name}
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Session:</span>{" "}
                    {session.session.session_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium"></span>{" "}
                    {session.level.level_name}{" "}
                    <span className="font-medium">Year/Class</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionSelectionPage;
