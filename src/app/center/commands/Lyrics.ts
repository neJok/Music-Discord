import { providers } from '../../../struct/clients/Provider'
import { MusicCenter } from '@struct/clients/MusicCenter'
import { ApplicationCommandOptionType, AutocompleteInteraction, CommandInteraction } from 'discord.js'
import MusicEmbed from '../../../struct/utils/MusicEmbed'
import Command from '../../../struct/base/Command'

export default new Command(
    'lyrics',
    {
        voice: true,
        data: {
            name: 'lyrics',
            description: 'Текст проигрываемого трека',
            options: [
                {
                    name: 'песня',
                    description: 'Напишите название песни, которую хочешь послушать',
                    type: ApplicationCommandOptionType.String,
                    autocomplete: true
                }
            ]
        }
    },
    async (client: MusicCenter, interaction: CommandInteraction<'cached'>) => {
        await interaction.deferReply({ fetchReply: true, ephemeral: true })

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

        let search = undefined

        const trackSearchedId = interaction.options.get('песня')?.value as string | undefined
        if(trackSearchedId) {
            search = (await client.genius.songs.get(Number(trackSearchedId.split(':')[1])))
        }

        if(!search) {
            search = (await client.genius.songs.search((interaction.options.get('песня')?.value as string | undefined) || queue.songs[0].info.title).catch(() => {}) || []).find(s => !s.title.startsWith('Дискография'))
        }
        
        if(!search) {
            return interaction.editReply({
                embeds: [ new MusicEmbed().warn('Ничего не найдено') ]
            })
        }

        const lyrics = await search.lyrics().catch(() => {})
        if(!lyrics) {
            return interaction.editReply({
                embeds: [ new MusicEmbed().warn('Текст не найден у трека') ]
            })
        }
        
        return interaction.editReply({
            embeds: [ new MusicEmbed().lyrics(search.title || 'Хз как трек называется', lyrics) ]
        })
    },
    async (client: MusicCenter, interaction: AutocompleteInteraction<'cached'>) => {
        const focusedValue = interaction.options.getFocused()

        if(focusedValue === '') {
            return interaction.respond([])
        }

        const choices = (await client.genius.songs.search(focusedValue).catch(() => {}) || [])
        if(choices.length === 0) {
            return interaction.respond([])
        }

        return interaction.respond(
			choices.map((choice) => {
                const name = `${choice.artist.name} - ${choice.title}`.length > 80 ? `${choice.artist.name} - ${choice.title}`.substring(0, 77) + '...' : `${choice.artist.name} - ${choice.title}`
                return {
                    name, value: `id:${choice.id}`
                }
            })
		)
    }
)