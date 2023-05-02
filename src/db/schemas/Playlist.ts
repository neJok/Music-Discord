import { Document, Schema, model } from 'mongoose'
import PlaylistTrack from '@customTypes/db/PlaylistTrack'

export interface IPlaylist {
    userId: string,

    code: string,
    image: string,
    name: string,
    likes: string[],
    tracks: PlaylistTrack[],
    type: 'PRIVATE' | 'PUBLIC'
}

export type TPlaylist = Document & IPlaylist

const schema = new Schema(
    {
        userId: { type: String, required: true },

        code: { type: String, default: 'code' },
        image: { type: String, default: 'default' },
        name: { type: String, default: 'Любимые треки' },
        likes: { type: Array, default: [] },
        tracks: { type: Array, default: [] },
        type: { type: String, default: 'PRIVATE' },
    }
)

export const Playlist = model<IPlaylist>('Playlist', schema, 'playlist')