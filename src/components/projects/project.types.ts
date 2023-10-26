export interface Project {
  id: number;
  amo_account_id: number;
  name: string;
  status: number;
  is_archive: number;
  count_all: number;
  count_left: number;
  count_phones_found: number;
  count_duplicates_found: number;
  count_lead_created: number;
  total_money: number;
  amo_pipeline_id: number;
  amo_status_id: number;
  amo_responsible: string[];
  file_bd: string;
  amo_tag_id: number;
  can_created_leads_duplicates: number;
  created_at: string;
  updated_at: string;
  status_text: string;
}

export interface Pagination {
  count: number;
  total: number;
  limit_page: number;
  current_page: number;
}

export interface ServerResponse {
  data: Project[];
  pagination: Pagination;
  message: string;
  result: boolean;
}

export interface Responsible {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
  children: Responsible;
}
