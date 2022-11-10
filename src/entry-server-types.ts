export interface ApiUrls {
    rickAndMorty: string | undefined
}

export interface PublicConfig {
    urls: ApiUrls
}

export type EntryConfig = {
    urls: ApiUrls
}

export type ServerSideResponseData = {
    locale: string
}
