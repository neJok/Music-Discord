import { Message, Collector as DJSCollecor, ButtonInteraction, SelectMenuInteraction } from 'discord.js'
import { MusicCenter } from '../clients/MusicCenter'

export default class Collector {
    public message: Message

    constructor(
        client: MusicCenter,
        message: Message,
        run: Function,
        time: number = 60_000,
        end: Function | undefined = undefined
    ) {
        this.message = message

        const collector = this.message.createMessageComponentCollector({time})

        collector.on(
            'collect',
            async (
                interaction: ButtonInteraction | SelectMenuInteraction
            ): Promise<any> => {
            collector.resetTimer()

            await run(interaction, collector)

            if(!interaction.deferred && !interaction.replied) {
                return interaction.deferUpdate().catch(() => {})
            }
        })

        collector.on(
            'end',
            async (): Promise<any> => {
                const message = ((await this.message.fetch().catch(() => {})) || undefined)
                if(!message || !message?.deletable || !message?.editable) return

                if(!end) return client.util.disableComponents(message, true)
                else {
                    await end()
                }
            }
        )
    }
}