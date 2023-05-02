import { MusicCenter } from '../clients/MusicCenter'
import { EmbedBuilder, User } from 'discord.js'
import Paginator from './Paginator'
import Track from '@customTypes/lib/Track'

export default class QueueManager extends Paginator {
    readonly count: number = 10
    wastebasket = true
    array: Track[]
    provider: User
    client: MusicCenter

    constructor(client: MusicCenter, provider: User, array: Track[]) {
        super()
        this.provider = provider
        this.client = client
        this.array = array
    }

    embed(page: number) {
        const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setTitle(`Очередь треков — ${this.provider.username}`)
        .setFooter({
            text: (
                `Длительность плейлиста: ${this.client.util.convertVideoLength(this.array.map(t => t.info.length).reduce((one, two) => one + two, 0))}` + '\n'
                + `Страница ${page+1}/${this.getAllPages(this.array, this.count)}`
            )
        })

        let text: string = ''
        for (
            let i = page*this.count;
            (i < this.array.length && i < this.count*(page+1));
            i++
        ) {
            if(i === 0) {
                text += `**Сейчас играет:** [${this.array[i].info.author} - ${this.array[i].info.title}](${this.array[i].info.uri}) | \`${this.array[i].info.member.user.tag}\`` + '\n\n'
            } else text += `**${i+1}.** [${this.array[i].info.author} -${this.array[i].info.title}](${this.array[i].info.uri}) | \`${this.client.util.convertVideoLength(this.array[i].info.length)}\` | \`${this.array[i].info.member.user.tag}\`` + '\n'
        }

        embed.setDescription(text == '' ? `Пусто` : text)

        return embed
    }
}