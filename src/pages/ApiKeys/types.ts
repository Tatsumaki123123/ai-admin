export interface ApiKeyItem {
  id: number;
  user_id: number;
  key: string;
  status: number;
  name: string;
  created_time: number;
  accessed_time: number;
  expired_time: number;
  remain_quota: number;
  unlimited_quota: boolean;
  model_limits_enabled: boolean;
  model_limits: string;
  allow_ips: string;
  used_quota: number;
  group: string;
  cross_group_retry: boolean;
  DeletedAt: null | string;
}

export interface ApiResponse {
  data: { page: number; page_size: number; total: number; items: ApiKeyItem[] };
  message: string;
  success: boolean;
}

export interface GroupInfo {
  desc: string;
  ratio: number;
}
