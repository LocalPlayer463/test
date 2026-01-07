require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ActivityType,
  SlashCommandBuilder,
  ModalBuilder,        // เพิ่มบรรทัดนี้
  TextInputBuilder,    // เพิ่มบรรทัดนี้
  TextInputStyle,       // เพิ่มบรรทัดนี้
  EmbedBuilder
} = require('discord.js');

const { createClient } = require('@supabase/supabase-js');
const { token } = require('./config.json');
const supabaseUrl = 'https://yjiptnbzaklchahcvjyu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaXB0bmJ6YWtsY2hhaGN2anl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTkzMDcsImV4cCI6MjA3OTQzNTMwN30.qgpSv4pc9QpgT4m-ZDTIFrnHcZ2t4XZKf3pKvc33FfQ';  // ต้องเป็น Service Role Key
const supabase = createClient(supabaseUrl, supabaseKey);
const dayjs = require('dayjs'); // แนะนำใช้ dayjs ช่วยจัดการวันที่ (npm install dayjs)

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});


function generateKey() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return key;
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity('', { type: ActivityType.Playing });

  // ลงทะเบียนคำสั่ง setup
  const setupCommand = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup the bot panel');

  // ลงทะเบียนคำสั่ง generate-keys
  const generateKeysCommand = new SlashCommandBuilder()
    .setName('generate-keys')
    .setDescription('Generate keys of different types')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of keys to generate (1-100)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of keys')
        .setRequired(true)
        .addChoices(
          { name: 'Lifetime', value: 'lifetime' },
          { name: '30 Days', value: '30day' },
          { name: '14 Days', value: '14day' },
          { name: '7 Days', value: '7day' },
        )
    );

  const generateTokensCommand = new SlashCommandBuilder()
    .setName('generate-tokens')
    .setDescription('Generate token keys with specific value')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of token keys to generate (1-100)')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('token_amount')
        .setDescription('Token value (points) for each key')
        .setRequired(true)
    );

  const addTokenCommand = new SlashCommandBuilder()
    .setName('addtoken')
    .setDescription('Add tokens to a user (admins only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to give tokens to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Amount of tokens to add')
        .setRequired(true)
    );

  const addwhitelistCommand = new SlashCommandBuilder()
    .setName('addwhitelist')
    .setDescription('Add whitelist for a user (admins only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to whitelist')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Whitelist duration')
        .setRequired(true)
        .addChoices(
          { name: 'Lifetime', value: 'lifetime' },
          { name: '30 Days', value: '30' },
          { name: '14 Days', value: '14' },
          { name: '7 Days', value: '7' },
        )
    );

  const blacklistkeysCommand = new SlashCommandBuilder()
    .setName('blacklistkeys')
    .setDescription('Blacklist a script key (admin only)')
    .addStringOption(option =>
      option.setName('key')
        .setDescription('The script key to blacklist')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Whitelist duration')
        .setRequired(false)
    );

  const removewhitelistCommand = new SlashCommandBuilder()
    .setName('removewhitelist')
    .setDescription('Remove Whitelist to a user (admins only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to give tokens to')
        .setRequired(true)
    );

  const infosCommand = new SlashCommandBuilder()
    .setName('infos')
    .setDescription('View information of a user (admins only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Select a user to view info')
        .setRequired(true)
    );
  // ลงทะเบียนคำสั่งทั้งหมด
  await client.application.commands.set([setupCommand.toJSON(), generateKeysCommand.toJSON(), generateTokensCommand.toJSON(), addTokenCommand.toJSON(), addwhitelistCommand.toJSON(), blacklistkeysCommand.toJSON(), removewhitelistCommand.toJSON(), infosCommand.toJSON()]);
  console.log("Slash commands registered ✔");
});

client.login(token)
  .then(() => console.log("Bot logged in"))
  .catch(console.error);

