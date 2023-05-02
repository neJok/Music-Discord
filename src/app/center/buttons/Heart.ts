import { MusicActionRow } from '../../../struct/utils/MusicComponents'
import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ButtonInteraction } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'heart',
    {
        voice: true
    },
    async (client: MusicCenter, button: ButtonInteraction<'cached'>) => {
        await button.deferReply({ ephemeral: true })

        const get = client.util.getVoiceProvider(button.member, providers)

        if(!get) {
            return button.editReply({
                embeds: [ new MusicEmbed().warn('С тобой рядом нет музыкального бота, которым ты можешь управлять!') ]
            })
        }

        if(get.user!.id !== button.customId.split('.')[1]) {
            return button.editReply({
                embeds: [ new MusicEmbed().warn('Это не ваш плеер!') ]
            })
        }

        const player = get.manager.players.get(button.guild.id)
        const queue = get.queue.get(button.guild.id)

        if(!player || (player && !player.paused && !player.playing) || (!queue || (queue && queue?.songs.length === 0))) {
            await button.message.delete().catch(() => {})
            return button.editReply({
                embeds: [ new MusicEmbed().warn(`Произошла ошибка. Сообщение было удалено.`) ]
            }).catch(() => {})
        }

        await client.db.playlist.checkLoveTracks(button.user.id)

        const playlists = await client.db.playlist.getOnlyUser(button.user.id)

        return button.editReply({
            embeds: [
                new MusicEmbed()
                .default(
                    'Понравишиеся',
                    `Куда Вы **хотите** сохранить трек?`,
                    button.member
                )
            ],
            components: new MusicActionRow().playlists(playlists, button.guild, false, queue.songs[0].info.uri)
        })
    }
)