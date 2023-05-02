import { MusicCenter } from '@struct/clients/MusicCenter'
import mongoose from 'mongoose'
import PlaylistManager from './managers/PlaylistManager'

export class Database {
    public client: MusicCenter
    playlist: PlaylistManager

    constructor(client: MusicCenter) {
        this.client = client
        this.playlist = new PlaylistManager(client)
    }

    async connect() {
        await mongoose.connect(this.client.config.mongoUrl, { autoIndex: false })
        .then(() => this.client.logger.log('База данных MongoDB была подключена'))
        .catch((err) => this.client.logger.error(err))
    }

    async init() {
        this.client.logger.log('Инциизация данных прошла успешно!')
        Promise.all(
            [ await this.playlist.init() ]
        )
    }
}