/**
 * A2A Monitoring Metrics — No-op stubs
 */

export function trackSkillUsage(..._args: any[]) {}
export function trackAttributionCompliance(..._args: any[]) {}
export function trackDiscovery(..._args: any[]) {}
export function trackAgentSession(_action: 'start' | 'end', _agentId?: string) {}
export function trackContentHashVerification(..._args: any[]) {}
export function trackRateLimit(_method: string, _agentId: string, _remaining: number, _limit: number) {}

export function createOperationHistogram(_operationName: string) {
  return { record(_value: number, _attributes?: Record<string, any>) {} };
}

export async function getMetricsSummary(): Promise<Record<string, any>> {
  return {};
}

export function createRequestTracker(_skillName: string) {
  return {
    setParam(_key: string, _value: any) {},
    setResult(_success: boolean, _result?: any) {},
    setError(_error: Error) {},
  };
}
