import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cai-dat")({ component: Page });

function Page() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2 border-b bg-card">
        <h1 className="text-base font-semibold">Cài đặt</h1>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl space-y-4">
          <Section title="Thông tin công ty">
            <Field label="Tên công ty" value="CÔNG TY TNHH AN NGUYỄN PHÁT" />
            <Field label="Mã số thuế" value="0312345678" />
            <Field label="Địa chỉ" value="123 Đường Nguyễn Văn Linh, Q.7, TP. HCM" />
            <Field label="Điện thoại" value="028 3776 1234" />
            <Field label="Email" value="info@annguyenphat.vn" />
          </Section>
          <Section title="Thiết lập hệ thống">
            <Field label="Đơn vị tiền tệ" value="VND (₫)" />
            <Field label="Múi giờ" value="GMT+7 (Asia/Ho_Chi_Minh)" />
            <Field label="Định dạng ngày" value="DD/MM/YYYY" />
            <Field label="VAT mặc định" value="8%" />
          </Section>
          <Section title="Tài khoản & bảo mật">
            <Field label="Người dùng đăng nhập" value="admin" />
            <Field label="Vai trò" value="Quản trị viên" />
            <Field label="Lần đăng nhập gần nhất" value={new Date().toLocaleString("vi-VN")} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded bg-card">
      <div className="px-3 py-1.5 border-b text-[12px] font-semibold">{title}</div>
      <div className="p-3 space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 items-center">
      <label className="text-[12px] text-muted-foreground">{label}</label>
      <input
        defaultValue={value}
        className="col-span-2 h-7 px-2 text-[13px] border rounded bg-background focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}
