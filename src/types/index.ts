export type RiskLevel = 'High' | 'Medium' | 'Low';
export type ReviewStatus = 'Pending' | 'Flagged' | 'Cleared' | 'Blocked';
export type AlertStatus = 'Open' | 'Investigating' | 'Resolved';
export type CaseStatus = 'Open' | 'In Progress' | 'Under Review' | 'Closed';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface User {
  name: string;
  email: string;
  role: string;
}

export interface RiskFactor {
  name: string;
  score: number;
  max: number;
}

export interface Transaction {
  id: string;
  timestamp: string; // ISO (local)
  source: string;
  destination: string;
  amount: number;
  sender: string;
  receiver: string;
  entityId: string;
  riskScore: number;
  status: RiskLevel;
  review: ReviewStatus;
  factors: RiskFactor[];
  relatedEntities: string[];
}

export interface Alert {
  id: string;
  entityId: string;
  riskScore: number;
  reason: string;
  matchedWith: string;
  country: string;
  detectedAt: string;
  status: AlertStatus;
}

export interface CaseNote {
  id: string;
  author: string;
  text: string;
  at: string;
}

export interface TimelineEvent {
  id: string;
  at: string;
  title: string;
  detail: string;
}

export interface Case {
  id: string;
  title: string;
  entityId: string;
  riskScore: number;
  status: CaseStatus;
  priority: Priority;
  assignedTo: string;
  updatedOn: string;
  description: string;
  notes: CaseNote[];
  timeline: TimelineEvent[];
}

export interface Entity {
  id: string;
  name: string;
  type: 'Individual' | 'Company';
  country: string;
  riskScore: number;
  connections: number;
  status: 'Active' | 'Flagged' | 'Under Watch' | 'Cleared';
  account: string;
  connected: string[];
}

export interface GraphNode {
  id: string; // entity id
  label: string;
  x: number;
  y: number;
  score: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
}