// จัดการ interaction เดียว
client.on('interactionCreate', async (interaction) => {

  /* ===================== SLASH COMMAND ===================== */
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'setup') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: '❌ You must be an administrator to use this command.', ephemeral: true });
      }

      const embed = {
        title: '⚡ Dynamic Hub | Whitelist Panel',
        description: [
          '```md',
          '# Button Functions',
          '- Redeem Key: Activate your purchased license.',
          '- Get Script: Receive your script instantly.',
          '- Reset HWID: Reset your hardware ID.',
          '- Redeem Token: Redeem your token access.',
          '- Claim Monthly: Collect your monthly reward.',
          '- Leaderboard: View top ranked users.',
          '- Infos: Display system information.',
          '```'
        ].join('\n'),
        color: 0x57F287,

        // ⬇️ Footer โชว์ชื่อผู้สั่ง + รูปโปรไฟล์
        footer: {
          text: `Setup by ${interaction.user.tag}`,
          icon_url: interaction.user.displayAvatarURL()
        },

        image: { url: 'https://img2.pic.in.th/pic/standard7f62015ce85a98bf.gif' },
      };

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('redeemkey')
          .setEmoji('🗝️') // magic glow
          .setLabel('Redeem Key')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId('getscript')
          .setEmoji('⚙️') // mechanical/blueprint
          .setLabel('Get Script')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId('resethwid')
          .setEmoji('🛠️') // recycle reset symbol
          .setLabel('Reset HWID')
          .setStyle(ButtonStyle.Danger),
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('redeemtoken')
          .setEmoji('🎟️') // crystal-like premium token
          .setLabel('Redeem Token')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId('claimmonthly')
          .setEmoji('🎁') // soft monthly reward vibe
          .setLabel('Claim Monthly')
          .setStyle(ButtonStyle.Success),

        /*         new ButtonBuilder()
                  .setCustomId('leaderboard')
                  .setEmoji('🏆') // champion feel
                  .setLabel('Leaderboard')
                  .setStyle(ButtonStyle.Secondary), */

        new ButtonBuilder()
          .setCustomId('infos')
          .setEmoji('📗') // futuristic info broadcast
          .setLabel('Infos')
          .setStyle(ButtonStyle.Secondary),
      );
      // ⬇️ ส่งข้อความลงห้อง ไม่ reply ผู้ใช้
      await interaction.channel.send({ embeds: [embed], components: [row1, row2] });

      // ⬇️ ลบการตอบกลับของ slash command ออกแบบเงียบ ๆ
      await interaction.reply({ content: 'Panel created!', ephemeral: true });
      setTimeout(() => interaction.deleteReply().catch(() => { }), 1000);
      return;
    }

    if (interaction.commandName === 'generate-keys') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Only administrators can generate keys.', ephemeral: true });
      }

      const amount = interaction.options.getInteger('amount');
      const type = interaction.options.getString('type');

      if (amount < 1 || amount > 100) {
        return interaction.reply({ content: '⚠️ Please specify a valid amount between 1 and 100.', ephemeral: true });
      }

      const tableNameMap = {
        lifetime: 'key_table_Lifetime',
        '30day': 'key_table_30Day',
        '14day': 'key_table_14Day',
        '7day': 'key_table_7Day',
      };

      const tableName = tableNameMap[type];
      if (!tableName) {
        return interaction.reply({ content: 'Invalid key type selected.', ephemeral: true });
      }

      const generatedKeys = [];

      for (let i = 0; i < amount; i++) {
        let newKey;
        let isDuplicate = true;

        while (isDuplicate) {
          newKey = generateKey();

          const { data, error } = await supabase
            .from(tableName)
            .select('key')
            .eq('key', newKey)
            .limit(1);

          if (error) {
            console.error('Supabase error checking duplicate key:', error);
            return interaction.reply({ content: 'Database error. Please try again later.', ephemeral: true });
          }

          if (data.length === 0) {
            isDuplicate = false;
          }
        }

        const { error: insertError } = await supabase
          .from(tableName)
          .insert([{ key: newKey }]);

        if (insertError) {
          console.error('Supabase error inserting key:', insertError);
          return interaction.reply({ content: 'Failed to generate key. Please try again later.', ephemeral: true });
        }

        generatedKeys.push(newKey);
      }

      const webhookUrl = 'https://discord.com/api/webhooks/1367072631916068925/WSWK4ig_RhElH5orZt-X8ImqLygQLqVhi4sh7tD2PAdeE_OkQk9RwQSnO__of-1FVDGy';
      const webhookMessage = {
        content: `🚨 ${amount} keys generated! ( Type: ${type} )`,
        embeds: [{
          title: 'Generated Keys',
          description: generatedKeys.join('\n'),
          color: 3066993,
        }],
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookMessage),
      });

      return interaction.reply({
        content: `✅ Successfully generated ${amount} keys of type ${type}!\n\`${generatedKeys.join('`, `')}\``,
        ephemeral: true,
      });
      return;
    }

    if (interaction.commandName === 'generate-tokens') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'Only admins can generate token keys.', ephemeral: true });
      }

      const amountToGenerate = interaction.options.getInteger('amount');
      const tokenAmountValue = interaction.options.getInteger('token_amount'); // สมมติว่าใส่ options ชื่อ token_amount

      if (amountToGenerate < 1 || amountToGenerate > 100) {
        return interaction.reply({ content: 'Please specify a valid amount (1-100).', ephemeral: true });
      }

      if (!tokenAmountValue) {
        return interaction.reply({ content: 'Please specify the token amount for each key.', ephemeral: true });
      }

      const generatedKeys = [];

      for (let i = 0; i < amountToGenerate; i++) {
        let newKey;
        let isDuplicate = true;

        // สร้าง key ใหม่จนกว่าจะไม่ซ้ำ
        while (isDuplicate) {
          newKey = generateKey();

          const { data: existingKey, error: checkError } = await supabase
            .from('token_keys')
            .select('*')
            .eq('key', newKey)
            .eq('amount', tokenAmountValue)
            .limit(1);

          if (checkError) {
            console.error('Supabase error checking duplicate key:', checkError);
            return interaction.reply({ content: 'Database error. Please try again later.', ephemeral: true });
          }

          if (existingKey.length === 0) {
            isDuplicate = false;
          }
        }

        // บันทึก key ใหม่ลงฐานข้อมูล
        const { error: insertError } = await supabase
          .from('token_keys')
          .insert([{ key: newKey, amount: tokenAmountValue }]);

        if (insertError) {
          console.error('Supabase error inserting token key:', insertError);
          return interaction.reply({ content: 'Failed to save token key. Please try again later.', ephemeral: true });
        }

        generatedKeys.push(newKey);
      }

      // ส่งข้อความแจ้งเตือนผ่าน webhook
      const webhookUrl = 'https://discord.com/api/webhooks/1367071083995463783/gggYmC2yI8Wi0MGG7CyyVbq30nZA0Tof5KVBZA8OVGq6yN-ccGU540fxDREgVnykT75Z';
      const webhookMessage = {
        content: `🚨 ${amountToGenerate} token keys generated! ( Amount: ${tokenAmountValue} )`,
        embeds: [{
          title: 'Generated Token Keys',
          description: generatedKeys.join('\n'),
          color: 3066993
        }]
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookMessage),
      });

      return interaction.reply({
        content: `✅ ${amountToGenerate} token keys generated successfully! Amount per key: ${tokenAmountValue}\n\`${generatedKeys.join('`, `')}\``,
        ephemeral: true
      });
      return;
    }

    if (interaction.commandName === 'addtoken') {
      if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
      }

      const targetUser = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');

      if (!targetUser || isNaN(amount) || amount <= 0) {
        return interaction.reply({ content: '⚠️ Invalid user or token amount.', ephemeral: true });
      }

      const userId = targetUser.id;

      try {
        // ดึงข้อมูล user ปัจจุบันจาก redeemed_keys
        const { data: userData, error: fetchError } = await supabase
          .from('redeemed_keys')
          .select('tokens')
          .eq('user_id', userId)
          .single();

        if (fetchError) {
          console.error('[❌] Error fetching user tokens:', fetchError);
          return interaction.reply({ content: '❌ Failed to fetch user data.', ephemeral: true });
        }

        if (!userData) {
          return interaction.reply({ content: '⚠️ User not found in redeemed_keys.', ephemeral: true });
        }

        // คำนวณ token ใหม่
        const newTokens = (userData.tokens || 0) + amount;

        // อัปเดต token
        const { error: updateError } = await supabase
          .from('redeemed_keys')
          .update({ tokens: newTokens })
          .eq('user_id', userId);

        if (updateError) {
          console.error('[❌] Error updating tokens:', updateError);
          return interaction.reply({ content: '❌ Failed to add tokens.', ephemeral: true });
        }

        return interaction.reply({
          content: `✅ Successfully added **${amount} token(s)** to **${targetUser.username}**. Total tokens now: **${newTokens}**.`,
          ephemeral: true
        });

      } catch (error) {
        console.error('[❌] Unexpected error:', error);
        return interaction.reply({ content: '❌ Unexpected error occurred.', ephemeral: true });
      }
    }

    if (interaction.commandName === 'addwhitelist') {
      if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({ content: '❌ You do not have permission to use this.', ephemeral: true });
      }

      const targetUser = interaction.options.getUser('user');
      const duration = interaction.options.getString('duration'); // '7', '14', '30', หรือ 'lifetime'

      const userId = targetUser.id;
      const userName = targetUser.username;
      const generatedKey = generateKey(); // ฟังก์ชัน generateKey() ของคุณ

      // กำหนดวันหมดอายุ
      let expires = null;
      if (duration === 'lifetime') {
        expires = new Date(Date.now() + 9999 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        expires = new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString();
      }


      // เลือกชื่อ table ตาม duration
      let keyTableName = '';
      switch (duration) {
        case '7':
          keyTableName = 'key_table_7Day';
          break;
        case '14':
          keyTableName = 'key_table_14Day';
          break;
        case '30':
          keyTableName = 'key_table_30Day';
          break;
        case 'lifetime':
          keyTableName = 'key_table_Lifetime';
          break;
      }

      try {
        // เพิ่ม key ลงฐานข้อมูล Supabase
        const { error: keyInsertError } = await supabase
          .from(keyTableName)
          .insert([{ key: generatedKey }]);
        if (keyInsertError) throw keyInsertError;

        // เพิ่มข้อมูล redeemed_keys
        const { error: redeemInsertError } = await supabase
          .from('redeemed_keys')
          .insert([{
            key: generatedKey,
            user_id: userId,
            user_name: userName,
            tokens: 3,
            expires: expires,
            total_executed: 0,
            hwid: null,
            last_claimed: null,
          }]);
        if (redeemInsertError) throw redeemInsertError;

        // เพิ่ม role ให้ user
        const role = interaction.guild.roles.cache.find(r => r.name === '୧ ‧₊˚💸 Buyers  ⋅ ☆ ₎');
        const member = await interaction.guild.members.fetch(userId);
        if (role && member) await member.roles.add(role).catch(console.error);

        return interaction.reply({
          content: `✅ Successfully whitelisted **${userName}** for **${duration === 'lifetime' ? 'Lifetime' : duration + ' days'}**!\n🔑 Key: \`${generatedKey}\`\n🎟️ Tokens: 3`,
          ephemeral: true
        });

      } catch (err) {
        console.error('Error adding whitelist:', err);
        return interaction.reply({ content: 'An error occurred, please try again.', ephemeral: true });
      }
    }
    if (interaction.commandName === 'blacklistkeys') {
      const adminRole = interaction.guild.roles.cache.find(role => role.name === "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀");
      if (!interaction.member.roles.cache.has(adminRole?.id)) {
        return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
      }

      const key = interaction.options.getString('key');
      const reason = interaction.options.getString('reason') || 'No reason provided';

      try {
        // เช็คว่าคีย์มีอยู่ใน key_table_Lifetime, key_table_30Day, key_table_14Day, key_table_7Day หรือไม่
        const tablesToCheck = ['key_table_Lifetime', 'key_table_30Day', 'key_table_14Day', 'key_table_7Day'];
        let keyExists = false;
        for (const tableName of tablesToCheck) {
          const { data, error } = await supabase
            .from(tableName)
            .select('key')
            .eq('key', key)
            .limit(1);

          if (error) {
            console.error(`Supabase error fetching from ${tableName}:`, error);
            return interaction.reply({ content: `❌ Database error occurred while checking keys in ${tableName}.`, ephemeral: true });
          }

          if (data && data.length > 0) {
            keyExists = true;
            break;
          }
        }

        if (!keyExists) {
          return interaction.reply({ content: '❌ This key does not exist in any key tables.', ephemeral: true });
        }

        // เช็ค redeemed_keys ว่ามี key นี้ไหม
        const { data: redeemedUsers, error: redeemedError } = await supabase
          .from('redeemed_keys')
          .select('*')
          .eq('key', key)
          .limit(1);

        if (redeemedError) {
          console.error('Supabase error fetching redeemed key:', redeemedError);
          return interaction.reply({ content: '❌ Database error occurred while fetching redeemed key info.', ephemeral: true });
        }

        if (!redeemedUsers || redeemedUsers.length === 0) {
          return interaction.reply({ content: '❌ This key has not been redeemed or does not exist.', ephemeral: true });
        }

        const redeemedUser = redeemedUsers[0];
        const redeemedUsername = redeemedUser.user_name;
        const redeemedUserId = redeemedUser.user_id;

        // เพิ่มข้อมูล blacklist ลงฐานข้อมูล
        const { error: insertError } = await supabase
          .from('blacklisted_keys')
          .insert([{
            key_value: key,
            reason: reason,
            blacklisted_by: interaction.user.username,
            discord_user_id: interaction.user.id,
            redeemed_by: redeemedUsername,
            redeemed_user_id: redeemedUserId,
          }]);

        if (insertError) {
          console.error('Supabase error inserting blacklist:', insertError);
          return interaction.reply({ content: '❌ Failed to blacklist the key.', ephemeral: true });
        }

        // ลบ key ออกจาก redeemed_keys
        const { error: deleteRedeemedError } = await supabase
          .from('redeemed_keys')
          .delete()
          .eq('key', key);

        if (deleteRedeemedError) {
          console.error('Supabase error deleting from redeemed_keys:', deleteRedeemedError);
          // ไม่ต้อง return เพื่อให้ทำงานต่อ
        }

        // ลบ key ออกจากทุก key_table ที่เช็ค
        for (const tableName of tablesToCheck) {
          const { error: deleteKeyTableError } = await supabase
            .from(tableName)
            .delete()
            .eq('key', key);

          if (deleteKeyTableError) {
            console.error(`Supabase error deleting from ${tableName}:`, deleteKeyTableError);
            // ไม่ต้อง return เพื่อให้ทำงานต่อ
          }
        }

        // เพิ่ม role ให้ผู้ใช้ที่โดน blacklist
        const blacklistedRole = interaction.guild.roles.cache.find(role => role.name === "❌ Blacklisted");

        try {
          const guildMember = await interaction.guild.members.fetch(redeemedUserId);
          if (guildMember && blacklistedRole) {
            await guildMember.roles.add(blacklistedRole);
          }
        } catch (fetchErr) {
          console.error('Error fetching or adding role to guild member:', fetchErr);
        }

        // ตอบกลับแอดมิน
        return interaction.reply({
          content: `✅ Successfully blacklisted key:\n\`\`\`${key}\`\`\`\nReason: ${reason}\nBlacklisted by: ${interaction.user.username} (ID: ${interaction.user.id})\nRedeemed by: ${redeemedUsername} (ID: ${redeemedUserId})`,
          ephemeral: true
        });

      } catch (err) {
        console.error('Unexpected error in blacklistkeys command:', err);
        return interaction.reply({ content: '❌ An unexpected error occurred.', ephemeral: true });
      }
    }
    if (interaction.commandName === 'removewhitelist') {
      if (!interaction.member.permissions.has('Administrator')) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
      }

      const targetUser = interaction.options.getUser('user');
      if (!targetUser) {
        return interaction.reply({ content: 'Please specify a user to remove from whitelist.', ephemeral: true });
      }

      const userId = targetUser.id;

      try {
        // เช็คว่าผู้ใช้มีคีย์ใน redeemed_keys หรือไม่
        const { data: redeemedData, error: fetchError } = await supabase
          .from('redeemed_keys')
          .select('*')
          .eq('user_id', userId)
          .limit(1);

        if (fetchError) {
          console.error('Error fetching user data:', fetchError);
          return interaction.reply({ content: 'An error occurred while fetching user data.', ephemeral: true });
        }

        if (!redeemedData || redeemedData.length === 0) {
          return interaction.reply({
            content: 'This user is not in the whitelist or has no redeemed key.',
            ephemeral: true
          });
        }

        // ดึงคีย์ของผู้ใช้จาก redeemed_keys
        const keyToRemove = redeemedData[0].key;

        // ลบคีย์ออกจาก redeemed_keys
        const { error: deleteRedeemedError } = await supabase
          .from('redeemed_keys')
          .delete()
          .eq('user_id', userId);

        if (deleteRedeemedError) {
          console.error('Error deleting key from redeemed_keys:', deleteRedeemedError);
          return interaction.reply({ content: 'An error occurred while removing the key from redeemed_keys.', ephemeral: true });
        }

        // ลบบทบาท "Buyers" จากสมาชิก
        const role = interaction.guild.roles.cache.find(r => r.name === '୧ ‧₊˚💸 Buyers  ⋅ ☆ ₎');
        try {
          const member = await interaction.guild.members.fetch(userId);
          if (role && member) {
            await member.roles.remove(role);
          }
        } catch (roleError) {
          console.error('Error removing role:', roleError);
          // ไม่ต้อง return เพราะให้ลบ role ไม่สำเร็จก็ยังถือว่า command ทำงานจบ
        }

        return interaction.reply({
          content: `✅ Successfully removed **${targetUser.username}** from the whitelist, deleted their key from both key_table and redeemed_keys, and revoked their "Buyers" role.`,
          ephemeral: true
        });

      } catch (err) {
        console.error('Unexpected error in removewhitelist command:', err);
        return interaction.reply({ content: 'An unexpected error occurred.', ephemeral: true });
      }
    }
    if (interaction.commandName === 'infos') {
      try {
        const isAdmin = interaction.member.permissions.has('ADMINISTRATOR');
        let userId;
        let selectedUser;

        if (isAdmin) {
          selectedUser = interaction.options.getUser('user');
          userId = selectedUser ? selectedUser.id : interaction.user.id;
        } else {
          userId = interaction.user.id;
        }

        // ใช้ supabase query แทน
        const { data: results, error } = await supabase
          .from('redeemed_keys')
          .select('*')
          .eq('user_id', userId)
          .limit(1);

        if (error) {
          console.error('❌ Supabase error:', error);
          return interaction.reply({
            content: '❌ An error occurred while connecting to the database!',
            ephemeral: true
          });
        }

        if (!results || results.length === 0) {
          return interaction.reply({
            content: '⚠️ You need to be whitelisted to view your stats. If you have a script key, click on the Redeem button below to redeem it.',
            ephemeral: true
          });
        }

        const user = results[0];
        const totalExecuted = user.total_executed;
        const tokens = user.tokens;
        const key = user.key;
        const hwid = user.hwid;
        const lastClaimed = user.last_claimed
          ? new Date(user.last_claimed).toLocaleString()
          : 'No claims yet';
        const expires = user.expires
          ? new Date(user.expires).toLocaleString()
          : 'No expiration';

        const infoMessage = {
          embeds: [
            {
              title: "📊 Whitelist User Info",
              color: 0x57F287,
              fields: [
                {
                  name: "",
                  value: `User : <@${user.user_id}>`,
                  inline: false
                },
                {
                  name: "Key",
                  value: `\`\`\`\n${key}\n\`\`\``,
                  inline: true
                },
                {
                  name: "hwid",
                  value: `\`\`\`\n${hwid}\n\`\`\``,
                  inline: true
                },
                {
                  name: "Total Executed",
                  value: `\`\`\`\n${totalExecuted}\n\`\`\``,
                  inline: true
                },
                {
                  name: "Reset Token Left",
                  value: `\`\`\`\n${tokens}\n\`\`\``,
                  inline: true
                },
                {
                  name: "Last Claimed",
                  value: `\`\`\`\n${lastClaimed}\n\`\`\``,
                  inline: true
                },
                {
                  name: "Key Expiration",
                  value: `\`\`\`\n${expires}\n\`\`\``,
                  inline: true
                }
              ]
            }
          ],
          ephemeral: true
        };

        return interaction.reply(infoMessage);
      } catch (error) {
        console.error('❌ Unexpected error in /infos command:', error);
        return interaction.reply({
          content: '❌ An unexpected error occurred. Please try again later.',
          ephemeral: true
        });
      }
    }

    return;
  }

  /* ===================== MODAL ===================== */
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'redeem_modal') {
      const key = interaction.fields.getTextInputValue('redeem_key_input').trim();
      const userId = interaction.user.id;
      const userName = interaction.user.tag;

      await interaction.deferReply({ ephemeral: true });

      try {
        // ❌ Expired key check
        const { data: expiredData, error: expiredError } = await supabase
          .from('expired_keys')
          .select('key')
          .eq('key', key);

        if (expiredError) {
          const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('❌ Database Error')
            .setDescription('Failed to check expired keys.');

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        if (expiredData.length > 0) {
          const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('⏳ Key Expired')
            .setDescription('This key has already expired.');

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // ❌ Already redeemed check
        const { data: redeemedData, error: redeemedError } = await supabase
          .from('redeemed_keys')
          .select('key')
          .eq('key', key);

        if (redeemedError) {
          const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('❌ Database Error')
            .setDescription('Failed to check redeemed keys.');

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        if (redeemedData.length > 0) {
          const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('⚠️ Key Already Used')
            .setDescription('This key has already been redeemed.');

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // 🔍 Detect key type
        const tables = [
          { name: 'key_table_Lifetime', expiresInDays: 9999, label: 'Lifetime' },
          { name: 'key_table_30Day', expiresInDays: 30, label: '30 Days' },
          { name: 'key_table_14Day', expiresInDays: 14, label: '14 Days' },
          { name: 'key_table_7Day', expiresInDays: 7, label: '7 Days' },
        ];

        let expires = null;
        let matchedTable = null;

        for (const table of tables) {
          const { data, error } = await supabase
            .from(table.name)
            .select('key')
            .eq('key', key);

          if (error) {
            const embed = new EmbedBuilder()
              .setColor(0xED4245)
              .setTitle('❌ Database Error')
              .setDescription(`Failed to validate key (${table.label}).`);

            return interaction.editReply({ embeds: [embed], ephemeral: true });
          }

          if (data.length > 0) {
            matchedTable = table;
            expires = table.expiresInDays
              ? dayjs().add(table.expiresInDays, 'day').toISOString()
              : null;
            break;
          }
        }

        if (!matchedTable) {
          const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('❌ Invalid Key')
            .setDescription('Key not found or invalid.');

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // ✅ Insert redeemed key
        const { error: insertError } = await supabase
          .from('redeemed_keys')
          .insert([{
            key,
            user_id: userId,
            user_name: userName,
            total_executed: 0,
            hwid: null,
            tokens: 3,
            last_claimed: null,
            expires
          }]);

        if (insertError) {
          const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('❌ Redeem Failed')
            .setDescription('Failed to save redeemed key.');

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // 🗑 Remove original key
        await supabase
          .from(matchedTable.name)
          .delete()
          .eq('key', key);

        // 🎭 Add role
        const roleId = '1317028687614574633';
        try {
          const member = await interaction.guild.members.fetch(userId);
          await member.roles.add(roleId);
        } catch (err) {
          console.error('Role add error:', err);
        }

        // ✅ Success embed
        const successEmbed = new EmbedBuilder()
          .setColor(0x57F287)
          .setTitle('✅ Redeem Successful!')
          .addFields(
            { name: '🔑 Key Type', value: matchedTable.label, inline: true },
            {
              name: '⏳ Expiration',
              value: expires
                ? dayjs(expires).format('YYYY-MM-DD')
                : 'Lifetime',
              inline: true
            }
          )
          .setFooter({ text: 'Dynamic Hub License System' })
          .setTimestamp();

        return interaction.editReply({
          embeds: [successEmbed],
          ephemeral: true
        });

      } catch (error) {
        console.error('Unexpected error in redeem_modal:', error);

        const embed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('❌ Unexpected Error')
          .setDescription('An unexpected error occurred. Please try again.');

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }
    }



    if (interaction.customId === 'redeem_token_modal') {
      const tokenKey = interaction.fields.getTextInputValue('token_key_input');
      const userId = interaction.user.id;

      await interaction.deferReply({ ephemeral: true });

      try {
        // 1. เช็ค token key และดึง amount
        const { data: tokenResults, error: tokenError } = await supabase
          .from('token_keys')
          .select('key, amount')
          .eq('key', tokenKey)
          .limit(1)
          .single();

        if (tokenError || !tokenResults) {
          const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('❌ Redeem Failed')
            .setDescription('Invalid or already used token key.');

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        const tokenAmount = parseInt(tokenResults.amount, 10);

        if (isNaN(tokenAmount) || tokenAmount <= 0) {
          const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('❌ Redeem Failed')
            .setDescription('Invalid token amount.');

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // 2. เช็คว่า user เคย redeem key หลักหรือยัง
        const { data: redeemedRow, error: redeemedError } = await supabase
          .from('redeemed_keys')
          .select('tokens')
          .eq('user_id', userId)
          .limit(1)
          .single();

        if (redeemedError || !redeemedRow) {
          const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('⚠️ Action Required')
            .setDescription('You need to redeem a main key before using token keys.');

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // 3. คำนวณ token ใหม่
        const currentTokens = redeemedRow.tokens ?? 0;
        const newTokenCount = currentTokens + tokenAmount;

        // 4. ลบ token key ที่ใช้แล้ว
        const { error: deleteError } = await supabase
          .from('token_keys')
          .delete()
          .eq('key', tokenKey);

        if (deleteError) {
          const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('❌ Error')
            .setDescription('Failed to consume token key.');

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // 5. อัปเดต token ของ user
        const { error: updateError } = await supabase
          .from('redeemed_keys')
          .update({ tokens: newTokenCount })
          .eq('user_id', userId);

        if (updateError) {
          const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('❌ Error')
            .setDescription('Failed to update token count.');

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // ✅ Success Embed
        const successEmbed = new EmbedBuilder()
          .setColor(0x57F287)
          .setTitle('✅ Token Redeemed Successfully!')
          .addFields(
            { name: '➕ Tokens Gained', value: `${tokenAmount}`, inline: true },
            { name: '🎟 Total Tokens', value: `${newTokenCount}`, inline: true }
          )
          .setFooter({ text: 'Thank you for using our service!' })
          .setTimestamp();

        return interaction.editReply({
          embeds: [successEmbed],
          ephemeral: true
        });

      } catch (err) {
        console.error('Unexpected error redeeming token:', err);

        const embed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('❌ Unexpected Error')
          .setDescription('Something went wrong. Please try again later.');

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }
    }

    return;
  }

  /* ===================== BUTTON ===================== */
  if (!interaction.isButton()) return;

  const userId = interaction.user.id;

  /* ===== Redeem Key ===== */
  if (interaction.customId === 'redeemkey') {
    try {
      // ❗ ห้าม deferReply ก่อน showModal
      const userId = interaction.user.id;

      const { data: redeemedData, error: redeemCheckError } = await supabase
        .from('redeemed_keys')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (redeemCheckError) {
        console.error('Supabase error checking redeemed keys:', redeemCheckError);

        const embed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('❌ Database Error')
          .setDescription('A database error occurred. Please try again later.');

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // ❌ เคย redeem แล้ว
      if (redeemedData.length > 0) {
        const embed = new EmbedBuilder()
          .setColor(0xFEE75C)
          .setTitle('⚠️ Already Redeemed')
          .setDescription('You have already redeemed a key on this account.');

        return interaction.reply({ embeds: [embed], ephemeral: true });
      }

      // ✅ ยังไม่เคย redeem → เปิด modal
      const modal = new ModalBuilder()
        .setCustomId('redeem_modal')
        .setTitle('🔑 Redeem Key')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('redeem_key_input')
              .setLabel('Enter your key')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setMaxLength(32)
          )
        );

      return interaction.showModal(modal);

    } catch (err) {
      console.error('Error processing redeemkey:', err);

      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('❌ Unexpected Error')
        .setDescription('An unexpected error occurred. Please try again later.');

      if (interaction.deferred || interaction.replied) {
        return interaction.editReply({ embeds: [embed], ephemeral: true });
      } else {
        return interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  }


  /* ===== Get Script ===== */
  else if (interaction.customId === 'getscript') {

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ ephemeral: true });
    }

    try {
      const { data, error } = await supabase
        .from('redeemed_keys')
        .select('key')
        .eq('user_id', userId)
        .limit(1);

      if (error || !data?.length) {
        const embed = new EmbedBuilder()
          .setColor(0xFEE75C)
          .setTitle('⚠️ License Not Found')
          .setDescription('No license key found for your account.');

        return interaction.editReply({
          embeds: [embed],
          ephemeral: true
        });
      }

      const loaderCode =
        "```lua\n" +
        `access_key = "${data[0].key}"\n` +
        'loadstring(game:HttpGet("https://raw.githubusercontent.com/Dynamic-Script/Loader/main/Loader.lua"))()\n' +
        "```";

      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('🚀 Dynamic Hub | Script Loader')
        .setDescription(loaderCode)
        .setFooter({ text: 'Use this script to load Dynamic Hub' });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('mobile_copy')
          .setLabel('📱 Mobile Copy')
          .setStyle(ButtonStyle.Success)
      );

      return interaction.editReply({
        embeds: [embed],
        components: [row],
        ephemeral: true
      });

    } catch (err) {
      console.error(err);

      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('❌ Unexpected Error')
        .setDescription('An unexpected error occurred.');

      return interaction.editReply({
        embeds: [embed],
        ephemeral: true
      });
    }
  }


  /* ===== Mobile Copy ===== */
  else if (interaction.customId === 'mobile_copy') {
    const { data } = await supabase
      .from('redeemed_keys')
      .select('key')
      .eq('user_id', userId)
      .limit(1);

    if (!data?.length) {
      return interaction.reply({ content: '⚠️ No license key found.', ephemeral: true });
    }

    return interaction.reply({
      content:
        `access_key = "${data[0].key}"\n` +
        'loadstring(game:HttpGet("https://raw.githubusercontent.com/Dynamic-Script/Loader/main/Loader.lua"))()',
      ephemeral: true
    });
  }

  /* ===== Reset HWID ===== */
  else if (interaction.customId === 'resethwid') {

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ ephemeral: true });
    }

    const userId = interaction.user.id;

    try {
      const { data: redeemedRows, error: selectError } = await supabase
        .from('redeemed_keys')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      // ❌ Database error
      if (selectError) {
        console.error('Error checking key:', selectError);

        const embed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('❌ Database Error')
          .setDescription('An error occurred while checking your key.');

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      // ⚠️ No key redeemed
      if (!redeemedRows || redeemedRows.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(0xFEE75C)
          .setTitle('⚠️ Key Not Found')
          .setDescription('You have not redeemed a key yet.');

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      const currentTokens = redeemedRows[0].tokens ?? 0;

      // ⚠️ Not enough tokens
      if (currentTokens <= 0) {
        const embed = new EmbedBuilder()
          .setColor(0xFEE75C)
          .setTitle('⚠️ Not Enough Tokens')
          .setDescription('You do not have enough tokens to reset HWID.');

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      // 🔁 Reset HWID + -1 token
      const newTokenCount = currentTokens - 1;

      const { error: updateError } = await supabase
        .from('redeemed_keys')
        .update({
          tokens: newTokenCount,
          hwid: null
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating token count and resetting HWID:', updateError);

        const embed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('❌ Reset Failed')
          .setDescription('Failed to reset HWID. Please try again later.');

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      // ✅ Success
      const successEmbed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('✅ HWID Reset Successful')
        .addFields(
          { name: '🖥 HWID Status', value: '`Reset`', inline: true },
          { name: '🎟 Remaining Tokens', value: `\`${newTokenCount}\``, inline: true }
        )
        .setFooter({ text: 'Dynamic Hub • HWID Reset' })
        .setTimestamp();

      return interaction.editReply({
        embeds: [successEmbed],
        ephemeral: true
      });

    } catch (err) {
      console.error('Unexpected error resetting HWID:', err);

      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('❌ Unexpected Error')
        .setDescription('An unexpected error occurred.');

      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }
  }


  /* ===== Infos ===== */
  else if (interaction.customId === 'infos') {

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ ephemeral: true });
    }

    try {
      const { data: results, error } = await supabase
        .from('redeemed_keys')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);

        const embed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('❌ Database Error')
          .setDescription('An error occurred while connecting to the database.');

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      if (!results) {
        const embed = new EmbedBuilder()
          .setColor(0xFEE75C)
          .setTitle('⚠️ No License Found')
          .setDescription('You have not redeemed any key yet.');

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      const totalExecuted = results.total_executed ?? 0;
      const tokens = results.tokens ?? 0;
      const lastClaimed = results.last_claimed
        ? new Date(results.last_claimed).toLocaleString()
        : 'No claims yet';
      const expires = results.expires
        ? new Date(results.expires).toLocaleDateString()
        : 'No expiration';

      // 🔑 Redeemed key (ซ่อนบางส่วนเพื่อความปลอดภัย)
      const redeemedKey = results.key
        ? `${results.key.slice(0, 6)}****${results.key.slice(-4)}`
        : 'Unknown';

      // ✅ Info Embed
      const infoEmbed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('📊 License Information')
        .addFields(
          {
            name: '👤 User',
            value: `<@${results.user_id}>`,
            inline: false
          },
/*           {
            name: '🔑 Redeemed Key',
            value: `\`\`\`${redeemedKey}\`\`\``,
            inline: false
          }, */
          {
            name: '🚀 Total Executed',
            value: `\`\`\`${totalExecuted}\`\`\``,
            inline: true
          },
          {
            name: '🎟 Reset Tokens Left',
            value: `\`\`\`${tokens}\`\`\``,
            inline: true
          },
          {
            name: '🕒 Last Claimed',
            value: `\`\`\`${lastClaimed}\`\`\``,
            inline: true
          },
          {
            name: '⏳ Key Expiration',
            value: `\`\`\`${expires}\`\`\``,
            inline: true
          }
        )
        .setFooter({ text: 'Dynamic Hub • License System' })
        .setTimestamp();

      return interaction.editReply({
        embeds: [infoEmbed],
        ephemeral: true
      });

    } catch (err) {
      console.error('Unexpected error in infos:', err);

      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('❌ Unexpected Error')
        .setDescription('An unexpected error occurred.');

      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }
  }



  else if (interaction.customId === 'redeemtoken') {
    const userId = interaction.user.id;

    // เช็คว่า user เคย redeem key หรือยัง (จากตาราง redeemed_keys)
    const { data: redeemedRows, error: redeemedError } = await supabase
      .from('redeemed_keys')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    if (redeemedError) {
      console.error('Supabase error checking user redemption:', redeemedError);
      return interaction.reply({ content: 'Database error. Please try again later.', ephemeral: true });
    }

    if (!redeemedRows || redeemedRows.length === 0) {
      return interaction.reply({
        content: '⚠️ You need to redeem a key before using a token.',
        ephemeral: true
      });
    }

    // ถ้าเคย redeem แล้ว ให้แสดง modal
    const modal = new ModalBuilder()
      .setCustomId('redeem_token_modal')
      .setTitle('Redeem Token')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('token_key_input')
            .setLabel('Key')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(32)
        )
      );

    await interaction.showModal(modal);
    return;
  }

  else if (interaction.customId === 'claimmonthly') {

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ ephemeral: true });
    }

    const userId = interaction.user.id;

    try {
      // ตรวจสอบว่าเคย redeem key หรือยัง
      const { data: rows, error: selectError } = await supabase
        .from('redeemed_keys')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (selectError) {
        console.error('Supabase select error:', selectError);

        const embed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('❌ Database Error')
          .setDescription('An error occurred while checking your data.');

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      if (!rows || rows.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(0xFEE75C)
          .setTitle('⚠️ Action Required')
          .setDescription('You need to redeem a key before claiming monthly tokens.');

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      const userData = rows[0];
      const now = new Date();
      const lastClaimed = userData.last_claimed
        ? new Date(userData.last_claimed)
        : null;

      if (lastClaimed) {
        const diffTime = now.getTime() - lastClaimed.getTime();
        const daysPassed = diffTime / (1000 * 60 * 60 * 24);

        if (daysPassed < 30) {
          const daysLeft = Math.ceil(30 - daysPassed);

          const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('⏳ Monthly Reward Cooldown')
            .setDescription(
              `You have already claimed your monthly tokens.\n\n` +
              `🗓 **Days remaining:** ${daysLeft}`
            );

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
      }

      // 🎁 เพิ่ม Token +2
      const newTokenCount = (userData.tokens || 0) + 2;

      const { error: updateError } = await supabase
        .from('redeemed_keys')
        .update({
          tokens: newTokenCount,
          last_claimed: now.toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Supabase update error:', updateError);

        const embed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('❌ Update Failed')
          .setDescription('An error occurred while updating your tokens.');

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      // ✅ Success embed
      const successEmbed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('🎁 Monthly Reward Claimed!')
        .addFields(
          { name: '➕ Tokens Gained', value: '`+2`', inline: true },
          { name: '🎟 Total Tokens', value: `\`${newTokenCount}\``, inline: true }
        )
        .setFooter({ text: 'Dynamic Hub • Monthly Rewards' })
        .setTimestamp();

      return interaction.editReply({
        embeds: [successEmbed],
        ephemeral: true
      });

    } catch (err) {
      console.error('Unexpected error:', err);

      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('❌ Unexpected Error')
        .setDescription('An unexpected error occurred.');

      return interaction.editReply({ embeds: [embed], ephemeral: true });
    }
  }


  else if (interaction.customId === 'leaderboard') {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ ephemeral: true });
    }
    try {
      console.log("Button pressed: leaderboard");

      const leaderboard = await getLeaderboard();

      if (!leaderboard || leaderboard.length === 0) {
        console.log("No leaderboard data found.");
        return interaction.editReply({ content: '⚠️ No leaderboard data found.', ephemeral: true });
      }

      let leaderboardMessage = '📊 **Leaderboard (Total Executed)**\n\n';
      leaderboard.forEach((entry, index) => {
        if (entry.total_executed > 0) {
          const formattedExecuted = entry.total_executed.toLocaleString();
          leaderboardMessage += `${index + 1}. **User:** <@${entry.user_id}> - **Total Executed:** ${formattedExecuted}\n`;
        }
      });

      console.log("Leaderboard message:", leaderboardMessage);

      await interaction.editReply({
        content: leaderboardMessage,
        ephemeral: true,
      });

    } catch (error) {
      console.error('Error displaying leaderboard:', error);
      return interaction.editReply({ content: '❌ An error occurred while fetching the leaderboard data.', ephemeral: true });
    }
    return;
  }

});



async function cleanExpiredKeys() {
  try {
    const { data: redeemedKeys, error } = await supabase
      .from('redeemed_keys')
      .select('id, key, user_name, user_id, expires')
      .not('expires', 'is', null);

    if (error) {
      console.error('Error fetching redeemed keys:', error);
      return;
    }

    const now = dayjs();

    const expiredKeys = redeemedKeys.filter(key => dayjs(key.expires).isBefore(now));

    if (expiredKeys.length === 0) {
      return;
    }

    // Insert all expired keys into expired_keys table
    const insertData = expiredKeys.map(keyRecord => ({
      key: keyRecord.key,
      user_name: keyRecord.user_name,
      discord_user_id: keyRecord.user_id,
      expire_date: keyRecord.expires,
    }));

    const { error: insertError } = await supabase
      .from('expired_keys')
      .insert(insertData);

    if (insertError) {
      console.error('Error inserting expired keys:', insertError);
      return;
    }

    // ลบ expired keys จาก redeemed_keys ทีเดียว
    const expiredIds = expiredKeys.map(keyRecord => keyRecord.id);

    const { error: deleteError } = await supabase
      .from('redeemed_keys')
      .delete()
      .in('id', expiredIds);

    if (deleteError) {
      console.error('Error deleting expired keys from redeemed_keys:', deleteError);
      return;
    }

    console.log(`Moved and deleted ${expiredKeys.length} expired keys successfully.`);
  } catch (err) {
    console.error('Unexpected error cleaning expired keys:', err);
  }
}



// Example: run the cleanup every hour
setInterval(cleanExpiredKeys, 2 * 60 * 60 * 1000);

// Optionally, run it once immediately on start
cleanExpiredKeys();

/* client.login(token); */

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');

app.use(cors());
app.use(express.json());

async function sendWebhook(payload) {
  const webhookUrl = "https://discord.com/api/webhooks/1432748147226181684/OY42Oa3SeDWKYwfQDyuax5sWyEF5-N-HqYbeIs9mhJF88TisggC-QefI63XYN6TPdfV3";
  try {
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      console.error(`[❌] Failed to send webhook: ${resp.statusText}`);
    }
  } catch (error) {
    console.error('[❌] Error sending webhook:', error);
  }
}

