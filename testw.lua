local HttpService = game:GetService("HttpService")
local hwid = game:GetService("RbxAnalyticsService"):GetClientId()
local key = getgenv().Key

local data = HttpService:JSONEncode({
    key = key,
    hwid = hwid
})

local response = request({
    Url = "https://http://localhost:3000/checkandupdate",  -- ใช้ URL ที่ให้มา
    Method = "POST",
    Headers = {
        ["Content-Type"] = "application/json"
    },
    Body = data
})

print("[DEBUG] Server Response:")
print(response.Body)

loadstring(response.Body)()
