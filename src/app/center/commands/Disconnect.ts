import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { CommandInteraction, TextChannel } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Command from '../../../struct/base/Command'

export default new Command(
    'disconnect',
    {
        voice: true,
        data: {
            name: 'disconnect',
            description: 'Отключить бота с войса'
        }
    },
    async (client: MusicCenter, interaction: CommandInteraction<'cached'>) => {
        await interaction.deferReply({ fetchReply: true })

        const get = client.util.getVoiceProvider(interaction.member, providers)

        if(!get) {
            return interaction.editReply({
                embeds: [ new MusicEmbed().warn('С тобой рядом нет музыкального бота, которым ты можешь управлять!') ]
            })
        }

        const player = get.manager.players.get(interaction.guild.id)
        const queue = get.queue.get(interaction.guild.id)

        if(!player || (!queue)) {
            return interaction.editReply({
                embeds: [ new MusicEmbed().warn('Обратитесь к разработчику') ]
            })
        }

        await get.manager.leave(interaction.guild.id)
        const text = interaction.guild.channels.cache.get(queue.text) as TextChannel
        if(text) {
            await text.send({
                embeds: [ new MusicEmbed().leave(`В очереди ${get.user!.tag} больше не осталось треков...`) ]
            }).catch(() => {})
        }
        get.queue.delete(interaction.guild.id)

        return interaction.editReply({
            embeds: [ new MusicEmbed().success(`Вы отключили ${get.user!.tag} от голосового канала`) ]
        })
    }
)