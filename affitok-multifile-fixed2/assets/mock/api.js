const MOCK_API = {
            accounts: [
                { id: 1, name: "Affitok Fanpage", platform: "Facebook", status: "active", expires: "30/12/2025" },
                { id: 2, name: "@affitok_official", platform: "TikTok", status: "active", expires: "25/12/2025" },
                { id: 3, name: "Cộng đồng Sáng tạo", platform: "Facebook", status: "expired", expires: "01/11/2025" },
                { id: 4, name: "Admin (Cá nhân)", platform: "Facebook", status: "error", expires: "N/A" }
            ],
            logs: [
                { time: "2025-11-08 18:30:05", platform: "Facebook", action: "Đăng bài", status: "success", details: "ID: 123456789" },
                { time: "2025-11-08 18:15:10", platform: "TikTok", action: "Tải lên", status: "error", details: "Lỗi: (403) Token không hợp lệ. Vui lòng kết nối lại." },
                { time: "2025-11-08 17:00:00", platform: "System", action: "Làm mới Token", status: "success", details: "Tài khoản @affitok_official" },
                { time: "2025-11-07 14:20:00", platform: "Video", action: "Render", status: "success", details: "Video 'Tổng kết tuần' (1m 30s)" }
            ],
            // MỚI: Mock data cho Affiliate
            affCampaigns: [
                { id: 1, name: "Shopee 11.11 Siêu Sale", network: "AccessTrade", status: "active", payout: "5% / CPS", expires: "12/11/2025" },
                { id: 2, name: "Tài khoản Mở Mới (Bank)", network: "AdFlex", status: "active", payout: "$5 / CPL", expires: "31/12/2025" },
                { id: 3, name: "App XYZ Cài đặt", network: "MasOffer", status: "paused", payout: "$0.5 / CPI", expires: "N/A" },
            ],
            affReports: [
                { date: "2025-11-07", clicks: 1520, leads: 52, approvals: 40, rejects: 5, revenue: 150.75 },
                { date: "2025-11-06", clicks: 1400, leads: 45, approvals: 35, rejects: 2, revenue: 120.50 },
                { date: "2025-11-05", clicks: 1650, leads: 60, approvals: 48, rejects: 7, revenue: 180.00 },
            ],
            affPayouts: [
                { id: 1, date: "2025-10-15", amount: 1500.00, method: "Bank Transfer", status: "completed" },
                { id: 2, date: "2025-09-15", amount: 1250.50, method: "PayPal", status: "completed" },
                { id: 3, date: "2025-11-01", amount: 5320.50, method: "Bank Transfer", status: "pending" },
            ],
            affNetworks: [
                { id: 1, name: "AccessTrade", vertical: "E-commerce, Finance", status: "active" },
                { id: 2, name: "AdFlex", vertical: "CPL, Finance", status: "active" },
                { id: 3, name: "MasOffer", vertical: "E-commerce", status: "error" },
            ]
        };
