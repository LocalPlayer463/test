local HttpService = game:GetService("HttpService")
local hwid = game:GetService("RbxAnalyticsService"):GetClientId()
local key = getgenv().Key

local data = HttpService:JSONEncode({
    key = key,
    hwid = hwid
})

local response = request({
    Url = "https://f43a-1-1-240-96.ngrok-free.app/checkandupdate",  -- ใช้ URL ที่ได้รับจาก Ngrok
    Method = "POST",
    Headers = {
        ["Content-Type"] = "application/json"
    },
    Body = data
})

print("[DEBUG] Server Response:")
print(response.Body)

loadstring(response.Body)()
