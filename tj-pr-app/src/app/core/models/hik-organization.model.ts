export interface OrgInfo {
  orgIndexCode: string;
  orgName: string;
  parentOrgIndexCode: string;
}

export interface HikOrganizationResponse {
  total: number;
  pageNo: number;
  pageSize: number;
  list: OrgInfo[];
}
