export enum AccessEventType {
  Entry = 0,
  Exit = 1,
  Denied = 2
}

export enum AccessPersonType {
  Employee = 0,
  Visitor = 1
}

export enum AccessResultType {
  Success = 0,
  Denied = 1
}

export enum AuthenticationMethodType {
  Face = 0,
  Card = 1,
  Pin = 2
}

export interface AccessEventDto {
  id: string;
  thumbnail: string | null;
  personId: string;
  personName: string;
  organization: string | null;
  doorName: string | null;
  accessType: AccessPersonType;
  eventType: AccessEventType;
  accessResult: AccessResultType;
  eventTime: string;
  deviceName: string;
  authenticationMethod: AuthenticationMethodType;
}

export interface PagedResponseOfAccessEventDto {
  page: number;
  pageSize: number;
  total: number;
  items: AccessEventDto[];
}

export interface AccessEventFilter {
  page?: number;
  pageSize?: number;
  personName?: string;
  eventType?: AccessEventType;
  deviceName?: string;
  startDate?: string;
  endDate?: string;
}
