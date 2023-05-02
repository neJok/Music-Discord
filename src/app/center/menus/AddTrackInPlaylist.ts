import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { StringSelectMenuInteraction } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'addplaylists',
    {
        voice: true
    },
    async (client: MusicCenter, menu: StringSelectMenuInteraction<'cached'>) => {
        await menu.deferReply({ ephemeral: true })

        const get = client.util.getVoiceProvider(menu.member, providers)

        if(!get) {
            return menu.editReply({
                embeds: [ new MusicEmbed().warn('С тобой рядом нет музыкального бота, которым ты можешь управлять!') ]
            })
        }

        const playlist = client.db.playlist.cache.get(menu.values[0])

        if(!playlist) {
            return menu.editReply({
                embeds: [ new MusicEmbed().warn('Плейлист не найден') ]
            })
        }

        const queue = get.queue.get(menu.guild.id)
        if(!queue) {
            return menu.editReply({
                embeds: [ new MusicEmbed().warn('Очередь пуста') ]
            })
        }

        const track = [...queue.songs, ...Object.values(get.lasts)].find(t => t.info.uri === menu.customId.split('[]')[1])

        if(!track) {
            return menu.editReply({
                embeds: [ new MusicEmbed().warn('Трек не найден') ]
            })
        }

        if(playlist.tracks.find(t => t.uri === track.info.uri)) {
            return menu.editReply({
                embeds: [ new MusicEmbed().warn('У Вас уже есть трек в плейлисте') ]
            })
        }

        client.db.playlist.pushTrack(playlist, track)
        await client.db.playlist.save(playlist)

        return menu.editReply({
            embeds: [ new MusicEmbed().success(`Вы добавили трек "${track.info.title}" в плейлист "${playlist.name}"`) ]
        })
    }
)