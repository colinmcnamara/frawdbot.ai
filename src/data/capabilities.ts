/**
 * FrawdBot Detection Capabilities
 */

export interface Capability {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const capabilities: Capability[] = [
  {
    id: 'insider_threat_detection',
    name: 'Insider Threat Detection',
    description: 'Detects malicious insiders using behavioral analysis across workspace audit logs. Identifies data exfiltration, unauthorized access patterns, and privilege escalation.',
    category: 'core',
  },
  {
    id: 'google_workspace_monitoring',
    name: 'Google Workspace Monitoring',
    description: 'Deep integration with Google Workspace audit logs — Drive, Gmail, Admin, Login, and OAuth token events. Rolling statistical baselines per user.',
    category: 'platform',
  },
  {
    id: 'ai_accelerated_threat_detection',
    name: 'AI-Accelerated Threat Detection',
    description: 'Detects when insiders use AI coding assistants (Claude Code, Cursor, Copilot) or automation platforms to exfiltrate data at machine velocity. The intent is human, the speed is not.',
    category: 'core',
  },
  {
    id: 'autonomous_agent_monitoring',
    name: 'Autonomous Agent Monitoring',
    description: 'Monitors autonomous AI agents for drift beyond intent — deleting emails, exposing API keys, following prompt-injected instructions from malicious documents.',
    category: 'core',
  },
  {
    id: 'communication_graph_analysis',
    name: 'Communication Graph Analysis',
    description: 'Maps email and file-sharing patterns to detect covert channels, unusual external contacts, and data staging prior to exfiltration.',
    category: 'behavioral',
  },
  {
    id: 'financial_file_access_monitoring',
    name: 'Financial File Access Monitoring',
    description: 'Tracks access to financial documents, contracts, and sensitive business data with anomaly detection for bulk downloads and off-hours access.',
    category: 'behavioral',
  },
  {
    id: 'deletion_spike_detection',
    name: 'Deletion Spike Detection',
    description: 'Identifies sudden spikes in file deletions, email purges, and data destruction that indicate cover-up activity or scorched-earth departures.',
    category: 'behavioral',
  },
  {
    id: 'token_revocation_tracking',
    name: 'Token Revocation Tracking',
    description: 'Monitors OAuth token grants and revocations. Detects shadow IT, unauthorized third-party app installations, and token-based data pipelines.',
    category: 'behavioral',
  },
  {
    id: 'campaign_detection',
    name: 'Campaign Detection',
    description: 'Connects individual events across weeks of activity to identify coordinated insider threat campaigns — not just point-in-time anomalies.',
    category: 'core',
  },
  {
    id: 'rolling_baselines',
    name: 'Rolling Statistical Baselines',
    description: '12 behavioral rules running against per-user rolling statistical baselines. Adapts to normal work patterns while flagging true anomalies.',
    category: 'core',
  },
];

export function getCapabilitiesByCategory(category?: string): Capability[] {
  if (!category) return capabilities;
  return capabilities.filter(c => c.category === category);
}
