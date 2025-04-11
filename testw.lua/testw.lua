
local HttpService = game:GetService("HttpService")
local hwid = game:GetService("RbxAnalyticsService"):GetClientId()
local key = getgenv().Key

local data = HttpService:JSONEncode({
    key = key,
    hwid = hwid
})

local response = request({
    Url = "http://localhost:3000/checkandupdate", -- เปลี่ยนเป็น URL ที่คุณโฮสต์ไว้
    Method = "POST",
    Headers = {
        ["Content-Type"] = "application/json"
    },
    Body = data
})

loadstring(response.Body)()
