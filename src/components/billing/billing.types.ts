export interface BillingData {
  id: number;
  amo_account_id: number;
  initiator: string;
  type: number;
  request: string;
  request_result: string;
  cost: number;
  lead_id: number;
  created_at: string;
  type_text: string;
}

export interface Pagination {
  count: number;
  total: number;
  limit_page: number;
  current_page: number;
}

type InitiatorPair = [string, number];

export interface Initiator {
  label: string;
  value: string;
  disabled: boolean;
  children?: InitiatorPair[];
}

export interface CurrentFilters {
  initiator?: InitiatorPair[] | null;
  date_from?: string | null;
  date_to?: string | null;
}
