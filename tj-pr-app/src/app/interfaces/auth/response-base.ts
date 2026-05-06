export type ResponseBase<T> = {
    code: number;
    message: string;
    data: T;
    totalCount: number;
};