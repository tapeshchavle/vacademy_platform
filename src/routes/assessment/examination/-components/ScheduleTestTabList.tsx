import { Badge } from "@/components/ui/badge";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { assessmentTypes } from "@/types/assessment";

const ScheduleTestTabList = ({
  selectedTab,
  totalAssessments,
}: {
  selectedTab: string;
  totalAssessments: number;
}) => {
  return (
    <TabsList className="inline-flex h-auto justify-start gap-4 rounded-none border-b !bg-transparent p-0">
      <TabsTrigger
        value={assessmentTypes.LIVE}
        className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
          selectedTab === assessmentTypes.LIVE
            ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
            : "border-none bg-transparent"
        }`}
      >
        <span
          className={`${selectedTab === assessmentTypes.LIVE ? "text-primary-500" : ""}`}
        >
          Live
        </span>
        <Badge
          className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
          variant="outline"
        >
          {totalAssessments}
        </Badge>
      </TabsTrigger>
      <TabsTrigger
        value={assessmentTypes.UPCOMING}
        className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
          selectedTab === assessmentTypes.UPCOMING
            ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
            : "border-none bg-transparent"
        }`}
      >
        <span
          className={`${selectedTab === assessmentTypes.UPCOMING ? "text-primary-500" : ""}`}
        >
          Upcoming
        </span>
        <Badge
          className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
          variant="outline"
        >
          {totalAssessments}
        </Badge>
      </TabsTrigger>
      <TabsTrigger
        value={assessmentTypes.PAST}
        className={`flex gap-1.5 rounded-none px-12 py-2 !shadow-none ${
          selectedTab === assessmentTypes.PAST
            ? "rounded-t-sm border !border-b-0 border-primary-200 !bg-primary-50"
            : "border-none bg-transparent"
        }`}
      >
        <span
          className={`${selectedTab === assessmentTypes.PAST ? "text-primary-500" : ""}`}
        >
          Past
        </span>
        <Badge
          className="rounded-[10px] bg-primary-500 p-0 px-2 text-[9px] text-white"
          variant="outline"
        >
          {totalAssessments}
        </Badge>
      </TabsTrigger>
    </TabsList>
  );
};

export default ScheduleTestTabList;
