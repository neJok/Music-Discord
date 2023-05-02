import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ButtonInteraction } from 'discord.js'
import { MusicActionRow } from '../../../struct/utils/MusicComponents'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'repeatQueue',
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


        if(queue.loop) queue.loop = false
        queue.loopQueue = !queue.loopQueue
        
        await button.message.edit({
            embeds: [
                await new MusicEmbed().playerSong(get, player, queue.songs[0], client.util)
            ],
            components: new MusicActionRow().player(player, queue, get.user!.id)
        })

        return button.editReply({
            embeds: [ new MusicEmbed().success(`Вы ${queue.loopQueue ? 'включили' : 'выключили'} повтор очереди`) ]
        })
    }
)