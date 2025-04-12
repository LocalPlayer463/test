local HttpService = game:GetService("HttpService")
local hwid = game:GetService("RbxAnalyticsService"):GetClientId()
local key = getgenv().Key

local data = HttpService:JSONEncode({
    key = key,
    hwid = hwid
})

local response = request({
    Url = "https://2e6a3cf8-69fd-4a7f-801f-71d46fd62d67-00-o1dflpw569ms.pike.replit.dev/checkandupdate", -- หรือเปลี่ยนเป็น IP เครื่อง server
    Method = "POST",
    Headers = {
        ["Content-Type"] = "application/json"
    },
    Body = data
})

print("[DEBUG] Server Response:")
print(response.Body)

loadstring(response.Body)()
