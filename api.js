require('dotenv').config();
const axios = require('axios');
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, Events, Partials } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Message, Partials.Channel]
});

// Obfuscator Lua แบบที่ทำให้คล้ายกับ Lura.ph
function advancedLuaObfuscator(code) {
  const reserved = [
    'local', 'function', 'end', 'then', 'if', 'else', 'elseif', 'for',
    'while', 'do', 'return', 'true', 'false', 'nil', 'and', 'or', 'not'
  ];

  const dontTouch = ['game', 'workspace', 'script', 'CFrame', 'Vector3', 'math'];
  const nameMap = new Map();
  const functionNames = new Set();

  // ฟังก์ชันสำหรับ obfuscate ชื่อ
  function obfuscateName(original) {
    if (reserved.includes(original) || dontTouch.includes(original)) return original;
    if (nameMap.has(original)) return nameMap.get(original);

    const obf = '_0x' + Math.random().toString(36).slice(2, 10);
    nameMap.set(original, obf);
    return obf;
  }

  // ขั้นตอนที่ 1: จับชื่อฟังก์ชันที่นิยามไว้ และเก็บไว้ใน Set
  code = code.replace(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, name) => {
    const obfName = obfuscateName(name);
    functionNames.add(name);  // เก็บชื่อฟังก์ชันที่นิยามไว้ใน Set
    return `function ${obfName}`;
  });

  // ขั้นตอนที่ 2: แทนชื่อที่ถูกเรียก ถ้าเคยนิยามไว้
  code = code.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, (match, name) => {
    // ไม่แตะ reserved, dontTouch หรือ object.method เช่น CFrame.new
    if (reserved.includes(name) || dontTouch.includes(name)) return match;

    // ข้าม object.method เช่น CFrame.new
    const prevChar = code[code.indexOf(match) - 1];
    if (prevChar === '.') return match;

    // ถ้าเคยประกาศเป็นฟังก์ชัน
    if (functionNames.has(name)) {
      return obfuscateName(name) + '(';
    }

    // เพิ่มความซับซ้อนโดยการแปลงชื่อฟังก์ชันหรือตัวแปรที่เรียก
    const obfName = obfuscateName(name);
    return `${obfName}${Math.random().toString(36).slice(2, 5)}(`;
  });

  // เพิ่มความซับซ้อนโดยการแทรกค่า random ระหว่างตัวแปร
  code = code.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, (match, name) => {
    if (reserved.includes(name) || dontTouch.includes(name)) return match;
    if (nameMap.has(name)) return nameMap.get(name);
    return obfuscateName(name);
  });

  // แนวนอนและลบช่องว่างซ้ำซ้อน
  return code.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}


// Map เก็บไฟล์จาก message.id
const uploadedLuaMap = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.attachments.size) return;

  const file = message.attachments.first();
  if (!file.name.endsWith('.lua')) {
    return message.reply('⚠️ กรุณาอัปโหลดไฟล์ `.lua` เท่านั้น');
  }

  try {
    // เช็ค URL และดาวน์โหลดไฟล์
    const response = await axios.get(file.url);
    const code = response.data;

    uploadedLuaMap.set(message.id, code);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`obfuscate_${message.id}`)
        .setLabel('Obfuscate')
        .setStyle(ButtonStyle.Primary)
    );

    await message.reply({
      content: `📄 รับไฟล์ **${file.name}** แล้ว กดปุ่มเพื่อ Obfuscate`,
      components: [row]
    });
  } catch (err) {
    console.error('❌ เกิดข้อผิดพลาดตอนโหลดไฟล์:', err.message);
    message.reply('❌ โหลดไฟล์ไม่สำเร็จ: ' + err.message);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;
  if (!customId.startsWith('obfuscate_')) return;

  const messageId = customId.split('_')[1];
  const code = uploadedLuaMap.get(messageId);

  if (!code) {
    return interaction.reply({ content: '❌ ไม่พบโค้ดที่อัปโหลดไว้', ephemeral: true });
  }

  const obf = advancedLuaObfuscator(code);

  if (obf.length > 1900) {
    const file = new AttachmentBuilder(Buffer.from(obf, 'utf-8'), { name: 'obfuscated.lua' });
    return interaction.reply({
      content: '🌀 Obfuscate สำเร็จ! โค้ดยาวเลยแนบไฟล์ให้แทน',
      files: [file]
    });
  } else {
    return interaction.reply({ content: '```lua\n' + obf + '\n```' });
  }
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN || 'MTM1OTkwNTU4MzEyMTE3NDc4MA.GV1ozs.fiWTZ-C0EEYPWljxQ8SYfmcWNAsTwQ0ttwsGOo'); // ใช้ .env หรือแทนที่ token ตรงนี้
