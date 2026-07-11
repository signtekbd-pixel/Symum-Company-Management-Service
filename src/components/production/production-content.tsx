"use client";

import * as React from "react";
import { Plus, Search, Play, Pause, CheckCircle, Clock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, getStatusColor } from "@/lib/utils";

interface ProductionJob {
  id: string;
  status: string;
  progress: number;
  startedAt: string | null;
  completedAt: string | null;
  estimatedHours: number | null;
  order: {
    orderNumber: string;
    customer: {
      name: string;
    };
  };
  machine: {
    name: string;
  } | null;
  operator: {
    name: string;
  } | null;
  createdAt: string;
}

export function ProductionContent() {
  const [jobs, setJobs] = React.useState<ProductionJob[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState("");

  React.useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  async function fetchJobs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/production?${params}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  function getMachineStatusIcon(status: string) {
    switch (status) {
      case "AVAILABLE":
        return <span className="inline-block w-2 h-2 rounded-full bg-green-500" />;
      case "IN_USE":
        return <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />;
      case "MAINTENANCE":
        return <span className="inline-block w-2 h-2 rounded-full bg-red-500" />;
      default:
        return <span className="inline-block w-2 h-2 rounded-full bg-gray-500" />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production</h1>
          <p className="text-gray-500">Track production jobs and machine status</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Queued</p>
                <p className="text-2xl font-bold text-gray-600">
                  {jobs.filter((j) => j.status === "QUEUED").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {jobs.filter((j) => j.status === "IN_PROGRESS").length}
                </p>
              </div>
              <Play className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {jobs.filter((j) => j.status === "COMPLETED").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Machines</p>
                <p className="text-2xl font-bold text-blue-600">3</p>
              </div>
              <Settings className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">All Status</option>
              <option value="QUEUED">Queued</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Production Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No production jobs found. Create your first job to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Machine</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Est. Hours</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium font-mono">{job.order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{job.order.customer.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMachineStatusIcon(job.machine?.name ? "IN_USE" : "AVAILABLE")}
                        <span>{job.machine?.name || "Unassigned"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{job.operator?.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>{job.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.startedAt ? formatDate(job.startedAt) : "-"}
                    </TableCell>
                    <TableCell>
                      {job.estimatedHours ? `${job.estimatedHours}h` : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {job.status === "QUEUED" && (
                          <Button variant="ghost" size="icon">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {job.status === "IN_PROGRESS" && (
                          <>
                            <Button variant="ghost" size="icon">
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
