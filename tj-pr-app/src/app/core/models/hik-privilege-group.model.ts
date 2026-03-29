export interface TimeScheduleInfo {
  indexCode: string | null;
  name: string | null;
}

export interface PrivilegeGroupInfo {
  privilegeGroupId: string | null;
  privilegeGroupName: string | null;
  description: string | null;
  timeSchedule: TimeScheduleInfo | null;
}

export interface PrivilegeGroupResponse {
  total: number;
  pageNo: number;
  pageSize: number;
  list: PrivilegeGroupInfo[] | null;
}

export interface PrivilegeGroupFilter {
  pageNo: number;
  pageSize: number;
  type: number; // 1 = Access Control | 2 = Visitor
}
