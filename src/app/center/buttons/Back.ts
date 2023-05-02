import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ButtonInteraction, TextChannel } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'back',
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


        const lastTrack = Object.values(queue.lasts)[0]
        if(!lastTrack) {
            return button.editReply({
                embeds: [ new MusicEmbed().warn(`Трек не был найден :(`) ]
            }).catch(() => {})
        }

        delete queue.lasts[lastTrack.track]
        queue.songs.unshift(lastTrack)
        lastTrack.info.start = Date.now()
        await player.play(lastTrack.track)
        
        return button.editReply({
            embeds: [ new MusicEmbed().success(`Вы вернулись к треку "${lastTrack.info.title}"`) ]
        })
    }
)