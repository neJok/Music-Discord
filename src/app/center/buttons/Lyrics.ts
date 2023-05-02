import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ButtonInteraction } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Interaction from '../../../struct/base/Interaction'

export default new Interaction(
    'lyric',
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

        const search = (await client.genius.songs.search(queue.songs[0].info.title).catch(() => {}) || []).find(s => !s.title.startsWith('Дискография'))

        if(!search) {
            return button.editReply({
                embeds: [ new MusicEmbed().warn('Ничего не найдено') ]
            })
        }

        const lyrics = await search.lyrics().catch(() => {})
        if(!lyrics) {
            return button.editReply({
                embeds: [ new MusicEmbed().warn('Текст не найден у трека') ]
            })
        }

        return button.editReply({
            embeds: [ new MusicEmbed().lyrics(search.title || 'Хз как трек называется', lyrics) ]
        })
    }
)