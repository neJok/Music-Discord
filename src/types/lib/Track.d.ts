import { GuildMember } from 'discord.js'

export default interface Track {
    track: string,
    info: {
        identifier: string,
        isSeekable: boolean,
        author: string,
        length: number,
        isStream: boolean,
        position: number,
        sourceName: string,
        title: string,
        uri: string,
        member: GuildMember,
        start: number,
        thumbnail?: string,
        channelUrl?: string
    }
}