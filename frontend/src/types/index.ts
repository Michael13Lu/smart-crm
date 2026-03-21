// ── Auth ──────────────────────────────────────────────────────
export type UserRole = "Admin" | "Manager" | "Viewer";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
  expiresAt: string;
}

// ── Leads ─────────────────────────────────────────────────────
export type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost";

export interface AssignedUser {
  id: string;
  fullName: string;
  email: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
  status: LeadStatus;
  assignedTo?: AssignedUser;
  createdAt: string;
  updatedAt: string;
}

// ── Deals ─────────────────────────────────────────────────────
export type DealStage = "New" | "Contacted" | "Negotiation" | "ClosedWon" | "ClosedLost";

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  notes?: string;
  closingDate?: string;
  assignedTo?: AssignedUser;
  lead?: { id: string; name: string; company?: string };
  createdAt: string;
  updatedAt: string;
}

// ── Tasks ─────────────────────────────────────────────────────
export type TaskStatus = "Pending" | "InProgress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignedTo?: AssignedUser;
  relatedLead?: { id: string; name: string };
  relatedDeal?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

// ── Dashboard ─────────────────────────────────────────────────
export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  totalDeals: number;
  totalRevenue: number;
  pipelineValue: number;
  dealsByStage: { stage: string; count: number; value: number }[];
  pendingTasks: number;
  overdueTasks: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  performedBy: string;
  createdAt: string;
}
