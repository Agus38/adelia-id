export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

const formatContext = (context: SecurityRuleContext): string => {
  return `
    {
      "operation": "${context.operation}",
      "path": "${context.path}",
      "requestData": ${JSON.stringify(context.requestResourceData, null, 2) || '""'}
    }
  `;
};

export class FirestorePermissionError extends Error {
  constructor(public readonly context: SecurityRuleContext) {
    super(
      `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${formatContext(
        context
      )}`
    );
    this.name = 'FirestorePermissionError';
  }
}
