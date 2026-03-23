/**
 * FrawdBot Threat Types
 */

export interface ThreatType {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'ai_accelerated' | 'agent_drift' | 'traditional';
}

export const threatTypes: ThreatType[] = [
  {
    id: 'ai_codebase_exfiltration',
    name: 'AI-Accelerated Codebase Exfiltration',
    description: 'Insider using AI coding assistants to rapidly clone, compress, and exfiltrate entire codebases in a single session.',
    severity: 'critical',
    category: 'ai_accelerated',
  },
  {
    id: 'ai_data_staging',
    name: 'AI-Assisted Data Staging',
    description: 'Use of AI tools to systematically identify, organize, and stage sensitive data for extraction across multiple sessions.',
    severity: 'critical',
    category: 'ai_accelerated',
  },
  {
    id: 'agent_email_manipulation',
    name: 'Agent Email Manipulation',
    description: 'Autonomous agent deleting, forwarding, or modifying emails outside its intended scope of operation.',
    severity: 'high',
    category: 'agent_drift',
  },
  {
    id: 'agent_credential_exposure',
    name: 'Agent Credential Exposure',
    description: 'AI agent accidentally or deliberately exposing API keys, tokens, or credentials through logs, emails, or file sharing.',
    severity: 'critical',
    category: 'agent_drift',
  },
  {
    id: 'agent_prompt_injection',
    name: 'Agent Prompt Injection Attack',
    description: 'Agent following malicious instructions embedded in documents, emails, or data sources — becoming a tool for an external attacker.',
    severity: 'critical',
    category: 'agent_drift',
  },
  {
    id: 'agent_scope_drift',
    name: 'Agent Scope Drift',
    description: 'Autonomous agent gradually expanding its actions beyond original intent — accessing files, contacts, or systems it was not authorized to use.',
    severity: 'high',
    category: 'agent_drift',
  },
  {
    id: 'bulk_download',
    name: 'Bulk File Download',
    description: 'Sudden mass download of files exceeding user baseline, often indicating data exfiltration prior to departure.',
    severity: 'high',
    category: 'traditional',
  },
  {
    id: 'off_hours_access',
    name: 'Off-Hours Sensitive Access',
    description: 'Access to financial, HR, or classified documents outside normal working hours for the user.',
    severity: 'medium',
    category: 'traditional',
  },
  {
    id: 'external_sharing_spike',
    name: 'External Sharing Spike',
    description: 'Sudden increase in file sharing with external email addresses, especially to personal accounts.',
    severity: 'high',
    category: 'traditional',
  },
  {
    id: 'deletion_cover_up',
    name: 'Deletion Cover-Up',
    description: 'Spike in file deletions and email purges indicating an insider is covering their tracks after data theft.',
    severity: 'critical',
    category: 'traditional',
  },
];