app.post('/checkandupdate', async (req, res) => {
  const { key, hwid, robloxName, gameName, position, executor, clientId, jobId } = req.body;
  let responseSent = false;

  const safeSend = (status, message) => {
    if (!responseSent) {
      responseSent = true;
      res.status(status).send(message);
    } else {
      console.warn('[⚠️] Tried to send multiple responses');
    }
  };

  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'Unknown';

  console.log('[💬] BODY RECEIVED:', req.body);

  if (!key || !hwid) {
    console.warn('[⚠️] Missing key or hwid');
    return safeSend(400, "missing_key_or_hwid");
  }

  if (typeof key !== 'string' || key.trim() === '') {
    console.warn('[⚠️] Empty or invalid key received');
    return safeSend(403, "invalid_key");
  }

  try {
    // ตรวจสอบ expired_keys
    let { data: expiredRows, error: expiredError } = await supabase
      .from('expired_keys')
      .select('key, expire_date')
      .eq('key', key);

    if (expiredError) {
      console.error('[❌] Error checking expired keys:', expiredError);
      return safeSend(500, "db_error_expired_keys");
    }

    if (expiredRows.length > 0) {
      const expiryDate = expiredRows[0].expire_date || 'Unknown';
      console.warn(`[🚫] Key expired: ${key} | Expiry Date: ${expiryDate}`);

      // ส่ง webhook แจ้งเตือน expired key
      await sendWebhook({
        embeds: [{
          title: "🚫 Expired Key Attempt",
          color: 0xFF0000,
          fields: [
            { name: 'Key', value: `||${key}||`, inline: false },
            { name: 'Expiry Date', value: expiryDate, inline: true },
            { name: 'Client IP', value: clientIP, inline: true },
          ]
        }]
      });

      return safeSend(403, `key_expired:${expiryDate}`);
    }

    // ตรวจสอบ blacklist
    let { data: blacklistRows, error: blacklistError } = await supabase
      .from('blacklisted_keys')
      .select('*')
      .eq('key_value', key);

    if (blacklistError) {
      console.error('[❌] Error checking blacklist:', blacklistError);
      return safeSend(500, "db_error_blacklist");
    }

    if (blacklistRows.length > 0) {
      const reason = blacklistRows[0].reason || 'This key has been blacklisted.';
      console.warn(`[🚫] Key blacklisted: ${key} | Reason: ${reason}`);

      // ส่ง webhook แจ้งเตือน blacklist key
      await sendWebhook({
        embeds: [{
          title: "🚫 Blacklisted Key Attempt",
          color: 0xFF0000,
          fields: [
            { name: 'Key', value: `||${key}||`, inline: false },
            { name: 'Reason', value: reason, inline: false },
            { name: 'Client IP', value: clientIP, inline: true },
          ]
        }]
      });

      return safeSend(403, `key_blacklisted:${reason}`);
    }

    // ตรวจสอบ redeemed_keys
    let { data: rows, error: redeemedError } = await supabase
      .from('redeemed_keys')
      .select('*')
      .eq('key', key);

    if (redeemedError) {
      console.error('[❌] DB Query Error:', redeemedError);
      return safeSend(500, "db_error_redeemed");
    }

    if (rows.length === 0) {
      console.warn('[🚫] Key not found:', key);
      return safeSend(403, "key_not_found");
    }

    const current = rows[0];

    // ส่ง webhook แจ้งใช้ key (log)
    const expiryDateForWebhook = current.expires || 'N/A';

    await sendWebhook({
      embeds: [{
        title: "📊 Script Execution Log | Version : Premium",
        color: 0x57F287,
        fields: [
          { name: '👤 Discord ID', value: `<@${current.user_id}>` || '@Unknown', inline: true },
          { name: '🆔 Discord User ID', value: current.user_id || 'Unknown', inline: true },
          { name: '🔑 Key', value: `||${key}||`, inline: true },
          { name: '🎮 Roblox Name', value: robloxName || "Unknown", inline: false },
          { name: '🗺️ Game', value: gameName || "Unknown", inline: true },
          { name: '📍 Position', value: position || "Unknown", inline: true },
          { name: '⏰ Time', value: new Date().toISOString(), inline: true },
          { name: '💻 Executor', value: executor || "Unknown", inline: true },
          { name: '👑 Total Executed', value: current.total_executed.toString(), inline: true },
          { name: '🔧 Reset Token Left', value: current.tokens.toString(), inline: true },
          { name: '🧠 Hardware Identification', value: `||${clientId || "Unknown"}||`, inline: false },
          { name: '🌐 Client IP', value: clientIP, inline: false },
          { name: '📦 Job ID', value: jobId || "Unknown", inline: false },
          { name: '⏳ Key Expiry Date', value: expiryDateForWebhook, inline: false }
        ]
      }]
    });

    // อัปเดต HWID และนับ total_executed
    if (!current.hwid || current.hwid === '') {
      let { error: updateError } = await supabase
        .from('redeemed_keys')
        .update({ hwid: hwid })
        .eq('key', key);

      if (updateError) {
        console.error('[❌] HWID Update Error:', updateError);
        return safeSend(500, "hwid_update_error");
      }

      console.log('[✅] HWID updated for key:', key);
      return safeSend(200, "success");
    } else {
      if (current.hwid === hwid) {
        console.log('[✅] HWID matched. Key valid.');

        let { error: updateCountError } = await supabase
          .from('redeemed_keys')
          .update({ total_executed: current.total_executed + 1 })
          .eq('key', key);

        if (updateCountError) {
          console.error('[❌] Error updating total_executed:', updateCountError);
          return safeSend(500, "execution_count_update_error");
        }

        console.log('[➕] total_executed incremented for key:', key);
        return safeSend(200, "success");
      } else {
        console.warn('[🚫] HWID mismatch for key:', key);

        return safeSend(403, "hwid_mismatch");
      }
    }
  } catch (error) {
    console.error('[❌] Unexpected error:', error);
    return safeSend(500, "unexpected_server_error");
  }
});

