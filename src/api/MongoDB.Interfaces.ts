import { ObjectId } from "mongodb"

export enum MDB_Database {
    api = 'api'
}

export interface MDB_Document_HTTP {
    _id?: ObjectId
    pathname: string
    fullUrl: string
    headers: any
    body: any
    params?: any
    hash?: string
    meta?: {
        [key: string]: string
    }
}
export interface MDB_Document_RequestWithResponse {
    hash: string
    request_id: string
    request_hash: string
    response_id: string
    response_hash: string
    [key: string]: string
}