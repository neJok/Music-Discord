import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ButtonInteraction, TextChannel } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'forward',
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


        const skiping = queue.songs.shift()
        if(queue.songs[0]) {
            client.util.resolveLastTracks(queue, skiping)
            queue.songs[0].info.start = Date.now()
            await player.play(queue.songs[0].track)
        } else {
            await get.manager.leave(button.guild.id)
            const text = button.guild.channels.cache.get(queue.text) as TextChannel
            get.queue.delete(button.guild.id)
            if(text) {
                await text.send({
                    embeds: [ new MusicEmbed().leave(`В очереди ${get.user!.tag} больше не осталось треков...`) ]
                }).catch(() => {})
            }
        }
        
        return button.editReply({
            embeds: [ new MusicEmbed().success(`Вы пропустили проигрываемый трек`) ]
        })
    }
)