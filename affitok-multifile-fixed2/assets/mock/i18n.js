/* Mô phỏng tệp /i18n/vi.json */
        const i18n = {
            sidebar: {
                group: {
                    core: "Chức năng chính",
                    posting: "Đăng bài",
                    affiliate: "Affiliate", // MỚI
                    management: "Quản lý",
                    system: "Hệ thống"
                },
                dashboard: "Tổng quan",
                promptStudio: "Prompt Studio",
                videoFactory: "Video Factory",
                fbPoster: "Đăng Facebook",
                tkUploader: "Đăng TikTok",
                scheduler: "Lịch đăng",
                templates: "Mẫu nội dung",
                library: "Thư viện",
                analytics: "Báo cáo (MXH)", // Cập nhật
                accounts: "Tài khoản kết nối",
                logs: "Nhật ký & Lỗi",
                settings: "Cài đặt",
                help: "Trợ giúp",
                // MỚI: Affiliate
                affDashboard: "Tổng quan (Aff)",
                affCampaigns: "Chiến dịch",
                affLinks: "Trình tạo Link",
                affReports: "Báo cáo",
                affPayouts: "Thanh toán",
                affAssets: "Tài nguyên",
                affNetworks: "Mạng liên kết",
                affCompliance: "Tuân thủ"
            },
            header: {
                search: "Tìm kiếm...",
                create: "Tạo mới",
                notifications: "Thông báo",
                settings: "Cài đặt",
                account: "Tài khoản"
            },
            breadcrumb: {
                home: "Affitok"
            },
            common: {
                save: "Lưu",
                saveDraft: "Lưu nháp",
                cancel: "Huỷ",
                close: "Đóng",
                submit: "Gửi",
                update: "Cập nhật",
                delete: "Xoá",
                edit: "Sửa",
                view: "Xem",
                viewAll: "Xem tất cả",
                filter: "Lọc",
                schedule: "Lên lịch",
                upload: "Tải lên",
                import: "Nhập",
                export: "Xuất",
                getLink: "Lấy Link", // MỚI
                copy: "Copy", // MỚI
                copyCode: "Copy Snippet", // MỚI
                download: "Tải về", // MỚI
                choose: "Chọn", // MỚI
                insertAffLink: "Chèn Link Affiliate", // MỚI
                time: {
                    minutesAgo: "{value} phút trước",
                    hoursAgo: "{value} giờ trước"
                },
                table: {
                    name: "Tên",
                    type: "Loại",
                    status: "Trạng thái",
                    updated: "Cập nhật",
                    actions: "Hành động"
                },
                weekdays: {
                    sun: "CN", mon: "T2", tue: "T3", wed: "T4", thu: "T5", fri: "T6", sat: "T7"
                }
            },
            status: {
                processing: "Đang xử lý",
                completed: "Hoàn tất",
                error: "Lỗi",
                scheduled: "Đã lên lịch",
                active: "Hoạt động",
                expired: "Hết hạn",
                paused: "Tạm dừng", // MỚI
                approved: "Đã duyệt", // MỚI
                pending: "Chờ xử lý" // MỚI
            },
            dashboard: {
                stat1: { title: "Dự án hôm nay" },
                stat2: { title: "Lượt render" },
                stat3: { title: "Bài đã đăng" },
                stat4: { title: "Đăng lỗi" },
                chart1: "Demo Biểu đồ (Hoạt động đăng bài)",
                recentActivity: "Hoạt động gần đây"
            },
            prompt: {
                title: "Trình biên tập Prompt",
                name: "Tên Prompt",
                namePlaceholder: "Ví dụ: Kịch bản review phim...",
                goal: "Mục tiêu",
                goalPlaceholder: "Tạo kịch bản video ngắn 60 giây...",
                content: "Nội dung Prompt",
                contentPlaceholder: "Nhập nội dung prompt của bạn tại đây...",
                presets: "Mẫu có sẵn (Preset)"
            },
            video: {
                title: "Xưởng sản xuất Video",
                desc: "Nhập kịch bản hoặc prompt để tạo video tự động.",
                script: "Kịch bản / Prompt",
                template: "Chọn mẫu Video",
                generate: "Tạo Storyboard",
                queue: "Danh sách chờ render"
            },
            fb: {
                title: "Soạn bài đăng Facebook",
                target: "Đăng lên",
                content: "Nội dung",
                contentPlaceholder: "Bạn đang nghĩ gì...",
                media: "Đính kèm Ảnh/Video",
                postNow: "Đăng ngay",
                preview: "Xem trước",
                previewDesc: "(Bản xem trước bài đăng Facebook sẽ hiển thị ở đây)",
                scheduled: "Lịch sắp đăng (FB)",
                scheduledDesc: "(Danh sách bài đã lên lịch...)",
                affLink: "Link Affiliate", // MỚI
                affLinkPlaceholder: "https://aff.link/..." // MỚI
            },
            tk: {
                title: "Tải video lên TikTok",
                video: "Video",
                dragDrop: "Kéo và thả video của bạn vào đây",
                selectFile: "hoặc chọn tệp để tải lên",
                caption: "Tiêu đề (Caption)",
                captionPlaceholder: "Mô tả video của bạn, thêm #hashtag @mention...",
                privacy: "Quyền riêng tư",
                public: "Công khai",
                friends: "Bạn bè",
                private: "Riêng tư",
                upload: "Tải lên",
                history: "Lịch sử tải lên (TK)",
                historyDesc: "(Danh sách video đã tải lên...)",
                affLink: "Link Affiliate (trong Bio)", // MỚI
                affLinkPlaceholder: "https://aff.link/..." // MỚI
            },
            scheduler: {
                title: "Lịch đăng nội dung",
                schedulePost: "Lên lịch",
                month: "Tháng 11, 2025"
            },
            templates: {
                title: "Quản lý Mẫu nội dung",
                create: "Tạo mẫu mới",
                table: {
                    name: "Tên mẫu",
                    content: "Nội dung (Preview)",
                    updated: "Cập nhật"
                }
            },
            library: {
                title: "Thư viện Tài nguyên"
            },
            analytics: {
                fbReach: "Facebook Reach (30d)",
                tkViews: "TikTok Views (30d)",
                videos: "Videos đã tạo",
                chart1: "Demo Biểu đồ (Tăng trưởng tương tác)"
            },
            accounts: {
                title: "Tài khoản kết nối",
                connect: "Kết nối tài khoản mới",
                table: {
                    account: "Tài khoản",
                    platform: "Nền tảng",
                    expires: "Ngày hết hạn (Token)"
                }
            },
            logs: {
                title: "Nhật ký & Lỗi hệ thống",
                table: {
                    time: "Thời gian",
                    platform: "Nền tảng",
                    action: "Hành động",
                    details: "Chi tiết"
                }
            },
            settings: {
                tabs: {
                    general: "Chung",
                    appearance: "Giao diện",
                    social: "Mạng xã hội",
                    account: "Tài khoản"
                },
                language: "Ngôn ngữ",
                timezone: "Múi giờ",
                lightMode: "Chế độ sáng (Light Mode)",
                lightModeDesc: "Bật để chuyển sang giao diện sáng.",
                customCSS: "CSS tùy biến",
                notes: "Ghi chú kết nối",
                notesPlaceholder: "Ví dụ: Token FB cần gia hạn 60 ngày/lần...",
                password: "Đổi mật khẩu",
                passwordPlaceholder: "Nhập mật khẩu mới..."
            },
            help: {
                title: "Câu hỏi thường gặp (FAQ)",
                q1: "Làm thế nào để kết nối tài khoản Facebook?",
                a1: "Bạn vào mục 'Tài khoản kết nối', nhấn nút 'Kết nối tài khoản mới' và làm theo hướng dẫn để cấp quyền cho Affitok Win.",
                q2: "Token hết hạn là gì?",
                a2: "Token là mã truy cập do Facebook/TikTok cấp. Mã này có thể hết hạn sau 60-90 ngày. Khi hết hạn, bạn cần nhấn nút 'Làm mới' tại trang 'Tài khoản kết nối' để cấp lại quyền."
            },
            modal: {
                title: "Thông báo",
                actionSuccess: "Hành động đã được thực hiện thành công (đây là thông báo giả)."
            },
            toast: {
                postSuccess: "Đăng bài thành công! (Demo)",
                uploadSuccess: "Tải lên thành công! (Demo)",
                saveSuccess: "Đã lưu thành công! (Demo)",
                actionFailed: "Thao tác thất bại! (Demo)"
            },
            // MỚI: Toàn bộ module Affiliate
            affDashboard: {
                kpi1: { title: "Click (30d)" },
                kpi2: { title: "Conversion (30d)" },
                kpi3: { title: "Tỷ lệ (CR)" },
                kpi4: { title: "Doanh thu (Tháng)" },
                chart1: "Demo Biểu đồ (Xu hướng doanh thu & click)",
                topCampaigns: "Chiến dịch nổi bật"
            },
            affCampaigns: {
                table: {
                    name: "Tên chiến dịch",
                    network: "Mạng",
                    payout: "Hoa hồng",
                    expires: "Thời hạn"
                },
                detailsTitle: "Chi tiết Chiến dịch",
                desc: "Mô tả",
                descText: "(Mô tả chi tiết về chiến dịch, sản phẩm áp dụng...)",
                conditions: "Điều kiện chấp nhận",
                conditionsText: "(Cookie 30 ngày, không re-occur...)",
                landing: "Landing Page mẫu"
            },
            affLinks: {
                title: "Trình tạo Link",
                campaign: "Chọn Chiến dịch",
                sub1Placeholder: "Nguồn (facebook, tiktok...)",
                sub2Placeholder: "Chiến dịch (vd: sale_11_11)",
                result: "Link kết quả (Rút gọn)",
                history: "Lịch sử Link",
                historyDesc: "(Danh sách link đã tạo...)"
            },
            affReports: {
                tabs: {
                    overview: "Tổng quan",
                    campaign: "Theo Chiến dịch",
                    source: "Theo Nguồn (Sub1)",
                    link: "Theo Link"
                },
                table: {
                    date: "Ngày",
                    clicks: "Clicks",
                    leads: "Leads",
                    approvals: "Duyệt",
                    rejects: "Từ chối",
                    revenue: "Doanh thu"
                },
                campaignDesc: "(Bảng báo cáo theo chiến dịch...)"
            },
            affPayouts: {
                balance: "Số dư khả dụng",
                min: "Mức rút tối thiểu: $100",
                request: "Yêu cầu rút tiền",
                history: "Lịch sử thanh toán",
                table: {
                    date: "Ngày",
                    amount: "Số tiền",
                    method: "Phương thức"
                },
                info: "Thông tin nhận tiền",
                bankName: "Tên Ngân hàng",
                accountNumber: "Số tài khoản"
            },
            affNetworks: {
                connect: "Kết nối mạng mới",
                connectBtn: "Kết nối",
                table: {
                    name: "Tên mạng",
                    vertical: "Ngành (Vertical)"
                },
                apiKey: "API Key / Token",
                apiKeyPlaceholder: "Nhập API Key do mạng cung cấp"
            },
            affCompliance: {
                checklist: "Checklist nhanh",
                item1: "Không chạy quảng cáo Brand-name.",
                item2: "Không dùng nội dung 18+/bạo lực.",
                item3: "Báo cáo trung thực, không gian lận.",
                examples: "Ví dụ vi phạm",
                exampleDesc: "(Danh sách các ví dụ về nội dung bị cấm...)",
                log: "Nhật ký review",
                logDesc: "(Nhật ký review nội dung/creative...)"
            }
        };
