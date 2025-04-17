const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } = require('discord.js');
const mysql = require('mysql2');
const { token } = require('./config.json'); // ใส่ token ของคุณในไฟล์ config.json
// การตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL
const db = mysql.createPool({
  host: 'bbwxghpmlzumroydpyl5-mysql.services.clever-cloud.com',
  user: 'uaaoxn5yplzyg4vy',
  password: 'QGmOGl45AbIlP2d7QYjx',
  database: 'bbwxghpmlzumroydpyl5',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
  connection.release(); // release the connection back to the pool
});

// สร้างบอท Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, // 👈 สำคัญสำหรับการให้ role
  ],
});


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});
// ฟังก์ชันสร้างคีย์
function generateKey() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 32; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return key;
}

// เมื่อมีการโต้ตอบกับคำสั่งหรือปุ่ม
// เปลี่ยนเฉพาะข้อความตอบกลับของบอทให้เป็นภาษาอังกฤษ
// ...โค้ดส่วนต้นเหมือนเดิม...
client.on('ready', async () => {
  const command = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('setup the bot');
  
  // ลงทะเบียนคำสั่งกับ Discord API
  await client.application.commands.create(command.toJSON());
});
client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    if (interaction.commandName === 'setup') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'You must be an admin to use this command.', ephemeral: true });
      }

      const embed = {
        title: 'Dynamic Hub | Whitelist Panel',
        description: [
          '```',
          'If you purchase a script, you can click on "Get Script" to receive your script.',
          'If you ever need to reset your HWID, simply click on "Reset HWID" to update it.',
          '```'
        ].join('\n'),
        color: 0x57F287,
        footer: { text: 'by x2Livex' },
        image: {
          url: 'https://example.com/your-image-url.png' // รูปภาพ
        }
      };

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('redeemkey')
          .setEmoji('🔑')
          .setLabel('Redeem Key')
          .setStyle(ButtonStyle.Success),
      
        new ButtonBuilder()
          .setCustomId('getscript')
          .setEmoji('📜')
          .setLabel('Get Script')
          .setStyle(ButtonStyle.Primary),
      
        new ButtonBuilder()
          .setCustomId('resethwid')
          .setEmoji('🔧')
          .setLabel('Reset HWID')
          .setStyle(ButtonStyle.Danger)
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('redeemtoken')
          .setEmoji('🔑')
          .setLabel('Redeem Token')
          .setStyle(ButtonStyle.Success),
    
        new ButtonBuilder()
          .setCustomId('claimmonthly')
          .setEmoji('🎁')
          .setLabel('Claim Monthly')
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId('leaderboard')
          .setEmoji('📊')
          .setLabel('Leaderboard')
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId('infos')
          .setEmoji('📰')
          .setLabel('Infos')
          .setStyle(ButtonStyle.Secondary),
      );

      const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('genkey')
          .setEmoji('🛠️')
          .setLabel('Gen Key')
          .setStyle(ButtonStyle.Secondary),
      
        new ButtonBuilder()
          .setCustomId('gentoken')
          .setEmoji('🛠️')
          .setLabel('Gen Token')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({ embeds: [embed], components: [row1, row2, row3] });

      // ตัวอย่างการเชื่อมต่อกับฐานข้อมูลเมื่อปุ่มถูกกด
      db.getConnection((err, connection) => {
        if (err) {
          console.error('Database connection error:', err);
          return;
        }

        // คำสั่ง SQL ที่ต้องการ
        connection.query('SELECT * FROM your_table WHERE condition = ?', ['value'], (err, results) => {
          if (err) {
            console.error('Error executing query:', err);
          } else {
            console.log('Query results:', results);
          }
          connection.release();
        });
      });
    }
  }
  else if (interaction.customId === 'gentoken') {
    // ตรวจสอบว่าผู้ใช้เป็นแอดมินหรือไม่
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: 'Only admins can generate token keys.', ephemeral: true });
    }

    const tokenKey = generateKey(); // ใช้ฟังก์ชัน generateKey() เดิม

    // ตรวจสอบไม่ให้ซ้ำ
    db.query('SELECT * FROM `token_keys` WHERE `key` = ?', [tokenKey], (err, results) => {
      if (err) {
        console.error('DB Error:', err);
        return interaction.reply({ content: 'Failed to generate token key.', ephemeral: true });
      }

      if (results.length > 0) {
        return interaction.reply({ content: 'Duplicate token key. Try again.', ephemeral: true });
      }

      // บันทึก token key ลงฐานข้อมูล
      db.query('INSERT INTO `token_keys` (`key`) VALUES (?)', [tokenKey], (err) => {
        if (err) {
          console.error('Error inserting token key:', err);
          return interaction.reply({ content: 'Failed to save token key.', ephemeral: true });
        }

        interaction.reply({ content: `✅ Token key generated:\n\`${tokenKey}\``, ephemeral: true });
      });
    });
  } else if (interaction.customId === 'redeemtoken') {
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
  } else if (interaction.customId === 'redeem_token_modal') {
    const tokenKey = interaction.fields.getTextInputValue('token_key_input');
    const userId = interaction.user.id;

    // ตรวจสอบว่า token มีอยู่ในตาราง `token_keys` หรือไม่
    db.query('SELECT * FROM `token_keys` WHERE `key` = ?', [tokenKey], (err, tokenResults) => {
      if (err) {
        console.error('Error checking token key:', err);
        return interaction.reply({ content: 'An error occurred while checking the token key.', ephemeral: true });
      }

      if (tokenResults.length === 0) {
        return interaction.reply({ content: 'Invalid or already used token key.', ephemeral: true });
      }

      // Token ถูกต้อง -> ลบออกจากตาราง `token_keys`
      db.query('DELETE FROM `token_keys` WHERE `key` = ?', [tokenKey], (err) => {
        if (err) {
          console.error('Error deleting used token:', err);
          return interaction.reply({ content: 'Error redeeming token key.', ephemeral: true });
        }

        // เพิ่ม token ให้ผู้ใช้ +2
        db.query('SELECT * FROM `redeemed_keys` WHERE `user_id` = ?', [userId], (err, redeemedRows) => {
          if (err) {
            console.error('Error checking user redemption:', err);
            return interaction.reply({ content: 'An error occurred during token redemption.', ephemeral: true });
          }

          let currentTokens = 0;
          if (redeemedRows.length > 0) {
            currentTokens = redeemedRows[0].tokens || 0;
          }

          const newTokenCount = currentTokens + 2;

          db.query('UPDATE `redeemed_keys` SET `tokens` = ? WHERE `user_id` = ?', [newTokenCount, userId], (err) => {
            if (err) {
              console.error('Error updating token count:', err);
              return interaction.reply({ content: 'Failed to update token count.', ephemeral: true });
            }

            interaction.reply({ content: `✅ Token redeemed successfully! You now have ${newTokenCount} tokens.`, ephemeral: true });
          });
        });
      });
    });
  }  else if (interaction.customId === 'claimmonthly') {
    const userId = interaction.user.id;
  
    // ตรวจสอบว่าเคย redeemkey หรือยัง
    db.query('SELECT * FROM `redeemed_keys` WHERE `user_id` = ?', [userId], (err, rows) => {
      if (err) {
        console.error('DB Error:', err);
        return interaction.reply({ content: 'An error occurred while checking your data.', ephemeral: true });
      }
  
      if (rows.length === 0) {
        return interaction.reply({ content: 'You need to redeem a key before claiming monthly tokens.', ephemeral: true });
      }
  
      const userData = rows[0];
      const now = new Date();
      const lastClaimed = userData.last_claimed ? new Date(userData.last_claimed) : null;
  
      if (lastClaimed) {
        const diffTime = now - lastClaimed;
        const daysPassed = diffTime / (1000 * 60 * 60 * 24);
  
        if (daysPassed < 30) {
          const daysLeft = Math.ceil(30 - daysPassed);
          return interaction.reply({ content: `⏳ You have already claimed your monthly tokens.\nPlease wait ${daysLeft} more day(s).`, ephemeral: true });
        }
      }
  
      // เพิ่ม Token +2
      const newTokenCount = (userData.tokens || 0) + 2;
  
      db.query('UPDATE `redeemed_keys` SET `tokens` = ?, `last_claimed` = ? WHERE `user_id` = ?', [newTokenCount, now, userId], (err) => {
        if (err) {
          console.error('Update Error:', err);
          return interaction.reply({ content: 'An error occurred while updating your tokens.', ephemeral: true });
        }
  
        interaction.reply({ content: `🎁 Monthly reward claimed! You now have ${newTokenCount} tokens.`, ephemeral: true });
      });
    });
  }
   else if (interaction.isButton()) {
    if (interaction.customId === 'genkey') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: 'You must be an admin to use this button.', ephemeral: true });
      }

      const newKey = generateKey();
      db.query('SELECT * FROM `key_table` WHERE `key` = ?', [newKey], (err, results) => {
        if (err) {
          console.error('Error checking key:', err);
          return interaction.reply({ content: 'An error occurred while checking the key.', ephemeral: true });
        }

        if (results.length > 0) {
          return interaction.reply({ content: 'Duplicate key, please try again.', ephemeral: true });
        }

        db.query('INSERT INTO `key_table` (`key`) VALUES (?)', [newKey], (err) => {
          if (err) {
            console.error('Could not create key:', err);
            return interaction.reply({ content: 'Failed to generate key.', ephemeral: true });
          }

          interaction.reply({ content: `Your key has been generated: \`${newKey}\``, ephemeral: true });
        });
      });
    }

    // ฟังก์ชันเพื่อดึงข้อมูล leaderboard
    async function getLeaderboard() {
      try {
        const [rows] = await db.promise().query(`
          SELECT user_id, total_executed
          FROM redeemed_keys
          ORDER BY total_executed DESC
          LIMIT 20;
        `);
        console.log('Leaderboard fetched:', rows);
        return rows;
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        throw new Error('An error occurred while fetching the leaderboard.');
      }
    }
    
    if (!interaction.isButton()) return;

    if (interaction.customId === 'leaderboard') {
      try {
        console.log("Button pressed: leaderboard");
    
        // เรียกใช้ getLeaderboard
        const leaderboard = await getLeaderboard();
    
        if (leaderboard.length === 0) {
          console.log("No leaderboard data found.");
          return interaction.reply({ content: '⚠️ No leaderboard data found.', ephemeral: true });
        }
    
        let leaderboardMessage = '📊 **Leaderboard (Total Executed)**\n\n';
        leaderboard.forEach((entry, index) => {
          if (entry.total_executed > 0) { // ตรวจสอบว่า total_executed เป็นค่าที่ไม่ใช่ 0 หรือ NULL
            const formattedExecuted = entry.total_executed.toLocaleString(); // แปลงจำนวนให้มีคอมม่า
            leaderboardMessage += `${index + 1}. **User:** <@${entry.user_id}> - **Total Executed:** ${formattedExecuted}\n`;
          }
        });
        console.log("Leaderboard message:", leaderboardMessage);
    
        await interaction.reply({
          content: leaderboardMessage,
          ephemeral: true,
        });
    
      } catch (error) {
        console.error('Error displaying leaderboard:', error);
        return interaction.reply({ content: '❌ An error occurred while fetching the leaderboard data.', ephemeral: true });
      }
    }
    if (!interaction.isButton()) return;

    if (interaction.customId === 'infos') {
      const userId = interaction.user.id;
    
      db.query('SELECT * FROM redeemed_keys WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
          console.error(err);
          return interaction.reply('An error occurred while connecting to the database!');
        }
    
        if (results.length === 0) {
          return interaction.reply({content : 'You need to be whitelisted to view your stats. If you have a script key, click on the Redeem button below to redeem it', ephemeral: true});
        }
    
        const user = results[0];
        const totalExecuted = user.total_executed;
        const tokens = user.tokens;
        const lastClaimed = user.last_claimed ? new Date(user.last_claimed).toLocaleString() : 'No claims yet';
    
        // Format the message to look nice
        const infoMessage = {
          content: "",
          embeds: [
            {
              title: "User information",
              fields: [
                {
                  name: "",
                  value: `User : <@${user.user_id}>`,
                  inline: false
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
                }
              ],
              color: 0x57F287, // Green color like the example in the webhook
            }
          ],
          ephemeral: true // Only show to the user who clicked the button
        };
    
        interaction.reply(infoMessage);
      });
    }
    
    else if (interaction.customId === 'redeemkey') {
      const modal = new ModalBuilder()
        .setCustomId('redeem_modal')
        .setTitle('Redeem Key')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('redeem_key_input')
              .setLabel('Key')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setMaxLength(32)
          )
        );
      await interaction.showModal(modal);
    }

    else if (interaction.customId === 'resethwid') {
      const userId = interaction.user.id;
    
      db.query('SELECT * FROM `redeemed_keys` WHERE `user_id` = ?', [userId], (err, redeemedRows) => {
        if (err) {
          console.error('Error checking key:', err);
          return interaction.reply({ content: 'An error occurred while checking your key.', ephemeral: true });
        }
    
        if (redeemedRows.length === 0) {
          return interaction.reply({ content: 'You have not redeemed a key yet.', ephemeral: true });
        }
    
        // ลดจำนวน Token 1 ครั้งเมื่อ reset HWID
        const currentTokens = redeemedRows[0].tokens;
        if (currentTokens <= 0) {
          return interaction.reply({ content: 'You do not have enough tokens to reset HWID.', ephemeral: true });
        }
    
        const newTokenCount = currentTokens - 1;
    
        // อัพเดตจำนวน token ในฐานข้อมูล
        db.query('UPDATE `redeemed_keys` SET `tokens` = ? WHERE `user_id` = ?', [newTokenCount, userId], (err) => {
          if (err) {
            console.error('Error updating token count:', err);
            return interaction.reply({ content: 'An error occurred while updating your token count.', ephemeral: true });
          }
    
          // ทำการรีเซ็ต HWID
          db.query('UPDATE `redeemed_keys` SET `hwid` = "" WHERE `user_id` = ?', [userId], (err) => {
            if (err) {
              console.error('Error resetting HWID:', err);
              return interaction.reply({ content: 'An error occurred while resetting your HWID.', ephemeral: true });
            }
    
            interaction.reply({ content: `Your HWID has been successfully reset. Your new token count is: ${newTokenCount}`, ephemeral: true });
          });
        });
      });
    }
    else if (interaction.customId === 'getscript') {
      const userId = interaction.user.id;
      const userName = interaction.user.username;

      db.query('SELECT * FROM `redeemed_keys` WHERE `user_id` = ? AND `user_name` = ?', [userId, userName], (err, redeemedRows) => {
        if (err) {
          console.error('Error checking key:', err);
          return interaction.reply({ content: 'An error occurred while checking your key.', ephemeral: true });
        }

        if (redeemedRows.length === 0) {
          return interaction.reply({ content: 'You need to be whitelisted to get this script. If you have a script key, click on the Redeem button below to redeem it.', ephemeral: true });
        }

        const redeemedKey = redeemedRows[0].key;

        const embed = {
          title: 'Dynamic Hub | Script Loader',
          description: [
            '```lua',
            `getgenv().Key = "${redeemedKey}"`,
            'loadstring(game:HttpGet("https://raw.githubusercontent.com/Dynamic-Script/Loader/main/Loader.lua"))()',
            '```'
          ].join('\n'),
          color: 0x57F287,
          footer: { text: '' },
          image: {
            url: 'https://example.com/your-image-url.png' // เปลี่ยนลิงก์ให้เป็นภาพจริง
          }
        };
        
        interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
      });        
    }
  } 
  else if (interaction.customId === 'redeem_modal') {
    const redeemedKey = interaction.fields.getTextInputValue('redeem_key_input');
    const userId = interaction.user.id;
    const userName = interaction.user.username;

    // เช็คคีย์ใน key_table
    db.query('SELECT * FROM `key_table` WHERE `key` = ?', [redeemedKey], (err, results) => {
        if (err) {
            console.error('Error checking key:', err);
            return interaction.reply({ content: 'An error occurred while redeeming the key.', ephemeral: true });
        }

        if (results.length === 0) {
            return interaction.reply({ content: 'Invalid or non-existent key.', ephemeral: true });
        }

        // เช็คคีย์ที่ถูก redeem ไปแล้วใน redeemed_keys
        db.query('SELECT * FROM `redeemed_keys` WHERE `key` = ?', [redeemedKey], (err1, redeemedRows) => {
            if (err1) {
                console.error('Error checking redemption status:', err1);
                return interaction.reply({ content: 'An error occurred while checking your redemption status.', ephemeral: true });
            }

            // ถ้าคีย์ถูก redeem ไปแล้ว
            if (redeemedRows.length > 0) {
                return interaction.reply({ content: 'This key has already been redeemed by someone else.', ephemeral: true });
            }

            // ถ้ายังไม่เคย redeem จะทำการ redeem คีย์
            db.query('INSERT INTO `redeemed_keys` (`key`, `user_id`, `user_name`) VALUES (?, ?, ?)', [redeemedKey, userId, userName], (err2) => {
                if (err2) {
                    console.error('Error saving redeemed key:', err2);
                    return interaction.reply({ content: 'An error occurred while saving the redeemed key.', ephemeral: true });
                }

                console.log(`Key redeemed successfully for user: ${userId}`);

                // แจ้งผู้ใช้ว่า redeem สำเร็จ
                interaction.reply({ content: 'Key redeemed successfully!', ephemeral: true });

                // ✅ ให้ยศ Buyers
                const role = interaction.guild.roles.cache.find(r => r.name === '୧ ‧₊˚💸 Buyers  ⋅ ☆ ₎');
                if (role) {
                    interaction.member.roles.add(role).catch(console.error);
                }
            });
        });
    });
}
else if (interaction.customId === 'redeem_modal') {
  const redeemedKey = interaction.fields.getTextInputValue('redeem_key_input');
  const userId = interaction.user.id;
  const userName = interaction.user.username;

  // เช็คคีย์ใน key_table
  db.query('SELECT * FROM `key_table` WHERE `key` = ?', [redeemedKey], (err, results) => {
      if (err) {
          console.error('Error checking key:', err);
          return interaction.reply({ content: 'An error occurred while redeeming the key.', ephemeral: true });
      }

      if (results.length === 0) {
          return interaction.reply({ content: 'Invalid or non-existent key.', ephemeral: true });
      }

      // เช็คคีย์ที่ถูก redeem ไปแล้วใน redeemed_keys
      db.query('SELECT * FROM `redeemed_keys` WHERE `key` = ?', [redeemedKey], (err1, redeemedRows) => {
          if (err1) {
              console.error('Error checking redemption status:', err1);
              return interaction.reply({ content: 'An error occurred while checking your redemption status.', ephemeral: true });
          }

          // ถ้าคีย์ถูก redeem ไปแล้ว
          if (redeemedRows.length > 0) {
              return interaction.reply({ content: 'This key has already been redeemed by someone else.', ephemeral: true });
          }

          // ถ้ายังไม่เคย redeem จะทำการ redeem คีย์
          db.query('INSERT INTO `redeemed_keys` (`key`, `user_id`, `user_name`) VALUES (?, ?, ?)', [redeemedKey, userId, userName], (err2) => {
              if (err2) {
                  console.error('Error saving redeemed key:', err2);
                  return interaction.reply({ content: 'An error occurred while saving the redeemed key.', ephemeral: true });
              }

              console.log(`Key redeemed successfully for user: ${userId}`);

              // แจ้งผู้ใช้ว่า redeem สำเร็จ
              interaction.reply({ content: 'Key redeemed successfully!', ephemeral: true });

              // ✅ ให้ยศ Buyers
              const role = interaction.guild.roles.cache.find(r => r.name === '୧ ‧₊˚💸 Buyers  ⋅ ☆ ₎');
              if (role) {
                  interaction.member.roles.add(role).catch(console.error);
              }
          });
      });
  });
}

  else if (interaction.customId === 'infos') {
    const userId = interaction.user.id;

    // เช็คในฐานข้อมูลว่า user นี้ redeem key แล้วหรือยัง
    const [userData] = await connection.execute('SELECT redeem_key, total_executed, tokens FROM users WHERE discord_id = ?', [userId]);

    if (userData.length > 0 && userData[0].redeem_key) {
        // ถ้า redeem_key มีค่า แสดงข้อมูล
        const totalExecuted = userData[0].total_executed;
        const tokens = userData[0].tokens;

        // สร้างข้อความที่จะแสดง
        const infoMessage = `ข้อมูลของคุณ:\nTotal Executed: ${totalExecuted}\nTokens: ${tokens}`;

        // ส่งข้อความกลับไปที่ผู้ใช้
        await interaction.reply({ content: infoMessage, ephemeral: true });
    } else {
        // ถ้ายังไม่ redeem key ก็ไม่แสดงอะไร
        await interaction.reply({ content: 'คุณยังไม่ได้ redeem key!', ephemeral: true });
    }
}
});
const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction } = require('discord.js');

