import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { CommandInteraction } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Command from '../../../struct/base/Command'

export default new Command(
    'repeat',
    {
        voice: true,
        data: {
            name: 'repeat',
            description: 'Включить или выключить режим повтора'
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

        if(!player || (player && !player.paused && !player.playing) || (!queue || (queue && queue?.songs.length === 0))) {
            return interaction.editReply({
                embeds: [ new MusicEmbed().warn('Сейчас ничего не играет') ]
            })
        }

        if(queue.loopQueue) queue.loopQueue = false
        queue.loop = !queue.loop
        
        return interaction.editReply({
            embeds: [ new MusicEmbed().success(`Вы ${queue.loop ? 'включили' : 'выключили'} повтор трека`) ]
        })
    }
)