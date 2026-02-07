

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