// เมื่อ bot เริ่มต้น
client.once('ready', () => {
    // สร้างคำสั่ง Slash สำหรับ /infos
    client.application.commands.create(
        new SlashCommandBuilder()
            .setName('infos')
            .setDescription('ดูข้อมูลของผู้ใช้')
            .addStringOption(option =>
                option.setName('username')
                    .setDescription('ชื่อผู้ใช้ที่ต้องการดูข้อมูล')
                    .setRequired(true)
            )
    );
});
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await client.application.commands.create({
      name: 'infos',
      description: 'View information of a user (admins only)',
      options: [
        {
          type: 6,
          name: 'user',
          description: 'Select a user to view info',
          required: false
        }
      ]
    });

    console.log('✅ Slash command /infos registered successfully');
  } catch (error) {
    console.error('❌ Failed to register /infos command:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'infos') {
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

      db.query('SELECT * FROM redeemed_keys WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
          console.error(err);
          return interaction.reply({
            content: '❌ An error occurred while connecting to the database!',
            ephemeral: true
          });
        }

        if (results.length === 0) {
          return interaction.reply({
            content: '⚠️ You need to be whitelisted to view your stats. If you have a script key, click on the Redeem button below to redeem it.',
            ephemeral: true
          });
        }

        const user = results[0];
        const totalExecuted = user.total_executed;
        const tokens = user.tokens;
        const key = user.key
        const lastClaimed = user.last_claimed
          ? new Date(user.last_claimed).toLocaleString()
          : 'No claims yet';

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
                }
              ]
            }
          ],
          ephemeral: true
        };

        interaction.reply(infoMessage);
      });
    } catch (error) {
      console.error('❌ Unexpected error in /infos command:', error);
      interaction.reply({
        content: '❌ An unexpected error occurred. Please try again later.',
        ephemeral: true
      });
    }
  }
});
client.once('ready', async () => {
  await client.application.commands.create({
    name: 'blacklistkeys',
    description: 'Blacklist a script key (admin only)',
    options: [
      {
        name: 'key',
        description: 'The script key to blacklist',
        type: 3, // String
        required: true,
      },
      {
        name: 'reason',
        description: 'Reason for blacklisting',
        type: 3,
        required: false,
      }
    ]
  });
});
client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === 'blacklistkeys') {
    const adminRole = interaction.guild.roles.cache.find(role => role.name === "👑");
    if (!interaction.member.roles.cache.has(adminRole?.id)) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const key = interaction.options.getString('key');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    db.query('SELECT * FROM redeemed_keys WHERE `key` = ?', [key], (err, results) => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: '❌ Database error occurred while fetching redeemed key info.', ephemeral: true });
      }

      if (results.length === 0) {
        return interaction.reply({ content: '❌ This key has not been redeemed or does not exist.', ephemeral: true });
      }

      const redeemedUser = results[0];
      const redeemedUsername = redeemedUser.user_name;
      const redeemedUserId = redeemedUser.user_id;

      db.query('INSERT INTO blacklisted_keys (key_value, reason, blacklisted_by, discord_user_id, redeemed_by, redeemed_user_id) VALUES (?, ?, ?, ?, ?, ?)',
        [key, reason, interaction.user.username, interaction.user.id, redeemedUsername, redeemedUserId], async (err1) => {
          if (err1) {
            console.error(err1);
            return interaction.reply({ content: '❌ Failed to blacklist the key.', ephemeral: true });
          }

          // 🔁 ลบ key ออกทั้งจาก redeemed_keys และ key_table
          db.query('DELETE FROM redeemed_keys WHERE `key` = ?', [key], (err2) => {
            if (err2) console.error('❌ Failed to delete from redeemed_keys:', err2);

            db.query('DELETE FROM key_table WHERE `key` = ?', [key], async (err3) => {
              if (err3) console.error('❌ Failed to delete from key_table:', err3);

              // ✅ เพิ่ม role ให้ผู้ใช้ที่โดน blacklist
              const guildMember = await interaction.guild.members.fetch(redeemedUserId).catch(console.error);
              const blacklistedRole = interaction.guild.roles.cache.find(role => role.name === "❌ Blacklisted");

              if (guildMember && blacklistedRole) {
                guildMember.roles.add(blacklistedRole).catch(console.error);
              }

              // ✅ ตอบกลับแอดมิน
              interaction.reply({
                content: `✅ Successfully blacklisted key:\n\`\`\`${key}\`\`\`\nReason: ${reason}\nblacklisted by: ${interaction.user.username} (ID: ${interaction.user.id})\nRedeemed by: ${redeemedUsername} (ID: ${redeemedUserId})`,
                ephemeral: true
              });
            });
          });
        });
    });
  }
});
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await client.application.commands.create({
      name: 'addwhitelist',
      description: 'Add whitelist for a user (admins only)',
      options: [
        {
          type: 6,
          name: 'user',
          description: 'Select a user to whitelist',
          required: true
        }
      ]
    });

    console.log('✅ Slash command /addwhitelist registered successfully');
  } catch (error) {
    console.error('❌ Failed to register /addwhitelist command:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'addwhitelist') {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    if (!targetUser) {
      return interaction.reply({ content: '⚠️ Please specify a user to whitelist.', ephemeral: true });
    }

    const userId = targetUser.id;
    const userName = targetUser.username;
    const generatedKey = generateKey(); // 🔑

    db.query('INSERT INTO `key_table` (`key`) VALUES (?)', [generatedKey], (err1) => {
      if (err1) {
        console.error('[❌] Error inserting to key_table:', err1);
        return interaction.reply({ content: '❌ Failed to insert key into key_table.', ephemeral: true });
      }

      db.query(
        'INSERT INTO `redeemed_keys` (`key`, `user_id`, `user_name`, `tokens`) VALUES (?, ?, ?, ?)',
        [generatedKey, userId, userName, 3],
        (err2) => {
          if (err2) {
            console.error('[❌] Error inserting to redeemed_keys:', err2);
            return interaction.reply({ content: '❌ Failed to insert key into redeemed_keys.', ephemeral: true });
          }

          const role = interaction.guild.roles.cache.find(r => r.name === '୧ ‧₊˚💸 Buyers  ⋅ ☆ ₎');
          const member = interaction.guild.members.cache.get(userId);
          if (role && member) {
            member.roles.add(role).catch(console.error);
          }

          interaction.reply({
            content: `✅ Whitelisted **${userName}**!\n🔑 Key: \`${generatedKey}\`\n🎟️ Tokens: 3`,
            ephemeral: true
          });
        }
      );
    });
  }
});
client.once('ready', async () => {
  try {
    await client.application.commands.create({
      name: 'addtoken',
      description: 'Add tokens to a user (admins only)',
      options: [
        {
          type: 6, // USER
          name: 'user',
          description: 'User to give tokens to',
          required: true
        },
        {
          type: 4, // INTEGER
          name: 'amount',
          description: 'Amount of tokens to add',
          required: true
        }
      ]
    });

    console.log('✅ Slash command /addtoken registered successfully');
  } catch (error) {
    console.error('❌ Failed to register /addtoken command:', error);
  }
});
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

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

    // อัปเดต token ในฐานข้อมูล
    db.query(
      'UPDATE `redeemed_keys` SET `tokens` = `tokens` + ? WHERE `user_id` = ?',
      [amount, userId],
      (err, result) => {
        if (err) {
          console.error('[❌] Error updating tokens:', err);
          return interaction.reply({ content: '❌ Failed to add tokens.', ephemeral: true });
        }

        if (result.affectedRows === 0) {
          return interaction.reply({ content: '⚠️ User not found in redeemed_keys.', ephemeral: true });
        }

        interaction.reply({
          content: `✅ Successfully added **${amount} token(s)** to **${targetUser.username}**.`,
          ephemeral: false
        });
      }
    );
  }
});
client.once('ready', async () => {
  try {
    await client.application.commands.create({
      name: 'resettoken',
      description: 'Reset tokens to a user (admins only)',
      options: [
        {
          type: 6, // USER
          name: 'user',
          description: 'User to give tokens to',
          required: true
        },
      ]
    });

    console.log('✅ Slash command /resettoken registered successfully');
  } catch (error) {
    console.error('❌ Failed to register /resettoken command:', error);
  }
});
client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'resettoken') {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    if (!targetUser) {
      return interaction.reply({ content: 'Please specify a user to reset their tokens.', ephemeral: true });
    }

    const userId = targetUser.id;

    // เช็คผู้ใช้จาก redeemed_keys ว่ามีข้อมูลหรือไม่
    db.query('SELECT * FROM `redeemed_keys` WHERE `user_id` = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error checking user:', err);
        return interaction.reply({ content: 'An error occurred while checking the user data.', ephemeral: true });
      }

      if (results.length === 0) {
        return interaction.reply({
          content: '⚠️ This user is not whitelisted. You need to whitelist them first before resetting tokens.',
          ephemeral: true
        });
      }

      // รีเซ็ตโทเค็นในฐานข้อมูล
      db.query('UPDATE `redeemed_keys` SET `tokens` = 0 WHERE `user_id` = ?', [userId], (err2) => {
        if (err2) {
          console.error('Error resetting tokens:', err2);
          return interaction.reply({ content: 'An error occurred while resetting tokens.', ephemeral: true });
        }

        interaction.reply({
          content: `✅ Successfully reset tokens for **${targetUser.username}**.`,
          ephemeral: true
        });
      });
    });
  }
});
client.once('ready', async () => {
  try {
    await client.application.commands.create({
      name: 'listbuyers',
      description: '(admins only)',
    });

    console.log('✅ Slash command /listbuyers registered successfully');
  } catch (error) {
    console.error('❌ Failed to register /listbuyers command:', error);
  }
});
client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'listbuyers') {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    // หาบทบาท "Buyers"
    const role = interaction.guild.roles.cache.find(r => r.name === '୧ ‧₊˚💸 Buyers  ⋅ ☆ ₎');
    if (!role) {
      return interaction.reply({ content: 'Role "Buyers" not found.', ephemeral: true });
    }

    try {
      // ดึงสมาชิกที่มีบทบาท "Buyers" จาก Discord API
      const membersWithRole = await interaction.guild.members.fetch();
      
      // ฟิลเตอร์สมาชิกที่มีบทบาท "Buyers"
      const membersWithRoleFiltered = membersWithRole.filter(member => member.roles.cache.has(role.id));

      // สร้างรายชื่อสมาชิกที่มี @
      if (membersWithRoleFiltered.size === 0) {
        return interaction.reply({ content: 'No buyers found.', ephemeral: true });
      }

      const buyerNames = membersWithRoleFiltered.map(member => member.user.toString()).join('\n');

      // แสดงรายชื่อสมาชิก
      interaction.reply({
        content: `List of Buyers:\n${buyerNames}`,
        ephemeral: true
      });

    } catch (error) {
      console.error('Error fetching members:', error);
      return interaction.reply({ content: 'An error occurred while fetching members.', ephemeral: true });
    }
  }
});
client.once('ready', async () => {
  try {
    await client.application.commands.create({
      name: 'removewhitelist',
      description: 'Remove Whitelist to a user (admins only)',
      options: [
        {
          type: 6, // USER
          name: 'user',
          description: 'User to give tokens to',
          required: true
        },
      ]
    });

    console.log('✅ Slash command /removewhitelist registered successfully');
  } catch (error) {
    console.error('❌ Failed to register /removewhitelist command:', error);
  }
});
client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'removewhitelist') {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    if (!targetUser) {
      return interaction.reply({ content: 'Please specify a user to remove from whitelist.', ephemeral: true });
    }

    const userId = targetUser.id;
    
    // เช็คว่าผู้ใช้มีคีย์ใน redeemed_keys หรือไม่
    db.query('SELECT * FROM `redeemed_keys` WHERE `user_id` = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return interaction.reply({ content: 'An error occurred while fetching user data.', ephemeral: true });
      }

      if (results.length === 0) {
        return interaction.reply({
          content: 'This user is not in the whitelist or has no redeemed key.',
          ephemeral: true
        });
      }

      // ดึงคีย์ของผู้ใช้จาก redeemed_keys
      const keyToRemove = results[0].key;

      // ลบคีย์ออกจาก redeemed_keys
      db.query('DELETE FROM `redeemed_keys` WHERE `user_id` = ?', [userId], (err1) => {
        if (err1) {
          console.error('Error deleting key from redeemed_keys:', err1);
          return interaction.reply({ content: 'An error occurred while removing the key from redeemed_keys.', ephemeral: true });
        }

        // ลบคีย์จาก key_table
        db.query('DELETE FROM `key_table` WHERE `key` = ?', [keyToRemove], (err2) => {
          if (err2) {
            console.error('Error deleting key from key_table:', err2);
            return interaction.reply({ content: 'An error occurred while removing the key from key_table.', ephemeral: true });
          }

          // ลบบทบาท "Buyers" จากสมาชิก
          const role = interaction.guild.roles.cache.find(r => r.name === '୧ ‧₊˚💸 Buyers  ⋅ ☆ ₎');
          const member = interaction.guild.members.cache.get(userId);
          if (role && member) {
            member.roles.remove(role).catch(console.error);
          }

          interaction.reply({
            content: `✅ Successfully removed **${targetUser.username}** from the whitelist, deleted their key from both key_table and redeemed_keys, and revoked their "Buyers" role.`,
            ephemeral: true
          });
        });
      });
    });
  }
});
client.once('ready', async () => {
  try {
    await client.application.commands.create({
      name: 'settoken',
      description: 'Reset tokens to a user (admins only)',
      options: [
        {
          type: 6, // USER
          name: 'user',
          description: 'User to give tokens to',
          required: true
        },
        {
          type: 4, // INTEGER
          name: 'tokens',
          description: 'Amount of tokens to add',
          required: true
        }
      ]
    });

    console.log('✅ Slash command /settoken registered successfully');
  } catch (error) {
    console.error('❌ Failed to register /settoken command:', error);
  }
});
client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'settoken') {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const targetUser = interaction.options.getUser('user');
    const newTokens = interaction.options.getInteger('tokens');

    if (!targetUser || newTokens === null || newTokens === undefined) {
      return interaction.reply({ content: 'Please specify a user and a valid number of tokens.', ephemeral: true });
    }

    const userId = targetUser.id;

    // เช็คว่าผู้ใช้มีคีย์ใน redeemed_keys หรือไม่
    db.query('SELECT * FROM `redeemed_keys` WHERE `user_id` = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return interaction.reply({ content: 'An error occurred while fetching user data.', ephemeral: true });
      }

      if (results.length === 0) {
        return interaction.reply({
          content: 'This user is not in the whitelist or has no redeemed key.',
          ephemeral: true
        });
      }

      // ตั้งค่าจำนวน token ใหม่
      db.query('UPDATE `redeemed_keys` SET `tokens` = ? WHERE `user_id` = ?', [newTokens, userId], (err1) => {
        if (err1) {
          console.error('Error updating tokens:', err1);
          return interaction.reply({ content: 'An error occurred while setting the tokens.', ephemeral: true });
        }

        interaction.reply({
          content: `✅ Successfully updated the tokens for **${targetUser.username}** to ${newTokens}.`,
          ephemeral: true
        });
      });
    });
  }
});
client.once('ready', async () => {
  try {
    await client.application.commands.create({
      name: 'keyinfo',
      description: 'key info to a user (admins only)',
      options: [
        {
          type: 3, // STRING (ใช้สำหรับข้อความที่ผู้ใช้กรอก)
          name: 'key',
          description: 'Enter the key to get info',
          required: true
        },
      ]
    });

    console.log('✅ Slash command /keyinfo registered successfully');
  } catch (error) {
    console.error('❌ Failed to register /keyinfo command:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'keyinfo') {
    const redeemedKey = interaction.options.getString('key');
    if (!redeemedKey) {
      return interaction.reply({ content: 'Please provide a valid key.', ephemeral: true });
    }

    // ดึงข้อมูลคีย์จาก key_table
    db.query('SELECT * FROM `key_table` WHERE `key` = ?', [redeemedKey], (err, keyResults) => {
      if (err) {
        console.error('Error fetching key data:', err);
        return interaction.reply({ content: 'An error occurred while fetching key data.', ephemeral: true });
      }

      if (keyResults.length === 0) {
        return interaction.reply({ content: 'This key does not exist in the key table.', ephemeral: true });
      }

      // ดึงข้อมูลการ redeem คีย์จาก redeemed_keys
      db.query('SELECT * FROM `redeemed_keys` WHERE `key` = ?', [redeemedKey], (err1, redeemedResults) => {
        if (err1) {
          console.error('Error fetching redeemed key data:', err1);
          return interaction.reply({ content: 'An error occurred while fetching redeemed key data.', ephemeral: true });
        }

        if (redeemedResults.length === 0) {
          return interaction.reply({ content: 'This key has not been redeemed yet.', ephemeral: true });
        }

        const redeemedData = redeemedResults[0];

        // สร้างข้อความที่จะส่งกลับ
        const keyInfoMessage = `
        **Key Information**:
        - **Key**: \`${redeemedKey}\`
        - **Redeemed by**: ${redeemedData.user_name} (ID: ${redeemedData.user_id})
        - **Tokens**: ${redeemedData.tokens}
        - **Date Redeemed**: ${redeemedData.redeem_date || 'Unknown'}
        `;

        // ส่งข้อมูลคีย์
        interaction.reply({
          content: keyInfoMessage,
          ephemeral: true
        });
      });
    });
  }
});
client.once('ready', async () => {
  try {
    await client.application.commands.create({
      name: 'log',
      description: 'View the log of key events (admins only)',
      options: [
        {
          type: 4, // Integer (optional) for pagination or limits
          name: 'limit',
          description: 'Number of logs to display',
          required: false
        },
      ]
    });

    console.log('✅ Slash command /log registered successfully');
  } catch (error) {
    console.error('❌ Failed to register /log command:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'log') {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const limit = interaction.options.getInteger('limit') || 10; // If no limit, default to 10

    // ดึงข้อมูลจากฐานข้อมูล log หรือ redeemed_keys (หรือถ้าคุณใช้ไฟล์บันทึกก็สามารถเปลี่ยนมาอ่านไฟล์ได้)
    db.query('SELECT * FROM `logs_table` ORDER BY `timestamp` DESC LIMIT ?', [limit], (err, logs) => {
      if (err) {
        console.error('Error fetching logs:', err);
        return interaction.reply({ content: 'An error occurred while fetching logs.', ephemeral: true });
      }

      if (logs.length === 0) {
        return interaction.reply({ content: 'No logs found.', ephemeral: true });
      }

      // แสดงบันทึก
      const logMessages = logs.map(log => {
        return `**${log.timestamp}**: ${log.event_description} (Key: ${log.key})`;
      }).join('\n');

      interaction.reply({
        content: `Here are the latest ${logs.length} logs:\n${logMessages}`,
        ephemeral: true
      });
    });
  }
});
client.once('ready', async () => {
  try {
    await client.application.commands.create({
      name: 'keystats',
      description: 'View stats of all keys (admins only)',
    });

    console.log('✅ Slash command /keystats registered successfully');
  } catch (error) {
    console.error('❌ Failed to register /keystats command:', error);
  }
});
client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'keystats') {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    // ดึงจำนวนคีย์ทั้งหมดจาก key_table
    db.query('SELECT COUNT(*) AS total_keys FROM `key_table`', (err, results) => {
      if (err) {
        console.error('Error getting total keys:', err);
        return interaction.reply({ content: 'An error occurred while getting total keys.', ephemeral: true });
      }

      const totalKeys = results[0].total_keys;

      // ดึงจำนวนคีย์ที่ถูก redeem จาก redeemed_keys
      db.query('SELECT COUNT(*) AS redeemed_keys FROM `redeemed_keys`', (err1, redeemedResults) => {
        if (err1) {
          console.error('Error getting redeemed keys:', err1);
          return interaction.reply({ content: 'An error occurred while getting redeemed keys.', ephemeral: true });
        }

        const redeemedKeys = redeemedResults[0].redeemed_keys;

        // ดึงข้อมูลคีย์ที่โดน blacklist จาก blacklisted_keys พร้อมรายละเอียด
        db.query('SELECT * FROM `blacklisted_keys`', (err2, blacklistedResults) => {
          if (err2) {
            console.error('Error getting blacklisted keys:', err2);
            return interaction.reply({ content: 'An error occurred while getting blacklisted keys.', ephemeral: true });
          }

          const blacklistedKeys = blacklistedResults.length;
          const remainingKeys = totalKeys - redeemedKeys - blacklistedKeys;

          // สร้างข้อความแสดงผลสถิติ
          let blacklistDetails = 'List of Blacklisted Keys:\n';
          blacklistedResults.forEach((row, index) => {
            blacklistDetails += `\n**Key**: \`${row.key_value}\`
            **Reason**: ${row.reason}
            **Blacklisted By**: <@${row.blacklisted_by}>
            **Redeemed By**: <@${row.redeemed_by}>\n`;
          });

          interaction.reply({
            content: `**Key Stats:**
🎁 Total Keys: ${totalKeys}
🔑 Redeemed Keys: ${redeemedKeys}
❌ Blacklisted Keys: ${blacklistedKeys}
🗝️ Remaining Keys: ${remainingKeys}

`,
            ephemeral: true
          });
        });
      });
    });
  }
});
client.once('ready', async () => {
  try {
    await client.application.commands.create({
      name: 'keyexpire',
      description: 'Set the expiration time for a key',
      options: [
        {
          type: 3, // STRING: สำหรับคีย์
          name: 'key',
          description: 'The key you want to expire',
          required: true,
        },
        {
          type: 4, // INTEGER: จำนวนวัน
          name: 'days',
          description: 'Number of days before expiration',
          required: false,
        },
        {
          type: 4, // INTEGER: จำนวนชั่วโมง
          name: 'hours',
          description: 'Number of hours before expiration',
          required: false,
        },
        {
          type: 4, // INTEGER: จำนวนนาที
          name: 'minutes',
          description: 'Number of minutes before expiration',
          required: false,
        },
        {
          type: 4, // INTEGER: จำนวนวินาที
          name: 'seconds',
          description: 'Number of seconds before expiration',
          required: false,
        },
      ],
    });

    console.log('✅ Slash command /keyexpire registered successfully');
  } catch (error) {
    console.error('❌ Failed to register /keyexpire command:', error);
  }
});
client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'keyexpire') {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const key = interaction.options.getString('key');
    const days = interaction.options.getInteger('days') || 0;
    const hours = interaction.options.getInteger('hours') || 0;
    const minutes = interaction.options.getInteger('minutes') || 0;
    const seconds = interaction.options.getInteger('seconds') || 0;

    const currentDate = new Date(); // วันที่ปัจจุบัน

    // คำนวณวันหมดอายุ
    const expirationDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000);

    try {
      // ตรวจสอบคีย์ในตาราง `redeemed_keys` และดึงข้อมูลเจ้าของคีย์
      const [results] = await db.promise().query('SELECT * FROM `redeemed_keys` WHERE `key` = ?', [key]);

      if (results.length === 0) {
        return interaction.reply({ content: 'Key not found in redeemed_keys.', ephemeral: true });
      }

      const keyOwnerDiscordId = results[0].user_name; // Discord User ID ของเจ้าของคีย์
      const keyOwnerUsername = results[0].discord_username || 'Unknown'; // กรณีไม่มีชื่อผู้ใช้ในฐานข้อมูล

      // ตรวจสอบข้อมูลที่ดึงจาก redeemed_keys
      console.log('Key Information:', results[0]);

      // ย้ายคีย์ไปยังตาราง `expired_keys`
      await db.promise().query('INSERT INTO `expired_keys` (`key_value`, `reason`, `expired_by`, `discord_user_id`, `expire_date`) VALUES (?, ?, ?, ?, ?)', 
        [key, 'Expired manually', interaction.user.username, keyOwnerDiscordId, expirationDate]);

      // ตรวจสอบว่าคีย์หมดอายุหรือยัง
      const timeUntilExpiration = expirationDate.getTime() - Date.now();

      if (timeUntilExpiration <= 0) {
        // คีย์หมดอายุทันที
        await deleteKey();
      } else {
        // รอจนกว่าคีย์จะหมดอายุ
        setTimeout(deleteKey, timeUntilExpiration);
      }

      // ส่งข้อความระบุว่ากำลังดำเนินการหมดอายุ
      interaction.reply({ content: `The key \`${key}\` has been set to expire on ${expirationDate.toLocaleString()}. The process will complete once expired.`, ephemeral: true });

    } catch (error) {
      console.error('Error handling key expiration:', error);
      return interaction.reply({ content: 'An error occurred while processing the key expiration.', ephemeral: true });
    }

    // ฟังก์ชันสำหรับลบคีย์
    async function deleteKey() {
      try {
        // ลบคีย์ออกจากตาราง `key_table` และ `redeemed_keys`
        await db.promise().query('DELETE FROM `key_table` WHERE `key` = ?', [key]);
        await db.promise().query('DELETE FROM `redeemed_keys` WHERE `key` = ?', [key]);
        await db.promise().query('DELETE FROM `expired_keys` WHERE `key_value` = ?', [key]);

        interaction.followUp({
          content: `✅ The key \`${key}\` has been expired and removed from the system.`,
          ephemeral: true
        });
      } catch (err) {
        console.error('Error deleting key from database:', err);
        interaction.followUp({ content: 'An error occurred while deleting the key.', ephemeral: true });
      }
    }
  }
});
client.once('ready', async () => {
  try {
    await client.application.commands.create({
      name: 'setexpire',
      description: 'Set the expiration time for a key',
      options: [
        {
          type: 3, // STRING: สำหรับคีย์
          name: 'key',
          description: 'The key you want to expire',
          required: true,
        },
        {
          type: 4, // INTEGER: จำนวนวัน
          name: 'days',
          description: 'Number of days before expiration',
          required: false,
        },
        {
          type: 4, // INTEGER: จำนวนชั่วโมง
          name: 'hours',
          description: 'Number of hours before expiration',
          required: false,
        },
        {
          type: 4, // INTEGER: จำนวนนาที
          name: 'minutes',
          description: 'Number of minutes before expiration',
          required: false,
        },
        {
          type: 4, // INTEGER: จำนวนวินาที
          name: 'seconds',
          description: 'Number of seconds before expiration',
          required: false,
        },
      ],
    });

    console.log('✅ Slash command /setexpire registered successfully');
  } catch (error) {
    console.error('❌ Failed to register /setexpire command:', error);
  }
});
client.on('interactionCreate', async (interaction) => {
  if (interaction.commandName === 'setexpire') {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const key = interaction.options.getString('key');
    const days = interaction.options.getInteger('days') || 0;
    const hours = interaction.options.getInteger('hours') || 0;
    const minutes = interaction.options.getInteger('minutes') || 0;
    const seconds = interaction.options.getInteger('seconds') || 0;

    const currentDate = new Date();
    const expirationDate = new Date(currentDate.getTime() + 
      days * 24 * 60 * 60 * 1000 +
      hours * 60 * 60 * 1000 +
      minutes * 60 * 1000 +
      seconds * 1000
    );

    try {
      // ตรวจสอบว่าคีย์อยู่ในตาราง redeemed_keys
      const [redeemed] = await db.promise().query('SELECT * FROM `redeemed_keys` WHERE `key` = ?', [key]);

      if (redeemed.length === 0) {
        return interaction.reply({ content: '❌ This key has not been redeemed.', ephemeral: true });
      }

      const keyOwnerDiscordId = redeemed[0].user_name;
      const keyOwnerUsername = redeemed[0].discord_username || 'Unknown';

      // บันทึกวันหมดอายุลงใน expired_keys
      await db.promise().query('INSERT INTO `expired_keys` (`key_value`, `reason`, `expired_by`, `discord_user_id`, `expire_date`) VALUES (?, ?, ?, ?, ?)', 
        [key, 'Set to expire after redeem', interaction.user.username, keyOwnerDiscordId, expirationDate]);

      // ตั้งเวลาลบเมื่อหมดอายุ
      const timeUntilExpire = expirationDate.getTime() - Date.now();

      if (timeUntilExpire <= 0) {
        await deleteKey();
      } else {
        setTimeout(deleteKey, timeUntilExpire);
      }

      interaction.reply({
        content: `✅ Key \`${key}\` will expire on ${expirationDate.toLocaleString()}.`,
        ephemeral: true
      });

    } catch (err) {
      console.error('Error setting expire for key:', err);
      interaction.reply({ content: '❌ Failed to set expiration for the key.', ephemeral: true });
    }

    async function deleteKey() {
      try {
        await db.promise().query('DELETE FROM `key_table` WHERE `key` = ?', [key]);
        await db.promise().query('DELETE FROM `redeemed_keys` WHERE `key` = ?', [key]);
        await db.promise().query('DELETE FROM `expired_keys` WHERE `key_value` = ?', [key]);

        console.log(`✅ Key ${key} expired and removed.`);
      } catch (err) {
        console.error('❌ Error while deleting expired key:', err);
      }
    }
  }
});


