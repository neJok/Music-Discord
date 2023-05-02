export default interface PlaylistTrack {
    addAt: number,
    track: string,
    identifier: string,
    isSeekable: boolean,
    author: string,
    length: number,
    isStream: boolean,
    position: number,
    sourceName: string,
    title: string,
    uri: string,
    thumbnail?: string,
    channelUrl?: string
}