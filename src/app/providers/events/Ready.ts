import Event from "../../../struct/base/Event";
import { Provider } from "@struct/clients/Provider";

export default new Event(
    'ready',
    {},
    async (client: Provider) => {
        client.manager.connect()

        const guild = client.guilds.cache.get(client.config.meta.guild)
        if(guild) {
            const member = guild.members.cache.get(client.user!.id)
            if(member && member?.voice?.channelId) await member.voice.disconnect().catch(() => {})
        }
    }
)