"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Hash, Tag, AlertCircle, Send, MessageSquare, User } from "lucide-react";
import { orpc, client } from "@/utils/orpc";
import type { Issue } from "./issues-table";

type IssueDetailModalProps = {
  issue: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Helper component for priority badges
function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;

  const p = priority.toUpperCase();
  let colorClass = "bg-muted text-muted-foreground";
  let label = priority;

  if (p === "H") {
    colorClass = "bg-highlight/10 text-highlight border-highlight/20";
    label = "High Priority";
  } else if (p === "M") {
    colorClass = "bg-warning/10 text-warning border-warning/20";
    label = "Medium Priority";
  } else if (p === "L") {
    colorClass = "bg-muted text-muted-foreground border-border";
    label = "Low Priority";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${colorClass}`}
    >
      <AlertCircle className="h-4 w-4" />
      {label}
    </span>
  );
}

// Helper component for status badges
function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;

  const s = status.toUpperCase();
  let colorClass = "bg-muted text-muted-foreground border-border";

  if (s === "NEW") {
    colorClass = "bg-accent/10 text-accent border-accent/20";
  } else if (s === "ASSIGNED") {
    colorClass = "bg-info/10 text-info border-info/20";
  } else if (s === "RESOLVED") {
    colorClass = "bg-warning/10 text-warning border-warning/20";
  } else if (s === "CLOSED") {
    colorClass = "bg-success/10 text-success border-success/20";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${colorClass}`}
    >
      <Tag className="h-4 w-4" />
      {status}
    </span>
  );
}

export function IssueDetailModal({
  issue,
  open,
  onOpenChange,
}: IssueDetailModalProps) {
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");

  // Fetch notes for this issue
  const { data: notesData, isLoading: isLoadingNotes } = useQuery({
    ...orpc.issueNotes.listByIssue.queryOptions({
      input: { issueId: issue?.id || "" },
    }),
    enabled: !!issue?.id && open,
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      if (!issue?.id) throw new Error("No issue ID");
      
      return client.issueNotes.create({
        issueId: issue.id,
        note,
        createdBy: "Current User", // TODO: Get from auth context
      });
    },
    onSuccess: () => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({
        queryKey: orpc.issueNotes.listByIssue.queryKey({
          input: { issueId: issue?.id || "" },
        }),
      });
      setNewNote("");
    },
  });

  const handleSendNote = () => {
    if (!newNote.trim()) return;
    createNoteMutation.mutate(newNote);
  };

  if (!issue) return null;

  const dateOpened = issue.date_opened
    ? new Date(issue.date_opened).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const dateModified = issue.timestamp_modified
    ? new Date(issue.timestamp_modified).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const notes = notesData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[1600px] sm:max-w-[1600px] h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="space-y-4">
            {/* Issue ID */}
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <DialogTitle className="font-mono text-xl font-bold">
                {issue.issue_id || "Unknown Issue"}
              </DialogTitle>
            </div>

            {/* Status and Priority Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
            </div>

            {/* Short Description */}
            {issue.short_description && (
              <p className="text-lg font-medium text-foreground">
                {issue.short_description}
              </p>
            )}
          </div>
        </DialogHeader>

        {/* Two-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column - Issue Details */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Description Section */}
            {issue.description && (
              <div className="space-y-2">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Description
                </h3>
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {issue.description}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* System */}
              {issue.system && (
                <div className="space-y-2">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    System
                  </h3>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
                    <Tag className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">{issue.system}</span>
                  </div>
                </div>
              )}

              {/* Date Opened */}
              <div className="space-y-2">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Date Opened
                </h3>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
                  <Calendar className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium font-mono tabular-nums">
                    {dateOpened}
                  </span>
                </div>
              </div>

              {/* Last Updated */}
              <div className="space-y-2 sm:col-span-2">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Last Updated
                </h3>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
                  <Clock className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium font-mono tabular-nums">
                    {dateModified}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Notes */}
          <div className="w-[500px] border-l border-border flex flex-col">
            {/* Notes Header */}
            <div className="px-4 py-3 border-b border-border bg-secondary/30">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Notes {isLoadingNotes ? "" : `(${notes.length})`}
                </h3>
              </div>
            </div>

            {/* Notes List - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {isLoadingNotes ? (
                // Loading skeleton placeholders
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border bg-card p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-3 rounded-full" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </div>
                  ))}
                </>
              ) : notes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notes yet</p>
                </div>
              ) : (
                notes.map((note) => {
                  const noteDate = note.creation_timestamp
                    ? new Date(note.creation_timestamp).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "";

                  return (
                    <div
                      key={note.id}
                      className="rounded-lg border border-border bg-card p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">
                            {note.created_by || "Unknown"}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono tabular-nums">
                          {noteDate}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {note.note}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Input - Fixed at bottom */}
            <div className="border-t border-border p-4 bg-secondary/30">
              <div className="space-y-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full min-h-[80px] px-3 py-2 text-sm rounded-lg border border-border bg-card resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      handleSendNote();
                    }
                  }}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSendNote}
                    disabled={!newNote.trim() || createNoteMutation.isPending}
                    size="sm"
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {createNoteMutation.isPending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
