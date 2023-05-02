import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ModalSubmitInteraction } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'volumemodal',
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

        const field = modal.fields.getTextInputValue('volume')
        if(!field) {
            return modal.editReply({
                embeds: [ new MusicEmbed().warn('Время не найдено в модальном окне') ]
            })
        }

        const volume = parseInt(field)
        if(volume > 100 || 0 > volume) {
            return modal.editReply({
                embeds: [ new MusicEmbed().warn('Громкость не может быть меньше 0 и больше 100 процентов') ]
            })
        }

        queue.volume = volume
        await player.volume(volume)

        return modal.editReply({
            embeds: [ new MusicEmbed().success(`Вы поставили громкость ${field}%`) ]
        })
    }
)