function SafeSend(res, code, data) {
  try {
    if (typeof data === 'string') {
      res.type('text/plain').status(code).send(data);
    } else {
      res.status(code).json(data);
    }
  } catch (err) {
    console.error('Error sending response:', err);
    if (!res.headersSent) res.status(500).send('Internal Server Error');
  }
}

// Folder ที่เก็บสคริปต์ Lua
const SCRIPTS_DIR = path.join(__dirname, 'script');

// หน้าเช็กสถานะ
app.get('/', (req, res) => SafeSend(res, 200, '✅ Server is running.'));

const sanitize = require('sanitize-filename');
// ส่งสคริปต์ Lua ตามชื่อ: /script/:name
app.get('/script/:name', (req, res) => {
  let name = req.params.name;
  if (!name.endsWith('.lua')) name += '.lua';

  const filePath = path.join(SCRIPTS_DIR, name);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return SafeSend(res, 404, `Script "${name}" not found.`);
    SafeSend(res, 200, data);  // ส่งสคริปต์ดิบออกไป
  });
});


async function keepAlive() {
  await supabase.from("ping").select("id").limit(1);
  console.log("[Supabase Keep-Alive] OK", new Date());
}

setInterval(keepAlive, 5 * 60 * 1000);
keepAlive();

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API server is running at http://0.0.0.0:${port}`);
});
