export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AccessRequest {
  id: string;
  resource: string;
  access: string;
  submitted: string;
  updated: string;
  status: RequestStatus;
}
