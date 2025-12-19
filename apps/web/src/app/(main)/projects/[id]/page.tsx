"use client";

import Link from "next/link";
import { ArrowLeft, Ship, Calendar, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/charts/circular-progress";
import { HorizontalBarChart } from "@/components/charts/horizontal-bar-chart";
import { GroupedBarChart } from "@/components/charts/grouped-bar-chart";
import { SystemProgressList } from "@/components/charts/system-progress-list";
import { mockProjectAsset } from "./mock-data";

export default function ProjectDetailPage() {
  const data = mockProjectAsset;

  // Prepare checklist status data for horizontal bar chart
  const checklistStatusData = [
    { name: "Remaining", value: data.checklistStatus.remaining, color: "hsl(221, 83%, 53%)" },
    { name: "Closed", value: data.checklistStatus.closed, color: "hsl(142, 76%, 36%)" },
    { name: "Non-Conforming", value: data.checklistStatus.nonConforming, color: "hsl(0, 84%, 60%)" },
    { name: "Not Applicable", value: data.checklistStatus.notApplicable, color: "hsl(var(--muted-foreground))" },
    { name: "Deferred", value: data.checklistStatus.deferred, color: "hsl(48, 96%, 53%)" },
  ];

  // Prepare action item status by priority data
  const actionItemsByPriority = [
    {
      name: "High",
      open: data.actionItemStatus.highOpen,
      closed: data.actionItemStatus.highClosed,
    },
    {
      name: "Medium",
      open: data.actionItemStatus.mediumOpen,
      closed: data.actionItemStatus.mediumClosed,
    },
    {
      name: "Low",
      open: data.actionItemStatus.lowOpen,
      closed: data.actionItemStatus.lowClosed,
    },
  ];

  // Prepare action items by milestone data
  const actionItemsByMilestone = data.actionItemsByMilestone.map((item) => ({
    name: item.milestone,
    open: item.open,
    closed: item.closed,
  }));

  // Status dot color helper
  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-500";
      case "Completed":
        return "bg-green-500";
      case "Cancelled":
        return "bg-red-500";
      case "Closeable":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{data.projectName}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Ship className="h-4 w-4" />
              <span>
                {data.assetName}
                {data.assetType && <span className="text-muted-foreground/70"> • {data.assetType}</span>}
              </span>
            </div>
            {data.projectStatus && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>{data.projectStatus}</span>
                <span className={`h-2 w-2 rounded-full ${getStatusDotColor(data.projectStatus)}`} />
              </div>
            )}
            {(data.projectStartDate || data.projectEndDate) && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {data.projectStartDate
                    ? new Date(data.projectStartDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "?"}
                  {" - "}
                  {data.projectEndDate
                    ? new Date(data.projectEndDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "?"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 1: Four Circular Progress Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <CircularProgress value={data.overallReadiness} label="Overall Readiness" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <CircularProgress value={data.raptorChecklistCompletion} label="RAPTOR Checklist" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <CircularProgress value={data.sitCompletion} label="SIT Completion" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <CircularProgress value={data.docVerificationCompletion} label="Doc Verification" />
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Three Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Checklist Item Status by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={checklistStatusData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Action Item Status by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={actionItemsByPriority}
              bars={[
                { key: "open", color: "hsl(25, 95%, 53%)", label: "Open" },
                { key: "closed", color: "hsl(142, 76%, 36%)", label: "Closed" },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Action Item Completion Requirement by Milestone Target</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupedBarChart
              data={actionItemsByMilestone}
              bars={[
                { key: "open", color: "hsl(25, 95%, 53%)", label: "Open" },
                { key: "closed", color: "hsl(142, 76%, 36%)", label: "Closed" },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Three System Progress Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documentation Verification Progress Per System</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemProgressList
              title="Doc Verification"
              items={data.systemProgress.docVerification}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Checklist Progress Per System</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemProgressList
              title="Checklist"
              items={data.systemProgress.checklist}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SIT Progress Per System</CardTitle>
          </CardHeader>
          <CardContent>
            <SystemProgressList
              title="SIT"
              items={data.systemProgress.sit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
