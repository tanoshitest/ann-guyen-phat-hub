import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Save } from "lucide-react";
import {
  customers,
  expenseTypes,
  fmtDate,
  fmtVND,
  operationDemos,
  products,
  shippers,
  suppliers,
  type Expense,
  type Purchase,
  type Sale,
  type Shipping,
} from "@/lib/mock-data";
import { listDemoRecords, saveDemoRecord, uniqueOptions } from "@/lib/supabase-demo";

export const Route = createFileRoute("/nghiep-vu")({ component: Page });

type MoneyLine = {
  soLuong: number;
  donGia: number;
  giaTri: number;
  congJumbo: number;
  truJumbo: number;
  ghiChu: string;
};

type ProductLine = {
  id: string;
  maSP: string;
  soLuong: number;
  donGia: number;
  giaTri: number;
};

type ExpenseLine = {
  loaiCP: string;
  doiTuong: string;
  lyDo: string;
  soLuong: number;
  donGia: number;
  congChiPhi: number;
  soTien: number;
  ghiChu: string;
};

type OperationRecord = {
  loaiNghiepVu?: OperationKind;
  soChungTu: string;
  ngay: string;
  maThongKe: string;
  maKH: string;
  khachHang: string;
  maSP: string;
  maNCC: string;
  ncc: string;
  maVC: string;
  dvvc: string;
  bienSo: string;
  ban: MoneyLine;
  banLines?: ProductLine[];
  mua: MoneyLine;
  muaLines?: ProductLine[];
  vc: MoneyLine;
  chiPhi: ExpenseLine;
  ghiChu: string;
  createdAt: string;
};

type OperationKind = "ban" | "mua";
type FormState = Omit<OperationRecord, "khachHang" | "ncc" | "dvvc" | "createdAt">;

const emptyMoneyLine: MoneyLine = {
  soLuong: 0,
  donGia: 0,
  giaTri: 0,
  congJumbo: 0,
  truJumbo: 0,
  ghiChu: "",
};

const emptyExpenseLine: ExpenseLine = {
  loaiCP: "",
  doiTuong: "",
  lyDo: "",
  soLuong: 0,
  donGia: 0,
  congChiPhi: 0,
  soTien: 0,
  ghiChu: "",
};

function emptyProductLine(index = 1): ProductLine {
  return {
    id: `line-${index}`,
    maSP: "",
    soLuong: 0,
    donGia: 0,
    giaTri: 0,
  };
}

