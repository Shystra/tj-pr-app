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
  gender: number;
  orgIndexCode: string;
  privilegeGroupId: string;
  remark?: string;
  phoneNo?: string;
  email?: string;
  faceData: string;
  faceGroupIndexCode: string[];
  beginTime: string;
  endTime: string;
  advogadoInfo: TOAdvogado | null;
}
