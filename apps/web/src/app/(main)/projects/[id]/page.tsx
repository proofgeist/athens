"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Ship, Calendar, Briefcase, ChevronDown, CheckSquare, ListTodo } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CategoryProgressBar } from "@/components/charts/category-progress-bar";
import { HorizontalBarChart } from "@/components/charts/horizontal-bar-chart";
import { HorizontalGroupedBarChart } from "@/components/charts/horizontal-grouped-bar-chart";
import { SystemProgressMatrix, SystemProgressFilter } from "@/components/charts/system-progress-matrix";
import { IssuesTable, type Issue } from "@/components/issues/issues-table";
import { IssueDetailModal } from "@/components/issues/issue-detail-modal";
import Loader from "@/components/loader";
import { orpc } from "@/utils/orpc";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectAssetId = params?.id as string;
  const [raptorOpen, setRaptorOpen] = useState(true);
  const [actionItemsOpen, setActionItemsOpen] = useState(true);
  const [hideHealthySystems, setHideHealthySystems] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  const { data: projectAsset, isLoading, error } = useQuery({
    ...orpc.projectAssets.getDetailById.queryOptions({ input: { id: projectAssetId } }),
    enabled: !!projectAssetId,
  });

  const { data: issuesData } = useQuery({
    ...orpc.issues.listByProjectAsset.queryOptions({
      input: { projectAssetId },
    }),
    enabled: !!projectAssetId,
  });

  const { data: issuesSummary } = useQuery({
    ...orpc.issues.getSummary.queryOptions({
      input: { projectAssetId },
    }),
    enabled: !!projectAssetId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-6">
        <Loader />
      </div>
    );
  }

  if (error || !projectAsset) {
    return (
      <div className="container mx-auto px-6 py-6">
        <div className="text-center text-muted-foreground">
          <p>Project asset not found</p>
          <Link href="/projects" className="text-primary hover:underline mt-4 inline-block">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const data = projectAsset;

  // Prepare checklist status data for horizontal bar chart
  const checklistStatusData = [
    { name: "Remaining", value: data.checklist_remaining ?? 0, color: "hsl(221, 83%, 53%)" },
    { name: "Closed", value: data.checklist_closed ?? 0, color: "hsl(142, 76%, 36%)" },
    { name: "Non-Conforming", value: data.checklist_non_conforming ?? 0, color: "hsl(0, 84%, 60%)" },
    { name: "Not Applicable", value: data.checklist_not_applicable ?? 0, color: "hsl(var(--muted-foreground))" },
    { name: "Deferred", value: data.checklist_deferred ?? 0, color: "hsl(48, 96%, 53%)" },
  ];

  // Prepare action item status by priority data from issues summary
  const actionItemsByPriority = issuesSummary
    ? [
        {
          name: "High",
          new: issuesSummary.high_new,
          assigned: issuesSummary.high_assigned,
          resolved: issuesSummary.high_resolved,
          closed: issuesSummary.high_closed,
        },
        {
          name: "Medium",
          new: issuesSummary.medium_new,
          assigned: issuesSummary.medium_assigned,
          resolved: issuesSummary.medium_resolved,
          closed: issuesSummary.medium_closed,
        },
        {
          name: "Low",
          new: issuesSummary.low_new,
          assigned: issuesSummary.low_assigned,
          resolved: issuesSummary.low_resolved,
          closed: issuesSummary.low_closed,
        },
      ]
    : [];

  const handleRowClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIssueModalOpen(true);
  };


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
      {/* Back Link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Hero Card with Overall Progress Bar */}
      <Card className="relative overflow-hidden">
        <CardContent className="py-4 px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            {/* Header Section */}
            <div className="flex-1 space-y-3">
              <h1 className="text-3xl font-bold leading-tight">{data.projectName || "Project Details"}</h1>
              
              {/* Info Group - Horizontal Layout */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {data.assetName && (
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {data.assetName}
                      {data.assetType && <span className="text-muted-foreground/70"> • {data.assetType}</span>}
                    </span>
                  </div>
                )}
                {data.projectStatus && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 flex-shrink-0" />
                    <span>{data.projectStatus}</span>
                    <span className={`h-2 w-2 rounded-full ${getStatusDotColor(data.projectStatus)}`} />
                  </div>
                )}
                {(data.projectStartDate || data.projectEndDate) && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
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

            {/* Overall Progress Bar */}
            <div className="flex-shrink-0 w-full md:w-96">
              {(() => {
                const overallValue = data.overall_completion ?? 0;
                const percentageValue = overallValue <= 1 ? overallValue * 100 : overallValue;
                const percentage = Math.round(percentageValue);
                
                // Color logic matching CategoryProgressBar
                let colorClass = "bg-muted";
                if (percentage >= 90) {
                  colorClass = "bg-success";
                } else if (percentage >= 70) {
                  colorClass = "bg-info";
                } else if (percentage >= 50) {
                  colorClass = "bg-warning";
                } else if (percentage > 0) {
                  colorClass = "bg-highlight";
                }

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
                        Overall Progress
                      </span>
                      <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                        {percentage}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full transition-all duration-500 ${colorClass}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raptor Section */}
      <Collapsible open={raptorOpen} onOpenChange={setRaptorOpen} className="space-y-4">
        <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-sm transition-all duration-200 hover:bg-accent/5 hover:border-accent/50 hover:shadow-md cursor-pointer">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-5 w-5 text-accent" />
            <span className="font-semibold text-foreground">RAPTOR</span>
          </div>
          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pl-2 sm:pl-4">
          {/* Top Row: Progress Bars Stack + Checklist Status Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
            {/* Left: Vertical Stack of Progress Bars */}
            <div className="space-y-4">
              <Card>
                <CardContent className="">
                  <CategoryProgressBar
                    label="RAPTOR Checklist"
                    value={data.checklist_percent ?? 0}
                    completed={(data.checklist_total ?? 0) - (data.checklist_remaining ?? 0)}
                    total={data.checklist_total ?? 0}
                    itemLabel="Items"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="">
                  <CategoryProgressBar
                    label="Doc Verification"
                    value={data.doc_percent ?? 0}
                    completed={(data.doc_total ?? 0) - (data.doc_remaining ?? 0)}
                    total={data.doc_total ?? 0}
                    itemLabel="Docs"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="">
                  <CategoryProgressBar
                    label="SIT Completion"
                    value={data.sit_percent ?? 0}
                    completed={(data.sit_total ?? 0) - (data.sit_remaining ?? 0)}
                    total={data.sit_total ?? 0}
                    itemLabel="Tests"
                  />
                </CardContent>
              </Card>
            </div>
            {/* Right: Checklist Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Checklist Item Status by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <HorizontalBarChart data={checklistStatusData} />
              </CardContent>
            </Card>
          </div>

          {/* System Progress Matrix */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base">System Progress Overview</CardTitle>
              <SystemProgressFilter 
                checked={hideHealthySystems}
                onCheckedChange={setHideHealthySystems}
              />
            </CardHeader>
            <CardContent>
              <SystemProgressMatrix 
                data={data.system_progress_json}
                hideHealthy={hideHealthySystems}
                onHideHealthyChange={setHideHealthySystems}
              />
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Action Items Section */}
      <Collapsible open={actionItemsOpen} onOpenChange={setActionItemsOpen} className="space-y-4">
        <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-sm transition-all duration-200 hover:bg-accent/5 hover:border-accent/50 hover:shadow-md cursor-pointer">
          <div className="flex items-center gap-3">
            <ListTodo className="h-5 w-5 text-accent" />
            <span className="font-semibold text-foreground">Action Items</span>
          </div>
          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pl-2 sm:pl-4">
          {/* Action Items by Priority Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status by Priority</CardTitle>
            </CardHeader>
            <CardContent className="gap-4 flex flex-col">
              <HorizontalGroupedBarChart
                data={actionItemsByPriority}
                bars={[
                  { key: "new", color: "hsl(221, 83%, 53%)", label: "New", stackId: "open" },
                  { key: "assigned", color: "hsl(197, 71%, 73%)", label: "Assigned", stackId: "open" },
                  { key: "resolved", color: "hsl(48, 96%, 53%)", label: "Resolved", stackId: "open" },
                  { key: "closed", color: "hsl(142, 76%, 36%)", label: "Closed" },
                ]}
              />

              {issuesData ? (
                <IssuesTable 
                  data={issuesData.data} 
                  onRowClick={handleRowClick}
                />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">Loading issues...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        open={issueModalOpen}
        onOpenChange={setIssueModalOpen}
      />
    </div>
  );
}
