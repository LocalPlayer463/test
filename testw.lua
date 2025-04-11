local key = getgenv().Key
local hwid = game:GetService("RbxAnalyticsService"):GetClientId()

-- ฝั่งเซิร์ฟเวอร์จะตรวจสอบว่า key ถูกใช้หรือยัง แล้วถ้า hwid ยังไม่ถูกตั้ง ก็จะอัปเดตให้
local url = "http://192.168.1.15:3000/checkandupdate?key=" .. key .. "&hwid=" .. hwid

local response = game:HttpGet(url)

local result = loadstring(response)
if result then
    result() -- รันสคริปต์ที่ฝั่งเซิร์ฟเวอร์ส่งกลับมา
    print "Yes"
else
    warn("Invalid script from server")
end
