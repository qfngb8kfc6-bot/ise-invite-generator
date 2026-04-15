export type AnalyticsEventType =
  | "link_generated"
  | "generator_opened"
  | "session_verified"
  | "export_clicked"
  | "export_succeeded"
  | "export_failed";

export type AnalyticsEnvironment = "development" | "preview" | "production" | "test";

export type ExportFormat =
  | "png-linkedin"
  | "png-square"
  | "png-email"
  | "png-print"
  | "pdf"
  | "zip"
  | null;

export interface AnalyticsEvent {
  id: string;
  exhibitorId: string;
  companyName: string;
  eventType: AnalyticsEventType;
  format: ExportFormat;
  timestamp: string;
  environment: AnalyticsEnvironment;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface AnalyticsEventInput {
  exhibitorId: string;
  companyName: string;
  eventType: AnalyticsEventType;
  format?: ExportFormat;
  timestamp?: string;
  environment?: AnalyticsEnvironment;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface ExhibitorAnalyticsSummary {
  exhibitorId: string;
  companyName: string;
  totalEvents: number;
  linkGeneratedCount: number;
  generatorOpenedCount: number;
  sessionVerifiedCount: number;
  exportClickedCount: number;
  exportSucceededCount: number;
  exportFailedCount: number;
  lastActivityAt: string | null;
  formats: Record<string, number>;
  generatedLinkButNeverExported: boolean;
}

export interface AnalyticsSummary {
  totalEvents: number;
  totalExhibitors: number;
  totalExportsSucceeded: number;
  totalExportsFailed: number;
  formatUsage: Record<string, number>;
  exhibitorSummaries: ExhibitorAnalyticsSummary[];
  recentEvents: AnalyticsEvent[];
}