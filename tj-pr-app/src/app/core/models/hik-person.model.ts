export enum AccessType {
  Employee = 0,
  Visitor = 1
}

export interface TOAdvogado {
  bairro: string;
  cep: string;
  cidade: string;
  codigoSituacao: number;
  cpf: string;
  ddd: string;
  dataCpro: string;
  email: string;
  inscricao: string;
  logradouro: string;
  nome: string;
  nomeMae: string;
  nomePai: string;
  nomeSocial: string;
  numero: string;
  numeroSeguranca: string;
  organizacao: string;
  situacao: string;
  sociedades: string;
  telefone: string;
  tipoInscricao: string;
  uf: string;
}

export interface HikPersonRequest {
  accessType: AccessType;
  personFamilyName: string;
  personGivenName: string;
  orgIndexCode: string;
  privilegeGroupId: string;
  phoneNo?: string;
  email?: string;
  cpf?: string;
  ddd: string | null;
  inscricao: string | null;
  faceData: string;
  faceGroupIndexCode: string[];
  beginTime: string;
  endTime: string;
}
