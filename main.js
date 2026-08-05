"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => AccountingPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian21 = require("obsidian");
var import_obsidian22 = require("obsidian");

// ../../packages/core/src/types/account.ts
function kindOfType(type) {
  switch (type) {
    case "credit":
    case "loan":
      return "liability";
    default:
      return "asset";
  }
}

// ../../packages/core/src/accountTypes.ts
var SYSTEM_ACCOUNT_TYPES = [
  "cash",
  "savings",
  "ewallet",
  "securities",
  "fund",
  "other-investment",
  "fixed-asset",
  "company",
  "person",
  "credit",
  "loan"
];
function accountKindOf(settings, type) {
  const kind = settings?.types.find((t2) => t2.type === type)?.kind;
  if (kind === "asset" || kind === "liability") return kind;
  return kindOfType(type);
}
var DEFAULT_TYPE_LABEL_PAIRS = [
  ["cash", "\u73B0\u91D1"],
  ["savings", "\u50A8\u84C4"],
  ["ewallet", "\u7535\u5B50\u94B1\u5305"],
  ["securities", "\u8BC1\u5238"],
  ["fund", "\u57FA\u91D1"],
  ["other-investment", "\u5176\u4ED6\u6295\u8D44"],
  ["fixed-asset", "\u56FA\u5B9A\u8D44\u4EA7"],
  ["company", "\u516C\u53F8"],
  ["person", "\u5F80\u6765(\u501F\u8D37)"],
  ["credit", "\u4FE1\u7528\u5361"],
  ["loan", "\u8D37\u6B3E"]
];
var DEFAULT_TYPE_LABEL = Object.fromEntries(DEFAULT_TYPE_LABEL_PAIRS);
var DEFAULT_GROUP_OF_TYPE = Object.fromEntries([
  ["cash", "g-cash"],
  ["savings", "g-cash"],
  ["ewallet", "g-cash"],
  ["securities", "g-investment"],
  ["fund", "g-investment"],
  ["other-investment", "g-investment"],
  ["fixed-asset", "g-fixed-asset"],
  ["company", "g-company"],
  ["person", "g-credit"],
  ["credit", "g-credit"],
  ["loan", "g-credit"]
]);
var DEFAULT_GROUPS = [
  { id: "g-cash", label: "\u73B0\u91D1\u7C7B" },
  { id: "g-investment", label: "\u6295\u8D44\u7C7B" },
  { id: "g-fixed-asset", label: "\u56FA\u5B9A\u8D44\u4EA7" },
  { id: "g-company", label: "\u516C\u53F8" },
  { id: "g-credit", label: "\u4FE1\u8D37" }
];
var DEFAULT_GROUP_LABEL = Object.fromEntries(
  DEFAULT_GROUPS.map((g) => [g.id, g.label])
);
var SYSTEM_SET = new Set(SYSTEM_ACCOUNT_TYPES);
function isSystemAccountType(t2) {
  return typeof t2 === "string" && SYSTEM_SET.has(t2);
}
function defaultAccountTypeSettings() {
  return {
    groups: DEFAULT_GROUPS.map((g) => ({ ...g })),
    types: SYSTEM_ACCOUNT_TYPES.map((t2) => ({
      type: t2,
      label: DEFAULT_TYPE_LABEL[t2] ?? t2,
      groupId: DEFAULT_GROUP_OF_TYPE[t2] ?? DEFAULT_GROUPS[0].id,
      active: true
    }))
  };
}
function normalizeAccountTypeSettings(input) {
  const def = defaultAccountTypeSettings();
  if (!input || typeof input !== "object") return def;
  const raw = input;
  if (!Array.isArray(raw.groups) || !Array.isArray(raw.types)) return def;
  const groups = [];
  const groupIdSet = /* @__PURE__ */ new Set();
  for (const g of raw.groups) {
    if (!g || typeof g.id !== "string" || !g.id || typeof g.label !== "string" || groupIdSet.has(g.id)) continue;
    groups.push({ id: g.id, label: g.label });
    groupIdSet.add(g.id);
  }
  if (groups.length === 0) return def;
  const fallbackGroupId = groups[0].id;
  const defByType = new Map(def.types.map((d) => [d.type, d]));
  const types = [];
  const customTypes = [];
  const seen = /* @__PURE__ */ new Set();
  for (const t2 of raw.types) {
    if (!t2 || typeof t2.type !== "string" || !t2.type || seen.has(t2.type)) continue;
    if (!isSystemAccountType(t2.type)) {
      const label2 = typeof t2.label === "string" && t2.label.trim() ? t2.label.trim() : "";
      if (!label2) continue;
      const groupId2 = typeof t2.groupId === "string" && groupIdSet.has(t2.groupId) ? t2.groupId : fallbackGroupId;
      const kind = t2.kind === "asset" || t2.kind === "liability" ? t2.kind : "asset";
      seen.add(t2.type);
      customTypes.push({ type: t2.type, label: label2, groupId: groupId2, active: t2.active !== false, kind });
      continue;
    }
    seen.add(t2.type);
    const defT = defByType.get(t2.type);
    const label = typeof t2.label === "string" && t2.label.trim() ? t2.label : defT.label;
    const groupId = typeof t2.groupId === "string" && groupIdSet.has(t2.groupId) ? t2.groupId : fallbackGroupId;
    types.push({ type: t2.type, label, groupId, active: t2.active !== false });
  }
  for (const d of def.types) {
    if (seen.has(d.type)) continue;
    const groupId = groupIdSet.has(d.groupId) ? d.groupId : fallbackGroupId;
    types.push({ type: d.type, label: d.label, groupId, active: true });
  }
  return { groups, types: [...types, ...customTypes] };
}
function resolveTypeGroups(settings) {
  const byGroup = /* @__PURE__ */ new Map();
  for (const t2 of settings.types) {
    const arr = byGroup.get(t2.groupId);
    if (arr) arr.push(t2);
    else byGroup.set(t2.groupId, [t2]);
  }
  return settings.groups.map((g) => ({ id: g.id, label: g.label, types: byGroup.get(g.id) ?? [] })).filter((g) => g.types.length > 0);
}
var CUSTOM_TYPE_PREFIX = "custom-";
function newCustomTypeKey(s, _label) {
  const used = new Set(s.types.map((t2) => t2.type));
  let n = 1;
  while (used.has(`${CUSTOM_TYPE_PREFIX}${n}`)) n += 1;
  return `${CUSTOM_TYPE_PREFIX}${n}`;
}
function displayTypeLabel(type, storedLabel, translate) {
  return storedLabel === DEFAULT_TYPE_LABEL[type] ? translate(`accountType.${type}`) : storedLabel;
}
function displayGroupLabel(id, storedLabel, translate) {
  return DEFAULT_GROUP_LABEL[id] != null && storedLabel === DEFAULT_GROUP_LABEL[id] ? translate(`accountGroup.${id}`) : storedLabel;
}

// ../../packages/core/src/id.ts
function newTxId() {
  return "tx_" + crypto.randomUUID();
}
function newAccountId() {
  return "acc_" + crypto.randomUUID();
}
function newCategoryId() {
  return "cat_" + crypto.randomUUID();
}
function nowISO() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function dateSep(locale) {
  return locale === "en" ? "/" : "-";
}
function formatLocalTimestamp(iso, locale) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const s = dateSep(locale);
  return `${d.getFullYear()}${s}${pad(d.getMonth() + 1)}${s}${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function isoToDateStr(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function isoToMonthStr(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}`;
}
function formatDateDisplay(ymd, locale) {
  return locale === "en" && /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd.replace(/-/g, "/") : ymd;
}
function formatMonthDisplay(ym, locale) {
  return locale === "en" && /^\d{4}-\d{2}$/.test(ym) ? ym.replace("-", "/") : ym;
}
function isoToYearNum(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return NaN;
  return d.getFullYear();
}
function isoToDatetimeLocal(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function dateToLocalISO(d) {
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${sign}${p(Math.floor(abs / 60))}:${p(abs % 60)}`;
}
function nowLocalISO() {
  return dateToLocalISO(/* @__PURE__ */ new Date());
}
function localDateStartISO(year, monthOneBased, day) {
  return dateToLocalISO(new Date(year, monthOneBased - 1, day, 0, 0, 0, 0));
}
function datetimeLocalToISO(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return nowLocalISO();
  return dateToLocalISO(d);
}
function datetimeLocalToISOStrict(input) {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return dateToLocalISO(d);
}
function nowDatetimeLocal() {
  return isoToDatetimeLocal(nowISO());
}

// ../../packages/core/src/i18n.ts
var supportedLocales = ["zh", "en"];
var defaultLocale = "zh";
function isSupportedLocale(x) {
  return typeof x === "string" && supportedLocales.includes(x);
}

// ../../packages/core/src/errors.ts
var AppError = class extends Error {
  /** i18n 错误码（= 两端字典 key）。两端 `formatError(e)` 据此 `t(code)` 翻译。 */
  code;
  constructor(code, message) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
};

// ../../packages/core/src/dateRange.ts
function todayDateInput() {
  const d = /* @__PURE__ */ new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function monthsAgoDateInput(n) {
  const d = /* @__PURE__ */ new Date();
  d.setMonth(d.getMonth() - n);
  const p = (n2) => String(n2).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function firstOfMonth() {
  const d = /* @__PURE__ */ new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-01`;
}
function firstOfYear() {
  return `${(/* @__PURE__ */ new Date()).getFullYear()}-01-01`;
}
function yearsAgoDateInput(n) {
  const d = /* @__PURE__ */ new Date();
  d.setFullYear(d.getFullYear() - n);
  const p = (n2) => String(n2).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function earliestDataDate(transactions) {
  const now = /* @__PURE__ */ new Date();
  let ey = now.getFullYear();
  let em = now.getMonth() + 1;
  for (const t2 of transactions) {
    const ym = isoToMonthStr(t2.ts);
    if (!ym) continue;
    const y = Number(ym.slice(0, 4));
    const m = Number(ym.slice(5, 7));
    if (y < ey || y === ey && m < em) {
      ey = y;
      em = m;
    }
  }
  const p = (n) => String(n).padStart(2, "0");
  return `${ey}-${p(em)}-01`;
}
function rangeStartDate(key, earliestData) {
  switch (key) {
    case "thisMonth":
      return firstOfMonth();
    case "last1m":
      return monthsAgoDateInput(1);
    case "last3m":
      return monthsAgoDateInput(3);
    case "thisYear":
      return firstOfYear();
    case "last6y":
      return yearsAgoDateInput(6);
    case "all":
      return earliestData ?? "1970-01-01";
  }
}
function dateOnlyToLocalISOStart(dateOnly) {
  const parts = dateOnly.split("-").map(Number);
  return localDateStartISO(parts[0] ?? 0, parts[1] ?? 1, parts[2] ?? 1);
}
function rangeBounds(key, earliestData) {
  const start = dateOnlyToLocalISOStart(rangeStartDate(key, earliestData));
  const tp = todayDateInput().split("-").map(Number);
  const end = localDateStartISO(tp[0] ?? 0, tp[1] ?? 1, (tp[2] ?? 1) + 1);
  return { start, end };
}
function rangeDateBounds(key, earliestData) {
  return { start: rangeStartDate(key, earliestData), end: todayDateInput() };
}

// ../../packages/core/src/money.ts
function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// ../../packages/core/src/format.ts
function formatMoney(n, currency = "CNY") {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const s = abs.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sym = currency === "CNY" ? "\xA5" : `${currency} `;
  return `${sign}${sym}${s}`;
}
function formatMoneyInt(n, currency = "CNY") {
  const sign = n < 0 ? "-" : "";
  const abs = Math.round(Math.abs(n));
  const s = abs.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
  const sym = currency === "CNY" ? "\xA5" : `${currency} `;
  return `${sign}${sym}${s}`;
}

// ../../packages/core/src/amountCalc.ts
var ok = (value) => ({ ok: true, value });
var fail = (error) => ({ ok: false, error });
function isDigit(ch) {
  return ch >= "0" && ch <= "9";
}
function tokenize(input) {
  const toks = [];
  let i = 0;
  const s = input;
  while (i < s.length) {
    const ch = s[i];
    if (ch === " " || ch === "	" || ch === "\n" || ch === "\r" || ch === "\xA0") {
      i++;
      continue;
    }
    if (ch === "+") {
      toks.push({ t: "op", v: "+" });
      i++;
      continue;
    }
    if (ch === "-" || ch === "\u2212") {
      toks.push({ t: "op", v: "-" });
      i++;
      continue;
    }
    if (ch === "*" || ch === "\xD7") {
      toks.push({ t: "op", v: "*" });
      i++;
      continue;
    }
    if (ch === "/" || ch === "\xF7") {
      toks.push({ t: "op", v: "/" });
      i++;
      continue;
    }
    if (ch === "(" || ch === "\uFF08") {
      toks.push({ t: "lp" });
      i++;
      continue;
    }
    if (ch === ")" || ch === "\uFF09") {
      toks.push({ t: "rp" });
      i++;
      continue;
    }
    if (ch === "%" || ch === "\uFF05") {
      toks.push({ t: "pct" });
      i++;
      continue;
    }
    if (isDigit(ch) || ch === ".") {
      let j = i;
      let dotSeen = false;
      let digits = 0;
      while (j < s.length && (isDigit(s[j]) || s[j] === ".")) {
        if (s[j] === ".") {
          if (dotSeen) return null;
          dotSeen = true;
        } else {
          digits++;
        }
        j++;
      }
      if (digits === 0) return null;
      const v = Number(s.slice(i, j));
      if (!Number.isFinite(v)) return null;
      toks.push({ t: "num", v });
      i = j;
      continue;
    }
    return null;
  }
  return toks;
}
var Parser = class {
  constructor(toks) {
    this.toks = toks;
  }
  pos = 0;
  parse() {
    if (this.toks.length === 0) return fail("\u8BF7\u8F93\u5165\u91D1\u989D");
    const r = this.expr();
    if (r.ok === false) return r;
    if (this.pos !== this.toks.length) return fail("\u8868\u8FBE\u5F0F\u591A\u4F59\u5185\u5BB9");
    if (!Number.isFinite(r.value)) return fail("\u7ED3\u679C\u65E0\u6548");
    return r;
  }
  // expr = term (('+'|'-') term)*
  expr() {
    const first = this.term();
    if (first.ok === false) return first;
    let val = first.value;
    for (; ; ) {
      const t2 = this.peek();
      if (t2?.t === "op" && (t2.v === "+" || t2.v === "-")) {
        this.advance();
        const right = this.term();
        if (right.ok === false) return right;
        val = t2.v === "+" ? val + right.value : val - right.value;
      } else break;
    }
    return ok(val);
  }
  // term = factor (('*'|'/') factor)*
  term() {
    const first = this.factor();
    if (first.ok === false) return first;
    let val = first.value;
    for (; ; ) {
      const t2 = this.peek();
      if (t2?.t === "op" && (t2.v === "*" || t2.v === "/")) {
        this.advance();
        const right = this.factor();
        if (right.ok === false) return right;
        if (t2.v === "*") {
          val = val * right.value;
        } else {
          if (right.value === 0) return fail("\u9664\u6570\u4E0D\u80FD\u4E3A 0");
          val = val / right.value;
        }
      } else break;
    }
    return ok(val);
  }
  // factor = ('+'|'-') factor ['%'+] | '(' expr ')' ['%'+] | number ['%'+]
  // 后缀 % 紧贴操作数（最优先的后缀）：每个 % 把值除以 100（纯值语义，如 15% => 0.15、(1+2)% => 0.03）。
  factor() {
    const t2 = this.peek();
    if (!t2) return fail("\u8868\u8FBE\u5F0F\u4E0D\u5B8C\u6574");
    if (t2.t === "op" && (t2.v === "+" || t2.v === "-")) {
      this.advance();
      const f = this.factor();
      if (f.ok === false) return f;
      return this.applyPercent(t2.v === "-" ? -f.value : f.value);
    }
    let value;
    if (t2.t === "lp") {
      this.advance();
      const e = this.expr();
      if (e.ok === false) return e;
      const rp = this.peek();
      if (rp?.t !== "rp") return fail("\u62EC\u53F7\u672A\u95ED\u5408");
      this.advance();
      value = e.value;
    } else if (t2.t === "num") {
      this.advance();
      value = t2.v;
    } else {
      return fail("\u8868\u8FBE\u5F0F\u4E0D\u5B8C\u6574");
    }
    return this.applyPercent(value);
  }
  // 连续的后缀百分号：每个 % 把值除以 100。
  applyPercent(value) {
    let v = value;
    while (this.peek()?.t === "pct") {
      this.advance();
      v = v / 100;
    }
    return ok(v);
  }
  peek() {
    return this.toks[this.pos];
  }
  advance() {
    this.pos++;
  }
};
function evaluateAmount(expr) {
  if (typeof expr !== "string") return fail("\u8BF7\u8F93\u5165\u91D1\u989D");
  const toks = tokenize(expr);
  if (toks === null) return fail("\u91D1\u989D\u683C\u5F0F\u65E0\u6548");
  return new Parser(toks).parse();
}
function amountValueOr(expr, fallback = 0) {
  const r = evaluateAmount(expr);
  return r.ok ? round2(r.value) : fallback;
}

// ../../packages/core/src/fx.ts
var COMMON_CURRENCIES = [
  "CNY",
  "USD",
  "EUR",
  "JPY",
  "HKD",
  "GBP",
  "TWD",
  "KRW",
  "SGD",
  "AUD",
  "CAD",
  "CHF",
  "NZD"
];
var ISO4217_CURRENCIES = /* @__PURE__ */ new Set([
  "AED",
  "AFN",
  "ALL",
  "AMD",
  "ANG",
  "AOA",
  "ARS",
  "AUD",
  "AWG",
  "AZN",
  "BAM",
  "BBD",
  "BDT",
  "BGN",
  "BHD",
  "BIF",
  "BMD",
  "BND",
  "BOB",
  "BRL",
  "BSD",
  "BTN",
  "BWP",
  "BYN",
  "BZD",
  "CAD",
  "CDF",
  "CHF",
  "CLP",
  "CNY",
  "COP",
  "CRC",
  "CUP",
  "CVE",
  "CZK",
  "DJF",
  "DKK",
  "DOP",
  "DZD",
  "EGP",
  "ERN",
  "ETB",
  "EUR",
  "FJD",
  "FKP",
  "GBP",
  "GEL",
  "GHS",
  "GIP",
  "GMD",
  "GNF",
  "GTQ",
  "GYD",
  "HKD",
  "HNL",
  "HRK",
  "HTG",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "IQD",
  "IRR",
  "ISK",
  "JMD",
  "JOD",
  "JPY",
  "KES",
  "KGS",
  "KHR",
  "KMF",
  "KPW",
  "KRW",
  "KWD",
  "KYD",
  "KZT",
  "LAK",
  "LBP",
  "LKR",
  "LRD",
  "LSL",
  "LYD",
  "MAD",
  "MDL",
  "MGA",
  "MKD",
  "MMK",
  "MNT",
  "MOP",
  "MRU",
  "MUR",
  "MVR",
  "MWK",
  "MXN",
  "MYR",
  "MZN",
  "NAD",
  "NGN",
  "NIO",
  "NOK",
  "NPR",
  "NZD",
  "OMR",
  "PAB",
  "PEN",
  "PGK",
  "PHP",
  "PKR",
  "PLN",
  "PYG",
  "QAR",
  "RON",
  "RSD",
  "RUB",
  "RWF",
  "SAR",
  "SBD",
  "SCR",
  "SDG",
  "SEK",
  "SGD",
  "SHP",
  "SLE",
  "SOS",
  "SRD",
  "SSP",
  "STN",
  "SYP",
  "SZL",
  "THB",
  "TJS",
  "TMT",
  "TND",
  "TOP",
  "TRY",
  "TTD",
  "TWD",
  "TZS",
  "UAH",
  "UGX",
  "USD",
  "UYU",
  "UZS",
  "VED",
  "VES",
  "VND",
  "VUV",
  "WST",
  "XAF",
  "XCD",
  "XOF",
  "XPF",
  "YER",
  "ZAR",
  "ZMW",
  "ZWL"
]);
function isValidCurrency(code) {
  return ISO4217_CURRENCIES.has(code.toUpperCase());
}
function convertToBase(amount, from, base, rate) {
  if (from === base) return amount;
  return round2(amount * rate);
}
function txBaseAmount(t2, base) {
  return convertToBase(t2.amount, t2.currency, base, t2.rate ?? 1);
}
function convertBalancesToBase(balances, accounts, rates, base, logger) {
  const out = /* @__PURE__ */ new Map();
  const warned = /* @__PURE__ */ new Set();
  for (const a of accounts) {
    const bal = balances.get(a.id) ?? 0;
    const entry = rates[a.currency];
    const rate = entry?.rate ?? 1;
    if (!entry && a.currency && a.currency !== base && !warned.has(a.currency)) {
      warned.add(a.currency);
      const msg = `\u8D26\u6237\u5E01\u79CD ${a.currency} \u7F3A\u5931\u6C47\u7387\uFF0C\u6309 1 \u56DE\u9000`;
      if (logger) logger.warn("fx", msg, { currency: a.currency });
      else console.warn(`[fx] ${msg}`);
    }
    out.set(a.id, convertToBase(bal, a.currency, base, rate));
  }
  return out;
}
function currencyOptions(rates, accounts, base) {
  const set = /* @__PURE__ */ new Set([base, ...Object.keys(rates)]);
  for (const a of accounts) {
    if (a.currency) set.add(a.currency);
  }
  return Array.from(set).sort();
}
var CURRENCY_CN = {
  AED: "\u963F\u8054\u914B\u8FEA\u62C9\u59C6",
  AFN: "\u963F\u5BCC\u6C57\u5C3C",
  ALL: "\u963F\u5C14\u5DF4\u5C3C\u4E9A\u5217\u514B",
  AMD: "\u4E9A\u7F8E\u5C3C\u4E9A\u5FB7\u62C9\u59C6",
  ANG: "\u8377\u5C5E\u5B89\u7684\u5217\u65AF\u76FE",
  AOA: "\u5B89\u54E5\u62C9\u5BBD\u624E",
  ARS: "\u963F\u6839\u5EF7\u6BD4\u7D22",
  AUD: "\u6FB3\u5143",
  AWG: "\u963F\u9C81\u5DF4\u5F17\u7F57\u6797",
  AZN: "\u963F\u585E\u62DC\u7586\u9A6C\u7EB3\u7279",
  BAM: "\u6CE2\u9ED1\u9A6C\u514B",
  BBD: "\u5DF4\u5DF4\u591A\u65AF\u5143",
  BDT: "\u5B5F\u52A0\u62C9\u5854\u5361",
  BGN: "\u4FDD\u52A0\u5229\u4E9A\u5217\u5F17",
  BHD: "\u5DF4\u6797\u7B2C\u7EB3\u5C14",
  BIF: "\u5E03\u9686\u8FEA\u6CD5\u90CE",
  BMD: "\u767E\u6155\u5927\u5143",
  BND: "\u6587\u83B1\u5143",
  BOB: "\u73BB\u5229\u7EF4\u4E9A\u8BFA",
  BRL: "\u5DF4\u897F\u96F7\u4E9A\u5C14",
  BSD: "\u5DF4\u54C8\u9A6C\u5143",
  BTN: "\u4E0D\u4E39\u52AA\u5C14\u7279\u9C81\u59C6",
  BWP: "\u535A\u8328\u74E6\u7EB3\u666E\u62C9",
  BYN: "\u767D\u4FC4\u7F57\u65AF\u5362\u5E03",
  BZD: "\u4F2F\u5229\u5179\u5143",
  CAD: "\u52A0\u5143",
  CDF: "\u521A\u679C\u6CD5\u90CE",
  CHF: "\u745E\u58EB\u6CD5\u90CE",
  CLP: "\u667A\u5229\u6BD4\u7D22",
  CNY: "\u4EBA\u6C11\u5E01",
  COP: "\u54E5\u4F26\u6BD4\u4E9A\u6BD4\u7D22",
  CRC: "\u54E5\u65AF\u8FBE\u9ECE\u52A0\u79D1\u6717",
  CUP: "\u53E4\u5DF4\u6BD4\u7D22",
  CVE: "\u4F5B\u5F97\u89D2\u57C3\u65AF\u5E93\u591A",
  CZK: "\u6377\u514B\u514B\u6717",
  DJF: "\u5409\u5E03\u63D0\u6CD5\u90CE",
  DKK: "\u4E39\u9EA6\u514B\u6717",
  DOP: "\u591A\u7C73\u5C3C\u52A0\u6BD4\u7D22",
  DZD: "\u963F\u5C14\u53CA\u5229\u4E9A\u7B2C\u7EB3\u5C14",
  EGP: "\u57C3\u53CA\u9551",
  ERN: "\u5384\u7ACB\u7279\u91CC\u4E9A\u7EB3\u514B\u6CD5",
  ETB: "\u57C3\u585E\u4FC4\u6BD4\u4E9A\u6BD4\u5C14",
  EUR: "\u6B27\u5143",
  FJD: "\u6590\u6D4E\u5143",
  FKP: "\u798F\u514B\u5170\u7FA4\u5C9B\u9551",
  GBP: "\u82F1\u9551",
  GEL: "\u683C\u9C81\u5409\u4E9A\u62C9\u91CC",
  GHS: "\u52A0\u7EB3\u585E\u5730",
  GIP: "\u76F4\u5E03\u7F57\u9640\u9551",
  GMD: "\u5188\u6BD4\u4E9A\u8FBE\u62C9\u897F",
  GNF: "\u51E0\u5185\u4E9A\u6CD5\u90CE",
  GTQ: "\u5371\u5730\u9A6C\u62C9\u683C\u67E5\u5C14",
  GYD: "\u572D\u4E9A\u90A3\u5143",
  HKD: "\u6E2F\u5143",
  HNL: "\u6D2A\u90FD\u62C9\u65AF\u4F26\u76AE\u62C9",
  HRK: "\u514B\u7F57\u5730\u4E9A\u5E93\u7EB3",
  HTG: "\u6D77\u5730\u53E4\u5FB7",
  HUF: "\u5308\u7259\u5229\u798F\u6797",
  IDR: "\u5370\u5C3C\u76FE",
  ILS: "\u4EE5\u8272\u5217\u65B0\u8C22\u514B\u5C14",
  INR: "\u5370\u5EA6\u5362\u6BD4",
  IQD: "\u4F0A\u62C9\u514B\u7B2C\u7EB3\u5C14",
  IRR: "\u4F0A\u6717\u91CC\u4E9A\u5C14",
  ISK: "\u51B0\u5C9B\u514B\u6717",
  JMD: "\u7259\u4E70\u52A0\u5143",
  JOD: "\u7EA6\u65E6\u7B2C\u7EB3\u5C14",
  JPY: "\u65E5\u5143",
  KES: "\u80AF\u5C3C\u4E9A\u5148\u4EE4",
  KGS: "\u5409\u5C14\u5409\u65AF\u65AF\u5766\u7D22\u59C6",
  KHR: "\u67EC\u57D4\u5BE8\u745E\u5C14",
  KMF: "\u79D1\u6469\u7F57\u6CD5\u90CE",
  KPW: "\u671D\u9C9C\u5706",
  KRW: "\u97E9\u5143",
  KWD: "\u79D1\u5A01\u7279\u7B2C\u7EB3\u5C14",
  KYD: "\u5F00\u66FC\u7FA4\u5C9B\u5143",
  KZT: "\u54C8\u8428\u514B\u65AF\u5766\u575A\u6208",
  LAK: "\u8001\u631D\u57FA\u666E",
  LBP: "\u9ECE\u5DF4\u5AE9\u9551",
  LKR: "\u65AF\u91CC\u5170\u5361\u5362\u6BD4",
  LRD: "\u5229\u6BD4\u91CC\u4E9A\u5143",
  LSL: "\u83B1\u7D22\u6258\u6D1B\u8482",
  LYD: "\u5229\u6BD4\u4E9A\u7B2C\u7EB3\u5C14",
  MAD: "\u6469\u6D1B\u54E5\u8FEA\u62C9\u59C6",
  MDL: "\u6469\u5C14\u591A\u74E6\u5217\u4F0A",
  MGA: "\u9A6C\u8FBE\u52A0\u65AF\u52A0\u963F\u91CC\u4E9A\u91CC",
  MKD: "\u5317\u9A6C\u5176\u987F\u7B2C\u7EB3\u5C14",
  MMK: "\u7F05\u7538\u5143",
  MNT: "\u8499\u53E4\u56FE\u683C\u91CC\u514B",
  MOP: "\u6FB3\u95E8\u5143",
  MRU: "\u6BDB\u91CC\u5854\u5C3C\u4E9A\u4E4C\u5409\u4E9A",
  MUR: "\u6BDB\u91CC\u6C42\u65AF\u5362\u6BD4",
  MVR: "\u9A6C\u5C14\u4EE3\u592B\u62C9\u83F2\u4E9A",
  MWK: "\u9A6C\u62C9\u7EF4\u514B\u74E6\u67E5",
  MXN: "\u58A8\u897F\u54E5\u6BD4\u7D22",
  MYR: "\u9A6C\u6765\u897F\u4E9A\u6797\u5409\u7279",
  MZN: "\u83AB\u6851\u6BD4\u514B\u6885\u8482\u5361\u5C14",
  NAD: "\u7EB3\u7C73\u6BD4\u4E9A\u5143",
  NGN: "\u5C3C\u65E5\u5229\u4E9A\u5948\u62C9",
  NIO: "\u5C3C\u52A0\u62C9\u74DC\u79D1\u591A\u5DF4",
  NOK: "\u632A\u5A01\u514B\u6717",
  NPR: "\u5C3C\u6CCA\u5C14\u5362\u6BD4",
  NZD: "\u65B0\u897F\u5170\u5143",
  OMR: "\u963F\u66FC\u91CC\u4E9A\u5C14",
  PAB: "\u5DF4\u62FF\u9A6C\u5DF4\u6CE2\u4E9A",
  PEN: "\u79D8\u9C81\u7D22\u5C14",
  PGK: "\u5DF4\u5E03\u4E9A\u65B0\u51E0\u5185\u4E9A\u57FA\u90A3",
  PHP: "\u83F2\u5F8B\u5BBE\u6BD4\u7D22",
  PKR: "\u5DF4\u57FA\u65AF\u5766\u5362\u6BD4",
  PLN: "\u6CE2\u5170\u5179\u7F57\u63D0",
  PYG: "\u5DF4\u62C9\u572D\u74DC\u62C9\u5C3C",
  QAR: "\u5361\u5854\u5C14\u91CC\u4E9A\u5C14",
  RON: "\u7F57\u9A6C\u5C3C\u4E9A\u5217\u4F0A",
  RSD: "\u585E\u5C14\u7EF4\u4E9A\u7B2C\u7EB3\u5C14",
  RUB: "\u4FC4\u7F57\u65AF\u5362\u5E03",
  RWF: "\u5362\u65FA\u8FBE\u6CD5\u90CE",
  SAR: "\u6C99\u7279\u91CC\u4E9A\u5C14",
  SBD: "\u6240\u7F57\u95E8\u7FA4\u5C9B\u5143",
  SCR: "\u585E\u820C\u5C14\u5362\u6BD4",
  SDG: "\u82CF\u4E39\u9551",
  SEK: "\u745E\u5178\u514B\u6717",
  SGD: "\u65B0\u52A0\u5761\u5143",
  SHP: "\u5723\u8D6B\u52D2\u62FF\u9551",
  SLE: "\u585E\u62C9\u5229\u6602\u5229\u6602",
  SOS: "\u7D22\u9A6C\u91CC\u5148\u4EE4",
  SRD: "\u82CF\u91CC\u5357\u5143",
  SSP: "\u5357\u82CF\u4E39\u9551",
  STN: "\u5723\u591A\u7F8E\u591A\u5E03\u62C9",
  SYP: "\u53D9\u5229\u4E9A\u9551",
  SZL: "\u65AF\u5A01\u58EB\u5170\u91CC\u5170\u5409\u5C3C",
  THB: "\u6CF0\u94E2",
  TJS: "\u5854\u5409\u514B\u65AF\u5766\u7D22\u83AB\u5C3C",
  TMT: "\u571F\u5E93\u66FC\u65AF\u5766\u9A6C\u7EB3\u7279",
  TND: "\u7A81\u5C3C\u65AF\u7B2C\u7EB3\u5C14",
  TOP: "\u6C64\u52A0\u6F58\u52A0",
  TRY: "\u571F\u8033\u5176\u91CC\u62C9",
  TTD: "\u7279\u7ACB\u5C3C\u8FBE\u548C\u591A\u5DF4\u54E5\u5143",
  TWD: "\u65B0\u53F0\u5E01",
  TZS: "\u5766\u6851\u5C3C\u4E9A\u5148\u4EE4",
  UAH: "\u4E4C\u514B\u5170\u683C\u91CC\u592B\u7EB3",
  UGX: "\u4E4C\u5E72\u8FBE\u5148\u4EE4",
  USD: "\u7F8E\u5143",
  UYU: "\u4E4C\u62C9\u572D\u6BD4\u7D22",
  UZS: "\u4E4C\u5179\u522B\u514B\u65AF\u5766\u82CF\u59C6",
  VED: "\u59D4\u5185\u745E\u62C9\u73BB\u5229\u74E6\u5C14",
  VES: "\u59D4\u5185\u745E\u62C9\u4E3B\u6743\u73BB\u5229\u74E6\u5C14",
  VND: "\u8D8A\u5357\u76FE",
  VUV: "\u74E6\u52AA\u963F\u56FE\u74E6\u56FE",
  WST: "\u8428\u6469\u4E9A\u5854\u62C9",
  XAF: "\u4E2D\u975E\u6CD5\u90CE",
  XCD: "\u4E1C\u52A0\u52D2\u6BD4\u5143",
  XOF: "\u897F\u975E\u6CD5\u90CE",
  XPF: "\u592A\u5E73\u6D0B\u6CD5\u90CE",
  YER: "\u4E5F\u95E8\u91CC\u4E9A\u5C14",
  ZAR: "\u5357\u975E\u5170\u7279",
  ZMW: "\u8D5E\u6BD4\u4E9A\u514B\u74E6\u67E5",
  ZWL: "\u6D25\u5DF4\u5E03\u97E6\u5143"
};
var CURRENCY_CATALOG = Array.from(ISO4217_CURRENCIES).sort().map((code) => ({ code, name: CURRENCY_CN[code] ?? code }));
var CN_BY_CODE = new Map(CURRENCY_CATALOG.map((c) => [c.code, c.name]));
function currencyCn(code) {
  return CN_BY_CODE.get(code.toUpperCase()) ?? code;
}
function currencyDisplayName(code, locale = "zh") {
  const up = code.toUpperCase();
  if (locale === "zh") return currencyCn(up);
  try {
    const n = new Intl.DisplayNames([locale], { type: "currency" }).of(up);
    return n && n !== up ? n : up;
  } catch {
    return up;
  }
}
var COMMON_ORDER = new Map(COMMON_CURRENCIES.map((code, i) => [code, i]));
function filterCurrencies(query, locale = "zh") {
  const q = query.trim().toLowerCase();
  const list = CURRENCY_CATALOG.map((c) => ({ code: c.code, name: currencyDisplayName(c.code, locale) }));
  const filtered = q ? list.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)) : list;
  return filtered.slice().sort((a, b) => {
    const ai = COMMON_ORDER.get(a.code);
    const bi = COMMON_ORDER.get(b.code);
    if (ai !== void 0 && bi !== void 0) return ai - bi;
    if (ai !== void 0) return -1;
    if (bi !== void 0) return 1;
    return a.code.localeCompare(b.code);
  });
}
function orderedCurrencyCatalog(locale = "zh") {
  const commonSet = new Set(COMMON_CURRENCIES);
  const common = COMMON_CURRENCIES.filter((code) => ISO4217_CURRENCIES.has(code)).map((code) => ({ code, name: currencyDisplayName(code, locale) }));
  const rest = CURRENCY_CATALOG.filter((c) => !commonSet.has(c.code)).map((c) => ({ code: c.code, name: currencyDisplayName(c.code, locale) }));
  return [
    { labelKey: "currency.group.common", items: common },
    { labelKey: "currency.group.all", count: CURRENCY_CATALOG.length, items: rest }
  ];
}
function todayDateStr() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function rateRowsFromTable(rates) {
  return Object.entries(rates).map(([currency, e]) => ({
    id: crypto.randomUUID(),
    currency,
    rate: String(e.rate),
    asOf: e.asOf
  }));
}
function rateRowsToTable(rows, base) {
  const t2 = {};
  for (const r of rows) {
    const c = r.currency.trim().toUpperCase();
    if (!c || c === base) continue;
    const v = evaluateAmount(r.rate);
    if (!v.ok || v.value <= 0) continue;
    t2[c] = { rate: round2(v.value), asOf: r.asOf.trim() };
  }
  return t2;
}
function validateRateRows(rows, base) {
  const invalid = [];
  const seen = /* @__PURE__ */ new Set();
  const duplicates = [];
  const missingRate = [];
  const baseRows = [];
  let emptyRows = 0;
  for (const r of rows) {
    const c = r.currency.trim().toUpperCase();
    if (!c) {
      emptyRows++;
      continue;
    }
    if (c === base) {
      baseRows.push(c);
      continue;
    }
    if (!isValidCurrency(c)) {
      invalid.push(c);
      continue;
    }
    const v = evaluateAmount(r.rate);
    if (!v.ok || v.value <= 0) {
      missingRate.push(c);
      continue;
    }
    if (seen.has(c)) {
      duplicates.push(c);
    } else {
      seen.add(c);
    }
  }
  return { invalid, duplicates, missingRate, emptyRows, baseRows };
}

// ../../packages/core/src/rateClient.ts
var DEFAULT_RATE_CONFIG = {};
function parseRateResponse(json, base, asOfFallback) {
  if (!json || typeof json !== "object") return null;
  const obj = json;
  const rates = obj.rates;
  if (!rates || typeof rates !== "object") return null;
  const asOf = typeof obj.date === "string" && obj.date.trim() !== "" ? obj.date : asOfFallback;
  const baseUpper = base.toUpperCase();
  const out = {};
  let count = 0;
  for (const [code, value] of Object.entries(rates)) {
    if (typeof code !== "string") continue;
    const c = code.toUpperCase().trim();
    if (!c || c === baseUpper) continue;
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) continue;
    const rate = round2(1 / value);
    if (!(rate > 0)) continue;
    out[c] = { rate, asOf };
    count++;
  }
  return count > 0 ? out : null;
}
function mergeRatesByVisible(local, fetched, visible) {
  const keep = /* @__PURE__ */ new Set();
  for (const c of visible) {
    const norm = c.trim().toUpperCase();
    if (norm) keep.add(norm);
  }
  const merged = {};
  let updated = 0;
  for (const c of keep) {
    const fresh = fetched[c];
    if (fresh) {
      merged[c] = fresh;
      updated++;
    } else {
      const old = local[c];
      if (old) merged[c] = old;
    }
  }
  return { merged, updated };
}
function rebaseRateTable(local, oldBase, newBase, fetched, asOfFallback) {
  const ob = oldBase.trim().toUpperCase();
  const nb = newBase.trim().toUpperCase();
  if (ob === nb) return { ...local };
  const nbEntry = local[nb];
  const oldBaseToNew = fetched[ob]?.rate ?? (nbEntry?.rate ? round2(1 / nbEntry.rate) : 1);
  const out = {};
  const codes = new Set(Object.keys(local).map((c) => c.toUpperCase()));
  codes.add(ob);
  codes.delete(nb);
  for (const c of codes) {
    if (c === ob) {
      out[c] = fetched[ob] ?? { rate: round2(oldBaseToNew), asOf: asOfFallback };
      continue;
    }
    const fresh = fetched[c];
    if (fresh) {
      out[c] = fresh;
      continue;
    }
    const old = local[c];
    if (old) {
      out[c] = { rate: round2(old.rate * oldBaseToNew), asOf: old.asOf };
    } else {
      out[c] = { rate: 1, asOf: asOfFallback };
    }
  }
  return out;
}

// ../../packages/core/src/noteAmount.ts
function extractAmountFromNote(text) {
  if (typeof text !== "string" || text.length === 0) return null;
  const numRe = /\d[\d,]*(?:\.\d+)?/g;
  const moneyPrefix = /* @__PURE__ */ new Set(["\xA5", "\uFFE5", "$", "\uFF04"]);
  const moneySuffix = /* @__PURE__ */ new Set(["\u5143", "\u5706", "\u5757"]);
  const excludedSuffix = /* @__PURE__ */ new Set([
    "\u676F",
    "\u4E2A",
    "\u4EF6",
    "\u74F6",
    "\u4EFD",
    "\u76D2",
    "\u5305",
    "\u6B21",
    "\u8D9F",
    "\u5347",
    "\u65A4",
    "\u4E24",
    "\u514B",
    "\u6761",
    "\u5F20",
    "\u672C",
    "\u9875",
    "\u5957",
    "\u697C",
    "\u5C42",
    "\u5C81",
    "\u4EBA",
    "\u8DEF",
    "\u53F7",
    "\u5E74",
    "\u6708",
    "\u65E5",
    "\u65F6",
    "\u70B9",
    "\u5206",
    "\u79D2",
    "\u6BEB"
  ]);
  const toks = [];
  let m;
  numRe.lastIndex = 0;
  while ((m = numRe.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    const before = start > 0 ? text[start - 1] : "";
    const after = end < text.length ? text[end] : "";
    const rest = end < text.length ? text.slice(end) : "";
    if (before === ":" || before === "\uFF1A" || after === ":" || after === "\uFF1A") continue;
    if (after && excludedSuffix.has(after)) continue;
    if (/^(ml|kg)/i.test(rest)) continue;
    const cleaned = m[0].replace(/,/g, "");
    const val = Number(cleaned);
    if (!Number.isFinite(val) || val <= 0) continue;
    const isMoney = before !== "" && moneyPrefix.has(before) || after !== "" && moneySuffix.has(after) || /^rmb/i.test(rest);
    toks.push({ value: cleaned, type: isMoney ? "money" : "plain" });
  }
  const money = toks.find((t2) => t2.type === "money");
  if (money) return money.value;
  if (toks.length > 0) return toks[toks.length - 1].value;
  return null;
}

// ../../packages/core/src/fold.ts
function foldEvents(events, logger) {
  const latest = /* @__PURE__ */ new Map();
  for (const ev of events) {
    const key = ev.op === "upsert" ? ev.id : ev.targetId;
    const prev = latest.get(key);
    if (!prev || ev.updatedAt >= prev.updatedAt) {
      latest.set(key, ev);
    }
  }
  const entries = [];
  let warnedLegacyAdjust = false;
  for (const ev of latest.values()) {
    if (ev.op !== "upsert") continue;
    if (ev.type === "adjust") {
      if (!warnedLegacyAdjust) {
        if (logger) logger.warn("fold", "\u8DF3\u8FC7\u9057\u7559\u7684 adjust \u4E8B\u4EF6\uFF1B\u8BE5\u7C7B\u578B\u5DF2\u88AB\u79FB\u9664\uFF0C\u8BF7\u901A\u8FC7\u300C\u4FEE\u6539\u4F59\u989D\u300D\u91CD\u65B0\u767B\u8BB0\u3002");
        else console.warn("[foldEvents] \u8DF3\u8FC7\u9057\u7559\u7684 adjust \u4E8B\u4EF6\uFF1B\u8BE5\u7C7B\u578B\u5DF2\u88AB\u79FB\u9664\uFF0C\u8BF7\u901A\u8FC7\u300C\u4FEE\u6539\u4F59\u989D\u300D\u91CD\u65B0\u767B\u8BB0\u3002");
        warnedLegacyAdjust = true;
      }
      continue;
    }
    entries.push([tsKey(ev.ts), toTransaction(ev)]);
  }
  entries.sort((a, b) => b[0] - a[0]);
  return entries.map(([, t2]) => t2);
}
function tsKey(ts2) {
  const t2 = Date.parse(ts2);
  return Number.isNaN(t2) ? 0 : t2;
}
function toTransaction(ev) {
  const {
    op: _op,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    source: _source,
    device: _device,
    ...data
  } = ev;
  return data;
}
function detectTiedConflicts(events) {
  const top = /* @__PURE__ */ new Map();
  for (const ev of events) {
    const key = ev.op === "upsert" ? ev.id : ev.targetId;
    const cur = top.get(key);
    if (!cur) {
      top.set(key, { updatedAt: ev.updatedAt, count: 1 });
    } else if (ev.updatedAt > cur.updatedAt) {
      top.set(key, { updatedAt: ev.updatedAt, count: 1 });
    } else if (ev.updatedAt === cur.updatedAt) {
      cur.count += 1;
    }
  }
  return [...top.entries()].filter(([, v]) => v.count > 1).map(([id, v]) => ({ id, count: v.count }));
}

// ../../packages/core/src/logger.ts
var SENSITIVE_CTX_KEYS = /* @__PURE__ */ new Set([
  "amount",
  "toAmount",
  "rate",
  "openingBalance",
  "balance",
  "netWorth",
  "name",
  "accountName",
  "categoryName",
  "subcategoryName",
  "personName",
  "alias",
  "note",
  "remark",
  "memo",
  // 账本密码门禁：明文密码、哈希、盐绝不进诊断日志（仅可记操作类型/成败）
  "password",
  "oldPassword",
  "newPassword",
  "passwordHash",
  "passwordSalt"
]);
var REDACTED = "[redacted]";
function redactContext(ctx) {
  if (!ctx) return ctx;
  let out;
  for (const [k, v] of Object.entries(ctx)) {
    if (SENSITIVE_CTX_KEYS.has(k)) {
      if (out === void 0) out = { ...ctx };
      out[k] = REDACTED;
    }
  }
  return out ?? ctx;
}
function levelName(level) {
  if (level === 10 /* Debug */) return "DEBUG";
  if (level === 20 /* Info */) return "INFO";
  if (level === 30 /* Warn */) return "WARN";
  return "ERROR";
}

// ../../packages/core/src/listSort.ts
function sortTransactions(transactions, sort) {
  const indexed = transactions.map((t2, i) => [t2, i]);
  if (sort === "time-asc") {
    indexed.sort(([a, ai], [b, bi]) => {
      const cmp = Date.parse(a.ts) - Date.parse(b.ts);
      return cmp !== 0 ? cmp : ai - bi;
    });
  } else if (sort === "amount-desc") {
    indexed.sort(([a, ai], [b, bi]) => {
      const cmp = b.amount - a.amount;
      return cmp !== 0 ? cmp : Date.parse(b.ts) - Date.parse(a.ts) || bi - ai;
    });
  } else if (sort === "amount-asc") {
    indexed.sort(([a, ai], [b, bi]) => {
      const cmp = a.amount - b.amount;
      return cmp !== 0 ? cmp : Date.parse(a.ts) - Date.parse(b.ts) || ai - bi;
    });
  } else {
    indexed.sort(([a, ai], [b, bi]) => {
      const cmp = Date.parse(b.ts) - Date.parse(a.ts);
      return cmp !== 0 ? cmp : bi - ai;
    });
  }
  return indexed.map(([t2]) => t2);
}

// ../../packages/core/src/listFilter.ts
function filterAndSortTransactions(transactions, filters) {
  const query = filters.query.trim().toLowerCase();
  const list = transactions.filter((t2) => {
    if (filters.types.length > 0 && !filters.types.includes(t2.type)) return false;
    if (filters.account && ![t2.account, t2.fromAccount, t2.toAccount, t2.person].includes(filters.account)) return false;
    if (filters.uncategorized) {
      if (t2.category) return false;
    } else if (filters.category && t2.category !== filters.category) return false;
    if (filters.recurringRuleId && t2.recurringRuleId !== filters.recurringRuleId) return false;
    if (filters.minAmount != null && t2.amount < filters.minAmount) return false;
    if (filters.maxAmount != null && t2.amount > filters.maxAmount) return false;
    if (filters.from && isoToDateStr(t2.ts) < filters.from) return false;
    if (filters.to && isoToDateStr(t2.ts) > filters.to) return false;
    if (query) {
      const hay = [t2.note, t2.category, t2.subcategory].filter(Boolean).join(" ").toLowerCase();
      const queryNum = Number(query);
      const amountMatch = query.trim() !== "" && Number.isFinite(queryNum) && t2.amount === queryNum;
      if (!hay.includes(query) && !amountMatch) return false;
    }
    return true;
  });
  return sortTransactions(list, filters.sort);
}

// ../../packages/core/src/balance.ts
function loanCashIn(direction) {
  return direction === "borrow" || direction === "collect";
}
function computeBalances(transactions, accounts) {
  const balances = /* @__PURE__ */ new Map();
  for (const a of accounts) balances.set(a.id, round2(a.openingBalance));
  const get = (id) => balances.get(id) ?? 0;
  for (const t2 of transactions) {
    switch (t2.type) {
      case "expense":
        if (t2.account) balances.set(t2.account, round2(get(t2.account) - t2.amount));
        break;
      case "income":
        if (t2.account) balances.set(t2.account, round2(get(t2.account) + t2.amount));
        break;
      case "transfer":
        if (t2.fromAccount) balances.set(t2.fromAccount, round2(get(t2.fromAccount) - t2.amount));
        if (t2.toAccount) balances.set(t2.toAccount, round2(get(t2.toAccount) + (t2.toAmount ?? t2.amount)));
        break;
      case "loan": {
        const yours = t2.account;
        const person = t2.person;
        const selfInc = loanCashIn(t2.direction);
        const amt = t2.amount;
        if (yours) balances.set(yours, round2(get(yours) + (selfInc ? amt : -amt)));
        if (person) balances.set(person, round2(get(person) + (selfInc ? -amt : amt)));
        break;
      }
    }
  }
  return balances;
}
function tsMs(ts2) {
  const t2 = Date.parse(ts2);
  return Number.isNaN(t2) ? 0 : t2;
}
function computeBalancesUpTo(transactions, accounts, targetTxId) {
  const chronological = [...transactions].sort((a, b) => tsMs(a.ts) - tsMs(b.ts));
  const idx = chronological.findIndex((t2) => t2.id === targetTxId);
  if (idx < 0) return null;
  return computeBalances(chronological.slice(0, idx + 1), accounts);
}
function accountDelta(t2, accountId) {
  switch (t2.type) {
    case "expense":
      return t2.account === accountId ? -t2.amount : 0;
    case "income":
      return t2.account === accountId ? t2.amount : 0;
    case "transfer": {
      let d = 0;
      if (t2.fromAccount === accountId) d -= t2.amount;
      if (t2.toAccount === accountId) d += t2.toAmount ?? t2.amount;
      return d;
    }
    case "loan": {
      const selfInc = loanCashIn(t2.direction);
      let d = 0;
      if (t2.account === accountId) d += selfInc ? t2.amount : -t2.amount;
      if (t2.person === accountId) d += selfInc ? -t2.amount : t2.amount;
      return d;
    }
  }
}
function touchesAccount(t2, accountId) {
  return t2.account === accountId || t2.fromAccount === accountId || t2.toAccount === accountId || t2.person === accountId;
}
function computeRunningBalanceForAccount(transactions, accounts, accountId) {
  const chronological = [...transactions].sort((a, b) => tsMs(a.ts) - tsMs(b.ts));
  const opening = accounts.find((a) => a.id === accountId)?.openingBalance ?? 0;
  let bal = round2(opening);
  const map = /* @__PURE__ */ new Map();
  for (const t2 of chronological) {
    if (touchesAccount(t2, accountId)) {
      bal = round2(bal + accountDelta(t2, accountId));
      map.set(t2.id, bal);
    }
  }
  return map;
}
function predictOverdraft(accounts, baseline, newTx, settings) {
  const assetIds = new Set(
    accounts.filter((a) => accountKindOf(settings, a.type) !== "liability" && a.type !== "person").map((a) => a.id)
  );
  const concerned = [newTx.account, newTx.fromAccount, newTx.toAccount, newTx.person].filter(
    (id) => !!id
  );
  const result = [];
  const seen = /* @__PURE__ */ new Set();
  for (const id of concerned) {
    if (seen.has(id) || !assetIds.has(id)) continue;
    seen.add(id);
    const delta = accountDelta(newTx, id);
    if (delta >= 0) continue;
    const wouldBe = round2((baseline.get(id) ?? 0) + delta);
    if (wouldBe < 0) result.push({ accountId: id, wouldBe });
  }
  return result;
}

// ../../packages/core/src/monthGroups.ts
function buildMonthGroups(sorted, opts) {
  const { sort, base, singleAccount = false, accountId, balanceByTxId = null } = opts;
  const useFlow = singleAccount && !!accountId;
  const order = [];
  const map = /* @__PURE__ */ new Map();
  for (const t2 of sorted) {
    const ym = isoToMonthStr(t2.ts);
    if (!ym) continue;
    let g = map.get(ym);
    if (!g) {
      g = { ym, txs: [], income: 0, expense: 0 };
      map.set(ym, g);
      order.push(ym);
    }
    g.txs.push(t2);
    if (useFlow) {
      const delta = accountDelta(t2, accountId);
      if (delta > 0) g.income += delta;
      else if (delta < 0) g.expense += -delta;
    } else {
      const amt = txBaseAmount(t2, base);
      if (t2.type === "income") g.income += amt;
      else if (t2.type === "expense") g.expense += amt;
    }
  }
  return order.map((ym) => {
    const g = map.get(ym);
    if (!g) return { ym, txs: [], income: 0, expense: 0 };
    const res = { ...g, income: round2(g.income), expense: round2(g.expense) };
    if (balanceByTxId) {
      const endTx = sort === "time-desc" ? g.txs[0] : g.txs[g.txs.length - 1];
      if (endTx) {
        const bal = balanceByTxId.get(endTx.id);
        if (bal != null) res.endBalance = bal;
      }
    }
    return res;
  });
}

// ../../packages/core/src/networth.ts
function computeNetWorth(transactions, accounts, opts) {
  const native = computeBalances(transactions, accounts);
  const balances = opts?.base ? convertBalancesToBase(native, accounts, opts.rates ?? {}, opts.base, opts.logger) : native;
  let totalAssets = 0;
  let totalLiabilities = 0;
  let creditPayable = 0;
  const receivables = [];
  const payables = [];
  for (const a of accounts) {
    const bal = balances.get(a.id) ?? 0;
    if (a.type === "person") {
      if (bal > 0) {
        totalAssets += bal;
        receivables.push({ accountId: a.id, name: a.name, amount: bal });
      } else if (bal < 0) {
        totalLiabilities += -bal;
        payables.push({ accountId: a.id, name: a.name, amount: -bal });
      }
      continue;
    }
    if (accountKindOf(opts?.accountTypeSettings, a.type) === "liability") {
      if (bal < 0) {
        totalLiabilities += -bal;
        if (a.type === "credit") creditPayable += -bal;
      } else {
        totalAssets += bal;
      }
      continue;
    }
    totalAssets += bal;
  }
  return {
    totalAssets: round2(totalAssets),
    totalLiabilities: round2(totalLiabilities),
    netWorth: round2(totalAssets - totalLiabilities),
    creditPayable: round2(creditPayable),
    receivables: receivables.map((r) => ({ ...r, amount: round2(r.amount) })),
    payables: payables.map((p) => ({ ...p, amount: round2(p.amount) }))
  };
}
function tsMs2(ts2) {
  const t2 = Date.parse(ts2);
  return Number.isNaN(t2) ? 0 : t2;
}
var pad2 = (n) => String(n).padStart(2, "0");
function netWorthSeries(transactions, accounts, startYM, monthsCount, opts) {
  const parts = startYM.split("-").map(Number);
  const sy = parts[0] ?? 0;
  const sm = parts[1] ?? 1;
  const sorted = [...transactions].sort((a, b) => tsMs2(a.ts) - tsMs2(b.ts));
  const points = [];
  const cumulative = [];
  let cursor = 0;
  for (let i = 0; i < monthsCount; i++) {
    const d = new Date(Date.UTC(sy, sm - 1 + i, 1));
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const cutoff = Date.parse(localDateStartISO(y, m + 1, 1));
    while (cursor < sorted.length) {
      const t2 = sorted[cursor];
      if (t2 && tsMs2(t2.ts) < cutoff) {
        cumulative.push(t2);
        cursor += 1;
      } else {
        break;
      }
    }
    const nw = computeNetWorth(cumulative, accounts, opts);
    points.push({
      bucket: `${y}-${pad2(m)}`,
      totalAssets: nw.totalAssets,
      totalLiabilities: nw.totalLiabilities,
      netWorth: nw.netWorth
    });
  }
  return points;
}
function netWorthYearlySeries(transactions, accounts, startYear, yearsCount, opts) {
  const sorted = [...transactions].sort((a, b) => tsMs2(a.ts) - tsMs2(b.ts));
  const points = [];
  const cumulative = [];
  let cursor = 0;
  for (let i = 0; i < yearsCount; i++) {
    const y = startYear + i;
    const cutoff = Date.parse(localDateStartISO(y + 1, 1, 1));
    while (cursor < sorted.length) {
      const t2 = sorted[cursor];
      if (t2 && tsMs2(t2.ts) < cutoff) {
        cumulative.push(t2);
        cursor += 1;
      } else {
        break;
      }
    }
    const nw = computeNetWorth(cumulative, accounts, opts);
    points.push({
      bucket: String(y),
      totalAssets: nw.totalAssets,
      totalLiabilities: nw.totalLiabilities,
      netWorth: nw.netWorth
    });
  }
  return points;
}

// ../../packages/core/src/reports.ts
function inRange(ts2, start, endExclusive) {
  const t2 = Date.parse(ts2);
  if (Number.isNaN(t2)) return false;
  if (start) {
    const s = Date.parse(start);
    if (!Number.isNaN(s) && t2 < s) return false;
  }
  if (endExclusive) {
    const e = Date.parse(endExclusive);
    if (!Number.isNaN(e) && t2 >= e) return false;
  }
  return true;
}
function periodTotals(transactions, start, endExclusive, opts) {
  const base = opts?.base;
  let income = 0;
  let expense = 0;
  for (const t2 of transactions) {
    if (!inRange(t2.ts, start, endExclusive)) continue;
    const amt = base ? txBaseAmount(t2, base) : t2.amount;
    if (t2.type === "income") income += amt;
    else if (t2.type === "expense") expense += amt;
  }
  return { income: round2(income), expense: round2(expense), surplus: round2(income - expense) };
}
function categoryBreakdown(transactions, opts) {
  const { flow, start, end, base } = opts;
  const byCat = /* @__PURE__ */ new Map();
  let total = 0;
  for (const t2 of transactions) {
    if (t2.type !== flow) continue;
    if (!inRange(t2.ts, start, end)) continue;
    const cat = t2.category ?? "";
    const amt = base ? txBaseAmount(t2, base) : t2.amount;
    byCat.set(cat, (byCat.get(cat) ?? 0) + amt);
    total += amt;
  }
  const slices = [...byCat.entries()].map(([category, amount]) => ({
    category,
    amount: round2(amount),
    percent: total > 0 ? amount / total : 0
  }));
  slices.sort((a, b) => b.amount - a.amount);
  return slices;
}
function monthlyTrend(transactions, startYM, monthsCount, opts) {
  const base = opts?.base;
  const parts = startYM.split("-").map(Number);
  const sy = parts[0] ?? 0;
  const sm = parts[1] ?? 1;
  const buckets = [];
  const index = /* @__PURE__ */ new Map();
  for (let i = 0; i < monthsCount; i++) {
    const d = new Date(Date.UTC(sy, sm - 1 + i, 1));
    const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    index.set(ym, i);
    buckets.push({ bucket: ym, income: 0, expense: 0, surplus: 0 });
  }
  for (const t2 of transactions) {
    const ym = isoToMonthStr(t2.ts);
    const i = index.get(ym);
    if (i === void 0) continue;
    const b = buckets[i];
    if (!b) continue;
    const amt = base ? txBaseAmount(t2, base) : t2.amount;
    if (t2.type === "income") b.income += amt;
    else if (t2.type === "expense") b.expense += amt;
  }
  for (const b of buckets) {
    b.income = round2(b.income);
    b.expense = round2(b.expense);
    b.surplus = round2(b.income - b.expense);
  }
  return buckets;
}
function yearlyTrend(transactions, startYear, yearsCount, opts) {
  const base = opts?.base;
  const buckets = [];
  const index = /* @__PURE__ */ new Map();
  for (let i = 0; i < yearsCount; i++) {
    const y = String(startYear + i);
    index.set(startYear + i, i);
    buckets.push({ bucket: y, income: 0, expense: 0, surplus: 0 });
  }
  for (const t2 of transactions) {
    const i = index.get(isoToYearNum(t2.ts));
    if (i === void 0) continue;
    const b = buckets[i];
    if (!b) continue;
    const amt = base ? txBaseAmount(t2, base) : t2.amount;
    if (t2.type === "income") b.income += amt;
    else if (t2.type === "expense") b.expense += amt;
  }
  for (const b of buckets) {
    b.income = round2(b.income);
    b.expense = round2(b.expense);
    b.surplus = round2(b.income - b.expense);
  }
  return buckets;
}
var RANGE_TREND_MONTHS = 6;
function rangeTrend(transactions, key, opts) {
  const base = opts?.base;
  const trendOpts = base != null ? { base } : void 0;
  const now = /* @__PURE__ */ new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  const pad = (x) => String(x).padStart(2, "0");
  if (key === "last6y") {
    return { points: yearlyTrend(transactions, cy - 5, RANGE_TREND_MONTHS, trendOpts), gran: "year" };
  }
  const startDate = key === "all" ? opts?.earliestData ?? firstOfMonth() : rangeStartDate(key, opts?.earliestData);
  const startYear = Number(startDate.slice(0, 4));
  const startMonth = Number(startDate.slice(5, 7));
  const spanMonths = (cy - startYear) * 12 + (cm - startMonth) + 1;
  if (spanMonths >= 24) {
    const yearCount = Math.max(cy - startYear + 1, 1);
    return { points: yearlyTrend(transactions, startYear, yearCount, trendOpts), gran: "year" };
  }
  if (spanMonths < 6) {
    const d = /* @__PURE__ */ new Date();
    d.setMonth(d.getMonth() - (RANGE_TREND_MONTHS - 1));
    const startYM2 = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    return { points: monthlyTrend(transactions, startYM2, RANGE_TREND_MONTHS, trendOpts), gran: "month" };
  }
  const startYM = `${startYear}-${pad(startMonth)}`;
  return { points: monthlyTrend(transactions, startYM, spanMonths, trendOpts), gran: "month" };
}
function rangeNetWorthTrend(transactions, accounts, key, opts) {
  const base = opts?.base;
  const seriesOpts = base != null ? { base, rates: opts?.rates ?? {}, logger: opts?.logger } : void 0;
  const now = /* @__PURE__ */ new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  const pad = (x) => String(x).padStart(2, "0");
  if (key === "last6y") {
    return { points: netWorthYearlySeries(transactions, accounts, cy - 5, RANGE_TREND_MONTHS, seriesOpts), gran: "year" };
  }
  const startDate = key === "all" ? opts?.earliestData ?? firstOfMonth() : rangeStartDate(key, opts?.earliestData);
  const startYear = Number(startDate.slice(0, 4));
  const startMonth = Number(startDate.slice(5, 7));
  const spanMonths = (cy - startYear) * 12 + (cm - startMonth) + 1;
  if (spanMonths >= 24) {
    const yearCount = Math.max(cy - startYear + 1, 1);
    return { points: netWorthYearlySeries(transactions, accounts, startYear, yearCount, seriesOpts), gran: "year" };
  }
  if (spanMonths < 6) {
    const d = /* @__PURE__ */ new Date();
    d.setMonth(d.getMonth() - (RANGE_TREND_MONTHS - 1));
    const startYM2 = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    return { points: netWorthSeries(transactions, accounts, startYM2, RANGE_TREND_MONTHS, seriesOpts), gran: "month" };
  }
  const startYM = `${startYear}-${pad(startMonth)}`;
  return { points: netWorthSeries(transactions, accounts, startYM, spanMonths, seriesOpts), gran: "month" };
}

// ../../packages/core/src/loanSettle.ts
var SETTLEMENT_CATEGORIES = {
  badDebt: "\u574F\u8D26",
  // 支出：收款少收（认亏的应收）
  interest: "\u5229\u606F",
  // 收入：收款多收（利息收益）
  gift: "\u8D60\u4E0E",
  // 收入：还款少还（被豁免的应付）
  fee: "\u606F\u8D39"
  // 支出：还款多还（多付的息费/手续费）
};
var DEFAULT_WRITEOFF_NOTE_PREFIX = "\u7ED3\u6E05\u6838\u9500 \xB7 ";
function deriveSettlementDiff(outstanding, paid, direction, names = SETTLEMENT_CATEGORIES) {
  if (direction === "collect" && outstanding <= 0) {
    throw new AppError("err.loan.collectBalance", "\u6536\u6B3E\u8981\u6C42\u5BF9\u65B9\u6709\u5E94\u6536\u4F59\u989D\uFF08>0\uFF09");
  }
  if (direction === "repay" && outstanding >= 0) {
    throw new AppError("err.loan.repayBalance", "\u8FD8\u6B3E\u8981\u6C42\u5BF9\u65B9\u6709\u5E94\u4ED8\u4F59\u989D\uFF08<0\uFF09");
  }
  const owe = Math.abs(outstanding);
  const diff = round2(owe - paid);
  if (diff === 0) return { kind: "exact" };
  if (direction === "collect") {
    return diff > 0 ? { kind: "writeoff", type: "expense", amount: diff, category: names.badDebt } : { kind: "writeoff", type: "income", amount: round2(-diff), category: names.interest };
  }
  return diff > 0 ? { kind: "writeoff", type: "income", amount: diff, category: names.gift } : { kind: "writeoff", type: "expense", amount: round2(-diff), category: names.fee };
}
function validateCollectRepayDirection(outstanding, direction) {
  if (outstanding === 0) return "noOutstanding";
  if (direction === "collect" && outstanding < 0) return "shouldRepay";
  if (direction === "repay" && outstanding > 0) return "shouldCollect";
  return null;
}

// ../../packages/core/src/settlement.ts
function buildSettlementEvents(input) {
  const { outcome, collect, collectId, diffId, now, baseUpdatedAtById } = input;
  const linkId = collect.linkId ?? newTxId();
  const cId = collectId ?? newTxId();
  const events = [];
  const collectBase = collectId ? baseUpdatedAtById.get(collectId) ?? now : now;
  const collectEvent = {
    op: "upsert",
    id: cId,
    type: "loan",
    ts: collect.ts,
    amount: round2(collect.amount),
    currency: collect.currency ?? "CNY",
    rate: collect.rate,
    account: collect.account,
    person: collect.person,
    direction: collect.direction,
    note: collect.note,
    linkId,
    createdAt: collectBase,
    updatedAt: now,
    source: "manual"
  };
  events.push(collectEvent);
  let resolvedDiffId = diffId;
  if (outcome.kind === "writeoff") {
    const dId = diffId ?? newTxId();
    resolvedDiffId = dId;
    const dBase = diffId ? baseUpdatedAtById.get(diffId) ?? now : now;
    const diffEvent = {
      op: "upsert",
      id: dId,
      type: outcome.type,
      ts: collect.ts,
      amount: round2(outcome.amount),
      currency: collect.currency ?? "CNY",
      rate: collect.rate,
      account: collect.person,
      category: outcome.category,
      note: `${input.writeoffNotePrefix ?? DEFAULT_WRITEOFF_NOTE_PREFIX}${outcome.category}`,
      linkId,
      createdAt: dBase,
      updatedAt: now,
      source: "manual"
    };
    events.push(diffEvent);
  } else if (diffId) {
    const deleteEvent = {
      op: "delete",
      targetId: diffId,
      updatedAt: now,
      source: "manual"
    };
    events.push(deleteEvent);
    resolvedDiffId = void 0;
  }
  return { events, collectId: cId, diffId: resolvedDiffId, linkId };
}

// ../../packages/core/src/ledgerSeed.ts
function seedDefaultRates() {
  const asOf = nowISO();
  const e = (rate) => ({ rate: round2(rate), asOf });
  return {
    USD: e(7.2),
    EUR: e(7.85),
    JPY: e(0.05),
    HKD: e(0.92),
    GBP: e(9.15)
  };
}
var SAMPLE_LEDGER_NAME = "sample-ledger";
var DEFAULT_SEED_LABELS = {
  accounts: { cash: "\u73B0\u91D1", savings: "\u62DB\u884C\u50A8\u84C4", ewallet: "\u5FAE\u4FE1\u96F6\u94B1\u901A", credit: "\u62DB\u884C\u4FE1\u7528\u5361", person: "\u5F20\u4E09\uFF08\u5F80\u6765\uFF09" },
  categories: {
    dining: "\u9910\u996E",
    shopping: "\u8D2D\u7269",
    transport: "\u4EA4\u901A",
    home: "\u5C45\u5BB6",
    fun: "\u5A31\u4E50",
    medEdu: "\u533B\u6559",
    gift: "\u4EBA\u60C5",
    misc: "\u96F6\u7528",
    other: "\u5176\u4ED6",
    salary: "\u5DE5\u8D44\u85AA\u6C34",
    investment: "\u6295\u8D44\u6536\u76CA",
    refund: "\u9000\u6B3E\u8FD4\u6B3E"
  },
  adjustCategory: "\u4F59\u989D\u8C03\u6574",
  sampleAlias: "\u793A\u4F8B\u8D26\u672C",
  sampleNotes: {
    groceries: "\u83DC\u5E02\u573A\u4E70\u83DC",
    salaryMonth: "1\u6708\u5DE5\u8D44",
    transfer: "\u8F6C\u96F6\u94B1\u5907\u7528",
    shoppingClothes: "\u7F51\u8D2D\u8863\u670D",
    repayCard: "\u8FD8\u4FE1\u7528\u5361",
    lendFriend: "\u501F\u7ED9\u5F20\u4E09",
    investmentGain: "\u96F6\u94B1\u901A\u6536\u76CA",
    taxi: "\u6253\u8F66\u56DE\u5BB6"
  }
};
var SAMPLE_ANCHOR = "2026-01-01T00:00:00.000Z";
function seedSampleLedger(labels = DEFAULT_SEED_LABELS) {
  const L = labels;
  const now = SAMPLE_ANCHOR;
  const later = "2026-06-15T12:00:00.000Z";
  const acc = (id, name, type, opening, currency = "CNY") => ({ id, name, type, openingBalance: opening, currency, active: true, createdAt: now, updatedAt: now });
  const cashId = newAccountId();
  const savingsId = newAccountId();
  const ewalletId = newAccountId();
  const creditId = newAccountId();
  const personId = newAccountId();
  const accounts = [
    acc(cashId, L.accounts.cash, "cash", 1e3),
    acc(savingsId, L.accounts.savings, "savings", 5e4),
    acc(ewalletId, L.accounts.ewallet, "ewallet", 5e3),
    acc(creditId, L.accounts.credit, "credit", 0, "CNY"),
    acc(personId, L.accounts.person, "person", 0)
  ];
  const cat = (flow, name) => ({ id: newCategoryId(), name, flow });
  const categories = [
    cat("expense", L.categories.dining),
    cat("expense", L.categories.shopping),
    cat("expense", L.categories.transport),
    cat("expense", L.categories.home),
    cat("expense", L.categories.fun),
    cat("expense", L.categories.medEdu),
    cat("expense", L.categories.gift),
    cat("expense", L.categories.misc),
    cat("expense", L.categories.other),
    cat("expense", L.adjustCategory),
    cat("income", L.categories.salary),
    cat("income", L.categories.investment),
    cat("income", L.categories.refund),
    cat("income", L.categories.other),
    cat("income", L.adjustCategory)
  ];
  const rates = seedDefaultRates();
  const tx = (id, type, fields) => ({
    op: "upsert",
    id,
    type,
    createdAt: now,
    updatedAt: later,
    ...fields
  });
  const events = [
    // 1. 支出：现金买菜
    tx(newTxId(), "expense", {
      ts: "2026-01-05T08:30:00.000Z",
      amount: round2(35.5),
      currency: "CNY",
      account: cashId,
      category: L.categories.dining,
      note: L.sampleNotes.groceries
    }),
    // 2. 收入：工资存入储蓄
    tx(newTxId(), "income", {
      ts: "2026-01-10T10:00:00.000Z",
      amount: round2(15e3),
      currency: "CNY",
      account: savingsId,
      category: L.categories.salary,
      note: L.sampleNotes.salaryMonth
    }),
    // 3. 转账：储蓄转到微信
    tx(newTxId(), "transfer", {
      ts: "2026-01-15T14:00:00.000Z",
      amount: round2(2e3),
      currency: "CNY",
      fromAccount: savingsId,
      toAccount: ewalletId,
      note: L.sampleNotes.transfer
    }),
    // 4. 信用卡消费
    tx(newTxId(), "expense", {
      ts: "2026-02-01T19:00:00.000Z",
      amount: round2(299),
      currency: "CNY",
      account: creditId,
      category: L.categories.shopping,
      note: L.sampleNotes.shoppingClothes
    }),
    // 5. 还款：储蓄还信用卡
    tx(newTxId(), "transfer", {
      ts: "2026-02-10T10:00:00.000Z",
      amount: round2(299),
      currency: "CNY",
      fromAccount: savingsId,
      toAccount: creditId,
      note: L.sampleNotes.repayCard
    }),
    // 6. 借贷：借出给张三
    tx(newTxId(), "loan", {
      ts: "2026-03-01T12:00:00.000Z",
      amount: round2(5e3),
      currency: "CNY",
      account: savingsId,
      person: personId,
      direction: "lend",
      note: L.sampleNotes.lendFriend
    }),
    // 7. 收入：投资收益
    tx(newTxId(), "income", {
      ts: "2026-04-01T09:00:00.000Z",
      amount: round2(320.5),
      currency: "CNY",
      account: ewalletId,
      category: L.categories.investment,
      note: L.sampleNotes.investmentGain
    }),
    // 8. 支出：交通打车
    tx(newTxId(), "expense", {
      ts: "2026-05-10T20:00:00.000Z",
      amount: round2(28),
      currency: "CNY",
      account: cashId,
      category: L.categories.transport,
      note: L.sampleNotes.taxi
    })
  ];
  return { accounts, categories, rates, events };
}
function seedDefaults(labels = DEFAULT_SEED_LABELS) {
  const L = labels;
  const now = nowISO();
  const accounts = [
    { id: newAccountId(), name: L.accounts.cash, type: "cash", openingBalance: 0, currency: "CNY", active: true, createdAt: now, updatedAt: now },
    { id: newAccountId(), name: L.accounts.savings, type: "savings", openingBalance: 0, currency: "CNY", active: true, createdAt: now, updatedAt: now },
    { id: newAccountId(), name: L.accounts.ewallet, type: "ewallet", openingBalance: 0, currency: "CNY", active: true, createdAt: now, updatedAt: now }
  ];
  const cat = (flow, name) => ({ id: newCategoryId(), name, flow });
  const categories = [
    cat("expense", L.categories.dining),
    cat("expense", L.categories.shopping),
    cat("expense", L.categories.transport),
    cat("expense", L.categories.home),
    cat("expense", L.categories.fun),
    cat("expense", L.categories.medEdu),
    cat("expense", L.categories.gift),
    cat("expense", L.categories.misc),
    cat("expense", L.categories.other),
    cat("expense", L.adjustCategory),
    cat("income", L.categories.salary),
    cat("income", L.categories.investment),
    cat("income", L.categories.refund),
    cat("income", L.categories.other),
    cat("income", L.adjustCategory)
  ];
  return { accounts, categories, rates: seedDefaultRates() };
}
function validateLedgerName(name, existing) {
  const n = name.trim();
  if (!n) return "err.ledger.nameEmpty";
  if (n.includes("/") || n.includes("\\")) return "err.ledger.nameSeparator";
  if (n === "." || n === ".." || n === "backups") return "err.ledger.nameReserved";
  const stripDot = (s) => s.replace(/^\.+/, "");
  const base = stripDot(n);
  if (existing.some((e) => stripDot(e) === base)) return "err.ledger.nameExists";
  return null;
}

// ../../packages/core/src/recurring.ts
function parseDateOnly(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return new Date(Date.UTC(y, mo - 1, d));
}
function formatDateOnly(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function lastDayOfMonth(year, monthOneBased) {
  return new Date(Date.UTC(year, monthOneBased, 0)).getUTCDate();
}
function adjustMonthlyDay(year, monthOneBased, targetDay) {
  const last = lastDayOfMonth(year, monthOneBased);
  return new Date(Date.UTC(year, monthOneBased - 1, Math.min(targetDay, last)));
}
function calculateRecurringSchedule(rule, asOfDate) {
  const start = parseDateOnly(rule.startDate);
  if (!start) return [];
  const today = new Date(Date.UTC(asOfDate.getUTCFullYear(), asOfDate.getUTCMonth(), asOfDate.getUTCDate()));
  if (start.getTime() > today.getTime()) return [];
  let end = today;
  if (rule.endDate) {
    const endParsed = parseDateOnly(rule.endDate);
    if (!endParsed) return [];
    if (endParsed.getTime() < start.getTime()) return [];
    if (endParsed.getTime() < end.getTime()) end = endParsed;
  }
  const max = rule.maxRuns;
  if (typeof max === "number" && max <= 0) return [];
  const result = [];
  const push2 = (d) => {
    if (d.getTime() < start.getTime() || d.getTime() > end.getTime()) return true;
    result.push(d);
    if (typeof max === "number" && result.length >= max) return false;
    return true;
  };
  if (rule.period === "weekly") {
    const dow = rule.dayOfWeek;
    if (typeof dow !== "number" || dow < 0 || dow > 6) return [];
    const cur = new Date(start.getTime());
    const startDow = cur.getUTCDay();
    const diff = (dow - startDow + 7) % 7;
    cur.setUTCDate(cur.getUTCDate() + diff);
    while (cur.getTime() <= end.getTime()) {
      if (!push2(new Date(cur.getTime()))) break;
      cur.setUTCDate(cur.getUTCDate() + 7);
    }
    return result;
  }
  if (rule.period === "monthly") {
    const dom = rule.dayOfMonth;
    if (typeof dom !== "number" || dom < 1 || dom > 31) return [];
    let y = start.getUTCFullYear();
    let m = start.getUTCMonth() + 1;
    while (true) {
      const candidate = adjustMonthlyDay(y, m, dom);
      if (candidate.getTime() > end.getTime()) break;
      if (candidate.getTime() >= start.getTime()) {
        if (!push2(candidate)) break;
      }
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
      if (y > start.getUTCFullYear() + 200) break;
    }
    return result;
  }
  if (rule.period === "yearly") {
    const moy = rule.monthOfYear;
    const doy = rule.dayOfYear;
    if (typeof moy !== "number" || moy < 1 || moy > 12) return [];
    if (typeof doy !== "number" || doy < 1 || doy > 31) return [];
    let y = start.getUTCFullYear();
    while (true) {
      const candidate = adjustMonthlyDay(y, moy, doy);
      if (candidate.getTime() > end.getTime()) break;
      if (candidate.getTime() >= start.getTime()) {
        if (!push2(candidate)) break;
      }
      y += 1;
      if (y > start.getUTCFullYear() + 200) break;
    }
    return result;
  }
  return [];
}
function expandNoteTemplate(template, date) {
  if (!template) return void 0;
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return template.replaceAll("{year}", String(y)).replaceAll("{month}", String(m)).replaceAll("{day}", String(d));
}
var RECURRING_TX_ID_PREFIX = "recurring-";
function buildRecurringTxId(ruleId, dateStr) {
  return `${RECURRING_TX_ID_PREFIX}${ruleId}-${dateStr}`;
}
function validateRecurringRule(rule) {
  if (!rule.id || !rule.id.trim()) return "err.recurring.idEmpty";
  if (!rule.name || !rule.name.trim()) return "err.recurring.nameEmpty";
  if (!rule.startDate) return "err.recurring.startDateEmpty";
  if (!parseDateOnly(rule.startDate)) return "err.recurring.startDateInvalid";
  if (rule.endDate) {
    const sd = parseDateOnly(rule.startDate);
    const ed = parseDateOnly(rule.endDate);
    if (!ed) return "err.recurring.endDateInvalid";
    if (sd && ed.getTime() < sd.getTime()) return "err.recurring.endDateBeforeStart";
  }
  if (typeof rule.maxRuns === "number" && rule.maxRuns < 1) return "err.recurring.maxRuns";
  if (!Number.isFinite(rule.amount) || rule.amount < 0) return "err.recurring.amountNegative";
  if (rule.period === "weekly") {
    if (typeof rule.dayOfWeek !== "number" || rule.dayOfWeek < 0 || rule.dayOfWeek > 6) {
      return "err.recurring.weeklyDay";
    }
  } else if (rule.period === "monthly") {
    if (typeof rule.dayOfMonth !== "number" || rule.dayOfMonth < 1 || rule.dayOfMonth > 31) {
      return "err.recurring.monthlyDay";
    }
  } else if (rule.period === "yearly") {
    if (typeof rule.monthOfYear !== "number" || rule.monthOfYear < 1 || rule.monthOfYear > 12) {
      return "err.recurring.yearlyMonth";
    }
    if (typeof rule.dayOfYear !== "number" || rule.dayOfYear < 1 || rule.dayOfYear > 31) {
      return "err.recurring.yearlyDay";
    }
  } else {
    return "err.recurring.unknownPeriod";
  }
  if (rule.type === "expense" || rule.type === "income") {
    if (!rule.account) return "err.recurring.needAccount";
    if (!rule.category) return "err.recurring.needCategory";
  } else if (rule.type === "transfer") {
    if (!rule.fromAccount || !rule.toAccount) return "err.recurring.transferAccounts";
    if (rule.fromAccount === rule.toAccount) return "err.recurring.transferSameAccount";
  } else if (rule.type === "loan") {
    if (!rule.account) return "err.recurring.loanSelfAccount";
    if (!rule.person) return "err.recurring.loanPerson";
    if (!rule.direction) return "err.recurring.loanDirection";
  }
  return null;
}
function generateDueRecurringEvents(rules, existingTxIds, asOfDate) {
  const events = [];
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  for (const rule of rules) {
    if (!rule.active) continue;
    if (validateRecurringRule(rule) !== null) continue;
    const dates = calculateRecurringSchedule(rule, asOfDate);
    for (const date of dates) {
      const dateStr = formatDateOnly(date);
      const txId = buildRecurringTxId(rule.id, dateStr);
      if (existingTxIds.has(txId)) continue;
      const ts2 = dateToLocalISO(/* @__PURE__ */ new Date(`${dateStr}T00:00:00`));
      const note = expandNoteTemplate(rule.note, date);
      const ev = {
        op: "upsert",
        id: txId,
        type: rule.type,
        ts: ts2,
        amount: round2(rule.amount),
        currency: rule.currency || "CNY",
        rate: rule.rate,
        recurringRuleId: rule.id,
        createdAt: nowIso,
        updatedAt: nowIso,
        source: "manual"
      };
      if (rule.account) ev.account = rule.account;
      if (rule.category) ev.category = rule.category;
      if (rule.fromAccount) ev.fromAccount = rule.fromAccount;
      if (rule.toAccount) ev.toAccount = rule.toAccount;
      if (rule.person) ev.person = rule.person;
      if (rule.direction) ev.direction = rule.direction;
      if (note) ev.note = note;
      events.push(ev);
    }
  }
  return events;
}
function nextOccurrence(rule, asOfDate) {
  const start = parseDateOnly(rule.startDate);
  if (!start) return null;
  const end = rule.endDate ? parseDateOnly(rule.endDate) : null;
  if (rule.endDate && !end) return null;
  const today = new Date(Date.UTC(asOfDate.getUTCFullYear(), asOfDate.getUTCMonth(), asOfDate.getUTCDate()));
  const lowerBound = today.getTime() >= start.getTime() ? today : start;
  const limit = end ? end : new Date(Date.UTC(today.getUTCFullYear() + 50, 0, 1));
  if (rule.period === "weekly") {
    const dow = rule.dayOfWeek;
    if (typeof dow !== "number" || dow < 0 || dow > 6) return null;
    const cur = new Date(lowerBound.getTime());
    const diff = (dow - cur.getUTCDay() + 7) % 7;
    cur.setUTCDate(cur.getUTCDate() + diff);
    if (cur.getTime() > limit.getTime()) return null;
    return cur;
  }
  if (rule.period === "monthly") {
    const dom = rule.dayOfMonth;
    if (typeof dom !== "number") return null;
    let y = lowerBound.getUTCFullYear();
    let m = lowerBound.getUTCMonth() + 1;
    for (let i = 0; i < 24; i++) {
      const cand = adjustMonthlyDay(y, m, dom);
      if (cand.getTime() >= lowerBound.getTime() && cand.getTime() <= limit.getTime()) return cand;
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    return null;
  }
  if (rule.period === "yearly") {
    const moy = rule.monthOfYear;
    const doy = rule.dayOfYear;
    if (typeof moy !== "number" || typeof doy !== "number") return null;
    let y = lowerBound.getUTCFullYear();
    for (let i = 0; i < 100; i++) {
      const cand = adjustMonthlyDay(y, moy, doy);
      if (cand.getTime() >= lowerBound.getTime() && cand.getTime() <= limit.getTime()) return cand;
      y += 1;
    }
    return null;
  }
  return null;
}
function newRecurringRuleId() {
  return "r_" + crypto.randomUUID();
}

// ../../packages/core/src/recurringMapping.ts
function defaultSchedule(startDate) {
  return {
    name: "",
    active: true,
    period: "monthly",
    dayOfMonth: 1,
    dayOfWeek: 1,
    monthOfYear: 1,
    dayOfYear: 1,
    startDate,
    endDate: "",
    maxRuns: ""
  };
}
function ruleToSchedule(rule) {
  return {
    name: rule.name,
    active: rule.active,
    period: rule.period,
    dayOfMonth: rule.dayOfMonth ?? 1,
    dayOfWeek: rule.dayOfWeek ?? 1,
    monthOfYear: rule.monthOfYear ?? 1,
    dayOfYear: rule.dayOfYear ?? 1,
    startDate: rule.startDate,
    endDate: rule.endDate ?? "",
    maxRuns: rule.maxRuns != null ? String(rule.maxRuns) : ""
  };
}
function entryToRule(state, schedule, existing) {
  const now = nowISO();
  return {
    id: existing?.id ?? newRecurringRuleId(),
    name: schedule.name.trim(),
    active: schedule.active,
    type: state.type,
    amount: round2(state.amount),
    currency: state.currency ?? "CNY",
    rate: state.rate,
    account: state.account || void 0,
    category: state.category || void 0,
    fromAccount: state.fromAccount || void 0,
    toAccount: state.toAccount || void 0,
    person: state.person || void 0,
    // 仅借贷写入方向，避免给收支/转账塞入多余 direction
    direction: state.type === "loan" ? state.direction : void 0,
    note: state.note?.trim() || void 0,
    period: schedule.period,
    dayOfMonth: schedule.period === "monthly" ? schedule.dayOfMonth : void 0,
    dayOfWeek: schedule.period === "weekly" ? schedule.dayOfWeek : void 0,
    monthOfYear: schedule.period === "yearly" ? schedule.monthOfYear : void 0,
    dayOfYear: schedule.period === "yearly" ? schedule.dayOfYear : void 0,
    startDate: schedule.startDate,
    endDate: schedule.endDate.trim() || void 0,
    maxRuns: schedule.maxRuns.trim() ? Number(schedule.maxRuns) : void 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}

// ../../packages/core/src/categoryOps.ts
var ADJUST_CATEGORY = "\u4F59\u989D\u8C03\u6574";
function planRenameCategory(input) {
  const { events, categories, id, newName, now } = input;
  const trimmed = newName.trim();
  const target = categories.find((c) => c.id === id);
  if (!target) throw new AppError("err.category.notFound", "\u5206\u7C7B\u4E0D\u5B58\u5728");
  if (trimmed === "") throw new AppError("err.category.nameEmpty", "\u5206\u7C7B\u540D\u4E0D\u80FD\u4E3A\u7A7A");
  if (trimmed === target.name) {
    return { events: [], categories: [...categories], rewritten: 0 };
  }
  if (categories.some((c) => c.id !== id && c.flow === target.flow && c.name === trimmed)) {
    throw new AppError("err.category.nameExists", "\u8BE5\u540D\u79F0\u5DF2\u5B58\u5728\uFF0C\u5982\u9700\u5408\u5E76\u8BF7\u4F7F\u7528\u5408\u5E76\u529F\u80FD");
  }
  const oldName = target.name;
  const folded = foldEvents(events);
  const newEvents = [];
  for (const t2 of folded) {
    if (t2.category !== oldName) continue;
    newEvents.push({ ...t2, category: trimmed, op: "upsert", createdAt: now, updatedAt: now, source: "manual" });
  }
  const nextCats = categories.map((c) => c.id === id ? { ...c, name: trimmed } : c);
  return { events: newEvents, categories: nextCats, rewritten: newEvents.length };
}
function planMergeCategory(input) {
  const { events, categories, fromId, toId, now } = input;
  if (fromId === toId) return { events: [], categories: [...categories], rewritten: 0 };
  const from = categories.find((c) => c.id === fromId);
  const to = categories.find((c) => c.id === toId);
  if (!from || !to) throw new AppError("err.category.notFound", "\u5206\u7C7B\u4E0D\u5B58\u5728");
  if (from.flow !== to.flow) throw new AppError("err.category.mergeFlowMismatch", "\u53EA\u80FD\u5408\u5E76\u5230\u76F8\u540C\u6536\u652F\u7C7B\u578B\uFF08\u652F\u51FA/\u6536\u5165\uFF09\u7684\u5206\u7C7B");
  const folded = foldEvents(events);
  const newEvents = [];
  for (const t2 of folded) {
    if (t2.category !== from.name) continue;
    newEvents.push({ ...t2, category: to.name, op: "upsert", createdAt: now, updatedAt: now, source: "manual" });
  }
  const nextCats = categories.filter((c) => c.id !== fromId);
  return { events: newEvents, categories: nextCats, rewritten: newEvents.length };
}
function adjustCategoryOptions(categories, flow, adjustCategoryName = ADJUST_CATEGORY) {
  const map = /* @__PURE__ */ new Map();
  for (const c of categories) {
    if (c.flow === flow && c.active !== false) map.set(c.name, c);
  }
  if (!map.has(adjustCategoryName)) {
    map.set(adjustCategoryName, { id: "", name: adjustCategoryName, flow });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "zh"));
}
function resolveAdjustCategory(selected, categories, flow, adjustCategoryName = ADJUST_CATEGORY) {
  const visible = categories.some((c) => c.flow === flow && c.active !== false && c.name === selected);
  return visible ? selected : adjustCategoryName;
}
function mergeEnsureCategories(categories, items) {
  let next = [...categories];
  let changed = false;
  for (const { flow, name } of items) {
    const existing = next.find((c) => c.flow === flow && c.name === name);
    if (!existing) {
      next = [...next, { id: newCategoryId(), flow, name }];
      changed = true;
    } else if (existing.active === false) {
      next = next.map((c) => c.id === existing.id ? { ...c, active: true } : c);
      changed = true;
    }
  }
  return { next, changed };
}

// ../../packages/core/src/accountOps.ts
function numOr(s) {
  const t2 = s.trim();
  return t2 ? Number(t2) : void 0;
}
function applyAccountEdits(existing, edits, now) {
  return {
    ...existing,
    name: edits.name.trim() || existing.name,
    type: edits.type,
    openingBalance: round2(Number(edits.openingBalance) || 0),
    currency: existing.currency || "CNY",
    // 币种创建后不可变更：始终保留原值，忽略 edits.currency（防御极早期缺字段数据 → CNY）
    note: edits.note.trim() || void 0,
    updatedAt: now,
    creditLimit: edits.type === "credit" ? round2(numOr(edits.creditLimit) ?? 0) : void 0,
    billingDay: edits.type === "credit" ? numOr(edits.billingDay) : void 0,
    repaymentDay: edits.type === "credit" ? numOr(edits.repaymentDay) : void 0
  };
}
function planMergeAccount(input) {
  const { events, accounts, fromId, toId, now } = input;
  if (fromId === toId) return { events: [], accounts: [...accounts], rewritten: 0, deleted: 0 };
  const folded = foldEvents(events);
  const newEvents = [];
  let rewritten = 0;
  let deleted = 0;
  for (const t2 of folded) {
    const next = { ...t2 };
    let changed = false;
    if (t2.account === fromId) {
      next.account = toId;
      changed = true;
    }
    if (t2.fromAccount === fromId) {
      next.fromAccount = toId;
      changed = true;
    }
    if (t2.toAccount === fromId) {
      next.toAccount = toId;
      changed = true;
    }
    if (t2.person === fromId) {
      next.person = toId;
      changed = true;
    }
    if (!changed) continue;
    if (next.type === "transfer" && next.fromAccount && next.toAccount && next.fromAccount === next.toAccount) {
      const ev = { op: "delete", targetId: t2.id, updatedAt: now, source: "manual" };
      newEvents.push(ev);
      deleted++;
      continue;
    }
    const upsert = { ...next, op: "upsert", createdAt: now, updatedAt: now, source: "manual" };
    newEvents.push(upsert);
    rewritten++;
  }
  const nextAccounts = accounts.filter((a) => a.id !== fromId);
  return { events: newEvents, accounts: nextAccounts, rewritten, deleted };
}
function canMergeAccount(from, to) {
  return from.currency === to.currency;
}

// ../../packages/core/src/accountTypeOps.ts
var groupSeq = 0;
function newGroupId() {
  return `g-custom-${Date.now().toString(36)}-${(groupSeq++).toString(36)}`;
}
function setGroupLabel(s, id, label) {
  return { ...s, groups: s.groups.map((g) => g.id === id ? { ...g, label } : g) };
}
function addGroup(s, label) {
  return { ...s, groups: [...s.groups, { id: newGroupId(), label }] };
}
function removeGroup(s, id) {
  if (s.groups.length <= 1) return s;
  const remaining = s.groups.filter((g) => g.id !== id);
  const fallback = remaining[0].id;
  return {
    groups: remaining,
    types: s.types.map((t2) => t2.groupId === id ? { ...t2, groupId: fallback } : t2)
  };
}
function moveGroup(s, id, dir) {
  const i = s.groups.findIndex((g) => g.id === id);
  if (i < 0) return s;
  const j = i + dir;
  if (j < 0 || j >= s.groups.length) return s;
  const groups = s.groups.slice();
  const tmp = groups[i];
  groups[i] = groups[j];
  groups[j] = tmp;
  return { ...s, groups };
}
function setTypeLabel(s, type, label) {
  return { ...s, types: s.types.map((t2) => t2.type === type ? { ...t2, label } : t2) };
}
function setTypeActive(s, type, active) {
  return { ...s, types: s.types.map((t2) => t2.type === type ? { ...t2, active } : t2) };
}
function setTypeGroup(s, type, groupId) {
  if (!s.groups.some((g) => g.id === groupId)) return s;
  const cfg = s.types.find((t2) => t2.type === type);
  if (!cfg || cfg.groupId === groupId) return s;
  const moved = { ...cfg, groupId };
  const without = s.types.filter((t2) => t2.type !== type);
  let lastIdx = -1;
  without.forEach((t2, i) => {
    if (t2.groupId === groupId) lastIdx = i;
  });
  without.splice(lastIdx + 1, 0, moved);
  return { ...s, types: without };
}
function moveType(s, type, dir) {
  const idx = s.types.findIndex((t2) => t2.type === type);
  if (idx < 0) return s;
  const cfg = s.types[idx];
  const groupIdxs = [];
  s.types.forEach((t2, i) => {
    if (t2.groupId === cfg.groupId) groupIdxs.push(i);
  });
  const pos = groupIdxs.indexOf(idx);
  const targetPos = pos + dir;
  if (pos < 0 || targetPos < 0 || targetPos >= groupIdxs.length) return s;
  const a = groupIdxs[pos];
  const b = groupIdxs[targetPos];
  const types = s.types.slice();
  const tmp = types[a];
  types[a] = types[b];
  types[b] = tmp;
  return { ...s, types };
}
function addType(s, input) {
  if (!s.groups.some((g) => g.id === input.groupId)) return s;
  const type = newCustomTypeKey(s, input.label);
  const cfg = {
    type,
    label: input.label,
    groupId: input.groupId,
    active: true,
    kind: input.kind
  };
  return { ...s, types: [...s.types, cfg] };
}
function removeType(s, type) {
  if (isSystemAccountType(type)) return s;
  const next = s.types.filter((t2) => t2.type !== type);
  if (next.length === s.types.length) return s;
  return { ...s, types: next };
}
function setTypeKind(s, type, kind) {
  if (isSystemAccountType(type)) return s;
  const cfg = s.types.find((t2) => t2.type === type);
  if (!cfg || cfg.kind === kind) return s;
  return { ...s, types: s.types.map((t2) => t2.type === type ? { ...t2, kind } : t2) };
}

// ../../packages/core/src/batchOps.ts
function latestUpdatedAtById(events) {
  const latest = /* @__PURE__ */ new Map();
  for (const ev of events) {
    const key = ev.op === "upsert" ? ev.id : ev.targetId;
    if (!key) continue;
    const prev = latest.get(key);
    if (!prev || Date.parse(ev.updatedAt) >= Date.parse(prev)) latest.set(key, ev.updatedAt);
  }
  return latest;
}
function hasUpdatedSince(current, base) {
  if (!current) return false;
  if (!base) return true;
  return Date.parse(current) > Date.parse(base);
}
function planBatchDeleteTargets(selected, all) {
  const selectedIdSet = new Set(selected.map((t2) => t2.id));
  const ids = /* @__PURE__ */ new Set();
  let partnerExtra = 0;
  for (const t2 of selected) {
    ids.add(t2.id);
    if (!t2.linkId) continue;
    const partner = all.find((x) => x.linkId === t2.linkId && x.id !== t2.id);
    if (partner && !ids.has(partner.id)) {
      ids.add(partner.id);
      if (!selectedIdSet.has(partner.id)) partnerExtra++;
    }
  }
  return { ids: [...ids], partnerExtra };
}
function applyBatchPatch(cur, patch) {
  const targetType = patch.type ?? cur.type;
  const typeChanged = patch.type !== void 0 && patch.type !== cur.type;
  const next = { ...cur, type: targetType };
  if (typeChanged) {
    next.account = patch.account;
    next.category = patch.category;
    next.fromAccount = patch.fromAccount;
    next.toAccount = patch.toAccount;
    next.person = patch.person;
    next.direction = patch.direction;
  } else {
    if (patch.account !== void 0) next.account = patch.account;
    if (patch.category !== void 0) next.category = patch.category;
    if (patch.fromAccount !== void 0) next.fromAccount = patch.fromAccount;
    if (patch.toAccount !== void 0) next.toAccount = patch.toAccount;
    if (patch.person !== void 0) next.person = patch.person;
    if (patch.direction !== void 0) next.direction = patch.direction;
  }
  if (patch.amount !== void 0) next.amount = patch.amount;
  if (patch.ts !== void 0) next.ts = patch.ts;
  if (patch.note !== void 0) next.note = patch.note;
  return next;
}
function validateBatchMerged(t2) {
  if (!(t2.amount > 0)) throw new AppError("err.batch.amountPositive", "\u91D1\u989D\u5FC5\u987B\u5927\u4E8E 0");
  if (t2.type === "expense" || t2.type === "income") {
    if (!t2.account) throw new AppError("err.batch.account", "\u8BF7\u9009\u62E9\u8D26\u6237");
    if (!t2.category) throw new AppError("err.batch.category", "\u8BF7\u9009\u62E9\u5206\u7C7B");
  } else if (t2.type === "transfer") {
    if (!t2.fromAccount) throw new AppError("err.batch.fromAccount", "\u8BF7\u9009\u62E9\u8F6C\u51FA\u8D26\u6237");
    if (!t2.toAccount) throw new AppError("err.batch.toAccount", "\u8BF7\u9009\u62E9\u8F6C\u5165\u8D26\u6237");
    if (t2.fromAccount === t2.toAccount) throw new AppError("err.batch.sameAccount", "\u8F6C\u51FA\u4E0E\u8F6C\u5165\u8D26\u6237\u4E0D\u80FD\u76F8\u540C");
  } else if (t2.type === "loan") {
    if (!t2.account) throw new AppError("err.batch.selfAccount", "\u8BF7\u9009\u62E9\u5DF1\u65B9\u8D26\u6237");
    if (!t2.person) throw new AppError("err.batch.person", "\u8BF7\u9009\u62E9\u5BF9\u65B9\u8D26\u6237");
    if (!t2.direction) throw new AppError("err.batch.direction", "\u8BF7\u9009\u62E9\u501F\u8D37\u65B9\u5411");
  }
}
function buildBatchUpsertEvents(input) {
  const byId = new Map(input.folded.map((t2) => [t2.id, t2]));
  const events = [];
  const skipped = [];
  for (const id of input.ids) {
    const cur = byId.get(id);
    if (!cur) {
      skipped.push(id);
      continue;
    }
    const merged = applyBatchPatch(cur, input.patch);
    validateBatchMerged(merged);
    const { id: _id, ...rest } = { ...merged, amount: round2(merged.amount) };
    events.push({
      ...rest,
      id,
      op: "upsert",
      createdAt: input.latestUpdatedAtById.get(id) ?? "",
      updatedAt: input.now,
      source: "manual"
    });
  }
  return { events, skipped };
}

// ../../packages/core/src/backupConfig.ts
var DEFAULT_BACKUP_CONFIG = {
  backupEnabled: true,
  backupIntervalDays: 1,
  backupKeep: 7
};
function mergeBackupConfig(raw) {
  const cfg = { ...DEFAULT_BACKUP_CONFIG };
  if (!raw || typeof raw !== "object") return cfg;
  const r = raw;
  if (typeof r["backupEnabled"] === "boolean") {
    cfg.backupEnabled = r["backupEnabled"];
  }
  cfg.backupIntervalDays = clampPositiveInt(r["backupIntervalDays"], DEFAULT_BACKUP_CONFIG.backupIntervalDays);
  cfg.backupKeep = clampPositiveInt(r["backupKeep"], DEFAULT_BACKUP_CONFIG.backupKeep);
  return cfg;
}
function clampPositiveInt(v, fallback) {
  if (typeof v !== "number" || !Number.isFinite(v)) return fallback;
  const n = Math.floor(v);
  return n < 1 ? fallback : n;
}

// ../../packages/core/src/backupScheduling.ts
var MS_PER_DAY = 864e5;
function shouldAutoBackup(input) {
  if (!input.config.backupEnabled) return false;
  if (input.lastBackupMs <= 0) return true;
  const intervalMs = input.config.backupIntervalDays * MS_PER_DAY;
  return input.nowMs - input.lastBackupMs > intervalMs;
}
function selectAutoBackupsToPrune(entries, keep) {
  if (keep < 1) return [];
  const autos = entries.filter((e) => e.name.startsWith("auto-"));
  if (autos.length <= keep) return [];
  const sorted = [...autos].sort((a, b) => b.mtime - a.mtime);
  return sorted.slice(keep);
}

// ../../packages/core/src/ledgerPassword.ts
var PREFIX_PBKDF2 = "pbkdf2";
var HASH_NAME = "SHA-256";
var DEFAULT_PBKDF2_ITERATIONS = 6e5;
var SALT_BYTES = 16;
var KEY_BITS = 256;
function bytesToBase64(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function base64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    diff |= x ^ y;
  }
  return diff === 0;
}
async function derivePbkdf2(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), { name: "PBKDF2" }, false, [
    "deriveBits"
  ]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations, hash: HASH_NAME }, keyMaterial, KEY_BITS);
  return new Uint8Array(bits);
}
async function verifyLedgerPassword(password, encodedHash) {
  if (!encodedHash || typeof encodedHash !== "string") return false;
  const parts = encodedHash.split("$");
  if (parts.length !== 5) return false;
  const [prefix, algo, itersStr, saltB64, hashB64] = parts;
  if (prefix !== PREFIX_PBKDF2) return false;
  if (algo !== "sha256") return false;
  const iterations = Number(itersStr);
  if (!Number.isInteger(iterations) || iterations < 1) return false;
  let salt;
  let expected;
  try {
    salt = base64ToBytes(saltB64);
    expected = base64ToBytes(hashB64);
  } catch {
    return false;
  }
  if (expected.length !== KEY_BITS / 8) return false;
  try {
    const derived = await derivePbkdf2(password, salt, iterations);
    return constantTimeEqual(derived, expected);
  } catch {
    return false;
  }
}
async function buildLedgerPasswordMeta(password, opts) {
  if (password.trim().length === 0) {
    throw new Error("\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A");
  }
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iterations = opts?.iterations ?? DEFAULT_PBKDF2_ITERATIONS;
  const derived = await derivePbkdf2(password, salt, iterations);
  const saltB64 = bytesToBase64(salt);
  const hashB64 = bytesToBase64(derived);
  return {
    passwordHash: `${PREFIX_PBKDF2}$${HASH_NAME.toLowerCase().replace("-", "")}$${iterations}$${saltB64}$${hashB64}`,
    passwordSalt: saltB64,
    passwordUpdatedAt: opts?.now ?? (/* @__PURE__ */ new Date()).toISOString()
  };
}
function parseLedgerPasswordMeta(raw) {
  if (!raw || typeof raw !== "object") return null;
  const r = raw;
  const hash = r["passwordHash"];
  if (typeof hash !== "string" || hash.length === 0) return null;
  if (hash.split("$").length !== 5) return null;
  const salt = r["passwordSalt"];
  const updatedAt = r["passwordUpdatedAt"];
  return {
    passwordHash: hash,
    passwordSalt: typeof salt === "string" ? salt : "",
    passwordUpdatedAt: typeof updatedAt === "string" ? updatedAt : ""
  };
}

// src/i18n/zh.ts
var zh = {
  "settings.tab.general": "\u901A\u7528",
  "settings.tab.recurring": "\u5468\u671F\u8D26",
  "settings.tab.category": "\u5206\u7C7B",
  "settings.tab.currency": "\u5E01\u79CD",
  "settings.tab.about": "\u5173\u4E8E",
  "settings.general.startupTitle": "\u542F\u52A8\u8BBE\u7F6E",
  "settings.language.label": "\u8BED\u8A00",
  "settings.language.zh": "\u4E2D\u6587",
  "settings.language.en": "English",
  "common.confirm": "\u786E\u8BA4",
  "common.cancel": "\u53D6\u6D88",
  "nav.entry": "\u8BB0\u8D26",
  "nav.list": "\u6D41\u6C34",
  "nav.accounts": "\u8D26\u6237",
  "nav.dashboard": "\u7EDF\u8BA1",
  "nav.settings": "\u8BBE\u7F6E",
  "nav.back": "\u2039 \u8FD4\u56DE",
  "keypad.done": "\u5B8C\u6210",
  "keypad.error": "\u26A0 \u516C\u5F0F\u6709\u8BEF",
  // KR4/task4: transactionDetailModal — reused desktop-aligned keys + plugin-specific txDetail.*
  "common.delete": "\u5220\u9664",
  "common.close": "\u5173\u95ED",
  "common.edit": "\u7F16\u8F91",
  "common.copy": "\u590D\u5236",
  "tx.type.expense": "\u652F\u51FA",
  "tx.type.income": "\u6536\u5165",
  "tx.type.transfer": "\u8F6C\u8D26",
  "tx.type.loan": "\u501F\u8D37",
  "entry.direction.lend": "\u501F\u51FA\uFF08\u5BF9\u65B9\u6B20\u6211\uFF09",
  "entry.direction.borrow": "\u501F\u5165\uFF08\u6211\u6B20\u5BF9\u65B9\uFF09",
  "entry.direction.collect": "\u6536\u6B3E\uFF08\u6536\u56DE\u501F\u51FA\uFF09",
  "entry.direction.repay": "\u8FD8\u6B3E\uFF08\u5F52\u8FD8\u501F\u5165\uFF09",
  "entry.field.ts": "\u65F6\u95F4",
  "entry.field.amount": "\u91D1\u989D",
  "entry.field.account": "\u8D26\u6237",
  "entry.field.category": "\u5206\u7C7B",
  "entry.field.fromAccount": "\u8F6C\u51FA\u8D26\u6237",
  "entry.field.toAccount": "\u8F6C\u5165\u8D26\u6237",
  "entry.field.direction": "\u65B9\u5411",
  "entry.field.selfAccount": "\u5DF1\u65B9\u8D26\u6237",
  "entry.field.note": "\u5907\u6CE8",
  "txDetail.title": "\u6D41\u6C34\u8BE6\u60C5",
  "txDetail.type": "\u7C7B\u578B",
  "txDetail.rate": "\u6C47\u7387",
  "txDetail.converted": "\u6298\u7B97 {{base}}",
  "txDetail.toAmount": "\u8F6C\u5165\u91D1\u989D",
  "txDetail.impliedRate": "\u9690\u542B\u6C47\u7387",
  "txDetail.counterparty": "\u5BF9\u65B9",
  "txDetail.balanceSuffix": "\uFF08\u4F59\u989D {{balance}}\uFF09",
  "txDetail.settlementEditBlock": "\u6536\u6B3E/\u8FD8\u6B3E\uFF08\u7ED3\u6E05\uFF09\u6D41\u6C34\u8BF7\u5728\u684C\u9762\u7AEF\u7F16\u8F91\uFF0C\u79FB\u52A8\u7AEF\u6682\u4E0D\u652F\u6301\u3002",
  "txDetail.settlementCopyBlock": "\u6536\u6B3E/\u8FD8\u6B3E\uFF08\u7ED3\u6E05\uFF09\u6D41\u6C34\u8BF7\u5728\u684C\u9762\u7AEF\u590D\u5236\uFF0C\u79FB\u52A8\u7AEF\u6682\u4E0D\u652F\u6301\u3002",
  "txDetail.deleteConfirm": "\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u6761\u6D41\u6C34\u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002",
  "txDetail.deleteFailed": "\u5220\u9664\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5",
  // KR4/task5: transactionListModal — reused desktop-aligned keys + plugin-specific txList.*
  "common.all": "\u5168\u90E8",
  "common.clear": "\u6E05\u9664",
  "common.done": "\u5B8C\u6210",
  "txList.sort.timeDesc": "\u65F6\u95F4 \u65B0\u2192\u65E7",
  "txList.sort.timeAsc": "\u65F6\u95F4 \u65E7\u2192\u65B0",
  "txList.sort.amountDesc": "\u91D1\u989D \u9AD8\u2192\u4F4E",
  "txList.sort.amountAsc": "\u91D1\u989D \u4F4E\u2192\u9AD8",
  "txList.empty": "\u6682\u65E0\u6D41\u6C34\u8BB0\u5F55\u3002",
  "txList.loadFailed": "\u8BFB\u53D6\u6570\u636E\u5931\u8D25\uFF1A\u8BF7\u5728\u684C\u9762\u7AEF\u521D\u59CB\u5316\u8D26\u672C\uFF0C\u6216\u68C0\u67E5\u63D2\u4EF6\u8BBE\u7F6E\u7684\u300C\u6570\u636E\u5B50\u76EE\u5F55\u300D\u3002",
  "txList.errorDetail": "\u9519\u8BEF\u8BE6\u60C5\uFF1A{{msg}}",
  "txList.rangeTime": "\u65F6\u95F4\u8303\u56F4",
  "txList.lastMonths": "\u8FD1{{n}}\u6708",
  "txList.allTime": "\u5168\u90E8",
  "txList.rangeType": "\u4EA4\u6613\u7C7B\u578B",
  "txList.rangeAccountNote": "\u8D26\u6237/\u5907\u6CE8",
  "txList.allAccounts": "\u5168\u90E8\u8D26\u6237",
  "txList.searchPlaceholder": "\u5907\u6CE8\u641C\u7D22...",
  "txList.ariaClearKeyword": "\u6E05\u9664\u5907\u6CE8\u641C\u7D22",
  "txList.ariaClearAllFilters": "\u6E05\u9664\u6240\u6709\u7B5B\u9009",
  "txList.recurringDefault": "\u5468\u671F\u8D26\u89C4\u5219",
  "txList.recurringPrefix": "\u{1F4CB} \u5468\u671F\u8D26\uFF1A",
  "txList.countSuffix": " \xB7 {{n}} \u7B14",
  "txList.categoryDrillPrefix": "\u{1F3F7}\uFE0F \u5206\u7C7B\uFF1A",
  "txList.uncategorized": "(\u672A\u5206\u7C7B)",
  "txList.sortLabel": "\u6392\u5E8F",
  "txList.select": "\u9009\u62E9",
  "txList.selectAll": "\u5168\u9009",
  "txList.selectedN": "\u5DF2\u9009 {{n}} \u6761",
  "txList.batchModify": "\u6279\u91CF\u4FEE\u6539",
  "txList.batchModifyOnlySameType": "\u6279\u91CF\u4FEE\u6539\u4EC5\u652F\u6301\u540C\u7C7B\u578B\u8BB0\u5F55",
  "txList.selectFirst": "\u8BF7\u5148\u9009\u62E9\u8BB0\u5F55",
  "txList.batchDelete": "\u6279\u91CF\u5220\u9664",
  "txList.batchDeleteConfirm": "\u5C06\u5220\u9664\u9009\u4E2D\u7684 {{n}} \u7B14\u6D41\u6C34\u3002\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF0C\u786E\u5B9A\uFF1F",
  "txList.batchDeleteConfirmPartner": "\u5C06\u5220\u9664\u9009\u4E2D\u7684 {{selected}} \u7B14\u6D41\u6C34\uFF0C\u5E76\u8054\u52A8\u5220\u9664\u7ED3\u6E05\u5BF9\u7AEF {{partner}} \u7B14\uFF0C\u5171 {{total}} \u7B14\u3002\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF0C\u786E\u5B9A\uFF1F",
  "tiedConflict.notice": "\u68C0\u6D4B\u5230 {{count}} \u7B14\u4EA4\u6613\u5B58\u5728\u540C\u6B65\u51B2\u7A81\uFF08\u65F6\u95F4\u6233\u76F8\u540C\uFF0C\u7ED3\u679C\u53D6\u51B3\u4E8E\u540C\u6B65\u987A\u5E8F\uFF09\u3002\u70B9\u51FB\u5E26 \u26A0\uFE0F \u7684\u6D41\u6C34\u7F16\u8F91\u5E76\u4FDD\u5B58\u53EF\u6D88\u9664\u3002",
  "tiedConflict.badgeTip": "\u540C\u6B65\u51B2\u7A81\uFF1A\u8BE5\u8BB0\u5F55\u4E0E\u53E6\u4E00\u7AEF\u540C\u65F6\u66F4\u65B0\uFF08\u65F6\u95F4\u6233\u76F8\u540C\uFF09\uFF0C\u663E\u793A\u7ED3\u679C\u53D6\u51B3\u4E8E\u540C\u6B65\u987A\u5E8F\u3002\u70B9\u51FB\u7F16\u8F91\u5E76\u4FDD\u5B58\u5373\u53EF\u6D88\u9664\u3002",
  "txList.concurrencyConflict": "\u6240\u9009\u8BB0\u5F55\u5DF2\u88AB\u53E6\u4E00\u7AEF\u66F4\u65B0\uFF0C\u5DF2\u5237\u65B0\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u5E76\u91CD\u8BD5",
  "txList.deletedN": "\u5DF2\u5220\u9664 {{n}} \u6761",
  "txList.batchDeleteFailed": "\u6279\u91CF\u5220\u9664\u5931\u8D25\uFF1A{{msg}}",
  "txList.emptyRecurring": "\u8BE5\u89C4\u5219\u6682\u672A\u751F\u6210\u4EA4\u6613",
  "txList.emptyFiltered": "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u6D41\u6C34\u3002",
  "txList.loadMore": "\u52A0\u8F7D\u66F4\u591A\u2026",
  "txList.monthIncome": "\u6536",
  "txList.monthExpense": "\u652F",
  "txList.monthIn": "\u8FDB",
  "txList.monthOut": "\u51FA",
  "txList.monthBalanceTitle": "{{account}} \u6708\u672B\u7D2F\u8BA1\u4F59\u989D",
  "txList.balancePrefix": "\u4F59 {{amount}}",
  "txList.flatSortHint": "\u91D1\u989D\u6392\u5E8F\u65F6\u4E0D\u6309\u6708\u5206\u7EC4",
  "txList.expandAll": "\u5C55\u5F00\u5168\u90E8",
  "txList.collapseAll": "\u6298\u53E0\u5168\u90E8",
  "txList.loanDir.lend": "\u501F\u51FA",
  "txList.loanDir.borrow": "\u501F\u5165",
  "txList.loanDir.collect": "\u6536\u6B3E",
  "txList.loanDir.repay": "\u8FD8\u6B3E",
  // KR4/task6: entryModal — reused desktop-aligned entry.* + plugin-specific
  "common.save": "\u4FDD\u5B58",
  "account.selectPlaceholder": "\u8BF7\u9009\u62E9",
  "entry.amount": "\u91D1\u989D",
  "entry.amountWithCur": "\u91D1\u989D\uFF08{{cur}}\uFF09",
  "entry.fromNote": "\u2190 \u6765\u81EA\u5907\u6CE8",
  "entry.rateLabel": "\u6C47\u7387\uFF081 {{from}} \u2192 {{to}}\uFF09",
  "entry.ratePlaceholder": "1 {{from}} = ? {{to}}",
  "entry.rateHint": "\u6C47\u7387\u6309\u8868\u9884\u586B\uFF0C\u53EF\u6539\uFF1B\u7559\u7A7A\u6309 1:1 \u6298\u7B97",
  "entry.toAmountLabel": "\u8F6C\u5165\u91D1\u989D\uFF08{{cur}}\uFF09",
  "entry.toAmountPlaceholder": "\u5B9E\u5230 {{cur}} \u91D1\u989D",
  "entry.impliedRateHint": "\u9690\u542B\u6C47\u7387 1 {{from}} = {{rate}} {{to}}\uFF08\u4EC5\u4F9B\u53C2\u8003\uFF09",
  "entry.crossTransferHint": "\u8DE8\u5E01\u79CD\uFF1A\u586B\u8F6C\u5165\u8D26\u6237\uFF08{{cur}}\uFF09\u7684\u5B9E\u5230\u91D1\u989D",
  "entry.loanCurrencyMismatch": "\u501F\u8D37\u4E0D\u652F\u6301\u8DE8\u5E01\u79CD\uFF08\u5DF1\u65B9 {{ac}} / \u5BF9\u65B9 {{pc}}\uFF09\uFF0C\u8BF7\u4E3A\u5BF9\u65B9\u53E6\u5EFA\u540C\u5E01\u79CD\u8D26\u6237\u6216\u6539\u7528\u300C\u8F6C\u8D26\u300D",
  "entry.repeating": "\u2713 \u91CD\u590D",
  "entry.notRepeating": "\u4E0D\u91CD\u590D",
  "entry.startDate": "\u8D77\u59CB\u65E5\u671F",
  "entry.time": "\u65F6\u95F4",
  "entry.ruleName": "\u89C4\u5219\u540D\u79F0",
  "entry.ruleNamePlaceholder": "\u5982\uFF1A\u6BCF\u6708\u623F\u79DF",
  "entry.period": "\u5468\u671F",
  "entry.periodValue.monthly": "\u6BCF\u6708",
  "entry.periodValue.weekly": "\u6BCF\u5468",
  "entry.periodValue.yearly": "\u6BCF\u5E74",
  "entry.dateLabel": "\u65E5\u671F",
  "entry.monthSuffix": "{{n}}\u6708",
  "entry.endDateLabel": "\u7ED3\u675F\u65E5\u671F",
  "entry.weekday.sun": "\u5468\u65E5",
  "entry.weekday.mon": "\u5468\u4E00",
  "entry.weekday.tue": "\u5468\u4E8C",
  "entry.weekday.wed": "\u5468\u4E09",
  "entry.weekday.thu": "\u5468\u56DB",
  "entry.weekday.fri": "\u5468\u4E94",
  "entry.weekday.sat": "\u5468\u516D",
  "entry.add": "\u6DFB\u52A0",
  "entry.newPerson": "\u65B0\u5BF9\u65B9",
  "entry.personNamePlaceholder": "\u59D3\u540D",
  "entry.notePlaceholder": "\u53EF\u9009\uFF0C\u7C98\u8D34\u77ED\u4FE1/\u6587\u672C\u53EF\u81EA\u52A8\u63D0\u53D6\u91D1\u989D",
  "entry.receivable": "\u5E94\u6536",
  "entry.payable": "\u5E94\u4ED8",
  "entry.none": "\u65E0",
  "entry.nonePerson": "\u65E0\u5F80\u6765",
  "entry.settle": "\u7ED3\u6E05",
  "entry.currentBalanceBase": "\u5F53\u524D\u4F59\u989D {{amount}}",
  "entry.overdraftWarn": "\u300C{{name}}\u300D\u4F59\u989D\u5C06\u53D8\u4E3A {{amount}}",
  "entry.personCurrentBase": "\u5BF9\u65B9\u5F53\u524D {{amount}}\uFF08{{state}}\uFF09",
  "entry.outstandingBase": "\u5BF9\u65B9\u5F53\u524D\u672A\u7ED3 {{amount}}\uFF08{{state}}\uFF09",
  "entry.settleExact": "\uFF1B\u6B63\u597D\u7ED3\u6E05\uFF0C\u65E0\u5DEE\u989D",
  "entry.settleWriteoff": "\uFF1B\u5DEE\u989D {{amount}} \u8BB0\u4E3A\u3010{{category}}\xB7{{flow}}\u3011\uFF0C\u5BF9\u65B9\u6E05\u96F6",
  "entry.settlePartial": "\uFF1B\u90E8\u5206\u5F52\u8FD8\u540E\u5BF9\u65B9\u4F59\u989D {{amount}}",
  "entry.settleDirMismatchCollect": "\uFF1B\u65B9\u5411\u4E0E\u672A\u7ED3\u4E0D\u7B26\uFF0C\u8BF7\u6539\u9009\u300C\u8FD8\u6B3E\u300D",
  "entry.settleDirMismatchRepay": "\uFF1B\u65B9\u5411\u4E0E\u672A\u7ED3\u4E0D\u7B26\uFF0C\u8BF7\u6539\u9009\u300C\u6536\u6B3E\u300D",
  "entry.err.account": "\u8BF7\u9009\u62E9\u8D26\u6237",
  "entry.err.category": "\u8BF7\u9009\u62E9\u5206\u7C7B",
  "entry.err.fromAccount": "\u8BF7\u9009\u62E9\u8F6C\u51FA\u8D26\u6237",
  "entry.err.toAccount": "\u8BF7\u9009\u62E9\u8F6C\u5165\u8D26\u6237",
  "entry.err.selfAccount": "\u8BF7\u9009\u62E9\u5DF1\u65B9\u8D26\u6237",
  "entry.err.amountPositive": "\u8BF7\u8F93\u5165\u5927\u4E8E 0 \u7684\u91D1\u989D",
  "entry.err.ruleName": "\u8BF7\u586B\u5199\u89C4\u5219\u540D\u79F0",
  "entry.err.crossTransferAmount": "\u8DE8\u5E01\u79CD\u8F6C\u8D26\u9700\u586B\u5199\u8F6C\u5165\u8D26\u6237\u5E01\u79CD\u7684\u5B9E\u5230\u91D1\u989D",
  "entry.err.sameAccount": "\u8F6C\u51FA\u4E0E\u8F6C\u5165\u8D26\u6237\u4E0D\u80FD\u76F8\u540C",
  "entry.err.personOrCreate": "\u8BF7\u9009\u62E9\u6216\u65B0\u5EFA\u5BF9\u65B9",
  "entry.err.personFirst": "\u8BF7\u5148\u9009\u62E9\u5BF9\u65B9",
  "entry.err.noOutstanding": "\u8BE5\u5F80\u6765\u5F53\u524D\u65E0\u672A\u7ED3\u4F59\u989D",
  "entry.err.shouldCollect": "\u5BF9\u65B9\u662F\u5E94\u6536\uFF08\u5BF9\u65B9\u6B20\u6211\uFF09\uFF0C\u8BF7\u6539\u9009\u300C\u6536\u6B3E\u300D",
  "entry.err.shouldRepay": "\u5BF9\u65B9\u662F\u5E94\u4ED8\uFF08\u6211\u6B20\u5BF9\u65B9\uFF09\uFF0C\u8BF7\u6539\u9009\u300C\u8FD8\u6B3E\u300D",
  "entry.saveFailed": "\u4FDD\u5B58\u5931\u8D25\uFF1A{{msg}}",
  "entry.ruleSaveFailed": "\u4FDD\u5B58\u89C4\u5219\u5931\u8D25\uFF1A{{msg}}",
  "entry.ruleSavedGenerated": "\u5DF2\u4FDD\u5B58\u89C4\u5219\u5E76\u751F\u6210 {{n}} \u7B14\u5230\u671F\u4EA4\u6613",
  "entry.ruleSavedNoDue": "\u5DF2\u4FDD\u5B58\u89C4\u5219\uFF08\u6682\u65E0\u5230\u671F\u4EA4\u6613\uFF09",
  "entry.switchLedger": "\u5207\u6362\u8D26\u672C",
  "entry.switchLedgerEmpty": "\u672A\u627E\u5230\u53EF\u7528\u8D26\u672C\uFF0C\u8BF7\u5728\u684C\u9762\u7AEF\u521B\u5EFA\u8D26\u672C",
  "entry.switchLedgerNoneCurrent": "\u5F53\u524D\u672A\u9009\u62E9\u8D26\u672C\uFF0C\u8BF7\u9009\u62E9\u4E00\u4E2A",
  "entry.switchLedgerCurrent": "\u5F53\u524D",
  // KR5/task1: accountActionModal + accountGrouping
  "account.hiddenGroup": "\u9690\u85CF\u8D26\u6237",
  "account.action.viewTx": "\u67E5\u770B\u6D41\u6C34\u660E\u7EC6",
  "account.action.viewTxHint": "\u67E5\u770B\u8BE5\u8D26\u6237\u6D41\u6C34",
  "account.action.viewProps": "\u67E5\u770B\u5C5E\u6027",
  "account.action.viewPropsHint": "\u67E5\u770B\u5E76\u7F16\u8F91\u8D26\u6237\u5C5E\u6027",
  "account.action.enable": "\u542F\u7528\u8D26\u6237",
  "account.action.hide": "\u9690\u85CF\u8D26\u6237",
  "account.action.enableHint": "\u5C06\u8BE5\u8D26\u6237\u6062\u590D\u5230\u6D3B\u52A8\u5206\u7EC4",
  "account.action.hideHint": "\u5C06\u8BE5\u8D26\u6237\u79FB\u5165\u9690\u85CF\u8D26\u6237\u5206\u533A",
  "account.action.merge": "\u5408\u5E76\u8D26\u6237",
  "account.action.mergeHint": "\u628A\u8BE5\u8D26\u6237\u5168\u90E8\u5386\u53F2\u5E76\u5165\u5176\u5B83\u8D26\u6237\uFF0C\u6E90\u8D26\u6237\u5C06\u88AB\u5220\u9664",
  "account.action.notFound": "\u8D26\u6237\u4E0D\u5B58\u5728\uFF0C\u5DF2\u5237\u65B0",
  "account.action.enabledNotif": "\u5DF2\u542F\u7528\u8D26\u6237\u300C{{name}}\u300D",
  "account.action.hiddenNotif": "\u5DF2\u9690\u85CF\u8D26\u6237\u300C{{name}}\u300D\uFF0C\u53EF\u5728\u9690\u85CF\u8D26\u6237\u4E2D\u6062\u590D",
  "account.action.updateFailed": "\u66F4\u65B0\u8D26\u6237\u5931\u8D25\uFF1A{{msg}}",
  // KR5/task2: accountCreateModal
  "account.create.title": "\u65B0\u5EFA\u8D26\u6237",
  "account.field.name": "\u540D\u79F0",
  "account.field.type": "\u7C7B\u578B",
  "account.field.openingBalance": "\u521D\u59CB\u4F59\u989D",
  "account.field.currency": "\u5E01\u79CD",
  "account.field.note": "\u5907\u6CE8",
  "account.field.creditLimit": "\u4FE1\u7528\u989D\u5EA6",
  "account.field.billingDay": "\u8D26\u5355\u65E5",
  "account.field.repaymentDay": "\u8FD8\u6B3E\u65E5",
  "account.err.billingDayRange": "\u8D26\u5355\u65E5\u5FC5\u987B\u5728 1-31 \u4E4B\u95F4",
  "account.err.repaymentDayRange": "\u8FD8\u6B3E\u65E5\u5FC5\u987B\u5728 1-31 \u4E4B\u95F4",
  "account.createdNotif": "\u5DF2\u521B\u5EFA\u8D26\u6237\u300C{{name}}\u300D",
  "account.createFailed": "\u521B\u5EFA\u8D26\u6237\u5931\u8D25\uFF1A{{msg}}",
  // KR5/task3: accountPropertiesModal
  "account.properties.title": "\u8D26\u6237\u5C5E\u6027 \xB7 {{name}}",
  "account.properties.timestamps": "\u521B\u5EFA\uFF1A{{created}}\u3000\xB7\u3000\u4FEE\u6539\uFF1A{{modified}}",
  "account.properties.savedNotif": "\u5DF2\u4FDD\u5B58\u8D26\u6237\u5C5E\u6027",
  "account.field.currencyLocked": "\u5E01\u79CD\uFF08\u521B\u5EFA\u540E\u4E0D\u53EF\u6539\uFF09",
  "account.field.currencyLockedHint": "\u5E01\u79CD\u521B\u5EFA\u540E\u4E0D\u53EF\u53D8\u66F4\uFF1B\u5982\u9700\u4FEE\u6B63\u8BF7\u5728\u65E0\u6D41\u6C34\u65F6\u5220\u9664\u8D26\u6237\u91CD\u5EFA",
  // KR5/task4: accountMergeModal
  "account.merge.title": "\u5408\u5E76\u8D26\u6237",
  "account.merge.intro": "\u5C06\u300C{{name}}\u300D\u7684\u5168\u90E8\u5386\u53F2\u5E76\u5165\u76EE\u6807\u8D26\u6237\uFF0C\u6E90\u8D26\u6237\u5C06\u88AB\u5220\u9664\uFF08\u4E0D\u53EF\u64A4\u9500\uFF09",
  "account.merge.currencyHint": "\u4EC5\u663E\u793A\u540C\u5E01\u79CD\uFF08{{cur}}\uFF09\u7684\u8D26\u6237\uFF1B\u8DE8\u5E01\u79CD\u8D26\u6237\u8BF7\u5148\u8F6C\u8D26\u6E05\u7A7A\u518D\u5220\u9664",
  "account.merge.targetPlaceholder": "\u9009\u62E9\u76EE\u6807\u8D26\u6237\u2026",
  "account.merge.targetHidden": "{{name}}\uFF08\u5DF2\u9690\u85CF\uFF09",
  "account.merge.confirmBtn": "\u786E\u8BA4\u5408\u5E76",
  "account.merge.errNoTarget": "\u8BF7\u9009\u62E9\u76EE\u6807\u8D26\u6237",
  "account.merge.confirmMsg": "\u5C06\u628A\u300C{{source}}\u300D\u7684\u5168\u90E8\u5386\u53F2\u5E76\u5165\u300C{{target}}\u300D\uFF0C\u6E90\u8D26\u6237\u300C{{source}}\u300D\u5C06\u88AB\u5220\u9664\u3002\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF08\u5DF2\u81EA\u52A8\u5907\u4EFD\uFF09\u3002",
  "account.merge.resultRewritten": "\u5DF2\u6539\u5199 {{n}} \u6761\u6D41\u6C34",
  "account.merge.resultDeleted": "\u5220\u9664 {{n}} \u6761\u8F6C\u8D26\uFF08\u4E24\u7AEF\u8D26\u6237\u76F8\u540C\uFF09",
  "account.merge.resultMerged": "\u300C{{source}}\u300D\u5DF2\u5408\u5E76\u5230\u300C{{target}}\u300D",
  "account.merge.resultSep": "\uFF0C",
  "account.merge.failed": "\u5408\u5E76\u5931\u8D25\uFF1A{{msg}}",
  // KR5/task5: adjustBalanceModal
  "adjust.title": "\u8C03\u6574\u300C{{name}}\u300D\u4F59\u989D",
  "adjust.detail": "\u63D0\u4EA4\u540E\u6309\u300C\u76EE\u6807\u4F59\u989D \u2212 \u5F53\u524D\u4F59\u989D\u300D\u8BB0\u4E00\u6761\u5DEE\u989D\u6D41\u6C34\uFF08\u6536\u5165\u6216\u652F\u51FA\uFF09\uFF1B\u53EF\u5728\u4E0B\u65B9\u6539\u9009\u5206\u7C7B\u3002",
  "adjust.ariaLabel": "\u67E5\u770B\u8C03\u6574\u4F59\u989D\u8BF4\u660E",
  "adjust.currentBalance": "\u5F53\u524D\u4F59\u989D\uFF1A{{balance}}",
  "adjust.targetLabel": "\u76EE\u6807\u4F59\u989D",
  "adjust.notePlaceholder": "\u53EF\u9009",
  "adjust.submitBtn": "\u786E\u8BA4\u8C03\u6574",
  "adjust.deltaZero": "\u5DEE\u989D\u4E3A 0\uFF0C\u65E0\u9700\u8C03\u6574",
  "adjust.deltaIncome": "\u5C06\u8BB0\u4E00\u7B14\u6536\u5165 +{{amt}}{{cur}}",
  "adjust.deltaExpense": "\u5C06\u8BB0\u4E00\u7B14\u652F\u51FA {{amt}}{{cur}}",
  "adjust.errEmptyTarget": "\u8BF7\u8F93\u5165\u76EE\u6807\u4F59\u989D",
  "adjust.errInvalidTarget": "\u8BF7\u8F93\u5165\u6709\u6548\u7684\u4F59\u989D",
  "adjust.writeFailed": "\u5199\u5165\u5931\u8D25\uFF1A{{msg}}",
  // KR5/task6: balanceModal
  "balance.emptyNoAccounts": "\u6682\u65E0\u8D26\u6237\uFF0C\u70B9\u300C\uFF0B \u65B0\u5EFA\u8D26\u6237\u300D\u521B\u5EFA",
  "balance.createAccountBtn": "\uFF0B \u65B0\u5EFA\u8D26\u6237",
  "balance.netWorth": "\u51C0\u8D44\u4EA7",
  "balance.netWorthWithCur": "\u51C0\u8D44\u4EA7\uFF08{{cur}}\uFF09",
  "balance.totalAssets": "\u603B\u8D44\u4EA7",
  "balance.totalLiabilities": "\u603B\u8D1F\u503A",
  "balance.creditPayable": "\u4FE1\u7528\u5361\u5E94\u8FD8 {{amount}}",
  "balance.receivablesPayables": "\u5E94\u6536 {{rec}} / \u5E94\u4ED8 {{pay}}",
  "balance.hiddenSummary": "\u9690\u85CF\u8D26\u6237\uFF08\u4ECD\u8BA1\u5165\u51C0\u8D44\u4EA7\uFF09",
  "balance.kindAsset": "\u8D44\u4EA7",
  "balance.kindLiability": "\u8D1F\u503A",
  "balance.accountOptionsHint": "\u67E5\u770B\u8D26\u6237\u9009\u9879",
  "balance.adjustHint": "\u70B9\u51FB\u8C03\u6574\u4F59\u989D",
  // KR6/task1: helpDisclosure + createLedgerForm
  "help.ariaLabel": "\u67E5\u770B\u8BF4\u660E",
  "ledger.create.title": "\u65B0\u5EFA\u8D26\u672C",
  "ledger.create.namePlaceholder": "\u8D26\u672C\u540D\uFF08\u5982 myledger\uFF09",
  "ledger.create.aliasPlaceholder": "\u522B\u540D\uFF08\u5982 \u4E2A\u4EBA\u8D26\u672C\uFF0C\u53EF\u9009\uFF09",
  "ledger.create.submitBtn": "\u65B0\u5EFA",
  // KR6/task2: reportModal — 复用 txList.loadFailed；插件专属 report.*
  "report.range.thisMonth": "\u672C\u6708",
  "report.range.last1m": "\u8FD11\u6708",
  "report.range.last3m": "\u8FD13\u6708",
  "report.range.thisYear": "\u672C\u5E74",
  "report.range.last6y": "\u8FD16\u5E74",
  "report.range.all": "\u5168\u90E8",
  "report.emptyNoTx": "\u6682\u65E0\u6D41\u6C34\u8BB0\u5F55\uFF0C\u65E0\u6CD5\u751F\u6210\u7EDF\u8BA1\u3002",
  "report.rangeLabel": "\u65F6\u95F4\u6BB5",
  "report.incomeCategory": "\u6536\u5165\u5206\u7C7B",
  "report.expenseCategory": "\u652F\u51FA\u5206\u7C7B",
  "report.stat.income": "\u6536\u5165",
  "report.stat.expense": "\u652F\u51FA",
  "report.stat.surplus": "\u7ED3\u4F59",
  "report.noData": "\u65E0\u6570\u636E",
  "report.collapse": "\u6536\u8D77 \u25B4",
  "report.expandOthers": "\u5C55\u5F00\u5176\u4ED6 {{n}} \u9879 \u25BE",
  "report.barClickHint": "\u70B9\u51FB\u67E5\u770B\u6D41\u6C34\u660E\u7EC6",
  "report.trend.byYear": "\u6536\u652F\u8D8B\u52BF\uFF08\u6309\u5E74\uFF09",
  "report.trend.byMonth": "\u6536\u652F\u8D8B\u52BF\uFF08\u6309\u6708\uFF09",
  "report.trend.clickHint": "\u70B9\u51FB\u67F1\u5B50\u67E5\u770B\u6536\u652F\u660E\u7EC6",
  "report.trend.monthSuffix": "{{bucket}} \u6708",
  "report.netWorth.byYear": "\u51C0\u503C\u8D8B\u52BF\uFF08\u6309\u5E74\uFF09",
  "report.netWorth.byMonth": "\u51C0\u503C\u8D8B\u52BF\uFF08\u6309\u6708\uFF09",
  "report.netWorth.clickHint": "\u70B9\u51FB\u8282\u70B9\u67E5\u770B\u51C0\u503C\u660E\u7EC6",
  "report.netWorth.totalAssets": "\u603B\u8D44\u4EA7",
  "report.netWorth.totalLiabilities": "\u603B\u8D1F\u503A",
  "report.netWorth.netWorth": "\u51C0\u8D44\u4EA7",
  // KR6/task3: batchModifyModal — 复用 tx.type.*/entry.field.*/entry.direction.*/common.cancel/
  // account.selectPlaceholder/entry.err.sameAccount/txList.concurrencyConflict/entry.amount；插件专属 batch.*
  "batch.keepHint": "\u7559\u7A7A\u4FDD\u6301\u539F\u503C",
  "batch.title": "\u6279\u91CF\u4FEE\u6539\uFF08{{n}} \u6761\uFF09",
  "batch.hint": "\u4EC5\u586B\u5199\u8981\u4FEE\u6539\u7684\u5B57\u6BB5\uFF0C\u7559\u7A7A\u4FDD\u6301\u5404\u6761\u539F\u503C\u3002",
  "batch.typeChangedWarn": "\u5DF2\u6539\u53D8\u7C7B\u578B\uFF0C\u76EE\u6807\u7C7B\u578B\u7684\u5FC5\u586B\u5B57\u6BB5\u5FC5\u987B\u586B\u5199\u3002",
  "batch.submitBtn": "\u6279\u91CF\u4FEE\u6539 {{n}} \u6761",
  "batch.field.personAccount": "\u5BF9\u65B9\uFF08\u4EBA\u8D26\u6237\uFF09",
  "batch.err.amount": "\u91D1\u989D\u9700\u4E3A\u5927\u4E8E 0 \u7684\u6570",
  "batch.err.tsFormat": "\u65F6\u95F4\u683C\u5F0F\u4E0D\u6B63\u786E",
  "batch.err.empty": "\u8BF7\u81F3\u5C11\u4FEE\u6539\u4E00\u9879",
  "batch.err.tcAccount": "\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u8D26\u6237",
  "batch.err.tcCategory": "\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u5206\u7C7B",
  "batch.err.tcFromAccount": "\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u8F6C\u51FA\u8D26\u6237",
  "batch.err.tcToAccount": "\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u8F6C\u5165\u8D26\u6237",
  "batch.err.tcSelfAccount": "\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u5DF1\u65B9\u8D26\u6237",
  "batch.err.tcPerson": "\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u5BF9\u65B9",
  "batch.err.tcDirection": "\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u501F\u8D37\u65B9\u5411",
  "batch.updatedN": "\u5DF2\u66F4\u65B0 {{n}} \u6761",
  "batch.failed": "\u6279\u91CF\u4FEE\u6539\u5931\u8D25\uFF1A{{msg}}",
  // KR6/task4: onboardingModal — 首次启动账本引导
  "onboarding.welcome": "\u6B22\u8FCE",
  "onboarding.emptyDesc": "\u8BE5\u4F4D\u7F6E\u8FD8\u6CA1\u6709\u8D26\u672C\u3002\u60A8\u53EF\u4EE5\u5148\u6253\u5F00\u793A\u4F8B\u8D26\u672C\u5B66\u4E60\uFF0C\u6216\u521B\u5EFA\u81EA\u5DF1\u7684\u8D26\u672C\u3002",
  "onboarding.createSample": "\u521B\u5EFA\u793A\u4F8B\u8D26\u672C\uFF08\u542B\u793A\u4F8B\u6570\u636E\uFF09",
  "onboarding.createSampleFailed": "\u521B\u5EFA\u793A\u4F8B\u8D26\u672C\u5931\u8D25\uFF1A{{msg}}",
  "onboarding.or": "\u2014 \u6216 \u2014",
  "onboarding.createNew": "\u521B\u5EFA\u65B0\u8D26\u672C",
  "onboarding.selectLedger": "\u9009\u62E9\u8D26\u672C",
  "onboarding.createdNotif": "\u5DF2\u521B\u5EFA\u8D26\u672C\u300C{{name}}\u300D",
  "onboarding.createFailed": "\u521B\u5EFA\u5931\u8D25\uFF1A{{msg}}",
  "onboarding.back": "\u8FD4\u56DE",
  "onboarding.createSubmit": "\u521B\u5EFA",
  // KR6/task5: main.ts — 命令/ribbon 名 + 默认账本别名 + 迁移/自愈 Notice
  "cmd.open": "\u5B8F\u5229\u8BB0\u8D26",
  "ledger.defaultAlias": "\u4E2A\u4EBA\u8D26\u672C",
  "notice.migratedN": "\u5DF2\u81EA\u52A8\u8FC1\u79FB {{n}} \u4E2A\u8D26\u672C\u5230\u9690\u85CF\u76EE\u5F55",
  "notice.migrateFailed": "\u6709 {{n}} \u4E2A\u8D26\u672C\u672A\u80FD\u8FC1\u79FB\uFF08\u53EF\u80FD\u6B63\u88AB\u5360\u7528\uFF09\uFF0C\u8BF7\u91CD\u542F Obsidian \u91CD\u8BD5\uFF1A{{list}}",
  "notice.selfHealed": "\u5F53\u524D\u8D26\u672C\u4E0D\u53EF\u7528\uFF0C\u5DF2\u5207\u6362\u5230\u300C{{alias}}\u300D",
  // KR7/task1: settings — General/About/Ledger panels + handlers + RenameAliasModal
  "settings.startup.on": "\u5DF2\u5F00\u542F\uFF1A\u4E0B\u6B21\u6253\u5F00 Obsidian \u81EA\u52A8\u8FDB\u5165\u8BB0\u8D26",
  "settings.startup.off": "\u5DF2\u5173\u95ED\uFF1A\u4E0B\u6B21\u6253\u5F00 Obsidian \u751F\u6548",
  "settings.startup.toggleLabel": "\u5F00 Obsidian \u81EA\u52A8\u8FDB\u5165",
  "settings.startup.rerunOnboarding": "\u21BB \u91CD\u8FD0\u884C\u5F15\u5BFC",
  "settings.about.app": "\u5E94\u7528",
  "settings.about.appName": "\u5B8F\u5229\u8BB0\u8D26 \xB7 Honey Ledger \xB7 Obsidian \u63D2\u4EF6",
  "settings.about.version": "\u7248\u672C",
  "settings.about.feedback": "\u53CD\u9988",
  "settings.about.diaglog": "\u8BCA\u65AD\u65E5\u5FD7",
  "settings.about.diaglogDesc": "\u8BB0\u5F55\u8FD0\u884C\u9519\u8BEF\u4E0E\u64CD\u4F5C\u65E5\u5FD7\uFF08\u5DF2\u8131\u654F\uFF0C\u4E0D\u542B\u91D1\u989D / \u8D26\u6237\u540D / \u5907\u6CE8\uFF09",
  "settings.about.diaglogBtn": "\u67E5\u770B\u8BCA\u65AD\u65E5\u5FD7",
  "settings.refreshBtn": "\u5237\u65B0",
  "settings.ledger.title": "\u8D26\u672C",
  "settings.ledger.createBtn": "\u65B0\u5EFA\u8D26\u672C",
  "settings.ledger.empty": "\u5C1A\u65E0\u8D26\u672C",
  "settings.ledger.switchBtn": "\u5207\u6362",
  "settings.ledger.switchedNotice": "\u5DF2\u5207\u6362\u5230\u300C{{alias}}\u300D\uFF0C\u8BF7\u5173\u95ED\u5E76\u91CD\u65B0\u6253\u5F00\u8BB0\u8D26\u754C\u9762",
  "settings.ledger.switchFailed": "\u5207\u6362\u8D26\u672C\u5931\u8D25\uFF1A{{msg}}",
  "settings.ledger.renameBtn": "\u6539\u540D",
  "settings.ledger.deleteBtn": "\u5220\u9664",
  "settings.ledger.loadFailed": "\u52A0\u8F7D\u8D26\u672C\u5217\u8868\u5931\u8D25\uFF1A{{msg}}",
  "settings.ledger.createdSwitchedNotice": "\u5DF2\u65B0\u5EFA\u5E76\u5207\u6362\u5230\u300C{{alias}}\u300D\uFF0C\u8BF7\u5173\u95ED\u5E76\u91CD\u65B0\u6253\u5F00\u8BB0\u8D26\u754C\u9762",
  "settings.ledger.refreshedNotice": "\u8D26\u672C\u5217\u8868\u5DF2\u5237\u65B0",
  "settings.ledger.createFailed": "\u65B0\u5EFA\u8D26\u672C\u5931\u8D25\uFF1A{{msg}}",
  "settings.ledger.aliasUpdated": "\u5DF2\u66F4\u65B0\u522B\u540D\uFF1A{{alias}}",
  "settings.ledger.renameFailed": "\u6539\u540D\u5931\u8D25\uFF1A{{msg}}",
  "settings.ledger.deleteConfirm1": "\u786E\u8BA4\u5220\u9664\u8D26\u672C\u300C{{alias}}\u300D\uFF1F\u6574\u76EE\u5F55\u542B backups \u5C06\u6C38\u4E45\u5220\u9664\u3002",
  "settings.ledger.deleteConfirm2": "\u6700\u540E\u786E\u8BA4\uFF1A\u6C38\u4E45\u5220\u9664\u300C{{alias}}\u300D\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002",
  "settings.ledger.deletedNotice": "\u5DF2\u5220\u9664\u8D26\u672C\uFF1A{{alias}}",
  "settings.ledger.deleteFailed": "\u5220\u9664\u5931\u8D25\uFF1A{{msg}}",
  "settings.ledger.renameAliasTitle": "\u6539\u8D26\u672C\u522B\u540D",
  "settings.password.setBtn": "\u8BBE\u5BC6\u7801",
  "settings.password.changeBtn": "\u6539\u5BC6\u7801",
  "settings.password.removeBtn": "\u5220\u5BC6\u7801",
  "settings.password.setTitle": "\u8BBE\u7F6E\u8D26\u672C\u5BC6\u7801",
  "settings.password.changeTitle": "\u4FEE\u6539\u8D26\u672C\u5BC6\u7801",
  "settings.password.removeTitle": "\u79FB\u9664\u8D26\u672C\u5BC6\u7801",
  "settings.password.setHint": "\u4E3A\u6B64\u8D26\u672C\u8BBE\u7F6E\u8BBF\u95EE\u5BC6\u7801\uFF0C\u4E4B\u540E\u8FDB\u5165\u9700\u5148\u8F93\u5165\u5BC6\u7801\u3002",
  "settings.password.changeHint": "\u4FEE\u6539\u300C{{name}}\u300D\u7684\u8BBF\u95EE\u5BC6\u7801\u3002\u65B0\u5BC6\u7801\u7559\u7A7A\u8868\u793A\u5220\u9664\u5BC6\u7801\u3002",
  "settings.password.removeHint": "\u8F93\u5165\u300C{{name}}\u300D\u7684\u5F53\u524D\u5BC6\u7801\u4EE5\u79FB\u9664\u5BC6\u7801\u9501\u3002",
  "settings.password.oldPlaceholder": "\u5F53\u524D\u5BC6\u7801",
  "settings.password.newPlaceholder": "\u65B0\u5BC6\u7801",
  "settings.password.confirmPlaceholder": "\u518D\u6B21\u8F93\u5165\u65B0\u5BC6\u7801",
  "settings.password.placeholder": "\u8D26\u672C\u5BC6\u7801",
  "settings.password.empty": "\u5BC6\u7801\u4E0D\u80FD\u4E3A\u7A7A",
  "settings.password.mismatch": "\u4E24\u6B21\u8F93\u5165\u4E0D\u4E00\u81F4",
  "settings.password.saving": "\u4FDD\u5B58\u4E2D\u2026",
  "settings.password.verifying": "\u6821\u9A8C\u4E2D\u2026",
  "settings.password.unlockTitle": "\u89E3\u9501\u8D26\u672C\u300C{{name}}\u300D",
  "settings.password.unlockHint": "\u8BF7\u8F93\u5165\u8BE5\u8D26\u672C\u7684\u8BBF\u95EE\u5BC6\u7801\u3002",
  "settings.password.unlock": "\u89E3\u9501",
  "settings.password.wrong": "\u5BC6\u7801\u9519\u8BEF",
  "settings.password.wrongOld": "\u5F53\u524D\u5BC6\u7801\u9519\u8BEF",
  "settings.password.toastSet": "\u5DF2\u8BBE\u7F6E\u8D26\u672C\u5BC6\u7801",
  "settings.password.toastChanged": "\u5DF2\u4FEE\u6539\u8D26\u672C\u5BC6\u7801",
  "settings.password.toastRemoved": "\u5DF2\u79FB\u9664\u8D26\u672C\u5BC6\u7801",
  "settings.password.toastFailed": "\u64CD\u4F5C\u5931\u8D25\uFF1A{{msg}}",
  "settings.onboarding.resetConfirm": "\u786E\u8BA4\u91CD\u65B0\u8FD0\u884C\u8D26\u672C\u5F15\u5BFC\uFF1F\u8FD9\u5C06\u6E05\u9664\u5F15\u5BFC\u5B8C\u6210\u6807\u8BB0\uFF0C\u4E0B\u6B21\u542F\u52A8\u63D2\u4EF6\u65F6\u5C06\u91CD\u65B0\u663E\u793A\u5F15\u5BFC\u3002",
  "settings.onboarding.resetDone": "\u5DF2\u6E05\u9664\u5F15\u5BFC\u6807\u8BB0\uFF0C\u4E0B\u6B21\u542F\u52A8\u63D2\u4EF6\u65F6\u5C06\u91CD\u65B0\u663E\u793A\u5F15\u5BFC",
  "settings.onboarding.resetFailed": "\u64CD\u4F5C\u5931\u8D25\uFF1A{{msg}}",
  // KR7/task2: settings — 备份卡片 + 处理器 + BackupModal
  "settings.backup.title": "\u5907\u4EFD",
  "settings.backup.helpDetail": "\u5907\u4EFD\u5B58\u50A8\u5728\u8D26\u672C\u76EE\u5F55\u7684 backups/<label>-<timestamp> \u5B50\u76EE\u5F55\u3002\u6062\u590D\u524D\u4F1A\u81EA\u52A8\u521B\u5EFA pre-restore \u515C\u5E95\u5907\u4EFD\u3002\u300C\u81EA\u52A8\u5907\u4EFD\u300D\u5728\u6253\u5F00\u8BB0\u8D26\u754C\u9762\u65F6\uFF0C\u82E5\u8DDD\u4E0A\u6B21\u5907\u4EFD\u8D85\u8FC7\u8BBE\u5B9A\u95F4\u9694\u5219\u81EA\u52A8\u5907\u4EFD\u4E00\u4EFD\uFF08\u6807\u8BB0\u4E3A auto\uFF0C\u4EC5\u4FDD\u7559\u6700\u8FD1\u82E5\u5E72\u4EFD\u3001\u81EA\u52A8\u6E05\u7406\u6700\u65E7\u7684\uFF1B\u4E24\u7AEF\u5171\u4EAB\u8BBE\u7F6E\uFF0C\u5B58\u4E8E ledger.json\uFF09\u3002\u6CE8\u610F\uFF1AiOS \u540E\u53F0\u4E0D\u4F1A\u89E6\u53D1\uFF0C\u4EC5 Obsidian \u6253\u5F00\u65F6\u68C0\u67E5\u3002",
  "settings.backup.createBtn": "\u2913 \u7ACB\u5373\u5907\u4EFD",
  "settings.backup.listBtn": "\u21A9 \u67E5\u770B\u5907\u4EFD",
  "settings.backup.createdNotice": "\u5DF2\u521B\u5EFA\u5907\u4EFD\uFF1A{{path}}",
  "settings.backup.createFailed": "\u5907\u4EFD\u5931\u8D25\uFF1A{{msg}}",
  "settings.backup.autoEnable": "\u6253\u5F00\u65F6\u81EA\u52A8\u5907\u4EFD",
  "settings.backup.autoInterval": "\u95F4\u9694",
  "settings.backup.autoKeep": "\u4FDD\u7559",
  "settings.backup.intervalDays": "{{count}} \u5929",
  "settings.backup.keepCount": "\u6700\u8FD1 {{count}} \u4EFD",
  "settings.backup.loadFailed": "\u8BFB\u53D6\u81EA\u52A8\u5907\u4EFD\u8BBE\u7F6E\u5931\u8D25\uFF1A{{msg}}",
  "settings.backup.configSaved": "\u5DF2\u4FDD\u5B58\u81EA\u52A8\u5907\u4EFD\u8BBE\u7F6E",
  "settings.backup.configSaveFailed": "\u4FDD\u5B58\u81EA\u52A8\u5907\u4EFD\u8BBE\u7F6E\u5931\u8D25\uFF1A{{msg}}",
  "settings.backup.modalTitle": "\u9009\u62E9\u5907\u4EFD\u6062\u590D",
  "settings.backup.empty": "\u6682\u65E0\u5907\u4EFD",
  "settings.backup.restoreBtn": "\u6062\u590D",
  "settings.backup.loadListFailed": "\u52A0\u8F7D\u5907\u4EFD\u5217\u8868\u5931\u8D25\uFF1A{{msg}}",
  "settings.backup.restoreConfirm1": "\u6062\u590D\u5907\u4EFD\u300C{{name}}\u300D\uFF1F\n\n\u6062\u590D\u5C06\u66FF\u6362\u5F53\u524D\u6570\u636E\uFF0C\u662F\u5426\u7EE7\u7EED\uFF1F",
  "settings.backup.restoreConfirm2": "\u6700\u540E\u786E\u8BA4\uFF1A\u6062\u590D\u300C{{name}}\u300D\uFF1F\n\n\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF08\u6062\u590D\u524D\u4F1A\u81EA\u52A8\u521B\u5EFA pre-restore \u515C\u5E95\u5907\u4EFD\uFF09\u3002",
  "settings.backup.restoredNotice": "\u5DF2\u6062\u590D\u5907\u4EFD\uFF1A{{name}}\uFF0C\u8BF7\u5173\u95ED\u5E76\u91CD\u65B0\u6253\u5F00\u8BB0\u8D26\u754C\u9762",
  "settings.backup.restoreFailed": "\u6062\u590D\u5931\u8D25\uFF1A{{msg}}",
  "settings.backup.deleteConfirm": "\u5220\u9664\u5907\u4EFD\u300C{{name}}\u300D\uFF1F",
  "settings.backup.deletedNotice": "\u5DF2\u5220\u9664\u5907\u4EFD\uFF1A{{name}}",
  "settings.backup.deleteFailed": "\u5220\u9664\u5931\u8D25\uFF1A{{msg}}",
  // KR7/task2: settings — 币种选择器/面板/编辑器
  "settings.currency.searchPlaceholder": "\u641C\u7D22\u5E01\u79CD\u6216\u4E2D\u6587\u540D",
  "settings.currency.searchResults": "\u641C\u7D22\u7ED3\u679C ({{n}})",
  "settings.currency.noMatch": "\u65E0\u5339\u914D\u5E01\u79CD",
  "currency.group.common": "\u5E38\u7528",
  "currency.group.all": "\u5168\u90E8 ({{count}})",
  "settings.currency.title": "\u5E01\u79CD\u4E0E\u6C47\u7387",
  "settings.currency.helpDetail": "\u672C\u4F4D\u5E01\u7528\u4E8E\u51C0\u8D44\u4EA7\u4E0E\u62A5\u8868\u6298\u7B97\uFF0C\u9ED8\u8BA4 CNY\u3002\u6C47\u7387\u8868\u4E0E\u672C\u4F4D\u5E01\u5B58\u50A8\u5728\u8D26\u672C\u76EE\u5F55\uFF08rates.json / ledger.json\uFF09\uFF0C\u968F iCloud \u4E0E\u684C\u9762\u7AEF\u540C\u6B65\u3002",
  "settings.currency.loadFailed": "\u52A0\u8F7D\u5E01\u79CD\u8BBE\u7F6E\u5931\u8D25\uFF1A{{msg}}",
  "settings.currency.baseLabel": "\u672C\u4F4D\u5E01",
  "settings.currency.baseSetRefreshing": "\u672C\u4F4D\u5E01\u5DF2\u8BBE\u4E3A {{cur}}\uFF0C\u6B63\u5728\u540E\u53F0\u5237\u65B0\u6C47\u7387\u2026",
  "settings.currency.baseRefreshed": "\u5DF2\u6309 {{cur}} \u65B0\u57FA\u51C6\u5237\u65B0\u6C47\u7387",
  "settings.currency.setFailed": "\u8BBE\u7F6E\u5931\u8D25\uFF1A{{msg}}",
  "settings.currency.ratesTableTitle": "\u5E01\u79CD\u4E0E\u6C47\u7387\u8868\uFF08\u2192 {{base}}\uFF09",
  "settings.currency.saveRates": "\u4FDD\u5B58\u6C47\u7387\u8868",
  "settings.currency.saved": "\u5DF2\u4FDD\u5B58",
  "settings.currency.noRates": "\u6682\u65E0\u5E01\u79CD",
  "settings.currency.addBtn": "\uFF0B \u6DFB\u52A0\u5E01\u79CD",
  "settings.currency.searchToAddPlaceholder": "\u641C\u7D22\u8981\u6DFB\u52A0\u7684\u5E01\u79CD",
  "settings.currency.errEmptyRows": "\u6709 {{n}} \u884C\u5E01\u79CD\u672A\u586B\u5199\uFF0C\u8BF7\u586B\u5199\u6216\u5220\u9664",
  "settings.currency.errInvalid": "\u65E0\u6548\u5E01\u79CD\uFF08\u975E ISO 4217 \u5E01\u79CD\u4EE3\u7801\uFF09\uFF1A{{list}}",
  "settings.currency.errBaseRow": "\u672C\u4F4D\u5E01 {{base}} \u65E0\u9700\u5728\u6C47\u7387\u8868\u4E2D\u7EF4\u62A4\uFF0C\u8BF7\u5220\u9664\u8BE5\u884C",
  "settings.currency.errMissingRate": "\u4EE5\u4E0B\u5E01\u79CD\u7F3A\u5C11\u6709\u6548\u6C47\u7387\uFF1A{{list}}",
  "settings.currency.errDuplicates": "\u91CD\u590D\u5E01\u79CD\uFF1A{{list}}",
  "settings.currency.savedNotice": "\u5DF2\u4FDD\u5B58\u6C47\u7387\u8868",
  "settings.currency.autoRefreshLabel": "\u81EA\u52A8\u5237\u65B0\u6C47\u7387\uFF08\u6BCF\u5929\uFF09",
  "settings.currency.refreshBtn": "\u5237\u65B0\u6C47\u7387",
  "settings.currency.refreshing": "\u5237\u65B0\u4E2D\u2026",
  "settings.currency.parseFailed": "\u54CD\u5E94\u89E3\u6790\u5931\u8D25\uFF0C\u5DF2\u4FDD\u7559\u65E2\u6709\u6C47\u7387\u8868",
  "settings.currency.noCaredCurrency": "\u54CD\u5E94\u4E2D\u6CA1\u6709\u5173\u5FC3\u7684\u5E01\u79CD\uFF0C\u5DF2\u4FDD\u7559\u65E2\u6709\u6C47\u7387\u8868",
  "settings.currency.refreshedN": "\u5DF2\u5237\u65B0 {{n}} \u4E2A\u5E01\u79CD\u6C47\u7387",
  "settings.currency.refreshFailed": "\u5237\u65B0\u5931\u8D25\uFF1A{{msg}}",
  // KR7/task3: settings — 周期账列表/规则项/类型/周期文案（typeLabel 复用 tx.type.*，刷新按钮复用 settings.refreshBtn）
  "settings.recurring.title": "\u5468\u671F\u8D26\u89C4\u5219",
  "settings.recurring.createBtn": "+ \u65B0\u5EFA\u89C4\u5219",
  "settings.recurring.empty": "\u6682\u65E0\u5468\u671F\u8D26\u89C4\u5219",
  "settings.recurring.active": "\u8FDB\u884C\u4E2D ({{n}})",
  "settings.recurring.inactiveSummary": "\u5DF2\u6682\u505C ({{n}})",
  "settings.recurring.loadFailed": "\u52A0\u8F7D\u5931\u8D25\uFF1A{{msg}}",
  "settings.recurring.refreshedNotice": "\u5468\u671F\u8D26\u89C4\u5219\u5DF2\u5237\u65B0",
  "settings.recurring.paused": "\u5DF2\u6682\u505C",
  "settings.recurring.enabledNotice": "\u5DF2\u542F\u7528",
  "settings.recurring.nextPeriodLabel": "\u4E0B\u4E00\u671F\uFF1A",
  "settings.recurring.viewTxAria": "\u67E5\u770B\u8BE5\u89C4\u5219\u751F\u6210\u7684\u6D41\u6C34",
  "settings.recurring.toggleFailed": "\u64CD\u4F5C\u5931\u8D25\uFF1A{{msg}}",
  "settings.recurring.deleteConfirm": "\u786E\u5B9A\u5220\u9664\u5468\u671F\u8D26\u89C4\u5219\u300C{{name}}\u300D\uFF1F\u5DF2\u751F\u6210\u7684\u4EA4\u6613\u4E0D\u4F1A\u88AB\u5220\u9664\u3002",
  "settings.recurring.deletedNotice": "\u5DF2\u5220\u9664",
  "settings.recurring.deleteFailed": "\u5220\u9664\u5931\u8D25\uFF1A{{msg}}",
  "settings.recurring.monthlyDay": "\u6BCF\u6708 {{day}} \u65E5",
  "settings.recurring.weeklyDay": "\u6BCF\u5468 {{day}}",
  "settings.recurring.yearlyDay": "\u6BCF\u5E74 {{month}} \u6708 {{day}} \u65E5",
  "settings.recurring.weekday.sun": "\u65E5",
  "settings.recurring.weekday.mon": "\u4E00",
  "settings.recurring.weekday.tue": "\u4E8C",
  "settings.recurring.weekday.wed": "\u4E09",
  "settings.recurring.weekday.thu": "\u56DB",
  "settings.recurring.weekday.fri": "\u4E94",
  "settings.recurring.weekday.sat": "\u516D",
  // KR7/task4: settings — 分类管理（列表/区块/项/隐藏项/handler + 4 个 Modal）
  "settings.category.expenseTitle": "\u652F\u51FA\u5206\u7C7B",
  "settings.category.expensePlaceholder": "\u4F8B\u5982\uFF1A\u9910\u996E",
  "settings.category.expenseAdd": "+ \u65B0\u5EFA\u652F\u51FA",
  "settings.category.incomeTitle": "\u6536\u5165\u5206\u7C7B",
  "settings.category.incomePlaceholder": "\u4F8B\u5982\uFF1A\u5DE5\u8D44",
  "settings.category.incomeAdd": "+ \u65B0\u5EFA\u6536\u5165",
  "settings.category.loadFailed": "\u52A0\u8F7D\u5931\u8D25\uFF1A{{msg}}",
  "settings.category.emptyTitle": "\u6682\u65E0{{title}}",
  "settings.category.hiddenLabel": "\u5DF2\u9690\u85CF",
  "settings.category.hiddenNote": "\u4E0D\u51FA\u73B0\u5728\u8BB0\u8D26\u4E0B\u62C9\uFF0C\u4F46\u4FDD\u7559\u5386\u53F2\u4EA4\u6613\u5F15\u7528",
  "settings.category.addedNotice": "\u5DF2\u6DFB\u52A0\u5206\u7C7B\u300C{{name}}\u300D",
  "settings.category.addFailed": "\u6DFB\u52A0\u5931\u8D25\uFF1A{{msg}}",
  "settings.category.refreshedNotice": "{{title}}\u5DF2\u5237\u65B0",
  "settings.category.renameAria": "\u91CD\u547D\u540D",
  "settings.category.renamedNotice": "\u5DF2\u6539\u540D\uFF0C\u91CD\u5199 {{n}} \u6761\u5386\u53F2\u4EA4\u6613",
  "settings.category.renamedShort": "\u5DF2\u6539\u540D",
  "settings.category.renameFailed": "\u6539\u540D\u5931\u8D25\uFF1A{{msg}}",
  "settings.category.mergeAria": "\u5408\u5E76\u5230\u5176\u4ED6\u5206\u7C7B",
  "settings.category.mergeNoTargets": "\u6CA1\u6709\u540C\u7C7B\u578B\uFF08\u652F\u51FA/\u6536\u5165\uFF09\u7684\u5176\u4ED6\u5206\u7C7B\u53EF\u5408\u5E76",
  "settings.category.mergedNotice": "\u5DF2\u5408\u5E76\uFF0C\u6539\u5199 {{n}} \u6761\u5386\u53F2\u4EA4\u6613",
  "settings.category.mergedShort": "\u5DF2\u5408\u5E76",
  "settings.category.mergeFailed": "\u5408\u5E76\u5931\u8D25\uFF1A{{msg}}",
  "settings.category.deleteAria": "\u5220\u9664\u5206\u7C7B",
  "settings.category.deleteFailed": "\u5220\u9664\u5931\u8D25\uFF1A{{msg}}",
  "settings.category.restoreBtn": "\u6062\u590D",
  "settings.category.restoredNotice": "\u5DF2\u6062\u590D\u300C{{name}}\u300D",
  "settings.category.restoreFailed": "\u6062\u590D\u5931\u8D25\uFF1A{{msg}}",
  "settings.category.purgeAria": "\u5F7B\u5E95\u5220\u9664\u5206\u7C7B",
  "settings.category.deleteConfirmUsed": "\u5206\u7C7B\u300C{{name}}\u300D\u5DF2\u88AB {{n}} \u6761\u4EA4\u6613\u4F7F\u7528\uFF0C\u5C06\u9690\u85CF\uFF08\u4E0D\u5F71\u54CD\u5386\u53F2\u4EA4\u6613\uFF09\uFF0C\u662F\u5426\u7EE7\u7EED\uFF1F",
  "settings.category.hiddenNotice": "\u5DF2\u9690\u85CF\u300C{{name}}\u300D",
  "settings.category.purgeConfirm": "\u5F7B\u5E95\u5220\u9664\u5206\u7C7B\u300C{{name}}\u300D\uFF1F",
  "settings.category.deletedNotice": "\u5DF2\u5220\u9664\u300C{{name}}\u300D",
  "settings.category.createTitle": "\u65B0\u5EFA{{title}}",
  "settings.category.renameTitle": "\u91CD\u547D\u540D\u5206\u7C7B",
  "settings.category.mergeTitle": "\u5408\u5E76\u5206\u7C7B",
  "settings.category.mergeIntro": "\u5C06\u300C{{name}}\u300D\u7684\u5168\u90E8\u5386\u53F2\u6539\u5199\u5E76\u5165\u76EE\u6807\u5206\u7C7B\uFF0C\u539F\u5206\u7C7B\u5C06\u88AB\u5220\u9664\uFF08\u4E0D\u53EF\u64A4\u9500\uFF09",
  "settings.category.mergeTargetPlaceholder": "\u9009\u62E9\u76EE\u6807\u2026",
  "settings.category.mergeTargetHidden": "{{name}}\uFF08\u5DF2\u9690\u85CF\uFF09",
  "settings.category.mergeSubmitBtn": "\u786E\u8BA4\u5408\u5E76",
  "settings.category.mergeErrNoTarget": "\u8BF7\u9009\u62E9\u76EE\u6807\u5206\u7C7B",
  "settings.category.mergeConfirmUsed": "\u5C06\u628A {{n}} \u6761\u5386\u53F2\u4EA4\u6613\u6539\u5199\u4E3A\u300C{{target}}\u300D\u3001\u6E90\u5206\u7C7B\u300C{{from}}\u300D\u5C06\u88AB\u5220\u9664\uFF0C\u4E0D\u53EF\u64A4\u9500\uFF08\u5DF2\u81EA\u52A8\u5907\u4EFD\uFF09",
  "settings.category.mergeConfirmEmpty": "\u5C06\u5220\u9664\u6E90\u5206\u7C7B\u300C{{from}}\u300D\uFF08\u65E0\u5386\u53F2\u4EA4\u6613\u9700\u6539\u5199\uFF09\uFF0C\u4E0D\u53EF\u64A4\u9500",
  // KR7/task4: settings — 账户类型管理（卡片/分组/停用区/footer + RegroupTypeModal）
  "settings.accountType.title": "\u8D26\u6237\u7C7B\u578B\u5206\u7EC4",
  "settings.accountType.resetBtn": "\u6062\u590D\u9ED8\u8BA4",
  "settings.accountType.createTitle": "\u65B0\u5EFA\u5206\u7EC4",
  "settings.accountType.deleteGroupConfirm": "\u5220\u9664\u5206\u7EC4\u300C{{label}}\u300D\uFF1F\u5176\u4E0B\u7C7B\u578B\u5C06\u8FC1\u79FB\u5230\u300C{{fallback}}\u300D\u3002",
  "settings.accountType.firstRemainingGroup": "\u9996\u4E2A\u5269\u4F59\u5206\u7EC4",
  "settings.accountType.newGroupPlaceholder": "\u65B0\u5206\u7EC4\u540D\u79F0",
  "settings.accountType.addGroupBtn": "\uFF0B \u65B0\u589E\u5206\u7EC4",
  "settings.accountType.inactiveSummary": "\u5DF2\u505C\u7528\uFF08{{n}}\uFF09",
  "settings.accountType.enableBtn": "\u542F\u7528",
  "settings.accountType.savedNotice": "\u5DF2\u4FDD\u5B58\u8D26\u6237\u7C7B\u578B",
  "settings.accountType.loadFailed": "\u52A0\u8F7D\u8D26\u6237\u7C7B\u578B\u5931\u8D25\uFF1A{{msg}}",
  "settings.accountType.refreshedNotice": "\u8D26\u6237\u7C7B\u578B\u5DF2\u5237\u65B0",
  "settings.accountType.resetConfirm": "\u53EA\u6062\u590D\u5206\u7EC4\u4E3A\u9ED8\u8BA4\uFF1F\u81EA\u5B9A\u4E49\u5206\u7EC4\u5C06\u88AB\u79FB\u9664\uFF0C\u5176\u4E2D\u7684\u7C7B\u578B\u8FC1\u79FB\u5230\u9996\u4E2A\u9ED8\u8BA4\u5206\u7EC4\uFF0C\u8D26\u6237\u7C7B\u578B\u4FDD\u6301\u4E0D\u53D8\u3002",
  "settings.accountType.moveUpGroupAria": "\u4E0A\u79FB\u5206\u7EC4",
  "settings.accountType.moveDownGroupAria": "\u4E0B\u79FB\u5206\u7EC4",
  "settings.accountType.deleteGroupBtn": "\u5220\u9664\u5206\u7EC4",
  "settings.accountType.emptyGroup": "\uFF08\u7A7A\u5206\u7EC4\uFF0C\u53EF\u628A\u7C7B\u578B\u8C03\u5230\u6B64\u7EC4\u6216\u5220\u9664\uFF09",
  "settings.accountType.moveUpTypeAria": "\u4E0A\u79FB\u7C7B\u578B",
  "settings.accountType.moveDownTypeAria": "\u4E0B\u79FB\u7C7B\u578B",
  "settings.accountType.regroupBtn": "\u91CD\u5206\u7EC4",
  "settings.accountType.regroupAria": "\u79FB\u52A8\u5230\u5176\u5B83\u5206\u7EC4",
  "settings.accountType.disableBtn": "\u505C\u7528",
  "settings.accountType.regroupTitle": "\u91CD\u5206\u7EC4",
  "settings.accountType.regroupIntro": "\u5C06\u300C{{label}}\u300D\u79FB\u52A8\u5230\uFF1A",
  // KR7-扩展: settings — 账户类型（重命名 + 自定义类型）
  "settings.accountTypes.title": "\u8D26\u6237\u7C7B\u578B",
  "settings.accountTypes.createTitle": "\u65B0\u5EFA\u8D26\u6237\u7C7B\u578B",
  "settings.accountTypes.resetConfirm": "\u53EA\u6062\u590D\u8D26\u6237\u7C7B\u578B\u4E3A\u9ED8\u8BA4\uFF1F\u81EA\u5B9A\u4E49\u7C7B\u578B\u5C06\u88AB\u79FB\u9664\uFF0C\u5206\u7EC4\u4FDD\u6301\u4E0D\u53D8\u3002",
  "settings.accountTypes.newPlaceholder": "\u65B0\u7C7B\u578B\u540D\u79F0",
  "settings.accountTypes.add": "\uFF0B \u65B0\u589E\u7C7B\u578B",
  "settings.accountTypes.delete": "\u5220\u9664",
  "settings.accountTypes.deleteConfirm": "\u5220\u9664\u81EA\u5B9A\u4E49\u7C7B\u578B\u300C{{label}}\u300D\uFF1F\u65E2\u6709\u8BE5\u7C7B\u578B\u8D26\u6237\u5C06\u663E\u793A\u4E3A\u672A\u77E5\u7C7B\u578B\uFF0C\u4F46\u4E0D\u4E22\u5931\u6570\u636E\u3002",
  "settings.accountTypes.accountCountTip": "\u542F\u7528 {{active}} \u4E2A / \u5171 {{total}} \u4E2A\u8D26\u6237",
  "accountKind.asset": "\u8D44\u4EA7",
  "accountKind.liability": "\u8D1F\u503A",
  // err.* — core AppError 错误码（两端 catch 处 formatError → t(code) 翻译；code 见 packages/core/src/errors.ts）
  "err.category.notFound": "\u5206\u7C7B\u4E0D\u5B58\u5728",
  "err.category.nameEmpty": "\u5206\u7C7B\u540D\u4E0D\u80FD\u4E3A\u7A7A",
  "err.category.nameExists": "\u8BE5\u540D\u79F0\u5DF2\u5B58\u5728\uFF0C\u5982\u9700\u5408\u5E76\u8BF7\u4F7F\u7528\u5408\u5E76\u529F\u80FD",
  "err.category.mergeFlowMismatch": "\u53EA\u80FD\u5408\u5E76\u5230\u76F8\u540C\u6536\u652F\u7C7B\u578B\uFF08\u652F\u51FA/\u6536\u5165\uFF09\u7684\u5206\u7C7B",
  "err.batch.amountPositive": "\u91D1\u989D\u5FC5\u987B\u5927\u4E8E 0",
  "err.batch.account": "\u8BF7\u9009\u62E9\u8D26\u6237",
  "err.batch.category": "\u8BF7\u9009\u62E9\u5206\u7C7B",
  "err.batch.fromAccount": "\u8BF7\u9009\u62E9\u8F6C\u51FA\u8D26\u6237",
  "err.batch.toAccount": "\u8BF7\u9009\u62E9\u8F6C\u5165\u8D26\u6237",
  "err.batch.sameAccount": "\u8F6C\u51FA\u4E0E\u8F6C\u5165\u8D26\u6237\u4E0D\u80FD\u76F8\u540C",
  "err.batch.selfAccount": "\u8BF7\u9009\u62E9\u5DF1\u65B9\u8D26\u6237",
  "err.batch.person": "\u8BF7\u9009\u62E9\u5BF9\u65B9\u8D26\u6237",
  "err.batch.direction": "\u8BF7\u9009\u62E9\u501F\u8D37\u65B9\u5411",
  "err.loan.collectBalance": "\u6536\u6B3E\u8981\u6C42\u5BF9\u65B9\u6709\u5E94\u6536\u4F59\u989D\uFF08>0\uFF09",
  "err.loan.repayBalance": "\u8FD8\u6B3E\u8981\u6C42\u5BF9\u65B9\u6709\u5E94\u4ED8\u4F59\u989D\uFF08<0\uFF09",
  "err.ledger.nameEmpty": "\u8D26\u672C\u540D\u4E0D\u80FD\u4E3A\u7A7A",
  "err.ledger.nameSeparator": "\u8D26\u672C\u540D\u4E0D\u80FD\u5305\u542B\u8DEF\u5F84\u5206\u9694\u7B26",
  "err.ledger.nameReserved": "\u8D26\u672C\u540D\u4E0D\u80FD\u4E3A\u4FDD\u7559\u5B57\uFF08. / .. / backups\uFF09",
  "err.ledger.nameExists": "\u8D26\u672C\u540D\u5DF2\u5B58\u5728",
  "err.recurring.idEmpty": "\u89C4\u5219 id \u4E0D\u80FD\u4E3A\u7A7A",
  "err.recurring.nameEmpty": "\u89C4\u5219\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A",
  "err.recurring.startDateEmpty": "\u8D77\u59CB\u65E5\u671F\u4E0D\u80FD\u4E3A\u7A7A",
  "err.recurring.startDateInvalid": "\u8D77\u59CB\u65E5\u671F\u683C\u5F0F\u65E0\u6548",
  "err.recurring.endDateInvalid": "\u7ED3\u675F\u65E5\u671F\u683C\u5F0F\u65E0\u6548",
  "err.recurring.endDateBeforeStart": "\u7ED3\u675F\u65E5\u671F\u4E0D\u80FD\u65E9\u4E8E\u8D77\u59CB\u65E5\u671F",
  "err.recurring.maxRuns": "\u6700\u5927\u6B21\u6570\u5FC5\u987B \u2265 1",
  "err.recurring.amountNegative": "\u91D1\u989D\u5FC5\u987B \u2265 0",
  "err.recurring.weeklyDay": "\u6BCF\u5468\u89C4\u5219\u9700\u8981\u9009\u62E9\u5468\u51E0\uFF080-6\uFF09",
  "err.recurring.monthlyDay": "\u6BCF\u6708\u89C4\u5219\u9700\u8981\u9009\u62E9\u65E5\u671F\uFF081-31\uFF09",
  "err.recurring.yearlyMonth": "\u6BCF\u5E74\u89C4\u5219\u9700\u8981\u9009\u62E9\u6708\u4EFD\uFF081-12\uFF09",
  "err.recurring.yearlyDay": "\u6BCF\u5E74\u89C4\u5219\u9700\u8981\u9009\u62E9\u65E5\u671F\uFF081-31\uFF09",
  "err.recurring.unknownPeriod": "\u672A\u77E5\u7684\u5468\u671F\u7C7B\u578B",
  "err.recurring.needAccount": "\u652F\u51FA/\u6536\u5165\u9700\u8981\u8D26\u6237",
  "err.recurring.needCategory": "\u652F\u51FA/\u6536\u5165\u9700\u8981\u5206\u7C7B",
  "err.recurring.transferAccounts": "\u8F6C\u8D26\u9700\u8981\u8F6C\u51FA/\u8F6C\u5165\u8D26\u6237",
  "err.recurring.transferSameAccount": "\u8F6C\u8D26\u7684\u4E24\u4E2A\u8D26\u6237\u4E0D\u80FD\u76F8\u540C",
  "err.recurring.loanSelfAccount": "\u501F\u8D37\u9700\u8981\u5DF1\u65B9\u8D26\u6237",
  "err.recurring.loanPerson": "\u501F\u8D37\u9700\u8981\u5BF9\u65B9\u8D26\u6237",
  "err.recurring.loanDirection": "\u501F\u8D37\u9700\u8981\u65B9\u5411",
  "accountType.cash": "\u73B0\u91D1",
  "accountType.savings": "\u50A8\u84C4",
  "accountType.ewallet": "\u7535\u5B50\u94B1\u5305",
  "accountType.securities": "\u8BC1\u5238",
  "accountType.fund": "\u57FA\u91D1",
  "accountType.other-investment": "\u5176\u4ED6\u6295\u8D44",
  "accountType.fixed-asset": "\u56FA\u5B9A\u8D44\u4EA7",
  "accountType.company": "\u516C\u53F8",
  "accountType.person": "\u5F80\u6765(\u501F\u8D37)",
  "accountType.credit": "\u4FE1\u7528\u5361",
  "accountType.loan": "\u8D37\u6B3E",
  "accountGroup.g-cash": "\u73B0\u91D1\u7C7B",
  "accountGroup.g-investment": "\u6295\u8D44\u7C7B",
  "accountGroup.g-fixed-asset": "\u56FA\u5B9A\u8D44\u4EA7",
  "accountGroup.g-company": "\u516C\u53F8",
  "accountGroup.g-credit": "\u4FE1\u8D37",
  "adapter.err.folderExists": "\u5DF2\u5B58\u5728\u540C\u540D\u76EE\u5F55\u300C{{name}}\u300D",
  "adapter.err.cannotDeleteActive": "\u4E0D\u80FD\u5220\u9664\u5F53\u524D\u8D26\u672C\uFF0C\u8BF7\u5148\u5207\u6362\u5230\u5176\u4ED6\u8D26\u672C",
  "seed.account.cash": "\u73B0\u91D1",
  "seed.account.savings": "\u62DB\u884C\u50A8\u84C4",
  "seed.account.ewallet": "\u5FAE\u4FE1\u96F6\u94B1\u901A",
  "seed.account.credit": "\u62DB\u884C\u4FE1\u7528\u5361",
  "seed.account.person": "\u5F20\u4E09\uFF08\u5F80\u6765\uFF09",
  "seed.category.dining": "\u9910\u996E",
  "seed.category.shopping": "\u8D2D\u7269",
  "seed.category.transport": "\u4EA4\u901A",
  "seed.category.home": "\u5C45\u5BB6",
  "seed.category.fun": "\u5A31\u4E50",
  "seed.category.medEdu": "\u533B\u6559",
  "seed.category.gift": "\u4EBA\u60C5",
  "seed.category.misc": "\u96F6\u7528",
  "seed.category.other": "\u5176\u4ED6",
  "seed.category.salary": "\u5DE5\u8D44\u85AA\u6C34",
  "seed.category.investment": "\u6295\u8D44\u6536\u76CA",
  "seed.category.refund": "\u9000\u6B3E\u8FD4\u6B3E",
  "seed.category.adjust": "\u4F59\u989D\u8C03\u6574",
  "seed.sampleAlias": "\u793A\u4F8B\u8D26\u672C",
  "seed.note.groceries": "\u83DC\u5E02\u573A\u4E70\u83DC",
  "seed.note.salaryMonth": "1\u6708\u5DE5\u8D44",
  "seed.note.transfer": "\u8F6C\u96F6\u94B1\u5907\u7528",
  "seed.note.shoppingClothes": "\u7F51\u8D2D\u8863\u670D",
  "seed.note.repayCard": "\u8FD8\u4FE1\u7528\u5361",
  "seed.note.lendFriend": "\u501F\u7ED9\u5F20\u4E09",
  "seed.note.investmentGain": "\u96F6\u94B1\u901A\u6536\u76CA",
  "seed.note.taxi": "\u6253\u8F66\u56DE\u5BB6",
  // KR8/task28: loanSettle 派生分类名 + 差额 note 前缀（按写入时 locale 快照生成，对齐桌面 settle.*）
  "settle.cat.badDebt": "\u574F\u8D26",
  "settle.cat.interest": "\u5229\u606F",
  "settle.cat.gift": "\u8D60\u4E0E",
  "settle.cat.fee": "\u606F\u8D39",
  "settle.writeoffNotePrefix": "\u7ED3\u6E05\u6838\u9500 \xB7 ",
  // 诊断日志调试视图（DiagLogModal）
  "diaglog.title": "\u8BCA\u65AD\u65E5\u5FD7",
  "diaglog.all": "\u5168\u90E8",
  "diaglog.search": "\u641C\u7D22\u5173\u952E\u5B57",
  "diaglog.refresh": "\u5237\u65B0",
  "diaglog.export": "\u5BFC\u51FA",
  "diaglog.copy": "\u590D\u5236",
  "diaglog.empty": "\u6682\u65E0\u65E5\u5FD7",
  "diaglog.exportDone": "\u5DF2\u5BFC\u51FA",
  "diaglog.exportFail": "\u5BFC\u51FA\u5931\u8D25",
  "cmd.diaglog": "\u8BCA\u65AD\u65E5\u5FD7"
};
var zh_default = zh;

// src/i18n/en.ts
var en = {
  "settings.tab.general": "General",
  "settings.tab.recurring": "Recurring",
  "settings.tab.category": "Categories",
  "settings.tab.currency": "Currency",
  "settings.tab.about": "About",
  "settings.general.startupTitle": "Startup",
  "settings.language.label": "Language",
  "settings.language.zh": "Chinese",
  "settings.language.en": "English",
  "common.confirm": "Confirm",
  "common.cancel": "Cancel",
  "nav.entry": "Entry",
  "nav.list": "Transactions",
  "nav.accounts": "Accounts",
  "nav.dashboard": "Stats",
  "nav.settings": "Settings",
  "nav.back": "\u2039 Back",
  "keypad.done": "Done",
  "keypad.error": "\u26A0 Invalid formula",
  // KR4/task4: transactionDetailModal — reused desktop-aligned keys + plugin-specific txDetail.*
  "common.delete": "Delete",
  "common.close": "Close",
  "common.edit": "Edit",
  "common.copy": "Copy",
  "tx.type.expense": "Expense",
  "tx.type.income": "Income",
  "tx.type.transfer": "Transfer",
  "tx.type.loan": "Loan",
  "entry.direction.lend": "Lend (they owe me)",
  "entry.direction.borrow": "Borrow (I owe them)",
  "entry.direction.collect": "Collect (reclaim a lend)",
  "entry.direction.repay": "Repay (settle a borrow)",
  "entry.field.ts": "Time",
  "entry.field.amount": "Amount",
  "entry.field.account": "Account",
  "entry.field.category": "Category",
  "entry.field.fromAccount": "From account",
  "entry.field.toAccount": "To account",
  "entry.field.direction": "Direction",
  "entry.field.selfAccount": "My account",
  "entry.field.note": "Note",
  "txDetail.title": "Transaction details",
  "txDetail.type": "Type",
  "txDetail.rate": "Rate",
  "txDetail.converted": "In {{base}}",
  "txDetail.toAmount": "Received",
  "txDetail.impliedRate": "Implied rate",
  "txDetail.counterparty": "Counterparty",
  "txDetail.balanceSuffix": " (balance {{balance}})",
  "txDetail.settlementEditBlock": "Collect/repay (settlement) transactions can only be edited on desktop; not yet supported on mobile.",
  "txDetail.settlementCopyBlock": "Collect/repay (settlement) transactions can only be duplicated on desktop; not yet supported on mobile.",
  "txDetail.deleteConfirm": "Delete this transaction? This action cannot be undone.",
  "txDetail.deleteFailed": "Delete failed, please try again",
  // KR4/task5: transactionListModal — reused desktop-aligned keys + plugin-specific txList.*
  "common.all": "All",
  "common.clear": "Clear",
  "common.done": "Done",
  "txList.sort.timeDesc": "Time new\u2192old",
  "txList.sort.timeAsc": "Time old\u2192new",
  "txList.sort.amountDesc": "Amount high\u2192low",
  "txList.sort.amountAsc": "Amount low\u2192high",
  "txList.empty": "No transactions yet.",
  "txList.loadFailed": 'Failed to load data. Please initialize the ledger on desktop, or check "Data subdirectory" in plugin settings.',
  "txList.errorDetail": "Error details: {{msg}}",
  "txList.rangeTime": "Time range",
  "txList.lastMonths": "Last {{n}}mo",
  "txList.allTime": "All",
  "txList.rangeType": "Type",
  "txList.rangeAccountNote": "Account/Note",
  "txList.allAccounts": "All accounts",
  "txList.searchPlaceholder": "Search note...",
  "txList.ariaClearKeyword": "Clear note search",
  "txList.ariaClearAllFilters": "Clear all filters",
  "txList.recurringDefault": "Recurring rule",
  "txList.recurringPrefix": "\u{1F4CB} Recurring: ",
  "txList.countSuffix": " \xB7 {{n}} txns",
  "txList.categoryDrillPrefix": "\u{1F3F7}\uFE0F Category: ",
  "txList.uncategorized": "(Uncategorized)",
  "txList.sortLabel": "Sort",
  "txList.select": "Select",
  "txList.selectAll": "Select all",
  "txList.selectedN": "{{n}} selected",
  "txList.batchModify": "Batch edit",
  "txList.batchModifyOnlySameType": "Batch edit requires same-type entries",
  "txList.selectFirst": "Select entries first",
  "txList.batchDelete": "Batch delete",
  "txList.batchDeleteConfirm": "Delete {{n}} selected transactions? This cannot be undone. Continue?",
  "txList.batchDeleteConfirmPartner": "Will delete {{selected}} selected transactions plus {{partner}} linked settlement partner(s), {{total}} total. This cannot be undone. Continue?",
  "tiedConflict.notice": "{{count}} transaction(s) have sync conflicts (same timestamp; result depends on sync order). Tap a row marked \u26A0\uFE0F and save to resolve.",
  "tiedConflict.badgeTip": "Sync conflict: this record was updated on another device at the same timestamp, so the shown result depends on sync order. Edit and save to resolve.",
  "txList.concurrencyConflict": "Selected entries were updated on another device; refreshed. Please re-select and retry.",
  "txList.deletedN": "Deleted {{n}} entries",
  "txList.batchDeleteFailed": "Batch delete failed: {{msg}}",
  "txList.emptyRecurring": "No entries generated by this rule yet",
  "txList.emptyFiltered": "No matching transactions.",
  "txList.loadMore": "Load more\u2026",
  "txList.monthIncome": "In",
  "txList.monthExpense": "Ex",
  "txList.monthIn": "In",
  "txList.monthOut": "Out",
  "txList.monthBalanceTitle": "{{account}} month-end balance",
  "txList.balancePrefix": "Bal {{amount}}",
  "txList.flatSortHint": "Not grouped by month when sorted by amount",
  "txList.expandAll": "Expand all",
  "txList.collapseAll": "Collapse all",
  "txList.loanDir.lend": "Lend",
  "txList.loanDir.borrow": "Borrow",
  "txList.loanDir.collect": "Collect",
  "txList.loanDir.repay": "Repay",
  // KR4/task6: entryModal — reused desktop-aligned entry.* + plugin-specific
  "common.save": "Save",
  "account.selectPlaceholder": "Select",
  "entry.amount": "Amount",
  "entry.amountWithCur": "Amount ({{cur}})",
  "entry.fromNote": "\u2190 from note",
  "entry.rateLabel": "Rate (1 {{from}} \u2192 {{to}})",
  "entry.ratePlaceholder": "1 {{from}} = ? {{to}}",
  "entry.rateHint": "Pre-filled from rate table, editable; blank = 1:1",
  "entry.toAmountLabel": "Transfer-in amount ({{cur}})",
  "entry.toAmountPlaceholder": "Received amount in {{cur}}",
  "entry.impliedRateHint": "Implied rate 1 {{from}} = {{rate}} {{to}} (for reference)",
  "entry.crossTransferHint": "Cross-currency: enter received amount in to-account ({{cur}})",
  "entry.loanCurrencyMismatch": "Loans don't support cross-currency (mine {{ac}} / theirs {{pc}}). Create a same-currency account for them or use Transfer.",
  "entry.repeating": "\u2713 Repeats",
  "entry.notRepeating": "One-time",
  "entry.startDate": "Start date",
  "entry.time": "Time",
  "entry.ruleName": "Rule name",
  "entry.ruleNamePlaceholder": "e.g. Monthly rent",
  "entry.period": "Period",
  "entry.periodValue.monthly": "Monthly",
  "entry.periodValue.weekly": "Weekly",
  "entry.periodValue.yearly": "Yearly",
  "entry.dateLabel": "Date",
  "entry.monthSuffix": "{{n}}",
  "entry.endDateLabel": "End date",
  "entry.weekday.sun": "Sun",
  "entry.weekday.mon": "Mon",
  "entry.weekday.tue": "Tue",
  "entry.weekday.wed": "Wed",
  "entry.weekday.thu": "Thu",
  "entry.weekday.fri": "Fri",
  "entry.weekday.sat": "Sat",
  "entry.add": "Add",
  "entry.newPerson": "New counterparty",
  "entry.personNamePlaceholder": "Name",
  "entry.notePlaceholder": "Optional \u2014 paste SMS/text to auto-extract amount",
  "entry.receivable": "receivable",
  "entry.payable": "payable",
  "entry.none": "none",
  "entry.nonePerson": "no entries",
  "entry.settle": "Settle",
  "entry.currentBalanceBase": "Balance {{amount}}",
  "entry.overdraftWarn": '"{{name}}" balance will become {{amount}}',
  "entry.personCurrentBase": "Counterparty now {{amount}} ({{state}})",
  "entry.outstandingBase": "Outstanding {{amount}} ({{state}})",
  "entry.settleExact": "; settles exactly, no difference",
  "entry.settleWriteoff": "; difference {{amount}} booked to [{{category}}\xB7{{flow}}], counterparty cleared",
  "entry.settlePartial": "; after partial return, counterparty balance {{amount}}",
  "entry.settleDirMismatchCollect": "; direction conflicts with outstanding \u2014 switch to Repay",
  "entry.settleDirMismatchRepay": "; direction conflicts with outstanding \u2014 switch to Collect",
  "entry.err.account": "Please pick an account",
  "entry.err.category": "Please pick a category",
  "entry.err.fromAccount": "Please pick a from-account",
  "entry.err.toAccount": "Please pick a to-account",
  "entry.err.selfAccount": "Please pick your account",
  "entry.err.amountPositive": "Please enter an amount greater than 0",
  "entry.err.ruleName": "Please fill in the rule name",
  "entry.err.crossTransferAmount": "Cross-currency transfer needs the received amount in the to-account currency",
  "entry.err.sameAccount": "From and to accounts must differ",
  "entry.err.personOrCreate": "Select or create a counterparty",
  "entry.err.personFirst": "Pick a counterparty first",
  "entry.err.noOutstanding": "This counterparty has no outstanding balance",
  "entry.err.shouldCollect": 'Counterparty is receivable (they owe you) \u2014 switch to "Collect"',
  "entry.err.shouldRepay": 'Counterparty is payable (you owe them) \u2014 switch to "Repay"',
  "entry.saveFailed": "Save failed: {{msg}}",
  "entry.ruleSaveFailed": "Recurring rule save failed: {{msg}}",
  "entry.ruleSavedGenerated": "Rule saved; generated {{n}} due transactions",
  "entry.ruleSavedNoDue": "Rule saved (no due transactions yet)",
  "entry.switchLedger": "Switch ledger",
  "entry.switchLedgerEmpty": "No ledgers found; create one on desktop",
  "entry.switchLedgerNoneCurrent": "No ledger selected; pick one",
  "entry.switchLedgerCurrent": "Current",
  // KR5/task1: accountActionModal + accountGrouping
  "account.hiddenGroup": "Hidden accounts",
  "account.action.viewTx": "View transactions",
  "account.action.viewTxHint": "View this account's transactions",
  "account.action.viewProps": "View properties",
  "account.action.viewPropsHint": "View & edit account properties",
  "account.action.enable": "Enable account",
  "account.action.hide": "Hide account",
  "account.action.enableHint": "Restore this account to the active group",
  "account.action.hideHint": "Move this account to the hidden group",
  "account.action.merge": "Merge account",
  "account.action.mergeHint": "Merge this account's full history into another; the source account will be deleted",
  "account.action.notFound": "Account not found; refreshed",
  "account.action.enabledNotif": 'Enabled account "{{name}}"',
  "account.action.hiddenNotif": 'Hid account "{{name}}"; restore it from the hidden group',
  "account.action.updateFailed": "Update account failed: {{msg}}",
  // KR5/task2: accountCreateModal
  "account.create.title": "New account",
  "account.field.name": "Name",
  "account.field.type": "Type",
  "account.field.openingBalance": "Opening balance",
  "account.field.currency": "Currency",
  "account.field.note": "Note",
  "account.field.creditLimit": "Credit limit",
  "account.field.billingDay": "Billing day",
  "account.field.repaymentDay": "Repayment day",
  "account.err.billingDayRange": "Billing day must be 1-31",
  "account.err.repaymentDayRange": "Repayment day must be 1-31",
  "account.createdNotif": 'Created account "{{name}}"',
  "account.createFailed": "Create account failed: {{msg}}",
  // KR5/task3: accountPropertiesModal
  "account.properties.title": "Account properties \xB7 {{name}}",
  "account.properties.timestamps": "Created: {{created}} \xB7 Modified: {{modified}}",
  "account.properties.savedNotif": "Account properties saved",
  "account.field.currencyLocked": "Currency (locked after creation)",
  "account.field.currencyLockedHint": "Currency can't change after creation; to fix, delete the account when it has no transactions and recreate it",
  // KR5/task4: accountMergeModal
  "account.merge.title": "Merge account",
  "account.merge.intro": 'All history of "{{name}}" will be merged into the target account; the source account will be deleted (irreversible)',
  "account.merge.currencyHint": "Only same-currency ({{cur}}) accounts are listed; for other currencies, transfer out then delete",
  "account.merge.targetPlaceholder": "Select target account\u2026",
  "account.merge.targetHidden": "{{name}} (hidden)",
  "account.merge.confirmBtn": "Confirm merge",
  "account.merge.errNoTarget": "Please select a target account",
  "account.merge.confirmMsg": 'All history of "{{source}}" will be merged into "{{target}}"; the source account "{{source}}" will be deleted. Irreversible (auto-backed up).',
  "account.merge.resultRewritten": "Rewrote {{n}} transactions",
  "account.merge.resultDeleted": "Deleted {{n}} transfers (same account both sides)",
  "account.merge.resultMerged": '"{{source}}" merged into "{{target}}"',
  "account.merge.resultSep": ", ",
  "account.merge.failed": "Merge failed: {{msg}}",
  // KR5/task5: adjustBalanceModal
  "adjust.title": 'Adjust balance for "{{name}}"',
  "adjust.detail": 'On submit, a difference transaction (income or expense) will be created based on "target \u2212 current balance"; you can change the category below.',
  "adjust.ariaLabel": "View adjust balance help",
  "adjust.currentBalance": "Current balance: {{balance}}",
  "adjust.targetLabel": "Target balance",
  "adjust.notePlaceholder": "optional",
  "adjust.submitBtn": "Confirm adjustment",
  "adjust.deltaZero": "Difference is 0, no adjustment needed",
  "adjust.deltaIncome": "Will record income +{{amt}} {{cur}}",
  "adjust.deltaExpense": "Will record expense {{amt}} {{cur}}",
  "adjust.errEmptyTarget": "Please enter a target balance",
  "adjust.errInvalidTarget": "Please enter a valid balance",
  "adjust.writeFailed": "Write failed: {{msg}}",
  // KR5/task6: balanceModal
  "balance.emptyNoAccounts": 'No accounts yet \u2014 tap "+ New account" to create one',
  "balance.createAccountBtn": "+ New account",
  "balance.netWorth": "Net worth",
  "balance.netWorthWithCur": "Net worth ({{cur}})",
  "balance.totalAssets": "Total assets",
  "balance.totalLiabilities": "Total liabilities",
  "balance.creditPayable": "Credit due {{amount}}",
  "balance.receivablesPayables": "Receivable {{rec}} / Payable {{pay}}",
  "balance.hiddenSummary": "Hidden accounts (still counted in net worth)",
  "balance.kindAsset": "Assets",
  "balance.kindLiability": "Liabilities",
  "balance.accountOptionsHint": "View account options",
  "balance.adjustHint": "Tap to adjust balance",
  // KR6/task1: helpDisclosure + createLedgerForm
  "help.ariaLabel": "View explanation",
  "ledger.create.title": "New ledger",
  "ledger.create.namePlaceholder": "Ledger name (e.g. myledger)",
  "ledger.create.aliasPlaceholder": "Alias (e.g. Personal ledger, optional)",
  "ledger.create.submitBtn": "Create",
  // KR6/task2: reportModal — reused txList.loadFailed; plugin-specific report.*
  "report.range.thisMonth": "This month",
  "report.range.last1m": "Last 1mo",
  "report.range.last3m": "Last 3mo",
  "report.range.thisYear": "This year",
  "report.range.last6y": "Last 6yr",
  "report.range.all": "All",
  "report.emptyNoTx": "No transactions yet; nothing to report.",
  "report.rangeLabel": "Time range",
  "report.incomeCategory": "Income by category",
  "report.expenseCategory": "Expense by category",
  "report.stat.income": "Income",
  "report.stat.expense": "Expense",
  "report.stat.surplus": "Surplus",
  "report.noData": "No data",
  "report.collapse": "Collapse \u25B4",
  "report.expandOthers": "Show {{n}} more \u25BE",
  "report.barClickHint": "Click to view transactions",
  "report.trend.byYear": "Income & expense trend (by year)",
  "report.trend.byMonth": "Income & expense trend (by month)",
  "report.trend.clickHint": "Click a bar for details",
  "report.trend.monthSuffix": "{{bucket}}",
  "report.netWorth.byYear": "Net worth trend (by year)",
  "report.netWorth.byMonth": "Net worth trend (by month)",
  "report.netWorth.clickHint": "Tap a point for net worth details",
  "report.netWorth.totalAssets": "Total assets",
  "report.netWorth.totalLiabilities": "Total liabilities",
  "report.netWorth.netWorth": "Net worth",
  // KR6/task3: batchModifyModal — reused tx.type.*/entry.field.*/entry.direction.*/common.cancel/
  // account.selectPlaceholder/entry.err.sameAccount/txList.concurrencyConflict/entry.amount; plugin-specific batch.*
  "batch.keepHint": "Leave blank to keep",
  "batch.title": "Batch edit ({{n}} items)",
  "batch.hint": "Fill only the fields you want to change; blanks keep each item's original value.",
  "batch.typeChangedWarn": "Type changed \u2014 required fields for the new type must be filled.",
  "batch.submitBtn": "Batch edit {{n}} items",
  "batch.field.personAccount": "Counterparty (person acct)",
  "batch.err.amount": "Amount must be a number greater than 0",
  "batch.err.tsFormat": "Invalid time format",
  "batch.err.empty": "Please change at least one field",
  "batch.err.tcAccount": "After changing type, pick an account",
  "batch.err.tcCategory": "After changing type, pick a category",
  "batch.err.tcFromAccount": "After changing type, pick a from-account",
  "batch.err.tcToAccount": "After changing type, pick a to-account",
  "batch.err.tcSelfAccount": "After changing type, pick your account",
  "batch.err.tcPerson": "After changing type, pick a counterparty",
  "batch.err.tcDirection": "After changing type, pick a loan direction",
  "batch.updatedN": "Updated {{n}} items",
  "batch.failed": "Batch edit failed: {{msg}}",
  // KR6/task4: onboardingModal — first-run ledger onboarding
  "onboarding.welcome": "Welcome",
  "onboarding.emptyDesc": "No ledger here yet. Open the sample ledger to explore, or create your own.",
  "onboarding.createSample": "Create sample ledger (with demo data)",
  "onboarding.createSampleFailed": "Failed to create sample ledger: {{msg}}",
  "onboarding.or": "\u2014 or \u2014",
  "onboarding.createNew": "Create new ledger",
  "onboarding.selectLedger": "Choose a ledger",
  "onboarding.createdNotif": 'Created ledger "{{name}}"',
  "onboarding.createFailed": "Create failed: {{msg}}",
  "onboarding.back": "Back",
  "onboarding.createSubmit": "Create",
  // KR6/task5: main.ts — command/ribbon name + default ledger alias + migrate/self-heal notices
  "cmd.open": "Honey Ledger",
  "ledger.defaultAlias": "Personal ledger",
  "notice.migratedN": "Auto-migrated {{n}} ledger(s) to hidden folders",
  "notice.migrateFailed": "{{n}} ledger(s) failed to migrate (may be in use); restart Obsidian and retry: {{list}}",
  "notice.selfHealed": 'Current ledger unavailable; switched to "{{alias}}"',
  // KR7/task1: settings — General/About/Ledger panels + handlers + RenameAliasModal
  "settings.startup.on": "Enabled: auto-opens Honey Ledger next time you launch Obsidian",
  "settings.startup.off": "Disabled: takes effect next time you open Obsidian",
  "settings.startup.toggleLabel": " Auto-enter on Obsidian launch",
  "settings.startup.rerunOnboarding": "\u21BB Rerun onboarding",
  "settings.about.app": "App",
  "settings.about.appName": "Honey Ledger \xB7 Obsidian Plugin",
  "settings.about.version": "Version",
  "settings.about.feedback": "Feedback",
  "settings.about.diaglog": "Diagnostic logs",
  "settings.about.diaglogDesc": "Records runtime errors and operations (redacted: no amounts, account names, or notes)",
  "settings.about.diaglogBtn": "View diagnostic logs",
  "settings.refreshBtn": "Refresh",
  "settings.ledger.title": "Ledgers",
  "settings.ledger.createBtn": "New ledger",
  "settings.ledger.empty": "No ledgers yet",
  "settings.ledger.switchBtn": "Switch",
  "settings.ledger.switchedNotice": 'Switched to "{{alias}}"; please close and reopen the accounting view',
  "settings.ledger.switchFailed": "Switch ledger failed: {{msg}}",
  "settings.ledger.renameBtn": "Rename",
  "settings.ledger.deleteBtn": "Delete",
  "settings.ledger.loadFailed": "Failed to load ledger list: {{msg}}",
  "settings.ledger.createdSwitchedNotice": 'Created and switched to "{{alias}}"; please close and reopen the accounting view',
  "settings.ledger.refreshedNotice": "Ledger list refreshed",
  "settings.ledger.createFailed": "Create ledger failed: {{msg}}",
  "settings.ledger.aliasUpdated": "Alias updated: {{alias}}",
  "settings.ledger.renameFailed": "Rename failed: {{msg}}",
  "settings.ledger.deleteConfirm1": 'Delete ledger "{{alias}}"? The entire folder (incl. backups) will be permanently removed.',
  "settings.ledger.deleteConfirm2": 'Final confirmation: permanently delete "{{alias}}"? This cannot be undone.',
  "settings.ledger.deletedNotice": "Deleted ledger: {{alias}}",
  "settings.ledger.deleteFailed": "Delete failed: {{msg}}",
  "settings.ledger.renameAliasTitle": "Rename ledger alias",
  "settings.password.setBtn": "Set password",
  "settings.password.changeBtn": "Change password",
  "settings.password.removeBtn": "Remove password",
  "settings.password.setTitle": "Set ledger password",
  "settings.password.changeTitle": "Change ledger password",
  "settings.password.removeTitle": "Remove ledger password",
  "settings.password.setHint": "Set an access password for this ledger. Entering it will require the password from now on.",
  "settings.password.changeHint": 'Change the access password of "{{name}}". Leave the new password blank to remove it.',
  "settings.password.removeHint": 'Enter the current password of "{{name}}" to remove the password lock.',
  "settings.password.oldPlaceholder": "Current password",
  "settings.password.newPlaceholder": "New password",
  "settings.password.confirmPlaceholder": "Re-enter new password",
  "settings.password.placeholder": "Ledger password",
  "settings.password.empty": "Password cannot be empty",
  "settings.password.mismatch": "Entries do not match",
  "settings.password.saving": "Saving\u2026",
  "settings.password.verifying": "Verifying\u2026",
  "settings.password.unlockTitle": 'Unlock ledger "{{name}}"',
  "settings.password.unlockHint": "Enter this ledger's access password.",
  "settings.password.unlock": "Unlock",
  "settings.password.wrong": "Wrong password",
  "settings.password.wrongOld": "Current password is wrong",
  "settings.password.toastSet": "Ledger password set",
  "settings.password.toastChanged": "Ledger password changed",
  "settings.password.toastRemoved": "Ledger password removed",
  "settings.password.toastFailed": "Operation failed: {{msg}}",
  "settings.onboarding.resetConfirm": "Rerun the ledger onboarding? This clears the onboarding-complete flag; onboarding shows again next launch.",
  "settings.onboarding.resetDone": "Onboarding flag cleared; onboarding will show again next launch",
  "settings.onboarding.resetFailed": "Action failed: {{msg}}",
  // KR7/task2: settings — Backup card + handlers + BackupModal
  "settings.backup.title": "Backups",
  "settings.backup.helpDetail": 'Backups are stored in the ledger directory under backups/<label>-<timestamp>. A pre-restore safety backup is auto-created before restoring. "Auto-backup" creates one on opening the accounting view if more than the chosen interval has passed since the last backup (labeled auto; only the latest few are kept, oldest pruned; setting shared by both ends, stored in ledger.json). Note: iOS does not trigger this in the background \u2014 it only runs when Obsidian is open.',
  "settings.backup.createBtn": "\u2913 Back up now",
  "settings.backup.listBtn": "\u21A9 View backups",
  "settings.backup.createdNotice": "Backup created: {{path}}",
  "settings.backup.createFailed": "Backup failed: {{msg}}",
  "settings.backup.autoEnable": "Auto-backup on open",
  "settings.backup.autoInterval": "Interval",
  "settings.backup.autoKeep": "Keep",
  "settings.backup.intervalDays": "{{count}} days",
  "settings.backup.keepCount": "Latest {{count}}",
  "settings.backup.loadFailed": "Failed to load auto-backup settings: {{msg}}",
  "settings.backup.configSaved": "Auto-backup settings saved",
  "settings.backup.configSaveFailed": "Failed to save auto-backup settings: {{msg}}",
  "settings.backup.modalTitle": "Restore a backup",
  "settings.backup.empty": "No backups",
  "settings.backup.restoreBtn": "Restore",
  "settings.backup.loadListFailed": "Failed to load backup list: {{msg}}",
  "settings.backup.restoreConfirm1": 'Restore backup "{{name}}"?\n\nThis will replace current data. Continue?',
  "settings.backup.restoreConfirm2": 'Final confirmation: restore "{{name}}"?\n\nThis cannot be undone (a pre-restore safety backup is auto-created first).',
  "settings.backup.restoredNotice": "Restored backup: {{name}}. Please close and reopen the accounting view.",
  "settings.backup.restoreFailed": "Restore failed: {{msg}}",
  "settings.backup.deleteConfirm": 'Delete backup "{{name}}"?',
  "settings.backup.deletedNotice": "Deleted backup: {{name}}",
  "settings.backup.deleteFailed": "Delete failed: {{msg}}",
  // KR7/task2: settings — Currency picker/panel/editor
  "settings.currency.searchPlaceholder": "Search currency or name",
  "settings.currency.searchResults": "Search results ({{n}})",
  "settings.currency.noMatch": "No matching currency",
  "currency.group.common": "Common",
  "currency.group.all": "All ({{count}})",
  "settings.currency.title": "Currency & rates",
  "settings.currency.helpDetail": "The base currency drives net-worth and report conversion (default CNY). The rate table and base currency live in the ledger directory (rates.json / ledger.json) and sync via iCloud with the desktop.",
  "settings.currency.loadFailed": "Failed to load currency settings: {{msg}}",
  "settings.currency.baseLabel": "Base currency",
  "settings.currency.baseSetRefreshing": "Base currency set to {{cur}}; refreshing rates in the background\u2026",
  "settings.currency.baseRefreshed": "Rates refreshed against new base {{cur}}",
  "settings.currency.setFailed": "Setting failed: {{msg}}",
  "settings.currency.ratesTableTitle": "Currency & rate table (\u2192 {{base}})",
  "settings.currency.saveRates": "Save rate table",
  "settings.currency.saved": "Saved",
  "settings.currency.noRates": "No currencies",
  "settings.currency.addBtn": "\uFF0B Add currency",
  "settings.currency.searchToAddPlaceholder": "Search currency to add",
  "settings.currency.errEmptyRows": "{{n}} row(s) have no currency; fill or delete them",
  "settings.currency.errInvalid": "Invalid currency (not an ISO 4217 code): {{list}}",
  "settings.currency.errBaseRow": "Base currency {{base}} needs no rate-table row; delete it",
  "settings.currency.errMissingRate": "These currencies lack a valid rate: {{list}}",
  "settings.currency.errDuplicates": "Duplicate currencies: {{list}}",
  "settings.currency.savedNotice": "Rate table saved",
  "settings.currency.autoRefreshLabel": "Auto-refresh rates (daily)",
  "settings.currency.refreshBtn": "Refresh rates",
  "settings.currency.refreshing": "Refreshing\u2026",
  "settings.currency.parseFailed": "Failed to parse response; existing rate table kept",
  "settings.currency.noCaredCurrency": "No relevant currencies in response; existing rate table kept",
  "settings.currency.refreshedN": "Refreshed {{n}} currency rates",
  "settings.currency.refreshFailed": "Refresh failed: {{msg}}",
  // KR7/task3: settings — recurring list/item/type/period (typeLabel reuses tx.type.*; refresh button reuses settings.refreshBtn)
  "settings.recurring.title": "Recurring rules",
  "settings.recurring.createBtn": "+ New rule",
  "settings.recurring.empty": "No recurring rules",
  "settings.recurring.active": "Active ({{n}})",
  "settings.recurring.inactiveSummary": "Paused ({{n}})",
  "settings.recurring.loadFailed": "Failed to load: {{msg}}",
  "settings.recurring.refreshedNotice": "Recurring rules refreshed",
  "settings.recurring.paused": "Paused",
  "settings.recurring.enabledNotice": "Enabled",
  "settings.recurring.nextPeriodLabel": "Next: ",
  "settings.recurring.viewTxAria": "View transactions generated by this rule",
  "settings.recurring.toggleFailed": "Action failed: {{msg}}",
  "settings.recurring.deleteConfirm": 'Delete recurring rule "{{name}}"? Already-generated transactions are kept.',
  "settings.recurring.deletedNotice": "Deleted",
  "settings.recurring.deleteFailed": "Delete failed: {{msg}}",
  "settings.recurring.monthlyDay": "Monthly on day {{day}}",
  "settings.recurring.weeklyDay": "Weekly on {{day}}",
  "settings.recurring.yearlyDay": "Yearly, month {{month}} day {{day}}",
  "settings.recurring.weekday.sun": "Sun",
  "settings.recurring.weekday.mon": "Mon",
  "settings.recurring.weekday.tue": "Tue",
  "settings.recurring.weekday.wed": "Wed",
  "settings.recurring.weekday.thu": "Thu",
  "settings.recurring.weekday.fri": "Fri",
  "settings.recurring.weekday.sat": "Sat",
  // KR7/task4: settings — category management (list/block/item/hidden/handler + 4 modals)
  "settings.category.expenseTitle": "Expense categories",
  "settings.category.expensePlaceholder": "e.g. Dining",
  "settings.category.expenseAdd": "+ New expense",
  "settings.category.incomeTitle": "Income categories",
  "settings.category.incomePlaceholder": "e.g. Salary",
  "settings.category.incomeAdd": "+ New income",
  "settings.category.loadFailed": "Failed to load: {{msg}}",
  "settings.category.emptyTitle": "No {{title}} yet",
  "settings.category.hiddenLabel": "Hidden",
  "settings.category.hiddenNote": "Hidden from the entry dropdown; historical transaction references are kept",
  "settings.category.addedNotice": 'Added category "{{name}}"',
  "settings.category.addFailed": "Add failed: {{msg}}",
  "settings.category.refreshedNotice": "{{title}} refreshed",
  "settings.category.renameAria": "Rename",
  "settings.category.renamedNotice": "Renamed; rewrote {{n}} historical txn(s)",
  "settings.category.renamedShort": "Renamed",
  "settings.category.renameFailed": "Rename failed: {{msg}}",
  "settings.category.mergeAria": "Merge into another category",
  "settings.category.mergeNoTargets": "No other same-type (expense/income) category to merge into",
  "settings.category.mergedNotice": "Merged; rewrote {{n}} historical txn(s)",
  "settings.category.mergedShort": "Merged",
  "settings.category.mergeFailed": "Merge failed: {{msg}}",
  "settings.category.deleteAria": "Delete category",
  "settings.category.deleteFailed": "Delete failed: {{msg}}",
  "settings.category.restoreBtn": "Restore",
  "settings.category.restoredNotice": 'Restored "{{name}}"',
  "settings.category.restoreFailed": "Restore failed: {{msg}}",
  "settings.category.purgeAria": "Permanently delete category",
  "settings.category.deleteConfirmUsed": 'Category "{{name}}" is used by {{n}} transaction(s); it will be hidden (historical transactions unaffected). Continue?',
  "settings.category.hiddenNotice": 'Hid "{{name}}"',
  "settings.category.purgeConfirm": 'Permanently delete category "{{name}}"?',
  "settings.category.deletedNotice": 'Deleted "{{name}}"',
  "settings.category.createTitle": "New {{title}}",
  "settings.category.renameTitle": "Rename category",
  "settings.category.mergeTitle": "Merge category",
  "settings.category.mergeIntro": 'All history of "{{name}}" will be rewritten into the target category; the source category will be deleted (irreversible)',
  "settings.category.mergeTargetPlaceholder": "Select target\u2026",
  "settings.category.mergeTargetHidden": "{{name}} (hidden)",
  "settings.category.mergeSubmitBtn": "Confirm merge",
  "settings.category.mergeErrNoTarget": "Please select a target category",
  "settings.category.mergeConfirmUsed": 'Rewrite {{n}} historical txn(s) to "{{target}}"; source category "{{from}}" will be deleted. Irreversible (auto-backed up).',
  "settings.category.mergeConfirmEmpty": 'Delete source category "{{from}}" (no historical transactions to rewrite). Irreversible.',
  // KR7/task4: settings — account-type management (card/group/disabled-area/footer + RegroupTypeModal)
  "settings.accountType.title": "Account type groups",
  "settings.accountType.resetBtn": "Reset to default",
  "settings.accountType.createTitle": "New group",
  "settings.accountType.deleteGroupConfirm": 'Delete group "{{label}}"? Its types move to "{{fallback}}".',
  "settings.accountType.firstRemainingGroup": "first remaining group",
  "settings.accountType.newGroupPlaceholder": "New group name",
  "settings.accountType.addGroupBtn": "\uFF0B Add group",
  "settings.accountType.inactiveSummary": "Disabled ({{n}})",
  "settings.accountType.enableBtn": "Enable",
  "settings.accountType.savedNotice": "Account types saved",
  "settings.accountType.loadFailed": "Failed to load account types: {{msg}}",
  "settings.accountType.refreshedNotice": "Account types refreshed",
  "settings.accountType.resetConfirm": "Reset groups to default only? Custom groups will be removed; their types move to the first default group. Account types are unchanged.",
  "settings.accountType.moveUpGroupAria": "Move group up",
  "settings.accountType.moveDownGroupAria": "Move group down",
  "settings.accountType.deleteGroupBtn": "Delete group",
  "settings.accountType.emptyGroup": "(empty group; move types here or delete it)",
  "settings.accountType.moveUpTypeAria": "Move type up",
  "settings.accountType.moveDownTypeAria": "Move type down",
  "settings.accountType.regroupBtn": "Regroup",
  "settings.accountType.regroupAria": "Move to another group",
  "settings.accountType.disableBtn": "Disable",
  "settings.accountType.regroupTitle": "Regroup",
  "settings.accountType.regroupIntro": 'Move "{{label}}" to:',
  // Account types card: rename + custom types
  "settings.accountTypes.title": "Account Types",
  "settings.accountTypes.createTitle": "New account type",
  "settings.accountTypes.resetConfirm": "Reset account types to default only? Custom types will be removed. Groups are unchanged.",
  "settings.accountTypes.newPlaceholder": "New type name",
  "settings.accountTypes.add": "\uFF0B Add type",
  "settings.accountTypes.delete": "Delete",
  "settings.accountTypes.deleteConfirm": 'Delete custom type "{{label}}"? Accounts of this type will show as unknown type; data is preserved.',
  "settings.accountTypes.accountCountTip": "{{active}} active / {{total}} total accounts",
  "accountKind.asset": "Asset",
  "accountKind.liability": "Liability",
  // err.* — core AppError error codes (both ends' formatError → t(code); codes in packages/core/src/errors.ts)
  "err.category.notFound": "Category not found",
  "err.category.nameEmpty": "Category name cannot be empty",
  "err.category.nameExists": "This name already exists. Use merge to combine instead.",
  "err.category.mergeFlowMismatch": "Can only merge into a category of the same flow (expense/income)",
  "err.batch.amountPositive": "Amount must be greater than 0",
  "err.batch.account": "Please select an account",
  "err.batch.category": "Please select a category",
  "err.batch.fromAccount": "Please select the source account",
  "err.batch.toAccount": "Please select the destination account",
  "err.batch.sameAccount": "Source and destination accounts cannot be the same",
  "err.batch.selfAccount": "Please select your account",
  "err.batch.person": "Please select the counterparty",
  "err.batch.direction": "Please select a loan direction",
  "err.loan.collectBalance": "Collection requires the counterparty to have a receivable balance (>0)",
  "err.loan.repayBalance": "Repayment requires the counterparty to have a payable balance (<0)",
  "err.ledger.nameEmpty": "Ledger name cannot be empty",
  "err.ledger.nameSeparator": "Ledger name cannot contain path separators",
  "err.ledger.nameReserved": "Ledger name cannot be a reserved word (. / .. / backups)",
  "err.ledger.nameExists": "Ledger name already exists",
  "err.recurring.idEmpty": "Rule id is required",
  "err.recurring.nameEmpty": "Rule name is required",
  "err.recurring.startDateEmpty": "Start date is required",
  "err.recurring.startDateInvalid": "Start date format is invalid",
  "err.recurring.endDateInvalid": "End date format is invalid",
  "err.recurring.endDateBeforeStart": "End date cannot be earlier than the start date",
  "err.recurring.maxRuns": "Max runs must be \u2265 1",
  "err.recurring.amountNegative": "Amount must be \u2265 0",
  "err.recurring.weeklyDay": "Weekly rules require a day of week (0-6)",
  "err.recurring.monthlyDay": "Monthly rules require a day of month (1-31)",
  "err.recurring.yearlyMonth": "Yearly rules require a month (1-12)",
  "err.recurring.yearlyDay": "Yearly rules require a day (1-31)",
  "err.recurring.unknownPeriod": "Unknown period type",
  "err.recurring.needAccount": "Expense/Income requires an account",
  "err.recurring.needCategory": "Expense/Income requires a category",
  "err.recurring.transferAccounts": "Transfer requires source and destination accounts",
  "err.recurring.transferSameAccount": "The two transfer accounts cannot be the same",
  "err.recurring.loanSelfAccount": "Loan requires your own account",
  "err.recurring.loanPerson": "Loan requires a counterparty",
  "err.recurring.loanDirection": "Loan requires a direction",
  "accountType.cash": "Cash",
  "accountType.savings": "Savings",
  "accountType.ewallet": "E-Wallet",
  "accountType.securities": "Securities",
  "accountType.fund": "Fund",
  "accountType.other-investment": "Other Investment",
  "accountType.fixed-asset": "Fixed Asset",
  "accountType.company": "Company",
  "accountType.person": "Lend/Borrow",
  "accountType.credit": "Credit Card",
  "accountType.loan": "Loan",
  "accountGroup.g-cash": "Cash",
  "accountGroup.g-investment": "Investments",
  "accountGroup.g-fixed-asset": "Fixed Assets",
  "accountGroup.g-company": "Company",
  "accountGroup.g-credit": "Credit",
  "adapter.err.folderExists": 'A directory named "{{name}}" already exists',
  "adapter.err.cannotDeleteActive": "Cannot delete the current ledger. Switch to another first.",
  "seed.account.cash": "Cash",
  "seed.account.savings": "Savings",
  "seed.account.ewallet": "E-Wallet",
  "seed.account.credit": "Credit Card",
  "seed.account.person": "Friend",
  "seed.category.dining": "Dining",
  "seed.category.shopping": "Shopping",
  "seed.category.transport": "Transport",
  "seed.category.home": "Home",
  "seed.category.fun": "Entertainment",
  "seed.category.medEdu": "Health & Edu",
  "seed.category.gift": "Gifts",
  "seed.category.misc": "Misc",
  "seed.category.other": "Other",
  "seed.category.salary": "Salary",
  "seed.category.investment": "Investment",
  "seed.category.refund": "Refund",
  "seed.category.adjust": "Balance Adjustment",
  "seed.sampleAlias": "Sample Ledger",
  "seed.note.groceries": "Groceries",
  "seed.note.salaryMonth": "Jan salary",
  "seed.note.transfer": "Transfer to e-wallet",
  "seed.note.shoppingClothes": "Online shopping",
  "seed.note.repayCard": "Repay credit card",
  "seed.note.lendFriend": "Lent to friend",
  "seed.note.investmentGain": "Investment gain",
  "seed.note.taxi": "Taxi home",
  // KR8/task28: loanSettle derived category names + writeoff note prefix (snapshot by locale at write time, mirrors desktop settle.*)
  "settle.cat.badDebt": "Bad Debt",
  "settle.cat.interest": "Interest",
  "settle.cat.gift": "Gift",
  "settle.cat.fee": "Fee",
  "settle.writeoffNotePrefix": "Settlement writeoff \xB7 ",
  // Diagnostic logs debug view (DiagLogModal)
  "diaglog.title": "Diagnostic logs",
  "diaglog.all": "All",
  "diaglog.search": "Search keyword",
  "diaglog.refresh": "Refresh",
  "diaglog.export": "Export",
  "diaglog.copy": "Copy",
  "diaglog.empty": "No logs yet",
  "diaglog.exportDone": "Exported",
  "diaglog.exportFail": "Export failed",
  "cmd.diaglog": "Diagnostic logs"
};
var en_default = en;

// src/i18n.ts
var dicts = { zh: zh_default, en: en_default };
var currentLocale = defaultLocale;
function resolveLocale(raw) {
  return isSupportedLocale(raw) ? raw : defaultLocale;
}
function setLocale(locale) {
  currentLocale = locale;
}
function getLocale() {
  return currentLocale;
}
function t(key, vars) {
  const fromCur = dicts[currentLocale]?.[key];
  const s = fromCur ?? dicts[defaultLocale][key] ?? key;
  if (!vars) return s;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => v == null ? acc : acc.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v)),
    s
  );
}
function formatError(e) {
  if (e instanceof AppError) {
    const s = t(e.code);
    return s === e.code ? e.message : s;
  }
  return e instanceof Error ? e.message : String(e);
}
function seedLabels() {
  return {
    accounts: {
      cash: t("seed.account.cash"),
      savings: t("seed.account.savings"),
      ewallet: t("seed.account.ewallet"),
      credit: t("seed.account.credit"),
      person: t("seed.account.person")
    },
    categories: {
      dining: t("seed.category.dining"),
      shopping: t("seed.category.shopping"),
      transport: t("seed.category.transport"),
      home: t("seed.category.home"),
      fun: t("seed.category.fun"),
      medEdu: t("seed.category.medEdu"),
      gift: t("seed.category.gift"),
      misc: t("seed.category.misc"),
      other: t("seed.category.other"),
      salary: t("seed.category.salary"),
      investment: t("seed.category.investment"),
      refund: t("seed.category.refund")
    },
    adjustCategory: t("seed.category.adjust"),
    sampleAlias: t("seed.sampleAlias"),
    sampleNotes: {
      groceries: t("seed.note.groceries"),
      salaryMonth: t("seed.note.salaryMonth"),
      transfer: t("seed.note.transfer"),
      shoppingClothes: t("seed.note.shoppingClothes"),
      repayCard: t("seed.note.repayCard"),
      lendFriend: t("seed.note.lendFriend"),
      investmentGain: t("seed.note.investmentGain"),
      taxi: t("seed.note.taxi")
    }
  };
}
function settlementLabels() {
  return {
    badDebt: t("settle.cat.badDebt"),
    interest: t("settle.cat.interest"),
    gift: t("settle.cat.gift"),
    fee: t("settle.cat.fee"),
    writeoffNotePrefix: t("settle.writeoffNotePrefix")
  };
}

// src/logger.ts
var MAX_ENTRIES = 1e3;
var FLUSH_MS = 2e3;
var DIR = "accounting-logs";
var FILE = "app.log";
var vault = null;
var logPath = null;
var buffer = [];
var flushTimer = null;
var verbose = false;
var degraded = false;
function initLogger(v) {
  vault = v;
  logPath = `${v.configDir}/${DIR}/${FILE}`;
}
function ts() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function formatLine(e) {
  const ctx = e.ctx ? ` ctx=${JSON.stringify(e.ctx)}` : "";
  return `${e.ts} ${e.level} [${e.scope}] ${e.msg}${ctx}`;
}
function scheduleFlush() {
  if (flushTimer || !vault || !logPath) return;
  flushTimer = setTimeout(() => {
    void flush();
  }, FLUSH_MS);
}
async function flush() {
  flushTimer = null;
  if (!vault || !logPath || buffer.length === 0) return;
  const text = buffer.map(formatLine).join("\n") + "\n";
  try {
    await vault.adapter.write(logPath, text);
  } catch {
    degraded = true;
  }
}
function push(level, scope, msg, ctx) {
  const entry = { ts: ts(), level: levelName(level), scope, msg, ctx: redactContext(ctx) };
  buffer.push(entry);
  if (buffer.length > MAX_ENTRIES) buffer = buffer.slice(-MAX_ENTRIES);
  const cmsg = `[${scope}] ${msg}`;
  if (level >= 40 /* Error */) console.error(cmsg);
  else if (level >= 30 /* Warn */) console.warn(cmsg);
  else console.log(cmsg);
  if (level >= 30 /* Warn */ || verbose) {
    scheduleFlush();
  }
}
var pluginLogger = {
  debug: (s, m, c) => push(10 /* Debug */, s, m, c),
  info: (s, m, c) => push(20 /* Info */, s, m, c),
  warn: (s, m, c) => push(30 /* Warn */, s, m, c),
  error: (s, m, c) => push(40 /* Error */, s, m, c)
};
async function readPluginLogText() {
  if (vault && logPath) {
    try {
      if (await vault.adapter.exists(logPath)) return await vault.adapter.read(logPath);
    } catch {
    }
  }
  return buffer.map(formatLine).join("\n");
}
async function exportPluginLog() {
  if (!vault) throw new Error("logger \u672A\u521D\u59CB\u5316");
  const text = await readPluginLogText();
  const out = `# accounting diagnostic log (plugin)
# platform=obsidian
# exported_at=${ts()}
# \u8131\u654F\uFF1A\u91D1\u989D/\u8D26\u6237\u540D/\u5907\u6CE8\u5DF2\u5C4F\u853D

${text}
`;
  const path = `${DIR}-export-${Date.now()}.log`;
  await vault.adapter.write(path, out);
  return path;
}

// src/dataAdapter.ts
function normalizeTxAmount(data) {
  return { ...data, amount: round2(data.amount) };
}
var ObsidianDataAdapter = class _ObsidianDataAdapter {
  constructor(vault2, dataSubdir, _plugin) {
    this.vault = vault2;
    this.dataSubdir = dataSubdir;
  }
  p(name) {
    return `${this.dataSubdir}/${name}`;
  }
  // 注意：所有文件读写一律走 vault.adapter（adapter.exists/read/write/mkdir/list），
  // 不用 vault.getAbstractFileByPath / TFile / vault.read 等索引 API——
  // Obsidian 的 vault 索引会过滤掉以 `.` 开头的隐藏目录（与 .obsidian 同类），
  // 用索引 API 读隐藏账本目录下的文件永远拿不到 TFile。
  async readFile(name) {
    const path = this.p(name);
    if (!await this.vault.adapter.exists(path)) return null;
    return this.vault.adapter.read(path);
  }
  async writeFile(name, content) {
    await this.ensureDir();
    await this.vault.adapter.write(this.p(name), content);
  }
  async ensureDir() {
    const parts = this.dataSubdir.split("/").filter(Boolean);
    let cur = "";
    for (const part of parts) {
      cur = cur ? `${cur}/${part}` : part;
      if (!await this.vault.adapter.exists(cur)) {
        try {
          await this.vault.adapter.mkdir(cur);
        } catch {
        }
      }
    }
  }
  async loadLog() {
    const text = await this.readFile("transactions.jsonl");
    if (text == null) return [];
    const events = [];
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const t2 = (lines[i] ?? "").trim();
      if (!t2) continue;
      try {
        events.push(JSON.parse(t2));
      } catch {
        pluginLogger.warn("adapter", "\u8DF3\u8FC7\u65E0\u6CD5\u89E3\u6790\u7684\u65E5\u5FD7\u884C", { line: i + 1 });
      }
    }
    return events;
  }
  async appendEvents(events) {
    if (events.length === 0) return;
    const path = this.p("transactions.jsonl");
    await this.ensureDir();
    const lines = events.map((e) => e.op === "upsert" ? JSON.stringify(normalizeTxAmount(e)) : JSON.stringify(e)).map((l) => l + "\n");
    const existing = await this.vault.adapter.exists(path) ? await this.vault.adapter.read(path) : "";
    await this.vault.adapter.write(path, existing + lines.join(""));
  }
  async replaceLog(events) {
    await this.ensureDir();
    const content = events.map((e) => JSON.stringify(e)).join("\n") + (events.length > 0 ? "\n" : "");
    await this.writeFile("transactions.jsonl", content);
  }
  async readMeta() {
    const accounts = await this.readJson("accounts.json");
    const categories = await this.readJson("categories.json");
    return { accounts: accounts ?? [], categories: categories ?? [] };
  }
  async writeMeta(meta) {
    await this.writeFile("accounts.json", JSON.stringify(meta.accounts, null, 2));
    await this.writeFile("categories.json", JSON.stringify(meta.categories, null, 2));
  }
  async readAccountTypeSettings() {
    return this.readJson("account-types.json");
  }
  async writeAccountTypeSettings(settings) {
    await this.writeFile("account-types.json", JSON.stringify(settings, null, 2));
  }
  async readRecurringRules() {
    const data = await this.readJson("recurring.json");
    if (!Array.isArray(data)) return [];
    return data;
  }
  async writeRecurringRules(rules) {
    await this.writeFile("recurring.json", JSON.stringify(rules, null, 2));
  }
  async readRates() {
    const data = await this.readJson("rates.json");
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    return data;
  }
  async writeRates(rates) {
    await this.writeFile("rates.json", JSON.stringify(rates, null, 2));
  }
  async readBaseCurrency() {
    const data = await this.readLedgerJson(this.dataSubdir);
    return data.baseCurrency ?? "CNY";
  }
  async writeBaseCurrency(base) {
    const existing = await this.readLedgerJson(this.dataSubdir);
    await this.vault.adapter.write(
      this.p("ledger.json"),
      JSON.stringify({ ...existing, baseCurrency: base }, null, 2)
    );
  }
  async readBackupConfig() {
    const data = await this.readLedgerJson(this.dataSubdir);
    return mergeBackupConfig(data);
  }
  async writeBackupConfig(config) {
    const existing = await this.readLedgerJson(this.dataSubdir);
    await this.vault.adapter.write(
      this.p("ledger.json"),
      JSON.stringify({ ...existing, ...config }, null, 2)
    );
  }
  async readLedgerPasswordMeta() {
    const data = await this.readLedgerJson(this.dataSubdir);
    return parseLedgerPasswordMeta(data);
  }
  /** 写入/清除任意账本（不必当前）的密码元数据（合并写 ledger.json，保留 alias 等）。meta=null 清三字段。 */
  async writeLedgerPasswordMetaAt(subdir, meta) {
    const existing = await this.readLedgerJson(subdir);
    const next = { ...existing };
    if (meta) {
      next["passwordHash"] = meta.passwordHash;
      next["passwordSalt"] = meta.passwordSalt;
      next["passwordUpdatedAt"] = meta.passwordUpdatedAt;
    } else {
      delete next["passwordHash"];
      delete next["passwordSalt"];
      delete next["passwordUpdatedAt"];
    }
    await this.vault.adapter.write(`${subdir}/ledger.json`, JSON.stringify(next, null, 2));
  }
  /** 读取任意账本（不必当前）的密码元数据，供切换器/设置页在切换前判定是否设密。未设密返回 null。 */
  async readLedgerPasswordMetaAt(subdir) {
    const data = await this.readLedgerJson(subdir);
    return parseLedgerPasswordMeta(data);
  }
  async writeLedgerPasswordMeta(meta) {
    const existing = await this.readLedgerJson(this.dataSubdir);
    const next = { ...existing };
    if (meta) {
      next["passwordHash"] = meta.passwordHash;
      next["passwordSalt"] = meta.passwordSalt;
      next["passwordUpdatedAt"] = meta.passwordUpdatedAt;
    } else {
      delete next["passwordHash"];
      delete next["passwordSalt"];
      delete next["passwordUpdatedAt"];
    }
    await this.vault.adapter.write(this.p("ledger.json"), JSON.stringify(next, null, 2));
  }
  async readRateConfig() {
    const data = await this.readJson("rate-config.json");
    if (!data || typeof data !== "object") return { ...DEFAULT_RATE_CONFIG };
    return {
      autoRefresh: typeof data.autoRefresh === "boolean" ? data.autoRefresh : void 0,
      lastSuccess: typeof data.lastSuccess === "string" ? data.lastSuccess : void 0
    };
  }
  async writeRateConfig(config) {
    await this.writeFile("rate-config.json", JSON.stringify(config, null, 2));
  }
  /** 读取账本 ledger.json；缺失/损坏返回 {}。含密码字段（供 readLedgerPasswordMeta 解析）。 */
  async readLedgerJson(subdir) {
    try {
      const content = await this.vault.adapter.read(`${subdir}/ledger.json`);
      const data = JSON.parse(content);
      return data && typeof data === "object" ? data : {};
    } catch {
      return {};
    }
  }
  async readJson(name) {
    const text = await this.readFile(name);
    if (text == null) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
  /** 创建时间戳快照（备份到当前账本的 backups/ 子目录） */
  async backup(label = "manual") {
    const backupsDir = `${this.dataSubdir}/backups`;
    if (!await this.vault.adapter.exists(backupsDir)) {
      await this.vault.adapter.mkdir(backupsDir);
    }
    const now = /* @__PURE__ */ new Date();
    const iso = now.toISOString();
    const timestamp = `${iso.slice(0, 10).replace(/-/g, "")}-${iso.slice(11, 19).replace(/:/g, "")}Z`;
    const backupName = `${label}-${timestamp}`;
    const backupPath = `${backupsDir}/${backupName}`;
    await this.vault.adapter.mkdir(backupPath);
    const files = ["transactions.jsonl", "accounts.json", "categories.json", "account-types.json", "recurring.json", "ledger.json", "rates.json", "rate-config.json"];
    for (const file of files) {
      const srcPath = `${this.dataSubdir}/${file}`;
      if (await this.vault.adapter.exists(srcPath)) {
        const content = await this.vault.adapter.read(srcPath);
        await this.vault.adapter.write(`${backupPath}/${file}`, content);
      }
    }
    const idx = await this.readBackupIndex();
    if (!idx.backups.includes(backupName)) {
      idx.backups.push(backupName);
      await this.writeBackupIndex(idx);
    }
    return backupPath;
  }
  newPersonAccount(name, currency = "CNY") {
    const now = nowISO();
    return {
      id: newAccountId(),
      name,
      type: "person",
      openingBalance: 0,
      currency,
      active: true,
      createdAt: now,
      updatedAt: now
    };
  }
  /** 扫描 vault 根目录，列出所有账本子目录。账本标记文件 4 选 1（与桌面端 scan_ledgers 对齐）：
   *  transactions.jsonl / accounts.json / categories.json / account-types.json。
   *  注意：必须用 vault.adapter.list 而非 getAbstractFileByPath/TFolder.children——
   *  Obsidian 的 vault 索引会过滤掉以 `.` 开头的隐藏目录（与 .obsidian 同类），遍历索引树看不到隐藏账本。 */
  async listLedgers() {
    const ledgers = [];
    let result;
    try {
      result = await this.vault.adapter.list("/");
    } catch {
      return [];
    }
    const MARKERS = ["transactions.jsonl", "accounts.json", "categories.json", "account-types.json"];
    for (const folder of result.folders) {
      if (folder.includes("/")) continue;
      if (folder === "." || folder === ".." || folder === "backups" || folder.includes("\\")) continue;
      const isLedger = await Promise.all(
        MARKERS.map((f) => this.vault.adapter.exists(`${folder}/${f}`))
      );
      if (isLedger.some(Boolean)) {
        ledgers.push(folder);
      }
    }
    return ledgers.sort();
  }
  /** 格式化账本名用于显示：去掉 `.` 前缀（隐藏目录标记） */
  static formatLedgerName(name) {
    if (name.startsWith(".")) {
      return name.slice(1);
    }
    return name;
  }
  /** 读取账本别名（可选，缺失则返回文件夹名） */
  async readLedgerAlias(subdir) {
    try {
      const ledgerJsonPath = `${subdir}/ledger.json`;
      const content = await this.vault.adapter.read(ledgerJsonPath);
      const data = JSON.parse(content);
      return data.alias || _ObsidianDataAdapter.formatLedgerName(subdir);
    } catch {
      return _ObsidianDataAdapter.formatLedgerName(subdir);
    }
  }
  /** 当前激活账本的别名（读 <dataSubdir>/ledger.json，缺失回退文件夹名） */
  async readActiveLedgerAlias() {
    return this.readLedgerAlias(this.dataSubdir);
  }
  /** 当前激活账本名（= dataSubdir，vault 根下的账本文件夹名） */
  get activeLedger() {
    return this.dataSubdir;
  }
  /** 列出所有备份（返回 [{ name, mtime, path }]，按 mtime 倒序）。
   *  优先读 backups/index.json 清单（可靠 read），绕过移动端隐藏目录下 adapter.list 不可靠的问题；
   *  index 缺失（老账本首次启用清单机制）时 fallback 到 adapter.list 并自愈写回；失效条目（目录被外部删除）顺手清理。 */
  async listBackups() {
    const backupsDir = `${this.dataSubdir}/backups`;
    const idx = await this.readBackupIndex();
    let names = idx.backups;
    if (!await this.vault.adapter.exists(this.backupsIndexPath())) {
      try {
        const result = await this.vault.adapter.list(backupsDir);
        names = result.folders.filter((f) => !f.includes("/"));
        if (names.length > 0) {
          await this.writeBackupIndex({ version: 1, backups: names });
        }
      } catch {
        return [];
      }
    }
    const backups = [];
    let dirty = false;
    for (const name of names) {
      const path = `${backupsDir}/${name}`;
      if (await this.vault.adapter.exists(path)) {
        backups.push({ name, path, mtime: this.parseBackupTimestamp(name) ?? 0 });
      } else {
        dirty = true;
      }
    }
    if (dirty) {
      await this.writeBackupIndex({ version: 1, backups: backups.map((b) => b.name) });
    }
    return backups.sort((a, b) => b.mtime - a.mtime);
  }
  /** 解析备份名中的时间戳（兼容插件旧版 YYYYMMDDTHHMMSSZ 与桌面端 YYYYMMDD-HHMMSSZ → epoch ms） */
  parseBackupTimestamp(name) {
    const m = name.match(/(\d{4})(\d{2})(\d{2})[T-](\d{2})(\d{2})(\d{2})Z/);
    if (!m || !m[1] || !m[2] || !m[3] || !m[4] || !m[5] || !m[6]) return null;
    const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
    const t2 = Date.parse(iso);
    return Number.isNaN(t2) ? null : t2;
  }
  /** backups/index.json 路径（备份清单文件，绕过移动端隐藏目录下 adapter.list 不可靠）。
   *  不参与 backup 复制 / restore 清空——两端写死的文件列表都不含 index.json。 */
  backupsIndexPath() {
    return `${this.dataSubdir}/backups/index.json`;
  }
  /** 读备份清单；缺失/损坏返回空清单（version 固定 1） */
  async readBackupIndex() {
    try {
      const content = await this.vault.adapter.read(this.backupsIndexPath());
      const data = JSON.parse(content);
      if (data && typeof data === "object" && Array.isArray(data.backups)) {
        return { version: 1, backups: data.backups.filter((n) => typeof n === "string") };
      }
    } catch {
    }
    return { version: 1, backups: [] };
  }
  /** 写备份清单（整文件覆盖；调用方须确保 backups/ 目录已存在） */
  async writeBackupIndex(idx) {
    await this.vault.adapter.write(
      this.backupsIndexPath(),
      JSON.stringify({ version: idx.version, backups: idx.backups }, null, 2)
    );
  }
  /** 恢复指定备份（恢复前自动创建 pre-restore 备份） */
  async restoreBackup(backupName) {
    await this.backup("pre-restore");
    const files = ["transactions.jsonl", "accounts.json", "categories.json", "account-types.json", "recurring.json", "ledger.json", "rates.json", "rate-config.json"];
    for (const file of files) {
      const path = `${this.dataSubdir}/${file}`;
      if (await this.vault.adapter.exists(path)) {
        await this.vault.adapter.remove(path);
      }
    }
    const backupPath = `${this.dataSubdir}/backups/${backupName}`;
    for (const file of files) {
      const srcPath = `${backupPath}/${file}`;
      const dstPath = `${this.dataSubdir}/${file}`;
      if (await this.vault.adapter.exists(srcPath)) {
        const content = await this.vault.adapter.read(srcPath);
        await this.vault.adapter.write(dstPath, content);
      }
    }
  }
  /** 删除备份目录 */
  async deleteBackup(backupName) {
    const backupPath = `${this.dataSubdir}/backups/${backupName}`;
    if (await this.vault.adapter.exists(backupPath)) {
      await this.vault.adapter.rmdir(backupPath, true);
    }
    const idx = await this.readBackupIndex();
    if (idx.backups.includes(backupName)) {
      idx.backups = idx.backups.filter((n) => n !== backupName);
      await this.writeBackupIndex(idx);
    }
  }
  /**
   * 新建账本：建目录 + backups/ + 写空 transactions.jsonl + 播种 accounts/categories（可选 alias）。
   * 走 vault.adapter 文件系统级 API（与 backup/restoreBackup 一致），与桌面端 createLedger 行为对齐。
   * 自动添加 `.` 前缀使目录隐藏，防止用户意外修改。
   * 返回实际创建的 folder 名（带 `.` 前缀），调用方应据此设置 dataSubdir。
   */
  async createLedger(name, alias) {
    const existing = await this.listLedgers();
    const err = validateLedgerName(name, existing);
    if (err) throw new Error(t(err));
    const folder = name.startsWith(".") ? name : `.${name}`;
    if (await this.vault.adapter.exists(folder)) {
      throw new Error(t("adapter.err.folderExists", { name: folder }));
    }
    await this.vault.adapter.mkdir(folder);
    await this.vault.adapter.mkdir(`${folder}/backups`);
    await this.vault.adapter.write(`${folder}/transactions.jsonl`, "");
    const seed = seedDefaults(seedLabels());
    await this.vault.adapter.write(
      `${folder}/accounts.json`,
      JSON.stringify(seed.accounts, null, 2)
    );
    await this.vault.adapter.write(
      `${folder}/categories.json`,
      JSON.stringify(seed.categories, null, 2)
    );
    await this.vault.adapter.write(
      `${folder}/rates.json`,
      JSON.stringify(seed.rates, null, 2)
    );
    if (alias && alias.trim()) {
      await this.vault.adapter.write(
        `${folder}/ledger.json`,
        JSON.stringify({ alias: alias.trim() }, null, 2)
      );
    }
    return folder;
  }
  /**
   * 新建示例账本：建目录 + backups/ + 写 seed 数据 + 写入示例交易事件。
   * 与桌面端 createSampleLedger 行为对齐。
   * 自动添加 `.` 前缀使目录隐藏，防止用户意外修改。
   */
  async createSampleLedger(name, alias) {
    const folder = name.startsWith(".") ? name : `.${name}`;
    if (await this.vault.adapter.exists(folder)) {
      throw new Error(t("adapter.err.folderExists", { name: _ObsidianDataAdapter.formatLedgerName(folder) }));
    }
    await this.vault.adapter.mkdir(folder);
    await this.vault.adapter.mkdir(`${folder}/backups`);
    await this.vault.adapter.write(`${folder}/transactions.jsonl`, "");
    const seed = seedSampleLedger(seedLabels());
    await this.vault.adapter.write(
      `${folder}/accounts.json`,
      JSON.stringify(seed.accounts, null, 2)
    );
    await this.vault.adapter.write(
      `${folder}/categories.json`,
      JSON.stringify(seed.categories, null, 2)
    );
    await this.vault.adapter.write(
      `${folder}/rates.json`,
      JSON.stringify(seed.rates, null, 2)
    );
    if (seed.events.length > 0) {
      await this.vault.adapter.write(
        `${folder}/transactions.jsonl`,
        seed.events.map((e) => JSON.stringify(e)).join("\n") + "\n"
      );
    }
    if (alias && alias.trim()) {
      await this.vault.adapter.write(
        `${folder}/ledger.json`,
        JSON.stringify({ alias: alias.trim() }, null, 2)
      );
    }
    return folder;
  }
  /** 写账本别名（仅改 ledger.json，不改文件夹名）。合并写入以保留 baseCurrency；空 alias 由 readLedgerAlias 回退到文件夹名。 */
  async writeLedgerAlias(name, alias) {
    const existing = await this.readLedgerJson(name);
    await this.vault.adapter.write(
      `${name}/ledger.json`,
      JSON.stringify({ ...existing, alias }, null, 2)
    );
  }
  /** 删除账本：递归删整目录（含 backups/）。基本名校验防穿越；当前账本禁删（adapter 层兜底）。 */
  async deleteLedger(name) {
    const n = name.trim();
    if (!n) throw new Error(t("err.ledger.nameEmpty"));
    if (n.includes("/") || n.includes("\\")) throw new Error(t("err.ledger.nameSeparator"));
    if (n === "." || n === ".." || n === "backups") throw new Error(t("err.ledger.nameReserved"));
    if (n === this.dataSubdir) throw new Error(t("adapter.err.cannotDeleteActive"));
    if (await this.vault.adapter.exists(n)) {
      await this.vault.adapter.rmdir(n, true);
    }
  }
  /** 检测并迁移 vault 根目录下所有非隐藏目录的账本到隐藏目录（重命名 ledger → .ledger）。
   *  返回 { migrated, failed }：migrated 为成功迁移的账本名列表（带 `.` 前缀），
   *  failed 为迁移失败的原始账本名（便于上层提示用户，避免静默吞错）。
   *
   *  用 vault.adapter.list 遍历而非索引树（getAbstractFileByPath/TFolder.children）——
   *  Obsidian 的 vault 索引会过滤掉以 `.` 开头的隐藏目录，迁移后再扫不到就漏迁或误判。 */
  async migrateLedgerDirs() {
    const migrated = [];
    const failed = [];
    let result;
    try {
      result = await this.vault.adapter.list("/");
    } catch {
      return { migrated, failed };
    }
    for (const folder of result.folders) {
      if (folder.includes("/")) continue;
      if (folder.startsWith(".") || folder === "backups" || folder.includes("\\")) continue;
      const txPath = `${folder}/transactions.jsonl`;
      if (await this.vault.adapter.exists(txPath)) {
        const newName = `.${folder}`;
        try {
          await this.vault.adapter.rename(folder, newName);
          migrated.push(newName);
        } catch (e) {
          console.error(`\u8FC1\u79FB\u5931\u8D25 ${folder} -> ${newName}:`, e);
          failed.push(folder);
        }
      }
    }
    return { migrated, failed };
  }
};

// src/accountGrouping.ts
var byName = (a, b) => a.name.localeCompare(b.name, "zh");
function displayTypeLabel2(type, storedLabel) {
  return displayTypeLabel(type, storedLabel, (key) => t(key));
}
function displayGroupLabel2(id, storedLabel) {
  return displayGroupLabel(id, storedLabel, (key) => t(key));
}
function fillAccountOptions(sel, accounts, value, includeHidden, settings, typeFilter) {
  const typeToGroup = new Map(settings.types.map((at) => [at.type, at.groupId]));
  const pool = accounts.filter((a) => typeFilter ? a.type === typeFilter : true);
  const active = pool.filter((a) => a.active).sort(byName);
  const hidden = includeHidden ? pool.filter((a) => !a.active).sort(byName) : [];
  const selectedAcc = value ? pool.find((a) => a.id === value) : void 0;
  if (selectedAcc && !selectedAcc.active && !includeHidden) {
    hidden.push(selectedAcc);
  }
  const groups = resolveTypeGroups(settings).map((g) => ({ label: displayGroupLabel2(g.id, g.label), items: active.filter((a) => typeToGroup.get(a.type) === g.id) })).filter((g) => g.items.length > 0);
  if (hidden.length > 0) groups.push({ label: t("account.hiddenGroup"), items: hidden });
  for (const g of groups) {
    const og = sel.createEl("optgroup", { attr: { label: g.label } });
    for (const a of g.items) {
      const o = og.createEl("option", { text: a.name });
      o.value = a.id;
      if (a.id === value) o.selected = true;
    }
  }
}

// src/helpDisclosure.ts
var activeHeaderHelp = null;
var headerHelpIdSeq = 0;
function closeHeaderHelp() {
  if (!activeHeaderHelp) return;
  activeHeaderHelp.detail.hidden = true;
  activeHeaderHelp.btn.classList.remove("is-open");
  activeHeaderHelp.btn.setAttribute("aria-expanded", "false");
  activeHeaderHelp = null;
  document.removeEventListener("click", closeHeaderHelp);
}
function appendHeaderHelp(parent, opts) {
  const wrap = parent.createDiv({ cls: `accounting-header-help${opts.cls ? " " + opts.cls : ""}` });
  const btn = wrap.createEl("button", { text: "?", cls: "accounting-help-tip-btn accounting-header-help-btn" });
  btn.type = "button";
  btn.setAttribute("aria-label", opts.ariaLabel ?? t("help.ariaLabel"));
  btn.setAttribute("aria-expanded", "false");
  const detailId = `accounting-header-help-${++headerHelpIdSeq}`;
  const detail = wrap.createEl("div", { text: opts.detail, cls: "accounting-header-help-detail" });
  detail.id = detailId;
  detail.hidden = true;
  btn.setAttribute("aria-controls", detailId);
  wrap.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  btn.onclick = (event) => {
    event.stopPropagation();
    if (activeHeaderHelp?.wrap === wrap) {
      closeHeaderHelp();
      return;
    }
    closeHeaderHelp();
    detail.hidden = false;
    btn.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    activeHeaderHelp = { wrap, btn, detail };
    document.addEventListener("click", closeHeaderHelp);
  };
  return wrap;
}

// src/createLedgerForm.ts
function renderCreateLedgerForm(container, existing, handlers, opts = {}) {
  container.empty();
  container.createEl("h2", { text: opts.title ?? t("ledger.create.title") });
  const nameInput = container.createEl("input", { type: "text", cls: "accounting-ledger-input" });
  nameInput.placeholder = t("ledger.create.namePlaceholder");
  nameInput.autofocus = true;
  const aliasInput = container.createEl("input", { type: "text", cls: "accounting-ledger-input" });
  aliasInput.placeholder = t("ledger.create.aliasPlaceholder");
  const errorEl = container.createEl("div", { cls: "accounting-ledger-error" });
  const actions = container.createDiv("accounting-modal-actions");
  const cancelBtn = actions.createEl("button", { text: opts.cancelText ?? t("common.cancel"), cls: "accounting-btn-secondary" });
  cancelBtn.onclick = () => handlers.onCancel();
  const submitBtn = actions.createEl("button", { text: opts.submitText ?? t("ledger.create.submitBtn"), cls: "accounting-btn-primary" });
  submitBtn.disabled = true;
  const update = () => {
    const err = validateLedgerName(nameInput.value, existing);
    errorEl.setText(err ? t(err) : "");
    submitBtn.disabled = err !== null || !nameInput.value.trim();
  };
  nameInput.oninput = update;
  submitBtn.onclick = async () => {
    const name = nameInput.value.trim();
    const alias = aliasInput.value.trim();
    const ok2 = await handlers.onSubmit(name, alias);
    if (!ok2) {
      update();
    }
  };
  update();
  setTimeout(() => nameInput.focus(), 0);
}

// src/settings.ts
var import_obsidian19 = require("obsidian");

// src/transactionListModal.ts
var import_obsidian8 = require("obsidian");

// src/batchModifyModal.ts
var import_obsidian2 = require("obsidian");

// src/dateField.ts
function formatDateFieldLabel(value, kind, placeholder) {
  if (!value) return placeholder ?? "";
  const locale = getLocale();
  if (kind === "date") return formatDateDisplay(value, locale);
  const date = value.slice(0, 10);
  const time = value.slice(11, 16);
  return time ? `${formatDateDisplay(date, locale)} ${time}` : formatDateDisplay(date, locale);
}
function createDateField(opts) {
  const wrap = document.createElement("div");
  wrap.addClass("accounting-datefield");
  if (opts.cls) {
    for (const c of opts.cls.split(/\s+/).filter(Boolean)) wrap.addClass(c);
  }
  const input = document.createElement("input");
  input.addClass("accounting-datefield-native");
  input.type = opts.kind;
  input.value = opts.value;
  wrap.appendChild(input);
  const label = wrap.createSpan({ cls: "accounting-datefield-label" });
  const render = () => {
    label.textContent = formatDateFieldLabel(input.value, opts.kind, opts.placeholder);
  };
  render();
  input.addEventListener("change", () => {
    render();
    opts.onChange(input.value);
  });
  input.addEventListener("input", render);
  input.addEventListener("click", () => {
    const el = input;
    try {
      el.showPicker?.();
    } catch {
    }
  });
  return wrap;
}

// src/keyboardAvoidance.ts
var import_obsidian = require("obsidian");
function bindKeyboardAvoidance(options) {
  const { rootEl, modalEl, mode } = options;
  const targetBottomRatio = options.targetBottomRatio ?? 0.45;
  const delayMs = options.delayMs ?? 320;
  let activeInput = null;
  let disposed = false;
  const reset = () => {
    if (mode === "transform") {
      modalEl.style.transform = "";
    } else {
      modalEl.style.top = "";
      modalEl.style.position = "";
    }
  };
  const isSmallScreen = () => import_obsidian.Platform.isMobile || window.innerWidth < 768;
  const isSoftKeyboardTarget = (el) => {
    if (el.tagName === "TEXTAREA") return true;
    return el.tagName === "INPUT" && el.type === "text";
  };
  const liftActive = () => {
    if (disposed || !isSmallScreen()) return;
    reset();
    const el = activeInput;
    if (!el) return;
    void modalEl.offsetWidth;
    const rect = el.getBoundingClientRect();
    const modalTop = modalEl.getBoundingClientRect().top;
    const targetBottom = window.innerHeight * targetBottomRatio;
    let shift = Math.max(0, Math.round(rect.bottom - targetBottom));
    shift = Math.min(shift, Math.max(0, modalTop));
    if (shift > 12) {
      if (mode === "transform") {
        modalEl.style.transform = `translateY(${-shift}px)`;
      } else {
        modalEl.style.position = "relative";
        modalEl.style.top = `${-shift}px`;
      }
      window.setTimeout(() => el.scrollIntoView({ block: "center" }), 30);
    }
  };
  const onFocusIn = (e) => {
    const el = e.target;
    if (!el || !isSoftKeyboardTarget(el)) return;
    activeInput = el;
    window.setTimeout(liftActive, delayMs);
  };
  const onFocusOut = () => {
    activeInput = null;
    window.setTimeout(liftActive, delayMs);
  };
  const onViewportResize = () => {
    if (activeInput) liftActive();
  };
  rootEl.addEventListener("focusin", onFocusIn);
  rootEl.addEventListener("focusout", onFocusOut);
  window.visualViewport?.addEventListener("resize", onViewportResize);
  return {
    reset,
    dispose() {
      if (disposed) return;
      disposed = true;
      rootEl.removeEventListener("focusin", onFocusIn);
      rootEl.removeEventListener("focusout", onFocusOut);
      window.visualViewport?.removeEventListener("resize", onViewportResize);
      activeInput = null;
      reset();
    }
  };
}

// src/batchModifyModal.ts
var TYPES = [
  { key: "expense", i18nKey: "tx.type.expense" },
  { key: "income", i18nKey: "tx.type.income" },
  { key: "transfer", i18nKey: "tx.type.transfer" },
  { key: "loan", i18nKey: "tx.type.loan" }
];
var BatchModifyModal = class extends import_obsidian2.Modal {
  constructor(app, adapter, transactions, baseUpdatedAtById, accounts, categories, accountTypeSettings, onDone) {
    super(app);
    this.adapter = adapter;
    this.transactions = transactions;
    this.baseUpdatedAtById = baseUpdatedAtById;
    this.accounts = accounts;
    this.categories = categories;
    this.accountTypeSettings = accountTypeSettings;
    this.onDone = onDone;
    this.originalType = this.transactions[0]?.type ?? "expense";
    this.state = {
      type: this.originalType,
      amount: "",
      account: "",
      category: "",
      fromAccount: "",
      toAccount: "",
      person: "",
      direction: "",
      ts: "",
      note: ""
    };
  }
  state;
  errorEl = null;
  fieldContainer = null;
  originalType;
  submitting = false;
  keyboardAvoidance;
  keyboardBound = false;
  onOpen() {
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian2.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("accounting-modal");
    this.renderView();
  }
  renderView() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: t("batch.title", { n: this.transactions.length }) });
    const hint = contentEl.createDiv({ cls: "accounting-batch-hint" });
    hint.createEl("div", { text: t("batch.hint") });
    const typeChanged = this.state.type !== this.originalType;
    if (typeChanged) {
      hint.createEl("div", {
        text: t("batch.typeChangedWarn"),
        cls: "accounting-batch-warn"
      });
    }
    this.renderTypePills(contentEl);
    this.fieldContainer = contentEl.createDiv({ cls: "accounting-batch-fields" });
    this.renderFields();
    this.errorEl = contentEl.createDiv({ cls: "accounting-error" });
    this.errorEl.style.display = "none";
    this.bindKeyboardAvoidance();
    const footer = contentEl.createDiv({ cls: "accounting-batch-footer" });
    const submitBtn = footer.createEl("button", {
      text: t("batch.submitBtn", { n: this.transactions.length }),
      cls: "accounting-btn-primary"
    });
    submitBtn.onclick = () => this.submit();
    const cancelBtn = footer.createEl("button", { text: t("common.cancel"), cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
  }
  renderTypePills(container) {
    const row = container.createDiv({ cls: "accounting-type-pills" });
    for (const tp of TYPES) {
      const active = this.state.type === tp.key;
      const pill = row.createEl("button", {
        text: t(tp.i18nKey),
        cls: `accounting-type-pill${active ? " accounting-type-pill-active" : ""}`
      });
      pill.onclick = () => {
        this.state.type = tp.key;
        this.renderView();
      };
    }
  }
  renderFields() {
    const fc = this.fieldContainer;
    if (!fc) return;
    fc.empty();
    const s = this.state;
    const typeChanged = s.type !== this.originalType;
    const keepHint = typeChanged ? t("account.selectPlaceholder") : t("batch.keepHint");
    this.addField(fc, t("entry.amount"), (wrap) => {
      const input = wrap.createEl("input", {
        type: "text",
        value: s.amount,
        cls: "accounting-input",
        attr: { placeholder: t("batch.keepHint"), inputmode: "decimal" }
      });
      input.oninput = () => {
        s.amount = input.value;
      };
    });
    if (s.type === "expense" || s.type === "income") {
      const cats = this.categories.filter((c) => c.flow === (s.type === "expense" ? "expense" : "income")).slice().sort((a, b) => a.name.localeCompare(b.name, "zh"));
      this.addField(fc, t("entry.field.account"), (wrap) => {
        const sel = wrap.createEl("select", { cls: "accounting-input" });
        sel.createEl("option", { text: keepHint }).value = "";
        fillAccountOptions(sel, this.accounts, s.account, false, this.accountTypeSettings);
        sel.onchange = () => {
          s.account = sel.value;
        };
      });
      this.addField(fc, t("entry.field.category"), (wrap) => {
        const sel = wrap.createEl("select", { cls: "accounting-input" });
        sel.createEl("option", { text: keepHint }).value = "";
        for (const c of cats) {
          const o = sel.createEl("option", { text: c.name });
          o.value = c.name;
          if (c.name === s.category) o.selected = true;
        }
        sel.onchange = () => {
          s.category = sel.value;
        };
      });
    } else if (s.type === "transfer") {
      this.addField(fc, t("entry.field.fromAccount"), (wrap) => {
        const sel = wrap.createEl("select", { cls: "accounting-input" });
        sel.createEl("option", { text: keepHint }).value = "";
        fillAccountOptions(sel, this.accounts, s.fromAccount, false, this.accountTypeSettings);
        sel.onchange = () => {
          s.fromAccount = sel.value;
        };
      });
      this.addField(fc, t("entry.field.toAccount"), (wrap) => {
        const sel = wrap.createEl("select", { cls: "accounting-input" });
        sel.createEl("option", { text: keepHint }).value = "";
        fillAccountOptions(sel, this.accounts, s.toAccount, false, this.accountTypeSettings);
        sel.onchange = () => {
          s.toAccount = sel.value;
        };
      });
    } else if (s.type === "loan") {
      this.addField(fc, t("entry.field.direction"), (wrap) => {
        const sel = wrap.createEl("select", { cls: "accounting-input" });
        sel.createEl("option", { text: keepHint }).value = "";
        const lend = sel.createEl("option", { text: t("entry.direction.lend") });
        lend.value = "lend";
        const borrow = sel.createEl("option", { text: t("entry.direction.borrow") });
        borrow.value = "borrow";
        if (s.direction === "lend") lend.selected = true;
        if (s.direction === "borrow") borrow.selected = true;
        sel.onchange = () => {
          s.direction = sel.value;
        };
      });
      this.addField(fc, t("entry.field.selfAccount"), (wrap) => {
        const sel = wrap.createEl("select", { cls: "accounting-input" });
        sel.createEl("option", { text: keepHint }).value = "";
        fillAccountOptions(sel, this.accounts, s.account, false, this.accountTypeSettings);
        sel.onchange = () => {
          s.account = sel.value;
        };
      });
      this.addField(fc, t("batch.field.personAccount"), (wrap) => {
        const sel = wrap.createEl("select", { cls: "accounting-input" });
        sel.createEl("option", { text: keepHint }).value = "";
        for (const a of this.accounts.filter((a2) => a2.type === "person" && a2.active).slice().sort((a2, b) => a2.name.localeCompare(b.name, "zh"))) {
          const o = sel.createEl("option", { text: a.name });
          o.value = a.id;
          if (a.id === s.person) o.selected = true;
        }
        sel.onchange = () => {
          s.person = sel.value;
        };
      });
    }
    this.addField(fc, t("entry.field.ts"), (wrap) => {
      wrap.appendChild(createDateField({
        kind: "datetime-local",
        value: s.ts,
        cls: "accounting-input",
        onChange: (iso) => {
          s.ts = iso;
        }
      }));
    });
    this.addField(fc, t("entry.field.note"), (wrap) => {
      const ta = wrap.createEl("textarea", { cls: "accounting-input" });
      ta.value = s.note;
      ta.setAttr("rows", "2");
      ta.oninput = () => {
        s.note = ta.value;
      };
    });
  }
  addField(container, label, renderControl) {
    const wrap = container.createDiv({ cls: "accounting-batch-field" });
    wrap.createEl("div", { text: label, cls: "accounting-batch-field-label" });
    renderControl(wrap);
  }
  showError(msg) {
    if (!this.errorEl) return;
    this.errorEl.setText(msg);
    this.errorEl.style.display = "";
  }
  buildPatch() {
    const s = this.state;
    const patch = {};
    const typeChanged = s.type !== this.originalType;
    if (typeChanged) patch.type = s.type;
    if (s.amount.trim() !== "") {
      const amt = evaluateAmount(s.amount);
      if (!amt.ok || amt.value <= 0) {
        this.showError(t("batch.err.amount"));
        return null;
      }
      patch.amount = round2(amt.value);
    }
    if (s.account) patch.account = s.account;
    if (s.category) patch.category = s.category;
    if (s.fromAccount) patch.fromAccount = s.fromAccount;
    if (s.toAccount) patch.toAccount = s.toAccount;
    if (s.person) patch.person = s.person;
    if (s.direction) patch.direction = s.direction;
    if (s.ts) {
      const iso = datetimeLocalToISOStrict(s.ts);
      if (!iso) {
        this.showError(t("batch.err.tsFormat"));
        return null;
      }
      patch.ts = iso;
    }
    if (s.note.trim() !== "") patch.note = s.note.trim();
    if (Object.keys(patch).length === 0) {
      this.showError(t("batch.err.empty"));
      return null;
    }
    if (typeChanged) {
      if (s.type === "expense" || s.type === "income") {
        if (!s.account) {
          this.showError(t("batch.err.tcAccount"));
          return null;
        }
        if (!s.category) {
          this.showError(t("batch.err.tcCategory"));
          return null;
        }
      } else if (s.type === "transfer") {
        if (!s.fromAccount) {
          this.showError(t("batch.err.tcFromAccount"));
          return null;
        }
        if (!s.toAccount) {
          this.showError(t("batch.err.tcToAccount"));
          return null;
        }
        if (s.fromAccount === s.toAccount) {
          this.showError(t("entry.err.sameAccount"));
          return null;
        }
      } else if (s.type === "loan") {
        if (!s.account) {
          this.showError(t("batch.err.tcSelfAccount"));
          return null;
        }
        if (!s.person) {
          this.showError(t("batch.err.tcPerson"));
          return null;
        }
        if (!s.direction) {
          this.showError(t("batch.err.tcDirection"));
          return null;
        }
      }
    }
    return patch;
  }
  async submit() {
    if (this.submitting) return;
    const patch = this.buildPatch();
    if (!patch) return;
    this.submitting = true;
    try {
      await this.adapter.backup("pre-batch-modify");
      const fresh = await this.adapter.loadLog();
      const latestUpdatedAt = latestUpdatedAtById(fresh);
      for (const tx of this.transactions) {
        const current = latestUpdatedAt.get(tx.id);
        const base = this.baseUpdatedAtById.get(tx.id) ?? "";
        if (hasUpdatedSince(current, base)) {
          new import_obsidian2.Notice(t("txList.concurrencyConflict"));
          this.onDone();
          this.close();
          return;
        }
      }
      const folded = foldEvents(fresh);
      const ids = this.transactions.map((tx) => tx.id);
      const { events } = buildBatchUpsertEvents({
        folded,
        ids,
        patch,
        latestUpdatedAtById: latestUpdatedAt,
        now: nowISO()
      });
      if (events.length > 0) {
        await this.adapter.appendEvents(events);
      }
      new import_obsidian2.Notice(t("batch.updatedN", { n: events.length }));
      this.onDone();
      this.close();
    } catch (e) {
      const msg = t("batch.failed", { msg: formatError(e) });
      this.showError(msg);
      new import_obsidian2.Notice(msg);
    } finally {
      this.submitting = false;
    }
  }
  onClose() {
    this.keyboardAvoidance?.dispose();
    this.keyboardAvoidance = void 0;
    this.contentEl.empty();
  }
  bindKeyboardAvoidance() {
    if (this.keyboardBound) return;
    this.keyboardBound = true;
    this.keyboardAvoidance = bindKeyboardAvoidance({
      rootEl: this.contentEl,
      modalEl: this.modalEl,
      mode: "top"
    });
  }
};

// src/navBar.ts
var import_obsidian3 = require("obsidian");
function navIndex(p) {
  switch (p) {
    case "entry":
      return 0;
    case "list":
    case "detail":
      return 1;
    case "balance":
      return 2;
    case "report":
      return 3;
    case "settings":
      return 4;
  }
}
function slideDirection(from, to) {
  return navIndex(to) >= navIndex(from) ? "right" : "left";
}
function prepareModalContainer(container) {
  container.addClass("accounting-app");
  container.style.transition = "none";
  container.style.animation = "none";
  container.style.transform = "none";
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.width = "100vw";
  container.style.height = "100vh";
  container.style.maxWidth = "100vw";
  container.style.maxHeight = "100vh";
  container.style.overflow = "hidden";
  const modalEl = container.querySelector(".modal");
  if (modalEl) {
    const m = modalEl;
    m.style.transition = "none";
    m.style.animation = "none";
    m.style.transform = "none";
    m.style.width = "100vw";
    m.style.height = "100vh";
    m.style.maxWidth = "100vw";
    m.style.maxHeight = "100vh";
    m.style.borderRadius = "0";
    m.style.margin = "0";
    m.style.overflow = "hidden";
  }
}
function slideClass(slide) {
  if (!slide) return void 0;
  return slide === "right" ? "accounting-slide-right" : "accounting-slide-left";
}
function presetModalChrome(modalEl, containerEl) {
  modalEl.addClass("accounting-fullscreen");
  if (!import_obsidian3.Platform.isMobile) modalEl.addClass("accounting-desktop");
  containerEl.addClass("accounting-app");
  const m = modalEl;
  const c = containerEl;
  m.style.animation = "none";
  m.style.transition = "none";
  c.style.animation = "none";
  c.style.transition = "none";
}
function renderNavBar(container, current, ctx, closeSelf) {
  container.querySelectorAll(".accounting-nav-bar").forEach((el) => el.remove());
  const bar = container.createDiv({ cls: "accounting-nav-bar" });
  const items = [
    // 切换一律「先开新页、后关旧页」：关旧页统一推迟到新页 onOpen（onOpened 回调），此时新容器已全屏化（遮罩铺满），
    // 旧页在下层 detach 不露底层。移动端 Modal.open 非同步挂载，若 open 后立即 closeSelf 会在新页挂载前露底。
    { label: t("nav.entry"), icon: "pencil", page: "entry", run: (s) => {
      ctx.openEntry(s, closeSelf);
    } },
    { label: t("nav.list"), icon: "list", page: "list", run: (s) => {
      ctx.openList(void 0, s, void 0, void 0, void 0, closeSelf);
    } },
    { label: t("nav.accounts"), icon: "wallet", page: "balance", run: (s) => {
      ctx.openBalance(s, closeSelf);
    } },
    { label: t("nav.dashboard"), icon: "bar-chart-2", page: "report", run: (s) => {
      ctx.openReport(s, closeSelf);
    } },
    { label: t("nav.settings"), icon: "settings", page: "settings", run: (s) => {
      ctx.openSettings(s, closeSelf);
    } }
  ];
  for (const it of items) {
    const isCurrent = it.page !== void 0 && it.page === current;
    const btn = bar.createEl("button", {
      cls: `accounting-nav-btn${isCurrent ? " accounting-nav-current" : ""}`
    });
    (0, import_obsidian3.setIcon)(btn, it.icon);
    btn.createSpan({ text: it.label });
    if (isCurrent) {
      btn.disabled = true;
    } else {
      btn.onclick = () => it.run(it.page ? slideDirection(current, it.page) : void 0);
    }
  }
  return bar;
}
function renderBackBtn(container, onClose) {
  container.querySelectorAll(".accounting-back-btn").forEach((el) => el.remove());
  const btn = container.createEl("button", { text: t("nav.back"), cls: "accounting-back-btn" });
  btn.onclick = () => onClose();
  return btn;
}
function renderNavOrBack(container, page, navCtx, closeSelf, drillDown) {
  if (drillDown) renderBackBtn(container, closeSelf);
  else if (navCtx) renderNavBar(container, page, navCtx, closeSelf);
}

// src/transactionDetailModal.ts
var import_obsidian7 = require("obsidian");

// src/entryModal.ts
var import_obsidian6 = require("obsidian");

// src/settlement.ts
async function ensureCategories(adapter, accounts, categories, items) {
  const { next, changed } = mergeEnsureCategories(categories, items);
  if (!changed) return categories;
  await adapter.writeMeta({ accounts, categories: next });
  return next;
}
async function saveSettlement(adapter, accounts, categories, input) {
  const labels = settlementLabels();
  const outcome = deriveSettlementDiff(input.outstanding, input.paid, input.direction, labels);
  if (outcome.kind === "writeoff") {
    await ensureCategories(adapter, accounts, categories, [{ flow: outcome.type, name: outcome.category }]);
  }
  const { events } = buildSettlementEvents({
    outcome,
    collect: input.collect,
    now: nowISO(),
    baseUpdatedAtById: /* @__PURE__ */ new Map(),
    writeoffNotePrefix: labels.writeoffNotePrefix
  });
  await adapter.appendEvents(events);
}

// src/calculatorKeypad.ts
var KEYS = [
  { label: "\u232B", act: "back", cls: "accounting-calc-key--util" },
  { label: "C", act: "clear", cls: "accounting-calc-key--util" },
  { label: "%", act: "append", ch: "%" },
  { label: "\xF7", act: "append", ch: "\xF7", cls: "accounting-calc-key--op" },
  { label: "7", act: "append", ch: "7" },
  { label: "8", act: "append", ch: "8" },
  { label: "9", act: "append", ch: "9" },
  { label: "\xD7", act: "append", ch: "\xD7", cls: "accounting-calc-key--op" },
  { label: "4", act: "append", ch: "4" },
  { label: "5", act: "append", ch: "5" },
  { label: "6", act: "append", ch: "6" },
  { label: "\u2212", act: "append", ch: "\u2212", cls: "accounting-calc-key--op" },
  { label: "1", act: "append", ch: "1" },
  { label: "2", act: "append", ch: "2" },
  { label: "3", act: "append", ch: "3" },
  { label: "+", act: "append", ch: "+", cls: "accounting-calc-key--op" },
  { label: "+/-", act: "sign", cls: "accounting-calc-key--util" },
  { label: "0", act: "append", ch: "0" },
  { label: ".", act: "append", ch: "." },
  { label: "\u5B8C\u6210", act: "equals", i18nKey: "keypad.done", cls: "accounting-calc-key--eq" }
];
function hasOperator(v) {
  return /[+×÷*/%]/.test(v) || v.slice(1).includes("-") || v.slice(1).includes("\u2212");
}
function mountCalculatorKeypad(host, h) {
  host.empty();
  host.addClass("accounting-calc-host");
  const preview = host.createDiv({ cls: "accounting-calc-preview" });
  const grid = host.createDiv({ cls: "accounting-calc-grid" });
  function renderPreview() {
    const v = h.getValue();
    const r = evaluateAmount(v);
    preview.setText(r.ok && v.trim() !== "" && hasOperator(v) ? "= " + String(round2(r.value)) : "");
  }
  function press(k) {
    const v = h.getValue();
    let next = v;
    let shouldClose = false;
    if (k.act === "clear") next = "";
    else if (k.act === "back") next = v.slice(0, -1);
    else if (k.act === "append") next = v + (k.ch ?? "");
    else if (k.act === "sign") next = v.startsWith("-") ? v.slice(1) : "-" + v;
    else if (k.act === "equals") {
      const r = evaluateAmount(v);
      if (v.trim() === "") {
        shouldClose = true;
      } else if (r.ok && r.value > 0) {
        next = String(round2(r.value));
        shouldClose = true;
      } else {
        preview.empty();
        preview.createEl("span", { text: t("keypad.error"), cls: "accounting-calc-preview-error" });
        h.onError?.();
        return;
      }
    }
    if (next !== v) {
      h.onChange(next);
      renderPreview();
    }
    if (shouldClose) h.onClose?.();
  }
  for (const k of KEYS) {
    const btn = grid.createEl("button", { cls: `accounting-calc-key ${k.cls ?? ""}`.trim() });
    btn.type = "button";
    btn.setText(k.i18nKey ? t(k.i18nKey) : k.label);
    btn.addEventListener("click", () => press(k));
  }
  renderPreview();
}

// src/swipeTabs.ts
var import_obsidian4 = require("obsidian");
function decideSwipe(dx, dy, dt, opts) {
  const minDistance = opts?.minDistance ?? 60;
  const maxDuration = opts?.maxDuration ?? 700;
  const ratio = opts?.horizontalRatio ?? 1.7;
  if (dt > maxDuration) return null;
  if (Math.abs(dx) < minDistance) return null;
  if (Math.abs(dx) <= Math.abs(dy) * ratio) return null;
  return dx < 0 ? "next" : "prev";
}
function bindSwipeTabs(opts) {
  const { host, onNext, onPrev } = opts;
  if (!import_obsidian4.Platform.isMobile) {
    return { dispose() {
    } };
  }
  let startX = 0;
  let startY = 0;
  let startT = 0;
  let armed = false;
  const inHorizontalScroll = (target) => {
    let node = target instanceof HTMLElement ? target : null;
    while (node && node !== host) {
      const st = getComputedStyle(node);
      const ox = st.overflowX;
      if ((ox === "auto" || ox === "scroll") && node.scrollWidth > node.clientWidth + 1) {
        return true;
      }
      node = node.parentElement;
    }
    return false;
  };
  const onStart = (e) => {
    if (e.touches.length !== 1) {
      armed = false;
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    startX = touch.clientX;
    startY = touch.clientY;
    startT = Date.now();
    armed = !inHorizontalScroll(e.target);
  };
  const onEnd = (e) => {
    if (!armed) return;
    armed = false;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dir = decideSwipe(
      touch.clientX - startX,
      touch.clientY - startY,
      Date.now() - startT,
      opts
    );
    if (dir === "next") onNext();
    else if (dir === "prev") onPrev();
  };
  host.addEventListener("touchstart", onStart, { passive: true });
  host.addEventListener("touchend", onEnd);
  return {
    dispose() {
      host.removeEventListener("touchstart", onStart);
      host.removeEventListener("touchend", onEnd);
    }
  };
}

// src/ledgerHeader.ts
var import_obsidian5 = require("obsidian");
var LedgerSwitchModal = class extends import_obsidian5.Modal {
  constructor(app, current, ledgers, onPick) {
    super(app);
    this.current = current;
    this.ledgers = ledgers;
    this.onPick = onPick;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-ledger-switch-modal");
    this.modalEl.addClass("accounting-sub-modal");
    contentEl.createEl("h2", { text: t("entry.switchLedger") });
    if (this.ledgers.length === 0) {
      contentEl.createEl("p", { text: t("entry.switchLedgerEmpty"), cls: "accounting-ledger-empty" });
      const emptyCloseWrap = contentEl.createDiv({ cls: "accounting-modal-close" });
      const emptyClose = emptyCloseWrap.createEl("button", { text: t("common.close"), cls: "accounting-btn-secondary" });
      emptyClose.onclick = () => this.close();
      return;
    }
    const card = contentEl.createDiv({ cls: "accounting-ledger-card" });
    if (!this.ledgers.some((l) => l.name === this.current)) {
      card.createEl("p", { text: t("entry.switchLedgerNoneCurrent"), cls: "accounting-ledger-empty" });
    }
    const list = card.createDiv({ cls: "accounting-ledger-list" });
    for (const { name, alias } of this.ledgers) {
      const isCurrent = name === this.current;
      const item = list.createDiv({ cls: "accounting-ledger-item" });
      if (isCurrent) {
        item.classList.add("accounting-ledger-current");
      } else {
        item.classList.add("accounting-ledger-pickable");
      }
      const info = item.createDiv({ cls: "accounting-ledger-info" });
      info.createEl("div", { text: alias, cls: "accounting-ledger-name" });
      info.createEl("div", { text: ObsidianDataAdapter.formatLedgerName(name), cls: "accounting-ledger-folder" });
      if (isCurrent) {
        item.createEl("span", { text: t("entry.switchLedgerCurrent"), cls: "accounting-ledger-badge" });
      } else {
        item.createEl("span", { text: "\u203A", cls: "accounting-ledger-chevron" });
        item.onclick = () => {
          this.close();
          this.onPick(name);
        };
      }
    }
    const closeWrap = contentEl.createDiv({ cls: "accounting-modal-close" });
    const closeBtn = closeWrap.createEl("button", { text: t("common.close"), cls: "accounting-btn-secondary" });
    closeBtn.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};
function mountLedgerPill(modalEl, app, adapter, alias, onPick) {
  const pill = modalEl.createDiv({ cls: "accounting-entry-ledger accounting-entry-ledger-clickable" });
  pill.createEl("span", { cls: "accounting-entry-ledger-name", text: alias });
  pill.createEl("span", { cls: "accounting-entry-ledger-caret", text: "\u25BE" });
  pill.onclick = async () => {
    try {
      const names = await adapter.listLedgers();
      const ledgers = await Promise.all(
        names.map(async (name) => ({ name, alias: await adapter.readLedgerAlias(name) }))
      );
      new LedgerSwitchModal(app, adapter.activeLedger, ledgers, onPick).open();
    } catch {
    }
  };
  return pill;
}

// src/entryModal.ts
var TYPES2 = [
  { key: "expense", i18nKey: "tx.type.expense" },
  { key: "income", i18nKey: "tx.type.income" },
  { key: "transfer", i18nKey: "tx.type.transfer" },
  { key: "loan", i18nKey: "tx.type.loan" }
];
var WEEKDAYS = [
  { i18nKey: "entry.weekday.sun" },
  { i18nKey: "entry.weekday.mon" },
  { i18nKey: "entry.weekday.tue" },
  { i18nKey: "entry.weekday.wed" },
  { i18nKey: "entry.weekday.thu" },
  { i18nKey: "entry.weekday.fri" },
  { i18nKey: "entry.weekday.sat" }
];
function flashAmountError(el) {
  let n = 0;
  el.classList.remove("accounting-amount-error");
  const iv = window.setInterval(() => {
    el.classList.toggle("accounting-amount-error");
    if (++n >= 6) {
      window.clearInterval(iv);
      el.classList.remove("accounting-amount-error");
    }
  }, 160);
}
var EntryModal = class extends import_obsidian6.Modal {
  constructor(app, adapter, accounts, categories, onSubmitted, initialTx, isCopy = true, navCtx, slide, onSwitchLedger, recurring, onRecurringSaved, onOpened) {
    super(app);
    this.adapter = adapter;
    this.accounts = accounts;
    this.categories = categories;
    this.onSubmitted = onSubmitted;
    this.navCtx = navCtx;
    this.slide = slide;
    this.onSwitchLedger = onSwitchLedger;
    this.recurring = recurring;
    this.onRecurringSaved = onRecurringSaved;
    this.onOpened = onOpened;
    this.isCopy = isCopy;
    this.originalTxId = initialTx?.id;
    this.state = initialTx ? this.txToState(initialTx) : {
      type: "expense",
      amount: "",
      account: "",
      category: "",
      fromAccount: "",
      toAccount: "",
      person: "",
      direction: "lend",
      settle: false,
      ts: nowDatetimeLocal(),
      note: "",
      toAmount: "",
      rate: "",
      personCurrency: "CNY"
    };
    this.recurringMode = this.recurring ? this.recurring.editing ? "edit" : "create" : "none";
    this.repeatLocked = this.recurringMode !== "none";
    this.repeatOn = this.repeatLocked;
    if (this.recurring?.editing) {
      const rule = this.recurring.editing;
      this.state = this.ruleToEntryState(rule);
      this.schedule = ruleToSchedule(rule);
      if (this.state.direction === "collect" || this.state.direction === "repay") this.state.direction = "lend";
    } else {
      this.schedule = defaultSchedule(todayDateInput());
    }
  }
  state;
  errorEl;
  fieldContainer;
  typeRow;
  addingPerson = false;
  isCopy;
  originalTxId;
  accountTypeSettings = defaultAccountTypeSettings();
  transactions = [];
  /** balances 缓存：transactions/accounts 引用不变则复用，避免每次 rerender 重算（账户余额提示与 outstanding 共享同一份）。 */
  balancesCache = null;
  settlePreviewEl = null;
  fromNoteHintEl = null;
  keyboardAvoidance;
  /** 移动端左右轻扫切顶部交易类型 tab；onOpen 绑定、onClose 解绑。 */
  swipeTabs;
  /** 详情编辑/复制下钻聚焦模式：右下角「‹ 返回」回详情、隐藏 ✕（与周期账聚焦模式同机制）；
   *  由 TransactionDetailModal.openEntry 在 open() 前置 true。 */
  drillDown = false;
  opened = false;
  closing = false;
  calcOpen = false;
  amountInputEl = null;
  keypadHostEl = null;
  recurringMode = "none";
  repeatLocked = false;
  repeatOn = false;
  schedule;
  /** 本位币（默认 CNY）与汇率表（当前汇率），onOpen 时从账本读取，供外币录入预填与折算口径 */
  baseCurrency = "CNY";
  rates = {};
  txToState(tx) {
    return {
      type: tx.type,
      amount: String(tx.amount),
      account: tx.account || "",
      category: tx.category || "",
      fromAccount: tx.fromAccount || "",
      toAccount: tx.toAccount || "",
      person: tx.person || "",
      direction: tx.direction ?? "lend",
      settle: false,
      ts: isoToDatetimeLocal(tx.ts),
      note: tx.note || "",
      toAmount: tx.toAmount != null ? String(round2(tx.toAmount)) : "",
      rate: tx.rate != null ? String(tx.rate) : "",
      personCurrency: "CNY"
    };
  }
  ruleToEntryState(rule) {
    return {
      type: rule.type,
      amount: String(rule.amount),
      account: rule.account || "",
      category: rule.category || "",
      fromAccount: rule.fromAccount || "",
      toAccount: rule.toAccount || "",
      person: rule.person || "",
      direction: rule.direction ?? "lend",
      settle: false,
      ts: `${rule.startDate}T00:00`,
      note: rule.note || "",
      toAmount: "",
      rate: rule.rate != null ? String(rule.rate) : "",
      personCurrency: "CNY"
    };
  }
  /** 在挂载到 DOM 前就预设全屏类与禁用 Obsidian 默认 modal-pop 动画，避免「先上跳再滑入」。 */
  open() {
    presetModalChrome(this.modalEl, this.containerEl);
    super.open();
  }
  async onOpen() {
    this.opened = true;
    prepareModalContainer(this.containerEl);
    this.modalEl.addClass("accounting-fullscreen");
    this.onOpened?.();
    if (this.recurringMode !== "none" || this.drillDown) this.modalEl.addClass("accounting-drilldown");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("accounting-entry-modal");
    const sc = slideClass(this.slide);
    if (sc) contentEl.addClass(sc);
    renderNavOrBack(this.modalEl, "entry", this.navCtx, () => this.close(), this.recurringMode !== "none" || this.drillDown);
    if (this.onSwitchLedger) {
      const ledgerAlias = await this.adapter.readActiveLedgerAlias();
      mountLedgerPill(this.modalEl, this.app, this.adapter, ledgerAlias, (name) => {
        this.onSwitchLedger?.(name, () => this.close());
      });
      contentEl.addClass("accounting-has-ledger-pill");
    }
    const storedTypes = await this.adapter.readAccountTypeSettings();
    this.accountTypeSettings = storedTypes ? normalizeAccountTypeSettings(storedTypes) : defaultAccountTypeSettings();
    this.transactions = foldEvents(await this.adapter.loadLog());
    this.baseCurrency = await this.adapter.readBaseCurrency();
    this.rates = await this.adapter.readRates();
    this.typeRow = contentEl.createDiv({ cls: "accounting-entry-type" });
    this.renderTypeButtons();
    this.fieldContainer = contentEl.createDiv({ cls: "accounting-entry-fields" });
    this.renderFields();
    this.errorEl = contentEl.createDiv({ cls: "accounting-entry-error-slot" });
    this.keyboardAvoidance = bindKeyboardAvoidance({
      rootEl: this.fieldContainer,
      modalEl: this.modalEl,
      mode: "transform"
    });
    this.contentEl.addEventListener("click", this.handleOutsideClick);
    this.swipeTabs = bindSwipeTabs({
      host: this.contentEl,
      onNext: () => this.stepType(1),
      onPrev: () => this.stepType(-1)
    });
  }
  /** 收起计算器键盘（「完成」/取消共用）。 */
  closeKeypad() {
    this.keypadHostEl?.hide();
    this.calcOpen = false;
  }
  /** 点计算器之外（其它输入项 / 空白）：合法正数→折叠提交（同「完成」），否则→清空（取消）。
   *  排除计算器内部（交给按键）与金额框本身（点击保持打开）。 */
  handleOutsideClick = (e) => {
    if (!this.calcOpen) return;
    const target = e.target;
    if (!target) return;
    if (this.keypadHostEl?.contains(target)) return;
    if (this.amountInputEl && (target === this.amountInputEl || this.amountInputEl.contains(target))) return;
    const r = evaluateAmount(this.state.amount);
    const input = this.amountInputEl;
    if (input) {
      if (r.ok && r.value > 0) {
        const folded = String(round2(r.value));
        this.state.amount = folded;
        input.value = folded;
      } else {
        this.state.amount = "";
        input.value = "";
        this.keypadHostEl?.querySelector(".accounting-calc-preview")?.empty();
      }
      this.updateSettlePreview();
    }
    this.closeKeypad();
    this.updateFromNoteHint();
  };
  renderTypeButtons() {
    this.typeRow.empty();
    for (const tp of TYPES2) {
      const active = this.state.type === tp.key;
      const btn = this.typeRow.createEl("button", {
        text: t(tp.i18nKey),
        cls: `accounting-settings-tab${active ? " accounting-settings-tab-active" : ""}`
      });
      btn.onclick = () => {
        if (this.state.type === tp.key) return;
        this.state.type = tp.key;
        this.renderTypeButtons();
        this.rerender();
      };
    }
  }
  rerender() {
    this.fieldContainer.empty();
    this.renderFields();
  }
  /** 移动端轻扫按方向（+1 下一个 / -1 上一个）切交易类型 tab：在 TYPES 顺序内夹界、不循环。
   *  与点按 tab 同路径——改 state.type 后 renderTypeButtons + rerender。 */
  stepType(dir) {
    const idx = TYPES2.findIndex((tp) => tp.key === this.state.type);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= TYPES2.length) return;
    if (TYPES2[next]?.key === this.state.type) return;
    const nextKey = TYPES2[next]?.key;
    if (!nextKey) return;
    this.state.type = nextKey;
    this.renderTypeButtons();
    this.rerender();
  }
  /** expense/income/loan 金额币种=所选账户币种 */
  accCurrency() {
    return this.accounts.find((a) => a.id === this.state.account)?.currency ?? this.baseCurrency;
  }
  /** transfer 转出账户币种（amount 所在币种） */
  fromCurrency() {
    return this.accounts.find((a) => a.id === this.state.fromAccount)?.currency ?? this.baseCurrency;
  }
  /** transfer 转入账户币种（toAmount 所在币种） */
  toCurrency() {
    return this.accounts.find((a) => a.id === this.state.toAccount)?.currency ?? this.baseCurrency;
  }
  /** 当前金额行的币种（金额标签 + 提交时 currency 用） */
  amountCurrency() {
    return this.state.type === "transfer" ? this.fromCurrency() : this.accCurrency();
  }
  /** 选中外币账户时按汇率表预填 rate（账户切换调用；transfer 无 rate；切回本位币清空） */
  applyRatePrefill() {
    if (this.state.type === "transfer") return;
    const cur = this.accCurrency();
    if (cur === this.baseCurrency) {
      this.state.rate = "";
      return;
    }
    const r = this.rates[cur]?.rate;
    this.state.rate = r != null ? String(r) : "";
  }
  /** expense/income/loan 外币时渲染 rate 输入行（汇率表预填、可改） */
  renderRateRow(wrap) {
    const cur = this.state.type === "transfer" ? this.fromCurrency() : this.accCurrency();
    if (cur === this.baseCurrency) return;
    const row = wrap.createDiv({ cls: "accounting-entry-row" });
    row.createEl("label", { text: t("entry.rateLabel", { from: cur, to: this.baseCurrency }), cls: "accounting-entry-label" });
    const input = row.createEl("input", { cls: "accounting-entry-input" });
    input.type = "text";
    input.inputMode = "decimal";
    input.value = this.state.rate;
    input.placeholder = t("entry.ratePlaceholder", { from: cur, to: this.baseCurrency });
    input.addEventListener("input", () => this.state.rate = input.value);
    row.createEl("div", { text: t("entry.rateHint"), cls: "accounting-entry-hint" });
  }
  /** transfer 跨币种时渲染转入金额输入行 + 只读隐含汇率 */
  renderToAmountRow(wrap) {
    if (!this.state.fromAccount || !this.state.toAccount) return;
    const fc = this.fromCurrency();
    const tc = this.toCurrency();
    if (fc === tc) return;
    const row = wrap.createDiv({ cls: "accounting-entry-row" });
    row.createEl("label", { text: t("entry.toAmountLabel", { cur: tc }), cls: "accounting-entry-label" });
    const input = row.createEl("input", { cls: "accounting-entry-input" });
    input.type = "text";
    input.inputMode = "decimal";
    input.value = this.state.toAmount;
    input.placeholder = t("entry.toAmountPlaceholder", { cur: tc });
    const hint = row.createEl("div", { cls: "accounting-entry-hint" });
    const updateHint = () => {
      const amt = amountValueOr(this.state.amount);
      const toAmt = amountValueOr(this.state.toAmount);
      hint.setText(amt > 0 && toAmt > 0 ? t("entry.impliedRateHint", { from: fc, rate: round2(toAmt / amt), to: tc }) : t("entry.crossTransferHint", { cur: tc }));
    };
    input.addEventListener("input", () => {
      this.state.toAmount = input.value;
      updateHint();
    });
    updateHint();
  }
  renderFields() {
    const wrap = this.fieldContainer;
    const s = this.state;
    const includeHidden = !this.isCopy;
    this.settlePreviewEl = null;
    this.fromNoteHintEl = null;
    const od = this.overdraftWarnings();
    const odFor = (id) => od.find((w) => w.accountId === id)?.wouldBe;
    const amountRow = wrap.createDiv({ cls: "accounting-entry-row" });
    const amountCur = this.amountCurrency();
    amountRow.createEl("label", { text: amountCur !== this.baseCurrency ? t("entry.amountWithCur", { cur: amountCur }) : t("entry.amount"), cls: "accounting-entry-label" });
    const amountStack = amountRow.createDiv({ cls: "accounting-amount-stack" });
    const amountInput = amountStack.createEl("input", { cls: "accounting-entry-input accounting-amount-display" });
    amountInput.type = "text";
    amountInput.readOnly = true;
    amountInput.inputMode = "decimal";
    amountInput.value = s.amount;
    amountInput.placeholder = "0.00";
    const keypadHost = amountStack.createDiv({ cls: "accounting-calc-host", attr: { "data-no-swipe": "" } });
    this.amountInputEl = amountInput;
    this.keypadHostEl = keypadHost;
    mountCalculatorKeypad(keypadHost, {
      getValue: () => s.amount,
      onChange: (next) => {
        s.amount = next;
        amountInput.value = next;
        this.updateSettlePreview();
        this.updateFromNoteHint();
        this.updateOverdraftHints();
      },
      onClose: () => this.closeKeypad(),
      onError: () => flashAmountError(amountInput)
    });
    keypadHost.hide();
    this.calcOpen = false;
    amountInput.addEventListener("click", () => {
      keypadHost.show();
      this.calcOpen = true;
    });
    this.fromNoteHintEl = amountStack.createDiv({ cls: "accounting-entry-from-note", text: t("entry.fromNote") });
    this.fromNoteHintEl.hide();
    this.updateFromNoteHint();
    if (s.type === "expense" || s.type === "income") {
      this.accountSelectRow(wrap, t("entry.field.account"), s.account, includeHidden, (v) => {
        s.account = v;
        this.applyRatePrefill();
        this.rerender();
      }, void 0, odFor(s.account));
      const cats = this.categories.filter((c) => c.flow === s.type && c.active !== false).sort((a, b) => a.name.localeCompare(b.name, "zh"));
      this.selectRow(wrap, t("entry.field.category"), s.category, [
        { value: "", label: t("account.selectPlaceholder") },
        ...cats.map((c) => ({ value: c.name, label: c.name }))
      ], (v) => s.category = v);
      this.renderRateRow(wrap);
    } else if (s.type === "transfer") {
      this.accountSelectRow(wrap, t("entry.field.fromAccount"), s.fromAccount, includeHidden, (v) => {
        s.fromAccount = v;
        this.rerender();
      }, void 0, odFor(s.fromAccount));
      this.accountSelectRow(wrap, t("entry.field.toAccount"), s.toAccount, includeHidden, (v) => {
        s.toAccount = v;
        this.rerender();
      }, void 0, odFor(s.toAccount));
      this.renderToAmountRow(wrap);
    } else {
      const dirOptions = this.repeatOn ? [
        { value: "lend", label: t("entry.direction.lend") },
        { value: "borrow", label: t("entry.direction.borrow") }
      ] : [
        { value: "lend", label: t("entry.direction.lend") },
        { value: "borrow", label: t("entry.direction.borrow") },
        { value: "collect", label: t("entry.direction.collect") },
        { value: "repay", label: t("entry.direction.repay") }
      ];
      this.selectRow(wrap, t("entry.field.direction"), s.direction, dirOptions, (v) => {
        s.direction = v;
        this.rerender();
      });
      this.accountSelectRow(wrap, t("entry.field.selfAccount"), s.account, includeHidden, (v) => {
        s.account = v;
        this.applyRatePrefill();
        this.rerender();
      }, void 0, odFor(s.account));
      this.renderPersonField(wrap);
      this.renderRateRow(wrap);
      const mismatch = this.loanCurrencyMismatch();
      if (mismatch) {
        const hint = wrap.createDiv({ cls: "accounting-entry-row" });
        hint.createEl("div", { text: t("entry.loanCurrencyMismatch", { ac: mismatch.ac, pc: mismatch.pc }), cls: "accounting-error" });
      }
      if (s.direction === "collect" || s.direction === "repay") {
        this.renderSettleRow(wrap);
      }
    }
    const noteRow = wrap.createDiv({ cls: "accounting-entry-row" });
    noteRow.createEl("label", { text: t("entry.field.note"), cls: "accounting-entry-label" });
    const noteTextarea = noteRow.createEl("textarea", { cls: "accounting-entry-input accounting-entry-textarea" });
    noteTextarea.value = s.note;
    noteTextarea.placeholder = t("entry.notePlaceholder");
    noteTextarea.rows = 2;
    noteTextarea.addEventListener("input", () => {
      s.note = noteTextarea.value;
      noteTextarea.style.height = "auto";
      noteTextarea.style.height = `${noteTextarea.scrollHeight}px`;
      if (s.amount.trim() === "") {
        const ex = extractAmountFromNote(s.note);
        if (ex) {
          s.amount = ex;
          amountInput.value = ex;
          this.updateSettlePreview();
        }
      }
      this.updateFromNoteHint();
    });
    setTimeout(() => {
      noteTextarea.style.height = "auto";
      noteTextarea.style.height = `${noteTextarea.scrollHeight}px`;
    }, 0);
    {
      const timeRow = wrap.createDiv({ cls: "accounting-entry-row" });
      timeRow.createEl("label", { text: this.repeatOn ? t("entry.startDate") : t("entry.time"), cls: "accounting-entry-label" });
      const timeField = createDateField({
        kind: this.repeatOn ? "date" : "datetime-local",
        value: this.repeatOn ? this.schedule.startDate : s.ts,
        cls: "accounting-entry-input",
        onChange: (iso) => {
          if (this.repeatOn) this.schedule.startDate = iso || todayDateInput();
          else s.ts = iso;
        }
      });
      timeRow.appendChild(timeField);
      const toggle = timeRow.createEl("button", {
        text: this.repeatOn ? t("entry.repeating") : t("entry.notRepeating"),
        cls: `accounting-entry-mini-btn${this.repeatOn ? " accounting-entry-toggle-active" : ""}`
      });
      toggle.disabled = this.repeatLocked;
      toggle.onclick = () => {
        this.repeatOn = !this.repeatOn;
        this.rerender();
      };
    }
    this.renderRecurringSection(wrap);
    const submitBtn = wrap.createEl("button", {
      text: t("common.save"),
      cls: "accounting-entry-submit"
    });
    submitBtn.disabled = !!this.loanCurrencyMismatch();
    submitBtn.onclick = () => this.submit();
  }
  renderRecurringSection(wrap) {
    if (!this.repeatOn) return;
    const nameRow = wrap.createDiv({ cls: "accounting-entry-row" });
    nameRow.createEl("label", { text: t("entry.ruleName"), cls: "accounting-entry-label" });
    const nameInput = nameRow.createEl("input", { cls: "accounting-entry-input" });
    nameInput.type = "text";
    nameInput.value = this.schedule.name;
    nameInput.placeholder = t("entry.ruleNamePlaceholder");
    nameInput.addEventListener("input", () => {
      this.schedule.name = nameInput.value;
    });
    const periodRow = wrap.createDiv({ cls: "accounting-entry-row" });
    periodRow.createEl("label", { text: t("entry.period"), cls: "accounting-entry-label" });
    const periodCtrl = periodRow.createDiv({ cls: "accounting-entry-control-group" });
    for (const p of [
      { key: "monthly", label: t("entry.periodValue.monthly") },
      { key: "weekly", label: t("entry.periodValue.weekly") },
      { key: "yearly", label: t("entry.periodValue.yearly") }
    ]) {
      const b = periodCtrl.createEl("button", {
        text: p.label,
        cls: `accounting-entry-mini-btn${this.schedule.period === p.key ? " accounting-entry-toggle-active" : ""}`
      });
      b.onclick = () => {
        this.schedule.period = p.key;
        this.rerender();
      };
    }
    const dateRow = wrap.createDiv({ cls: "accounting-entry-row" });
    dateRow.createEl("label", { text: t("entry.dateLabel"), cls: "accounting-entry-label" });
    const dateCtrl = dateRow.createDiv({ cls: "accounting-entry-control-group" });
    const dayOptions = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
    const selInput = (items, cur, on) => {
      const el = dateCtrl.createEl("select", { cls: "accounting-entry-input" });
      for (const it of items) {
        const o = el.createEl("option", { value: it.value, text: it.label });
        if (it.value === cur) o.selected = true;
      }
      el.addEventListener("change", () => on(el.value));
      return el;
    };
    if (this.schedule.period === "monthly") {
      selInput(dayOptions, String(this.schedule.dayOfMonth), (v) => this.schedule.dayOfMonth = Number(v));
    } else if (this.schedule.period === "weekly") {
      selInput(
        WEEKDAYS.map((wd, i) => ({ value: String(i), label: t(wd.i18nKey) })),
        String(this.schedule.dayOfWeek),
        (v) => this.schedule.dayOfWeek = Number(v)
      );
    } else {
      selInput(
        Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: t("entry.monthSuffix", { n: i + 1 }) })),
        String(this.schedule.monthOfYear),
        (v) => this.schedule.monthOfYear = Number(v)
      );
      selInput(dayOptions, String(this.schedule.dayOfYear), (v) => this.schedule.dayOfYear = Number(v));
    }
    const endRow = wrap.createDiv({ cls: "accounting-entry-row" });
    endRow.createEl("label", { text: t("entry.endDateLabel"), cls: "accounting-entry-label" });
    endRow.appendChild(createDateField({
      kind: "date",
      value: this.schedule.endDate,
      cls: "accounting-entry-input",
      onChange: (iso) => {
        this.schedule.endDate = iso;
      }
    }));
  }
  accountSelectRow(parent, label, value, includeHidden, onChange, typeFilter, overdraftWouldBe) {
    const row = parent.createDiv({ cls: "accounting-entry-row" });
    row.createEl("label", { text: label, cls: "accounting-entry-label" });
    const sel = row.createEl("select", { cls: "accounting-entry-input" });
    const placeholder = sel.createEl("option", { text: t("account.selectPlaceholder") });
    placeholder.value = "";
    if (!value) placeholder.selected = true;
    fillAccountOptions(sel, this.accounts, value, includeHidden, this.accountTypeSettings, typeFilter);
    sel.addEventListener("change", () => onChange(sel.value));
    if (value) {
      const acc = this.accounts.find((a) => a.id === value);
      if (acc) {
        const bal = this.balancesMap().get(value) ?? 0;
        const after = parent.createDiv();
        after.createEl("div", { text: t("entry.currentBalanceBase", { amount: formatMoney(bal, acc.currency) }), cls: "accounting-entry-balance-hint" });
        const odEl = after.createEl("div", { cls: "accounting-entry-balance-hint accounting-error", attr: { "data-overdraft-account": value } });
        this.applyOverdraftToEl(odEl, value, overdraftWouldBe);
        row.after(after);
      }
    }
    return row;
  }
  selectRow(parent, label, value, options, onChange) {
    const row = parent.createDiv({ cls: "accounting-entry-row" });
    row.createEl("label", { text: label, cls: "accounting-entry-label" });
    const sel = row.createEl("select", { cls: "accounting-entry-input" });
    for (const opt of options) {
      const o = sel.createEl("option", { text: opt.label });
      o.value = opt.value;
      if (opt.value === value) o.selected = true;
    }
    sel.addEventListener("change", () => onChange(sel.value));
    return row;
  }
  renderPersonField(wrap) {
    const includeHidden = !this.isCopy;
    const row = wrap.createDiv({ cls: "accounting-entry-row" });
    row.createEl("label", { text: t("txDetail.counterparty"), cls: "accounting-entry-label" });
    const ctrl = row.createDiv({ cls: "accounting-entry-control-group" });
    const sel = ctrl.createEl("select", { cls: "accounting-entry-input" });
    const placeholder = sel.createEl("option", { text: t("account.selectPlaceholder") });
    placeholder.value = "";
    if (!this.state.person) placeholder.selected = true;
    fillAccountOptions(sel, this.accounts, this.state.person, includeHidden, this.accountTypeSettings, "person");
    sel.addEventListener("change", () => {
      this.state.person = sel.value;
      this.rerender();
    });
    const toggle = ctrl.createEl("button", {
      text: this.addingPerson ? t("common.cancel") : "\uFF0B",
      cls: "accounting-entry-mini-btn"
    });
    toggle.onclick = () => {
      this.addingPerson = !this.addingPerson;
      if (this.addingPerson) this.state.personCurrency = this.accCurrency();
      this.rerender();
    };
    if (this.addingPerson) {
      const addRow = wrap.createDiv({ cls: "accounting-entry-row" });
      addRow.createEl("label", { text: t("entry.newPerson"), cls: "accounting-entry-label" });
      const addCtrl = addRow.createDiv({ cls: "accounting-entry-control-group" });
      const nameInput = addCtrl.createEl("input", { cls: "accounting-entry-input" });
      nameInput.type = "text";
      nameInput.placeholder = t("entry.personNamePlaceholder");
      const curSel = addCtrl.createEl("select", { cls: "accounting-entry-input" });
      curSel.style.flex = "0 0 80px";
      curSel.style.minWidth = "0";
      for (const c of this.personCurrencyOptions()) {
        const o = curSel.createEl("option", { text: c });
        o.value = c;
        if (c === this.state.personCurrency) o.selected = true;
      }
      curSel.addEventListener("change", () => this.state.personCurrency = curSel.value);
      const addBtn = addCtrl.createEl("button", {
        text: t("entry.add"),
        cls: "accounting-entry-mini-btn"
      });
      addBtn.onclick = async () => {
        const name = nameInput.value.trim();
        if (!name) return;
        const acc = this.adapter.newPersonAccount(name, this.state.personCurrency);
        this.accounts = [...this.accounts, acc];
        await this.adapter.writeMeta({ accounts: this.accounts, categories: this.categories });
        this.state.person = acc.id;
        this.addingPerson = false;
        this.rerender();
      };
    }
    if (this.state.person && (this.state.direction === "lend" || this.state.direction === "borrow")) {
      const personAcc = this.accounts.find((a) => a.id === this.state.person);
      if (personAcc) {
        const out = this.outstandingOf(this.state.person);
        const tag = out > 0 ? t("entry.receivable") : out < 0 ? t("entry.payable") : t("entry.nonePerson");
        const hint = wrap.createDiv({ cls: "accounting-entry-balance-hint" });
        hint.textContent = t("entry.personCurrentBase", { amount: formatMoney(out, personAcc.currency), state: tag });
        row.after(hint);
      }
    }
  }
  /** 新建对方账户的币种候选：常用币种（汇率表 key）∪ 现有账户已用 ∪ 本位币，去重排序。 */
  personCurrencyOptions() {
    return currencyOptions(this.rates, this.accounts, this.baseCurrency);
  }
  /** 借贷币种冲突：己方账户币种 ≠ 对方 person 币种时返回 {ac, pc}，否则 null（loan 单金额不支持跨币种）。 */
  loanCurrencyMismatch() {
    if (this.state.type !== "loan" || !this.state.account || !this.state.person) return null;
    const ac = this.accCurrency();
    const pc = this.accounts.find((a) => a.id === this.state.person)?.currency ?? this.baseCurrency;
    return ac !== pc ? { ac, pc } : null;
  }
  /** 当前各账户余额（computeBalances 全量；transactions/accounts 引用不变则复用缓存）。账户余额提示与 outstanding 共享同一份。 */
  balancesMap() {
    if (this.balancesCache?.txs === this.transactions && this.balancesCache?.accs === this.accounts) {
      return this.balancesCache.map;
    }
    const map = computeBalances(this.transactions, this.accounts);
    this.balancesCache = { txs: this.transactions, accs: this.accounts, map };
    return map;
  }
  /** 预测本笔提交后哪些资产类账户余额<0（软警告，不禁用保存）。编辑时 baseline 排除本笔（this.originalTxId）以撤回旧值。 */
  overdraftWarnings() {
    const s = this.state;
    const txs = this.originalTxId ? this.transactions.filter((tx) => tx.id !== this.originalTxId) : this.transactions;
    return predictOverdraft(this.accounts, computeBalances(txs, this.accounts), {
      type: s.type,
      amount: amountValueOr(s.amount),
      account: s.account,
      fromAccount: s.fromAccount,
      toAccount: s.toAccount,
      toAmount: amountValueOr(s.toAmount) || void 0,
      person: s.person,
      direction: s.direction
    }, this.accountTypeSettings);
  }
  /** 更新单个 overdraft 提示元素的文本与显隐（wouldBe 缺省→隐藏清空）。 */
  applyOverdraftToEl(el, accountId, wouldBe) {
    if (wouldBe == null) {
      el.hide();
      el.setText("");
      return;
    }
    const acc = this.accounts.find((a) => a.id === accountId);
    el.setText("\u26A0\uFE0F " + t("entry.overdraftWarn", { name: acc?.name ?? "", amount: formatMoney(wouldBe, acc?.currency ?? this.baseCurrency) }));
    el.show();
  }
  /** 金额变化时局部刷新所有 overdraft 提示（不触发全量 rerender，避免干扰正在使用的计算器键盘）。 */
  updateOverdraftHints() {
    const byId = new Map(this.overdraftWarnings().map((w) => [w.accountId, w.wouldBe]));
    this.fieldContainer?.querySelectorAll("[data-overdraft-account]").forEach((el) => {
      const id = el.getAttribute("data-overdraft-account");
      if (id) this.applyOverdraftToEl(el, id, byId.get(id));
    });
  }
  /** 对方人账户当前已签余额（>0 应收 / <0 应付），移动端仅新建无需排除本对。 */
  outstandingOf(personId) {
    return this.balancesMap().get(personId) ?? 0;
  }
  /** 收款/还款的「结清」勾选行 + 实时预览（对方未结、差额核销、部分归还后余额）。 */
  renderSettleRow(wrap) {
    const s = this.state;
    const row = wrap.createDiv({ cls: "accounting-entry-row" });
    row.createEl("label", { text: t("entry.settle"), cls: "accounting-entry-label" });
    const cb = row.createEl("input", { cls: "accounting-entry-checkbox" });
    cb.type = "checkbox";
    cb.checked = s.settle;
    cb.addEventListener("change", () => {
      s.settle = cb.checked;
      this.updateSettlePreview();
    });
    this.settlePreviewEl = row.createDiv({ cls: "accounting-entry-hint" });
    this.updateSettlePreview();
  }
  updateSettlePreview() {
    const el = this.settlePreviewEl;
    if (!el) return;
    const s = this.state;
    const dir = s.direction;
    if (dir !== "collect" && dir !== "repay") {
      el.setText("");
      return;
    }
    if (!s.person) {
      el.setText(t("entry.err.personFirst"));
      return;
    }
    const outstanding = this.outstandingOf(s.person);
    const pc = this.accounts.find((a) => a.id === s.person)?.currency ?? this.baseCurrency;
    const paid = amountValueOr(s.amount);
    const owe = Math.abs(outstanding);
    const sign = outstanding > 0 ? t("entry.receivable") : outstanding < 0 ? t("entry.payable") : t("entry.none");
    let text = t("entry.outstandingBase", { amount: formatMoney(owe, pc), state: sign });
    const dirOk = dir === "collect" ? outstanding > 0 : outstanding < 0;
    if (!dirOk && outstanding !== 0) {
      text += dir === "collect" ? t("entry.settleDirMismatchCollect") : t("entry.settleDirMismatchRepay");
    } else if (s.settle) {
      try {
        const o = deriveSettlementDiff(outstanding, paid, dir, settlementLabels());
        text += o.kind === "exact" ? t("entry.settleExact") : t("entry.settleWriteoff", { amount: formatMoney(o.amount, pc), category: o.category, flow: o.type === "expense" ? t("tx.type.expense") : t("tx.type.income") });
      } catch {
      }
    } else {
      const after = outstanding > 0 ? outstanding - paid : outstanding + paid;
      text += t("entry.settlePartial", { amount: formatMoney(round2(after), pc) });
    }
    el.setText(text);
  }
  /** 「← 来自备注」来源提示：金额非空且等于备注识别值时显示（用户改值后自动消失）。 */
  updateFromNoteHint() {
    const el = this.fromNoteHintEl;
    if (!el) return;
    const s = this.state;
    const show = s.amount.trim() !== "" && s.amount.trim() === extractAmountFromNote(s.note);
    if (show) el.show();
    else el.hide();
  }
  settleSignError(direction, outstanding) {
    switch (validateCollectRepayDirection(outstanding, direction)) {
      case "shouldRepay":
        return t("entry.err.shouldRepay");
      case "shouldCollect":
        return t("entry.err.shouldCollect");
      default:
        return t("entry.err.noOutstanding");
    }
  }
  /** 结清对写入：方向/符号校验 → saveSettlement（派生前 ensureCategories + core 共享构造）。 */
  async submitSettlement(amount, direction) {
    const s = this.state;
    const outstanding = this.outstandingOf(s.person);
    try {
      deriveSettlementDiff(outstanding, amount, direction, settlementLabels());
    } catch {
      this.showError(this.settleSignError(direction, outstanding));
      return;
    }
    const entryCurrency = this.accCurrency();
    const rateRes = evaluateAmount(s.rate);
    const rateVal = rateRes.ok && rateRes.value > 0 ? round2(rateRes.value) : void 0;
    const collect = {
      amount,
      currency: entryCurrency,
      rate: entryCurrency !== this.baseCurrency ? rateVal : void 0,
      account: s.account,
      person: s.person,
      direction,
      ts: datetimeLocalToISO(s.ts),
      note: s.note.trim() || void 0
    };
    try {
      await saveSettlement(this.adapter, this.accounts, this.categories, {
        collect,
        outstanding,
        paid: amount,
        direction
      });
    } catch (e) {
      this.showError(t("entry.saveFailed", { msg: formatError(e) }));
      return;
    }
    this.onSubmitted();
    this.close();
  }
  showError(msg) {
    this.errorEl.empty();
    this.errorEl.createEl("div", { text: msg, cls: "accounting-error" });
  }
  async submitRecurring() {
    const s = this.state;
    const amtRes = evaluateAmount(s.amount);
    if (!amtRes.ok || amtRes.value <= 0) {
      this.showError(t("entry.err.amountPositive"));
      return;
    }
    const amount = round2(amtRes.value);
    const entryCurrency = this.amountCurrency();
    const rateRes = evaluateAmount(s.rate);
    const rateVal = rateRes.ok && rateRes.value > 0 ? round2(rateRes.value) : void 0;
    if (!this.schedule.name.trim()) {
      this.showError(t("entry.err.ruleName"));
      return;
    }
    if (s.type === "expense" || s.type === "income") {
      if (!s.account) return this.showError(t("entry.err.account"));
      if (!s.category) return this.showError(t("entry.err.category"));
    } else if (s.type === "transfer") {
      if (!s.fromAccount) return this.showError(t("entry.err.fromAccount"));
      if (!s.toAccount) return this.showError(t("entry.err.toAccount"));
      if (s.fromAccount === s.toAccount) return this.showError(t("entry.err.sameAccount"));
    } else {
      if (!s.account) return this.showError(t("entry.err.selfAccount"));
      if (!s.person) return this.showError(t("entry.err.personOrCreate"));
    }
    const rule = entryToRule(
      {
        type: s.type,
        amount,
        currency: entryCurrency,
        rate: s.type !== "transfer" && entryCurrency !== this.baseCurrency ? rateVal : void 0,
        account: s.account,
        category: s.category,
        fromAccount: s.fromAccount,
        toAccount: s.toAccount,
        person: s.person,
        direction: s.direction,
        note: s.note
      },
      this.schedule,
      this.recurring?.editing
    );
    const err = validateRecurringRule(rule);
    if (err) return this.showError(t(err));
    try {
      const rules = await this.adapter.readRecurringRules();
      const updated = this.recurring?.editing ? rules.map((r) => r.id === this.recurring.editing.id ? rule : r) : [...rules, rule];
      await this.adapter.writeRecurringRules(updated);
      const events = await this.adapter.loadLog();
      const existingIds = new Set(events.filter((e) => e.op === "upsert").map((e) => e.id));
      const generated = generateDueRecurringEvents([rule], existingIds, /* @__PURE__ */ new Date());
      if (generated.length > 0) {
        await this.adapter.appendEvents(generated);
      }
      new import_obsidian6.Notice(
        generated.length > 0 ? t("entry.ruleSavedGenerated", { n: generated.length }) : t("entry.ruleSavedNoDue")
      );
    } catch (e) {
      return this.showError(t("entry.ruleSaveFailed", { msg: formatError(e) }));
    }
    if (this.onRecurringSaved) this.onRecurringSaved();
    else this.onSubmitted();
    this.close();
  }
  async submit() {
    const s = this.state;
    const amtRes = evaluateAmount(s.amount);
    if (!amtRes.ok || amtRes.value <= 0) {
      this.showError(t("entry.err.amountPositive"));
      return;
    }
    const amount = round2(amtRes.value);
    if (this.repeatOn) {
      return this.submitRecurring();
    }
    const entryCurrency = this.amountCurrency();
    const rateRes = evaluateAmount(s.rate);
    const rateVal = rateRes.ok && rateRes.value > 0 ? round2(rateRes.value) : void 0;
    const toAmtRes = evaluateAmount(s.toAmount);
    const toAmountVal = toAmtRes.ok && toAmtRes.value > 0 ? round2(toAmtRes.value) : void 0;
    const base = {
      id: this.isCopy ? newTxId() : this.originalTxId || newTxId(),
      type: s.type,
      ts: datetimeLocalToISO(s.ts),
      amount,
      currency: entryCurrency,
      note: s.note.trim() || void 0
    };
    if (s.type === "expense" || s.type === "income") {
      if (!s.account) return this.showError(t("entry.err.account"));
      if (!s.category) return this.showError(t("entry.err.category"));
      base.account = s.account;
      base.category = s.category;
      if (entryCurrency !== this.baseCurrency) base.rate = rateVal;
    } else if (s.type === "transfer") {
      if (!s.fromAccount) return this.showError(t("entry.err.fromAccount"));
      if (!s.toAccount) return this.showError(t("entry.err.toAccount"));
      if (s.fromAccount === s.toAccount) return this.showError(t("entry.err.sameAccount"));
      if (this.fromCurrency() !== this.toCurrency()) {
        if (toAmountVal == null) return this.showError(t("entry.err.crossTransferAmount"));
        base.toAmount = toAmountVal;
      }
      base.fromAccount = s.fromAccount;
      base.toAccount = s.toAccount;
    } else {
      if (!s.account) return this.showError(t("entry.err.selfAccount"));
      if (!s.person) return this.showError(t("entry.err.personOrCreate"));
      if ((s.direction === "collect" || s.direction === "repay") && s.settle) {
        return this.submitSettlement(amount, s.direction);
      }
      if (s.direction === "collect" || s.direction === "repay") {
        const outstanding = this.outstandingOf(s.person);
        if (validateCollectRepayDirection(outstanding, s.direction)) {
          return this.showError(this.settleSignError(s.direction, outstanding));
        }
      }
      base.account = s.account;
      base.person = s.person;
      base.direction = s.direction;
      if (entryCurrency !== this.baseCurrency) base.rate = rateVal;
    }
    const now = nowISO();
    const ev = { ...base, op: "upsert", createdAt: now, updatedAt: now, source: "manual" };
    await this.adapter.appendEvents([ev]);
    this.onSubmitted(ev.id);
    this.close();
  }
  /** 走 Obsidian 原生关闭：pop 全局 keymap scope（Modal.open 时 push 的 Escape/Tab 捕获）并恢复焦点，
   *  再由基类回调 onClose。默认关闭动画已被 inline animation/transition:none 中和，仍是即时摘除——
   *  若绕过 super.close() 只 detach 容器，scope 不弹、焦点不恢复，会导致关闭后 Obsidian 笔记无法正常编辑。 */
  close() {
    if (this.closing) return;
    this.closing = true;
    super.close();
  }
  onClose() {
    this.keyboardAvoidance?.dispose();
    this.keyboardAvoidance = void 0;
    this.swipeTabs?.dispose();
    this.swipeTabs = void 0;
    this.contentEl.removeEventListener("click", this.handleOutsideClick);
    this.contentEl.style.maxHeight = "";
    this.contentEl.empty();
  }
};

// src/transactionDetailModal.ts
var TransactionDetailModal = class extends import_obsidian7.Modal {
  constructor(app, adapter, transaction, accounts, categories, allTransactions, onUpdated, navCtx) {
    super(app);
    this.adapter = adapter;
    this.accounts = accounts;
    this.categories = categories;
    this.allTransactions = allTransactions;
    this.onUpdated = onUpdated;
    this.navCtx = navCtx;
    this.state = transaction;
  }
  state;
  opened = false;
  closing = false;
  /** 此交易后各账户的历史余额快照（renderView 时一次性算出），账户行内联展示。 */
  snapshot = null;
  /** 本位币（默认 CNY），onOpen 时从账本读取，供外币折算展示 */
  baseCurrency = "CNY";
  async onOpen() {
    this.opened = true;
    this.modalEl.addClass("accounting-detail-sheet");
    if (!import_obsidian7.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    this.contentEl.addClass("accounting-modal");
    this.containerEl.addEventListener("click", this.onBackdropClick);
    try {
      this.baseCurrency = await this.adapter.readBaseCurrency();
    } catch {
    }
    this.renderView();
  }
  onBackdropClick = (e) => {
    if (!e.target?.closest(".modal")) {
      this.close();
    }
  };
  /** 滑下后再走 Obsidian 原生关闭（与开启的滑上对称，div transform 在 WKWebView 可靠）。
   *  走 super.close() 而非手搓 onClose()+detach：补 pop Modal.open 时 push 的全局 keymap scope +
   *  恢复焦点，避免关闭后 Obsidian 笔记无法正常编辑。 */
  close() {
    if (this.closing) return;
    this.closing = true;
    if (!this.opened) {
      super.close();
      return;
    }
    this.containerEl.removeEventListener("click", this.onBackdropClick);
    this.modalEl.addClass("accounting-detail-closing");
    setTimeout(() => {
      try {
        super.close();
      } catch (e) {
        console.error(e);
      }
    }, 200);
  }
  renderView() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createDiv({ cls: "accounting-detail-grabber" });
    const titleRow = contentEl.createDiv({ cls: "accounting-detail-title-row" });
    titleRow.createEl("h2", { text: t("txDetail.title") });
    this.renderDetailView();
  }
  /** 编辑/复制后就地刷新背后的列表实例（筛选拟保留）。 */
  afterDetailChange() {
    this.onUpdated();
  }
  /** 编辑/复制：详情抽屉不关，EntryModal 以聚焦模式叠在详情之上（右下角「‹ 返回」回详情、✕ 隐藏）；
   *  保存→就地刷新本详情（新交易）+ 刷新背后列表；取消（点返回）→详情原样保留。 */
  openEntry(isCopy) {
    const entry = new EntryModal(
      this.app,
      this.adapter,
      this.accounts,
      this.categories,
      async (newTxId2) => {
        this.afterDetailChange();
        if (newTxId2) await this.refreshFromLog(newTxId2);
      },
      this.state,
      isCopy,
      this.navCtx
    );
    entry.drillDown = true;
    entry.open();
  }
  /** 以最新日志就地刷新本详情：编辑后显示更新内容、复制后显示新交易；
   *  allTransactions 用最新折叠结果，账户行内联余额快照随最新日志重算。 */
  async refreshFromLog(txId) {
    let folded;
    try {
      folded = foldEvents(await this.adapter.loadLog());
    } catch (err) {
      console.error("\u5237\u65B0\u8BE6\u60C5\u52A0\u8F7D\u65E5\u5FD7\u5931\u8D25:", err);
      return;
    }
    const tx = folded.find((t2) => t2.id === txId);
    if (!tx) return;
    this.state = tx;
    this.allTransactions = folded;
    this.renderView();
  }
  renderDetailView() {
    const { contentEl } = this;
    const tx = this.state;
    this.snapshot = computeBalancesUpTo(this.allTransactions, this.accounts, tx.id);
    const detailEl = contentEl.createDiv({ cls: "accounting-detail-content" });
    this.addRow(detailEl, t("txDetail.type"), this.typeLabel(tx.type));
    this.addRow(detailEl, t("entry.field.ts"), this.formatTime(tx.ts));
    this.addRow(detailEl, t("entry.field.amount"), formatMoney(tx.amount, tx.currency));
    if (tx.rate != null && tx.currency !== this.baseCurrency) {
      this.addRow(detailEl, t("txDetail.rate"), `1 ${tx.currency} = ${tx.rate} ${this.baseCurrency}`);
      this.addRow(detailEl, t("txDetail.converted", { base: this.baseCurrency }), formatMoney(txBaseAmount(tx, this.baseCurrency), this.baseCurrency));
    }
    if (tx.type === "transfer" && tx.toAmount != null) {
      const fromCur = this.accounts.find((a) => a.id === tx.fromAccount)?.currency ?? this.baseCurrency;
      const toCur = this.accounts.find((a) => a.id === tx.toAccount)?.currency ?? this.baseCurrency;
      this.addRow(detailEl, t("txDetail.toAmount"), formatMoney(tx.toAmount, toCur));
      if (fromCur !== toCur && tx.amount > 0) {
        this.addRow(detailEl, t("txDetail.impliedRate"), `1 ${fromCur} = ${round2(tx.toAmount / tx.amount)} ${toCur}`);
      }
    }
    if (tx.type === "expense" || tx.type === "income") {
      this.addRow(detailEl, t("entry.field.account"), this.accountNameWithBalance(tx.account));
      this.addRow(detailEl, t("entry.field.category"), tx.category || "");
    } else if (tx.type === "transfer") {
      this.addRow(detailEl, t("entry.field.fromAccount"), this.accountNameWithBalance(tx.fromAccount));
      this.addRow(detailEl, t("entry.field.toAccount"), this.accountNameWithBalance(tx.toAccount));
    } else if (tx.type === "loan") {
      this.addRow(detailEl, t("entry.field.direction"), this.directionLabel(tx.direction));
      this.addRow(detailEl, t("entry.field.selfAccount"), this.accountNameWithBalance(tx.account));
      this.addRow(detailEl, t("txDetail.counterparty"), this.accountNameWithBalance(tx.person));
    }
    if (tx.note) {
      this.addRow(detailEl, t("entry.field.note"), tx.note);
    }
    const btnRow = contentEl.createDiv({ cls: "accounting-detail-buttons" });
    btnRow.createEl("button", { text: t("common.edit"), cls: "accounting-btn-secondary" }).onclick = () => {
      if (this.isSettlementLoan()) {
        alert(t("txDetail.settlementEditBlock"));
        return;
      }
      this.openEntry(false);
    };
    btnRow.createEl("button", { text: t("common.copy"), cls: "accounting-btn-secondary" }).onclick = () => {
      if (this.isSettlementLoan()) {
        alert(t("txDetail.settlementCopyBlock"));
        return;
      }
      this.openEntry(true);
    };
    btnRow.createEl("button", {
      text: t("common.delete"),
      cls: "accounting-btn-danger"
    }).onclick = async () => {
      await this.deleteTransaction();
    };
    btnRow.createEl("button", { text: t("common.close"), cls: "accounting-btn-secondary accounting-detail-sheet-close" }).onclick = () => this.close();
  }
  addRow(parent, label, value, desc) {
    const row = parent.createDiv({ cls: "accounting-detail-row" });
    const labelEl = row.createDiv({ cls: "accounting-detail-label" });
    labelEl.textContent = label;
    const valueEl = row.createDiv({ cls: "accounting-detail-value" });
    valueEl.textContent = value;
    if (desc) {
      const descEl = row.createDiv({ cls: "accounting-detail-desc" });
      descEl.textContent = desc;
    }
  }
  async deleteTransaction() {
    if (!confirm(t("txDetail.deleteConfirm"))) {
      return;
    }
    const now = nowISO();
    const idsToDelete = [this.state.id];
    if (this.state.linkId) {
      try {
        const folded = foldEvents(await this.adapter.loadLog());
        const partner = folded.find((tx) => tx.linkId === this.state.linkId && tx.id !== this.state.id);
        if (partner) idsToDelete.push(partner.id);
      } catch (err) {
        console.error("\u52A0\u8F7D\u65E5\u5FD7\u67E5\u627E\u7ED3\u6E05\u914D\u5BF9\u5931\u8D25:", err);
      }
    }
    const events = idsToDelete.map((id) => ({
      op: "delete",
      targetId: id,
      updatedAt: now,
      source: "manual"
    }));
    try {
      await this.adapter.appendEvents(events);
      this.close();
      this.afterDetailChange();
    } catch (err) {
      console.error("\u5220\u9664\u6D41\u6C34\u5931\u8D25:", err);
      this.showError(t("txDetail.deleteFailed"));
    }
  }
  directionLabel(d) {
    switch (d) {
      case "lend":
        return t("entry.direction.lend");
      case "borrow":
        return t("entry.direction.borrow");
      case "collect":
        return t("entry.direction.collect");
      case "repay":
        return t("entry.direction.repay");
      default:
        return "\u2014";
    }
  }
  /** 结清类借贷（collect/repay）：移动端不支持编辑，避免破坏桌面端创建的结清对。 */
  isSettlementLoan() {
    return this.state.type === "loan" && (this.state.direction === "collect" || this.state.direction === "repay");
  }
  typeLabel(type) {
    const labels = {
      expense: t("tx.type.expense"),
      income: t("tx.type.income"),
      transfer: t("tx.type.transfer"),
      loan: t("tx.type.loan")
    };
    return labels[type] || type;
  }
  accountName(id) {
    if (!id) return "";
    const acc = this.accounts.find((a) => a.id === id);
    return acc ? acc.name : id;
  }
  accountCurrency(id) {
    if (!id) return "CNY";
    return this.accounts.find((a) => a.id === id)?.currency ?? "CNY";
  }
  /** 账户名 + 内联「此交易后」余额：「招行储蓄（余额 ¥1,234.50）」。
   *  snapshot=null（target 不在日志，脏数据/已删）或账户 id 缺失 → 退化为仅名称，不报错。 */
  accountNameWithBalance(id) {
    const name = this.accountName(id);
    if (!name || !id || !this.snapshot) return name;
    const bal = this.snapshot.get(id);
    if (bal === void 0) return name;
    return `${name}${t("txDetail.balanceSuffix", { balance: formatMoney(bal, this.accountCurrency(id)) })}`;
  }
  formatTime(iso) {
    const d = new Date(iso);
    const pad = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  showError(msg) {
    const { contentEl } = this;
    const errorEl = contentEl.createDiv({ cls: "accounting-error" });
    errorEl.textContent = msg;
    setTimeout(() => errorEl.remove(), 3e3);
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/transactionListModal.ts
var SORT_OPTIONS = [
  { value: "time-desc", i18nKey: "txList.sort.timeDesc" },
  { value: "time-asc", i18nKey: "txList.sort.timeAsc" },
  { value: "amount-desc", i18nKey: "txList.sort.amountDesc" },
  { value: "amount-asc", i18nKey: "txList.sort.amountAsc" }
];
var PAGE_SIZE = 50;
function nextConflictNotice(prevSig, conflicts) {
  if (conflicts.length === 0) return { sig: "", notify: false };
  const sig = conflicts.map((c) => c.id).slice().sort().join(",");
  return { sig, notify: sig !== prevSig };
}
var TransactionListModal = class extends import_obsidian8.Modal {
  constructor(app, adapter, presetAccountId, navCtx, slide, presetRecurringRuleId, drillDown, categoryDrill, onDataChanged, onSwitchLedger, onOpened) {
    super(app);
    this.adapter = adapter;
    this.navCtx = navCtx;
    this.slide = slide;
    this.drillDown = drillDown;
    this.categoryDrill = categoryDrill;
    this.onDataChanged = onDataChanged;
    this.onSwitchLedger = onSwitchLedger;
    this.onOpened = onOpened;
    const hasCategoryPreset = !!categoryDrill;
    const hasPreset = !!presetAccountId || !!presetRecurringRuleId || hasCategoryPreset;
    this.filter = {
      // preset 跳转（账户、周期账规则、报表分类）：使用传入范围或默认全部历史；否则默认近6月
      // 结束日 = 当天，配合「整天包含」语义把今天完整包进来
      start: categoryDrill?.start ?? (hasPreset ? "1970-01-01" : monthsAgoDateInput(6)),
      end: categoryDrill?.end ?? todayDateInput(),
      types: categoryDrill ? [categoryDrill.flow] : [],
      keyword: "",
      accountId: presetAccountId ?? "",
      recurringRuleId: presetRecurringRuleId ?? "",
      category: categoryDrill?.uncategorized ? "" : categoryDrill?.category ?? "",
      uncategorized: categoryDrill?.uncategorized ?? false,
      quickActive: hasCategoryPreset ? null : hasPreset ? "all" : "halfYear",
      sort: "time-desc"
    };
  }
  accounts = [];
  accountTypeSettings = defaultAccountTypeSettings();
  categories = [];
  transactions = [];
  filteredTransactions = [];
  filter;
  recurringRules = [];
  /** 本位币（onOpen 读 ledger.json，失败兜底 CNY）；月分组全账户口径折算与月末余额币种用。 */
  baseCurrency = "CNY";
  accountById = /* @__PURE__ */ new Map();
  opened = false;
  closing = false;
  renderedCount = 0;
  listEl = null;
  sentinelEl = null;
  loadMoreObserver = null;
  selectMode = false;
  /** 月份分组批量展开态：null=默认（仅最新月 open）/ true=全展开 / false=全折叠；手动单月 toggle 不改此字段。 */
  allMonthsExpanded = null;
  /** 每个月分组的 <details> → 该月流水；懒渲染用：折叠月只在用户展开时才建行 DOM，避免「全部」时一次建数万节点卡顿。 */
  monthTxsByDetails = /* @__PURE__ */ new WeakMap();
  selectedIds = /* @__PURE__ */ new Set();
  updatedAtById = /* @__PURE__ */ new Map();
  deleting = false;
  /** 打平冲突（同 id 同 updatedAt）：折叠结果取决于文件顺序，行内 ⚠️ 标记 + 一次性 Notice 提示 */
  tiedConflicts = [];
  conflictIds = /* @__PURE__ */ new Set();
  /** 上次 Notice 时的冲突签名，用于「同集合不重复打扰」 */
  prevConflictSig = "";
  /** 在挂载到 DOM 前就预设全屏类与禁用 Obsidian 默认 modal-pop 动画，避免「先上跳再滑入」。 */
  open() {
    presetModalChrome(this.modalEl, this.containerEl);
    super.open();
  }
  async onOpen() {
    this.opened = true;
    prepareModalContainer(this.containerEl);
    this.modalEl.addClass("accounting-fullscreen");
    if (this.drillDown) this.modalEl.addClass("accounting-drilldown");
    this.onOpened?.();
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("accounting-transaction-modal");
    const sc = slideClass(this.slide);
    if (sc) contentEl.addClass(sc);
    if (!this.drillDown && this.onSwitchLedger) {
      const ledgerAlias = await this.adapter.readActiveLedgerAlias();
      mountLedgerPill(this.modalEl, this.app, this.adapter, ledgerAlias, (name) => {
        this.onSwitchLedger?.(name, () => this.close());
      });
      contentEl.addClass("accounting-has-ledger-pill");
    }
    try {
      const events = await this.adapter.loadLog();
      this.applyEvents(events);
      const meta = await this.adapter.readMeta();
      this.accounts = meta.accounts;
      this.accountById = new Map(this.accounts.map((a) => [a.id, a]));
      this.categories = meta.categories;
      this.recurringRules = await this.adapter.readRecurringRules();
      try {
        this.baseCurrency = await this.adapter.readBaseCurrency();
      } catch {
        this.baseCurrency = "CNY";
      }
      const storedTypes = await this.adapter.readAccountTypeSettings();
      this.accountTypeSettings = storedTypes ? normalizeAccountTypeSettings(storedTypes) : defaultAccountTypeSettings();
      if (this.transactions.length === 0) {
        this.renderNav();
        contentEl.createEl("h2", { text: t("nav.list") });
        contentEl.createEl("div", {
          text: t("txList.empty"),
          cls: "accounting-empty"
        });
        return;
      }
      this.applyFilter();
      this.render();
    } catch (err) {
      console.error("\u52A0\u8F7D\u6D41\u6C34\u5931\u8D25:", err);
      console.error("\u9519\u8BEF\u5806\u6808:", err instanceof Error ? err.stack : "\u65E0\u5806\u6808");
      contentEl.empty();
      this.renderNav();
      contentEl.createEl("h2", { text: t("nav.list") });
      contentEl.createEl("div", {
        text: t("txList.loadFailed"),
        cls: "accounting-empty"
      });
      contentEl.createEl("div", {
        text: t("txList.errorDetail", { msg: formatError(err) }),
        cls: "accounting-error"
      });
    }
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("accounting-transaction-modal");
    this.renderNav();
    this.renderFilters(contentEl);
    this.renderSortBar(contentEl);
    if (this.selectMode) this.renderBatchBar(contentEl);
    this.renderList(contentEl);
  }
  /** 顶层流水：底部导航条；drill-down（账户下钻/周期账查看）：聚焦模式，右下角「‹ 返回」回父页（无导航条、隐藏右上角✕）。 */
  renderNav() {
    renderNavOrBack(this.modalEl, "list", this.navCtx, () => this.close(), !!this.drillDown);
  }
  renderFilters(container) {
    const filterBox = container.createDiv({ cls: "accounting-filter-box" });
    const timeRow = filterBox.createDiv({ cls: "accounting-filter-row" });
    timeRow.createSpan({ text: t("txList.rangeTime"), cls: "accounting-filter-label" });
    const timeControls = timeRow.createDiv({ cls: "accounting-filter-controls" });
    const quickOptions = [
      { key: "halfYear", label: t("txList.lastMonths", { n: 6 }), start: monthsAgoDateInput(6) },
      { key: "year", label: t("txList.lastMonths", { n: 12 }), start: monthsAgoDateInput(12) },
      { key: "all", label: t("txList.allTime"), start: "1970-01-01" }
    ];
    for (const opt of quickOptions) {
      const active = this.filter.quickActive === opt.key;
      const btn = timeControls.createEl("button", {
        text: opt.label,
        cls: `accounting-filter-quick-btn${active ? " accounting-filter-btn-active" : ""}`
      });
      btn.onclick = () => {
        this.filter.start = opt.start;
        this.filter.end = todayDateInput();
        this.filter.quickActive = opt.key;
        this.applyFilter();
        this.render();
      };
    }
    const dateRangeWrap = timeControls.createDiv({ cls: "accounting-date-range-wrap" });
    const startInput = createDateField({
      kind: "date",
      value: this.filter.start,
      onChange: (iso) => {
        this.filter.start = iso;
        this.filter.quickActive = null;
        this.applyFilter();
        this.render();
      }
    });
    dateRangeWrap.appendChild(startInput);
    dateRangeWrap.createSpan({ text: "\u2013" });
    const endInput = createDateField({
      kind: "date",
      value: this.filter.end,
      onChange: (iso) => {
        this.filter.end = iso;
        this.filter.quickActive = null;
        this.applyFilter();
        this.render();
      }
    });
    dateRangeWrap.appendChild(endInput);
    const typeRow = filterBox.createDiv({ cls: "accounting-filter-row" });
    typeRow.createSpan({ text: t("txList.rangeType"), cls: "accounting-filter-label" });
    const typeWrap = typeRow.createDiv({ cls: "accounting-filter-controls" });
    const types = [
      { key: "expense", label: t("tx.type.expense") },
      { key: "income", label: t("tx.type.income") },
      { key: "transfer", label: t("tx.type.transfer") },
      { key: "loan", label: t("tx.type.loan") }
    ];
    const allBtn = typeWrap.createEl("button", {
      text: t("common.all"),
      cls: `accounting-filter-type-btn${this.filter.types.length === 0 ? " accounting-filter-btn-active" : ""}`
    });
    allBtn.onclick = () => {
      this.filter.types = [];
      this.applyFilter();
      this.render();
    };
    for (const tp of types) {
      const active = this.filter.types.includes(tp.key);
      const btn = typeWrap.createEl("button", {
        text: tp.label,
        cls: `accounting-filter-type-btn${active ? " accounting-filter-btn-active" : ""}`
      });
      btn.onclick = () => {
        if (active) {
          this.filter.types = this.filter.types.filter((x) => x !== tp.key);
        } else {
          this.filter.types.push(tp.key);
        }
        this.applyFilter();
        this.render();
      };
    }
    const comboRow = filterBox.createDiv({ cls: "accounting-filter-row" });
    comboRow.createSpan({ text: t("txList.rangeAccountNote"), cls: "accounting-filter-label" });
    const comboControls = comboRow.createDiv({ cls: "accounting-filter-controls" });
    const accountSelect = comboControls.createEl("select", { cls: "accounting-filter-account-select" });
    const allOpt = accountSelect.createEl("option", { text: t("txList.allAccounts") });
    allOpt.value = "";
    if (!this.filter.accountId) allOpt.selected = true;
    fillAccountOptions(accountSelect, this.accounts, this.filter.accountId, true, this.accountTypeSettings);
    accountSelect.addEventListener("change", () => {
      this.filter.accountId = accountSelect.value;
      this.applyFilter();
      this.render();
    });
    const searchWrap = comboControls.createDiv({ cls: "accounting-search-wrap" });
    const keywordInput = searchWrap.createEl("input", {
      type: "text",
      value: this.filter.keyword,
      placeholder: t("txList.searchPlaceholder"),
      cls: "accounting-search-input"
    });
    const commitSearch = () => {
      this.filter.keyword = keywordInput.value;
      this.applyFilter();
      this.render();
    };
    keywordInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") commitSearch();
    });
    keywordInput.addEventListener("blur", commitSearch);
    const keywordClear = searchWrap.createEl("button", {
      text: "\xD7",
      cls: `accounting-search-clear${this.filter.keyword ? "" : " accounting-search-clear-hidden"}`
    });
    keywordClear.setAttribute("aria-label", t("txList.ariaClearKeyword"));
    keywordClear.onclick = () => {
      keywordInput.value = "";
      this.filter.keyword = "";
      this.applyFilter();
      this.render();
    };
    if (this.hasActiveFilter()) {
      const clearAllBtn = comboControls.createEl("button", {
        text: t("common.clear"),
        cls: "accounting-filter-clear-all"
      });
      clearAllBtn.setAttribute("aria-label", t("txList.ariaClearAllFilters"));
      clearAllBtn.onclick = () => {
        this.resetFilter();
        this.applyFilter();
        this.render();
      };
    }
    if (this.filter.recurringRuleId) {
      const ruleName = this.recurringRules.find((r) => r.id === this.filter.recurringRuleId)?.name ?? t("txList.recurringDefault");
      filterBox.createDiv({
        text: `${t("txList.recurringPrefix")}${ruleName}${t("txList.countSuffix", { n: this.filteredTransactions.length })}`,
        cls: "accounting-recurring-stats"
      });
    }
    if (this.filter.category || this.filter.uncategorized) {
      const catName = this.filter.uncategorized ? t("txList.uncategorized") : this.filter.category;
      filterBox.createDiv({
        text: `${t("txList.categoryDrillPrefix")}${catName}${t("txList.countSuffix", { n: this.filteredTransactions.length })}`,
        cls: "accounting-recurring-stats"
      });
    }
  }
  /** 排序栏：独立于筛选卡片（排序是 ordering 而非筛选维度），置于卡片下方、「排序」+下拉同一行；弱化样式。 */
  renderSortBar(container) {
    const bar = container.createDiv({ cls: "accounting-sort-bar" });
    bar.createSpan({ text: t("txList.sortLabel"), cls: "accounting-sort-label" });
    const curKey = SORT_OPTIONS.find((o) => o.value === this.filter.sort)?.i18nKey;
    const cur = curKey ? t(curKey) : "";
    const btn = bar.createSpan({ cls: "accounting-sort-btn", attr: { role: "button", tabindex: "0" } });
    btn.createSpan({ text: cur });
    btn.createSpan({ text: "\u25BE", cls: "accounting-sort-caret" });
    const open = () => this.openSortMenu(btn);
    btn.onclick = open;
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
    const selectBtn = bar.createEl("button", {
      text: this.selectMode ? t("common.done") : t("txList.select"),
      cls: "accounting-batch-toggle"
    });
    selectBtn.onclick = () => {
      this.selectMode = !this.selectMode;
      if (!this.selectMode) this.selectedIds.clear();
      this.render();
    };
    const isTimeSort = this.filter.sort === "time-desc" || this.filter.sort === "time-asc";
    if (!isTimeSort) {
      bar.createSpan({ text: t("txList.flatSortHint"), cls: "accounting-sort-hint" });
      return;
    }
    if (this.filteredTransactions.length === 0) return;
    const expandBtn = bar.createEl("button", {
      text: this.allMonthsExpanded === true ? t("txList.collapseAll") : t("txList.expandAll"),
      cls: "accounting-collapse-toggle"
    });
    expandBtn.onclick = () => {
      const groups = this.contentEl.querySelectorAll("details.accounting-month-group");
      if (groups.length === 0) return;
      const wantExpand = this.allMonthsExpanded !== true;
      this.allMonthsExpanded = wantExpand;
      groups.forEach((d) => {
        const det = d;
        det.open = wantExpand;
        if (wantExpand) this.ensureMonthRows(det);
      });
      expandBtn.textContent = wantExpand ? t("txList.collapseAll") : t("txList.expandAll");
    };
  }
  /** 多选操作栏：全选（覆盖全部 filtered）· 取消 · 已选 N 条 · 批量修改/删除；操作组 margin-left:auto 固定靠右。 */
  renderBatchBar(container) {
    const bar = container.createDiv({ cls: "accounting-batch-bar" });
    const selected = this.selectedTxs();
    const typeSet = new Set(selected.map((tx) => tx.type));
    const canBatch = selected.length > 0 && typeSet.size === 1;
    const allBtn = bar.createEl("button", { text: t("txList.selectAll"), cls: "accounting-batch-sec" });
    allBtn.onclick = () => {
      this.selectedIds = new Set(this.filteredTransactions.map((tx) => tx.id));
      this.render();
    };
    const clearBtn = bar.createEl("button", { text: t("common.cancel"), cls: "accounting-batch-sec" });
    clearBtn.onclick = () => {
      this.selectedIds.clear();
      this.render();
    };
    bar.createSpan({ text: t("txList.selectedN", { n: selected.length }), cls: "accounting-batch-count" });
    const batchBtn = bar.createEl("button", {
      text: t("txList.batchModify"),
      cls: `accounting-batch-go${canBatch ? "" : " accounting-batch-go-disabled"}`
    });
    if (!canBatch) {
      batchBtn.setAttribute("disabled", "true");
      batchBtn.setAttribute("title", typeSet.size > 1 ? t("txList.batchModifyOnlySameType") : t("txList.selectFirst"));
    } else {
      batchBtn.onclick = () => this.openBatchModify();
    }
    const delDisabled = selected.length === 0;
    const delBtn = bar.createEl("button", {
      text: t("txList.batchDelete"),
      cls: delDisabled ? "accounting-batch-go accounting-batch-go-disabled" : "accounting-batch-go accounting-batch-go-danger"
    });
    if (delDisabled) {
      delBtn.setAttribute("disabled", "true");
      delBtn.setAttribute("title", t("txList.selectFirst"));
    } else {
      delBtn.onclick = () => this.openBatchDelete();
    }
  }
  /** 选中集合对应的 Transaction[]（按 filteredTransactions 顺序，保证稳定）。 */
  selectedTxs() {
    if (this.selectedIds.size === 0) return [];
    return this.filteredTransactions.filter((tx) => this.selectedIds.has(tx.id));
  }
  openBatchModify() {
    const selected = this.selectedTxs();
    if (selected.length === 0) return;
    new BatchModifyModal(
      this.app,
      this.adapter,
      selected,
      this.updatedAtById,
      this.accounts,
      this.categories,
      this.accountTypeSettings,
      () => this.onBatchDone()
    ).open();
  }
  /** 批量修改完成回调：刷新列表、清选择、退出多选。 */
  async onBatchDone() {
    this.selectedIds.clear();
    this.selectMode = false;
    await this.reloadAndRender();
  }
  /** 批量删除选中流水：展开结清对端、二次确认、写前备份 + 全有或全无并发检测 + 追加 delete 事件。 */
  async openBatchDelete() {
    if (this.deleting) return;
    const selected = this.selectedTxs();
    if (selected.length === 0) return;
    const { ids, partnerExtra } = planBatchDeleteTargets(selected, this.transactions);
    const msg = partnerExtra > 0 ? t("txList.batchDeleteConfirmPartner", { selected: selected.length, partner: partnerExtra, total: ids.length }) : t("txList.batchDeleteConfirm", { n: selected.length });
    if (!confirm(msg)) return;
    this.deleting = true;
    try {
      await this.adapter.backup("pre-batch-delete");
      const fresh = await this.adapter.loadLog();
      const latestUpdatedAt = latestUpdatedAtById(fresh);
      for (const id of ids) {
        if (hasUpdatedSince(latestUpdatedAt.get(id), this.updatedAtById.get(id) ?? "")) {
          new import_obsidian8.Notice(t("txList.concurrencyConflict"));
          await this.reloadAndRender();
          return;
        }
      }
      const now = nowISO();
      const events = ids.map((id) => ({ op: "delete", targetId: id, updatedAt: now, source: "manual" }));
      await this.adapter.appendEvents(events);
      new import_obsidian8.Notice(t("txList.deletedN", { n: events.length }));
      await this.onBatchDone();
    } catch (e) {
      const m = t("txList.batchDeleteFailed", { msg: formatError(e) });
      new import_obsidian8.Notice(m);
    } finally {
      this.deleting = false;
    }
  }
  /** 排序下拉菜单：浮于 document.body（fixed，不受 .modal-content transform 影响），锚定按钮下方；点选项应用并重渲，点遮罩关闭。 */
  openSortMenu(anchor) {
    this.closeSortMenu();
    const overlay = document.body.createEl("div", { cls: "accounting-sort-overlay" });
    overlay.onclick = () => this.closeSortMenu();
    const rect = anchor.getBoundingClientRect();
    const menu = overlay.createEl("div", { cls: "accounting-sort-menu" });
    menu.onclick = (e) => e.stopPropagation();
    const MENU_W = 150;
    const left = Math.min(rect.left, Math.max(8, window.innerWidth - 8 - MENU_W));
    menu.style.left = `${left}px`;
    menu.style.top = `${rect.bottom + 4}px`;
    for (const opt of SORT_OPTIONS) {
      const active = opt.value === this.filter.sort;
      const item = menu.createEl("div", {
        cls: `accounting-sort-item${active ? " accounting-sort-item-active" : ""}`,
        text: t(opt.i18nKey)
      });
      item.onclick = (e) => {
        e.stopPropagation();
        this.filter.sort = opt.value;
        this.closeSortMenu();
        this.applyFilter();
        this.render();
      };
    }
  }
  closeSortMenu() {
    document.body.querySelectorAll(".accounting-sort-overlay").forEach((el) => el.detach());
  }
  renderList(container) {
    this.teardownObserver();
    const listEl = container.createDiv({ cls: "accounting-transaction-list" });
    this.listEl = listEl;
    if (this.filteredTransactions.length === 0) {
      listEl.createEl("div", {
        text: this.filter.recurringRuleId ? t("txList.emptyRecurring") : t("txList.emptyFiltered"),
        cls: "accounting-empty"
      });
      return;
    }
    const isTimeSort = this.filter.sort === "time-desc" || this.filter.sort === "time-asc";
    if (isTimeSort) {
      this.renderMonthGroups(listEl);
      return;
    }
    this.renderedCount = 0;
    this.appendChunk();
    if (this.renderedCount < this.filteredTransactions.length) {
      this.setupInfiniteScroll();
    }
  }
  /**
   * 时间序按月分组渲染：每月一个可折叠 `<details>`，标题=月份+笔数+收入/支出（+单账户月末累计余额）。
   * 原生 `<details>` 单月 toggle 免 JS state；批量「展开/折叠全部」由 allMonthsExpanded 字段驱动（render 重建按其复位 open，默认仅最新月）。
   * 懒渲染：折叠的 `<details>` 子节点虽不可见但仍占 DOM，故初始只为 open 的月份建行；折叠月在用户展开时（toggle 事件 / 展开全部按钮）才补建，
   * 把「全部」默认场景的 DOM 量从 O(N) 降到 O(最新月)，避免一次同步建数万节点卡顿。
   */
  renderMonthGroups(listEl) {
    const accountId = this.filter.accountId;
    const singleAccount = !!accountId;
    const balanceByTxId = singleAccount ? computeRunningBalanceForAccount(this.transactions, this.accounts, accountId) : null;
    const groups = buildMonthGroups(this.filteredTransactions, {
      sort: this.filter.sort === "time-desc" ? "time-desc" : "time-asc",
      base: this.baseCurrency,
      singleAccount,
      accountId,
      balanceByTxId
    });
    const latestYm = groups.reduce((m, g) => g.ym > m ? g.ym : m, "");
    const fmtInt = (n) => {
      const sign = n < 0 ? "-" : "";
      return sign + Math.round(Math.abs(n)).toLocaleString("zh-CN", { maximumFractionDigits: 0 });
    };
    for (const g of groups) {
      const details = listEl.createEl("details", { cls: "accounting-month-group" });
      const shouldOpen = this.allMonthsExpanded === true ? true : this.allMonthsExpanded === false ? false : g.ym === latestYm;
      details.open = shouldOpen;
      this.monthTxsByDetails.set(details, g.txs);
      const head = details.createEl("summary", { cls: "accounting-collapsible-head accounting-month-head" });
      const label = head.createDiv({ cls: "accounting-month-label" });
      label.createSpan({ text: formatMonthDisplay(g.ym, getLocale()) });
      label.createSpan({ text: `(${g.txs.length})`, cls: "accounting-month-count" });
      const totals = head.createDiv({ cls: "accounting-month-totals" });
      const inLabel = singleAccount ? t("txList.monthIn") : t("txList.monthIncome");
      const outLabel = singleAccount ? t("txList.monthOut") : t("txList.monthExpense");
      totals.createSpan({ text: `${inLabel} ${fmtInt(g.income)}`, cls: "accounting-amount-positive" });
      totals.createSpan({ text: `${outLabel} ${fmtInt(g.expense)}`, cls: "accounting-amount-negative" });
      if (g.endBalance != null) {
        totals.createSpan({
          text: t("txList.balancePrefix", { amount: fmtInt(g.endBalance) }),
          cls: g.endBalance < 0 ? "accounting-amount-negative" : "accounting-month-balance",
          attr: { title: t("txList.monthBalanceTitle", { account: this.accountById.get(accountId)?.name ?? accountId }) }
        });
      }
      if (shouldOpen) {
        this.renderMonthRows(details);
      } else {
        details.addEventListener("toggle", () => {
          if (details.open) this.ensureMonthRows(details);
        });
      }
    }
  }
  /** 立即把某月所有流水行挂到其 <details>（首次渲染）。 */
  renderMonthRows(details) {
    const txs = this.monthTxsByDetails.get(details);
    if (!txs) return;
    for (const tx of txs) this.renderTransaction(details, tx);
    details.dataset.rendered = "1";
  }
  /** 幂等补建：仅在该月尚未渲染过时建行（折叠→展开的懒入口：toggle 事件 / 展开全部按钮）。 */
  ensureMonthRows(details) {
    if (details.dataset.rendered) return;
    this.renderMonthRows(details);
  }
  /** 追加下一批流水到列表尾部；首批与滚动触达预载区时复用。加载到顶即收尾观察者。 */
  appendChunk() {
    const listEl = this.listEl;
    if (!listEl) return;
    const total = this.filteredTransactions.length;
    const end = Math.min(this.renderedCount + PAGE_SIZE, total);
    for (let i = this.renderedCount; i < end; i++) {
      const tx = this.filteredTransactions[i];
      if (!tx) break;
      this.renderTransaction(listEl, tx);
    }
    this.renderedCount = end;
    if (this.renderedCount >= total) {
      this.teardownObserver();
    } else if (this.sentinelEl) {
      listEl.appendChild(this.sentinelEl);
    }
  }
  /** 列表尾部放哨兵，进入 root 下方 300px 预载区即追加下一批，直到全部加载完。 */
  setupInfiniteScroll() {
    const listEl = this.listEl;
    if (!listEl) return;
    const sentinel = listEl.createDiv({ cls: "accounting-load-more", text: t("txList.loadMore") });
    this.sentinelEl = sentinel;
    this.loadMoreObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.appendChunk();
        }
      },
      { root: listEl, rootMargin: "0px 0px 300px 0px" }
    );
    this.loadMoreObserver.observe(sentinel);
  }
  /** 断开滚动观察者并清空列表引用；filter 重渲、关闭弹窗时调用，避免泄漏与误触发。 */
  teardownObserver() {
    if (this.loadMoreObserver) {
      this.loadMoreObserver.disconnect();
      this.loadMoreObserver = null;
    }
    if (this.sentinelEl) {
      this.sentinelEl.remove();
      this.sentinelEl = null;
    }
    this.listEl = null;
  }
  renderTransaction(container, tx) {
    const selected = this.selectedIds.has(tx.id);
    const row = container.createDiv({ cls: `accounting-transaction-row${this.selectMode ? " accounting-tx-select-mode" : ""}${selected ? " accounting-tx-selected" : ""}` });
    row.onclick = () => {
      if (this.selectMode) {
        if (this.selectedIds.has(tx.id)) {
          this.selectedIds.delete(tx.id);
        } else {
          this.selectedIds.add(tx.id);
        }
        this.render();
        return;
      }
      new TransactionDetailModal(
        this.app,
        this.adapter,
        tx,
        this.accounts,
        this.categories,
        this.transactions,
        () => this.reloadAndRender(),
        this.navCtx
      ).open();
    };
    if (this.selectMode) {
      const check = row.createDiv({ cls: `accounting-tx-check${selected ? " accounting-tx-check-on" : ""}` });
      check.createSpan({ text: selected ? "\u2713" : "" });
    }
    const left = row.createDiv({ cls: "accounting-tx-left" });
    left.createEl("span", {
      text: this.typeLabel(tx.type),
      cls: `accounting-tx-type accounting-tx-${tx.type}`
    });
    if (this.conflictIds.has(tx.id)) {
      left.createEl("span", {
        text: "\u26A0\uFE0F",
        cls: "accounting-tx-conflict-mark",
        attr: { title: t("tiedConflict.badgeTip"), "aria-label": t("tiedConflict.badgeTip") }
      });
    }
    left.createEl("div", {
      text: this.formatTime(tx.ts),
      cls: "accounting-tx-time"
    });
    const middle = row.createDiv({ cls: "accounting-tx-middle" });
    middle.createEl("div", { text: this.formatDetail(tx), cls: "accounting-tx-detail" });
    if (tx.note) {
      middle.createEl("div", { text: tx.note, cls: "accounting-tx-note" });
    }
    const right = row.createDiv({ cls: "accounting-tx-right" });
    right.createEl("span", {
      text: formatMoney(tx.amount, tx.currency),
      cls: `accounting-tx-amount ${this.amountClass(tx)}`
    });
  }
  /** 是否有任意筛选项生效（决定是否显示统一「清除」按钮；对齐桌面 hasFilter）。 */
  hasActiveFilter() {
    const f = this.filter;
    return f.types.length > 0 || !!f.accountId || !!f.keyword || !!f.recurringRuleId || !!f.category || f.uncategorized || f.quickActive !== "halfYear" || f.start !== monthsAgoDateInput(6) || f.end !== todayDateInput();
  }
  /** 重置所有筛选项到默认（近6月 + 全部类型/账户 + 无关键词 + 无周期账；对齐桌面 clearAll）。 */
  resetFilter() {
    this.filter = {
      start: monthsAgoDateInput(6),
      end: todayDateInput(),
      types: [],
      keyword: "",
      accountId: "",
      recurringRuleId: "",
      category: "",
      uncategorized: false,
      quickActive: "halfYear",
      sort: this.filter.sort
      // 排序非筛选维度，清除时保留（对齐桌面 clearAll 不动 sort）
    };
  }
  applyFilter() {
    this.filteredTransactions = filterAndSortTransactions(this.transactions, {
      types: this.filter.types,
      account: this.filter.accountId,
      category: this.filter.category,
      uncategorized: this.filter.uncategorized ? true : void 0,
      recurringRuleId: this.filter.recurringRuleId,
      minAmount: null,
      maxAmount: null,
      from: this.filter.start,
      to: this.filter.end,
      query: this.filter.keyword,
      sort: this.filter.sort
    });
  }
  /** 应用 freshly-loaded 事件：折叠交易 + 更新 updatedAt 索引 + 检测打平冲突（行角标 + 一次性 Notice）。 */
  applyEvents(events) {
    this.updatedAtById = latestUpdatedAtById(events);
    this.transactions = foldEvents(events);
    this.tiedConflicts = detectTiedConflicts(events);
    this.conflictIds = new Set(this.tiedConflicts.map((c) => c.id));
    const { sig, notify } = nextConflictNotice(this.prevConflictSig, this.tiedConflicts);
    if (notify) {
      new import_obsidian8.Notice(t("tiedConflict.notice", { count: this.tiedConflicts.length }), 5e3);
    }
    this.prevConflictSig = sig;
  }
  async reloadAndRender() {
    try {
      const events = await this.adapter.loadLog();
      this.applyEvents(events);
      this.accountById = new Map(this.accounts.map((a) => [a.id, a]));
      this.applyFilter();
      this.render();
      this.onDataChanged?.();
    } catch (err) {
      console.error("\u91CD\u65B0\u52A0\u8F7D\u6D41\u6C34\u5931\u8D25:", err);
    }
  }
  typeLabel(type) {
    const labels = {
      expense: t("tx.type.expense"),
      income: t("tx.type.income"),
      transfer: t("tx.type.transfer"),
      loan: t("tx.type.loan")
    };
    return labels[type];
  }
  formatTime(iso) {
    return formatLocalTimestamp(iso, getLocale());
  }
  formatDetail(tx) {
    const accountName = (id) => {
      if (!id) return "";
      const acc = this.accountById.get(id);
      return acc ? acc.name : id;
    };
    switch (tx.type) {
      case "expense":
      case "income":
        return `${accountName(tx.account)} \xB7 ${tx.category || ""}`;
      case "transfer":
        return `${accountName(tx.fromAccount)} \u2192 ${accountName(tx.toAccount)}`;
      case "loan": {
        const dir = tx.direction === "lend" ? t("txList.loanDir.lend") : tx.direction === "borrow" ? t("txList.loanDir.borrow") : tx.direction === "collect" ? t("txList.loanDir.collect") : t("txList.loanDir.repay");
        return `${dir} \xB7 ${accountName(tx.person)}`;
      }
      default:
        return "";
    }
  }
  /** 金额颜色：borrow/collect = 钱进己方（正向），lend/repay = 钱出己方（负向）。 */
  amountClass(tx) {
    if (tx.type === "expense" || tx.type === "transfer") return "accounting-amount-negative";
    if (tx.type === "income") return "accounting-amount-positive";
    return loanCashIn(tx.direction) ? "accounting-amount-positive" : "accounting-amount-negative";
  }
  /** 走 Obsidian 原生关闭：pop 全局 keymap scope（Modal.open 时 push 的 Escape/Tab 捕获）并恢复焦点，
   *  再由基类回调 onClose。默认关闭动画已被 inline animation/transition:none 中和，仍是即时摘除——
   *  若绕过 super.close() 只 detach 容器，scope 不弹、焦点不恢复，会导致关闭后 Obsidian 笔记无法正常编辑。 */
  close() {
    if (this.closing) return;
    this.closing = true;
    super.close();
  }
  onClose() {
    this.closeSortMenu();
    this.teardownObserver();
    this.contentEl.empty();
  }
};

// src/balanceModal.ts
var import_obsidian14 = require("obsidian");

// src/adjustBalanceModal.ts
var import_obsidian9 = require("obsidian");
var AdjustBalanceModal = class extends import_obsidian9.Modal {
  constructor(app, adapter, account, currentBalance, accounts, categories, onSubmitted) {
    super(app);
    this.adapter = adapter;
    this.account = account;
    this.currentBalance = currentBalance;
    this.accounts = accounts;
    this.categories = categories;
    this.onSubmitted = onSubmitted;
  }
  targetEl;
  noteEl;
  categoryEl;
  deltaEl;
  errorEl;
  keyboardAvoidance;
  adjustCat = t("seed.category.adjust");
  selectedCategory = this.adjustCat;
  /** 交易时间（datetime-local 表单值）；默认当前时刻，提交时转本地偏移 ISO 写入 ts */
  tsValue = nowDatetimeLocal();
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian9.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.addClass("accounting-adjust-modal");
    const titleRow = contentEl.createDiv({ cls: "accounting-adjust-title-row" });
    titleRow.createEl("div", {
      text: t("adjust.title", { name: this.account.name }),
      cls: "accounting-adjust-title"
    });
    appendHeaderHelp(titleRow, {
      detail: t("adjust.detail"),
      ariaLabel: t("adjust.ariaLabel")
    });
    contentEl.createEl("div", {
      text: t("adjust.currentBalance", { balance: formatMoney(this.currentBalance, this.account.currency) }),
      cls: "accounting-adjust-current"
    });
    const targetRow = contentEl.createDiv({ cls: "accounting-adjust-row" });
    targetRow.createEl("label", { text: t("adjust.targetLabel"), cls: "accounting-adjust-label" });
    this.targetEl = targetRow.createEl("input", { cls: "accounting-adjust-input" });
    this.targetEl.type = "number";
    this.targetEl.step = "0.01";
    this.targetEl.inputMode = "decimal";
    this.targetEl.value = String(round2(this.currentBalance));
    this.targetEl.addEventListener("input", () => this.updateDelta());
    this.targetEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.submit();
      if (e.key === "Escape") this.close();
    });
    this.deltaEl = contentEl.createEl("div", { cls: "accounting-adjust-delta" });
    this.updateDelta();
    const categoryRow = contentEl.createDiv({ cls: "accounting-adjust-row" });
    categoryRow.createEl("label", { text: t("entry.field.category"), cls: "accounting-adjust-label" });
    this.categoryEl = categoryRow.createEl("select", { cls: "accounting-adjust-input" });
    this.categoryEl.addEventListener("change", () => {
      this.selectedCategory = this.categoryEl.value;
    });
    this.renderCategoryOptions();
    const noteRow = contentEl.createDiv({ cls: "accounting-adjust-row" });
    noteRow.createEl("label", { text: t("entry.field.note"), cls: "accounting-adjust-label" });
    this.noteEl = noteRow.createEl("input", { cls: "accounting-adjust-input" });
    this.noteEl.type = "text";
    this.noteEl.placeholder = t("adjust.notePlaceholder");
    this.noteEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.submit();
      if (e.key === "Escape") this.close();
    });
    const timeRow = contentEl.createDiv({ cls: "accounting-adjust-row" });
    timeRow.createEl("label", { text: t("entry.field.ts"), cls: "accounting-adjust-label" });
    timeRow.appendChild(createDateField({
      kind: "datetime-local",
      value: this.tsValue,
      cls: "accounting-adjust-input",
      onChange: (iso) => {
        this.tsValue = iso;
      }
    }));
    this.errorEl = contentEl.createDiv();
    const footer = contentEl.createDiv({ cls: "accounting-adjust-footer" });
    const cancel = footer.createEl("button", { text: t("common.cancel"), cls: "accounting-btn-secondary" });
    cancel.onclick = () => this.close();
    const submit = footer.createEl("button", { text: t("adjust.submitBtn"), cls: "accounting-btn-primary" });
    submit.onclick = () => this.submit();
    this.keyboardAvoidance = bindKeyboardAvoidance({
      rootEl: contentEl,
      modalEl: this.modalEl,
      mode: "top"
    });
    window.setTimeout(() => {
      this.targetEl.focus();
      this.targetEl.select();
    }, 50);
  }
  updateDelta() {
    const res = evaluateAmount(this.targetEl.value);
    if (!res.ok) {
      this.deltaEl.setText("");
      this.renderCategoryOptions();
      return;
    }
    const delta = round2(res.value - this.currentBalance);
    if (delta === 0) {
      this.deltaEl.setText(t("adjust.deltaZero"));
    } else if (delta > 0) {
      this.deltaEl.setText(t("adjust.deltaIncome", { amt: formatMoney(delta, this.account.currency), cur: this.account.currency }));
    } else {
      this.deltaEl.setText(t("adjust.deltaExpense", { amt: formatMoney(delta, this.account.currency), cur: this.account.currency }));
    }
    this.renderCategoryOptions();
  }
  /** 按当前差额方向重算分类下拉可选项；方向翻转时把所选分类回落到「余额调整」 */
  renderCategoryOptions() {
    if (!this.categoryEl) return;
    const res = evaluateAmount(this.targetEl.value);
    const delta = res.ok ? round2(res.value - this.currentBalance) : 0;
    const flow = delta > 0 ? "income" : "expense";
    const opts = adjustCategoryOptions(this.categories, flow, this.adjustCat);
    this.categoryEl.empty();
    for (const cat of opts) {
      const o = this.categoryEl.createEl("option", { text: cat.name });
      o.value = cat.name;
    }
    this.selectedCategory = resolveAdjustCategory(this.selectedCategory, this.categories, flow, this.adjustCat);
    this.categoryEl.value = this.selectedCategory;
  }
  showError(msg) {
    this.errorEl.empty();
    this.errorEl.createEl("div", { text: msg, cls: "accounting-error" });
  }
  async ensureCategory() {
    const flows = ["expense", "income"];
    let next = [...this.categories];
    let changed = false;
    for (const f of flows) {
      const existing = next.find((c) => c.flow === f && c.name === this.adjustCat);
      if (!existing) {
        next = [...next, { id: newCategoryId(), flow: f, name: this.adjustCat }];
        changed = true;
      } else if (existing.active === false) {
        next = next.map((c) => c.id === existing.id ? { ...c, active: true } : c);
        changed = true;
      }
    }
    if (!changed) return;
    await this.adapter.writeMeta({ accounts: this.accounts, categories: next });
    this.categories.length = 0;
    this.categories.push(...next);
  }
  async submit() {
    const targetRaw = this.targetEl.value;
    if (!targetRaw) return this.showError(t("adjust.errEmptyTarget"));
    const targetRes = evaluateAmount(targetRaw);
    const target = targetRes.ok ? round2(targetRes.value) : Number.NaN;
    if (Number.isNaN(target)) return this.showError(t("adjust.errInvalidTarget"));
    const delta = round2(target - this.currentBalance);
    if (delta === 0) {
      this.close();
      return;
    }
    const category = resolveAdjustCategory(this.selectedCategory, this.categories, delta > 0 ? "income" : "expense", this.adjustCat);
    if (category === this.adjustCat) {
      await this.ensureCategory();
    }
    const userNote = this.noteEl.value.trim();
    const noteText = `${this.adjustCat} ${this.currentBalance.toFixed(2)}\u2192${target.toFixed(2)}${userNote ? "\uFF5C" + userNote : ""}`;
    const now = nowISO();
    const ev = {
      op: "upsert",
      id: newTxId(),
      type: delta > 0 ? "income" : "expense",
      ts: datetimeLocalToISO(this.tsValue),
      amount: Math.abs(delta),
      currency: this.account.currency,
      account: this.account.id,
      category,
      note: noteText,
      createdAt: now,
      updatedAt: now,
      source: "manual"
    };
    try {
      await this.adapter.appendEvents([ev]);
      this.onSubmitted();
      this.close();
    } catch (err) {
      this.showError(t("adjust.writeFailed", { msg: formatError(err) }));
    }
  }
  onClose() {
    this.keyboardAvoidance?.dispose();
    this.keyboardAvoidance = void 0;
    this.contentEl.empty();
  }
};

// src/accountActionModal.ts
var import_obsidian12 = require("obsidian");

// src/accountPropertiesModal.ts
var import_obsidian10 = require("obsidian");
var AccountPropertiesModal = class extends import_obsidian10.Modal {
  constructor(app, adapter, account, accounts, categories, accountTypeSettings, onSaved) {
    super(app);
    this.adapter = adapter;
    this.account = account;
    this.accounts = accounts;
    this.categories = categories;
    this.accountTypeSettings = accountTypeSettings;
    this.onSaved = onSaved;
  }
  nameEl;
  typeEl;
  openingEl;
  currencyEl;
  noteEl;
  creditLimitEl;
  billingDayEl;
  repaymentEl;
  creditBlockEl;
  footerEl;
  editing = false;
  rates = {};
  baseCurrency = "CNY";
  keyboardAvoidance;
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    try {
      this.rates = await this.adapter.readRates();
      this.baseCurrency = await this.adapter.readBaseCurrency();
    } catch {
    }
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian10.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.addClass("accounting-adjust-modal");
    contentEl.createEl("div", { text: t("account.properties.title", { name: this.account.name }), cls: "accounting-adjust-title" });
    const nameRow = this.row(t("account.field.name"));
    this.nameEl = this.input(nameRow, "text");
    const typeRow = this.row(t("account.field.type"));
    this.typeEl = this.select(typeRow);
    this.typeEl.onchange = () => this.toggleCredit();
    const openRow = this.row(t("account.field.openingBalance"));
    this.openingEl = this.input(openRow, "number", "0.01");
    const curRow = this.row(t("account.field.currencyLocked"));
    this.currencyEl = this.currencySelect(curRow);
    this.currencyEl.title = t("account.field.currencyLockedHint");
    const noteRow = this.row(t("account.field.note"));
    this.noteEl = this.input(noteRow, "text");
    this.creditBlockEl = contentEl.createDiv({ cls: "accounting-credit-block" });
    const clRow = this.row(t("account.field.creditLimit"), this.creditBlockEl);
    this.creditLimitEl = this.input(clRow, "number", "0.01");
    const bdRow = this.row(t("account.field.billingDay"), this.creditBlockEl);
    this.billingDayEl = this.input(bdRow, "number");
    this.billingDayEl.min = "1";
    this.billingDayEl.max = "31";
    this.billingDayEl.placeholder = "1-31";
    const rdRow = this.row(t("account.field.repaymentDay"), this.creditBlockEl);
    this.repaymentEl = this.input(rdRow, "number");
    this.repaymentEl.min = "1";
    this.repaymentEl.max = "31";
    this.repaymentEl.placeholder = "1-31";
    contentEl.createEl("div", {
      text: t("account.properties.timestamps", { created: fmtTime(this.account.createdAt), modified: fmtTime(this.account.updatedAt) }),
      cls: "accounting-adjust-current"
    });
    this.footerEl = contentEl.createDiv({ cls: "accounting-adjust-footer" });
    this.refillFrom(this.account);
    this.setEditable(false);
    this.renderFooter();
    contentEl.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.editing) this.cancelEdit();
        else this.close();
      }
    });
    this.keyboardAvoidance = bindKeyboardAvoidance({
      rootEl: contentEl,
      modalEl: this.modalEl,
      mode: "top"
    });
  }
  row(label, parent) {
    const host = parent ?? this.contentEl;
    const r = host.createDiv({ cls: "accounting-adjust-row" });
    r.createEl("label", { text: label, cls: "accounting-adjust-label" });
    return r;
  }
  input(parent, type, step) {
    const el = parent.createEl("input", { cls: "accounting-adjust-input" });
    el.type = type;
    if (step) el.step = step;
    if (type === "number") el.inputMode = "decimal";
    return el;
  }
  select(parent) {
    const el = parent.createEl("select", { cls: "accounting-adjust-input" });
    for (const at of this.accountTypeSettings.types) {
      el.createEl("option", { text: displayTypeLabel2(at.type, at.label), value: at.type });
    }
    return el;
  }
  currencySelect(parent) {
    const el = parent.createEl("select", { cls: "accounting-adjust-input" });
    const currencies = currencyOptions(this.rates, this.accounts, this.baseCurrency);
    for (const c of currencies) {
      el.createEl("option", { text: c, value: c });
    }
    return el;
  }
  toggleCredit() {
    this.creditBlockEl.style.display = this.typeEl.value === "credit" ? "" : "none";
  }
  /** 用指定账户的值重填所有字段（初始填充 / 取消恢复 / 保存后刷新查看态） */
  refillFrom(a) {
    this.nameEl.value = a.name;
    for (const opt of Array.from(this.typeEl.options)) {
      opt.selected = opt.value === a.type;
    }
    this.openingEl.value = String(a.openingBalance);
    for (const opt of Array.from(this.currencyEl.options)) {
      opt.selected = opt.value === (a.currency || "CNY");
    }
    this.noteEl.value = a.note ?? "";
    this.creditLimitEl.value = a.creditLimit != null ? String(a.creditLimit) : "";
    this.billingDayEl.value = a.billingDay != null ? String(a.billingDay) : "";
    this.repaymentEl.value = a.repaymentDay != null ? String(a.repaymentDay) : "";
    this.toggleCredit();
  }
  /** 切换查看/编辑态：禁用或启用所有字段（币种除外——创建后不可变更，始终只读） */
  setEditable(editable) {
    this.editing = editable;
    const els = [
      this.nameEl,
      this.typeEl,
      this.openingEl,
      this.noteEl,
      this.creditLimitEl,
      this.billingDayEl,
      this.repaymentEl
    ];
    for (const el of els) el.disabled = !editable;
    this.currencyEl.disabled = true;
  }
  /** 按当前态重渲染底部按钮：查看态=「关闭 / 编辑」，编辑态=「取消 / 保存」 */
  renderFooter() {
    this.footerEl.empty();
    if (this.editing) {
      const cancel = this.footerEl.createEl("button", { text: t("common.cancel"), cls: "accounting-btn-secondary" });
      cancel.onclick = () => this.cancelEdit();
      const save = this.footerEl.createEl("button", { text: t("common.save"), cls: "accounting-btn-primary" });
      save.onclick = () => void this.submit();
    } else {
      const close = this.footerEl.createEl("button", { text: t("common.close"), cls: "accounting-btn-secondary" });
      close.onclick = () => this.close();
      const edit = this.footerEl.createEl("button", { text: t("common.edit"), cls: "accounting-btn-primary" });
      edit.onclick = () => this.enterEdit();
    }
  }
  enterEdit() {
    this.setEditable(true);
    this.renderFooter();
    this.nameEl.focus();
    this.nameEl.select();
  }
  /** 取消编辑：恢复字段为账户当前值，回查看态 */
  cancelEdit() {
    this.refillFrom(this.account);
    this.setEditable(false);
    this.renderFooter();
    this.keyboardAvoidance?.reset();
  }
  async submit() {
    const edits = {
      name: this.nameEl.value,
      type: this.typeEl.value,
      openingBalance: this.openingEl.value,
      currency: this.currencyEl.value || "CNY",
      note: this.noteEl.value,
      creditLimit: this.creditLimitEl.value,
      billingDay: this.billingDayEl.value,
      repaymentDay: this.repaymentEl.value
    };
    const updated = applyAccountEdits(this.account, edits, nowISO());
    try {
      await this.adapter.writeMeta({
        accounts: this.accounts.map((a) => a.id === this.account.id ? updated : a),
        categories: this.categories
      });
      new import_obsidian10.Notice(t("account.properties.savedNotif"));
      this.account = updated;
      this.onSaved();
      this.refillFrom(this.account);
      this.setEditable(false);
      this.renderFooter();
      this.keyboardAvoidance?.reset();
    } catch (err) {
      new import_obsidian10.Notice(t("entry.saveFailed", { msg: formatError(err) }));
    }
  }
  onClose() {
    this.keyboardAvoidance?.dispose();
    this.keyboardAvoidance = void 0;
    this.contentEl.empty();
  }
};
function fmtTime(iso) {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// src/accountMergeModal.ts
var import_obsidian11 = require("obsidian");
var AccountMergeModal = class extends import_obsidian11.Modal {
  constructor(app, adapter, source, allAccounts, onDone) {
    super(app);
    this.adapter = adapter;
    this.source = source;
    this.allAccounts = allAccounts;
    this.onDone = onDone;
  }
  targetSelect;
  errorEl;
  submitting = false;
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian11.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: t("account.merge.title") });
    contentEl.createEl("div", {
      text: t("account.merge.intro", { name: this.source.name }),
      cls: "accounting-ledger-folder"
    });
    contentEl.createEl("div", {
      text: t("account.merge.currencyHint", { cur: this.source.currency }),
      cls: "accounting-ledger-folder"
    });
    const targets = this.allAccounts.filter((a) => a.id !== this.source.id && canMergeAccount(this.source, a));
    this.targetSelect = contentEl.createEl("select", { cls: "accounting-ledger-input" });
    this.targetSelect.createEl("option", { value: "", text: t("account.merge.targetPlaceholder") });
    for (const tgt of targets) {
      this.targetSelect.createEl("option", {
        value: tgt.id,
        text: tgt.active === false ? t("account.merge.targetHidden", { name: tgt.name }) : tgt.name
      });
    }
    this.errorEl = contentEl.createEl("div", { cls: "accounting-ledger-error" });
    const actions = contentEl.createDiv("accounting-modal-actions");
    const cancelBtn = actions.createEl("button", { text: t("common.cancel"), cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
    const submitBtn = actions.createEl("button", { text: t("account.merge.confirmBtn"), cls: "accounting-btn-primary" });
    submitBtn.onclick = () => void this.submit();
    setTimeout(() => this.targetSelect.focus(), 0);
  }
  async submit() {
    if (this.submitting) return;
    const toId = this.targetSelect.value;
    if (!toId) {
      this.errorEl.setText(t("account.merge.errNoTarget"));
      return;
    }
    const target = this.allAccounts.find((a) => a.id === toId);
    const targetName = target?.name ?? toId;
    if (!confirm(
      t("account.merge.confirmMsg", { source: this.source.name, target: targetName })
    )) {
      return;
    }
    this.submitting = true;
    try {
      const events = await this.adapter.loadLog();
      const meta = await this.adapter.readMeta();
      const plan = planMergeAccount({
        events,
        accounts: meta.accounts,
        fromId: this.source.id,
        toId,
        now: nowISO()
      });
      if (plan.events.length > 0) {
        await this.adapter.backup("pre-merge");
        await this.adapter.appendEvents(plan.events);
      }
      await this.adapter.writeMeta({ accounts: plan.accounts, categories: meta.categories });
      const parts = [t("account.merge.resultRewritten", { n: plan.rewritten })];
      if (plan.deleted > 0) parts.push(t("account.merge.resultDeleted", { n: plan.deleted }));
      parts.push(t("account.merge.resultMerged", { source: this.source.name, target: targetName }));
      new import_obsidian11.Notice(parts.join(t("account.merge.resultSep")));
      this.close();
      this.onDone();
    } catch (err) {
      this.submitting = false;
      console.error("\u5408\u5E76\u8D26\u6237\u5931\u8D25:", err);
      this.errorEl.setText(t("account.merge.failed", { msg: formatError(err) }));
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/accountActionModal.ts
var AccountActionModal = class extends import_obsidian12.Modal {
  constructor(app, adapter, account, accounts, categories, accountTypeSettings, navCtx, onSaved) {
    super(app);
    this.adapter = adapter;
    this.account = account;
    this.accounts = accounts;
    this.categories = categories;
    this.accountTypeSettings = accountTypeSettings;
    this.navCtx = navCtx;
    this.onSaved = onSaved;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian12.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("div", { text: this.account.name, cls: "accounting-action-title" });
    const list = contentEl.createDiv({ cls: "accounting-action-list" });
    const txItem = list.createEl("button", { cls: "accounting-action-item" });
    txItem.createEl("span", { text: t("account.action.viewTx"), cls: "accounting-action-item-text" });
    txItem.title = t("account.action.viewTxHint");
    txItem.onclick = () => {
      this.close();
      this.navCtx.openList(this.account.id, void 0, true, void 0, this.onSaved);
    };
    const propItem = list.createEl("button", { cls: "accounting-action-item" });
    propItem.createEl("span", { text: t("account.action.viewProps"), cls: "accounting-action-item-text" });
    propItem.title = t("account.action.viewPropsHint");
    propItem.onclick = () => {
      this.close();
      new AccountPropertiesModal(
        this.app,
        this.adapter,
        this.account,
        this.accounts,
        this.categories,
        this.accountTypeSettings,
        this.onSaved
      ).open();
    };
    const toggleActiveItem = list.createEl("button", { cls: "accounting-action-item" });
    const nextActive = !this.account.active;
    toggleActiveItem.createEl("span", { text: nextActive ? t("account.action.enable") : t("account.action.hide"), cls: "accounting-action-item-text" });
    toggleActiveItem.title = nextActive ? t("account.action.enableHint") : t("account.action.hideHint");
    toggleActiveItem.onclick = () => {
      void this.toggleAccountActive(nextActive);
    };
    if (this.accounts.filter((a) => a.id !== this.account.id).length > 0) {
      const mergeItem = list.createEl("button", { cls: "accounting-action-item" });
      mergeItem.createEl("span", { text: t("account.action.merge"), cls: "accounting-action-item-text" });
      mergeItem.title = t("account.action.mergeHint");
      mergeItem.onclick = () => {
        this.close();
        new AccountMergeModal(this.app, this.adapter, this.account, this.accounts, this.onSaved).open();
      };
    }
    const closeWrap = contentEl.createDiv({ cls: "accounting-modal-close" });
    const closeBtn = closeWrap.createEl("button", { text: t("common.close"), cls: "accounting-btn-secondary" });
    closeBtn.onclick = () => this.close();
  }
  async toggleAccountActive(active) {
    try {
      const meta = await this.adapter.readMeta();
      const target = meta.accounts.find((a) => a.id === this.account.id);
      if (!target) {
        new import_obsidian12.Notice(t("account.action.notFound"));
        this.close();
        this.onSaved();
        return;
      }
      await this.adapter.writeMeta({
        accounts: meta.accounts.map((a) => a.id === this.account.id ? { ...a, active } : a),
        categories: meta.categories
      });
      new import_obsidian12.Notice(active ? t("account.action.enabledNotif", { name: target.name }) : t("account.action.hiddenNotif", { name: target.name }));
      this.close();
      this.onSaved();
    } catch (err) {
      new import_obsidian12.Notice(t("account.action.updateFailed", { msg: formatError(err) }));
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/accountCreateModal.ts
var import_obsidian13 = require("obsidian");
var AccountCreateModal = class extends import_obsidian13.Modal {
  constructor(app, adapter, accounts, categories, accountTypeSettings, onSaved) {
    super(app);
    this.adapter = adapter;
    this.accounts = accounts;
    this.categories = categories;
    this.accountTypeSettings = accountTypeSettings;
    this.onSaved = onSaved;
  }
  nameEl;
  typeEl;
  openingEl;
  currencyEl;
  noteEl;
  creditLimitEl;
  billingDayEl;
  repaymentEl;
  creditBlockEl;
  footerEl;
  rates = {};
  baseCurrency = "CNY";
  keyboardAvoidance;
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    try {
      this.rates = await this.adapter.readRates();
      this.baseCurrency = await this.adapter.readBaseCurrency();
    } catch {
    }
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian13.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.addClass("accounting-adjust-modal");
    contentEl.createEl("div", { text: t("account.create.title"), cls: "accounting-adjust-title" });
    const nameRow = this.row(t("account.field.name"));
    this.nameEl = this.input(nameRow, "text");
    const typeRow = this.row(t("account.field.type"));
    this.typeEl = this.select(typeRow);
    this.typeEl.onchange = () => this.toggleCredit();
    const openRow = this.row(t("account.field.openingBalance"));
    this.openingEl = this.input(openRow, "number", "0.01");
    const curRow = this.row(t("account.field.currency"));
    this.currencyEl = this.currencySelect(curRow);
    const noteRow = this.row(t("account.field.note"));
    this.noteEl = this.input(noteRow, "text");
    this.creditBlockEl = contentEl.createDiv({ cls: "accounting-credit-block" });
    const clRow = this.row(t("account.field.creditLimit"), this.creditBlockEl);
    this.creditLimitEl = this.input(clRow, "number", "0.01");
    const bdRow = this.row(t("account.field.billingDay"), this.creditBlockEl);
    this.billingDayEl = this.input(bdRow, "number");
    this.billingDayEl.min = "1";
    this.billingDayEl.max = "31";
    this.billingDayEl.placeholder = "1-31";
    const rdRow = this.row(t("account.field.repaymentDay"), this.creditBlockEl);
    this.repaymentEl = this.input(rdRow, "number");
    this.repaymentEl.min = "1";
    this.repaymentEl.max = "31";
    this.repaymentEl.placeholder = "1-31";
    this.footerEl = contentEl.createDiv({ cls: "accounting-adjust-footer" });
    this.initializeDefaults();
    this.renderFooter();
    contentEl.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.close();
      }
    });
    this.keyboardAvoidance = bindKeyboardAvoidance({
      rootEl: contentEl,
      modalEl: this.modalEl,
      mode: "top"
    });
  }
  row(label, parent) {
    const host = parent ?? this.contentEl;
    const r = host.createDiv({ cls: "accounting-adjust-row" });
    r.createEl("label", { text: label, cls: "accounting-adjust-label" });
    return r;
  }
  input(parent, type, step) {
    const el = parent.createEl("input", { cls: "accounting-adjust-input" });
    el.type = type;
    if (step) el.step = step;
    if (type === "number") el.inputMode = "decimal";
    return el;
  }
  select(parent) {
    const el = parent.createEl("select", { cls: "accounting-adjust-input" });
    for (const at of this.accountTypeSettings.types) {
      el.createEl("option", { text: displayTypeLabel2(at.type, at.label), value: at.type });
    }
    return el;
  }
  currencySelect(parent) {
    const el = parent.createEl("select", { cls: "accounting-adjust-input" });
    const currencies = currencyOptions(this.rates, this.accounts, this.baseCurrency);
    for (const c of currencies) {
      el.createEl("option", { text: c, value: c });
    }
    return el;
  }
  toggleCredit() {
    this.creditBlockEl.style.display = this.typeEl.value === "credit" ? "" : "none";
  }
  /** 初始化默认值：币种=本位币，类型=第一个启用类型，其他为空 */
  initializeDefaults() {
    for (const opt of Array.from(this.currencyEl.options)) {
      opt.selected = opt.value === this.baseCurrency;
    }
    const firstEnabled = this.accountTypeSettings.types.find((at) => at.active !== false);
    if (firstEnabled) {
      for (const opt of Array.from(this.typeEl.options)) {
        opt.selected = opt.value === firstEnabled.type;
      }
    }
    this.openingEl.value = "0";
    this.toggleCredit();
    this.nameEl.addEventListener("input", () => this.updateSaveButton());
    this.updateSaveButton();
  }
  /** 更新保存按钮状态（名称为空时禁用） */
  updateSaveButton() {
    const saveBtn = this.footerEl?.querySelector(".accounting-btn-primary");
    if (saveBtn) {
      saveBtn.disabled = !this.nameEl.value.trim();
    }
  }
  /** 渲染底部按钮：取消 / 保存 */
  renderFooter() {
    this.footerEl.empty();
    const cancel = this.footerEl.createEl("button", { text: t("common.cancel"), cls: "accounting-btn-secondary" });
    cancel.onclick = () => this.close();
    const save = this.footerEl.createEl("button", { text: t("common.save"), cls: "accounting-btn-primary" });
    save.disabled = true;
    save.onclick = () => void this.submit();
  }
  async submit() {
    const name = this.nameEl.value.trim();
    const type = this.typeEl.value;
    const openingBalance = this.openingEl.value;
    const currency = this.currencyEl.value || "CNY";
    const note = this.noteEl.value;
    const creditLimit = this.creditLimitEl.value;
    const billingDay = this.billingDayEl.value;
    const repaymentDay = this.repaymentEl.value;
    if (billingDay && (parseInt(billingDay) < 1 || parseInt(billingDay) > 31)) {
      new import_obsidian13.Notice(t("account.err.billingDayRange"));
      return;
    }
    if (repaymentDay && (parseInt(repaymentDay) < 1 || parseInt(repaymentDay) > 31)) {
      new import_obsidian13.Notice(t("account.err.repaymentDayRange"));
      return;
    }
    const id = crypto.randomUUID();
    const now = nowISO();
    const newAccount = {
      id,
      name,
      type,
      openingBalance: parseFloat(openingBalance) || 0,
      currency,
      note: note || void 0,
      creditLimit: type === "credit" ? parseFloat(creditLimit) || void 0 : void 0,
      billingDay: type === "credit" ? parseInt(billingDay) || void 0 : void 0,
      repaymentDay: type === "credit" ? parseInt(repaymentDay) || void 0 : void 0,
      active: true,
      createdAt: now,
      updatedAt: now
    };
    try {
      await this.adapter.writeMeta({
        accounts: [...this.accounts, newAccount],
        categories: this.categories
      });
      new import_obsidian13.Notice(t("account.createdNotif", { name }));
      this.onSaved();
      this.close();
    } catch (err) {
      new import_obsidian13.Notice(t("account.createFailed", { msg: formatError(err) }));
    }
  }
  onClose() {
    this.keyboardAvoidance?.dispose();
    this.keyboardAvoidance = void 0;
    this.contentEl.empty();
  }
};

// src/balanceModal.ts
var BalanceModal = class extends import_obsidian14.Modal {
  constructor(app, adapter, navCtx, slide, onSwitchLedger, onOpened) {
    super(app);
    this.adapter = adapter;
    this.navCtx = navCtx;
    this.slide = slide;
    this.onSwitchLedger = onSwitchLedger;
    this.onOpened = onOpened;
  }
  opened = false;
  closing = false;
  accountTypeSettings = defaultAccountTypeSettings();
  /** 本位币（默认 CNY）：净资产折算目标，refresh 时从账本读取 */
  baseCurrency = "CNY";
  /** 在挂载到 DOM 前就预设全屏类与禁用 Obsidian 默认 modal-pop 动画，避免「先上跳再滑入」。 */
  open() {
    presetModalChrome(this.modalEl, this.containerEl);
    super.open();
  }
  async onOpen() {
    this.opened = true;
    prepareModalContainer(this.containerEl);
    this.modalEl.addClass("accounting-fullscreen");
    this.onOpened?.();
    const sc = slideClass(this.slide);
    if (sc) this.contentEl.addClass(sc);
    if (this.onSwitchLedger) {
      const ledgerAlias = await this.adapter.readActiveLedgerAlias();
      mountLedgerPill(this.modalEl, this.app, this.adapter, ledgerAlias, (name) => {
        this.onSwitchLedger?.(name, () => this.close());
      });
      this.contentEl.addClass("accounting-has-ledger-pill");
    }
    await this.refresh();
  }
  async refresh() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("accounting-balance-modal");
    this.renderNav();
    let snap;
    try {
      snap = await this.loadSnapshot();
    } catch {
      contentEl.createEl("div", {
        text: t("txList.loadFailed"),
        cls: "accounting-empty"
      });
      return;
    }
    if (snap.accounts.length === 0 && snap.transactions.length === 0) {
      contentEl.createEl("div", {
        text: t("balance.emptyNoAccounts"),
        cls: "accounting-empty"
      });
      const createAccountEl2 = contentEl.createDiv({ cls: "accounting-create-account-row" });
      const createBtn2 = createAccountEl2.createEl("button", {
        text: t("balance.createAccountBtn"),
        cls: "accounting-ledger-create"
      });
      createBtn2.onclick = () => {
        new AccountCreateModal(
          this.app,
          this.adapter,
          snap.accounts,
          snap.categories,
          this.accountTypeSettings,
          () => this.refresh()
        ).open();
      };
      return;
    }
    const storedTypes = await this.adapter.readAccountTypeSettings();
    this.accountTypeSettings = storedTypes ? normalizeAccountTypeSettings(storedTypes) : defaultAccountTypeSettings();
    this.baseCurrency = await this.adapter.readBaseCurrency();
    const rates = await this.adapter.readRates();
    const balances = computeBalances(snap.transactions, snap.accounts);
    const nw = computeNetWorth(snap.transactions, snap.accounts, { rates, base: this.baseCurrency, accountTypeSettings: this.accountTypeSettings });
    const baseBalances = convertBalancesToBase(balances, snap.accounts, rates, this.baseCurrency);
    const totalRec = nw.receivables.reduce((s, r) => s + r.amount, 0);
    const totalPay = nw.payables.reduce((s, p) => s + p.amount, 0);
    const negative = nw.netWorth < 0;
    const hero = contentEl.createDiv({ cls: `accounting-nw-hero${negative ? " accounting-nw-hero--neg" : ""}` });
    hero.createEl("div", { text: this.baseCurrency !== "CNY" ? t("balance.netWorthWithCur", { cur: this.baseCurrency }) : t("balance.netWorth"), cls: "accounting-nw-hero-label" });
    hero.createEl("div", { text: formatMoneyInt(nw.netWorth, this.baseCurrency), cls: "accounting-nw-hero-value" });
    const sub = hero.createDiv({ cls: "accounting-nw-hero-sub" });
    const assetCell = sub.createDiv({ cls: "accounting-nw-hero-cell" });
    assetCell.createEl("div", { text: t("balance.totalAssets"), cls: "accounting-nw-hero-cell-label" });
    assetCell.createEl("div", { text: formatMoneyInt(nw.totalAssets, this.baseCurrency), cls: "accounting-nw-hero-cell-value accounting-nw-hero-asset" });
    const liabCell = sub.createDiv({ cls: "accounting-nw-hero-cell accounting-nw-hero-cell--last" });
    liabCell.createEl("div", { text: t("balance.totalLiabilities"), cls: "accounting-nw-hero-cell-label" });
    liabCell.createEl("div", { text: formatMoneyInt(nw.totalLiabilities, this.baseCurrency), cls: "accounting-nw-hero-cell-value accounting-nw-hero-liab" });
    const sum = contentEl.createDiv({ cls: "accounting-summary" });
    sum.createEl("span", { text: t("balance.creditPayable", { amount: formatMoney(nw.creditPayable, this.baseCurrency) }) });
    sum.createEl("span", { text: t("balance.receivablesPayables", { rec: formatMoney(totalRec, this.baseCurrency), pay: formatMoney(totalPay, this.baseCurrency) }) });
    const active = snap.accounts.filter((a) => a.active);
    const hidden = snap.accounts.filter((a) => !a.active);
    this.renderGroups(contentEl, active, balances, baseBalances, snap);
    const createAccountEl = contentEl.createDiv({ cls: "accounting-create-account-row" });
    const createBtn = createAccountEl.createEl("button", {
      text: t("balance.createAccountBtn"),
      cls: "accounting-ledger-create"
    });
    createBtn.onclick = () => {
      new AccountCreateModal(
        this.app,
        this.adapter,
        snap.accounts,
        snap.categories,
        this.accountTypeSettings,
        () => this.refresh()
      ).open();
    };
    if (hidden.length > 0) {
      const h = contentEl.createEl("details", { cls: "accounting-hidden" });
      h.createEl("summary", { text: t("balance.hiddenSummary"), cls: "accounting-collapsible-head" });
      this.renderGroups(h, hidden, balances, baseBalances, snap);
    }
  }
  /** 统一底部导航条（由 CSS 固定到底部，内容区预留 safe-area）。 */
  renderNav() {
    renderNavBar(this.modalEl, "balance", this.navCtx, () => this.close());
  }
  renderGroups(parent, accounts, balances, baseBalances, snap) {
    const typeToGroupId = /* @__PURE__ */ new Map();
    for (const at of this.accountTypeSettings.types) typeToGroupId.set(at.type, at.groupId);
    const byGroup = /* @__PURE__ */ new Map();
    for (const a of accounts) {
      const gid = typeToGroupId.get(a.type) ?? "";
      const arr = byGroup.get(gid) ?? [];
      arr.push(a);
      byGroup.set(gid, arr);
    }
    for (const g of resolveTypeGroups(this.accountTypeSettings)) {
      const items = (byGroup.get(g.id) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name, "zh"));
      if (items.length === 0) continue;
      const group = parent.createEl("details", { cls: "accounting-group" });
      const head = group.createEl("summary", { cls: "accounting-group-head" });
      const groupTotal = items.reduce((s, a) => s + (baseBalances.get(a.id) ?? 0), 0);
      const hasLiability = g.types.some((at) => accountKindOf(this.accountTypeSettings, at.type) === "liability");
      head.createEl("span", { text: `${displayGroupLabel2(g.id, g.label)} \xB7 ${hasLiability ? t("balance.kindLiability") : t("balance.kindAsset")}`, cls: "accounting-group-head-title" });
      head.createEl("span", { text: formatMoney(groupTotal, this.baseCurrency) });
      for (const a of items) {
        const row = group.createDiv({ cls: "accounting-row" });
        const name = row.createEl("span", { cls: "accounting-row-name" });
        const label = name.createEl("span", { text: a.name, cls: "accounting-row-name-label" });
        if (a.note) label.createSpan({ text: ` ${a.note}`, cls: "accounting-muted" });
        name.title = t("balance.accountOptionsHint");
        name.onclick = () => {
          new AccountActionModal(
            this.app,
            this.adapter,
            a,
            snap.accounts,
            snap.categories,
            this.accountTypeSettings,
            this.navCtx,
            () => this.refresh()
          ).open();
        };
        const balance = balances.get(a.id) ?? 0;
        const amountEl = row.createEl("span", { text: formatMoney(balance, a.currency ?? "CNY"), cls: "accounting-row-amount" });
        amountEl.title = t("balance.adjustHint");
        amountEl.onclick = () => {
          new AdjustBalanceModal(
            this.app,
            this.adapter,
            a,
            balance,
            snap.accounts,
            snap.categories,
            () => this.refresh()
          ).open();
        };
      }
    }
  }
  async loadSnapshot() {
    const events = await this.adapter.loadLog();
    const transactions = foldEvents(events);
    const meta = await this.adapter.readMeta();
    return { transactions, accounts: meta.accounts, categories: meta.categories };
  }
  /** 走 Obsidian 原生关闭：pop 全局 keymap scope（Modal.open 时 push 的 Escape/Tab 捕获）并恢复焦点，
   *  再由基类回调 onClose。默认关闭动画已被 inline animation/transition:none 中和，仍是即时摘除——
   *  若绕过 super.close() 只 detach 容器，scope 不弹、焦点不恢复，会导致关闭后 Obsidian 笔记无法正常编辑。 */
  close() {
    if (this.closing) return;
    this.closing = true;
    super.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/reportModal.ts
var import_obsidian15 = require("obsidian");
var RANGE_OPTIONS = [
  { key: "thisMonth", i18nKey: "report.range.thisMonth" },
  { key: "last1m", i18nKey: "report.range.last1m" },
  { key: "last3m", i18nKey: "report.range.last3m" },
  { key: "thisYear", i18nKey: "report.range.thisYear" },
  { key: "last6y", i18nKey: "report.range.last6y" },
  { key: "all", i18nKey: "report.range.all" }
];
var TOP_N = 5;
function formatAxisAmount(n, currency) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const r1 = (x) => Math.round(x * 10) / 10;
  if (currency === "CNY") {
    if (abs >= 1e8) return `${sign}${r1(abs / 1e8)}\u4EBF`;
    if (abs >= 1e4) return abs >= 1e6 ? `${sign}${Math.round(abs / 1e4)}\u4E07` : `${sign}${r1(abs / 1e4)}\u4E07`;
    return `${sign}${Math.round(abs)}`;
  }
  if (abs >= 1e6) return `${sign}${r1(abs / 1e6)}M`;
  if (abs >= 1e3) return `${sign}${r1(abs / 1e3)}k`;
  return `${sign}${Math.round(abs)}`;
}
var ReportModal = class extends import_obsidian15.Modal {
  constructor(app, adapter, navCtx, slide, onSwitchLedger, onOpened) {
    super(app);
    this.adapter = adapter;
    this.navCtx = navCtx;
    this.slide = slide;
    this.onSwitchLedger = onSwitchLedger;
    this.onOpened = onOpened;
  }
  opened = false;
  closing = false;
  transactions = [];
  loadFailed = false;
  range = "last1m";
  /** 账户元数据（净值序列归集用）；reloadData 时从 accounts.json 读取 */
  accounts = [];
  /** 汇率表（多币种折算到本位币）；reloadData 时从 rates.json 读取，缺失为空表（各币种按 1 回退） */
  rates = {};
  /** 支出/收入分类是否展开全部（默认折叠到 TOP_N，点「展开其他」逐项显示，不再合并为「其他」） */
  expandedExpense = false;
  expandedIncome = false;
  /** 本位币（聚合折算目标 + 金额符号；reloadData 时从 ledger.json 读取，默认 CNY） */
  baseCurrency = "CNY";
  /** 在挂载到 DOM 前就预设全屏类与禁用 Obsidian 默认 modal-pop 动画，避免「先上跳再滑入」。 */
  open() {
    presetModalChrome(this.modalEl, this.containerEl);
    super.open();
  }
  async onOpen() {
    this.opened = true;
    prepareModalContainer(this.containerEl);
    this.modalEl.addClass("accounting-fullscreen");
    this.onOpened?.();
    const sc = slideClass(this.slide);
    if (sc) this.contentEl.addClass(sc);
    if (this.onSwitchLedger) {
      const ledgerAlias = await this.adapter.readActiveLedgerAlias();
      mountLedgerPill(this.modalEl, this.app, this.adapter, ledgerAlias, (name) => {
        this.onSwitchLedger?.(name, () => this.close());
      });
      this.contentEl.addClass("accounting-has-ledger-pill");
    }
    await this.reloadData();
  }
  /**
   * 重新从磁盘读取日志并渲染。仅在外部可能改动数据时调用——
   * 分类下钻到流水列表编辑/删除后回调本页时数据已变，必须重读；时间段/展开切换不会改数据，用 render()。
   */
  async reloadData() {
    try {
      const events = await this.adapter.loadLog();
      this.transactions = foldEvents(events);
      this.loadFailed = false;
    } catch {
      this.transactions = [];
      this.loadFailed = true;
    }
    try {
      this.baseCurrency = await this.adapter.readBaseCurrency();
    } catch {
      this.baseCurrency = "CNY";
    }
    try {
      const meta = await this.adapter.readMeta();
      this.accounts = meta.accounts;
    } catch {
      this.accounts = [];
    }
    try {
      this.rates = await this.adapter.readRates();
    } catch {
      this.rates = {};
    }
    this.render();
  }
  /** 用已缓存的 transactions 重渲染（时间段/展开切换用，不读磁盘）。 */
  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("accounting-report-modal");
    this.renderNav();
    if (this.loadFailed) {
      contentEl.createEl("div", {
        text: t("txList.loadFailed"),
        cls: "accounting-empty"
      });
      return;
    }
    if (this.transactions.length === 0) {
      contentEl.createEl("div", {
        text: t("report.emptyNoTx"),
        cls: "accounting-empty"
      });
      return;
    }
    this.renderReport(contentEl);
  }
  /** 统一底部导航条（current='report'）。 */
  renderNav() {
    renderNavBar(this.modalEl, "report", this.navCtx, () => this.close());
  }
  renderReport(container) {
    const earliest = earliestDataDate(this.transactions);
    const { start, end } = rangeBounds(this.range, earliest);
    this.renderRangeSelector(container);
    const totals = periodTotals(this.transactions, start, end, { base: this.baseCurrency });
    this.renderTotals(container, totals);
    const incomeSlices = categoryBreakdown(this.transactions, { flow: "income", start, end, base: this.baseCurrency });
    this.renderCategoryBars(container, t("report.incomeCategory"), incomeSlices, "income", this.expandedIncome, earliest);
    const expenseSlices = categoryBreakdown(this.transactions, { flow: "expense", start, end, base: this.baseCurrency });
    this.renderCategoryBars(container, t("report.expenseCategory"), expenseSlices, "expense", this.expandedExpense, earliest);
    const { points: trendPoints, gran: trendGran } = rangeTrend(this.transactions, this.range, { base: this.baseCurrency, earliestData: earliest });
    this.renderTrend(container, trendPoints, trendGran);
    const { points: nwPoints, gran: nwGran } = rangeNetWorthTrend(this.transactions, this.accounts, this.range, { base: this.baseCurrency, rates: this.rates, earliestData: earliest });
    this.renderNetWorthTrend(container, nwPoints, nwGran);
  }
  renderRangeSelector(container) {
    const box = container.createDiv({ cls: "accounting-filter-box" });
    const row = box.createDiv({ cls: "accounting-filter-row" });
    row.createSpan({ text: t("report.rangeLabel"), cls: "accounting-filter-label" });
    const controls = row.createDiv({ cls: "accounting-filter-controls" });
    for (const opt of RANGE_OPTIONS) {
      const active = this.range === opt.key;
      const btn = controls.createEl("button", {
        text: t(opt.i18nKey),
        cls: `accounting-filter-quick-btn${active ? " accounting-filter-btn-active" : ""}`
      });
      btn.onclick = () => {
        this.range = opt.key;
        this.render();
      };
    }
  }
  renderTotals(container, totals) {
    const cards = container.createDiv({ cls: "accounting-stat-cards" });
    this.statCard(cards, t("report.stat.income"), formatMoneyInt(totals.income, this.baseCurrency), "accounting-stat-income");
    this.statCard(cards, t("report.stat.expense"), formatMoneyInt(totals.expense, this.baseCurrency), "accounting-stat-expense");
    const surplusCls = totals.surplus < 0 ? "accounting-stat-expense" : "accounting-stat-income";
    this.statCard(cards, t("report.stat.surplus"), formatMoneyInt(totals.surplus, this.baseCurrency), surplusCls);
  }
  statCard(parent, label, value, valueCls) {
    const card = parent.createDiv({ cls: "accounting-stat-card" });
    card.createEl("div", { text: label, cls: "accounting-stat-card-label" });
    card.createEl("div", { text: value, cls: `accounting-stat-card-value ${valueCls}` });
  }
  renderCategoryBars(container, title, slices, flow, expanded, earliest) {
    const section = container.createDiv({ cls: "accounting-section" });
    const head = section.createDiv({ cls: "accounting-group-head" });
    head.createEl("span", { text: title });
    const total = slices.reduce((s, x) => s + x.amount, 0);
    head.createEl("span", { text: formatMoney(total, this.baseCurrency) });
    if (slices.length === 0) {
      section.createEl("div", { text: t("report.noData"), cls: "accounting-empty-mini" });
      return;
    }
    const fillCls = flow === "expense" ? "accounting-bar-fill-expense" : "accounting-bar-fill-income";
    const shown = expanded ? slices : slices.slice(0, TOP_N);
    const { start, end } = rangeDateBounds(this.range, earliest);
    for (const s of shown) {
      const uncategorized = s.category === "";
      this.renderBar(section, uncategorized ? t("txList.uncategorized") : s.category, s.amount, s.percent, fillCls, () => {
        this.navCtx.openList(void 0, void 0, true, {
          category: uncategorized ? "" : s.category,
          uncategorized,
          flow,
          start,
          end
        }, () => this.reloadData());
      });
    }
    if (slices.length > TOP_N) {
      const restCount = slices.length - TOP_N;
      const toggle = section.createEl("button", {
        text: expanded ? t("report.collapse") : t("report.expandOthers", { n: restCount }),
        cls: "accounting-bar-toggle"
      });
      toggle.onclick = () => {
        if (flow === "expense") this.expandedExpense = !this.expandedExpense;
        else this.expandedIncome = !this.expandedIncome;
        this.render();
      };
    }
  }
  renderBar(parent, label, amount, percent, fillCls, onClick) {
    const row = parent.createDiv({ cls: "accounting-bar-row" });
    if (onClick) {
      row.addClass("accounting-bar-clickable");
      row.setAttribute("title", t("report.barClickHint"));
      row.setAttribute("role", "button");
      row.setAttribute("tabindex", "0");
      row.onclick = onClick;
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      });
    }
    const info = row.createDiv({ cls: "accounting-bar-info" });
    info.createEl("span", { text: label, cls: "accounting-bar-label" });
    const amountEl = info.createEl("span", { cls: "accounting-bar-amount" });
    amountEl.createSpan({ text: formatMoney(amount, this.baseCurrency) });
    if (percent > 0) {
      amountEl.createSpan({ text: ` ${(percent * 100).toFixed(0)}%`, cls: "accounting-bar-percent" });
    }
    const track = row.createDiv({ cls: "accounting-bar-track" });
    const fill = track.createDiv({ cls: `accounting-bar-fill ${fillCls}` });
    const widthPct = percent > 0 ? Math.max(percent * 100, 2) : 0;
    fill.style.width = `${widthPct.toFixed(2)}%`;
  }
  renderTrend(container, points, gran) {
    const section = container.createDiv({ cls: "accounting-section" });
    const head = section.createDiv({ cls: "accounting-group-head" });
    head.createEl("span", { text: gran === "year" ? t("report.trend.byYear") : t("report.trend.byMonth") });
    const legend = head.createEl("span", { cls: "accounting-trend-legend" });
    legend.createSpan({ text: t("report.stat.surplus"), cls: "accounting-trend-leg-surplus" });
    legend.createSpan({ text: t("report.stat.income"), cls: "accounting-trend-leg-income" });
    legend.createSpan({ text: t("report.stat.expense"), cls: "accounting-trend-leg-expense" });
    if (points.length === 0) {
      section.createEl("div", { text: t("report.noData"), cls: "accounting-empty-mini" });
      return;
    }
    const wrap = section.createDiv({ cls: "accounting-trend-chart-wrap" });
    const info = section.createDiv({ cls: "accounting-trend-info" });
    info.createEl("span", { text: t("report.trend.clickHint"), cls: "accounting-trend-info-hint" });
    this.renderTrendSvg(wrap, points, gran, container.clientWidth, (i) => {
      const p = points[i];
      if (!p) return;
      info.empty();
      const bucket = info.createEl("span", { cls: "accounting-trend-info-bucket" });
      bucket.textContent = gran === "year" ? p.bucket : t("report.trend.monthSuffix", { bucket: p.bucket.slice(5) });
      const cells = info.createDiv({ cls: "accounting-trend-info-cells" });
      this.appendTrendInfoCell(cells, t("report.stat.income"), p.income, "income");
      this.appendTrendInfoCell(cells, t("report.stat.expense"), p.expense, "expense");
      this.appendTrendInfoCell(cells, t("report.stat.surplus"), p.surplus, p.surplus < 0 ? "expense" : "income");
    });
  }
  /** 趋势明细行单个数字格（点击柱子后填充）。结余随正负上色（正=收入绿、负=支出红）。 */
  appendTrendInfoCell(parent, label, amount, cls) {
    const cell = parent.createDiv({ cls: `accounting-trend-info-cell accounting-trend-info-${cls}` });
    cell.createEl("span", { text: label, cls: "accounting-trend-info-cell-label" });
    cell.createEl("span", { text: formatMoney(amount, this.baseCurrency), cls: "accounting-trend-info-cell-value" });
  }
  /**
   * 净值趋势（总资产/总负债/净资产三条线）：与 renderTrend 同区间/同粒度，但每点是「截止该桶末」的
   * 累计存量（时点），非期间流量。多币种按当前汇率折算（rangeNetWorthTrend 已折算到本位币）。
   */
  renderNetWorthTrend(container, points, gran) {
    const section = container.createDiv({ cls: "accounting-section" });
    const head = section.createDiv({ cls: "accounting-group-head" });
    head.createEl("span", { text: gran === "year" ? t("report.netWorth.byYear") : t("report.netWorth.byMonth") });
    const legend = head.createEl("span", { cls: "accounting-trend-legend" });
    legend.createSpan({ text: t("report.netWorth.totalAssets"), cls: "accounting-nw-leg-assets" });
    legend.createSpan({ text: t("report.netWorth.totalLiabilities"), cls: "accounting-nw-leg-liab" });
    legend.createSpan({ text: t("report.netWorth.netWorth"), cls: "accounting-nw-leg-net" });
    if (points.length === 0) {
      section.createEl("div", { text: t("report.noData"), cls: "accounting-empty-mini" });
      return;
    }
    const wrap = section.createDiv({ cls: "accounting-trend-chart-wrap" });
    const info = section.createDiv({ cls: "accounting-trend-info" });
    info.createEl("span", { text: t("report.netWorth.clickHint"), cls: "accounting-trend-info-hint" });
    this.renderNetWorthSvg(wrap, points, gran, container.clientWidth, (i) => {
      const p = points[i];
      if (!p) return;
      info.empty();
      const bucket = info.createEl("span", { cls: "accounting-trend-info-bucket" });
      bucket.textContent = gran === "year" ? p.bucket : t("report.trend.monthSuffix", { bucket: p.bucket.slice(5) });
      const cells = info.createDiv({ cls: "accounting-trend-info-cells" });
      this.appendNwInfoCell(cells, t("report.netWorth.totalAssets"), p.totalAssets, "assets");
      this.appendNwInfoCell(cells, t("report.netWorth.totalLiabilities"), p.totalLiabilities, "liab");
      this.appendNwInfoCell(cells, t("report.netWorth.netWorth"), p.netWorth, p.netWorth < 0 ? "liab" : "net");
    });
  }
  appendNwInfoCell(parent, label, amount, cls) {
    const cell = parent.createDiv({ cls: `accounting-trend-info-cell accounting-nw-info-${cls}` });
    cell.createEl("span", { text: label, cls: "accounting-trend-info-cell-label" });
    cell.createEl("span", { text: formatMoney(amount, this.baseCurrency), cls: "accounting-trend-info-cell-value" });
  }
  /**
   * SVG 绘制净值图：总资产/总负债（线）+ 净资产（蓝柱，置于线下层）。零基线居中，正区 posH、负区 negH
   * （净资产可为负，资产/负债恒 >= 0）。每列透明点击热区，点击出明细格（复用 trend hit 样式）。
   */
  renderNetWorthSvg(parent, points, gran, availWidth, onSelect) {
    const NS = "http://www.w3.org/2000/svg";
    const axisW = 44;
    const minColW = 50;
    const maxColW = 80;
    const padL = axisW + 4;
    const padR = 4;
    const fillColW = (availWidth - padL - padR) / points.length;
    const colW = points.length <= 6 ? Math.min(Math.max(fillColW, minColW), maxColW) : minColW;
    const padT = 16;
    const posH = 179;
    const baselineY = padT + posH;
    const negH = 42;
    const labelH = 18;
    const W = padL + padR + points.length * colW;
    const H = baselineY + negH + labelH;
    const maxPos = Math.max(1, ...points.map((p) => Math.max(p.totalAssets, p.totalLiabilities, p.netWorth, 0)));
    const maxNeg = Math.max(1, ...points.map((p) => -Math.min(0, p.netWorth)));
    const xy = (i, v) => {
      const cx = padL + i * colW + colW / 2;
      const y = v >= 0 ? baselineY - v / maxPos * posH : baselineY + -v / maxNeg * negH;
      return [cx, y];
    };
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("xmlns", NS);
    svg.setAttribute("width", String(W));
    svg.setAttribute("height", String(H));
    svg.classList.add("accounting-trend-svg");
    const el = (tag) => document.createElementNS(NS, tag);
    const axis = el("line");
    axis.setAttribute("x1", String(padL));
    axis.setAttribute("x2", String(W));
    axis.setAttribute("y1", String(baselineY));
    axis.setAttribute("y2", String(baselineY));
    axis.setAttribute("class", "accounting-trend-axis");
    svg.appendChild(axis);
    this.appendSvgYAxis(svg, axisW, padL, W, padT, baselineY, negH, maxPos, points.some((p) => p.netWorth < 0) ? -maxNeg : void 0);
    const barW = Math.min(colW * 0.55, 30);
    points.forEach((p, i) => {
      const [cx, y] = xy(i, p.netWorth);
      const bar = el("rect");
      bar.setAttribute("x", String(cx - barW / 2));
      bar.setAttribute("y", String(Math.min(baselineY, y)));
      bar.setAttribute("width", String(barW));
      bar.setAttribute("height", String(Math.abs(baselineY - y)));
      bar.setAttribute("class", "accounting-nw-bar-net");
      svg.appendChild(bar);
    });
    const drawSeries = (key, lineCls, dotCls) => {
      const pts = points.map((p, i) => {
        const [cx, y] = xy(i, p[key]);
        return `${cx},${y}`;
      }).join(" ");
      const line = el("polyline");
      line.setAttribute("points", pts);
      line.setAttribute("class", lineCls);
      svg.appendChild(line);
      points.forEach((p, i) => {
        const [cx, y] = xy(i, p[key]);
        const c = el("circle");
        c.setAttribute("cx", String(cx));
        c.setAttribute("cy", String(y));
        c.setAttribute("r", "2.5");
        c.setAttribute("class", dotCls);
        svg.appendChild(c);
      });
    };
    drawSeries("totalAssets", "accounting-nw-line-assets", "accounting-nw-dot-assets");
    drawSeries("totalLiabilities", "accounting-nw-line-liab", "accounting-nw-dot-liab");
    points.forEach((p, i) => {
      if (!p.netWorth) return;
      const [cx, y] = xy(i, p.netWorth);
      const lbl = el("text");
      lbl.setAttribute("x", String(cx));
      lbl.setAttribute("y", String(p.netWorth >= 0 ? y - 4 : y + 12));
      lbl.setAttribute("text-anchor", "middle");
      lbl.setAttribute("class", "accounting-nw-bar-label");
      lbl.textContent = formatAxisAmount(p.netWorth, this.baseCurrency);
      svg.appendChild(lbl);
    });
    points.forEach((p, i) => {
      const cx = padL + i * colW + colW / 2;
      const lbl = el("text");
      lbl.setAttribute("x", String(cx));
      lbl.setAttribute("y", String(H - 4));
      lbl.setAttribute("text-anchor", "middle");
      lbl.setAttribute("class", "accounting-trend-axis-label");
      lbl.textContent = gran === "year" ? p.bucket : p.bucket.slice(5);
      svg.appendChild(lbl);
    });
    if (onSelect) {
      points.forEach((_p, i) => {
        const hit = el("rect");
        hit.setAttribute("x", String(padL + i * colW));
        hit.setAttribute("y", "0");
        hit.setAttribute("width", String(colW));
        hit.setAttribute("height", String(baselineY + negH));
        hit.setAttribute("class", "accounting-trend-hit");
        hit.addEventListener("click", () => onSelect(i));
        svg.appendChild(hit);
      });
    }
    parent.appendChild(svg);
  }
  /**
   * SVG 绘制趋势：结余柱（正=蓝向上、负=红向下，柱端标金额）+ 收入虚线 + 支出实线。
   * 零基线居中分隔正负区；用 SVG 而非 CSS div 是因为折线（polyline）无法用纯 CSS 连接。
   * 手动 createElementNS 构建（Obsidian createEl 不支持 svg 命名空间）。
   */
  /**
   * SVG 左侧 Y 轴：正区均分 5 档刻度（0 / 25% / 50% / 75% / 100% = topValue），中间档配虚线网格
   * 便于读数；0 与顶部不重复画网格（0 即零基线、顶部即图上沿）。存在负值时在负区中点另加一档。
   * 刻度值右对齐到 axisW（紧凑金额，不含币种；精确值点节点查看明细格）。
   */
  appendSvgYAxis(svg, axisW, padL, W, padT, baselineY, negH, topValue, negBottomValue) {
    const NS = "http://www.w3.org/2000/svg";
    const posH = baselineY - padT;
    const mkText = (v, y) => {
      const t2 = document.createElementNS(NS, "text");
      t2.setAttribute("x", String(axisW));
      t2.setAttribute("y", String(y));
      t2.setAttribute("text-anchor", "end");
      t2.setAttribute("class", "accounting-trend-axis-label");
      t2.textContent = formatAxisAmount(v, this.baseCurrency);
      svg.appendChild(t2);
    };
    const mkGrid = (y) => {
      const l = document.createElementNS(NS, "line");
      l.setAttribute("x1", String(padL));
      l.setAttribute("x2", String(W));
      l.setAttribute("y1", String(y));
      l.setAttribute("y2", String(y));
      l.setAttribute("class", "accounting-trend-grid");
      svg.appendChild(l);
    };
    const fracs = [0, 0.25, 0.5, 0.75, 1];
    for (const f of fracs) {
      const y = baselineY - f * posH;
      if (f > 0 && f < 1) mkGrid(y);
      mkText(f * topValue, y + 3);
    }
    if (negBottomValue && negBottomValue < 0) {
      const yMid = baselineY + negH / 2;
      mkGrid(yMid);
      mkText(negBottomValue / 2, yMid + 3);
    }
  }
  renderTrendSvg(parent, points, gran, availWidth, onSelect) {
    const NS = "http://www.w3.org/2000/svg";
    const axisW = 44;
    const minColW = 50;
    const maxColW = 80;
    const padL = axisW + 4;
    const padR = 4;
    const fillColW = (availWidth - padL - padR) / points.length;
    const colW = points.length <= 6 ? Math.min(Math.max(fillColW, minColW), maxColW) : minColW;
    const padT = 16;
    const baselineY = padT + 179;
    const negH = 42;
    const labelH = 18;
    const W = padL + padR + points.length * colW;
    const H = baselineY + negH + labelH;
    const posH = baselineY - padT;
    const maxVal = Math.max(1, ...points.map((p) => Math.max(p.income, p.expense, Math.abs(p.surplus))));
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("xmlns", NS);
    svg.setAttribute("width", String(W));
    svg.setAttribute("height", String(H));
    svg.classList.add("accounting-trend-svg");
    const el = (tag) => document.createElementNS(NS, tag);
    const axis = el("line");
    axis.setAttribute("x1", String(padL));
    axis.setAttribute("x2", String(W));
    axis.setAttribute("y1", String(baselineY));
    axis.setAttribute("y2", String(baselineY));
    axis.setAttribute("class", "accounting-trend-axis");
    svg.appendChild(axis);
    this.appendSvgYAxis(svg, axisW, padL, W, padT, baselineY, negH, maxVal, points.some((p) => p.surplus < 0) ? -maxVal : void 0);
    points.forEach((p, i) => {
      const cx = padL + i * colW + colW / 2;
      const barW = Math.min(colW * 0.5, 30);
      if (p.surplus >= 0) {
        const h = p.surplus / maxVal * posH;
        const rect = el("rect");
        rect.setAttribute("x", String(cx - barW / 2));
        rect.setAttribute("y", String(baselineY - h));
        rect.setAttribute("width", String(barW));
        rect.setAttribute("height", String(Math.max(h, 1)));
        rect.setAttribute("class", "accounting-trend-bar-pos");
        svg.appendChild(rect);
        if (p.surplus > 0) {
          const txt = el("text");
          txt.setAttribute("x", String(cx));
          txt.setAttribute("y", String(baselineY - h - 3));
          txt.setAttribute("text-anchor", "middle");
          txt.setAttribute("class", "accounting-trend-value");
          txt.textContent = formatMoneyInt(p.surplus, this.baseCurrency);
          svg.appendChild(txt);
        }
      } else {
        const h = Math.abs(p.surplus) / maxVal * negH;
        const rect = el("rect");
        rect.setAttribute("x", String(cx - barW / 2));
        rect.setAttribute("y", String(baselineY));
        rect.setAttribute("width", String(barW));
        rect.setAttribute("height", String(Math.max(h, 1)));
        rect.setAttribute("class", "accounting-trend-bar-neg");
        svg.appendChild(rect);
        const txt = el("text");
        txt.setAttribute("x", String(cx));
        txt.setAttribute("y", String(baselineY + h + 11));
        txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("class", "accounting-trend-value accounting-trend-value-neg");
        txt.textContent = formatMoneyInt(p.surplus, this.baseCurrency);
        svg.appendChild(txt);
      }
      const lbl = el("text");
      lbl.setAttribute("x", String(cx));
      lbl.setAttribute("y", String(H - 5));
      lbl.setAttribute("text-anchor", "middle");
      lbl.setAttribute("class", "accounting-trend-axis-label");
      lbl.textContent = gran === "year" ? p.bucket : p.bucket.slice(5);
      svg.appendChild(lbl);
    });
    const incomePts = points.map((p, i) => `${padL + i * colW + colW / 2},${baselineY - p.income / maxVal * posH}`).join(" ");
    const incLine = el("polyline");
    incLine.setAttribute("points", incomePts);
    incLine.setAttribute("class", "accounting-trend-line-income");
    svg.appendChild(incLine);
    const expensePts = points.map((p, i) => `${padL + i * colW + colW / 2},${baselineY - p.expense / maxVal * posH}`).join(" ");
    const expLine = el("polyline");
    expLine.setAttribute("points", expensePts);
    expLine.setAttribute("class", "accounting-trend-line-expense");
    svg.appendChild(expLine);
    points.forEach((p, i) => {
      const cx = padL + i * colW + colW / 2;
      const yi = baselineY - p.income / maxVal * posH;
      const ye = baselineY - p.expense / maxVal * posH;
      const di = el("circle");
      di.setAttribute("cx", String(cx));
      di.setAttribute("cy", String(yi));
      di.setAttribute("r", "2.5");
      di.setAttribute("class", "accounting-trend-dot-income");
      svg.appendChild(di);
      const de = el("circle");
      de.setAttribute("cx", String(cx));
      de.setAttribute("cy", String(ye));
      de.setAttribute("r", "2.5");
      de.setAttribute("class", "accounting-trend-dot-expense");
      svg.appendChild(de);
    });
    if (onSelect) {
      for (let i = 0; i < points.length; i++) {
        const hit = el("rect");
        hit.setAttribute("x", String(padL + i * colW));
        hit.setAttribute("y", "0");
        hit.setAttribute("width", String(colW));
        hit.setAttribute("height", String(H));
        hit.setAttribute("class", "accounting-trend-hit");
        hit.addEventListener("click", () => onSelect(i));
        svg.appendChild(hit);
      }
    }
    parent.appendChild(svg);
  }
  /** 走 Obsidian 原生关闭：pop 全局 keymap scope（Modal.open 时 push 的 Escape/Tab 捕获）并恢复焦点，
   *  再由基类回调 onClose。默认关闭动画已被 inline animation/transition:none 中和，仍是即时摘除——
   *  若绕过 super.close() 只 detach 容器，scope 不弹、焦点不恢复，会导致关闭后 Obsidian 笔记无法正常编辑。 */
  close() {
    if (this.closing) return;
    this.closing = true;
    super.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/settingsModal.ts
var import_obsidian16 = require("obsidian");
var SettingsModal = class extends import_obsidian16.Modal {
  constructor(app, settingsTab, navCtx, slide, onSwitchLedger, onOpened) {
    super(app);
    this.settingsTab = settingsTab;
    this.navCtx = navCtx;
    this.slide = slide;
    this.onSwitchLedger = onSwitchLedger;
    this.onOpened = onOpened;
  }
  opened = false;
  closing = false;
  /** 移动端左右轻扫切顶部设置 tab；onOpen 绑定、onClose 解绑。 */
  swipeTabs;
  /** 在挂载到 DOM 前就预设全屏类与禁用 Obsidian 默认 modal-pop 动画，避免「先上跳再滑入」。 */
  open() {
    presetModalChrome(this.modalEl, this.containerEl);
    super.open();
  }
  onOpen() {
    this.opened = true;
    document.querySelectorAll(".modal-container").forEach((c) => {
      if (c !== this.containerEl && c.querySelector(".accounting-settings-modal")) c.remove();
    });
    prepareModalContainer(this.containerEl);
    this.modalEl.addClass("accounting-fullscreen");
    this.onOpened?.();
    const sc = slideClass(this.slide);
    if (sc) this.contentEl.addClass(sc);
    this.contentEl.addClass("accounting-settings-modal");
    this.contentEl.addClass("accounting-has-ledger-pill");
    renderNavBar(this.modalEl, "settings", this.navCtx, () => this.close());
    const onSwitch = this.onSwitchLedger ? (newSubdir) => {
      this.onSwitchLedger(newSubdir, () => this.close());
    } : void 0;
    this.settingsTab.renderInto(this.contentEl, onSwitch);
    this.swipeTabs = bindSwipeTabs({
      host: this.contentEl,
      onNext: () => this.settingsTab.switchTab(1),
      onPrev: () => this.settingsTab.switchTab(-1)
    });
  }
  /** 走 Obsidian 原生关闭：pop 全局 keymap scope（Modal.open 时 push 的 Escape/Tab 捕获）并恢复焦点，
   *  再由基类回调 onClose。默认关闭动画已被 inline animation/transition:none 中和，仍是即时摘除——
   *  若绕过 super.close() 只 detach 容器，scope 不弹、焦点不恢复，会导致关闭后 Obsidian 笔记无法正常编辑。 */
  close() {
    if (this.closing) return;
    this.closing = true;
    super.close();
  }
  onClose() {
    this.swipeTabs?.dispose();
    this.swipeTabs = void 0;
    this.contentEl.empty();
  }
};

// src/navActions.ts
function openList(app, adapter, navCtx, presetAccountId, slide, presetRecurringRuleId, drillDown, drill, onDataChanged, onSwitchLedger, onOpened) {
  new TransactionListModal(app, adapter, presetAccountId, navCtx, slide, presetRecurringRuleId, drillDown, drill, onDataChanged, onSwitchLedger, onOpened).open();
}
async function openEntry(app, adapter, afterSubmit, navCtx, slide, onSwitchLedger, onRecurringSaved, onOpened) {
  const meta = await adapter.readMeta();
  new EntryModal(
    app,
    adapter,
    meta.accounts,
    meta.categories,
    () => {
      afterSubmit?.();
      openList(app, adapter, navCtx, void 0, void 0);
    },
    void 0,
    true,
    navCtx,
    slide,
    onSwitchLedger,
    void 0,
    onRecurringSaved,
    onOpened
  ).open();
}
function openBalance(app, adapter, navCtx, slide, onSwitchLedger, onOpened) {
  new BalanceModal(app, adapter, navCtx, slide, onSwitchLedger, onOpened).open();
}
function openReport(app, adapter, navCtx, slide, onSwitchLedger, onOpened) {
  new ReportModal(app, adapter, navCtx, slide, onSwitchLedger, onOpened).open();
}
function openSettings(app, settingsTab, navCtx, slide, onSwitchLedger, onOpened) {
  const modal = new SettingsModal(app, settingsTab, navCtx, slide, onSwitchLedger, onOpened);
  modal.open();
  return modal;
}
async function openEntryRecurring(app, adapter, mode, onDone) {
  const meta = await adapter.readMeta();
  new EntryModal(
    app,
    adapter,
    meta.accounts,
    meta.categories,
    () => {
    },
    void 0,
    true,
    void 0,
    void 0,
    void 0,
    mode,
    onDone
  ).open();
}

// src/diagLogModal.ts
var import_obsidian17 = require("obsidian");
var LEVELS = ["ALL", "ERROR", "WARN", "INFO", "DEBUG"];
var TONE = {
  ERROR: "var(--color-red)",
  WARN: "var(--color-orange)",
  INFO: "var(--color-blue)",
  DEBUG: "var(--text-faint)"
};
function lineLevel(line) {
  return line.split(/\s+/)[1] ?? null;
}
var DiagLogModal = class extends import_obsidian17.Modal {
  level = "ALL";
  keyword = "";
  listEl;
  constructor(app) {
    super(app);
  }
  async onOpen() {
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian17.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: t("diaglog.title") }).addClass("accounting-modal-title");
    const toolbar = contentEl.createDiv({ cls: "accounting-diaglog-toolbar" });
    const seg = toolbar.createDiv({ cls: "accounting-diaglog-seg" });
    for (const l of LEVELS) {
      const b = seg.createEl("button", { text: l === "ALL" ? t("diaglog.all") : l, cls: "accounting-diaglog-seg-btn" });
      b.onclick = () => {
        this.level = l;
        this.updateSegActive(seg);
        void this.render();
      };
    }
    this.updateSegActive(seg);
    const search = toolbar.createEl("input", { cls: "accounting-search-input accounting-diaglog-search" });
    search.placeholder = t("diaglog.search");
    search.oninput = () => {
      this.keyword = search.value;
      void this.render();
    };
    const refresh = toolbar.createEl("button", { text: t("diaglog.refresh"), cls: "accounting-btn accounting-btn-secondary" });
    refresh.onclick = () => void this.render();
    const exportBtn = toolbar.createEl("button", { text: t("diaglog.export"), cls: "accounting-btn accounting-btn-secondary" });
    exportBtn.onclick = async () => {
      try {
        const path = await exportPluginLog();
        new import_obsidian17.Notice(`${t("diaglog.exportDone")}: ${path}`);
      } catch {
        new import_obsidian17.Notice(t("diaglog.exportFail"));
      }
    };
    this.listEl = contentEl.createDiv({ cls: "accounting-diaglog-list" });
    await this.render();
    const closeWrap = contentEl.createDiv({ cls: "accounting-modal-close" });
    const closeBtn = closeWrap.createEl("button", { text: t("common.close"), cls: "accounting-btn-secondary" });
    closeBtn.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
  updateSegActive(seg) {
    seg.querySelectorAll("button").forEach((b, i) => {
      b.classList.toggle("is-active", LEVELS[i] === this.level);
    });
  }
  async render() {
    const text = await readPluginLogText();
    const kw = this.keyword.trim().toLowerCase();
    const lines = text.split("\n").filter((l) => {
      if (!l.trim()) return false;
      if (this.level !== "ALL" && lineLevel(l) !== this.level) return false;
      if (kw && !l.toLowerCase().includes(kw)) return false;
      return true;
    });
    this.listEl.empty();
    if (lines.length === 0) {
      this.listEl.createEl("div", { text: t("diaglog.empty"), cls: "accounting-diaglog-empty" });
      return;
    }
    for (const ln of lines) {
      const lv = lineLevel(ln);
      const color = lv && TONE[lv] || "inherit";
      const div = this.listEl.createDiv({ text: ln, cls: "accounting-diaglog-line" });
      div.style.color = color;
    }
  }
};

// src/ledgerPasswordModal.ts
var import_obsidian18 = require("obsidian");
var LedgerPasswordModal = class extends import_obsidian18.Modal {
  constructor(app, props, onSubmit, onCancel) {
    super(app);
    this.props = props;
    this.onSubmit = onSubmit;
    this.onCancel = onCancel;
  }
  errorEl;
  bodyEl;
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian18.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    const title = this.props.mode === "unlock" ? t("settings.password.unlockTitle", { name: this.props.alias }) : this.props.mode === "set" ? t("settings.password.setTitle") : this.props.mode === "change" ? t("settings.password.changeTitle") : t("settings.password.removeTitle");
    contentEl.createEl("h2", { text: title });
    if (this.props.mode === "unlock") {
      contentEl.createEl("p", { text: t("settings.password.unlockHint"), cls: "accounting-ledger-empty" });
    } else if (this.props.mode === "set") {
      contentEl.createEl("p", { text: t("settings.password.setHint"), cls: "accounting-ledger-empty" });
    } else if (this.props.mode === "change") {
      contentEl.createEl("p", { text: t("settings.password.changeHint", { name: this.props.alias }), cls: "accounting-ledger-empty" });
    } else {
      contentEl.createEl("p", { text: t("settings.password.removeHint", { name: this.props.alias }), cls: "accounting-ledger-empty" });
    }
    this.bodyEl = contentEl.createDiv();
    this.renderBody();
    this.errorEl = contentEl.createDiv({ cls: "accounting-ledger-empty" });
    this.errorEl.style.color = "var(--text-error)";
    this.errorEl.style.display = "none";
    const actions = contentEl.createDiv("accounting-modal-actions");
    const cancelBtn = actions.createEl("button", { text: t("common.cancel"), cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => {
      this.onCancel();
      this.close();
    };
    const isRemove = this.props.mode === "remove";
    const submitText = this.props.mode === "unlock" ? t("settings.password.unlock") : isRemove ? t("settings.password.removeBtn") : t("common.confirm");
    const submitBtn = actions.createEl("button", {
      text: submitText,
      cls: isRemove ? "accounting-btn-danger" : "accounting-btn-primary"
    });
    submitBtn.onclick = async () => {
      await this.handleSubmit(submitBtn);
    };
    setTimeout(() => this.firstInput()?.focus(), 0);
  }
  firstInput() {
    return this.bodyEl.querySelector("input");
  }
  renderBody() {
    this.bodyEl.empty();
    if (this.props.mode === "change" || this.props.mode === "remove") {
      this.makeInput("old", t("settings.password.oldPlaceholder"), "password");
    }
    if (this.props.mode !== "remove") {
      this.makeInput("new", t("settings.password.newPlaceholder"), "password");
    }
    if (this.props.mode === "set" || this.props.mode === "change") {
      this.makeInput("confirm", t("settings.password.confirmPlaceholder"), "password");
    }
  }
  makeInput(key, placeholder, type) {
    const input = this.bodyEl.createEl("input", { type, cls: "accounting-ledger-input" });
    input.placeholder = placeholder;
    input.dataset["field"] = key;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const submit = this.contentEl.querySelector(".accounting-btn-primary, .accounting-btn-danger");
        submit?.click();
      }
    });
    return input;
  }
  readField(key) {
    const el = this.bodyEl.querySelector(`input[data-field="${key}"]`);
    return el ? el.value : "";
  }
  showError(msg) {
    this.errorEl.textContent = msg;
    this.errorEl.style.display = "block";
  }
  async handleSubmit(submitBtn) {
    const mode = this.props.mode;
    const newPwd = this.readField("new");
    if (mode === "set") {
      if (newPwd.trim().length === 0) {
        this.showError(t("settings.password.empty"));
        return;
      }
      const confirm2 = this.readField("confirm");
      if (newPwd !== confirm2) {
        this.showError(t("settings.password.mismatch"));
        return;
      }
    } else if (mode === "change") {
      const confirm2 = this.readField("confirm");
      if (newPwd !== confirm2) {
        this.showError(t("settings.password.mismatch"));
        return;
      }
    } else if (mode === "unlock" && newPwd.length === 0) {
      this.showError(t("settings.password.empty"));
      return;
    } else if (mode === "remove" && this.readField("old").length === 0) {
      this.showError(t("settings.password.empty"));
      return;
    }
    const old = this.readField("old");
    submitBtn.disabled = true;
    const prevText = submitBtn.textContent;
    submitBtn.textContent = t("settings.password.verifying");
    try {
      const err = await this.onSubmit({ old: old || void 0, new: newPwd });
      if (err) {
        this.showError(err);
      } else {
        this.close();
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = prevText;
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/settings.ts
var FEEDBACK_EMAIL = "honeyledger@163.com";
function kindOfLabel(type) {
  return type === "credit" || type === "loan" ? t("accountKind.liability") : t("accountKind.asset");
}
function createCurrencyPicker(parent, opts) {
  const wrap = parent.createDiv({ cls: "accounting-currency-picker" });
  const input = wrap.createEl("input", { cls: "accounting-ledger-input accounting-currency-picker-input" });
  input.type = "text";
  input.placeholder = opts.placeholder ?? t("settings.currency.searchPlaceholder");
  input.value = opts.value ? `${currencyDisplayName(opts.value, getLocale())} ${opts.value}` : "";
  input.setAttribute("autocomplete", "off");
  const dropdown = createDiv({ cls: "accounting-currency-picker-dropdown" });
  document.body.appendChild(dropdown);
  dropdown.style.display = "none";
  const excludeSet = new Set((opts.exclude ?? []).map((c) => c.toUpperCase()));
  const currentUpper = (opts.value ?? "").toUpperCase();
  let open = false;
  let flat = [];
  let hi = 0;
  function sections(text) {
    const term = text.trim();
    if (term) {
      const items = filterCurrencies(term, getLocale()).filter((c) => !excludeSet.has(c.code));
      return [{ label: t("settings.currency.searchResults", { n: items.length }), items }];
    }
    return orderedCurrencyCatalog(getLocale()).map((g) => ({ label: t(g.labelKey, { count: g.count }), items: g.items.filter((c) => !excludeSet.has(c.code)) })).filter((g) => g.items.length > 0);
  }
  function paint() {
    dropdown.querySelectorAll("[data-idx]").forEach((el) => {
      const he = el;
      he.classList.toggle("is-active", Number(he.dataset.idx) === hi);
    });
    const active = dropdown.querySelector(`[data-idx="${hi}"]`);
    active?.scrollIntoView({ block: "nearest" });
  }
  function render() {
    dropdown.empty();
    const gs = sections(input.value);
    flat = gs.flatMap((g) => g.items);
    if (flat.length === 0) {
      dropdown.createEl("div", { text: t("settings.currency.noMatch"), cls: "accounting-currency-picker-empty" });
      return;
    }
    for (const g of gs) {
      dropdown.createEl("div", { text: g.label, cls: "accounting-currency-picker-group" });
      for (const c of g.items) {
        const idx = flat.indexOf(c);
        const item = dropdown.createDiv({ cls: "accounting-currency-picker-item" });
        item.dataset.idx = String(idx);
        item.createEl("span", { text: c.name, cls: "accounting-currency-picker-cn" });
        item.createEl("span", { text: c.code, cls: "accounting-currency-picker-code" });
        if (c.code === currentUpper) item.createEl("span", { text: "\u2713", cls: "accounting-currency-picker-check" });
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          pick(c.code);
        });
        item.addEventListener("mouseenter", () => {
          hi = idx;
          paint();
        });
      }
    }
    paint();
  }
  function position() {
    const r = input.getBoundingClientRect();
    dropdown.style.left = `${r.left}px`;
    dropdown.style.top = `${r.bottom + 4}px`;
    dropdown.style.width = `${r.width}px`;
  }
  const displayValue = () => opts.value ? `${currencyDisplayName(opts.value, getLocale())} ${opts.value}` : "";
  function openPanel() {
    if (open) return;
    open = true;
    hi = 0;
    input.value = "";
    render();
    position();
    dropdown.style.display = "block";
  }
  function close() {
    if (!open) return;
    open = false;
    dropdown.style.display = "none";
    input.value = displayValue();
  }
  function pick(code) {
    input.value = `${currencyDisplayName(code, getLocale())} ${code}`;
    close();
    opts.onPick(code);
  }
  input.addEventListener("focus", openPanel);
  input.addEventListener("input", () => {
    if (!open) openPanel();
    else {
      render();
      position();
    }
    hi = 0;
    paint();
  });
  input.addEventListener("keydown", (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        openPanel();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      hi = Math.min(hi + 1, flat.length - 1);
      paint();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      hi = Math.max(hi - 1, 0);
      paint();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = flat[hi];
      if (c) pick(c.code);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
      opts.onDismiss?.();
    }
  });
  const onFollow = () => {
    if (!input.isConnected) {
      destroy();
      return;
    }
    if (open) position();
  };
  const onDoc = (e) => {
    if (!input.isConnected) {
      destroy();
      return;
    }
    const node = e.target;
    if (!wrap.contains(node) && !dropdown.contains(node)) {
      close();
      opts.onDismiss?.();
    }
  };
  document.addEventListener("mousedown", onDoc);
  window.addEventListener("scroll", onFollow, true);
  window.addEventListener("resize", onFollow);
  function destroy() {
    document.removeEventListener("mousedown", onDoc);
    window.removeEventListener("scroll", onFollow, true);
    window.removeEventListener("resize", onFollow);
    dropdown.remove();
    wrap.remove();
  }
  return { input, destroy };
}
var AccountingSettings = class {
  constructor(app, plugin, adapter) {
    this.app = app;
    this.plugin = plugin;
    this.injectedAdapter = adapter;
  }
  injectedAdapter;
  /** 当前激活的 tab；实例级，跨设置页开关/切账本保持（同一实例），App 重启回默认 'ledger'。 */
  activeTab = "ledger";
  /** renderInto 内 setActiveTab 闭包的句柄，供 switchTab（移动端轻扫）复用同一套切 tab 逻辑。 */
  applyActiveTab;
  /** 优先用最新的 dataSubdir 重建 adapter（切换账本后立即生效），
   *  无 vault（测试环境）则回退到构造时注入的 adapter。 */
  currentAdapter() {
    const vault2 = this.app?.vault;
    if (vault2) {
      return new ObsidianDataAdapter(vault2, this.plugin.settings.dataSubdir);
    }
    return this.injectedAdapter;
  }
  /** 把设置页正文渲染进任意容器（全屏「设置」Modal 的 contentEl），幂等（先 empty）。
   *  4 个 panel 一次性渲染进 DOM，靠 `.accounting-settings-panel-active` 切显隐（切 tab 不重渲染、
   *  不丢各 panel 已加载数据）；当前 tab 存实例字段 activeTab，跨开关/切账本保持。
   *  onSwitchLedger 由调用方（SettingsModal）注入：切账本时先关旧弹窗再用新 dataSubdir 重开，
   *  与记账页 `LedgerSwitchModal→close→onSwitchLedger` 同一模式。省略时回退到仅改设置 + 提示重开。 */
  renderInto(containerEl, onSwitchLedger) {
    containerEl.empty();
    const tabsEl = containerEl.createDiv("accounting-settings-tabs");
    const panelsEl = containerEl.createDiv("accounting-settings-panels");
    const setActiveTab = (tab) => {
      this.activeTab = tab;
      tabsEl.querySelectorAll(".accounting-settings-tab").forEach((btn) => {
        btn.classList.toggle("accounting-settings-tab-active", btn.getAttribute("data-tab") === tab);
      });
      panelsEl.querySelectorAll(".accounting-settings-panel").forEach((panel) => {
        panel.classList.toggle(
          "accounting-settings-panel-active",
          panel.getAttribute("data-tab") === tab
        );
      });
    };
    this.applyActiveTab = setActiveTab;
    const TABS = [
      { key: "ledger", labelKey: "settings.tab.general" },
      { key: "recurring", labelKey: "settings.tab.recurring" },
      { key: "category", labelKey: "settings.tab.category" },
      { key: "currency", labelKey: "settings.tab.currency" },
      { key: "about", labelKey: "settings.tab.about" }
    ];
    for (const { key, labelKey } of TABS) {
      const tabBtn = tabsEl.createEl("button", { text: t(labelKey), cls: "accounting-settings-tab" });
      tabBtn.setAttribute("data-tab", key);
      tabBtn.onclick = () => setActiveTab(key);
    }
    const generalPanel = this.createPanel(panelsEl, "ledger");
    this.renderGeneralSettings(generalPanel);
    this.renderLedgerPanel(generalPanel, onSwitchLedger);
    this.renderBackupPanel(generalPanel);
    this.renderRecurringListView(this.createPanel(panelsEl, "recurring"));
    const categoryPanel = this.createPanel(panelsEl, "category");
    this.renderCategoryListView(categoryPanel);
    this.renderAccountTypeView(categoryPanel);
    this.renderCurrencyPanel(this.createPanel(panelsEl, "currency"));
    this.renderAboutPanel(this.createPanel(panelsEl, "about"));
    setActiveTab(this.activeTab);
  }
  /** 保存周期账规则后回到设置页「周期账」tab。
   *  周期账新建/编辑是全屏聚焦 Modal（accounting-fullscreen）叠加在设置页之上；iOS 关闭这种全屏 Modal 后，
   *  下层全屏设置页不会自动恢复可见（对比流水→详情的「底部抽屉」叠加可正常回退）。故保存后显式重开设置页
   *  并落到周期账 tab：先清理可能残留的旧设置页容器避免两层叠加，再用 navCtx.openSettings 重开（activeTab='recurring'
   *  会让 onOpen→renderInto→setActiveTab 落到周期账 tab，且顺带刷新规则列表）。 */
  showRecurring() {
    this.activeTab = "recurring";
    this.plugin.navCtx(this.currentAdapter()).openSettings();
  }
  /** 移动端左右轻扫按方向（+1 下一个 / -1 上一个）切设置 tab：在 tab 栏顺序内夹界、不循环。
   *  复用 renderInto 内的 setActiveTab 闭包（= this.applyActiveTab），仅切显隐、不重渲染 panel。 */
  switchTab(dir) {
    const order = ["ledger", "recurring", "category", "currency", "about"];
    const idx = order.indexOf(this.activeTab);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= order.length) return;
    const nextTab = order[next];
    if (!nextTab || nextTab === this.activeTab) return;
    this.applyActiveTab?.(nextTab);
  }
  /** 创建一个 panel 容器（带 data-tab 标识 + 显隐类钩子）。 */
  createPanel(parent, tab) {
    const panel = parent.createDiv("accounting-settings-panel");
    panel.setAttribute("data-tab", tab);
    return panel;
  }
  /** 通用设置 panel：插件级开关（不依赖账本数据）。当前含「启动自动打开记账」+「重新运行账本引导」。 */
  renderGeneralSettings(panel) {
    const cardEl = panel.createDiv("accounting-ledger-card");
    const headEl = cardEl.createDiv("accounting-ledger-card-head");
    headEl.createEl("span", { text: t("settings.general.startupTitle"), cls: "accounting-ledger-card-title" });
    const bodyEl = cardEl.createDiv("accounting-ledger-list");
    const langRow = bodyEl.createDiv("accounting-settings-row accounting-language-row");
    langRow.createEl("span", { text: t("settings.language.label"), cls: "accounting-currency-online-label accounting-language-label" });
    const langSelect = langRow.createEl("select", { cls: "accounting-ledger-input accounting-language-select" });
    const langOpts = [
      { value: "zh", labelKey: "settings.language.zh" },
      { value: "en", labelKey: "settings.language.en" }
    ];
    for (const o of langOpts) {
      const opt = langSelect.createEl("option", { value: o.value, text: t(o.labelKey) });
      if (o.value === getLocale()) opt.selected = true;
    }
    langSelect.onchange = async () => {
      const next = langSelect.value;
      this.plugin.settings.locale = next;
      setLocale(next);
      try {
        await this.plugin.saveSettings();
      } catch (e) {
        new import_obsidian19.Notice(t("entry.saveFailed", { msg: formatError(e) }));
      }
      this.plugin.navCtx(this.currentAdapter()).openSettings();
    };
    const row = bodyEl.createDiv("accounting-settings-row accounting-startup-toggle");
    const cb = row.createEl("input", { cls: "accounting-checkbox" });
    cb.type = "checkbox";
    cb.checked = !!this.plugin.settings.autoOpenOnStartup;
    cb.onchange = async () => {
      this.plugin.settings.autoOpenOnStartup = cb.checked;
      try {
        await this.plugin.saveSettings();
        new import_obsidian19.Notice(cb.checked ? t("settings.startup.on") : t("settings.startup.off"));
      } catch (e) {
        new import_obsidian19.Notice(t("entry.saveFailed", { msg: formatError(e) }));
      }
    };
    row.createEl("span", { text: t("settings.startup.toggleLabel"), cls: "accounting-currency-online-label accounting-startup-toggle-label" });
    const resetBtn = row.createEl("button", {
      text: t("settings.startup.rerunOnboarding"),
      cls: "accounting-btn accounting-btn-secondary accounting-reset-onboarding"
    });
    resetBtn.onclick = () => {
      void this.handleResetOnboarding();
    };
  }
  /** 关于 panel：应用名 / 版本 / 核心库版本 / 反馈邮箱（版本号从版本源动态读取，不硬编码）。 */
  renderAboutPanel(panel) {
    const cardEl = panel.createDiv("accounting-ledger-card");
    const headEl = cardEl.createDiv("accounting-ledger-card-head");
    headEl.createEl("span", { text: t("settings.tab.about"), cls: "accounting-ledger-card-title" });
    const bodyEl = cardEl.createDiv("accounting-ledger-list");
    const row = (label, value, link = false) => {
      const r = bodyEl.createDiv("accounting-about-row");
      r.createEl("span", { text: label, cls: "accounting-about-label" });
      if (link) {
        const a = r.createEl("a", { text: value, cls: "accounting-about-value accounting-about-link", href: `mailto:${FEEDBACK_EMAIL}` });
      } else {
        r.createEl("span", { text: value, cls: "accounting-about-value" });
      }
    };
    row(t("settings.about.app"), t("settings.about.appName"));
    row(t("settings.about.version"), `v${this.plugin.manifest.version}`);
    row(t("settings.about.feedback"), FEEDBACK_EMAIL, true);
    const diagCardEl = panel.createDiv("accounting-ledger-card");
    const diagHeadEl = diagCardEl.createDiv("accounting-ledger-card-head");
    diagHeadEl.createEl("span", { text: t("settings.about.diaglog"), cls: "accounting-ledger-card-title" });
    appendHeaderHelp(diagHeadEl, { detail: t("settings.about.diaglogDesc") });
    const diagBodyEl = diagCardEl.createDiv("accounting-ledger-list");
    const diagActionsEl = diagBodyEl.createDiv("accounting-ledger-card-actions");
    const diagBtn = diagActionsEl.createEl("button", {
      text: t("settings.about.diaglogBtn"),
      cls: "accounting-btn accounting-btn-secondary"
    });
    diagBtn.onclick = () => new DiagLogModal(this.app).open();
    const diagExportBtn = diagActionsEl.createEl("button", {
      text: t("diaglog.export"),
      cls: "accounting-btn accounting-btn-secondary"
    });
    diagExportBtn.onclick = async () => {
      try {
        const path = await exportPluginLog();
        new import_obsidian19.Notice(`${t("diaglog.exportDone")}: ${path}`);
      } catch {
        new import_obsidian19.Notice(t("diaglog.exportFail"));
      }
    };
  }
  /** 账本管理 panel：账本卡片（新建/刷新/切换/改名/删除）。 */
  renderLedgerPanel(panel, onSwitchLedger) {
    const ledgerCardEl = panel.createDiv("accounting-ledger-card");
    const ledgerHeadEl = ledgerCardEl.createDiv("accounting-ledger-card-head");
    ledgerHeadEl.createEl("span", { text: t("settings.ledger.title"), cls: "accounting-ledger-card-title" });
    const ledgerHeadActions = ledgerHeadEl.createDiv("accounting-ledger-head-actions");
    const createLedgerBtn = ledgerHeadActions.createEl("button", { text: t("settings.ledger.createBtn"), cls: "accounting-ledger-create" });
    const refreshLedgerBtn = ledgerHeadActions.createEl("button", { text: t("settings.refreshBtn"), cls: "accounting-ledger-refresh" });
    const ledgerListEl = ledgerCardEl.createDiv("accounting-ledger-list");
    const refreshLedgerList = async () => {
      const adapter = this.currentAdapter();
      try {
        const ledgers = await adapter.listLedgers();
        const ledgerWithAliases = await Promise.all(
          ledgers.map(async (name) => ({
            name,
            alias: await adapter.readLedgerAlias(name),
            hasPassword: await adapter.readLedgerPasswordMetaAt(name) !== null
          }))
        );
        ledgerListEl.empty();
        if (ledgerWithAliases.length === 0) {
          ledgerListEl.createEl("p", {
            text: t("settings.ledger.empty"),
            cls: "accounting-ledger-empty"
          });
          return;
        }
        for (const { name, alias, hasPassword } of ledgerWithAliases) {
          const isCurrent = name === this.plugin.settings.dataSubdir;
          const item = ledgerListEl.createDiv("accounting-ledger-item");
          if (isCurrent) item.classList.add("accounting-ledger-current");
          const info = item.createDiv("accounting-ledger-info");
          info.createEl("div", { text: alias, cls: "accounting-ledger-name" });
          info.createEl("div", { text: ObsidianDataAdapter.formatLedgerName(name), cls: "accounting-ledger-folder" });
          const actions = item.createDiv("accounting-ledger-actions");
          if (isCurrent) {
            actions.createEl("span", { text: t("entry.switchLedgerCurrent"), cls: "accounting-ledger-badge" });
          } else {
            const switchBtn = actions.createEl("button", { text: t("settings.ledger.switchBtn"), cls: "accounting-ledger-switch" });
            switchBtn.onclick = async () => {
              try {
                if (onSwitchLedger) {
                  onSwitchLedger(name);
                } else {
                  this.plugin.settings.dataSubdir = name;
                  await this.plugin.saveSettings();
                  new import_obsidian19.Notice(t("settings.ledger.switchedNotice", { alias }));
                  void refreshLedgerList();
                }
              } catch (error) {
                new import_obsidian19.Notice(t("settings.ledger.switchFailed", { msg: formatError(error) }));
              }
            };
          }
          const renameBtn = actions.createEl("button", { text: t("settings.ledger.renameBtn"), cls: "accounting-ledger-rename" });
          renameBtn.onclick = () => {
            void this.openRenameAliasModal(name, alias, refreshLedgerList);
          };
          const pwdBtn = actions.createEl("button", {
            text: hasPassword ? t("settings.password.changeBtn") : t("settings.password.setBtn"),
            cls: "accounting-ledger-rename"
          });
          pwdBtn.onclick = () => {
            void this.openLedgerPasswordModal(name, alias, hasPassword ? "change" : "set", refreshLedgerList);
          };
          if (!isCurrent) {
            const deleteBtn = actions.createEl("button", { text: t("settings.ledger.deleteBtn"), cls: "accounting-ledger-delete" });
            deleteBtn.onclick = () => {
              void this.handleDeleteLedger(name, alias, refreshLedgerList);
            };
          }
        }
      } catch (error) {
        ledgerListEl.empty();
        ledgerListEl.createEl("p", {
          text: t("settings.ledger.loadFailed", { msg: formatError(error) }),
          cls: "accounting-ledger-empty"
        });
      }
    };
    createLedgerBtn.onclick = () => {
      void this.openCreateLedgerModal(async (name, alias) => {
        if (onSwitchLedger) {
          onSwitchLedger(name);
        } else {
          this.plugin.settings.dataSubdir = name;
          await this.plugin.saveSettings();
          new import_obsidian19.Notice(t("settings.ledger.createdSwitchedNotice", { alias: alias || ObsidianDataAdapter.formatLedgerName(name) }));
          await refreshLedgerList();
        }
      });
    };
    refreshLedgerBtn.onclick = async () => {
      await refreshLedgerList();
      new import_obsidian19.Notice(t("settings.ledger.refreshedNotice"));
    };
    void refreshLedgerList();
  }
  /** 备份管理 panel：备份卡片（立即备份 / 查看备份）。 */
  renderBackupPanel(panel) {
    const backupCardEl = panel.createDiv("accounting-ledger-card");
    const backupHeadEl = backupCardEl.createDiv("accounting-ledger-card-head");
    backupHeadEl.createEl("span", { text: t("settings.backup.title"), cls: "accounting-ledger-card-title" });
    appendHeaderHelp(backupHeadEl, {
      detail: t("settings.backup.helpDetail")
    });
    const backupBodyEl = backupCardEl.createDiv("accounting-ledger-list accounting-backup-card-body");
    const backupActionsEl = backupBodyEl.createDiv("accounting-ledger-card-actions accounting-backup-card-actions");
    const createBackupBtn = backupActionsEl.createEl("button", { text: t("settings.backup.createBtn"), cls: "accounting-ledger-create" });
    const listBackupBtn = backupActionsEl.createEl("button", { text: t("settings.backup.listBtn"), cls: "accounting-ledger-refresh" });
    createBackupBtn.onclick = async () => {
      try {
        const backupPath = await this.currentAdapter().backup("manual");
        new import_obsidian19.Notice(t("settings.backup.createdNotice", { path: backupPath }));
      } catch (error) {
        new import_obsidian19.Notice(t("settings.backup.createFailed", { msg: formatError(error) }));
      }
    };
    listBackupBtn.onclick = () => {
      void this.showBackupList();
    };
    const autoSectionEl = backupBodyEl.createDiv("accounting-backup-auto");
    void (async () => {
      const adapter = this.currentAdapter();
      let cfg;
      try {
        cfg = await adapter.readBackupConfig();
      } catch (error) {
        autoSectionEl.createEl("p", { text: t("settings.backup.loadFailed", { msg: formatError(error) }), cls: "accounting-ledger-empty" });
        return;
      }
      const enableRow = autoSectionEl.createDiv("accounting-settings-row");
      const enableCb = enableRow.createEl("input", { cls: "accounting-checkbox" });
      enableCb.type = "checkbox";
      enableCb.checked = cfg.backupEnabled;
      enableRow.createEl("span", { text: t("settings.backup.autoEnable"), cls: "accounting-currency-online-label" });
      const optionsRow = autoSectionEl.createDiv("accounting-settings-row accounting-backup-options");
      const intervalGroup = optionsRow.createDiv("accounting-backup-option");
      intervalGroup.createEl("span", { text: t("settings.backup.autoInterval"), cls: "accounting-currency-online-label" });
      const intervalSel = intervalGroup.createEl("select", { cls: "accounting-ledger-input" });
      for (const d of [1, 3, 7, 14, 30]) {
        const opt = intervalSel.createEl("option", { value: String(d), text: t("settings.backup.intervalDays", { count: d }) });
        if (d === cfg.backupIntervalDays) opt.selected = true;
      }
      const keepGroup = optionsRow.createDiv("accounting-backup-option");
      keepGroup.createEl("span", { text: t("settings.backup.autoKeep"), cls: "accounting-currency-online-label" });
      const keepSel = keepGroup.createEl("select", { cls: "accounting-ledger-input" });
      for (const k of [3, 5, 7, 10, 15, 30]) {
        const opt = keepSel.createEl("option", { value: String(k), text: t("settings.backup.keepCount", { count: k }) });
        if (k === cfg.backupKeep) opt.selected = true;
      }
      const persist = async (next) => {
        try {
          await adapter.writeBackupConfig(next);
          new import_obsidian19.Notice(t("settings.backup.configSaved"));
        } catch (e) {
          new import_obsidian19.Notice(t("settings.backup.configSaveFailed", { msg: formatError(e) }));
        }
      };
      enableCb.onchange = () => void persist({ ...cfg, backupEnabled: enableCb.checked });
      intervalSel.onchange = () => void persist({ ...cfg, backupIntervalDays: Number(intervalSel.value) });
      keepSel.onchange = () => void persist({ ...cfg, backupKeep: Number(keepSel.value) });
    })();
  }
  /** 币种 panel：本位币下拉 + 汇率表编辑器（手动维护「1 外币 = rate 本位币」，随 iCloud 与桌面端同步）。 */
  renderCurrencyPanel(panel) {
    const cardEl = panel.createDiv("accounting-ledger-card");
    const headEl = cardEl.createDiv("accounting-ledger-card-head");
    headEl.createEl("span", { text: t("settings.currency.title"), cls: "accounting-ledger-card-title" });
    appendHeaderHelp(headEl, {
      detail: t("settings.currency.helpDetail")
    });
    const bodyEl = cardEl.createDiv("accounting-ledger-list");
    const refresh = async () => {
      const adapter = this.currentAdapter();
      try {
        const baseCurrency = await adapter.readBaseCurrency();
        const rates = await adapter.readRates();
        const accountCurrencies = Array.from(
          new Set((await adapter.readMeta()).accounts.map((a) => a.currency).filter(Boolean))
        );
        this.renderCurrencyBody(bodyEl, adapter, baseCurrency, rates, accountCurrencies, refresh);
      } catch (error) {
        bodyEl.empty();
        bodyEl.createEl("p", { text: t("settings.currency.loadFailed", { msg: formatError(error) }), cls: "accounting-ledger-empty" });
      }
    };
    void refresh();
  }
  renderCurrencyBody(bodyEl, adapter, baseCurrency, rates, accountCurrencies, refresh) {
    bodyEl.empty();
    const baseRow = bodyEl.createDiv({ cls: "accounting-currency-base" });
    baseRow.createEl("span", { text: t("settings.currency.baseLabel"), cls: "accounting-ledger-card-title" });
    const baseHolder = baseRow.createDiv({ cls: "accounting-currency-base-sel" });
    createCurrencyPicker(baseHolder, {
      value: baseCurrency,
      onPick: async (cur) => {
        const oldBase = baseCurrency;
        if (cur === oldBase) return;
        try {
          const immediate = rebaseRateTable(rates, oldBase, cur, {}, nowISO());
          await adapter.writeBaseCurrency(cur);
          await adapter.writeRates(immediate);
          new import_obsidian19.Notice(t("settings.currency.baseSetRefreshing", { cur }));
          await refresh();
          void (async () => {
            try {
              const url = `https://api.frankfurter.app/latest?from=${cur.toUpperCase()}`;
              const resp = await (0, import_obsidian19.requestUrl)({ url, method: "GET" });
              const fetched = parseRateResponse(resp.json, cur, nowISO());
              if (!fetched) return;
              await adapter.writeRates(rebaseRateTable(rates, oldBase, cur, fetched, nowISO()));
              const cfg = await adapter.readRateConfig().catch(() => ({}));
              await adapter.writeRateConfig({ ...cfg, lastSuccess: nowISO() });
              new import_obsidian19.Notice(t("settings.currency.baseRefreshed", { cur }));
              await refresh();
            } catch {
            }
          })();
        } catch (error) {
          new import_obsidian19.Notice(t("settings.currency.setFailed", { msg: formatError(error) }));
        }
      }
    });
    bodyEl.createEl("div", { text: t("settings.currency.ratesTableTitle", { base: baseCurrency }), cls: "accounting-currency-section-title" });
    const rows = rateRowsFromTable(rates);
    const listEl = bodyEl.createDiv({ cls: "accounting-currency-rates" });
    let dirty = false;
    const setDirty = (d) => {
      dirty = d;
      saveBtn.setText(d ? t("settings.currency.saveRates") : t("settings.currency.saved"));
      saveBtn.disabled = !d;
      cancelBtn.style.display = d ? "" : "none";
    };
    const renderList = () => {
      listEl.empty();
      if (rows.length === 0) {
        listEl.createEl("p", { text: t("settings.currency.noRates"), cls: "accounting-ledger-empty" });
      }
      for (const [i, r] of rows.entries()) {
        const row = listEl.createDiv({ cls: "accounting-currency-rate-row" });
        row.createEl("span", { text: r.currency, cls: "accounting-currency-cur-readonly" });
        row.createEl("span", { text: "1 =" });
        const rateIn = row.createEl("input", { cls: "accounting-ledger-input accounting-currency-rate" });
        rateIn.type = "text";
        rateIn.inputMode = "decimal";
        rateIn.value = r.rate;
        rateIn.placeholder = "rate";
        rateIn.addEventListener("input", () => {
          r.rate = rateIn.value;
          setDirty(true);
        });
        const dateIn = createDateField({
          kind: "date",
          value: r.asOf,
          cls: "accounting-ledger-input accounting-currency-date",
          onChange: (iso) => {
            r.asOf = iso;
            setDirty(true);
          }
        });
        row.appendChild(dateIn);
        if (r.isNew) rateIn.focus();
        const delBtn = row.createEl("button", { text: t("common.delete"), cls: "accounting-ledger-delete" });
        delBtn.onclick = () => {
          rows.splice(i, 1);
          setDirty(true);
          renderList();
        };
      }
    };
    renderList();
    const actions = bodyEl.createDiv({ cls: "accounting-ledger-card-actions" });
    let addHolder = null;
    let addPicker = null;
    const closeAddPicker = () => {
      addPicker?.destroy();
      addPicker = null;
      addHolder?.remove();
      addHolder = null;
    };
    const addBtn = actions.createEl("button", { text: t("settings.currency.addBtn"), cls: "accounting-ledger-create" });
    addBtn.onclick = () => {
      if (addHolder) {
        closeAddPicker();
        return;
      }
      addHolder = createDiv({ cls: "accounting-currency-add-holder" });
      actions.before(addHolder);
      const used = rows.map((r) => r.currency.trim().toUpperCase()).filter(Boolean);
      addPicker = createCurrencyPicker(addHolder, {
        exclude: [...used, baseCurrency],
        placeholder: t("settings.currency.searchToAddPlaceholder"),
        onPick: (code) => {
          rows.push({ id: crypto.randomUUID(), currency: code, rate: "", asOf: todayDateStr(), isNew: true });
          setDirty(true);
          closeAddPicker();
          renderList();
        },
        // 未选定而点击外部 → 收起整个加币种框（移动端不残留空搜索行）
        onDismiss: closeAddPicker
      });
      addPicker.input.focus();
    };
    const saveBtn = actions.createEl("button", { text: t("settings.currency.saved"), cls: "accounting-currency-save" });
    saveBtn.disabled = true;
    const cancelBtn = actions.createEl("button", { text: t("common.cancel"), cls: "accounting-currency-cancel" });
    cancelBtn.style.display = "none";
    cancelBtn.onclick = () => {
      closeAddPicker();
      void refresh();
    };
    saveBtn.onclick = async () => {
      const { invalid, duplicates, missingRate, emptyRows, baseRows } = validateRateRows(rows, baseCurrency);
      if (emptyRows > 0) {
        new import_obsidian19.Notice(t("settings.currency.errEmptyRows", { n: emptyRows }), 5e3);
        return;
      }
      if (invalid.length > 0) {
        new import_obsidian19.Notice(t("settings.currency.errInvalid", { list: invalid.join(", ") }), 5e3);
        return;
      }
      if (baseRows.length > 0) {
        new import_obsidian19.Notice(t("settings.currency.errBaseRow", { base: baseCurrency }), 5e3);
        return;
      }
      if (missingRate.length > 0) {
        new import_obsidian19.Notice(t("settings.currency.errMissingRate", { list: missingRate.join(", ") }), 5e3);
        return;
      }
      if (duplicates.length > 0) {
        new import_obsidian19.Notice(t("settings.currency.errDuplicates", { list: duplicates.join(", ") }), 5e3);
        return;
      }
      try {
        await adapter.writeRates(rateRowsToTable(rows, baseCurrency));
        new import_obsidian19.Notice(t("settings.currency.savedNotice"));
        setDirty(false);
        await refresh();
      } catch (error) {
        new import_obsidian19.Notice(t("entry.saveFailed", { msg: formatError(error) }), 5e3);
      }
    };
    const onlineEl = bodyEl.createDiv({ cls: "accounting-currency-online" });
    const renderOnline = (cfg) => {
      onlineEl.empty();
      const btnRow = onlineEl.createDiv({ cls: "accounting-currency-online-row" });
      const autoCb = btnRow.createEl("input", { cls: "accounting-checkbox" });
      autoCb.type = "checkbox";
      autoCb.checked = !!cfg.autoRefresh;
      autoCb.onchange = async () => {
        const next = { ...cfg, autoRefresh: autoCb.checked || void 0 };
        try {
          await adapter.writeRateConfig(next);
        } catch (e) {
          new import_obsidian19.Notice(t("entry.saveFailed", { msg: formatError(e) }));
        }
      };
      btnRow.createEl("span", { text: t("settings.currency.autoRefreshLabel"), cls: "accounting-currency-online-label" });
      const btn = btnRow.createEl("button", { text: t("settings.currency.refreshBtn"), cls: "accounting-ledger-refresh" });
      btn.onclick = async () => {
        btn.disabled = true;
        btn.setText(t("settings.currency.refreshing"));
        try {
          const url = `https://api.frankfurter.app/latest?from=${baseCurrency.toUpperCase()}`;
          const resp = await (0, import_obsidian19.requestUrl)({ url, method: "GET" });
          const fetched = parseRateResponse(resp.json, baseCurrency, nowISO());
          if (!fetched) {
            new import_obsidian19.Notice(t("settings.currency.parseFailed"));
            return;
          }
          const currentVisible = rows.map((r) => r.currency.trim().toUpperCase()).filter((c) => c && c !== baseCurrency);
          const { merged, updated } = mergeRatesByVisible(rates, fetched, currentVisible);
          if (updated === 0) {
            new import_obsidian19.Notice(t("settings.currency.noCaredCurrency"));
            return;
          }
          await adapter.writeRates(merged);
          const next = { ...cfg, lastSuccess: nowISO() };
          await adapter.writeRateConfig(next);
          new import_obsidian19.Notice(t("settings.currency.refreshedN", { n: updated }));
          await refresh();
        } catch (e) {
          new import_obsidian19.Notice(t("settings.currency.refreshFailed", { msg: formatError(e) }));
        } finally {
          btn.disabled = false;
          btn.setText(t("settings.currency.refreshBtn"));
        }
      };
      if (cfg.lastSuccess) {
        const timeRow = onlineEl.createDiv({ cls: "accounting-currency-online-row" });
        timeRow.createEl("span", { text: formatLocalTimestamp(cfg.lastSuccess, getLocale()), cls: "accounting-currency-online-label" });
      }
    };
    void adapter.readRateConfig().then(renderOnline).catch(() => renderOnline({}));
  }
  /** 新建账本：自定义 Modal + 即时校验；确认后 createLedger，切换动作交由 onDone 完成
   *  （与「切换」同模式：关旧设置页 + 用新 dataSubdir 重开，整个记账上下文刷新到新账本）。 */
  async openCreateLedgerModal(onDone) {
    const adapter = this.currentAdapter();
    const existing = await adapter.listLedgers();
    const modal = new CreateLedgerModal(this.app, existing, async (name, alias) => {
      try {
        const folder = await adapter.createLedger(name, alias || void 0);
        await onDone(folder, alias);
      } catch (error) {
        new import_obsidian19.Notice(t("settings.ledger.createFailed", { msg: formatError(error) }));
      }
    });
    modal.open();
  }
  /** 改账本别名：仅改 ledger.json，不改文件夹名 */
  async openRenameAliasModal(folder, currentAlias, onDone) {
    const adapter = this.currentAdapter();
    const modal = new RenameLedgerAliasModal(this.app, folder, currentAlias, async (alias) => {
      try {
        await adapter.writeLedgerAlias(folder, alias);
        new import_obsidian19.Notice(t("settings.ledger.aliasUpdated", { alias: alias || ObsidianDataAdapter.formatLedgerName(folder) }));
        await onDone();
      } catch (error) {
        new import_obsidian19.Notice(t("settings.ledger.renameFailed", { msg: formatError(error) }));
      }
    });
    modal.open();
  }
  /** 账本密码：设置/修改（经自定义 Modal，禁用 prompt）。change 模式新密码留空=删除密码（须先验证当前密码，防无验证清除）。 */
  async openLedgerPasswordModal(folder, alias, mode, onDone) {
    const adapter = this.currentAdapter();
    const modal = new LedgerPasswordModal(
      this.app,
      { mode, alias },
      async (values) => {
        try {
          if (mode === "set") {
            await adapter.writeLedgerPasswordMetaAt(folder, await buildLedgerPasswordMeta(values.new));
            new import_obsidian19.Notice(t("settings.password.toastSet"));
          } else {
            const meta = await adapter.readLedgerPasswordMetaAt(folder);
            if (!meta) return t("settings.password.toastFailed", { msg: "" });
            if (!await verifyLedgerPassword(values.old ?? "", meta.passwordHash)) {
              return t("settings.password.wrongOld");
            }
            if (values.new.trim().length === 0) {
              await adapter.writeLedgerPasswordMetaAt(folder, null);
              new import_obsidian19.Notice(t("settings.password.toastRemoved"));
            } else {
              await adapter.writeLedgerPasswordMetaAt(folder, await buildLedgerPasswordMeta(values.new));
              new import_obsidian19.Notice(t("settings.password.toastChanged"));
            }
          }
          await onDone();
          return null;
        } catch (error) {
          return t("settings.password.toastFailed", { msg: formatError(error) });
        }
      },
      () => void 0
    );
    modal.open();
  }
  /** 重新运行账本引导：清除 onboardingCompleted 标记，下次启动时重新显示引导 */
  async handleResetOnboarding() {
    if (!confirm(t("settings.onboarding.resetConfirm"))) return;
    try {
      this.plugin.settings.onboardingCompleted = false;
      await this.plugin.saveSettings();
      new import_obsidian19.Notice(t("settings.onboarding.resetDone"));
    } catch (error) {
      new import_obsidian19.Notice(t("settings.onboarding.resetFailed", { msg: formatError(error) }));
    }
  }
  /** 删除账本：两步 confirm，递归删整目录 */
  async handleDeleteLedger(folder, alias, onDone) {
    if (!confirm(t("settings.ledger.deleteConfirm1", { alias }))) return;
    if (!confirm(t("settings.ledger.deleteConfirm2", { alias }))) return;
    const adapter = this.currentAdapter();
    try {
      await adapter.deleteLedger(folder);
      new import_obsidian19.Notice(t("settings.ledger.deletedNotice", { alias }));
      await onDone();
    } catch (error) {
      new import_obsidian19.Notice(t("settings.ledger.deleteFailed", { msg: formatError(error) }));
    }
  }
  /** 显示备份列表弹窗 */
  async showBackupList() {
    const adapter = this.currentAdapter();
    try {
      const backups = await adapter.listBackups();
      const modal = new BackupModal(this.app, backups, async (backupName, action) => {
        if (action === "restore") {
          await this.handleRestoreBackup(adapter, backupName);
          modal.close();
        } else if (action === "delete") {
          const ok2 = await this.handleDeleteBackup(adapter, backupName);
          if (ok2) modal.refresh(await adapter.listBackups());
        }
      });
      modal.open();
    } catch (error) {
      new import_obsidian19.Notice(t("settings.backup.loadListFailed", { msg: formatError(error) }));
    }
  }
  /** 处理恢复备份（两步确认；adapter.restoreBackup 内部自动创建 pre-restore 兜底） */
  async handleRestoreBackup(adapter, backupName) {
    if (!confirm(t("settings.backup.restoreConfirm1", { name: backupName }))) return;
    if (!confirm(t("settings.backup.restoreConfirm2", { name: backupName }))) return;
    try {
      await adapter.restoreBackup(backupName);
      new import_obsidian19.Notice(t("settings.backup.restoredNotice", { name: backupName }));
    } catch (error) {
      new import_obsidian19.Notice(t("settings.backup.restoreFailed", { msg: formatError(error) }));
    }
  }
  /** 处理删除备份（单步确认） */
  async handleDeleteBackup(adapter, backupName) {
    if (!confirm(t("settings.backup.deleteConfirm", { name: backupName }))) return false;
    try {
      await adapter.deleteBackup(backupName);
      new import_obsidian19.Notice(t("settings.backup.deletedNotice", { name: backupName }));
      return true;
    } catch (error) {
      new import_obsidian19.Notice(t("settings.backup.deleteFailed", { msg: formatError(error) }));
      return false;
    }
  }
  /** 渲染周期账列表视图 */
  renderRecurringListView(containerEl) {
    const cardEl = containerEl.createDiv("accounting-ledger-card");
    const headEl = cardEl.createDiv("accounting-ledger-card-head");
    headEl.createEl("span", { text: t("settings.recurring.title"), cls: "accounting-ledger-card-title" });
    const headActions = headEl.createDiv("accounting-ledger-head-actions");
    const createBtn = headActions.createEl("button", { text: t("settings.recurring.createBtn"), cls: "accounting-ledger-create" });
    const refreshBtn = headActions.createEl("button", { text: t("settings.refreshBtn"), cls: "accounting-ledger-refresh" });
    const listEl = cardEl.createDiv("accounting-ledger-list");
    const refreshRules = async () => {
      const adapter = this.currentAdapter();
      try {
        const rules = await adapter.readRecurringRules();
        const active = rules.filter((r) => r.active);
        const inactive = rules.filter((r) => !r.active);
        listEl.empty();
        if (active.length === 0 && inactive.length === 0) {
          listEl.createEl("p", {
            text: t("settings.recurring.empty"),
            cls: "accounting-ledger-empty"
          });
          return;
        }
        if (active.length > 0) {
          const sectionEl = listEl.createDiv("accounting-recurring-section");
          sectionEl.createEl("h3", { text: t("settings.recurring.active", { n: active.length }) });
          for (const rule of active) {
            await this.renderRuleItem(sectionEl, rule, adapter, refreshRules);
          }
        }
        if (inactive.length > 0) {
          const sectionEl = listEl.createDiv("accounting-recurring-section");
          const details = sectionEl.createEl("details", { cls: "accounting-details" });
          details.createEl("summary", { text: t("settings.recurring.inactiveSummary", { n: inactive.length }), cls: "accounting-collapsible-head" });
          for (const rule of inactive) {
            await this.renderRuleItem(details, rule, adapter, refreshRules);
          }
        }
      } catch (error) {
        listEl.empty();
        listEl.createEl("p", {
          text: t("settings.recurring.loadFailed", { msg: formatError(error) }),
          cls: "accounting-ledger-empty"
        });
      }
    };
    createBtn.onclick = () => {
      void openEntryRecurring(this.app, this.currentAdapter(), {}, () => {
        this.showRecurring();
      });
    };
    refreshBtn.onclick = async () => {
      await refreshRules();
      new import_obsidian19.Notice(t("settings.recurring.refreshedNotice"));
    };
    void refreshRules();
  }
  /** 渲染单个周期账规则项 */
  async renderRuleItem(containerEl, rule, adapter, refreshRules) {
    const itemEl = containerEl.createDiv("accounting-ledger-item");
    const infoEl = itemEl.createDiv("accounting-ledger-info");
    const titleEl = infoEl.createDiv("accounting-ledger-name");
    titleEl.createEl("span", { text: rule.name, cls: "accounting-ledger-name-text" });
    const typeBadge = titleEl.createEl("span", {
      text: this.typeLabel(rule.type),
      cls: "accounting-ledger-badge"
    });
    if (!rule.active) {
      titleEl.createEl("span", { text: t("settings.recurring.paused"), cls: "accounting-ledger-badge accounting-ledger-badge-muted" });
    }
    const detailEl = infoEl.createDiv("accounting-ledger-folder");
    detailEl.createEl("span", { text: `${this.periodText(rule)} \xB7 ${formatMoney(rule.amount, rule.currency || "CNY")}` });
    if (rule.account) {
      const accountInfo = await this.getAccountName(adapter, rule.account);
      if (accountInfo) detailEl.createEl("span", { text: `\xB7 ${accountInfo}` });
    }
    if (rule.category) {
      detailEl.createEl("span", { text: `\xB7 ${rule.category}` });
    }
    const bottomEl = infoEl.createDiv("accounting-ledger-next");
    if (rule.active) {
      const next = nextOccurrence(rule, /* @__PURE__ */ new Date());
      if (next) {
        bottomEl.createEl("span", { text: t("settings.recurring.nextPeriodLabel") });
        bottomEl.createEl("span", { text: formatDateDisplay(formatDateOnly(next), getLocale()), cls: "accounting-ledger-next-date" });
      }
    }
    const actionsEl = bottomEl.createDiv("accounting-ledger-actions");
    const viewBtn = actionsEl.createEl("button", {
      text: "\u{1F441}",
      cls: "accounting-ledger-switch"
    });
    viewBtn.setAttribute("aria-label", t("settings.recurring.viewTxAria"));
    viewBtn.onclick = () => {
      openList(this.app, adapter, this.plugin.navCtx(adapter), void 0, void 0, rule.id, true);
    };
    const toggleBtn = actionsEl.createEl("button", {
      text: rule.active ? "\u23F8" : "\u25B6",
      cls: "accounting-ledger-switch"
    });
    toggleBtn.onclick = async () => {
      try {
        const rules = await adapter.readRecurringRules();
        const updated = rules.map((r) => r.id === rule.id ? { ...r, active: !r.active } : r);
        await adapter.writeRecurringRules(updated);
        new import_obsidian19.Notice(rule.active ? t("settings.recurring.paused") : t("settings.recurring.enabledNotice"));
        void refreshRules();
      } catch (error) {
        new import_obsidian19.Notice(t("settings.recurring.toggleFailed", { msg: formatError(error) }));
      }
    };
    const editBtn = actionsEl.createEl("button", {
      text: "\u270E",
      cls: "accounting-ledger-rename"
    });
    editBtn.onclick = () => {
      void openEntryRecurring(this.app, this.currentAdapter(), { editing: rule }, () => {
        this.showRecurring();
      });
    };
    const deleteBtn = actionsEl.createEl("button", {
      text: "\u{1F5D1}",
      cls: "accounting-ledger-delete"
    });
    deleteBtn.onclick = async () => {
      if (!confirm(t("settings.recurring.deleteConfirm", { name: rule.name }))) return;
      try {
        const rules = await adapter.readRecurringRules();
        await adapter.writeRecurringRules(rules.filter((r) => r.id !== rule.id));
        new import_obsidian19.Notice(t("settings.recurring.deletedNotice"));
        void refreshRules();
      } catch (error) {
        new import_obsidian19.Notice(t("settings.recurring.deleteFailed", { msg: formatError(error) }));
      }
    };
  }
  typeLabel(type) {
    switch (type) {
      case "expense":
        return t("tx.type.expense");
      case "income":
        return t("tx.type.income");
      case "transfer":
        return t("tx.type.transfer");
      case "loan":
        return t("tx.type.loan");
    }
  }
  periodText(rule) {
    if (rule.period === "monthly") {
      return t("settings.recurring.monthlyDay", { day: rule.dayOfMonth ?? 0 });
    } else if (rule.period === "weekly") {
      const weekdayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const key = weekdayKeys[rule.dayOfWeek ?? 0] ?? "sun";
      return t("settings.recurring.weeklyDay", { day: t(`settings.recurring.weekday.${key}`) });
    } else if (rule.period === "yearly") {
      return t("settings.recurring.yearlyDay", { month: rule.monthOfYear ?? 0, day: rule.dayOfYear ?? 0 });
    }
    return "";
  }
  async getAccountName(adapter, accountId) {
    try {
      const meta = await adapter.readMeta();
      const account = meta.accounts.find((a) => a.id === accountId);
      return account?.name ?? accountId;
    } catch {
      return accountId;
    }
  }
  /** 渲染分类管理列表视图：支出/收入各自独立成块（每块自己的新增入口、可见列表、已隐藏折叠区）。复用 core planRename/planMerge 规划。 */
  renderCategoryListView(containerEl) {
    const rootEl = containerEl.createDiv("accounting-cat-page");
    const collapsed = { expense: true, income: true };
    const byName2 = (a, b) => a.name.localeCompare(b.name, "zh");
    const refreshCategories = async () => {
      const adapter = this.currentAdapter();
      try {
        const [meta, events] = await Promise.all([adapter.readMeta(), adapter.loadLog()]);
        const categories = meta.categories;
        const folded = foldEvents(events);
        const refCountOf = (name) => folded.filter((tx) => tx.category === name).length;
        rootEl.empty();
        this.renderCategoryFlowBlock(rootEl, {
          flow: "expense",
          title: t("settings.category.expenseTitle"),
          placeholder: t("settings.category.expensePlaceholder"),
          addLabel: t("settings.category.expenseAdd"),
          categories,
          refCountOf,
          byName: byName2,
          refreshCategories,
          collapsed: collapsed.expense,
          onToggleCollapse: (next) => {
            collapsed.expense = next;
          }
        });
        this.renderCategoryFlowBlock(rootEl, {
          flow: "income",
          title: t("settings.category.incomeTitle"),
          placeholder: t("settings.category.incomePlaceholder"),
          addLabel: t("settings.category.incomeAdd"),
          categories,
          refCountOf,
          byName: byName2,
          refreshCategories,
          collapsed: collapsed.income,
          onToggleCollapse: (next) => {
            collapsed.income = next;
          }
        });
      } catch (error) {
        rootEl.empty();
        rootEl.createEl("p", { text: t("settings.category.loadFailed", { msg: formatError(error) }), cls: "accounting-ledger-empty" });
      }
    };
    void refreshCategories();
  }
  /** 单个 flow 分类区块：新增入口 + 可见列表 + 该 flow 的已隐藏折叠区。 */
  renderCategoryFlowBlock(rootEl, opts) {
    const { flow, title, placeholder, addLabel, categories, refCountOf, byName: byName2, refreshCategories, collapsed, onToggleCollapse } = opts;
    const all = categories.filter((c) => c.flow === flow);
    const visible = all.filter((c) => c.active !== false).slice().sort(byName2);
    const hidden = all.filter((c) => c.active === false).slice().sort(byName2);
    const cardEl = rootEl.createDiv(`accounting-ledger-card accounting-cat-flow-card accounting-cat-flow-${flow}${collapsed ? " accounting-cat-collapsed" : ""}`);
    const headEl = cardEl.createDiv("accounting-ledger-card-head");
    headEl.createEl("span", { cls: "accounting-cat-toggle" });
    headEl.createEl("span", { text: title, cls: "accounting-ledger-card-title" });
    headEl.createEl("span", { text: String(visible.length), cls: "accounting-ledger-badge accounting-ledger-badge-muted" });
    const headActions = headEl.createDiv("accounting-ledger-head-actions");
    const createBtn = headActions.createEl("button", { text: addLabel, cls: "accounting-ledger-create" });
    const refreshBtn = headActions.createEl("button", { text: t("settings.refreshBtn"), cls: "accounting-ledger-refresh" });
    headEl.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      const next = !cardEl.classList.contains("accounting-cat-collapsed");
      cardEl.classList.toggle("accounting-cat-collapsed", next);
      onToggleCollapse(next);
    });
    const listEl = cardEl.createDiv("accounting-ledger-list");
    if (visible.length === 0) {
      listEl.createEl("div", { text: t("settings.category.emptyTitle", { title }), cls: "accounting-cat-group-empty" });
    }
    for (const c of visible) this.renderCategoryItem(listEl, c, refCountOf(c.name), categories, refreshCategories);
    if (hidden.length > 0) {
      const details = cardEl.createEl("details", { cls: "accounting-cat-hidden-section" });
      const summary = details.createEl("summary", { cls: "accounting-cat-hidden-head accounting-collapsible-head" });
      summary.createEl("span", { text: t("settings.category.hiddenLabel") });
      summary.createEl("span", { text: String(hidden.length), cls: "accounting-ledger-badge accounting-ledger-badge-muted" });
      summary.createEl("span", {
        text: t("settings.category.hiddenNote"),
        cls: "accounting-cat-hidden-note"
      });
      for (const c of hidden) this.renderHiddenCategoryItem(details, c, refCountOf(c.name), refreshCategories);
    }
    createBtn.onclick = () => {
      new CreateCategoryModal(this.app, flow, title, placeholder, async (name) => {
        try {
          await this.handleAddCategory(name, flow);
          new import_obsidian19.Notice(t("settings.category.addedNotice", { name }));
          await refreshCategories();
        } catch (error) {
          new import_obsidian19.Notice(t("settings.category.addFailed", { msg: formatError(error) }));
        }
      }).open();
    };
    refreshBtn.onclick = async () => {
      await refreshCategories();
      new import_obsidian19.Notice(t("settings.category.refreshedNotice", { title }));
    };
  }
  /** 可见分类行：重命名 / 合并 / 删除（删除双态：被引用→隐藏，未引用→物理删） */
  renderCategoryItem(containerEl, cat, refCount, allCategories, refresh) {
    const itemEl = containerEl.createDiv("accounting-ledger-item");
    const infoEl = itemEl.createDiv("accounting-ledger-info");
    infoEl.createEl("div", { text: cat.name, cls: "accounting-ledger-name" });
    const actionsEl = itemEl.createDiv("accounting-ledger-actions accounting-cat-actions");
    const renameBtn = actionsEl.createEl("button", { text: "\u270E", cls: "accounting-ledger-rename" });
    renameBtn.setAttribute("aria-label", t("settings.category.renameAria"));
    renameBtn.onclick = () => {
      new RenameCategoryModal(this.app, cat, async (newName) => {
        try {
          const { rewritten } = await this.handleRenameCategory(cat.id, newName);
          new import_obsidian19.Notice(rewritten > 0 ? t("settings.category.renamedNotice", { n: rewritten }) : t("settings.category.renamedShort"));
          await refresh();
        } catch (error) {
          new import_obsidian19.Notice(t("settings.category.renameFailed", { msg: formatError(error) }));
        }
      }).open();
    };
    const targets = allCategories.filter((x) => x.flow === cat.flow && x.id !== cat.id).sort((a, b) => a.name.localeCompare(b.name, "zh"));
    const mergeBtn = actionsEl.createEl("button", { text: "\u2934", cls: "accounting-ledger-merge" });
    mergeBtn.setAttribute("aria-label", t("settings.category.mergeAria"));
    mergeBtn.onclick = () => {
      if (targets.length === 0) {
        new import_obsidian19.Notice(t("settings.category.mergeNoTargets"));
        return;
      }
      new MergeCategoryModal(this.app, cat, targets, refCount, async (toId) => {
        try {
          const { rewritten } = await this.handleMergeCategory(cat.id, toId);
          new import_obsidian19.Notice(rewritten > 0 ? t("settings.category.mergedNotice", { n: rewritten }) : t("settings.category.mergedShort"));
          await refresh();
        } catch (error) {
          new import_obsidian19.Notice(t("settings.category.mergeFailed", { msg: formatError(error) }));
        }
      }).open();
    };
    const deleteBtn = actionsEl.createEl("button", { text: "\u{1F5D1}", cls: "accounting-ledger-delete" });
    deleteBtn.setAttribute("aria-label", t("settings.category.deleteAria"));
    deleteBtn.onclick = async () => {
      try {
        await this.handleDeleteCategory(cat, refCount);
        await refresh();
      } catch (error) {
        new import_obsidian19.Notice(t("settings.category.deleteFailed", { msg: formatError(error) }));
      }
    };
  }
  /** 已隐藏分类行：恢复；未被引用时允许彻底删除 */
  renderHiddenCategoryItem(containerEl, cat, refCount, refresh) {
    const itemEl = containerEl.createDiv("accounting-ledger-item");
    const infoEl = itemEl.createDiv("accounting-ledger-info");
    infoEl.createEl("div", { text: cat.name, cls: "accounting-ledger-folder" });
    const actionsEl = itemEl.createDiv("accounting-ledger-actions accounting-cat-actions");
    const restoreBtn = actionsEl.createEl("button", { text: t("settings.category.restoreBtn"), cls: "accounting-ledger-restore" });
    restoreBtn.onclick = async () => {
      try {
        await this.handleRestoreCategory(cat);
        new import_obsidian19.Notice(t("settings.category.restoredNotice", { name: cat.name }));
        await refresh();
      } catch (error) {
        new import_obsidian19.Notice(t("settings.category.restoreFailed", { msg: formatError(error) }));
      }
    };
    if (refCount === 0) {
      const delBtn = actionsEl.createEl("button", { text: "\u{1F5D1}", cls: "accounting-ledger-delete" });
      delBtn.setAttribute("aria-label", t("settings.category.purgeAria"));
      delBtn.onclick = async () => {
        try {
          await this.handleDeleteCategory(cat, 0);
          await refresh();
        } catch (error) {
          new import_obsidian19.Notice(t("settings.category.deleteFailed", { msg: formatError(error) }));
        }
      };
    }
  }
  /** 新增分类：仅写元数据（与桌面端 add 一致，不做撞名拦截）。 */
  async handleAddCategory(name, flow) {
    const adapter = this.currentAdapter();
    const { accounts, categories } = await adapter.readMeta();
    const next = [...categories, { id: newCategoryId(), name, flow }];
    await adapter.writeMeta({ accounts, categories: next });
  }
  /** 重命名分类：复用 core planRenameCategory（校验 + 重写规划）。抛错由调用方 Notice。 */
  async handleRenameCategory(id, newName) {
    const adapter = this.currentAdapter();
    const [meta, events] = await Promise.all([adapter.readMeta(), adapter.loadLog()]);
    const plan = planRenameCategory({ events, categories: meta.categories, id, newName, now: nowISO() });
    if (plan.events.length > 0) {
      await adapter.backup("pre-rename");
      await adapter.appendEvents(plan.events);
    }
    await adapter.writeMeta({ accounts: meta.accounts, categories: plan.categories });
    return { rewritten: plan.rewritten };
  }
  /** 合并分类：复用 core planMergeCategory。目标已二次确认；抛错由调用方 Notice。 */
  async handleMergeCategory(fromId, toId) {
    const adapter = this.currentAdapter();
    const [meta, events] = await Promise.all([adapter.readMeta(), adapter.loadLog()]);
    const plan = planMergeCategory({ events, categories: meta.categories, fromId, toId, now: nowISO() });
    if (plan.events.length > 0) {
      await adapter.backup("pre-merge");
      await adapter.appendEvents(plan.events);
    }
    await adapter.writeMeta({ accounts: meta.accounts, categories: plan.categories });
    return { rewritten: plan.rewritten };
  }
  /** 删除分类双态：被引用→隐藏（active:false）；未被引用→物理删。单步 confirm（与桌面端一致）。 */
  async handleDeleteCategory(cat, refCount) {
    const adapter = this.currentAdapter();
    const { accounts, categories } = await adapter.readMeta();
    if (refCount > 0) {
      if (!confirm(t("settings.category.deleteConfirmUsed", { name: cat.name, n: refCount }))) return;
      const next = categories.map((c) => c.id === cat.id ? { ...c, active: false } : c);
      await adapter.writeMeta({ accounts, categories: next });
      new import_obsidian19.Notice(t("settings.category.hiddenNotice", { name: cat.name }));
    } else {
      if (!confirm(t("settings.category.purgeConfirm", { name: cat.name }))) return;
      const next = categories.filter((c) => c.id !== cat.id);
      await adapter.writeMeta({ accounts, categories: next });
      new import_obsidian19.Notice(t("settings.category.deletedNotice", { name: cat.name }));
    }
  }
  /** 恢复隐藏分类：active 置为可见。 */
  async handleRestoreCategory(cat) {
    const adapter = this.currentAdapter();
    const { accounts, categories } = await adapter.readMeta();
    const next = categories.map((c) => c.id === cat.id ? { ...c, active: true } : c);
    await adapter.writeMeta({ accounts, categories: next });
  }
  // ===== 账户类型管理（「分类」tab 第二段，与桌面端同 tab 对齐）=====
  /** 读取账户类型配置草稿：null/缺失回退 core 默认 → 经 normalizeAccountTypeSettings 归一化（类型 key 不可变）。 */
  async loadAccountTypeDraft() {
    const raw = await this.currentAdapter().readAccountTypeSettings();
    return normalizeAccountTypeSettings(raw ?? defaultAccountTypeSettings());
  }
  /** 保存账户类型配置：pre-account-types 备份 → 整文件覆盖写回（与桌面端一致）。 */
  async saveAccountTypeDraft(draft) {
    const adapter = this.currentAdapter();
    await adapter.backup("pre-account-types");
    await adapter.writeAccountTypeSettings(draft);
  }
  /**
   * 渲染「设置-分类」账户类型界面：拆两个卡片（与桌面端对齐）。
   *  1. 账户类型卡（accountTypes）：系统类型重命名 + 自定义类型新增/删除/改 kind + 启停。
   *  2. 账户类型分组卡（accountType）：分组改名/增删/排序、类型归属/组内排序；类型行 label 只读（重命名/停用归「账户类型」卡）。
   * tap-based 编辑（不拖拽）：排序用上移/下移按钮，换组用 RegroupTypeModal。
   * 即时保存（与桌面端一致）：每次编辑直接写 account-types.json，无保存/取消 footer；
   * 破坏性操作（删类型/删分组/恢复默认）先 backup('pre-account-types') 再写。内联 label 输入 blur 提交（避免每击键写盘）。
   * 复用 core 默认值/归一化/编辑纯函数与既有 adapter 读写方法，不重新实现归一化、不新增 adapter 方法。
   */
  renderAccountTypeView(containerEl) {
    const typesCardEl = containerEl.createDiv("accounting-ledger-card accounting-cat-flow-card accounting-cat-collapsed");
    const typesHeadEl = typesCardEl.createDiv("accounting-ledger-card-head");
    typesHeadEl.createEl("span", { cls: "accounting-cat-toggle" });
    typesHeadEl.createEl("span", { text: t("settings.accountTypes.title"), cls: "accounting-ledger-card-title" });
    const typesBadgeEl = typesHeadEl.createEl("span", { cls: "accounting-ledger-badge accounting-ledger-badge-muted" });
    const typesHeadActions = typesHeadEl.createDiv("accounting-ledger-head-actions");
    const addTypeBtn = typesHeadActions.createEl("button", { text: t("settings.accountTypes.add"), cls: "accounting-ledger-create" });
    const resetTypesBtn = typesHeadActions.createEl("button", { text: t("settings.accountType.resetBtn"), cls: "accounting-ledger-refresh" });
    const typesBodyEl = typesCardEl.createDiv("accounting-ledger-list");
    const cardEl = containerEl.createDiv("accounting-ledger-card accounting-cat-flow-card accounting-cat-collapsed");
    const headEl = cardEl.createDiv("accounting-ledger-card-head");
    headEl.createEl("span", { cls: "accounting-cat-toggle" });
    headEl.createEl("span", { text: t("settings.accountType.title"), cls: "accounting-ledger-card-title" });
    const badgeEl = headEl.createEl("span", { cls: "accounting-ledger-badge accounting-ledger-badge-muted" });
    const headActions = headEl.createDiv("accounting-ledger-head-actions");
    const addGroupBtn = headActions.createEl("button", { text: t("settings.accountType.addGroupBtn"), cls: "accounting-ledger-create" });
    const resetGroupsBtn = headActions.createEl("button", { text: t("settings.accountType.resetBtn"), cls: "accounting-ledger-refresh" });
    const bodyEl = cardEl.createDiv("accounting-ledger-list");
    headEl.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      cardEl.classList.toggle("accounting-cat-collapsed");
    });
    typesHeadEl.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      typesCardEl.classList.toggle("accounting-cat-collapsed");
    });
    let draft = defaultAccountTypeSettings();
    let accountsCache = [];
    const countByType = (type) => {
      let active = 0;
      let total = 0;
      for (const a of accountsCache) {
        if (a.type !== type) continue;
        total++;
        if (a.active) active++;
      }
      return { active, total };
    };
    const persist = async (next, withBackup = false) => {
      try {
        if (withBackup) await this.saveAccountTypeDraft(next);
        else await this.currentAdapter().writeAccountTypeSettings(next);
      } catch (error) {
        new import_obsidian19.Notice(t("entry.saveFailed", { msg: formatError(error) }));
      }
    };
    const renderTypesBody = () => {
      typesBodyEl.empty();
      typesBadgeEl.setText(String(draft.types.length));
      const renderRow = (at, inactive2, parent = typesBodyEl) => {
        const row = parent.createDiv("accounting-at-type");
        const info = row.createDiv("accounting-at-type-info");
        const isSys = isSystemAccountType(at.type);
        const labelRow = info.createDiv("accounting-at-type-label-row");
        const labelIn = labelRow.createEl("input", { cls: "accounting-ledger-input" });
        labelIn.value = isSys ? displayTypeLabel2(at.type, at.label) : at.label;
        labelIn.addEventListener("blur", () => {
          const raw = labelIn.value.trim();
          if (raw && raw !== labelIn.defaultValue) {
            draft = setTypeLabel(draft, at.type, raw);
            void persist(draft);
            renderGroupsBody();
          }
        });
        labelIn.addEventListener("keydown", (e) => {
          if (e.key === "Enter") labelIn.blur();
        });
        const { active: active2, total } = countByType(at.type);
        const accCount = labelRow.createEl("span", {
          text: `${active2}/${total}`,
          cls: "accounting-ledger-badge accounting-ledger-badge-muted"
        });
        accCount.title = t("settings.accountTypes.accountCountTip", { active: active2, total });
        const actions = row.createDiv("accounting-ledger-actions");
        if (isSys) {
          const kindSpan = actions.createEl("span", { text: kindOfLabel(at.type), cls: "accounting-at-kind" });
        } else {
          const kindSel = actions.createEl("select", { cls: "accounting-ledger-input accounting-at-kind-select" });
          kindSel.createEl("option", { text: t("accountKind.asset"), value: "asset" });
          kindSel.createEl("option", { text: t("accountKind.liability"), value: "liability" });
          kindSel.value = at.kind ?? "asset";
          kindSel.addEventListener("change", () => {
            draft = setTypeKind(draft, at.type, kindSel.value);
            void persist(draft);
          });
        }
        if (inactive2) {
          const enableBtn = actions.createEl("button", { text: t("settings.accountType.enableBtn"), cls: "accounting-ledger-create" });
          enableBtn.onclick = () => {
            draft = setTypeActive(draft, at.type, true);
            void persist(draft);
            renderTypesBody();
            renderGroupsBody();
          };
        } else {
          const stopBtn = actions.createEl("button", { text: t("settings.accountType.disableBtn") });
          stopBtn.onclick = () => {
            draft = setTypeActive(draft, at.type, false);
            void persist(draft);
            renderTypesBody();
            renderGroupsBody();
          };
        }
        if (!isSys) {
          const delBtn = actions.createEl("button", { text: t("settings.accountTypes.delete"), cls: "accounting-ledger-delete" });
          delBtn.onclick = () => {
            if (!confirm(t("settings.accountTypes.deleteConfirm", { label: at.label }))) return;
            draft = removeType(draft, at.type);
            void persist(draft, true);
            renderTypesBody();
            renderGroupsBody();
          };
        }
      };
      const active = draft.types.filter((at) => at.active !== false);
      const inactive = draft.types.filter((at) => at.active === false);
      for (const at of active) renderRow(at, false);
      if (inactive.length > 0) {
        const details = typesBodyEl.createEl("details");
        details.createEl("summary", { text: t("settings.accountType.inactiveSummary", { n: inactive.length }), cls: "accounting-collapsible-head" });
        for (const at of inactive) renderRow(at, true, details);
      }
    };
    const renderGroupsBody = () => {
      bodyEl.empty();
      badgeEl.setText(String(draft.types.filter((at) => at.active !== false).length));
      for (const group of draft.groups) {
        this.renderAccountTypeGroup(bodyEl, group, draft, {
          onGroupLabel: (label) => {
            draft = setGroupLabel(draft, group.id, label);
            void persist(draft);
          },
          onMoveGroup: (dir) => {
            draft = moveGroup(draft, group.id, dir);
            void persist(draft);
            renderGroupsBody();
          },
          onRemoveGroup: () => {
            if (draft.groups.length <= 1) return;
            const fallback = draft.groups.find((g) => g.id !== group.id);
            if (!confirm(t("settings.accountType.deleteGroupConfirm", { label: group.label, fallback: fallback?.label ?? t("settings.accountType.firstRemainingGroup") }))) return;
            draft = removeGroup(draft, group.id);
            void persist(draft, true);
            renderGroupsBody();
          },
          onRegroup: (type, label) => {
            new RegroupTypeModal(this.app, label, group.id, draft.groups, async (groupId) => {
              draft = setTypeGroup(draft, type, groupId);
              void persist(draft);
              renderGroupsBody();
            }).open();
          },
          onMoveType: (type, dir) => {
            draft = moveType(draft, type, dir);
            void persist(draft);
            renderGroupsBody();
          }
        });
      }
    };
    const renderList = () => {
      renderGroupsBody();
      renderTypesBody();
    };
    const refresh = async () => {
      try {
        const [draftRaw, meta] = await Promise.all([
          this.loadAccountTypeDraft(),
          this.currentAdapter().readMeta()
        ]);
        draft = draftRaw;
        accountsCache = meta.accounts;
        renderList();
      } catch (error) {
        bodyEl.empty();
        bodyEl.createEl("p", { text: t("settings.accountType.loadFailed", { msg: formatError(error) }), cls: "accounting-ledger-empty" });
      }
    };
    addTypeBtn.onclick = () => {
      new CreateAccountTypeModal(this.app, draft.groups, async (label, kind, groupId) => {
        draft = addType(draft, { label, kind, groupId });
        void persist(draft, true);
        renderTypesBody();
        renderGroupsBody();
      }).open();
    };
    addGroupBtn.onclick = () => {
      new CreateAccountTypeGroupModal(this.app, async (label) => {
        draft = addGroup(draft, label);
        void persist(draft, true);
        renderGroupsBody();
        renderTypesBody();
      }).open();
    };
    resetTypesBtn.onclick = () => {
      if (!confirm(t("settings.accountTypes.resetConfirm"))) return;
      draft = normalizeAccountTypeSettings({ groups: draft.groups, types: defaultAccountTypeSettings().types });
      void persist(draft, true);
      renderList();
    };
    resetGroupsBtn.onclick = () => {
      if (!confirm(t("settings.accountType.resetConfirm"))) return;
      draft = normalizeAccountTypeSettings({ groups: defaultAccountTypeSettings().groups, types: draft.types });
      void persist(draft, true);
      renderList();
    };
    void refresh();
  }
  /** 渲染单个类型分组区块：改名 + 类型计数 + 上移/下移 + 删除分组，组内类型行（label + 重分组/上移/下移）。 */
  renderAccountTypeGroup(parent, group, draft, cb) {
    const groupIdx = draft.groups.findIndex((g) => g.id === group.id);
    const groupTypes = draft.types.filter((at) => at.groupId === group.id && at.active !== false);
    const block = parent.createDiv("accounting-at-group");
    const head = block.createDiv("accounting-at-group-head");
    const nameInput = head.createEl("input", { cls: "accounting-ledger-input accounting-at-group-name" });
    nameInput.type = "text";
    nameInput.value = group.label;
    nameInput.addEventListener("blur", () => {
      const raw = nameInput.value.trim();
      if (raw && raw !== nameInput.defaultValue) cb.onGroupLabel(raw);
    });
    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") nameInput.blur();
    });
    head.createEl("span", { text: String(groupTypes.length), cls: "accounting-ledger-badge accounting-ledger-badge-muted" });
    const actions = head.createDiv("accounting-ledger-actions");
    const upBtn = actions.createEl("button", { text: "\u2191" });
    upBtn.disabled = groupIdx <= 0;
    upBtn.setAttribute("aria-label", t("settings.accountType.moveUpGroupAria"));
    upBtn.onclick = () => cb.onMoveGroup(-1);
    const downBtn = actions.createEl("button", { text: "\u2193" });
    downBtn.disabled = groupIdx >= draft.groups.length - 1;
    downBtn.setAttribute("aria-label", t("settings.accountType.moveDownGroupAria"));
    downBtn.onclick = () => cb.onMoveGroup(1);
    const delBtn = actions.createEl("button", { text: t("settings.accountType.deleteGroupBtn"), cls: "accounting-ledger-delete" });
    delBtn.disabled = draft.groups.length <= 1;
    delBtn.onclick = () => cb.onRemoveGroup();
    const typesEl = block.createDiv("accounting-at-types");
    if (groupTypes.length === 0) {
      typesEl.createEl("div", { text: t("settings.accountType.emptyGroup"), cls: "accounting-at-empty" });
    }
    groupTypes.forEach((at, i) => {
      const row = typesEl.createDiv("accounting-at-type");
      const moveActions = row.createDiv("accounting-ledger-actions");
      const tUp = moveActions.createEl("button", { text: "\u2191" });
      tUp.disabled = i <= 0;
      tUp.setAttribute("aria-label", t("settings.accountType.moveUpTypeAria"));
      tUp.onclick = () => cb.onMoveType(at.type, -1);
      const tDown = moveActions.createEl("button", { text: "\u2193" });
      tDown.disabled = i >= groupTypes.length - 1;
      tDown.setAttribute("aria-label", t("settings.accountType.moveDownTypeAria"));
      tDown.onclick = () => cb.onMoveType(at.type, 1);
      const info = row.createDiv("accounting-at-type-info");
      const labelEl = info.createEl("span", { text: displayTypeLabel2(at.type, at.label), cls: "accounting-at-type-label" });
      const rowActions = row.createDiv("accounting-ledger-actions");
      const regroupBtn = rowActions.createEl("button", { text: t("settings.accountType.regroupBtn") });
      regroupBtn.disabled = draft.groups.length <= 1;
      regroupBtn.setAttribute("aria-label", t("settings.accountType.regroupAria"));
      regroupBtn.onclick = () => cb.onRegroup(at.type, at.label);
    });
  }
};
var CreateLedgerModal = class extends import_obsidian19.Modal {
  constructor(app, existing, onSubmit) {
    super(app);
    this.existing = existing;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian19.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    renderCreateLedgerForm(this.contentEl, this.existing, {
      onSubmit: async (name, alias) => {
        try {
          await this.onSubmit(name, alias);
        } finally {
          this.close();
        }
        return true;
      },
      onCancel: () => this.close()
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var RenameLedgerAliasModal = class extends import_obsidian19.Modal {
  constructor(app, folder, currentAlias, onSubmit) {
    super(app);
    this.folder = folder;
    this.currentAlias = currentAlias;
    this.onSubmit = onSubmit;
  }
  input;
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian19.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: t("settings.ledger.renameAliasTitle") });
    this.input = contentEl.createEl("input", { type: "text", cls: "accounting-ledger-input" });
    this.input.value = this.currentAlias;
    this.input.placeholder = this.folder;
    const actions = contentEl.createDiv("accounting-modal-actions");
    const cancelBtn = actions.createEl("button", { text: t("common.cancel"), cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
    const submitBtn = actions.createEl("button", { text: t("common.save"), cls: "accounting-btn-primary" });
    submitBtn.onclick = async () => {
      const alias = this.input.value.trim();
      this.close();
      await this.onSubmit(alias);
    };
    setTimeout(() => this.input.focus(), 0);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var BackupModal = class extends import_obsidian19.Modal {
  constructor(app, backups, onAction) {
    super(app);
    this.backups = backups;
    this.onAction = onAction;
  }
  onOpen() {
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian19.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    this.render();
  }
  onClose() {
    this.contentEl.empty();
  }
  /** 删除后由调用方传入新列表，重渲染 */
  refresh(backups) {
    this.backups = backups;
    this.render();
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: t("settings.backup.modalTitle") });
    if (this.backups.length === 0) {
      contentEl.createEl("p", { text: t("settings.backup.empty") });
    } else {
      const list = contentEl.createDiv("accounting-backup-list");
      for (const backup of this.backups) {
        const item = list.createDiv("accounting-backup-item");
        const info = item.createDiv("accounting-backup-info");
        info.createEl("div", { text: backup.name, cls: "accounting-backup-name" });
        if (backup.mtime > 0) {
          info.createEl("div", {
            text: new Date(backup.mtime).toLocaleString(),
            cls: "accounting-backup-time"
          });
        }
        const actions = item.createDiv("accounting-backup-actions");
        const restoreBtn = actions.createEl("button", { text: t("settings.backup.restoreBtn") });
        restoreBtn.onclick = () => {
          void this.onAction(backup.name, "restore");
        };
        const deleteBtn = actions.createEl("button", { text: t("common.delete"), cls: "accounting-ledger-delete" });
        deleteBtn.onclick = () => {
          void this.onAction(backup.name, "delete");
        };
      }
    }
    const closeWrap = contentEl.createDiv("accounting-modal-close");
    const closeBtn = closeWrap.createEl("button", { text: t("common.close"), cls: "accounting-btn-secondary" });
    closeBtn.onclick = () => this.close();
  }
};
var CreateCategoryModal = class extends import_obsidian19.Modal {
  constructor(app, flow, flowTitle, placeholder, onSubmit) {
    super(app);
    this.flow = flow;
    this.flowTitle = flowTitle;
    this.placeholder = placeholder;
    this.onSubmit = onSubmit;
  }
  nameInput;
  submitBtn;
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian19.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: t("settings.category.createTitle", { title: this.flowTitle }) });
    this.nameInput = contentEl.createEl("input", { type: "text", cls: "accounting-ledger-input" });
    this.nameInput.placeholder = this.placeholder;
    const actions = contentEl.createDiv("accounting-modal-actions");
    const cancelBtn = actions.createEl("button", { text: t("common.cancel"), cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
    this.submitBtn = actions.createEl("button", { text: t("ledger.create.submitBtn"), cls: "accounting-btn-primary" });
    this.submitBtn.disabled = true;
    this.submitBtn.onclick = async () => {
      const name = this.nameInput.value.trim();
      if (!name) return;
      this.close();
      await this.onSubmit(name, this.flow);
    };
    this.nameInput.oninput = () => {
      this.submitBtn.disabled = !this.nameInput.value.trim();
    };
    setTimeout(() => this.nameInput.focus(), 0);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var RenameCategoryModal = class extends import_obsidian19.Modal {
  constructor(app, cat, onSubmit) {
    super(app);
    this.cat = cat;
    this.onSubmit = onSubmit;
  }
  input;
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian19.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: t("settings.category.renameTitle") });
    this.input = contentEl.createEl("input", { type: "text", cls: "accounting-ledger-input" });
    this.input.value = this.cat.name;
    const actions = contentEl.createDiv("accounting-modal-actions");
    const cancelBtn = actions.createEl("button", { text: t("common.cancel"), cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
    const submitBtn = actions.createEl("button", { text: t("common.save"), cls: "accounting-btn-primary" });
    submitBtn.onclick = async () => {
      const name = this.input.value.trim();
      if (!name || name === this.cat.name) {
        this.close();
        return;
      }
      this.close();
      await this.onSubmit(name);
    };
    setTimeout(() => {
      this.input.focus();
      this.input.select();
    }, 0);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var MergeCategoryModal = class extends import_obsidian19.Modal {
  constructor(app, from, targets, refCount, onSubmit) {
    super(app);
    this.from = from;
    this.targets = targets;
    this.refCount = refCount;
    this.onSubmit = onSubmit;
  }
  targetSelect;
  errorEl;
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian19.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: t("settings.category.mergeTitle") });
    contentEl.createEl("div", {
      text: t("settings.category.mergeIntro", { name: this.from.name }),
      cls: "accounting-ledger-folder"
    });
    this.targetSelect = contentEl.createEl("select", { cls: "accounting-ledger-input" });
    this.targetSelect.createEl("option", { value: "", text: t("settings.category.mergeTargetPlaceholder") });
    for (const tg of this.targets) {
      this.targetSelect.createEl("option", {
        value: tg.id,
        text: tg.active === false ? t("settings.category.mergeTargetHidden", { name: tg.name }) : tg.name
      });
    }
    this.errorEl = contentEl.createEl("div", { cls: "accounting-ledger-error" });
    const actions = contentEl.createDiv("accounting-modal-actions");
    const cancelBtn = actions.createEl("button", { text: t("common.cancel"), cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
    const submitBtn = actions.createEl("button", { text: t("settings.category.mergeSubmitBtn"), cls: "accounting-btn-primary" });
    submitBtn.onclick = async () => {
      const toId = this.targetSelect.value;
      if (!toId) {
        this.errorEl.setText(t("settings.category.mergeErrNoTarget"));
        return;
      }
      const target = this.targets.find((tg) => tg.id === toId);
      const note = this.refCount > 0 ? t("settings.category.mergeConfirmUsed", { n: this.refCount, target: target?.name ?? "", from: this.from.name }) : t("settings.category.mergeConfirmEmpty", { from: this.from.name });
      if (!confirm(note)) return;
      this.close();
      await this.onSubmit(toId);
    };
    setTimeout(() => this.targetSelect.focus(), 0);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var RegroupTypeModal = class extends import_obsidian19.Modal {
  constructor(app, typeLabel, currentGroupId, groups, onSubmit) {
    super(app);
    this.typeLabel = typeLabel;
    this.currentGroupId = currentGroupId;
    this.groups = groups;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian19.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: t("settings.accountType.regroupTitle") });
    contentEl.createEl("div", { text: t("settings.accountType.regroupIntro", { label: this.typeLabel }), cls: "accounting-ledger-folder" });
    const list = contentEl.createDiv("accounting-backup-list");
    for (const g of this.groups) {
      const isCurrent = g.id === this.currentGroupId;
      const item = list.createDiv("accounting-backup-item");
      item.createEl("div", { text: g.label || g.id, cls: "accounting-backup-name" });
      if (isCurrent) {
        item.createEl("span", { text: t("entry.switchLedgerCurrent"), cls: "accounting-ledger-badge accounting-ledger-badge-muted" });
      } else {
        item.createEl("span", { text: "\u203A", cls: "accounting-ledger-chevron" });
        item.classList.add("accounting-ledger-pickable");
        item.onclick = async () => {
          this.close();
          await this.onSubmit(g.id);
        };
      }
    }
    const closeWrap = contentEl.createDiv("accounting-modal-close");
    const closeBtn = closeWrap.createEl("button", { text: t("common.close"), cls: "accounting-btn-secondary" });
    closeBtn.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};
var CreateAccountTypeModal = class extends import_obsidian19.Modal {
  constructor(app, groups, onSubmit) {
    super(app);
    this.groups = groups;
    this.onSubmit = onSubmit;
  }
  labelInput;
  kindSelect;
  groupSelect;
  submitBtn;
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian19.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: t("settings.accountTypes.createTitle") });
    this.labelInput = contentEl.createEl("input", { type: "text", cls: "accounting-ledger-input" });
    this.labelInput.placeholder = t("settings.accountTypes.newPlaceholder");
    this.kindSelect = contentEl.createEl("select", { cls: "accounting-ledger-input" });
    this.kindSelect.createEl("option", { text: t("accountKind.asset"), value: "asset" });
    this.kindSelect.createEl("option", { text: t("accountKind.liability"), value: "liability" });
    this.groupSelect = contentEl.createEl("select", { cls: "accounting-ledger-input" });
    for (const g of this.groups) this.groupSelect.createEl("option", { text: g.label || g.id, value: g.id });
    if (this.groups[0]) this.groupSelect.value = this.groups[0].id;
    const actions = contentEl.createDiv("accounting-modal-actions");
    const cancelBtn = actions.createEl("button", { text: t("common.cancel"), cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
    this.submitBtn = actions.createEl("button", { text: t("ledger.create.submitBtn"), cls: "accounting-btn-primary" });
    this.submitBtn.disabled = true;
    this.submitBtn.onclick = async () => {
      const label = this.labelInput.value.trim();
      if (!label) return;
      this.close();
      await this.onSubmit(label, this.kindSelect.value, this.groupSelect.value);
    };
    this.labelInput.oninput = () => {
      this.submitBtn.disabled = !this.labelInput.value.trim();
    };
    setTimeout(() => this.labelInput.focus(), 0);
  }
  onClose() {
    this.contentEl.empty();
  }
};
var CreateAccountTypeGroupModal = class extends import_obsidian19.Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
  }
  nameInput;
  submitBtn;
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian19.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: t("settings.accountType.createTitle") });
    this.nameInput = contentEl.createEl("input", { type: "text", cls: "accounting-ledger-input" });
    this.nameInput.placeholder = t("settings.accountType.newGroupPlaceholder");
    const actions = contentEl.createDiv("accounting-modal-actions");
    const cancelBtn = actions.createEl("button", { text: t("common.cancel"), cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
    this.submitBtn = actions.createEl("button", { text: t("ledger.create.submitBtn"), cls: "accounting-btn-primary" });
    this.submitBtn.disabled = true;
    this.submitBtn.onclick = async () => {
      const label = this.nameInput.value.trim();
      if (!label) return;
      this.close();
      await this.onSubmit(label);
    };
    this.nameInput.oninput = () => {
      this.submitBtn.disabled = !this.nameInput.value.trim();
    };
    setTimeout(() => this.nameInput.focus(), 0);
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/onboardingModal.ts
var import_obsidian20 = require("obsidian");
var OnboardingModal = class extends import_obsidian20.Modal {
  constructor(app, adapter, onComplete) {
    super(app);
    this.adapter = adapter;
    this.onComplete = onComplete;
  }
  currentStep = "main";
  /** 用户在关闭前的选择；null 表示未做选择（直接关闭→跳过）。onClose 据此单点回调，避免重复触发。 */
  result = null;
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-sub-modal");
    this.modalEl.addClass("accounting-onboarding");
    contentEl.addClass("accounting-modal");
    if (!import_obsidian20.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    this.renderMainStep();
  }
  /** 渲染主步骤：根据是否有现有账本显示不同界面 */
  async renderMainStep() {
    const { contentEl } = this;
    contentEl.empty();
    this.currentStep = "main";
    const existing = await this.adapter.listLedgers();
    if (existing.length === 0) {
      this.renderEmptyState();
    } else {
      await this.renderLedgerSelection(existing);
    }
  }
  /** 无账本时：提供示例账本创建和手动创建两个选项 */
  renderEmptyState() {
    const { contentEl } = this;
    contentEl.empty();
    this.currentStep = "main";
    const titleEl = contentEl.createEl("h2", { text: t("onboarding.welcome") });
    titleEl.addClass("accounting-modal-title");
    contentEl.createEl("p", {
      text: t("onboarding.emptyDesc"),
      cls: "accounting-onboarding-desc"
    });
    const sampleBtn = contentEl.createEl("button", {
      text: t("onboarding.createSample"),
      cls: "accounting-btn accounting-btn-primary accounting-btn-block"
    });
    sampleBtn.onclick = async () => {
      try {
        const folder = await this.adapter.createSampleLedger(SAMPLE_LEDGER_NAME, t("seed.sampleAlias"));
        this.result = { action: "selected", ledger: folder };
        this.close();
      } catch (e) {
        new import_obsidian20.Notice(t("onboarding.createSampleFailed", { msg: formatError(e) }));
      }
    };
    contentEl.createEl("p", { text: t("onboarding.or"), cls: "accounting-onboarding-sep" });
    const createBtn = contentEl.createEl("button", {
      text: t("onboarding.createNew"),
      cls: "accounting-btn accounting-btn-secondary accounting-btn-block"
    });
    createBtn.onclick = () => this.renderCreateForm();
  }
  /** 渲染现有账本选择列表 */
  async renderLedgerSelection(existing) {
    const { contentEl } = this;
    contentEl.empty();
    this.currentStep = "main";
    const titleEl = contentEl.createEl("h2", { text: t("onboarding.selectLedger") });
    titleEl.addClass("accounting-modal-title");
    const listEl = contentEl.createDiv("accounting-onboarding-folder-list");
    for (const folder of existing.sort()) {
      const label = await this.adapter.readLedgerAlias(folder);
      const itemEl = listEl.createEl("button", {
        text: label,
        cls: "accounting-btn accounting-btn-secondary accounting-btn-block"
      });
      itemEl.onclick = () => {
        this.result = { action: "selected", ledger: folder };
        this.close();
      };
    }
    const createBtn = contentEl.createEl("button", {
      text: "+ " + t("onboarding.createNew"),
      cls: "accounting-btn accounting-btn-primary accounting-btn-block"
    });
    createBtn.onclick = () => this.renderCreateForm();
  }
  /** 渲染创建新账本表单：复用 renderCreateLedgerForm（与设置页一致：名称 + 别名 + 即时校验） */
  async renderCreateForm() {
    this.currentStep = "create";
    const existing = await this.adapter.listLedgers();
    renderCreateLedgerForm(
      this.contentEl,
      existing,
      {
        onSubmit: async (name, alias) => {
          try {
            const folder = await this.adapter.createLedger(name, alias || void 0);
            new import_obsidian20.Notice(t("onboarding.createdNotif", { name: alias || ObsidianDataAdapter.formatLedgerName(folder) }));
            this.result = { action: "created", ledger: folder };
            this.close();
            return true;
          } catch (e) {
            new import_obsidian20.Notice(t("onboarding.createFailed", { msg: formatError(e) }));
            return false;
          }
        },
        onCancel: () => void this.renderMainStep()
      },
      { title: t("onboarding.createNew"), cancelText: t("onboarding.back"), submitText: t("onboarding.createSubmit") }
    );
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    this.onComplete(this.result ?? { action: "skipped" });
  }
};

// src/main.ts
var DEFAULT_SETTINGS = { dataSubdir: ".data", autoOpenOnStartup: true, onboardingCompleted: false, locale: defaultLocale };
var DEFAULT_LEDGER_NAME = ".myledger";
var AccountingPlugin = class extends import_obsidian21.Plugin {
  settingsTab;
  /** 引导期间的背景设置页（应用主界面）；引导完成后按需刷新/关闭，避免双 Modal 堆叠。 */
  onboardingBackdrop = null;
  /** 账本密码门禁：会话级已解锁账本（仅内存，切离即失效、不落盘不同步）。null=未解锁设密账本。 */
  unlockedLedger = null;
  /** 解锁失败退避计数（仅内存，会话内累计）。 */
  unlockFailures = 0;
  async onload() {
    await this.loadSettings();
    initLogger(this.app.vault);
    this.addCommand({ id: "open-diaglog", name: t("cmd.diaglog"), callback: () => new DiagLogModal(this.app).open() });
    this.addCommand({
      id: "open",
      name: t("cmd.open"),
      callback: () => this.openEntryFresh()
    });
    this.addRibbonIcon("coins", t("cmd.open"), () => this.openEntryFresh());
    this.app.workspace.onLayoutReady(() => {
      void (async () => {
        try {
          await this.autoMigrateLedgerDirs();
        } catch (error) {
          pluginLogger.error("migrate", "\u81EA\u52A8\u8FC1\u79FB\u8D26\u672C\u5931\u8D25", { err: String(error) });
        }
        try {
          await this.selfHealActiveLedger();
        } catch (error) {
          pluginLogger.error("selfheal", "\u81EA\u6108\u5F53\u524D\u8D26\u672C\u5931\u8D25", { err: String(error) });
        }
        if (!this.settings.onboardingCompleted) {
          this.showOnboardingModal();
        } else if (this.settings.autoOpenOnStartup) {
          void this.openEntryFresh();
        }
      })();
    });
  }
  adapter() {
    return new ObsidianDataAdapter(this.app.vault, this.settings.dataSubdir, this);
  }
  /** 检测 vault 中是否已存在账本（任意子目录包含 transactions.jsonl） */
  async hasExistingLedger() {
    const adapter = this.adapter();
    const ledgers = await adapter.listLedgers();
    return ledgers.length > 0;
  }
  /** 显示首次启动引导：先打开设置页（应用主界面）作背景，再在其上弹出引导 Modal——
   *  避免引导孤立悬空在 Obsidian 笔记视图之上。命令/ribbon 已在 onload 注册，此处不 await。 */
  showOnboardingModal() {
    const adapter = this.adapter();
    this.onboardingBackdrop = this.openSettings();
    try {
      new OnboardingModal(this.app, adapter, (result) => {
        void this.handleOnboardingResult(result);
      }).open();
    } catch (error) {
      pluginLogger.error("onboarding", "\u663E\u793A\u5F15\u5BFC Modal \u5931\u8D25", { err: String(error) });
    }
  }
  /** 引导完成：落盘标记与所选账本，并重建 settingsTab。
   *  账本变更时刷新背景设置页（新页叠在上层、旧背景页在下层 detach，无闪屏）；未变更（跳过）则沿用背景设置页。 */
  async handleOnboardingResult(result) {
    let ledgerChanged = false;
    try {
      if (result.action === "skipped") {
        const adapter = this.adapter();
        try {
          await adapter.createLedger(DEFAULT_LEDGER_NAME, t("ledger.defaultAlias"));
        } catch {
        }
        result = { action: "created", ledger: DEFAULT_LEDGER_NAME };
      }
      this.settings.onboardingCompleted = true;
      if (result.ledger && result.ledger !== this.settings.dataSubdir) {
        this.settings.dataSubdir = result.ledger;
        ledgerChanged = true;
      }
      await this.saveSettings();
      if (ledgerChanged) {
        const adapter = new ObsidianDataAdapter(this.app.vault, this.settings.dataSubdir, this);
        this.settingsTab = new AccountingSettings(this.app, this, adapter);
      }
    } catch (error) {
      pluginLogger.error("onboarding", "\u5F15\u5BFC\u5B8C\u6210\u5904\u7406\u5931\u8D25", { err: String(error) });
    }
    if (ledgerChanged) {
      this.openSettings();
      this.onboardingBackdrop?.close();
    }
    this.onboardingBackdrop = null;
  }
  /** 自动迁移非隐藏目录账本到隐藏目录（幂等、静默；仅迁移成功时给 Notice）。
   *  新建账本已强制带 `.` 前缀，这里只处理历史目录；当前账本被迁移则同步 dataSubdir。 */
  async autoMigrateLedgerDirs() {
    try {
      const adapter = this.adapter();
      const { migrated, failed } = await adapter.migrateLedgerDirs();
      if (migrated.length === 0 && failed.length === 0) return;
      const cur = this.settings.dataSubdir;
      if (cur && !cur.startsWith(".") && migrated.includes(`.${cur}`)) {
        this.settings.dataSubdir = `.${cur}`;
        await this.saveSettings();
      }
      if (migrated.length > 0) {
        new import_obsidian21.Notice(t("notice.migratedN", { n: migrated.length }));
      }
      if (failed.length > 0) {
        new import_obsidian21.Notice(t("notice.migrateFailed", { n: failed.length, list: failed.join(", ") }));
      }
    } catch (error) {
      console.error("\u81EA\u52A8\u8FC1\u79FB\u8D26\u672C\u5931\u8D25:", error);
    }
  }
  /** 自愈当前账本：若 dataSubdir 不在可用账本列表中（目录丢失 / transactions.jsonl 缺失 / 桌面端改名 / iCloud 未同步），
   *  且存在其它可用账本，则切到第一个并落盘，避免「有可用账本却没选中」的悬空状态。
   *  全量纠正并给 Notice 透明告知；正常状态下零影响。 */
  async selfHealActiveLedger() {
    const adapter = this.adapter();
    const ledgers = await adapter.listLedgers();
    if (ledgers.length === 0) return;
    const cur = this.settings.dataSubdir;
    if (cur && ledgers.includes(cur)) return;
    const target = ledgers[0];
    const alias = await adapter.readLedgerAlias(target);
    this.settings.dataSubdir = target;
    await this.saveSettings();
    this.settingsTab = new AccountingSettings(this.app, this, new ObsidianDataAdapter(this.app.vault, this.settings.dataSubdir, this));
    new import_obsidian21.Notice(t("notice.selfHealed", { alias }));
  }
  /** 导航上下文：三个目标的打开回调，注入到各 Modal 使其底部导航条可用。public 供设置页「查看」跳转复用。 */
  navCtx(adapter) {
    return {
      openList: (accountId, slide, drillDown, drill, onDataChanged, onOpened) => openList(this.app, adapter, this.navCtx(adapter), accountId, slide, void 0, drillDown, drill, onDataChanged, this.switchLedgerAndReopenList, onOpened),
      openEntry: (slide, onOpened) => {
        void openEntry(this.app, adapter, void 0, this.navCtx(adapter), slide, this.switchLedgerAndReopen, () => this.settingsTab.showRecurring(), onOpened);
      },
      openBalance: (slide, onOpened) => openBalance(this.app, adapter, this.navCtx(adapter), slide, this.switchLedgerAndReopenBalance, onOpened),
      openReport: (slide, onOpened) => openReport(this.app, adapter, this.navCtx(adapter), slide, this.switchLedgerAndReopenReport, onOpened),
      openSettings: (slide, onOpened) => openSettings(this.app, this.settingsTab, this.navCtx(adapter), slide, this.switchLedgerAndReopenSettings, onOpened)
    };
  }
  /** 从外部入口（命令/ribbon/启动/引导完成）打开记账界面：清会话级解锁态后走门禁，
   *  确保关闭记账界面再进设密账本会重新弹密码（design 选 A：记账界面退出即算离开，回账本必重输）。 */
  async openEntryFresh(onOpened) {
    this.unlockedLedger = null;
    await this.openEntry(onOpened);
  }
  async openEntry(onOpened) {
    if (!await this.ensureCurrentUnlocked()) return;
    const adapter = this.adapter();
    await openEntry(this.app, adapter, void 0, this.navCtx(adapter), void 0, this.switchLedgerAndReopen, () => this.settingsTab.showRecurring(), onOpened);
    void this.tryAutoRefreshRates(adapter);
    await this.runStartupBackfill(adapter);
    void this.tryAutoBackup(adapter);
  }
  /** 机会式自动备份：读配置 → 超间隔则 backup('auto') → 按 keep 清理最旧 auto。
   *  空账本 / 关闭 / 未到间隔均跳过；失败静默（仅诊断日志）。 */
  async tryAutoBackup(adapter) {
    try {
      const config = await adapter.readBackupConfig();
      if (!config.backupEnabled) return;
      const events = await adapter.loadLog();
      if (events.length === 0) return;
      let backups = await adapter.listBackups();
      const lastBackupMs = backups.reduce((m, b) => Math.max(m, b.mtime), 0);
      if (shouldAutoBackup({ lastBackupMs, nowMs: Date.now(), config })) {
        await adapter.backup("auto");
        backups = await adapter.listBackups();
      }
      const toPrune = selectAutoBackupsToPrune(backups, config.backupKeep);
      for (const p of toPrune) {
        await adapter.deleteBackup(p.name);
      }
    } catch (e) {
      pluginLogger.warn("backup", "\u81EA\u52A8\u5907\u4EFD\u5931\u8D25", { err: String(e) });
    }
  }
  /** 自动刷新汇率：若 autoRefresh 开启且当天未成功刷新，则后台刷新（静默，失败不提示） */
  async tryAutoRefreshRates(adapter) {
    try {
      const cfg = await adapter.readRateConfig();
      if (!cfg.autoRefresh) return;
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      if (cfg.lastSuccess?.slice(0, 10) === today) return;
      const baseCurrency = await adapter.readBaseCurrency();
      const url = `https://api.frankfurter.app/latest?from=${baseCurrency.toUpperCase()}`;
      const resp = await (0, import_obsidian22.requestUrl)({ url, method: "GET" });
      const fetched = parseRateResponse(resp.json, baseCurrency, nowISO());
      if (!fetched) return;
      const rates = await adapter.readRates();
      const { merged, updated } = mergeRatesByVisible(rates, fetched, Object.keys(rates));
      if (updated === 0) return;
      await adapter.writeRates(merged);
      await adapter.writeRateConfig({ ...cfg, lastSuccess: nowISO() });
      pluginLogger.info("rates", `\u81EA\u52A8\u5237\u65B0\u6C47\u7387\uFF1A\u5DF2\u66F4\u65B0 ${updated} \u4E2A\u5E01\u79CD`);
    } catch (e) {
      pluginLogger.warn("rates", "\u81EA\u52A8\u5237\u65B0\u6C47\u7387\u5931\u8D25", { err: String(e) });
    }
  }
  /** 启动回填：扫描周期账规则并自动生成到期交易（仅运行一次） */
  async runStartupBackfill(adapter) {
    try {
      const [rules, events] = await Promise.all([adapter.readRecurringRules(), adapter.loadLog()]);
      const existingIds = new Set(events.filter((e) => e.op === "upsert").map((e) => e.id));
      const generated = generateDueRecurringEvents(rules, existingIds, /* @__PURE__ */ new Date());
      if (generated.length > 0) {
        await adapter.appendEvents(generated);
        pluginLogger.info("backfill", `\u542F\u52A8\u56DE\u586B\uFF1A\u81EA\u52A8\u751F\u6210 ${generated.length} \u7B14\u5468\u671F\u8D26\u4EA4\u6613`);
      }
    } catch (error) {
      pluginLogger.error("backfill", "\u542F\u52A8\u56DE\u586B\u5468\u671F\u8D26\u5931\u8D25", { err: String(error) });
    }
  }
  /** 切换账本（实际执行）：更新当前 dataSubdir 并落盘、清解锁态（切离即失效，design D6 选 A）。
   *  目标页的重开由各调用方用新 adapter 完成（重建 navCtx），与记账页切换同一根基。 */
  doSwitchLedger(newSubdir) {
    this.settings.dataSubdir = newSubdir;
    this.unlockedLedger = newSubdir;
    void this.saveSettings();
  }
  /** 解锁弹窗（含失败退避）。成功返回 true；取消返回 false。
   *  fromEntry=true 表示从入口（openEntry/启动）进入、无已加载业务页 → 取消时打开账本选择 Modal 让用户换账本（对齐桌面 cancelUnlock）；
   *  fromEntry=false 表示切换途中、底层已有业务页 → 取消时停留原账本。 */
  async promptUnlock(alias, passwordHash, fromEntry = false) {
    if (this.unlockFailures > 0) {
      const delay = Math.min(this.unlockFailures, 5) * 1e3;
      await new Promise((r) => setTimeout(r, delay));
    }
    const result = await new Promise((resolve) => {
      new LedgerPasswordModal(
        this.app,
        { mode: "unlock", alias },
        async (values) => {
          const ok2 = await verifyLedgerPassword(values.new, passwordHash);
          if (!ok2) {
            this.unlockFailures += 1;
            return t("settings.password.wrong");
          }
          this.unlockFailures = 0;
          resolve({ password: values.new });
          return null;
        },
        () => resolve(null)
      ).open();
    });
    if (result === null && fromEntry) {
      this.openLedgerPickerAfterUnlockCancel();
    }
    return result !== null;
  }
  /** 解锁取消后（入口场景）打开账本选择 Modal：选定账本后走 gateAndSwitch（设密则再弹密码），不切换则停留。
   *  复用 LedgerSwitchModal（与顶部账本胶囊同一选择浮层）。 */
  openLedgerPickerAfterUnlockCancel() {
    const adapter = this.adapter();
    void (async () => {
      try {
        const names = await adapter.listLedgers();
        if (names.length === 0) return;
        const ledgers = await Promise.all(
          names.map(async (name) => ({ name, alias: await adapter.readLedgerAlias(name) }))
        );
        new LedgerSwitchModal(this.app, adapter.activeLedger, ledgers, (name) => {
          void this.gateAndSwitch(name).then((ok2) => {
            if (ok2) void this.openEntry();
          });
        }).open();
      } catch {
      }
    })();
  }
  /** 当前账本若设密且本会话未解锁 → 弹解锁框；返回是否可继续访问。
   *  由入口 openEntry/启动调用，取消时打开账本选择（对齐桌面 cancelUnlock）。 */
  async ensureCurrentUnlocked() {
    const cur = this.settings.dataSubdir;
    if (this.unlockedLedger === cur) return true;
    const adapter = this.adapter();
    const meta = await adapter.readLedgerPasswordMeta();
    if (!meta) {
      this.unlockedLedger = cur;
      return true;
    }
    const alias = await adapter.readLedgerAlias(cur);
    const ok2 = await this.promptUnlock(alias, meta.passwordHash, true);
    if (ok2) this.unlockedLedger = cur;
    return ok2;
  }
  /** 门禁判定：目标设密且本会话未解锁 → 弹解锁框；返回是否可继续切换。 */
  async gateAndSwitch(newSubdir) {
    if (newSubdir === this.settings.dataSubdir) return true;
    const adapter = this.adapter();
    const meta = await adapter.readLedgerPasswordMetaAt(newSubdir);
    if (!meta) {
      this.doSwitchLedger(newSubdir);
      return true;
    }
    if (this.unlockedLedger === newSubdir) return true;
    const alias = await adapter.readLedgerAlias(newSubdir);
    const ok2 = await this.promptUnlock(alias, meta.passwordHash);
    if (!ok2) return false;
    this.doSwitchLedger(newSubdir);
    return true;
  }
  /** 记一笔顶部切换账本：用新 dataSubdir 重开记一笔（新 adapter、新 navCtx）。onOpened 由胶囊路径传入：
   *  关旧页推迟到新页 onOpen（openEntry 异步 await readMeta），避免底层闪现（与导航条切换同模式）。 */
  switchLedgerAndReopen = async (newSubdir, onOpened) => {
    if (!await this.gateAndSwitch(newSubdir)) return;
    void this.openEntry(onOpened);
  };
  /** 流水页顶部切换账本：用新 dataSubdir 重开流水页（新 adapter、新 navCtx）。onOpened 由胶囊路径传入：
   *  关旧页推迟到新页 onOpen（与导航条切换同模式），避免底层闪现。 */
  switchLedgerAndReopenList = async (newSubdir, onOpened) => {
    if (!await this.gateAndSwitch(newSubdir)) return;
    const adapter = this.adapter();
    openList(this.app, adapter, this.navCtx(adapter), void 0, void 0, void 0, void 0, void 0, void 0, this.switchLedgerAndReopenList, onOpened);
  };
  /** 余额页顶部切换账本：用新 dataSubdir 重开余额页（新 adapter、新 navCtx）。onOpened 由胶囊路径传入：
   *  关旧页推迟到新页 onOpen（与导航条切换同模式），避免底层闪现。 */
  switchLedgerAndReopenBalance = async (newSubdir, onOpened) => {
    if (!await this.gateAndSwitch(newSubdir)) return;
    const adapter = this.adapter();
    openBalance(this.app, adapter, this.navCtx(adapter), void 0, this.switchLedgerAndReopenBalance, onOpened);
  };
  /** 统计页顶部切换账本：用新 dataSubdir 重开统计页（新 adapter、新 navCtx）。onOpened 由胶囊路径传入：
   *  关旧页推迟到新页 onOpen（与导航条切换同模式），避免底层闪现。 */
  switchLedgerAndReopenReport = async (newSubdir, onOpened) => {
    if (!await this.gateAndSwitch(newSubdir)) return;
    const adapter = this.adapter();
    openReport(this.app, adapter, this.navCtx(adapter), void 0, this.switchLedgerAndReopenReport, onOpened);
  };
  /** 设置页切换账本：用新 dataSubdir 重开设置页（新 adapter、新 navCtx），整个记账界面上下文立即刷新到新账本。
   *  关旧设置页推迟到新设置页 onOpen（onOpened 由胶囊路径传入），避免底层闪现。 */
  switchLedgerAndReopenSettings = async (newSubdir, onOpened) => {
    if (!await this.gateAndSwitch(newSubdir)) return;
    this.openSettings(onOpened);
  };
  /** 打开设置页（全屏 Modal）：每次用最新 dataSubdir 重建 adapter，导航条与切换账本回调均绑定到该新 adapter。
   *  返回实例，供引导背景页按需 close。 */
  openSettings(onOpened) {
    const adapter = this.adapter();
    return openSettings(this.app, this.settingsTab, this.navCtx(adapter), void 0, this.switchLedgerAndReopenSettings, onOpened);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.settings.locale = resolveLocale(this.settings.locale);
    setLocale(this.settings.locale);
    const adapter = new ObsidianDataAdapter(this.app.vault, this.settings.dataSubdir, this);
    this.settingsTab = new AccountingSettings(this.app, this, adapter);
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
