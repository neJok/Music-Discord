import { BaseInteraction, CommandInteraction, EmbedBuilder } from "discord.js";
import {MusicCenter} from "@struct/clients/MusicCenter";
import Event from "../../../struct/base/Event";

export default new Event(
    'interactionCreate',
    {},
    async (client: MusicCenter, interaction: BaseInteraction) => {
        if(interaction.isCommand()) {
            const cmd = client.util.getCommand(interaction.commandName)
            if(cmd) {
                if(cmd?.options.voice) {
                    const cached = interaction as CommandInteraction<'cached'>
                    if(!cached.member.voice?.channelId) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder().setColor(0x2f3136)
                                .setAuthor({name: 'Тебе нужно находиться в голосовом канале, чтобы использовать эту команду!'})
                            ],
                            ephemeral: true
                        })
                    }

                    if(client.config.radio.map(r => r.channelId).includes(cached.member.voice?.channelId)) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder().setColor(0x2f3136)
                                .setAuthor({name: 'Ты не можешь включить музыку в радио!'})
                            ],
                            ephemeral: true
                        })
                    }
                    
                    return cmd.run(client, interaction)
                } else return cmd.run(client, interaction)
            }
        }

        if(interaction.isAutocomplete()) {
            const cmd = client.util.getCommand(interaction.commandName)

            if(cmd && cmd?.autoComplete) {
                return cmd.autoComplete(client, interaction).catch(() => {})
            }
        }

        if(interaction.isButton()) {
            const btn = client.util.getButton(interaction.customId)

            if(btn) {
                if(btn.options?.disabled && !interaction.replied && !interaction.deferred) return interaction.deferUpdate().catch(() => {})
                if(btn.options?.voice) {
                    const cached = interaction as BaseInteraction<'cached'>
                    if(!cached.member.voice?.channelId) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder().setColor(0x2f3136)
                                .setAuthor({name: 'Тебе нужно находиться в голосовом канале, чтобы использовать эту команду!'})
                            ],
                            ephemeral: true
                        })
                    } else return btn.run(client, interaction).catch(() => {})
                }
                return btn.run(client, interaction).catch(() => {})
            }
        }

        if(interaction.isSelectMenu()) {
            const menu = client.util.getMenu(interaction.customId)

            if(menu) {
                if(menu.options?.disabled && !interaction.replied && !interaction.deferred) return interaction.deferUpdate().catch(() => {})
                if(menu.options?.voice) {
                    const cached = interaction as BaseInteraction<'cached'>
                    if(!cached.member.voice?.channelId) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder().setColor(0x2f3136)
                                .setAuthor({name: 'Тебе нужно находиться в голосовом канале, чтобы использовать эту команду!'})
                            ],
                            ephemeral: true
                        })
                    } else return menu.run(client, interaction).catch(() => {})
                }
                return menu.run(client, interaction).catch(() => {})
            }
        }

        if(interaction.isModalSubmit()) {
            const modal = client.util.getModal(interaction.customId)

            if(modal) {
                if(modal.options?.disabled && !interaction.replied && !interaction.deferred) return interaction.deferUpdate().catch(() => {})
                if(modal.options?.voice) {
                    const cached = interaction as BaseInteraction<'cached'>
                    if(!cached.member.voice?.channelId) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder().setColor(0x2f3136)
                                .setAuthor({name: 'Тебе нужно находиться в голосовом канале, чтобы использовать эту команду!'})
                            ],
                            ephemeral: true
                        })
                    } else return modal.run(client, interaction).catch(() => {})
                }
                return modal.run(client, interaction).catch(() => {})
            }
        }
    }
)