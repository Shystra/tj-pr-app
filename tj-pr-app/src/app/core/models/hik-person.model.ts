export interface HikPersonRequest {
  accessType: number;
  personFamilyName: string;
  personGivenName: string;
  gender: number | string;
  orgIndexCode: string;
  remark?: string;
  phoneNo?: string;
  email?: string;
  faceData: string;
  faceGroupIndexCode: string[];
  beginTime?: string;
  endTime?: string;
}
