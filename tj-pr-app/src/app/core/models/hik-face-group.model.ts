export interface FaceGroupInfo {
  indexCode: string;
  name: string;
  description: string | null;
}

export interface FaceGroupResponse {
  total: number;
  pageNo: number;
  pageSize: number;
  list: FaceGroupInfo[] | null;
}

export interface FaceGroupFilter {
  pageNo: number;
  pageSize: number;
}