function nextProductLine(lines: ProductLine[] = []) {
  const maxIndex = lines.reduce((value, line) => {
    const match = line.id.match(/^line-(\d+)$/);
    return match ? Math.max(value, Number(match[1])) : value;
  }, 0);
  return emptyProductLine(maxIndex + 1);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nextDocumentNumber(rows: OperationRecord[]) {
  const max = rows.reduce((value, row) => {
    const match = row.soChungTu.match(/^NV(\d+)$/i);
    return match ? Math.max(value, Number(match[1])) : value;
  }, 0);
  return `NV${String(max + 1).padStart(6, "0")}`;
}

function makeInitialForm(soChungTu: string): FormState {
  return {
    loaiNghiepVu: "ban",
    soChungTu,
    ngay: today(),
    maThongKe: "",
    maKH: "",
    maSP: "",
    maNCC: "",
    maVC: "",
    bienSo: "",
    ban: { ...emptyMoneyLine },
    banLines: [emptyProductLine()],
    mua: { ...emptyMoneyLine },
    muaLines: [emptyProductLine()],
    vc: { ...emptyMoneyLine },
    chiPhi: { ...emptyExpenseLine },
    ghiChu: "",
  };
}

function Page() {
  const [rows, setRows] = useState<OperationRecord[]>(operationDemos);
  const [form, setForm] = useState<FormState>(() => makeInitialForm("NV000001"));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listDemoRecords<OperationRecord>("operations")
      .then((records) => {
        const demoKeys = new Set(records.map((record) => record.soChungTu));
        const nextRows = [
          ...records,
          ...operationDemos.filter((operation) => !demoKeys.has(operation.soChungTu)),
        ];
        setRows(nextRows);
        setForm(makeInitialForm(nextDocumentNumber(nextRows)));
      })
      .catch(console.error);
  }, []);

  const selectedCustomer = customers.find((customer) => customer.MA_KH === form.maKH);
  const selectedSupplier = suppliers.find((supplier) => supplier.MA_NCC === form.maNCC);
  const selectedShipper = shippers.find((shipper) => shipper.MA_VC === form.maVC);

  const computed = useMemo(() => {
    const banLines = (form.banLines?.length ? form.banLines : [emptyProductLine()]).map((line) => ({
      ...line,
      giaTri: line.soLuong * line.donGia,
    }));
    const muaLines = (form.muaLines?.length ? form.muaLines : [emptyProductLine()]).map((line) => ({
      ...line,
      giaTri: line.soLuong * line.donGia,
    }));
    const activeLine = (form.loaiNghiepVu === "ban" ? banLines : muaLines).find(
      (line) => line.maSP,
    );
    const vat = products.find((product) => product.MA_SP === activeLine?.maSP)?.vat ?? 0;
    const banGiaTri = banLines.reduce((sum, line) => sum + line.giaTri, 0);
    const muaGiaTri = muaLines.reduce((sum, line) => sum + line.giaTri, 0);
    const vcSoLuong = (form.loaiNghiepVu === "ban" ? banLines : muaLines).reduce(
      (sum, line) => sum + line.soLuong,
      0,
    );
    const vcGiaTri = vcSoLuong * form.vc.donGia;
    const chiPhiSoTien = form.chiPhi.soLuong * form.chiPhi.donGia + form.chiPhi.congChiPhi;
    return {
      vat,
      banLines,
      muaLines,
      ban: { ...form.ban, giaTri: banGiaTri },
      mua: { ...form.mua, giaTri: muaGiaTri },
      vc: { ...form.vc, soLuong: vcSoLuong, giaTri: vcGiaTri },
      chiPhi: { ...form.chiPhi, soTien: chiPhiSoTien },
    };
  }, [form]);

  const updateField = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const chooseOperationKind = (loaiNghiepVu: OperationKind) => {
    setForm((current) => ({
      ...current,
      loaiNghiepVu,
      maKH: loaiNghiepVu === "ban" ? current.maKH : "",
      maNCC: loaiNghiepVu === "mua" ? current.maNCC : "",
      ban: loaiNghiepVu === "ban" ? current.ban : { ...emptyMoneyLine },
      banLines: loaiNghiepVu === "ban" ? current.banLines : [emptyProductLine()],
      mua: loaiNghiepVu === "mua" ? current.mua : { ...emptyMoneyLine },
      muaLines: loaiNghiepVu === "mua" ? current.muaLines : [emptyProductLine()],
    }));
  };

  const updateMoney = (section: "ban" | "mua" | "vc", key: keyof MoneyLine, value: number) => {
    setForm((current) => ({
      ...current,
      [section]: { ...current[section], [key]: value },
    }));
  };

  const updateSharedMoney = (key: "soLuong" | "congJumbo" | "truJumbo", value: number) => {
    setForm((current) => ({
      ...current,
      ban: current.loaiNghiepVu === "ban" ? { ...current.ban, [key]: value } : current.ban,
      mua: current.loaiNghiepVu === "mua" ? { ...current.mua, [key]: value } : current.mua,
      vc: { ...current.vc, [key]: value },
    }));
  };

  const updateProductLine = (
    section: "banLines" | "muaLines",
    id: string,
    key: keyof ProductLine,
    value: string | number,
  ) => {
    setForm((current) => ({
      ...current,
      [section]: (current[section] ?? [emptyProductLine()]).map((line) =>
        line.id === id ? { ...line, [key]: value } : line,
      ),
    }));
  };

  const addProductLine = (section: "banLines" | "muaLines") => {
    setForm((current) => ({
      ...current,
      [section]: [...(current[section] ?? []), nextProductLine(current[section])],
    }));
  };

  const removeProductLine = (section: "banLines" | "muaLines", id: string) => {
    setForm((current) => {
      const nextLines = (current[section] ?? []).filter((line) => line.id !== id);
      return {
        ...current,
        [section]: nextLines.length ? nextLines : [emptyProductLine()],
      };
    });
  };

  const updateExpense = (key: keyof ExpenseLine, value: string | number) => {
    setForm((current) => ({
      ...current,
      chiPhi: { ...current.chiPhi, [key]: value },
    }));
  };

  const resetForm = (nextRows = rows) => {
    setForm(makeInitialForm(nextDocumentNumber(nextRows)));
  };

  const saveOperation = async () => {
    const soChungTu = form.soChungTu.trim();
    if (!soChungTu) {
      window.alert("Vui lòng nhập số chứng từ");
      return;
    }

    setSaving(true);
    const isSale = form.loaiNghiepVu === "ban";
    const activeLines = isSale ? computed.banLines : computed.muaLines;
    const firstLine = activeLines.find((line) => line.maSP || line.soLuong || line.donGia);
    const operation: OperationRecord = {
      ...form,
      loaiNghiepVu: form.loaiNghiepVu,
      soChungTu,
      maThongKe: selectedCustomer?.MA_THONG_KE || form.maThongKe,
      maSP: firstLine?.maSP ?? "",
      maKH: isSale ? form.maKH : "",
      khachHang: isSale ? selectedCustomer?.ten || "" : "",
      maNCC: isSale ? "" : form.maNCC,
      ncc: isSale ? "" : selectedSupplier?.ten || "",
      dvvc: selectedShipper?.ten || "",
      bienSo: form.bienSo || selectedShipper?.bienSo || "",
      banLines: isSale ? computed.banLines : [],
      muaLines: isSale ? [] : computed.muaLines,
      ban: isSale
        ? { ...computed.ban, ghiChu: computed.ban.ghiChu || form.ghiChu }
        : { ...emptyMoneyLine },
      mua: isSale
        ? { ...emptyMoneyLine }
        : { ...computed.mua, ghiChu: computed.mua.ghiChu || form.ghiChu },
      vc: { ...computed.vc, ghiChu: computed.vc.ghiChu || form.ghiChu },
      chiPhi: computed.chiPhi,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveDemoRecord("operations", soChungTu, operation);

      const tasks: Promise<unknown>[] = [];
      if (operation.loaiNghiepVu === "ban") {
        operation.banLines
          ?.filter((line) => line.maSP || line.soLuong || line.donGia)
          .forEach((line, index) => {
            tasks.push(
              saveDemoRecord(
                "sales",
                `${soChungTu}-B${index + 1}`,
                buildSale(operation, line, index),
              ),
            );
          });
      }
      if (operation.loaiNghiepVu === "mua") {
        operation.muaLines
          ?.filter((line) => line.maSP || line.soLuong || line.donGia)
          .forEach((line, index) => {
            tasks.push(
              saveDemoRecord(
                "purchases",
                `${soChungTu}-M${index + 1}`,
                buildPurchase(operation, line, index),
              ),
            );
          });
      }
      if (operation.vc.soLuong || operation.vc.donGia || operation.maVC) {
        tasks.push(saveDemoRecord("shippings", soChungTu, buildShipping(operation)));
      }
      if (operation.chiPhi.soTien || operation.chiPhi.loaiCP) {
        tasks.push(saveDemoRecord("expenses", `CP_${soChungTu}`, buildExpense(operation)));
      }
      await Promise.all(tasks);

      setRows((current) => {
        const next = [operation, ...current.filter((row) => row.soChungTu !== soChungTu)];
        resetForm(next);
        return next;
      });
    } catch (error) {
      console.error(error);
      window.alert("Không lưu được nghiệp vụ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const activeMoney = form.loaiNghiepVu === "ban" ? form.ban : form.mua;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between border-b bg-card px-4 py-2">
        <h1 className="text-base font-semibold">Form Nhập</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => resetForm()}
            className="inline-flex h-8 items-center gap-1 rounded border px-3 text-[13px] hover:bg-muted"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Làm mới
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={saveOperation}
            className="inline-flex h-8 items-center gap-1 rounded bg-primary px-3 text-[13px] text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            Lưu nghiệp vụ
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="min-w-[1120px] space-y-4">
          <section className="border bg-card">
            <SectionTitle>Thông tin chung</SectionTitle>
            <div className="grid grid-cols-6 gap-3 p-3">
              <Field label="Loại nghiệp vụ">
                <div className="grid h-8 grid-cols-2 overflow-hidden rounded border bg-muted p-0.5">
                  <button
                    type="button"
                    onClick={() => chooseOperationKind("ban")}
                    className={`text-[13px] font-medium ${
                      form.loaiNghiepVu === "ban"
                        ? "rounded bg-background shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    Bán hàng
                  </button>
                  <button
                    type="button"
                    onClick={() => chooseOperationKind("mua")}
                    className={`text-[13px] font-medium ${
                      form.loaiNghiepVu === "mua"
                        ? "rounded bg-background shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    Mua hàng
                  </button>
                </div>
              </Field>
              <Field label="Ngày chứng từ">
                <Input
                  type="date"
                  value={form.ngay}
                  onChange={(value) => updateField("ngay", value)}
                />
              </Field>
              <Field label="Số chứng từ">
                <Input
                  value={form.soChungTu}
                  onChange={(value) => updateField("soChungTu", value)}
                />
              </Field>
              <Field label="MA_THONG_KE">
                <Input
                  value={selectedCustomer?.MA_THONG_KE || form.maThongKe}
                  onChange={(value) => updateField("maThongKe", value)}
                />
              </Field>
              <Field label="VAT">
                <ReadOnly value={computed.vat ? `${computed.vat}%` : "Theo sản phẩm"} />
              </Field>
              <Field label="Cộng bao Jumbo">
                <NumberInput
                  value={activeMoney.congJumbo}
                  onChange={(value) => updateSharedMoney("congJumbo", value)}
                />
              </Field>
              <Field label="Trừ bao Jumbo">
                <NumberInput
                  value={activeMoney.truJumbo}
                  onChange={(value) => updateSharedMoney("truJumbo", value)}
                />
              </Field>
              <Field label="Ghi chú chung">
                <Input value={form.ghiChu} onChange={(value) => updateField("ghiChu", value)} />
              </Field>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            {form.loaiNghiepVu === "ban" && (
              <section className="border bg-card">
                <SectionTitle>Bán hàng</SectionTitle>
                <div className="grid grid-cols-2 gap-3 p-3">
                  <Field label="MA_KH">
                    <Select
                      value={form.maKH}
                      onChange={(value) => updateField("maKH", value)}
                      options={customers.map((customer) => customer.MA_KH)}
                    />
                  </Field>
                  <Field label="Tên KH">
                    <ReadOnly value={selectedCustomer?.ten || ""} />
                  </Field>
                  <div className="col-span-2">
                    <ProductLinesEditor
                      lines={computed.banLines}
                      total={computed.ban.giaTri}
                      unitLabel="Đơn giá bán"
                      onChange={(id, key, value) => updateProductLine("banLines", id, key, value)}
                      onAdd={() => addProductLine("banLines")}
                      onRemove={(id) => removeProductLine("banLines", id)}
                    />
                  </div>
                </div>
              </section>
            )}

            {form.loaiNghiepVu === "mua" && (
              <section className="border bg-card">
                <SectionTitle>Mua hàng</SectionTitle>
                <div className="grid grid-cols-2 gap-3 p-3">
                  <Field label="MA_NCC">
                    <Select
                      value={form.maNCC}
                      onChange={(value) => updateField("maNCC", value)}
                      options={suppliers.map((supplier) => supplier.MA_NCC)}
                    />
                  </Field>
                  <Field label="Tên NCC">
                    <ReadOnly value={selectedSupplier?.ten || ""} />
                  </Field>
                  <div className="col-span-2">
                    <ProductLinesEditor
                      lines={computed.muaLines}
                      total={computed.mua.giaTri}
                      unitLabel="Đơn giá mua"
                      onChange={(id, key, value) => updateProductLine("muaLines", id, key, value)}
                      onAdd={() => addProductLine("muaLines")}
                      onRemove={(id) => removeProductLine("muaLines", id)}
                    />
                  </div>
                </div>
              </section>
            )}

            <section className="border bg-card">
              <SectionTitle>Vận chuyển</SectionTitle>
              <div className="grid grid-cols-2 gap-3 p-3">
                <Field label="MA_VC">
                  <Select
                    value={form.maVC}
                    onChange={(value) => updateField("maVC", value)}
                    options={shippers.map((shipper) => shipper.MA_VC)}
                  />
                </Field>
                <Field label="Tên VC">
                  <ReadOnly value={selectedShipper?.ten || ""} />
                </Field>
                <Field label="Biển số xe">
                  <Input
                    value={form.bienSo || selectedShipper?.bienSo || ""}
                    onChange={(value) => updateField("bienSo", value)}
                  />
                </Field>
                <Field label="Đơn giá VC">
                  <NumberInput
                    value={form.vc.donGia}
                    onChange={(value) => updateMoney("vc", "donGia", value)}
                  />
                </Field>
                <Field label="Giá trị VC">
                  <ReadOnly value={fmtVND(computed.vc.giaTri)} />
                </Field>
              </div>
            </section>
          </div>

          <section className="border bg-card">
            <SectionTitle>Chi phí</SectionTitle>
            <div className="grid grid-cols-6 gap-3 p-3">
              <Field label="Loại chi phí">
                <Select
                  value={form.chiPhi.loaiCP}
                  onChange={(value) => updateExpense("loaiCP", value)}
                  options={uniqueOptions(expenseTypes.map((type) => type.ten))}
                />
              </Field>
              <Field label="Đối tượng">
                <Input
                  value={form.chiPhi.doiTuong}
                  onChange={(value) => updateExpense("doiTuong", value)}
                />
              </Field>
              <Field label="Lý do chi">
                <Input
                  value={form.chiPhi.lyDo}
                  onChange={(value) => updateExpense("lyDo", value)}
                />
              </Field>
              <Field label="Số lượng CP">
                <NumberInput
                  value={form.chiPhi.soLuong}
                  onChange={(value) => updateExpense("soLuong", value)}
                />
              </Field>
              <Field label="Đơn giá CP">
                <NumberInput
                  value={form.chiPhi.donGia}
                  onChange={(value) => updateExpense("donGia", value)}
                />
              </Field>
              <Field label="Cộng chi phí">
                <NumberInput
                  value={form.chiPhi.congChiPhi}
                  onChange={(value) => updateExpense("congChiPhi", value)}
                />
              </Field>
              <Field label="Số tiền">
                <ReadOnly value={fmtVND(computed.chiPhi.soTien)} />
              </Field>
              <Field label="Ghi chú chi phí">
                <Input
                  value={form.chiPhi.ghiChu}
                  onChange={(value) => updateExpense("ghiChu", value)}
                />
              </Field>
            </div>
          </section>

          <section className="border bg-card">
            <SectionTitle>Demo các nghiệp vụ</SectionTitle>
            <div className="max-h-[360px] overflow-auto">
              <table className="sheet-table">
                <thead>
                  <tr>
                    <th>Số chứng từ</th>
                    <th>Ngày</th>
                    <th>MA_THONG_KE</th>
                    <th>Khách hàng</th>
                    <th>Nhà cung cấp</th>
                    <th>Đơn vị VC</th>
                    <th className="num">Bán</th>
                    <th className="num">Mua</th>
                    <th className="num">VC</th>
                    <th className="num">Chi phí</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.soChungTu}>
                      <td>{row.soChungTu}</td>
                      <td>{fmtDate(row.ngay)}</td>
                      <td>{row.maThongKe}</td>
                      <td>{row.khachHang}</td>
                      <td>{row.ncc}</td>
                      <td>{row.dvvc}</td>
                      <td className="num">{fmtVND(row.ban.giaTri)}</td>
                      <td className="num">{fmtVND(row.mua.giaTri)}</td>
                      <td className="num">{fmtVND(row.vc.giaTri)}</td>
                      <td className="num">{fmtVND(row.chiPhi.soTien)}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-6 text-center text-muted-foreground">
                        Chưa có nghiệp vụ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function buildSale(operation: OperationRecord, line: ProductLine, index: number): Sale {
  const vat = products.find((product) => product.MA_SP === line.maSP)?.vat ?? 0;
  const tienVat = Math.round((line.giaTri * vat) / 100);
  const lineNumber = `${operation.soChungTu}.${index + 1}`;
  return {
    MA_CHUNG_TU: lineNumber,
    ngay: operation.ngay,
    MA_THONG_KE: operation.maThongKe,
    khachHang: operation.khachHang,
    maSP: line.maSP,
    soLuong: line.soLuong,
    donGia: line.donGia,
    giaTriBan: line.giaTri,
    vat,
    tienVat,
    tongTT:
      line.giaTri + tienVat + (index === 0 ? operation.ban.congJumbo - operation.ban.truJumbo : 0),
    congJumbo: index === 0 ? operation.ban.congJumbo : 0,
    truJumbo: index === 0 ? operation.ban.truJumbo : 0,
    hoaHong: 0,
    dienGiai: operation.ban.ghiChu || `Bán theo chứng từ ${operation.soChungTu}`,
    ngayHD: operation.ngay,
    soHD: operation.soChungTu,
    trangThai: "Còn nợ",
  };
}

function buildPurchase(operation: OperationRecord, line: ProductLine, index: number): Purchase {
  const vat = products.find((product) => product.MA_SP === line.maSP)?.vat ?? 0;
  const lineNumber = `${operation.soChungTu}.${index + 1}`;
  return {
    MA_CHUNG_TU: lineNumber,
    ngay: operation.ngay,
    MA_THONG_KE: operation.maThongKe,
    ncc: operation.ncc,
    maSP: line.maSP,
    soLuong: line.soLuong,
    donGia: line.donGia,
    giaTriMua: line.giaTri,
    vat,
    congJumbo: index === 0 ? operation.mua.congJumbo : 0,
    truJumbo: index === 0 ? operation.mua.truJumbo : 0,
    ghiChu: operation.mua.ghiChu,
    ngayHD: operation.ngay,
    soHD: operation.soChungTu,
  };
}

function buildShipping(operation: OperationRecord): Shipping {
  return {
    MA_CHUNG_TU: operation.soChungTu,
    ngay: operation.ngay,
    MA_THONG_KE: operation.maThongKe,
    dvvc: operation.dvvc,
    bienSo: operation.bienSo,
    maSP: operation.maSP,
    soLuong: operation.vc.soLuong,
    donGia: operation.vc.donGia,
    giaTriVC: operation.vc.giaTri,
    vat: 8,
    ghiChu: operation.vc.ghiChu,
    ngayHD: operation.ngay,
    soHD: operation.soChungTu,
  };
}

function buildExpense(operation: OperationRecord): Expense {
  return {
    MA_CHI_PHI: `CP_${operation.soChungTu}`,
    ngay: operation.ngay,
    loaiCP: operation.chiPhi.loaiCP,
    doiTuong: operation.chiPhi.doiTuong || operation.khachHang || operation.ncc || operation.dvvc,
    MA_CHUNG_TU: operation.soChungTu,
    MA_THONG_KE: operation.maThongKe,
    lyDo: operation.chiPhi.lyDo,
    soTien: operation.chiPhi.soTien,
    ghiChu: operation.chiPhi.ghiChu,
  };
}

function ProductLinesEditor({
  lines,
  total,
  unitLabel,
  onChange,
  onAdd,
  onRemove,
}: {
  lines: ProductLine[];
  total: number;
  unitLabel: string;
  onChange: (id: string, key: keyof ProductLine, value: string | number) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1.1fr_0.8fr_0.9fr_1fr_64px] gap-2 text-[12px] font-semibold">
        <span>Mã SP</span>
        <span>Số lượng</span>
        <span>{unitLabel}</span>
        <span>Thành tiền</span>
        <span />
      </div>
      {lines.map((line) => (
        <div key={line.id} className="grid grid-cols-[1.1fr_0.8fr_0.9fr_1fr_64px] gap-2">
          <Select
            value={line.maSP}
            onChange={(value) => onChange(line.id, "maSP", value)}
            options={products.map((product) => product.MA_SP)}
          />
          <NumberInput
            value={line.soLuong}
            onChange={(value) => onChange(line.id, "soLuong", value)}
          />
          <NumberInput
            value={line.donGia}
            onChange={(value) => onChange(line.id, "donGia", value)}
          />
          <ReadOnly value={fmtVND(line.giaTri)} />
          <button
            type="button"
            onClick={() => onRemove(line.id)}
            className="h-8 rounded border text-[12px] text-muted-foreground hover:bg-muted"
          >
            Xóa
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onAdd}
          className="h-8 rounded border px-3 text-[13px] hover:bg-muted"
        >
          Thêm sản phẩm
        </button>
        <div className="min-w-44 text-right text-[13px] font-semibold">Tổng: {fmtVND(total)}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b bg-foreground px-3 py-2 text-[12px] font-semibold uppercase text-background">
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="min-w-0">
      <span className="mb-1 block text-[12px] font-semibold">{label}</span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 w-full rounded border bg-background px-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
    />
  );
}

function NumberInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <input
      type="number"
      value={value || ""}
      onChange={(event) => onChange(Number(event.target.value || 0))}
      className="h-8 w-full rounded border bg-background px-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
    />
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 w-full rounded border bg-background px-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
    >
      <option value="">Chọn trong list</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function ReadOnly({ value }: { value: string }) {
  return (
    <div className="flex h-8 items-center rounded border bg-muted px-2 text-[13px] text-muted-foreground">
      {value || "tự động"}
    </div>
  );
}
