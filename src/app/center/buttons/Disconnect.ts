import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ButtonInteraction, TextChannel } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'disconnect',
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

        if(!player || (!queue)) {
            return button.editReply({
                embeds: [ new MusicEmbed().warn('Обратитесь к разработчику') ]
            })
        }

        await get.manager.leave(button.guild.id)
        const text = button.guild.channels.cache.get(queue.text) as TextChannel
        if(text) {
            await text.send({
                embeds: [ new MusicEmbed().leave(`В очереди ${get.user!.tag} больше не осталось треков...`) ]
            }).catch(() => {})
        }
        get.queue.delete(button.guild.id)

        return button.editReply({
            embeds: [ new MusicEmbed().success(`Вы отключили ${get.user!.tag} от голосового канала`) ]
        })
    }
)