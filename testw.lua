local HttpService = game:GetService("HttpService")

local key = getgenv().Key
local hwid = tostring(game:GetService("RbxAnalyticsService"):GetClientId())

local success, response = pcall(function()
    return HttpService:PostAsync(
        "http://localhost:3000/updatehwid",
        HttpService:JSONEncode({ key = key, hwid = hwid }),
        Enum.HttpContentType.ApplicationJson,
        false
    )
end)

if success then
    local data = HttpService:JSONDecode(response)
    print("✅ Server Response: " .. data.message)
else
    warn("❌ HTTP Request Failed: " .. tostring(response))
end
