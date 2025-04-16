const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

const token = 'MTM1OTkwNTU4MzEyMTE3NDc4MA.GV1ozs.fiWTZ-C0EEYPWljxQ8SYfmcWNAsTwQ0ttwsGOo'; // ใส่ Token ของบอทที่นี่

client.once('ready', () => {
    console.log('Bot is ready!');
    
    // เลือกเซิร์ฟเวอร์และห้องเสียงที่ต้องการให้บอทเข้า
    const guild = client.guilds.cache.get('1144608975292215357'); // ใส่ Guild ID
    const voiceChannel = guild.channels.cache.get('1144609088420974735'); // ใส่ Voice Channel ID

    if (voiceChannel) {
        setInterval(() => {
            // เข้าห้องเสียง
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });

            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('Bot has connected to the voice channel!');
                
                // ออกจากห้องเสียงหลังจาก 2 วินาที
                setTimeout(() => {
                    connection.destroy();
                    console.log('Bot has disconnected from the voice channel!');
                }, 1000); // เวลาที่บอทจะอยู่ในห้อง (2000 ms = 2 วินาที)
            });

        }, 2000); // ระยะเวลาที่จะให้บอทออกแล้วเข้าใหม่ (3000 ms = 3 วินาที)
    }
});

client.login(token);