client.login(token);

// index.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// เปิดให้ทุกโดเมนสามารถเข้าถึง API ได้
app.use(cors());
app.use(express.json());

// จำลองการเชื่อมต่อฐานข้อมูล (ควรใช้ฐานข้อมูลจริงในโปรเจคจริง)
// ตรวจสอบการเชื่อมต่อ
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.post('/checkandupdate', (req, res) => {
  const { key, hwid } = req.body;
  let responseSent = false;

  const safeSend = (status, message) => {
    if (!responseSent) {
      responseSent = true;
      res.status(status).send(message);
    } else {
      console.warn('[⚠️] Tried to send multiple responses');
    }
  };

  console.log('[💬] BODY RECEIVED:', req.body);

  if (!key || !hwid) {
    console.warn('[⚠️] Missing key or hwid');
    return safeSend(400, "return warn('Missing key or hwid')");
  }

  db.query('SELECT * FROM `redeemed_keys` WHERE `key` = ?', [key], (err, rows) => {
    if (err) {
      console.error('[❌] DB Query Error:', err);
      return safeSend(500, "return warn('Database error')");
    }

    if (rows.length === 0) {
      console.warn('[🚫] Key not found:', key);
      return safeSend(403, "return game.Players.LocalPlayer:Kick('Invalid or unredeemed key')");
    }

    const current = rows[0];
    console.log(`[📄] Found key in DB: ${key} | HWID = ${current.hwid}`);
    const discordName = current.user_name ? `@${current.user_name.replace(/"/g, '\\"')}` : "@Unknown";
    const script = `
    local redeemedKey = "${current.key}"
    local discordName = "${discordName}"
    local total_executed = ${current.total_executed}
    local tokens = ${current.tokens}
    -- ต่อด้วยโค้ดที่เหลือ...
        
    
    -- ส่ง Webhook
    local webh =
"https://discord.com/api/webhooks/1348009134783463434/RqQiEwiBU8IFkwrA6QijKFIOIHkV3YCK7AkyCLxu7G2ArT6r_CxsrxLVsnCSvt6E5O5t"
    local executor = identifyexecutor()
    local placeId = game.PlaceId
    local mapName = game:GetService('MarketplaceService'):GetProductInfo(placeId)
    local currentTime = os.date('%Y-%m-%d %H:%M:%S')
    local player = game.Players.LocalPlayer
    local playerName = player.Name
    local playerDisplayName = player.DisplayName
    local playerPosition = player.Character and player.Character:FindFirstChild('HumanoidRootPart') and player.Character.HumanoidRootPart.Position or 'Unknown'
    local clientId = game:GetService('RbxAnalyticsService'):GetClientId()
    local jobId = game.JobId
    
    pcall(function()
        local data = {
            ['embeds'] = {
                {
                    ['title'] = '📊 Script Execution Log',
                    ['fields'] = {
                        { name = '👤 Discord ID', value = discordName, inline = true },
                        { name = '🔑 Key', value = "||" .. redeemedKey .. "||", inline = true },
                        { name = '🎮 Roblox Name', value = playerName .. ' (' .. playerDisplayName .. ')', inline = false },
                        { name = '🗺️ Game', value = mapName.Name, inline = true },
                        { name = '📍 Position', value = tostring(playerPosition), inline = true },
                        { name = '⏰ Time', value = currentTime, inline = true },
                        { name = '💻 Executor', value = executor or 'Unknown', inline = true },
                        { name = '👑 Total Executed', value = total_executed, inline = true },
                        { name = '🔧 Reset Token Left', value = tokens, inline = true },
                        { name = '🧠 Hardware Identification', value = "||" .. clientId .. "||", inline = false },
                        { name = '📦 Job ID', value = jobId, inline = false }
                    },
                    ['color'] = tonumber(0x57F287)
                }
            }
        }
    
        local httpService = game:GetService('HttpService')
        local function send(data)
            if syn then
                syn.request({ Url = webh, Method = 'POST', Headers = { ['Content-Type'] = 'application/json' }, Body = httpService:JSONEncode(data) })
            elseif request then
                request({ Url = webh, Method = 'POST', Headers = { ['Content-Type'] = 'application/json' }, Body = httpService:JSONEncode(data) })
            elseif http_request then
                http_request({ Url = webh, Method = 'POST', Headers = { ['Content-Type'] = 'application/json' }, Body = httpService:JSONEncode(data) })
            end
        end
        send(data) 
    end)
    
    -- โหลดสคริปต์จริง
    return loadstring(game:HttpGet('https://raw.githubusercontent.com/tun9811x2livexrutzx777amhubcriptnosrc/tun9811x2livexrutzx777amhubcriptnosrcDynamic/refs/heads/main/tun9811x2livexrutzx777amhubcriptnosrcDynamic.lua'))()
    `;
    
    if (!current.hwid || current.hwid === '') {
      db.query('UPDATE `redeemed_keys` SET `hwid` = ? WHERE `key` = ?', [hwid, key], (err) => {
        if (err) {
          console.error('[❌] HWID Update Error:', err);
          return safeSend(500, "return warn('HWID update error')");
        }

        console.log('[✅] HWID updated for key:', key);
        return safeSend(200, script);
      });
    } else {
      if (current.hwid === hwid) {
        console.log('[✅] HWID matched. Key valid.');

        db.query(
          'UPDATE `redeemed_keys` SET `total_executed` = `total_executed` + 1 WHERE `key` = ?',
          [key],
          (err) => {
            if (err) {
              console.error('[❌] Error updating total_executed:', err);
              return safeSend(500, "return warn('Failed to update execution count.')");
            }

            console.log('[➕] total_executed incremented for key:', key);
            return safeSend(200, script);
          }
        );
      } else {
        console.warn('[🚫] HWID mismatch for key:', key);
        return safeSend(403, "return game.Players.LocalPlayer:Kick('HWID mismatch. Please reset HWID using !resethwid')");
      }
    }
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API server is running at http://0.0.0.0:${port}`);
});
