/**
 * A2A Protocol TypeScript Type Definitions
 * Based on Google's A2A Protocol specification
 */

/**
 * Agent Card - Defines the capabilities and metadata of an A2A agent
 */
export interface A2AAgentCard {
  /** Name of the agent */
  name: string;

  /** Brief description of the agent's purpose */
  description: string;

  /** Version of the agent */
  version: string;

  /** A2A Protocol version supported */
  protocolVersion: string;

  /** Single service endpoint (legacy/fallback) */
  serviceEndpoint?: string;

  /** Multi-endpoint mapping for individual methods */
  serviceEndpoints?: Record<string, string>;

  /** Notes about service endpoint usage */
  serviceNotes?: Record<string, string>;

  /** List of available skills/capabilities */
  skills: A2ASkill[];

  /** Authentication configuration */
  authentication?: A2AAuthentication;

  /** Contact information */
  contactEmail?: string;

  /** Legal terms URL */
  legalTermsUrl?: string;

  /** Privacy policy URL */
  privacyPolicyUrl?: string;
}

/**
 * Skill definition for agent capabilities
 */
export interface A2ASkill {
  /** Unique identifier for the skill */
  id: string;

  /** Human-readable name */
  name: string;

  /** Description of what the skill does */
  description: string;

  /** JSON-RPC method name to invoke this skill */
  method: string;

  /** Parameter schema (JSON Schema format) */
  parameters?: Record<string, any>;

  /** Return value schema (JSON Schema format) */
  returns?: Record<string, any>;

  /** Whether this skill supports streaming responses */
  supportsStreaming?: boolean;
}

/**
 * Authentication configuration
 */
export interface A2AAuthentication {
  /** Supported authentication schemes */
  schemes: A2AAuthScheme[];

  /** Whether authentication is required */
  required: boolean;
}

/**
 * Authentication scheme definition
 */
export interface A2AAuthScheme {
  /** Type of authentication (bearer, basic, apiKey) */
  type: 'bearer' | 'basic' | 'apiKey';

  /** Optional description of the auth scheme */
  description?: string;
}

/**
 * JSON-RPC 2.0 Request
 */
export interface JsonRpcRequest {
  /** Always "2.0" */
  jsonrpc: '2.0';

  /** Method to invoke */
  method: string;

  /** Method parameters */
  params?: Record<string, any> | any[];

  /** Request ID */
  id?: string | number | null;
}

/**
 * JSON-RPC 2.0 Response
 */
export interface JsonRpcResponse {
  /** Always "2.0" */
  jsonrpc: '2.0';

  /** Result of the method call (mutually exclusive with error) */
  result?: any;

  /** Error object (mutually exclusive with result) */
  error?: JsonRpcError;

  /** Request ID (must match request) */
  id: string | number | null;
}

/**
 * JSON-RPC 2.0 Error
 */
export interface JsonRpcError {
  /** Error code */
  code: number;

  /** Error message */
  message: string;

  /** Additional error data */
  data?: any;
}
