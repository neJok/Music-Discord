import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Command from '../../../struct/base/Command'

export default new Command(
    'seek',
    {
        voice: true,
        data: {
            name: 'seek',
            description: 'Перемотать трек на оприделенное время',
            options: [
                {
                    name: 'время',
                    description: 'Время в формате ((часы:)минуты:)секунды или просто секунды',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
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

        const num = (interaction.options.get('время', true)?.value as string).split(':')
        const length = queue.songs[0].info.length

        switch(num.length) {
            case 3:
                const timeBig = Math.round(parseInt(num[0])*1000*60*60) + (parseInt(num[1])*1000*60) + (parseInt(num[2])*1000)
                if(timeBig > length || 0 > timeBig) {
                    return interaction.editReply({
                        embeds: [ new MusicEmbed().warn('Неверно указано время') ]
                    })
                }
                await player.seek(timeBig)
                queue.songs[0]!.info.start = (Date.now()-timeBig)
                break
            case 2:
                const timeSmall = Math.round((parseInt(num[0])*1000*60) + (parseInt(num[1])*1000))
                if(timeSmall > length || 0 > timeSmall) {
                    return interaction.editReply({
                        embeds: [ new MusicEmbed().warn('Неверно указано время') ]
                    })
                }
                await player.seek(timeSmall)
                queue.songs[0]!.info.start = (Date.now()-timeSmall)
                break
            default:
                const defaults = Math.round(parseInt(num[0]))
                if(defaults > length || 0 > defaults) {
                    return interaction.editReply({
                        embeds: [ new MusicEmbed().warn('Неверно указано время') ]
                    })
                }
                await player.seek(defaults*1000)
                queue.songs[0]!.info.start = (Date.now()-defaults*1000)
                break
        }
        
        return interaction.editReply({
            embeds: [ new MusicEmbed().success(`Вы перемотали трек на другое время`) ]
        })
    }
)