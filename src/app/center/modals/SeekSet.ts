import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ModalSubmitInteraction } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'seekmodal',
    {
        voice: true
    },
    async (client: MusicCenter, modal: ModalSubmitInteraction<'cached'>) => {
        await modal.deferReply({ ephemeral: true })
        
        const get = client.util.getVoiceProvider(modal.member, providers)

        if(!get) {
            return modal.editReply({
                embeds: [ new MusicEmbed().warn('С тобой рядом нет музыкального бота, которым ты можешь управлять!') ]
            })
        }

        const player = get.manager.players.get(modal.guild.id)
        const queue = get.queue.get(modal.guild.id)

        if(!player || (player && !player.paused && !player.playing) || (!queue || (queue && queue?.songs.length === 0))) {
            return modal.editReply({
                embeds: [ new MusicEmbed().warn(`Произошла ошибка. Сообщение было удалено.`) ]
            })
        }

        const seek = modal.fields.getTextInputValue('seek')
        if(!seek) {
            return modal.editReply({
                embeds: [ new MusicEmbed().warn('Время не найдено в модальном окне') ]
            })
        }

        const num = seek.split(':')
        const length = queue.songs[0].info.length

        switch(num.length) {
            case 3:
                const timeBig = Math.round(parseInt(num[0])*1000*60*60) + (parseInt(num[1])*1000*60) + (parseInt(num[2])*1000)
                if(timeBig > length || 0 > timeBig) {
                    return modal.editReply({
                        embeds: [ new MusicEmbed().warn('Неверно указано время') ]
                    })
                }
                await player.seek(timeBig)
                queue.songs[0]!.info.start = (Date.now()-timeBig)
                break
            case 2:
                const timeSmall = Math.round((parseInt(num[0])*1000*60) + (parseInt(num[1])*1000))
                if(timeSmall > length || 0 > timeSmall) {
                    return modal.editReply({
                        embeds: [ new MusicEmbed().warn('Неверно указано время') ]
                    })
                }
                await player.seek(timeSmall)
                queue.songs[0]!.info.start = (Date.now()-timeSmall)
                break
            default:
                const defaults = Math.round(parseInt(num[0]))
                if(defaults > length || 0 > defaults) {
                    return modal.editReply({
                        embeds: [ new MusicEmbed().warn('Неверно указано время') ]
                    })
                }
                await player.seek(defaults*1000)
                queue.songs[0]!.info.start = (Date.now()-defaults*1000)
                break
        }

        return modal.editReply({
            embeds: [ new MusicEmbed().success(`Вы перемотали трек на позицию ${seek}`) ]
        })
    }
)