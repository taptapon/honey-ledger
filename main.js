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
var import_obsidian18 = require("obsidian");
var import_obsidian19 = require("obsidian");

// src/dataAdapter.ts
var import_obsidian = require("obsidian");

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
var DEFAULT_TYPE_LABEL = {
  cash: "\u73B0\u91D1",
  savings: "\u50A8\u84C4",
  ewallet: "\u7535\u5B50\u94B1\u5305",
  securities: "\u8BC1\u5238",
  fund: "\u57FA\u91D1",
  "other-investment": "\u5176\u4ED6\u6295\u8D44",
  "fixed-asset": "\u56FA\u5B9A\u8D44\u4EA7",
  company: "\u516C\u53F8",
  person: "\u5F80\u6765(\u501F\u8D37)",
  credit: "\u4FE1\u7528\u5361",
  loan: "\u8D37\u6B3E"
};
var DEFAULT_GROUP_OF_TYPE = {
  cash: "g-cash",
  savings: "g-cash",
  ewallet: "g-cash",
  securities: "g-investment",
  fund: "g-investment",
  "other-investment": "g-investment",
  "fixed-asset": "g-fixed-asset",
  company: "g-company",
  person: "g-credit",
  credit: "g-credit",
  loan: "g-credit"
};
var DEFAULT_GROUPS = [
  { id: "g-cash", label: "\u73B0\u91D1\u7C7B" },
  { id: "g-investment", label: "\u6295\u8D44\u7C7B" },
  { id: "g-fixed-asset", label: "\u56FA\u5B9A\u8D44\u4EA7" },
  { id: "g-company", label: "\u516C\u53F8" },
  { id: "g-credit", label: "\u4FE1\u8D37" }
];
var SYSTEM_SET = new Set(SYSTEM_ACCOUNT_TYPES);
function isSystemAccountType(t) {
  return typeof t === "string" && SYSTEM_SET.has(t);
}
function defaultAccountTypeSettings() {
  return {
    groups: DEFAULT_GROUPS.map((g) => ({ ...g })),
    types: SYSTEM_ACCOUNT_TYPES.map((t) => ({
      type: t,
      label: DEFAULT_TYPE_LABEL[t],
      groupId: DEFAULT_GROUP_OF_TYPE[t],
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
  const seen = /* @__PURE__ */ new Set();
  for (const t of raw.types) {
    if (!t || !isSystemAccountType(t.type) || seen.has(t.type)) continue;
    seen.add(t.type);
    const defT = defByType.get(t.type);
    const label = typeof t.label === "string" && t.label.trim() ? t.label : defT.label;
    const groupId = typeof t.groupId === "string" && groupIdSet.has(t.groupId) ? t.groupId : fallbackGroupId;
    types.push({ type: t.type, label, groupId, active: t.active !== false });
  }
  for (const d of def.types) {
    if (seen.has(d.type)) continue;
    const groupId = groupIdSet.has(d.groupId) ? d.groupId : fallbackGroupId;
    types.push({ type: d.type, label: d.label, groupId, active: true });
  }
  return { groups, types };
}
function resolveTypeGroups(settings) {
  const byGroup = /* @__PURE__ */ new Map();
  for (const t of settings.types) {
    const arr = byGroup.get(t.groupId);
    if (arr) arr.push(t);
    else byGroup.set(t.groupId, [t]);
  }
  return settings.groups.map((g) => ({ id: g.id, label: g.label, types: byGroup.get(g.id) ?? [] })).filter((g) => g.types.length > 0);
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
function formatLocalTimestamp(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
function nowDatetimeLocal() {
  return isoToDatetimeLocal(nowISO());
}

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
      const t = this.peek();
      if (t?.t === "op" && (t.v === "+" || t.v === "-")) {
        this.advance();
        const right = this.term();
        if (right.ok === false) return right;
        val = t.v === "+" ? val + right.value : val - right.value;
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
      const t = this.peek();
      if (t?.t === "op" && (t.v === "*" || t.v === "/")) {
        this.advance();
        const right = this.factor();
        if (right.ok === false) return right;
        if (t.v === "*") {
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
    const t = this.peek();
    if (!t) return fail("\u8868\u8FBE\u5F0F\u4E0D\u5B8C\u6574");
    if (t.t === "op" && (t.v === "+" || t.v === "-")) {
      this.advance();
      const f = this.factor();
      if (f.ok === false) return f;
      return this.applyPercent(t.v === "-" ? -f.value : f.value);
    }
    let value;
    if (t.t === "lp") {
      this.advance();
      const e = this.expr();
      if (e.ok === false) return e;
      const rp = this.peek();
      if (rp?.t !== "rp") return fail("\u62EC\u53F7\u672A\u95ED\u5408");
      this.advance();
      value = e.value;
    } else if (t.t === "num") {
      this.advance();
      value = t.v;
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
function txBaseAmount(t, base) {
  return convertToBase(t.amount, t.currency, base, t.rate ?? 1);
}
function convertBalancesToBase(balances, accounts, rates, base) {
  const out = /* @__PURE__ */ new Map();
  for (const a of accounts) {
    const bal = balances.get(a.id) ?? 0;
    const rate = rates[a.currency]?.rate ?? 1;
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
  const t = {};
  for (const r of rows) {
    const c = r.currency.trim().toUpperCase();
    if (!c || c === base) continue;
    const v = evaluateAmount(r.rate);
    if (!v.ok || v.value <= 0) continue;
    t[c] = { rate: round2(v.value), asOf: r.asOf.trim() };
  }
  return t;
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
  const money = toks.find((t) => t.type === "money");
  if (money) return money.value;
  if (toks.length > 0) return toks[toks.length - 1].value;
  return null;
}

// ../../packages/core/src/tags.ts
function parseTagsInput(raw) {
  const trimmed = raw?.trim();
  if (!trimmed) return void 0;
  return trimmed.split(/\s+/);
}

// ../../packages/core/src/fold.ts
function foldEvents(events) {
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
        console.warn("[foldEvents] \u8DF3\u8FC7\u9057\u7559\u7684 adjust \u4E8B\u4EF6\uFF1B\u8BE5\u7C7B\u578B\u5DF2\u88AB\u79FB\u9664\uFF0C\u8BF7\u901A\u8FC7\u300C\u4FEE\u6539\u4F59\u989D\u300D\u91CD\u65B0\u767B\u8BB0\u3002");
        warnedLegacyAdjust = true;
      }
      continue;
    }
    entries.push([tsKey(ev.ts), toTransaction(ev)]);
  }
  entries.sort((a, b) => b[0] - a[0]);
  return entries.map(([, t]) => t);
}
function tsKey(ts) {
  const t = Date.parse(ts);
  return Number.isNaN(t) ? 0 : t;
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

// ../../packages/core/src/listSort.ts
function sortTransactions(transactions, sort) {
  const indexed = transactions.map((t, i) => [t, i]);
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
  return indexed.map(([t]) => t);
}

// ../../packages/core/src/listFilter.ts
function filterAndSortTransactions(transactions, filters) {
  const query = filters.query.trim().toLowerCase();
  const list = transactions.filter((t) => {
    if (filters.types.length > 0 && !filters.types.includes(t.type)) return false;
    if (filters.account && ![t.account, t.fromAccount, t.toAccount, t.person].includes(filters.account)) return false;
    if (filters.uncategorized) {
      if (t.category) return false;
    } else if (filters.category && t.category !== filters.category) return false;
    if (filters.recurringRuleId && t.recurringRuleId !== filters.recurringRuleId) return false;
    if (filters.minAmount != null && t.amount < filters.minAmount) return false;
    if (filters.maxAmount != null && t.amount > filters.maxAmount) return false;
    if (filters.from && isoToDateStr(t.ts) < filters.from) return false;
    if (filters.to && isoToDateStr(t.ts) > filters.to) return false;
    if (query) {
      const hay = [t.note, (t.tags ?? []).join(" "), t.category, t.subcategory].filter(Boolean).join(" ").toLowerCase();
      const queryNum = Number(query);
      const amountMatch = query.trim() !== "" && Number.isFinite(queryNum) && t.amount === queryNum;
      if (!hay.includes(query) && !amountMatch) return false;
    }
    return true;
  });
  return sortTransactions(list, filters.sort);
}

// ../../packages/core/src/balance.ts
function computeBalances(transactions, accounts) {
  const balances = /* @__PURE__ */ new Map();
  for (const a of accounts) balances.set(a.id, round2(a.openingBalance));
  const get = (id) => balances.get(id) ?? 0;
  for (const t of transactions) {
    switch (t.type) {
      case "expense":
        if (t.account) balances.set(t.account, round2(get(t.account) - t.amount));
        break;
      case "income":
        if (t.account) balances.set(t.account, round2(get(t.account) + t.amount));
        break;
      case "transfer":
        if (t.fromAccount) balances.set(t.fromAccount, round2(get(t.fromAccount) - t.amount));
        if (t.toAccount) balances.set(t.toAccount, round2(get(t.toAccount) + (t.toAmount ?? t.amount)));
        break;
      case "loan": {
        const yours = t.account;
        const person = t.person;
        const selfInc = t.direction === "borrow" || t.direction === "collect";
        const amt = t.amount;
        if (yours) balances.set(yours, round2(get(yours) + (selfInc ? amt : -amt)));
        if (person) balances.set(person, round2(get(person) + (selfInc ? -amt : amt)));
        break;
      }
    }
  }
  return balances;
}
function tsMs(ts) {
  const t = Date.parse(ts);
  return Number.isNaN(t) ? 0 : t;
}
function computeBalancesUpTo(transactions, accounts, targetTxId) {
  const chronological = [...transactions].sort((a, b) => tsMs(a.ts) - tsMs(b.ts));
  const idx = chronological.findIndex((t) => t.id === targetTxId);
  if (idx < 0) return null;
  return computeBalances(chronological.slice(0, idx + 1), accounts);
}

// ../../packages/core/src/networth.ts
function computeNetWorth(transactions, accounts, opts) {
  const native = computeBalances(transactions, accounts);
  const balances = opts?.base ? convertBalancesToBase(native, accounts, opts.rates ?? {}, opts.base) : native;
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
    if (kindOfType(a.type) === "liability") {
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

// ../../packages/core/src/reports.ts
function inRange(ts, start, endExclusive) {
  const t = Date.parse(ts);
  if (Number.isNaN(t)) return false;
  if (start) {
    const s = Date.parse(start);
    if (!Number.isNaN(s) && t < s) return false;
  }
  if (endExclusive) {
    const e = Date.parse(endExclusive);
    if (!Number.isNaN(e) && t >= e) return false;
  }
  return true;
}
function periodTotals(transactions, start, endExclusive, opts) {
  const base = opts?.base;
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (!inRange(t.ts, start, endExclusive)) continue;
    const amt = base ? txBaseAmount(t, base) : t.amount;
    if (t.type === "income") income += amt;
    else if (t.type === "expense") expense += amt;
  }
  return { income: round2(income), expense: round2(expense), surplus: round2(income - expense) };
}
function categoryBreakdown(transactions, opts) {
  const { flow, start, end, base } = opts;
  const byCat = /* @__PURE__ */ new Map();
  let total = 0;
  for (const t of transactions) {
    if (t.type !== flow) continue;
    if (!inRange(t.ts, start, end)) continue;
    const cat = t.category ?? "(\u672A\u5206\u7C7B)";
    const amt = base ? txBaseAmount(t, base) : t.amount;
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
  for (const t of transactions) {
    const ym = isoToMonthStr(t.ts);
    const i = index.get(ym);
    if (i === void 0) continue;
    const b = buckets[i];
    if (!b) continue;
    const amt = base ? txBaseAmount(t, base) : t.amount;
    if (t.type === "income") b.income += amt;
    else if (t.type === "expense") b.expense += amt;
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
  for (const t of transactions) {
    const i = index.get(isoToYearNum(t.ts));
    if (i === void 0) continue;
    const b = buckets[i];
    if (!b) continue;
    const amt = base ? txBaseAmount(t, base) : t.amount;
    if (t.type === "income") b.income += amt;
    else if (t.type === "expense") b.expense += amt;
  }
  for (const b of buckets) {
    b.income = round2(b.income);
    b.expense = round2(b.expense);
    b.surplus = round2(b.income - b.expense);
  }
  return buckets;
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
function deriveSettlementDiff(outstanding, paid, direction) {
  if (direction === "collect" && outstanding <= 0) {
    throw new Error("\u6536\u6B3E\u8981\u6C42\u5BF9\u65B9\u6709\u5E94\u6536\u4F59\u989D\uFF08>0\uFF09");
  }
  if (direction === "repay" && outstanding >= 0) {
    throw new Error("\u8FD8\u6B3E\u8981\u6C42\u5BF9\u65B9\u6709\u5E94\u4ED8\u4F59\u989D\uFF08<0\uFF09");
  }
  const owe = Math.abs(outstanding);
  const diff = round2(owe - paid);
  if (diff === 0) return { kind: "exact" };
  if (direction === "collect") {
    return diff > 0 ? { kind: "writeoff", type: "expense", amount: diff, category: SETTLEMENT_CATEGORIES.badDebt } : { kind: "writeoff", type: "income", amount: round2(-diff), category: SETTLEMENT_CATEGORIES.interest };
  }
  return diff > 0 ? { kind: "writeoff", type: "income", amount: diff, category: SETTLEMENT_CATEGORIES.gift } : { kind: "writeoff", type: "expense", amount: round2(-diff), category: SETTLEMENT_CATEGORIES.fee };
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
    tags: collect.tags,
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
      note: `\u7ED3\u6E05\u6838\u9500 \xB7 ${outcome.category}`,
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

// ../../packages/core/src/categoryOps.ts
var ADJUST_CATEGORY = "\u4F59\u989D\u8C03\u6574";
function planRenameCategory(input) {
  const { events, categories, id, newName, now } = input;
  const trimmed = newName.trim();
  const target = categories.find((c) => c.id === id);
  if (!target) throw new Error("\u5206\u7C7B\u4E0D\u5B58\u5728");
  if (trimmed === "") throw new Error("\u5206\u7C7B\u540D\u4E0D\u80FD\u4E3A\u7A7A");
  if (trimmed === target.name) {
    return { events: [], categories: [...categories], rewritten: 0 };
  }
  if (categories.some((c) => c.id !== id && c.flow === target.flow && c.name === trimmed)) {
    throw new Error("\u8BE5\u540D\u79F0\u5DF2\u5B58\u5728\uFF0C\u5982\u9700\u5408\u5E76\u8BF7\u4F7F\u7528\u5408\u5E76\u529F\u80FD");
  }
  const oldName = target.name;
  const folded = foldEvents(events);
  const newEvents = [];
  for (const t of folded) {
    if (t.category !== oldName) continue;
    newEvents.push({ ...t, category: trimmed, op: "upsert", createdAt: now, updatedAt: now, source: "manual" });
  }
  const nextCats = categories.map((c) => c.id === id ? { ...c, name: trimmed } : c);
  return { events: newEvents, categories: nextCats, rewritten: newEvents.length };
}
function planMergeCategory(input) {
  const { events, categories, fromId, toId, now } = input;
  if (fromId === toId) return { events: [], categories: [...categories], rewritten: 0 };
  const from = categories.find((c) => c.id === fromId);
  const to = categories.find((c) => c.id === toId);
  if (!from || !to) throw new Error("\u5206\u7C7B\u4E0D\u5B58\u5728");
  if (from.flow !== to.flow) throw new Error("\u53EA\u80FD\u5408\u5E76\u5230\u76F8\u540C\u6536\u652F\u7C7B\u578B\uFF08\u652F\u51FA/\u6536\u5165\uFF09\u7684\u5206\u7C7B");
  const folded = foldEvents(events);
  const newEvents = [];
  for (const t of folded) {
    if (t.category !== from.name) continue;
    newEvents.push({ ...t, category: to.name, op: "upsert", createdAt: now, updatedAt: now, source: "manual" });
  }
  const nextCats = categories.filter((c) => c.id !== fromId);
  return { events: newEvents, categories: nextCats, rewritten: newEvents.length };
}
function adjustCategoryOptions(categories, flow) {
  const map = /* @__PURE__ */ new Map();
  for (const c of categories) {
    if (c.flow === flow && c.active !== false) map.set(c.name, c);
  }
  if (!map.has(ADJUST_CATEGORY)) {
    map.set(ADJUST_CATEGORY, { id: "", name: ADJUST_CATEGORY, flow });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "zh"));
}
function resolveAdjustCategory(selected, categories, flow) {
  const visible = categories.some((c) => c.flow === flow && c.active !== false && c.name === selected);
  return visible ? selected : ADJUST_CATEGORY;
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
var SAMPLE_LEDGER_ALIAS = "\u793A\u4F8B\u8D26\u672C";
var SAMPLE_ANCHOR = "2026-01-01T00:00:00.000Z";
function seedSampleLedger() {
  const now = SAMPLE_ANCHOR;
  const later = "2026-06-15T12:00:00.000Z";
  const acc = (id, name, type, opening, currency = "CNY") => ({ id, name, type, openingBalance: opening, currency, active: true, createdAt: now, updatedAt: now });
  const cashId = newAccountId();
  const savingsId = newAccountId();
  const ewalletId = newAccountId();
  const creditId = newAccountId();
  const personId = newAccountId();
  const accounts = [
    acc(cashId, "\u73B0\u91D1", "cash", 1e3),
    acc(savingsId, "\u62DB\u884C\u50A8\u84C4", "savings", 5e4),
    acc(ewalletId, "\u5FAE\u4FE1\u96F6\u94B1\u901A", "ewallet", 5e3),
    acc(creditId, "\u62DB\u884C\u4FE1\u7528\u5361", "credit", 0, "CNY"),
    acc(personId, "\u5F20\u4E09\uFF08\u5F80\u6765\uFF09", "person", 0)
  ];
  const cat = (flow, name) => ({ id: newCategoryId(), name, flow });
  const categories = [
    cat("expense", "\u9910\u996E"),
    cat("expense", "\u8D2D\u7269"),
    cat("expense", "\u4EA4\u901A"),
    cat("expense", "\u5C45\u5BB6"),
    cat("expense", "\u5A31\u4E50"),
    cat("expense", "\u533B\u6559"),
    cat("expense", "\u4EBA\u60C5"),
    cat("expense", "\u96F6\u7528"),
    cat("expense", "\u5176\u4ED6"),
    cat("expense", ADJUST_CATEGORY),
    cat("income", "\u5DE5\u8D44\u85AA\u6C34"),
    cat("income", "\u6295\u8D44\u6536\u76CA"),
    cat("income", "\u9000\u6B3E\u8FD4\u6B3E"),
    cat("income", "\u5176\u4ED6"),
    cat("income", ADJUST_CATEGORY)
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
      category: "\u9910\u996E",
      note: "\u83DC\u5E02\u573A\u4E70\u83DC"
    }),
    // 2. 收入：工资存入储蓄
    tx(newTxId(), "income", {
      ts: "2026-01-10T10:00:00.000Z",
      amount: round2(15e3),
      currency: "CNY",
      account: savingsId,
      category: "\u5DE5\u8D44\u85AA\u6C34",
      note: "1\u6708\u5DE5\u8D44"
    }),
    // 3. 转账：储蓄转到微信
    tx(newTxId(), "transfer", {
      ts: "2026-01-15T14:00:00.000Z",
      amount: round2(2e3),
      currency: "CNY",
      fromAccount: savingsId,
      toAccount: ewalletId,
      note: "\u8F6C\u96F6\u94B1\u5907\u7528"
    }),
    // 4. 信用卡消费
    tx(newTxId(), "expense", {
      ts: "2026-02-01T19:00:00.000Z",
      amount: round2(299),
      currency: "CNY",
      account: creditId,
      category: "\u8D2D\u7269",
      note: "\u7F51\u8D2D\u8863\u670D"
    }),
    // 5. 还款：储蓄还信用卡
    tx(newTxId(), "transfer", {
      ts: "2026-02-10T10:00:00.000Z",
      amount: round2(299),
      currency: "CNY",
      fromAccount: savingsId,
      toAccount: creditId,
      note: "\u8FD8\u4FE1\u7528\u5361"
    }),
    // 6. 借贷：借出给张三
    tx(newTxId(), "loan", {
      ts: "2026-03-01T12:00:00.000Z",
      amount: round2(5e3),
      currency: "CNY",
      account: savingsId,
      person: personId,
      direction: "lend",
      note: "\u501F\u7ED9\u5F20\u4E09"
    }),
    // 7. 收入：投资收益
    tx(newTxId(), "income", {
      ts: "2026-04-01T09:00:00.000Z",
      amount: round2(320.5),
      currency: "CNY",
      account: ewalletId,
      category: "\u6295\u8D44\u6536\u76CA",
      note: "\u96F6\u94B1\u901A\u6536\u76CA"
    }),
    // 8. 支出：交通打车
    tx(newTxId(), "expense", {
      ts: "2026-05-10T20:00:00.000Z",
      amount: round2(28),
      currency: "CNY",
      account: cashId,
      category: "\u4EA4\u901A",
      note: "\u6253\u8F66\u56DE\u5BB6"
    })
  ];
  return { accounts, categories, rates, events };
}
function seedDefaults() {
  const now = nowISO();
  const accounts = [
    { id: newAccountId(), name: "\u73B0\u91D1", type: "cash", openingBalance: 0, currency: "CNY", active: true, createdAt: now, updatedAt: now },
    { id: newAccountId(), name: "\u62DB\u884C\u50A8\u84C4", type: "savings", openingBalance: 0, currency: "CNY", active: true, createdAt: now, updatedAt: now },
    { id: newAccountId(), name: "\u5FAE\u4FE1\u96F6\u94B1\u901A", type: "ewallet", openingBalance: 0, currency: "CNY", active: true, createdAt: now, updatedAt: now }
  ];
  const cat = (flow, name) => ({ id: newCategoryId(), name, flow });
  const categories = [
    cat("expense", "\u9910\u996E"),
    cat("expense", "\u8D2D\u7269"),
    cat("expense", "\u4EA4\u901A"),
    cat("expense", "\u5C45\u5BB6"),
    cat("expense", "\u5A31\u4E50"),
    cat("expense", "\u533B\u6559"),
    cat("expense", "\u4EBA\u60C5"),
    cat("expense", "\u96F6\u7528"),
    cat("expense", "\u5176\u4ED6"),
    cat("expense", ADJUST_CATEGORY),
    cat("income", "\u5DE5\u8D44\u85AA\u6C34"),
    cat("income", "\u6295\u8D44\u6536\u76CA"),
    cat("income", "\u9000\u6B3E\u8FD4\u6B3E"),
    cat("income", "\u5176\u4ED6"),
    cat("income", ADJUST_CATEGORY)
  ];
  return { accounts, categories, rates: seedDefaultRates() };
}
function validateLedgerName(name, existing) {
  const n = name.trim();
  if (!n) return "\u8D26\u672C\u540D\u4E0D\u80FD\u4E3A\u7A7A";
  if (n.includes("/") || n.includes("\\")) return "\u8D26\u672C\u540D\u4E0D\u80FD\u5305\u542B\u8DEF\u5F84\u5206\u9694\u7B26";
  if (n === "." || n === ".." || n === "backups") return `\u8D26\u672C\u540D\u4E0D\u80FD\u4E3A ${n}`;
  if (existing.includes(n)) return `\u5DF2\u5B58\u5728\u8D26\u672C\u300C${n}\u300D`;
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
  const push = (d) => {
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
      if (!push(new Date(cur.getTime()))) break;
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
        if (!push(candidate)) break;
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
        if (!push(candidate)) break;
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
  if (!rule.id || !rule.id.trim()) return "\u89C4\u5219 id \u4E0D\u80FD\u4E3A\u7A7A";
  if (!rule.name || !rule.name.trim()) return "\u89C4\u5219\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A";
  if (!rule.startDate) return "\u8D77\u59CB\u65E5\u671F\u4E0D\u80FD\u4E3A\u7A7A";
  if (!parseDateOnly(rule.startDate)) return "\u8D77\u59CB\u65E5\u671F\u683C\u5F0F\u65E0\u6548";
  if (rule.endDate) {
    const sd = parseDateOnly(rule.startDate);
    const ed = parseDateOnly(rule.endDate);
    if (!ed) return "\u7ED3\u675F\u65E5\u671F\u683C\u5F0F\u65E0\u6548";
    if (sd && ed.getTime() < sd.getTime()) return "\u7ED3\u675F\u65E5\u671F\u4E0D\u80FD\u65E9\u4E8E\u8D77\u59CB\u65E5\u671F";
  }
  if (typeof rule.maxRuns === "number" && rule.maxRuns < 1) return "\u6700\u5927\u6B21\u6570\u5FC5\u987B \u2265 1";
  if (!Number.isFinite(rule.amount) || rule.amount < 0) return "\u91D1\u989D\u5FC5\u987B \u2265 0";
  if (rule.period === "weekly") {
    if (typeof rule.dayOfWeek !== "number" || rule.dayOfWeek < 0 || rule.dayOfWeek > 6) {
      return "\u6BCF\u5468\u89C4\u5219\u9700\u8981\u9009\u62E9\u5468\u51E0\uFF080-6\uFF09";
    }
  } else if (rule.period === "monthly") {
    if (typeof rule.dayOfMonth !== "number" || rule.dayOfMonth < 1 || rule.dayOfMonth > 31) {
      return "\u6BCF\u6708\u89C4\u5219\u9700\u8981\u9009\u62E9\u65E5\u671F\uFF081-31\uFF09";
    }
  } else if (rule.period === "yearly") {
    if (typeof rule.monthOfYear !== "number" || rule.monthOfYear < 1 || rule.monthOfYear > 12) {
      return "\u6BCF\u5E74\u89C4\u5219\u9700\u8981\u9009\u62E9\u6708\u4EFD\uFF081-12\uFF09";
    }
    if (typeof rule.dayOfYear !== "number" || rule.dayOfYear < 1 || rule.dayOfYear > 31) {
      return "\u6BCF\u5E74\u89C4\u5219\u9700\u8981\u9009\u62E9\u65E5\u671F\uFF081-31\uFF09";
    }
  } else {
    return "\u672A\u77E5\u7684\u5468\u671F\u7C7B\u578B";
  }
  if (rule.type === "expense" || rule.type === "income") {
    if (!rule.account) return "\u652F\u51FA/\u6536\u5165\u9700\u8981\u8D26\u6237";
    if (!rule.category) return "\u652F\u51FA/\u6536\u5165\u9700\u8981\u5206\u7C7B";
  } else if (rule.type === "transfer") {
    if (!rule.fromAccount || !rule.toAccount) return "\u8F6C\u8D26\u9700\u8981\u8F6C\u51FA/\u8F6C\u5165\u8D26\u6237";
    if (rule.fromAccount === rule.toAccount) return "\u8F6C\u8D26\u7684\u4E24\u4E2A\u8D26\u6237\u4E0D\u80FD\u76F8\u540C";
  } else if (rule.type === "loan") {
    if (!rule.account) return "\u501F\u8D37\u9700\u8981\u5DF1\u65B9\u8D26\u6237";
    if (!rule.person) return "\u501F\u8D37\u9700\u8981\u5BF9\u65B9\u8D26\u6237";
    if (!rule.direction) return "\u501F\u8D37\u9700\u8981\u65B9\u5411";
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
      const ts = dateToLocalISO(/* @__PURE__ */ new Date(`${dateStr}T00:00:00`));
      const note = expandNoteTemplate(rule.note, date);
      const ev = {
        op: "upsert",
        id: txId,
        type: rule.type,
        ts,
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
      if (rule.tags && rule.tags.length > 0) ev.tags = [...rule.tags];
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
    tags: state.tags && state.tags.length ? state.tags : void 0,
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

// ../../packages/core/src/accountOps.ts
function numOr(s) {
  const t = s.trim();
  return t ? Number(t) : void 0;
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
  for (const t of folded) {
    const next = { ...t };
    let changed = false;
    if (t.account === fromId) {
      next.account = toId;
      changed = true;
    }
    if (t.fromAccount === fromId) {
      next.fromAccount = toId;
      changed = true;
    }
    if (t.toAccount === fromId) {
      next.toAccount = toId;
      changed = true;
    }
    if (t.person === fromId) {
      next.person = toId;
      changed = true;
    }
    if (!changed) continue;
    if (next.type === "transfer" && next.fromAccount && next.toAccount && next.fromAccount === next.toAccount) {
      const ev = { op: "delete", targetId: t.id, updatedAt: now, source: "manual" };
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
  if (patch.tags !== void 0) next.tags = patch.tags;
  if (patch.note !== void 0) next.note = patch.note;
  return next;
}
function validateBatchMerged(t) {
  if (!(t.amount > 0)) throw new Error("\u91D1\u989D\u5FC5\u987B\u5927\u4E8E 0");
  if (t.type === "expense" || t.type === "income") {
    if (!t.account) throw new Error("\u8BF7\u9009\u62E9\u8D26\u6237");
    if (!t.category) throw new Error("\u8BF7\u9009\u62E9\u5206\u7C7B");
  } else if (t.type === "transfer") {
    if (!t.fromAccount) throw new Error("\u8BF7\u9009\u62E9\u8F6C\u51FA\u8D26\u6237");
    if (!t.toAccount) throw new Error("\u8BF7\u9009\u62E9\u8F6C\u5165\u8D26\u6237");
    if (t.fromAccount === t.toAccount) throw new Error("\u8F6C\u51FA\u4E0E\u8F6C\u5165\u8D26\u6237\u4E0D\u80FD\u76F8\u540C");
  } else if (t.type === "loan") {
    if (!t.account) throw new Error("\u8BF7\u9009\u62E9\u5DF1\u65B9\u8D26\u6237");
    if (!t.person) throw new Error("\u8BF7\u9009\u62E9\u5BF9\u65B9\u8D26\u6237");
    if (!t.direction) throw new Error("\u8BF7\u9009\u62E9\u501F\u8D37\u65B9\u5411");
  }
}
function buildBatchUpsertEvents(input) {
  const byId = new Map(input.folded.map((t) => [t.id, t]));
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

// ../../packages/core/src/changelog.ts
var MOBILE_RECENT_UPDATES = [
  "\u62A5\u8868\u5206\u7C7B\u4E0B\u94BB\uFF1A\u70B9\u5F00\u62A5\u8868\u5206\u7C7B\u76F4\u8FBE\u6D41\u6C34\u660E\u7EC6\uFF0C\u79FB\u52A8\u7AEF\u4E5F\u80FD\u9010\u7B14\u8FFD\u6EAF",
  "\u6279\u91CF\u5220\u9664\u6D41\u6C34\uFF1A\u591A\u9009\u5220\u9664\uFF0C\u7ED3\u6E05\u4EA4\u6613\u8054\u52A8\u5220\u9664\u5BF9\u7AEF\uFF0C\u6E05\u7406\u66F4\u7701\u4E8B",
  "\u591A\u5E01\u79CD\u8BB0\u8D26\uFF1A\u6BCF\u7B14\u5E26\u5E01\u79CD\u4E0E\u6C47\u7387\u5FEB\u7167\uFF0C\u8DE8\u5E01\u79CD\u8F6C\u8D26\u652F\u6301\u53CC\u91D1\u989D\uFF0C\u4F59\u989D\u62A5\u8868\u6309\u672C\u4F4D\u5E01\u6298\u7B97",
  "\u8D26\u6237\u7BA1\u7406\u8865\u9F50\uFF1A\u8D26\u6237\u652F\u6301\u9690\u85CF / \u542F\u7528 / \u5C5E\u6027\u7F16\u8F91 / \u5408\u5E76\uFF0C\u79FB\u52A8\u7AEF\u64CD\u4F5C\u4E0D\u8F93\u684C\u9762",
  "\u793A\u4F8B\u8D26\u672C\u5F15\u5BFC\uFF1A\u9996\u6B21\u4F7F\u7528\u81EA\u5E26\u793A\u4F8B\u6570\u636E\uFF0C\u5FEB\u901F\u4E0A\u624B\u5404\u7C7B\u8BB0\u8D26\u573A\u666F"
];

// src/dataAdapter.ts
function normalizeTxAmount(data) {
  return { ...data, amount: round2(data.amount) };
}
var ObsidianDataAdapter = class {
  constructor(vault, dataSubdir, _plugin) {
    this.vault = vault;
    this.dataSubdir = dataSubdir;
  }
  p(name) {
    return `${this.dataSubdir}/${name}`;
  }
  async readFile(name) {
    const file = this.vault.getAbstractFileByPath(this.p(name));
    if (!(file instanceof import_obsidian.TFile)) return null;
    return this.vault.read(file);
  }
  async writeFile(name, content) {
    const path = this.p(name);
    const existing = this.vault.getAbstractFileByPath(path);
    if (existing instanceof import_obsidian.TFile) {
      await this.vault.modify(existing, content);
      return;
    }
    await this.ensureDir();
    await this.vault.create(path, content);
  }
  async ensureDir() {
    const parts = this.dataSubdir.split("/").filter(Boolean);
    let cur = "";
    for (const part of parts) {
      cur = cur ? `${cur}/${part}` : part;
      if (!this.vault.getAbstractFileByPath(cur)) {
        try {
          await this.vault.createFolder(cur);
        } catch {
        }
      }
    }
  }
  async loadLog() {
    const text = await this.readFile("transactions.jsonl");
    if (text == null) return [];
    const events = [];
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      try {
        events.push(JSON.parse(t));
      } catch {
      }
    }
    return events;
  }
  async appendEvents(events) {
    if (events.length === 0) return;
    const path = this.p("transactions.jsonl");
    await this.ensureDir();
    const lines = events.map((e) => e.op === "upsert" ? JSON.stringify(normalizeTxAmount(e)) : JSON.stringify(e)).map((l) => l + "\n");
    let file = this.vault.getAbstractFileByPath(path);
    if (!(file instanceof import_obsidian.TFile)) file = await this.vault.create(path, "");
    await this.vault.process(file, (prev) => prev + lines.join(""));
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
  /** 读取账本 ledger.json（{ alias?, baseCurrency? }）；缺失/损坏返回 {}。 */
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
    return backupPath;
  }
  /** 新建 person 往来账户（借贷对方），返回新账户 */
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
  /** 扫描 vault 根目录，列出所有包含 transactions.jsonl 的账本子目录 */
  async listLedgers() {
    const root = this.vault.getAbstractFileByPath("/");
    if (!root) return [];
    const ledgers = [];
    if ("children" in root && Array.isArray(root.children)) {
      for (const child of root.children) {
        if ("children" in child && typeof child.name === "string") {
          const name = child.name;
          if (name === "." || name === ".." || name === "backups" || name.includes("/") || name.includes("\\")) {
            continue;
          }
          const txPath = `${name}/transactions.jsonl`;
          const txFile = this.vault.getAbstractFileByPath(txPath);
          if (txFile) {
            ledgers.push(name);
          }
        }
      }
    }
    return ledgers.sort();
  }
  /** 读取账本别名（可选，缺失则返回文件夹名） */
  async readLedgerAlias(subdir) {
    try {
      const ledgerJsonPath = `${subdir}/ledger.json`;
      const content = await this.vault.adapter.read(ledgerJsonPath);
      const data = JSON.parse(content);
      return data.alias || subdir;
    } catch {
      return subdir;
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
  /** 列出所有备份（返回 [{ name, mtime, path }]，按 mtime 倒序） */
  async listBackups() {
    const backupsDir = `${this.dataSubdir}/backups`;
    const backups = [];
    if (!await this.vault.adapter.exists(backupsDir)) {
      return backups;
    }
    const dir = this.vault.getAbstractFileByPath(backupsDir);
    if (!dir || !("children" in dir)) return backups;
    const children = dir.children;
    for (const child of children) {
      if (child && typeof child === "object" && "children" in child && "name" in child && typeof child.name === "string") {
        const c = child;
        const parsed = this.parseBackupTimestamp(c.name);
        backups.push({
          name: c.name,
          path: c.path,
          mtime: parsed ?? c.stat?.mtime ?? 0
        });
      }
    }
    return backups.sort((a, b) => b.mtime - a.mtime);
  }
  /** 解析备份名中的时间戳（兼容插件旧版 YYYYMMDDTHHMMSSZ 与桌面端 YYYYMMDD-HHMMSSZ → epoch ms） */
  parseBackupTimestamp(name) {
    const m = name.match(/(\d{4})(\d{2})(\d{2})[T-](\d{2})(\d{2})(\d{2})Z/);
    if (!m || !m[1] || !m[2] || !m[3] || !m[4] || !m[5] || !m[6]) return null;
    const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
    const t = Date.parse(iso);
    return Number.isNaN(t) ? null : t;
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
  }
  /**
   * 新建账本：建目录 + backups/ + 写空 transactions.jsonl + 播种 accounts/categories（可选 alias）。
   * 走 vault.adapter 文件系统级 API（与 backup/restoreBackup 一致），与桌面端 createLedger 行为对齐。
   */
  async createLedger(name, alias) {
    const existing = await this.listLedgers();
    const err = validateLedgerName(name, existing);
    if (err) throw new Error(err);
    const folder = name.trim();
    if (await this.vault.adapter.exists(folder)) {
      throw new Error(`\u5DF2\u5B58\u5728\u540C\u540D\u76EE\u5F55\u300C${folder}\u300D`);
    }
    await this.vault.adapter.mkdir(folder);
    await this.vault.adapter.mkdir(`${folder}/backups`);
    await this.vault.adapter.write(`${folder}/transactions.jsonl`, "");
    const seed = seedDefaults();
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
  }
  /**
   * 新建示例账本：建目录 + backups/ + 写 seed 数据 + 写入示例交易事件。
   * 与桌面端 createSampleLedger 行为对齐。
   */
  async createSampleLedger(name, alias) {
    const folder = name.trim();
    if (await this.vault.adapter.exists(folder)) {
      throw new Error(`\u5DF2\u5B58\u5728\u540C\u540D\u76EE\u5F55\u300C${folder}\u300D`);
    }
    await this.vault.adapter.mkdir(folder);
    await this.vault.adapter.mkdir(`${folder}/backups`);
    await this.vault.adapter.write(`${folder}/transactions.jsonl`, "");
    const seed = seedSampleLedger();
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
    if (!n) throw new Error("\u8D26\u672C\u540D\u4E0D\u80FD\u4E3A\u7A7A");
    if (n.includes("/") || n.includes("\\")) throw new Error("\u8D26\u672C\u540D\u4E0D\u80FD\u5305\u542B\u8DEF\u5F84\u5206\u9694\u7B26");
    if (n === "." || n === ".." || n === "backups") throw new Error(`\u8D26\u672C\u540D\u4E0D\u80FD\u4E3A ${n}`);
    if (n === this.dataSubdir) throw new Error("\u4E0D\u80FD\u5220\u9664\u5F53\u524D\u8D26\u672C\uFF0C\u8BF7\u5148\u5207\u6362\u5230\u5176\u4ED6\u8D26\u672C");
    if (await this.vault.adapter.exists(n)) {
      await this.vault.adapter.rmdir(n, true);
    }
  }
};

// src/accountTypeEdit.ts
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
    types: s.types.map((t) => t.groupId === id ? { ...t, groupId: fallback } : t)
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
  return { ...s, types: s.types.map((t) => t.type === type ? { ...t, label } : t) };
}
function setTypeActive(s, type, active) {
  return { ...s, types: s.types.map((t) => t.type === type ? { ...t, active } : t) };
}
function setTypeGroup(s, type, groupId) {
  if (!s.groups.some((g) => g.id === groupId)) return s;
  const cfg = s.types.find((t) => t.type === type);
  if (!cfg || cfg.groupId === groupId) return s;
  const moved = { ...cfg, groupId };
  const without = s.types.filter((t) => t.type !== type);
  let lastIdx = -1;
  without.forEach((t, i) => {
    if (t.groupId === groupId) lastIdx = i;
  });
  without.splice(lastIdx + 1, 0, moved);
  return { ...s, types: without };
}
function moveType(s, type, dir) {
  const idx = s.types.findIndex((t) => t.type === type);
  if (idx < 0) return s;
  const cfg = s.types[idx];
  const groupIdxs = [];
  s.types.forEach((t, i) => {
    if (t.groupId === cfg.groupId) groupIdxs.push(i);
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
  btn.setAttribute("aria-label", opts.ariaLabel ?? "\u67E5\u770B\u8BF4\u660E");
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
  container.createEl("h2", { text: opts.title ?? "\u65B0\u5EFA\u8D26\u672C" });
  const nameInput = container.createEl("input", { type: "text", cls: "accounting-ledger-input" });
  nameInput.placeholder = "\u8D26\u672C\u540D\uFF08\u5982 myledger\uFF09";
  nameInput.autofocus = true;
  const aliasInput = container.createEl("input", { type: "text", cls: "accounting-ledger-input" });
  aliasInput.placeholder = "\u522B\u540D\uFF08\u5982 \u4E2A\u4EBA\u8D26\u672C\uFF0C\u53EF\u9009\uFF09";
  const errorEl = container.createEl("div", { cls: "accounting-ledger-error" });
  const actions = container.createDiv("accounting-modal-actions");
  const cancelBtn = actions.createEl("button", { text: opts.cancelText ?? "\u53D6\u6D88", cls: "accounting-btn-secondary" });
  cancelBtn.onclick = () => handlers.onCancel();
  const submitBtn = actions.createEl("button", { text: opts.submitText ?? "\u65B0\u5EFA", cls: "accounting-btn-primary" });
  submitBtn.disabled = true;
  const update = () => {
    const err = validateLedgerName(nameInput.value, existing);
    errorEl.setText(err ?? "");
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
var import_obsidian16 = require("obsidian");

// src/transactionListModal.ts
var import_obsidian7 = require("obsidian");

// src/accountGrouping.ts
var byName = (a, b) => a.name.localeCompare(b.name, "zh");
function fillAccountOptions(sel, accounts, value, includeHidden, settings, typeFilter) {
  const typeToGroup = new Map(settings.types.map((t) => [t.type, t.groupId]));
  const pool = accounts.filter((a) => typeFilter ? a.type === typeFilter : true);
  const active = pool.filter((a) => a.active).sort(byName);
  const hidden = includeHidden ? pool.filter((a) => !a.active).sort(byName) : [];
  const selectedAcc = value ? pool.find((a) => a.id === value) : void 0;
  if (selectedAcc && !selectedAcc.active && !includeHidden) {
    hidden.push(selectedAcc);
  }
  const groups = resolveTypeGroups(settings).map((g) => ({ label: g.label, items: active.filter((a) => typeToGroup.get(a.type) === g.id) })).filter((g) => g.items.length > 0);
  if (hidden.length > 0) groups.push({ label: "\u9690\u85CF\u8D26\u6237", items: hidden });
  for (const g of groups) {
    const og = sel.createEl("optgroup", { attr: { label: g.label } });
    for (const a of g.items) {
      const o = og.createEl("option", { text: a.name });
      o.value = a.id;
      if (a.id === value) o.selected = true;
    }
  }
}

// src/batchModifyModal.ts
var import_obsidian3 = require("obsidian");

// src/keyboardAvoidance.ts
var import_obsidian2 = require("obsidian");
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
  const isSmallScreen = () => import_obsidian2.Platform.isMobile || window.innerWidth < 768;
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
var KEEP_HINT = "\u7559\u7A7A\u4FDD\u6301\u539F\u503C";
var TYPES = [
  { key: "expense", label: "\u652F\u51FA" },
  { key: "income", label: "\u6536\u5165" },
  { key: "transfer", label: "\u8F6C\u8D26" },
  { key: "loan", label: "\u501F\u8D37" }
];
var BatchModifyModal = class extends import_obsidian3.Modal {
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
      tags: "",
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
    if (!import_obsidian3.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("accounting-modal");
    this.renderView();
  }
  renderView() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: `\u6279\u91CF\u4FEE\u6539\uFF08${this.transactions.length} \u6761\uFF09` });
    const hint = contentEl.createDiv({ cls: "accounting-batch-hint" });
    hint.createEl("div", { text: "\u4EC5\u586B\u5199\u8981\u4FEE\u6539\u7684\u5B57\u6BB5\uFF0C\u7559\u7A7A\u4FDD\u6301\u5404\u6761\u539F\u503C\u3002" });
    const typeChanged = this.state.type !== this.originalType;
    if (typeChanged) {
      hint.createEl("div", {
        text: "\u5DF2\u6539\u53D8\u7C7B\u578B\uFF0C\u76EE\u6807\u7C7B\u578B\u7684\u5FC5\u586B\u5B57\u6BB5\u5FC5\u987B\u586B\u5199\u3002",
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
      text: `\u6279\u91CF\u4FEE\u6539 ${this.transactions.length} \u6761`,
      cls: "accounting-btn-primary"
    });
    submitBtn.onclick = () => this.submit();
    const cancelBtn = footer.createEl("button", { text: "\u53D6\u6D88", cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
  }
  renderTypePills(container) {
    const row = container.createDiv({ cls: "accounting-type-pills" });
    for (const t of TYPES) {
      const active = this.state.type === t.key;
      const pill = row.createEl("button", {
        text: t.label,
        cls: `accounting-type-pill${active ? " accounting-type-pill-active" : ""}`
      });
      pill.onclick = () => {
        this.state.type = t.key;
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
    const keepHint = typeChanged ? "\u8BF7\u9009\u62E9" : KEEP_HINT;
    this.addField(fc, "\u91D1\u989D", (wrap) => {
      const input = wrap.createEl("input", {
        type: "text",
        value: s.amount,
        cls: "accounting-input",
        attr: { placeholder: KEEP_HINT, inputmode: "decimal" }
      });
      input.oninput = () => {
        s.amount = input.value;
      };
    });
    if (s.type === "expense" || s.type === "income") {
      const cats = this.categories.filter((c) => c.flow === (s.type === "expense" ? "expense" : "income")).slice().sort((a, b) => a.name.localeCompare(b.name, "zh"));
      this.addField(fc, "\u8D26\u6237", (wrap) => {
        const sel = wrap.createEl("select", { cls: "accounting-input" });
        sel.createEl("option", { text: keepHint }).value = "";
        fillAccountOptions(sel, this.accounts, s.account, false, this.accountTypeSettings);
        sel.onchange = () => {
          s.account = sel.value;
        };
      });
      this.addField(fc, "\u5206\u7C7B", (wrap) => {
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
      this.addField(fc, "\u8F6C\u51FA\u8D26\u6237", (wrap) => {
        const sel = wrap.createEl("select", { cls: "accounting-input" });
        sel.createEl("option", { text: keepHint }).value = "";
        fillAccountOptions(sel, this.accounts, s.fromAccount, false, this.accountTypeSettings);
        sel.onchange = () => {
          s.fromAccount = sel.value;
        };
      });
      this.addField(fc, "\u8F6C\u5165\u8D26\u6237", (wrap) => {
        const sel = wrap.createEl("select", { cls: "accounting-input" });
        sel.createEl("option", { text: keepHint }).value = "";
        fillAccountOptions(sel, this.accounts, s.toAccount, false, this.accountTypeSettings);
        sel.onchange = () => {
          s.toAccount = sel.value;
        };
      });
    } else if (s.type === "loan") {
      this.addField(fc, "\u65B9\u5411", (wrap) => {
        const sel = wrap.createEl("select", { cls: "accounting-input" });
        sel.createEl("option", { text: keepHint }).value = "";
        const lend = sel.createEl("option", { text: "\u501F\u51FA\uFF08\u5BF9\u65B9\u6B20\u6211\uFF09" });
        lend.value = "lend";
        const borrow = sel.createEl("option", { text: "\u501F\u5165\uFF08\u6211\u6B20\u5BF9\u65B9\uFF09" });
        borrow.value = "borrow";
        if (s.direction === "lend") lend.selected = true;
        if (s.direction === "borrow") borrow.selected = true;
        sel.onchange = () => {
          s.direction = sel.value;
        };
      });
      this.addField(fc, "\u5DF1\u65B9\u8D26\u6237", (wrap) => {
        const sel = wrap.createEl("select", { cls: "accounting-input" });
        sel.createEl("option", { text: keepHint }).value = "";
        fillAccountOptions(sel, this.accounts, s.account, false, this.accountTypeSettings);
        sel.onchange = () => {
          s.account = sel.value;
        };
      });
      this.addField(fc, "\u5BF9\u65B9\uFF08\u4EBA\u8D26\u6237\uFF09", (wrap) => {
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
    this.addField(fc, "\u65F6\u95F4", (wrap) => {
      const input = wrap.createEl("input", {
        type: "datetime-local",
        value: s.ts,
        cls: "accounting-input"
      });
      input.onchange = () => {
        s.ts = input.value;
      };
    });
    this.addField(fc, "\u6807\u7B7E\uFF08\u7A7A\u683C\u5206\u9694\uFF09", (wrap) => {
      const input = wrap.createEl("input", {
        type: "text",
        value: s.tags,
        cls: "accounting-input",
        attr: { placeholder: KEEP_HINT }
      });
      input.oninput = () => {
        s.tags = input.value;
      };
    });
    this.addField(fc, "\u5907\u6CE8", (wrap) => {
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
        this.showError("\u91D1\u989D\u9700\u4E3A\u5927\u4E8E 0 \u7684\u6570");
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
      const iso = datetimeLocalToISO(s.ts);
      if (!iso) {
        this.showError("\u65F6\u95F4\u683C\u5F0F\u4E0D\u6B63\u786E");
        return null;
      }
      patch.ts = iso;
    }
    const tags = parseTagsInput(s.tags);
    if (tags) patch.tags = tags;
    if (s.note.trim() !== "") patch.note = s.note.trim();
    if (Object.keys(patch).length === 0) {
      this.showError("\u8BF7\u81F3\u5C11\u4FEE\u6539\u4E00\u9879");
      return null;
    }
    if (typeChanged) {
      if (s.type === "expense" || s.type === "income") {
        if (!s.account) {
          this.showError("\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u8D26\u6237");
          return null;
        }
        if (!s.category) {
          this.showError("\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u5206\u7C7B");
          return null;
        }
      } else if (s.type === "transfer") {
        if (!s.fromAccount) {
          this.showError("\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u8F6C\u51FA\u8D26\u6237");
          return null;
        }
        if (!s.toAccount) {
          this.showError("\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u8F6C\u5165\u8D26\u6237");
          return null;
        }
        if (s.fromAccount === s.toAccount) {
          this.showError("\u8F6C\u51FA\u4E0E\u8F6C\u5165\u8D26\u6237\u4E0D\u80FD\u76F8\u540C");
          return null;
        }
      } else if (s.type === "loan") {
        if (!s.account) {
          this.showError("\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u5DF1\u65B9\u8D26\u6237");
          return null;
        }
        if (!s.person) {
          this.showError("\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u5BF9\u65B9");
          return null;
        }
        if (!s.direction) {
          this.showError("\u6539\u7C7B\u578B\u540E\u8BF7\u9009\u62E9\u501F\u8D37\u65B9\u5411");
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
      for (const t of this.transactions) {
        const current = latestUpdatedAt.get(t.id);
        const base = this.baseUpdatedAtById.get(t.id) ?? "";
        if (hasUpdatedSince(current, base)) {
          new import_obsidian3.Notice("\u6240\u9009\u8BB0\u5F55\u5DF2\u88AB\u53E6\u4E00\u7AEF\u66F4\u65B0\uFF0C\u5DF2\u5237\u65B0\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u5E76\u91CD\u8BD5");
          this.onDone();
          this.close();
          return;
        }
      }
      const folded = foldEvents(fresh);
      const ids = this.transactions.map((t) => t.id);
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
      new import_obsidian3.Notice(`\u5DF2\u66F4\u65B0 ${events.length} \u6761`);
      this.onDone();
      this.close();
    } catch (e) {
      const msg = "\u6279\u91CF\u4FEE\u6539\u5931\u8D25\uFF1A" + (e instanceof Error ? e.message : String(e));
      this.showError(msg);
      new import_obsidian3.Notice(msg);
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
var import_obsidian4 = require("obsidian");
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
  if (!import_obsidian4.Platform.isMobile) modalEl.addClass("accounting-desktop");
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
    { label: "\u8BB0\u8D26", page: "entry", run: (s) => {
      closeSelf();
      ctx.openEntry(s);
    } },
    { label: "\u6D41\u6C34", page: "list", run: (s) => {
      closeSelf();
      ctx.openList(void 0, s);
    } },
    { label: "\u8D26\u6237", page: "balance", run: (s) => {
      closeSelf();
      ctx.openBalance(s);
    } },
    { label: "\u7EDF\u8BA1", page: "report", run: (s) => {
      closeSelf();
      ctx.openReport(s);
    } },
    { label: "\u8BBE\u7F6E", page: "settings", run: (s) => {
      closeSelf();
      ctx.openSettings(s);
    } }
  ];
  for (const it of items) {
    const isCurrent = it.page !== void 0 && it.page === current;
    const btn = bar.createEl("button", {
      text: it.label,
      cls: `accounting-nav-btn${isCurrent ? " accounting-nav-current" : ""}`
    });
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
  const btn = container.createEl("button", { text: "\u2039 \u8FD4\u56DE", cls: "accounting-back-btn" });
  btn.onclick = () => onClose();
  return btn;
}
function renderNavOrBack(container, page, navCtx, closeSelf, drillDown) {
  if (drillDown) renderBackBtn(container, closeSelf);
  else if (navCtx) renderNavBar(container, page, navCtx, closeSelf);
}

// src/transactionDetailModal.ts
var import_obsidian6 = require("obsidian");

// src/entryModal.ts
var import_obsidian5 = require("obsidian");

// src/settlement.ts
async function ensureCategories(adapter, accounts, categories, items) {
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
  if (!changed) return categories;
  await adapter.writeMeta({ accounts, categories: next });
  return next;
}
async function saveSettlement(adapter, accounts, categories, input) {
  const outcome = deriveSettlementDiff(input.outstanding, input.paid, input.direction);
  if (outcome.kind === "writeoff") {
    await ensureCategories(adapter, accounts, categories, [{ flow: outcome.type, name: outcome.category }]);
  }
  const { events } = buildSettlementEvents({
    outcome,
    collect: input.collect,
    now: nowISO(),
    baseUpdatedAtById: /* @__PURE__ */ new Map()
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
  { label: "\u5B8C\u6210", act: "equals", cls: "accounting-calc-key--eq" }
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
        preview.createEl("span", { text: "\u26A0 \u516C\u5F0F\u6709\u8BEF", cls: "accounting-calc-preview-error" });
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
    const btn = grid.createEl("button", { text: k.label, cls: `accounting-calc-key ${k.cls ?? ""}`.trim() });
    btn.type = "button";
    btn.addEventListener("click", () => press(k));
  }
  renderPreview();
}

// src/entryModal.ts
var TYPES2 = [
  { key: "expense", label: "\u652F\u51FA" },
  { key: "income", label: "\u6536\u5165" },
  { key: "transfer", label: "\u8F6C\u8D26" },
  { key: "loan", label: "\u501F\u8D37" }
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
var EntryModal = class extends import_obsidian5.Modal {
  constructor(app, adapter, accounts, categories, onSubmitted, initialTx, isCopy = true, navCtx, slide, onSwitchLedger, recurring, onRecurringSaved) {
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
      tags: "",
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
      tags: tx.tags?.join(" ") || "",
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
      tags: rule.tags?.join(" ") || "",
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
    if (this.recurringMode !== "none") this.modalEl.addClass("accounting-drilldown");
    const storedTypes = await this.adapter.readAccountTypeSettings();
    this.accountTypeSettings = storedTypes ? normalizeAccountTypeSettings(storedTypes) : defaultAccountTypeSettings();
    this.transactions = foldEvents(await this.adapter.loadLog());
    this.baseCurrency = await this.adapter.readBaseCurrency();
    this.rates = await this.adapter.readRates();
    const ledgerAlias = await this.adapter.readActiveLedgerAlias();
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("accounting-entry-modal");
    const sc = slideClass(this.slide);
    if (sc) contentEl.addClass(sc);
    renderNavOrBack(this.modalEl, "entry", this.navCtx, () => this.close(), this.recurringMode !== "none");
    const ledgerHeader = contentEl.createDiv({ cls: "accounting-entry-ledger" });
    ledgerHeader.createEl("span", { cls: "accounting-entry-ledger-name", text: ledgerAlias });
    if (this.onSwitchLedger) {
      ledgerHeader.addClass("accounting-entry-ledger-clickable");
      ledgerHeader.createEl("span", { cls: "accounting-entry-ledger-caret", text: "\u25BE" });
      ledgerHeader.onclick = () => void this.openLedgerSwitcher();
    }
    const typeWrap = contentEl.createDiv({ cls: "accounting-entry-type" });
    this.typeRow = typeWrap.createDiv({ cls: "accounting-entry-type-row" });
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
    for (const t of TYPES2) {
      const active = this.state.type === t.key;
      const btn = this.typeRow.createEl("button", {
        text: t.label,
        cls: `accounting-entry-type-btn${active ? " accounting-entry-type-active" : ""}`
      });
      btn.onclick = () => {
        if (this.state.type === t.key) return;
        this.state.type = t.key;
        this.renderTypeButtons();
        this.rerender();
      };
    }
  }
  rerender() {
    this.fieldContainer.empty();
    this.renderFields();
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
    row.createEl("label", { text: `\u6C47\u7387\uFF081 ${cur} \u2192 ${this.baseCurrency}\uFF09`, cls: "accounting-entry-label" });
    const input = row.createEl("input", { cls: "accounting-entry-input" });
    input.type = "text";
    input.inputMode = "decimal";
    input.value = this.state.rate;
    input.placeholder = `1 ${cur} = ? ${this.baseCurrency}`;
    input.addEventListener("input", () => this.state.rate = input.value);
    row.createEl("div", { text: "\u6C47\u7387\u6309\u8868\u9884\u586B\uFF0C\u53EF\u6539\uFF1B\u7559\u7A7A\u6309 1:1 \u6298\u7B97", cls: "accounting-entry-hint" });
  }
  /** transfer 跨币种时渲染转入金额输入行 + 只读隐含汇率 */
  renderToAmountRow(wrap) {
    if (!this.state.fromAccount || !this.state.toAccount) return;
    const fc = this.fromCurrency();
    const tc = this.toCurrency();
    if (fc === tc) return;
    const row = wrap.createDiv({ cls: "accounting-entry-row" });
    row.createEl("label", { text: `\u8F6C\u5165\u91D1\u989D\uFF08${tc}\uFF09`, cls: "accounting-entry-label" });
    const input = row.createEl("input", { cls: "accounting-entry-input" });
    input.type = "text";
    input.inputMode = "decimal";
    input.value = this.state.toAmount;
    input.placeholder = `\u5B9E\u5230 ${tc} \u91D1\u989D`;
    const hint = row.createEl("div", { cls: "accounting-entry-hint" });
    const updateHint = () => {
      const amt = amountValueOr(this.state.amount);
      const toAmt = amountValueOr(this.state.toAmount);
      hint.setText(amt > 0 && toAmt > 0 ? `\u9690\u542B\u6C47\u7387 1 ${fc} = ${round2(toAmt / amt)} ${tc}\uFF08\u4EC5\u4F9B\u53C2\u8003\uFF09` : `\u8DE8\u5E01\u79CD\uFF1A\u586B\u8F6C\u5165\u8D26\u6237\uFF08${tc}\uFF09\u7684\u5B9E\u5230\u91D1\u989D`);
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
    const amountRow = wrap.createDiv({ cls: "accounting-entry-row" });
    amountRow.createEl("label", { text: this.amountCurrency() !== this.baseCurrency ? `\u91D1\u989D\uFF08${this.amountCurrency()})` : "\u91D1\u989D", cls: "accounting-entry-label" });
    const amountStack = amountRow.createDiv({ cls: "accounting-amount-stack" });
    const amountInput = amountStack.createEl("input", { cls: "accounting-entry-input accounting-amount-display" });
    amountInput.type = "text";
    amountInput.readOnly = true;
    amountInput.inputMode = "decimal";
    amountInput.value = s.amount;
    amountInput.placeholder = "0.00";
    const keypadHost = amountStack.createDiv({ cls: "accounting-calc-host" });
    this.amountInputEl = amountInput;
    this.keypadHostEl = keypadHost;
    mountCalculatorKeypad(keypadHost, {
      getValue: () => s.amount,
      onChange: (next) => {
        s.amount = next;
        amountInput.value = next;
        this.updateSettlePreview();
        this.updateFromNoteHint();
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
    this.fromNoteHintEl = amountStack.createDiv({ cls: "accounting-entry-from-note", text: "\u2190 \u6765\u81EA\u5907\u6CE8" });
    this.fromNoteHintEl.hide();
    this.updateFromNoteHint();
    if (s.type === "expense" || s.type === "income") {
      this.accountSelectRow(wrap, "\u8D26\u6237", s.account, includeHidden, (v) => {
        s.account = v;
        this.applyRatePrefill();
        this.rerender();
      });
      const cats = this.categories.filter((c) => c.flow === s.type && c.active !== false).sort((a, b) => a.name.localeCompare(b.name, "zh"));
      this.selectRow(wrap, "\u5206\u7C7B", s.category, [
        { value: "", label: "\u8BF7\u9009\u62E9" },
        ...cats.map((c) => ({ value: c.name, label: c.name }))
      ], (v) => s.category = v);
      this.renderRateRow(wrap);
    } else if (s.type === "transfer") {
      this.accountSelectRow(wrap, "\u8F6C\u51FA\u8D26\u6237", s.fromAccount, includeHidden, (v) => {
        s.fromAccount = v;
        this.rerender();
      });
      this.accountSelectRow(wrap, "\u8F6C\u5165\u8D26\u6237", s.toAccount, includeHidden, (v) => {
        s.toAccount = v;
        this.rerender();
      });
      this.renderToAmountRow(wrap);
    } else {
      const dirOptions = this.repeatOn ? [
        { value: "lend", label: "\u501F\u51FA\uFF08\u5BF9\u65B9\u6B20\u6211\uFF09" },
        { value: "borrow", label: "\u501F\u5165\uFF08\u6211\u6B20\u5BF9\u65B9\uFF09" }
      ] : [
        { value: "lend", label: "\u501F\u51FA\uFF08\u5BF9\u65B9\u6B20\u6211\uFF09" },
        { value: "borrow", label: "\u501F\u5165\uFF08\u6211\u6B20\u5BF9\u65B9\uFF09" },
        { value: "collect", label: "\u6536\u6B3E\uFF08\u6536\u56DE\u501F\u51FA\uFF09" },
        { value: "repay", label: "\u8FD8\u6B3E\uFF08\u5F52\u8FD8\u501F\u5165\uFF09" }
      ];
      this.selectRow(wrap, "\u65B9\u5411", s.direction, dirOptions, (v) => {
        s.direction = v;
        this.rerender();
      });
      this.accountSelectRow(wrap, "\u5DF1\u65B9\u8D26\u6237", s.account, includeHidden, (v) => {
        s.account = v;
        this.applyRatePrefill();
        this.rerender();
      });
      this.renderPersonField(wrap);
      this.renderRateRow(wrap);
      const mismatch = this.loanCurrencyMismatch();
      if (mismatch) {
        const hint = wrap.createDiv({ cls: "accounting-entry-row" });
        hint.createEl("div", { text: `\u501F\u8D37\u4E0D\u652F\u6301\u8DE8\u5E01\u79CD\uFF08\u5DF1\u65B9 ${mismatch.ac} / \u5BF9\u65B9 ${mismatch.pc}\uFF09\uFF0C\u8BF7\u4E3A\u5BF9\u65B9\u53E6\u5EFA\u540C\u5E01\u79CD\u8D26\u6237\u6216\u6539\u7528\u300C\u8F6C\u8D26\u300D`, cls: "accounting-error" });
      }
      if (s.direction === "collect" || s.direction === "repay") {
        this.renderSettleRow(wrap);
      }
    }
    const tagsRow = wrap.createDiv({ cls: "accounting-entry-row" });
    tagsRow.createEl("label", { text: "\u6807\u7B7E", cls: "accounting-entry-label" });
    const tagsInput = tagsRow.createEl("input", { cls: "accounting-entry-input" });
    tagsInput.value = s.tags;
    tagsInput.placeholder = "\u7A7A\u683C\u5206\u9694\uFF0C\u53EF\u9009";
    tagsInput.addEventListener("input", () => s.tags = tagsInput.value);
    const noteRow = wrap.createDiv({ cls: "accounting-entry-row" });
    noteRow.createEl("label", { text: "\u5907\u6CE8", cls: "accounting-entry-label" });
    const noteTextarea = noteRow.createEl("textarea", { cls: "accounting-entry-input accounting-entry-textarea" });
    noteTextarea.value = s.note;
    noteTextarea.placeholder = "\u53EF\u9009";
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
      timeRow.createEl("label", { text: this.repeatOn ? "\u8D77\u59CB\u65E5\u671F" : "\u65F6\u95F4", cls: "accounting-entry-label" });
      const timeInput = timeRow.createEl("input", { cls: "accounting-entry-input" });
      if (this.repeatOn) {
        timeInput.type = "date";
        timeInput.value = this.schedule.startDate;
        timeInput.addEventListener("change", () => {
          this.schedule.startDate = timeInput.value || todayDateInput();
        });
      } else {
        timeInput.type = "datetime-local";
        timeInput.value = s.ts;
        timeInput.addEventListener("change", () => s.ts = timeInput.value);
      }
      const toggle = timeRow.createEl("button", {
        text: this.repeatOn ? "\u2713 \u91CD\u590D" : "\u4E0D\u91CD\u590D",
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
      text: "\u4FDD\u5B58",
      cls: "accounting-entry-submit"
    });
    submitBtn.disabled = !!this.loanCurrencyMismatch();
    submitBtn.onclick = () => this.submit();
  }
  renderRecurringSection(wrap) {
    if (!this.repeatOn) return;
    const nameRow = wrap.createDiv({ cls: "accounting-entry-row" });
    nameRow.createEl("label", { text: "\u89C4\u5219\u540D\u79F0", cls: "accounting-entry-label" });
    const nameInput = nameRow.createEl("input", { cls: "accounting-entry-input" });
    nameInput.type = "text";
    nameInput.value = this.schedule.name;
    nameInput.placeholder = "\u5982\uFF1A\u6BCF\u6708\u623F\u79DF";
    nameInput.addEventListener("input", () => {
      this.schedule.name = nameInput.value;
    });
    const periodRow = wrap.createDiv({ cls: "accounting-entry-row" });
    periodRow.createEl("label", { text: "\u5468\u671F", cls: "accounting-entry-label" });
    const periodCtrl = periodRow.createDiv({ cls: "accounting-entry-control-group" });
    for (const p of [
      { key: "monthly", label: "\u6BCF\u6708" },
      { key: "weekly", label: "\u6BCF\u5468" },
      { key: "yearly", label: "\u6BCF\u5E74" }
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
    dateRow.createEl("label", { text: "\u65E5\u671F", cls: "accounting-entry-label" });
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
        ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"].map((label, i) => ({ value: String(i), label: `\u5468${label}` })),
        String(this.schedule.dayOfWeek),
        (v) => this.schedule.dayOfWeek = Number(v)
      );
    } else {
      selInput(
        Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}\u6708` })),
        String(this.schedule.monthOfYear),
        (v) => this.schedule.monthOfYear = Number(v)
      );
      selInput(dayOptions, String(this.schedule.dayOfYear), (v) => this.schedule.dayOfYear = Number(v));
    }
    const endRow = wrap.createDiv({ cls: "accounting-entry-row" });
    endRow.createEl("label", { text: "\u7ED3\u675F\u65E5\u671F", cls: "accounting-entry-label" });
    const endInput = endRow.createEl("input", { cls: "accounting-entry-input" });
    endInput.type = "date";
    endInput.value = this.schedule.endDate;
    endInput.addEventListener("change", () => this.schedule.endDate = endInput.value);
  }
  accountSelectRow(parent, label, value, includeHidden, onChange, typeFilter) {
    const row = parent.createDiv({ cls: "accounting-entry-row" });
    row.createEl("label", { text: label, cls: "accounting-entry-label" });
    const sel = row.createEl("select", { cls: "accounting-entry-input" });
    const placeholder = sel.createEl("option", { text: "\u8BF7\u9009\u62E9" });
    placeholder.value = "";
    if (!value) placeholder.selected = true;
    fillAccountOptions(sel, this.accounts, value, includeHidden, this.accountTypeSettings, typeFilter);
    sel.addEventListener("change", () => onChange(sel.value));
    if (value) {
      const acc = this.accounts.find((a) => a.id === value);
      if (acc) {
        const bal = this.balancesMap().get(value) ?? 0;
        const hint = parent.createDiv({ cls: "accounting-entry-balance-hint" });
        hint.textContent = `\u5F53\u524D\u4F59\u989D ${formatMoney(bal, acc.currency)}`;
        row.after(hint);
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
    row.createEl("label", { text: "\u5BF9\u65B9", cls: "accounting-entry-label" });
    const ctrl = row.createDiv({ cls: "accounting-entry-control-group" });
    const sel = ctrl.createEl("select", { cls: "accounting-entry-input" });
    const placeholder = sel.createEl("option", { text: "\u8BF7\u9009\u62E9" });
    placeholder.value = "";
    if (!this.state.person) placeholder.selected = true;
    fillAccountOptions(sel, this.accounts, this.state.person, includeHidden, this.accountTypeSettings, "person");
    sel.addEventListener("change", () => {
      this.state.person = sel.value;
      this.rerender();
    });
    const toggle = ctrl.createEl("button", {
      text: this.addingPerson ? "\u53D6\u6D88" : "\uFF0B",
      cls: "accounting-entry-mini-btn"
    });
    toggle.onclick = () => {
      this.addingPerson = !this.addingPerson;
      if (this.addingPerson) this.state.personCurrency = this.accCurrency();
      this.rerender();
    };
    if (this.addingPerson) {
      const addRow = wrap.createDiv({ cls: "accounting-entry-row" });
      addRow.createEl("label", { text: "\u65B0\u5BF9\u65B9", cls: "accounting-entry-label" });
      const addCtrl = addRow.createDiv({ cls: "accounting-entry-control-group" });
      const nameInput = addCtrl.createEl("input", { cls: "accounting-entry-input" });
      nameInput.type = "text";
      nameInput.placeholder = "\u59D3\u540D";
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
        text: "\u6DFB\u52A0",
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
        const tag = out > 0 ? "\u5E94\u6536" : out < 0 ? "\u5E94\u4ED8" : "\u65E0\u5F80\u6765";
        const hint = wrap.createDiv({ cls: "accounting-entry-balance-hint" });
        hint.textContent = `\u5BF9\u65B9\u5F53\u524D ${formatMoney(out, personAcc.currency)}\uFF08${tag}\uFF09`;
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
  /** 对方人账户当前已签余额（>0 应收 / <0 应付），移动端仅新建无需排除本对。 */
  outstandingOf(personId) {
    return this.balancesMap().get(personId) ?? 0;
  }
  /** 收款/还款的「结清」勾选行 + 实时预览（对方未结、差额核销、部分归还后余额）。 */
  renderSettleRow(wrap) {
    const s = this.state;
    const row = wrap.createDiv({ cls: "accounting-entry-row" });
    row.createEl("label", { text: "\u7ED3\u6E05", cls: "accounting-entry-label" });
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
      el.setText("\u8BF7\u5148\u9009\u62E9\u5BF9\u65B9");
      return;
    }
    const outstanding = this.outstandingOf(s.person);
    const pc = this.accounts.find((a) => a.id === s.person)?.currency ?? this.baseCurrency;
    const paid = amountValueOr(s.amount);
    const owe = Math.abs(outstanding);
    const sign = outstanding > 0 ? "\u5E94\u6536" : outstanding < 0 ? "\u5E94\u4ED8" : "\u65E0";
    let text = `\u5BF9\u65B9\u5F53\u524D\u672A\u7ED3 ${formatMoney(owe, pc)}\uFF08${sign}\uFF09`;
    const dirOk = dir === "collect" ? outstanding > 0 : outstanding < 0;
    if (!dirOk && outstanding !== 0) {
      text += `\uFF1B\u65B9\u5411\u4E0E\u672A\u7ED3\u4E0D\u7B26\uFF0C\u8BF7\u6539\u9009${dir === "collect" ? "\u300C\u8FD8\u6B3E\u300D" : "\u300C\u6536\u6B3E\u300D"}`;
    } else if (s.settle) {
      try {
        const o = deriveSettlementDiff(outstanding, paid, dir);
        text += o.kind === "exact" ? "\uFF1B\u6B63\u597D\u7ED3\u6E05\uFF0C\u65E0\u5DEE\u989D" : `\uFF1B\u5DEE\u989D ${formatMoney(o.amount, pc)} \u8BB0\u4E3A\u3010${o.category}\xB7${o.type === "expense" ? "\u652F\u51FA" : "\u6536\u5165"}\u3011\uFF0C\u5BF9\u65B9\u6E05\u96F6`;
      } catch {
      }
    } else {
      const after = outstanding > 0 ? outstanding - paid : outstanding + paid;
      text += `\uFF1B\u90E8\u5206\u5F52\u8FD8\u540E\u5BF9\u65B9\u4F59\u989D ${formatMoney(round2(after), pc)}`;
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
    if (outstanding === 0) return "\u8BE5\u5F80\u6765\u5F53\u524D\u65E0\u672A\u7ED3\u4F59\u989D";
    if (direction === "collect") return "\u5BF9\u65B9\u662F\u5E94\u4ED8\uFF08\u6211\u6B20\u5BF9\u65B9\uFF09\uFF0C\u8BF7\u6539\u9009\u300C\u8FD8\u6B3E\u300D";
    return "\u5BF9\u65B9\u662F\u5E94\u6536\uFF08\u5BF9\u65B9\u6B20\u6211\uFF09\uFF0C\u8BF7\u6539\u9009\u300C\u6536\u6B3E\u300D";
  }
  /** 结清对写入：方向/符号校验 → saveSettlement（派生前 ensureCategories + core 共享构造）。 */
  async submitSettlement(amount, direction) {
    const s = this.state;
    const outstanding = this.outstandingOf(s.person);
    try {
      deriveSettlementDiff(outstanding, amount, direction);
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
      note: s.note.trim() || void 0,
      tags: parseTagsInput(s.tags)
    };
    try {
      await saveSettlement(this.adapter, this.accounts, this.categories, {
        collect,
        outstanding,
        paid: amount,
        direction
      });
    } catch (e) {
      this.showError("\u4FDD\u5B58\u5931\u8D25\uFF1A" + (e instanceof Error ? e.message : String(e)));
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
      this.showError("\u8BF7\u8F93\u5165\u5927\u4E8E 0 \u7684\u91D1\u989D");
      return;
    }
    const amount = round2(amtRes.value);
    const entryCurrency = this.amountCurrency();
    const rateRes = evaluateAmount(s.rate);
    const rateVal = rateRes.ok && rateRes.value > 0 ? round2(rateRes.value) : void 0;
    if (!this.schedule.name.trim()) {
      this.showError("\u8BF7\u586B\u5199\u89C4\u5219\u540D\u79F0");
      return;
    }
    if (s.type === "expense" || s.type === "income") {
      if (!s.account) return this.showError("\u8BF7\u9009\u62E9\u8D26\u6237");
      if (!s.category) return this.showError("\u8BF7\u9009\u62E9\u5206\u7C7B");
    } else if (s.type === "transfer") {
      if (!s.fromAccount) return this.showError("\u8BF7\u9009\u62E9\u8F6C\u51FA\u8D26\u6237");
      if (!s.toAccount) return this.showError("\u8BF7\u9009\u62E9\u8F6C\u5165\u8D26\u6237");
      if (s.fromAccount === s.toAccount) return this.showError("\u8F6C\u51FA\u4E0E\u8F6C\u5165\u8D26\u6237\u4E0D\u80FD\u76F8\u540C");
    } else {
      if (!s.account) return this.showError("\u8BF7\u9009\u62E9\u5DF1\u65B9\u8D26\u6237");
      if (!s.person) return this.showError("\u8BF7\u9009\u62E9\u6216\u65B0\u5EFA\u5BF9\u65B9");
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
        note: s.note,
        tags: parseTagsInput(s.tags)
      },
      this.schedule,
      this.recurring?.editing
    );
    const err = validateRecurringRule(rule);
    if (err) return this.showError(err);
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
      new import_obsidian5.Notice(
        generated.length > 0 ? `\u5DF2\u4FDD\u5B58\u89C4\u5219\u5E76\u751F\u6210 ${generated.length} \u7B14\u5230\u671F\u4EA4\u6613` : "\u5DF2\u4FDD\u5B58\u89C4\u5219\uFF08\u6682\u65E0\u5230\u671F\u4EA4\u6613\uFF09"
      );
    } catch (e) {
      return this.showError(`\u4FDD\u5B58\u89C4\u5219\u5931\u8D25\uFF1A${e}`);
    }
    if (this.onRecurringSaved) this.onRecurringSaved();
    else this.onSubmitted();
    this.close();
  }
  async submit() {
    const s = this.state;
    const amtRes = evaluateAmount(s.amount);
    if (!amtRes.ok || amtRes.value <= 0) {
      this.showError("\u8BF7\u8F93\u5165\u5927\u4E8E 0 \u7684\u91D1\u989D");
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
      note: s.note.trim() || void 0,
      tags: parseTagsInput(s.tags)
    };
    if (s.type === "expense" || s.type === "income") {
      if (!s.account) return this.showError("\u8BF7\u9009\u62E9\u8D26\u6237");
      if (!s.category) return this.showError("\u8BF7\u9009\u62E9\u5206\u7C7B");
      base.account = s.account;
      base.category = s.category;
      if (entryCurrency !== this.baseCurrency) base.rate = rateVal;
    } else if (s.type === "transfer") {
      if (!s.fromAccount) return this.showError("\u8BF7\u9009\u62E9\u8F6C\u51FA\u8D26\u6237");
      if (!s.toAccount) return this.showError("\u8BF7\u9009\u62E9\u8F6C\u5165\u8D26\u6237");
      if (s.fromAccount === s.toAccount) return this.showError("\u8F6C\u51FA\u4E0E\u8F6C\u5165\u8D26\u6237\u4E0D\u80FD\u76F8\u540C");
      if (this.fromCurrency() !== this.toCurrency()) {
        if (toAmountVal == null) return this.showError("\u8DE8\u5E01\u79CD\u8F6C\u8D26\u9700\u586B\u5199\u8F6C\u5165\u8D26\u6237\u5E01\u79CD\u7684\u5B9E\u5230\u91D1\u989D");
        base.toAmount = toAmountVal;
      }
      base.fromAccount = s.fromAccount;
      base.toAccount = s.toAccount;
    } else {
      if (!s.account) return this.showError("\u8BF7\u9009\u62E9\u5DF1\u65B9\u8D26\u6237");
      if (!s.person) return this.showError("\u8BF7\u9009\u62E9\u6216\u65B0\u5EFA\u5BF9\u65B9");
      if ((s.direction === "collect" || s.direction === "repay") && s.settle) {
        return this.submitSettlement(amount, s.direction);
      }
      base.account = s.account;
      base.person = s.person;
      base.direction = s.direction;
      if (entryCurrency !== this.baseCurrency) base.rate = rateVal;
    }
    const now = nowISO();
    const ev = { ...base, op: "upsert", createdAt: now, updatedAt: now, source: "manual" };
    await this.adapter.appendEvents([ev]);
    this.onSubmitted();
    this.close();
  }
  /** 顶部账本别名点击：弹出账本切换浮层，选定后关闭当前弹窗并由插件重开记一笔。 */
  async openLedgerSwitcher() {
    try {
      const adapter = this.adapter;
      const names = await adapter.listLedgers();
      const ledgers = await Promise.all(
        names.map(async (name) => ({ name, alias: await adapter.readLedgerAlias(name) }))
      );
      new LedgerSwitchModal(
        this.app,
        adapter.activeLedger,
        ledgers,
        (name) => {
          this.close();
          this.onSwitchLedger?.(name);
        }
      ).open();
    } catch {
    }
  }
  /** 直接移除弹窗，绕过 Obsidian 默认的关闭动画（下滑消失），复刻 TransactionDetailModal 模式。 */
  close() {
    if (this.closing) return;
    this.closing = true;
    if (this.opened) {
      try {
        this.onClose();
      } catch (e) {
        console.error(e);
      }
      this.containerEl.detach();
    } else {
      super.close();
    }
  }
  onClose() {
    this.keyboardAvoidance?.dispose();
    this.keyboardAvoidance = void 0;
    this.contentEl.removeEventListener("click", this.handleOutsideClick);
    this.contentEl.style.maxHeight = "";
    this.contentEl.empty();
  }
};
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
    contentEl.createEl("h2", { text: "\u5207\u6362\u8D26\u672C" });
    if (this.ledgers.length === 0) {
      contentEl.createEl("p", { text: "\u672A\u627E\u5230\u53EF\u7528\u8D26\u672C\uFF0C\u8BF7\u5728\u684C\u9762\u7AEF\u521B\u5EFA\u8D26\u672C", cls: "accounting-ledger-empty" });
      const emptyCloseWrap = contentEl.createDiv({ cls: "accounting-modal-close" });
      const emptyClose = emptyCloseWrap.createEl("button", { text: "\u5173\u95ED", cls: "accounting-btn-secondary" });
      emptyClose.onclick = () => this.close();
      return;
    }
    const card = contentEl.createDiv({ cls: "accounting-ledger-card" });
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
      info.createEl("div", { text: name, cls: "accounting-ledger-folder" });
      if (isCurrent) {
        item.createEl("span", { text: "\u5F53\u524D", cls: "accounting-ledger-badge" });
      } else {
        item.createEl("span", { text: "\u203A", cls: "accounting-ledger-chevron" });
        item.onclick = () => {
          this.close();
          this.onPick(name);
        };
      }
    }
    const closeWrap = contentEl.createDiv({ cls: "accounting-modal-close" });
    const closeBtn = closeWrap.createEl("button", { text: "\u5173\u95ED", cls: "accounting-btn-secondary" });
    closeBtn.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/transactionDetailModal.ts
var TransactionDetailModal = class extends import_obsidian6.Modal {
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
    if (!import_obsidian6.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
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
  /** 滑下后再摘除容器，与开启的滑上对称（div transform 在 WKWebView 可靠）。 */
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
        this.onClose();
      } catch (e) {
        console.error(e);
      }
      this.containerEl.detach();
    }, 200);
  }
  renderView() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createDiv({ cls: "accounting-detail-grabber" });
    const titleRow = contentEl.createDiv({ cls: "accounting-detail-title-row" });
    titleRow.createEl("h2", { text: "\u6D41\u6C34\u8BE6\u60C5" });
    this.renderDetailView();
  }
  /** 编辑/复制/删除后就地刷新背后的列表实例（筛选拟保留）。 */
  afterDetailChange() {
    this.onUpdated();
  }
  renderDetailView() {
    const { contentEl } = this;
    const tx = this.state;
    this.snapshot = computeBalancesUpTo(this.allTransactions, this.accounts, tx.id);
    const detailEl = contentEl.createDiv({ cls: "accounting-detail-content" });
    this.addRow(detailEl, "\u7C7B\u578B", this.typeLabel(tx.type));
    this.addRow(detailEl, "\u65F6\u95F4", this.formatTime(tx.ts));
    this.addRow(detailEl, "\u91D1\u989D", formatMoney(tx.amount, tx.currency));
    if (tx.rate != null && tx.currency !== this.baseCurrency) {
      this.addRow(detailEl, "\u6C47\u7387", `1 ${tx.currency} = ${tx.rate} ${this.baseCurrency}`);
      this.addRow(detailEl, `\u6298\u7B97 ${this.baseCurrency}`, formatMoney(txBaseAmount(tx, this.baseCurrency), this.baseCurrency));
    }
    if (tx.type === "transfer" && tx.toAmount != null) {
      const fromCur = this.accounts.find((a) => a.id === tx.fromAccount)?.currency ?? this.baseCurrency;
      const toCur = this.accounts.find((a) => a.id === tx.toAccount)?.currency ?? this.baseCurrency;
      this.addRow(detailEl, "\u8F6C\u5165\u91D1\u989D", formatMoney(tx.toAmount, toCur));
      if (fromCur !== toCur && tx.amount > 0) {
        this.addRow(detailEl, "\u9690\u542B\u6C47\u7387", `1 ${fromCur} = ${round2(tx.toAmount / tx.amount)} ${toCur}`);
      }
    }
    if (tx.type === "expense" || tx.type === "income") {
      this.addRow(detailEl, "\u8D26\u6237", this.accountNameWithBalance(tx.account));
      this.addRow(detailEl, "\u5206\u7C7B", tx.category || "");
    } else if (tx.type === "transfer") {
      this.addRow(detailEl, "\u8F6C\u51FA\u8D26\u6237", this.accountNameWithBalance(tx.fromAccount));
      this.addRow(detailEl, "\u8F6C\u5165\u8D26\u6237", this.accountNameWithBalance(tx.toAccount));
    } else if (tx.type === "loan") {
      this.addRow(detailEl, "\u65B9\u5411", this.directionLabel(tx.direction));
      this.addRow(detailEl, "\u5DF1\u65B9\u8D26\u6237", this.accountNameWithBalance(tx.account));
      this.addRow(detailEl, "\u5BF9\u65B9", this.accountNameWithBalance(tx.person));
    }
    if (tx.tags && tx.tags.length > 0) {
      this.addRow(detailEl, "\u6807\u7B7E", tx.tags.map((t) => `#${t}`).join(" "));
    }
    if (tx.note) {
      this.addRow(detailEl, "\u5907\u6CE8", tx.note);
    }
    const btnRow = contentEl.createDiv({ cls: "accounting-detail-buttons" });
    btnRow.createEl("button", { text: "\u7F16\u8F91", cls: "accounting-btn-secondary" }).onclick = () => {
      if (this.isSettlementLoan()) {
        alert("\u6536\u6B3E/\u8FD8\u6B3E\uFF08\u7ED3\u6E05\uFF09\u6D41\u6C34\u8BF7\u5728\u684C\u9762\u7AEF\u7F16\u8F91\uFF0C\u79FB\u52A8\u7AEF\u6682\u4E0D\u652F\u6301\u3002");
        return;
      }
      this.close();
      new EntryModal(
        this.app,
        this.adapter,
        this.accounts,
        this.categories,
        () => this.afterDetailChange(),
        this.state,
        false,
        this.navCtx
      ).open();
    };
    btnRow.createEl("button", { text: "\u590D\u5236", cls: "accounting-btn-secondary" }).onclick = () => {
      if (this.isSettlementLoan()) {
        alert("\u6536\u6B3E/\u8FD8\u6B3E\uFF08\u7ED3\u6E05\uFF09\u6D41\u6C34\u8BF7\u5728\u684C\u9762\u7AEF\u590D\u5236\uFF0C\u79FB\u52A8\u7AEF\u6682\u4E0D\u652F\u6301\u3002");
        return;
      }
      this.close();
      new EntryModal(
        this.app,
        this.adapter,
        this.accounts,
        this.categories,
        () => this.afterDetailChange(),
        this.state,
        true,
        this.navCtx
      ).open();
    };
    btnRow.createEl("button", {
      text: "\u5220\u9664",
      cls: "accounting-btn-danger"
    }).onclick = async () => {
      await this.deleteTransaction();
    };
    btnRow.createEl("button", { text: "\u5173\u95ED", cls: "accounting-btn-secondary accounting-detail-sheet-close" }).onclick = () => this.close();
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
    if (!confirm("\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u6761\u6D41\u6C34\u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002")) {
      return;
    }
    const now = nowISO();
    const idsToDelete = [this.state.id];
    if (this.state.linkId) {
      try {
        const folded = foldEvents(await this.adapter.loadLog());
        const partner = folded.find((t) => t.linkId === this.state.linkId && t.id !== this.state.id);
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
      this.showError("\u5220\u9664\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5");
    }
  }
  directionLabel(d) {
    switch (d) {
      case "lend":
        return "\u501F\u51FA\uFF08\u5BF9\u65B9\u6B20\u6211\uFF09";
      case "borrow":
        return "\u501F\u5165\uFF08\u6211\u6B20\u5BF9\u65B9\uFF09";
      case "collect":
        return "\u6536\u6B3E\uFF08\u6536\u56DE\u501F\u51FA\uFF09";
      case "repay":
        return "\u8FD8\u6B3E\uFF08\u5F52\u8FD8\u501F\u5165\uFF09";
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
      expense: "\u652F\u51FA",
      income: "\u6536\u5165",
      transfer: "\u8F6C\u8D26",
      loan: "\u501F\u8D37"
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
    return `${name}\uFF08\u4F59\u989D ${formatMoney(bal, this.accountCurrency(id))}\uFF09`;
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
  { value: "time-desc", label: "\u65F6\u95F4 \u65B0\u2192\u65E7" },
  { value: "time-asc", label: "\u65F6\u95F4 \u65E7\u2192\u65B0" },
  { value: "amount-desc", label: "\u91D1\u989D \u9AD8\u2192\u4F4E" },
  { value: "amount-asc", label: "\u91D1\u989D \u4F4E\u2192\u9AD8" }
];
var PAGE_SIZE = 50;
var TransactionListModal = class extends import_obsidian7.Modal {
  constructor(app, adapter, presetAccountId, navCtx, slide, presetRecurringRuleId, drillDown, categoryDrill, onDataChanged) {
    super(app);
    this.adapter = adapter;
    this.navCtx = navCtx;
    this.slide = slide;
    this.drillDown = drillDown;
    this.categoryDrill = categoryDrill;
    this.onDataChanged = onDataChanged;
    const hasCategoryPreset = !!categoryDrill;
    const hasPreset = !!presetAccountId || !!presetRecurringRuleId || hasCategoryPreset;
    this.filter = {
      // preset 跳转（账户、周期账规则、报表分类）：使用传入范围或默认全部历史；否则默认近1月
      // 结束日 = 当天，配合「整天包含」语义把今天完整包进来
      start: categoryDrill?.start ?? (hasPreset ? "1970-01-01" : monthsAgoDateInput(1)),
      end: categoryDrill?.end ?? todayDateInput(),
      types: categoryDrill ? [categoryDrill.flow] : [],
      keyword: "",
      accountId: presetAccountId ?? "",
      recurringRuleId: presetRecurringRuleId ?? "",
      category: categoryDrill?.uncategorized ? "" : categoryDrill?.category ?? "",
      uncategorized: categoryDrill?.uncategorized ?? false,
      quickActive: hasCategoryPreset ? null : hasPreset ? "all" : "month",
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
  opened = false;
  closing = false;
  renderedCount = 0;
  listEl = null;
  sentinelEl = null;
  loadMoreObserver = null;
  selectMode = false;
  selectedIds = /* @__PURE__ */ new Set();
  updatedAtById = /* @__PURE__ */ new Map();
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
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("accounting-transaction-modal");
    const sc = slideClass(this.slide);
    if (sc) contentEl.addClass(sc);
    try {
      const events = await this.adapter.loadLog();
      this.updatedAtById = latestUpdatedAtById(events);
      this.transactions = foldEvents(events);
      const meta = await this.adapter.readMeta();
      this.accounts = meta.accounts;
      this.categories = meta.categories;
      this.recurringRules = await this.adapter.readRecurringRules();
      const storedTypes = await this.adapter.readAccountTypeSettings();
      this.accountTypeSettings = storedTypes ? normalizeAccountTypeSettings(storedTypes) : defaultAccountTypeSettings();
      if (this.transactions.length === 0) {
        this.renderNav();
        contentEl.createEl("h2", { text: "\u6D41\u6C34" });
        contentEl.createEl("div", {
          text: "\u6682\u65E0\u6D41\u6C34\u8BB0\u5F55\u3002",
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
      contentEl.createEl("h2", { text: "\u6D41\u6C34" });
      contentEl.createEl("div", {
        text: "\u8BFB\u53D6\u6570\u636E\u5931\u8D25\uFF1A\u8BF7\u5728\u684C\u9762\u7AEF\u521D\u59CB\u5316\u8D26\u672C\uFF0C\u6216\u68C0\u67E5\u63D2\u4EF6\u8BBE\u7F6E\u7684\u300C\u6570\u636E\u5B50\u76EE\u5F55\u300D\u3002",
        cls: "accounting-empty"
      });
      contentEl.createEl("div", {
        text: `\u9519\u8BEF\u8BE6\u60C5\uFF1A${err instanceof Error ? err.message : String(err)}`,
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
    timeRow.createSpan({ text: "\u65F6\u95F4\u8303\u56F4", cls: "accounting-filter-label" });
    const timeControls = timeRow.createDiv({ cls: "accounting-filter-controls" });
    const quickOptions = [
      { key: "month", label: "\u8FD11\u6708", start: monthsAgoDateInput(1) },
      { key: "quarter", label: "\u8FD13\u6708", start: monthsAgoDateInput(3) },
      { key: "halfYear", label: "\u8FD16\u6708", start: monthsAgoDateInput(6) },
      { key: "all", label: "\u5168\u90E8", start: "1970-01-01" }
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
    const startInput = dateRangeWrap.createEl("input", {
      type: "date",
      value: this.filter.start
    });
    startInput.addEventListener("change", (e) => {
      this.filter.start = e.target.value;
      this.filter.quickActive = null;
      this.applyFilter();
      this.render();
    });
    dateRangeWrap.createSpan({ text: "\u2013" });
    const endInput = dateRangeWrap.createEl("input", {
      type: "date",
      value: this.filter.end
    });
    endInput.addEventListener("change", (e) => {
      this.filter.end = e.target.value;
      this.filter.quickActive = null;
      this.applyFilter();
      this.render();
    });
    const typeRow = filterBox.createDiv({ cls: "accounting-filter-row" });
    typeRow.createSpan({ text: "\u4EA4\u6613\u7C7B\u578B", cls: "accounting-filter-label" });
    const typeWrap = typeRow.createDiv({ cls: "accounting-filter-controls" });
    const types = [
      { key: "expense", label: "\u652F\u51FA" },
      { key: "income", label: "\u6536\u5165" },
      { key: "transfer", label: "\u8F6C\u8D26" },
      { key: "loan", label: "\u501F\u8D37" }
    ];
    const allBtn = typeWrap.createEl("button", {
      text: "\u5168\u90E8",
      cls: `accounting-filter-type-btn${this.filter.types.length === 0 ? " accounting-filter-btn-active" : ""}`
    });
    allBtn.onclick = () => {
      this.filter.types = [];
      this.applyFilter();
      this.render();
    };
    for (const t of types) {
      const active = this.filter.types.includes(t.key);
      const btn = typeWrap.createEl("button", {
        text: t.label,
        cls: `accounting-filter-type-btn${active ? " accounting-filter-btn-active" : ""}`
      });
      btn.onclick = () => {
        if (active) {
          this.filter.types = this.filter.types.filter((x) => x !== t.key);
        } else {
          this.filter.types.push(t.key);
        }
        this.applyFilter();
        this.render();
      };
    }
    const comboRow = filterBox.createDiv({ cls: "accounting-filter-row" });
    comboRow.createSpan({ text: "\u8D26\u6237/\u5907\u6CE8", cls: "accounting-filter-label" });
    const comboControls = comboRow.createDiv({ cls: "accounting-filter-controls" });
    const accountSelect = comboControls.createEl("select", { cls: "accounting-filter-account-select" });
    const allOpt = accountSelect.createEl("option", { text: "\u5168\u90E8\u8D26\u6237" });
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
      placeholder: "\u5907\u6CE8/\u6807\u7B7E\u641C\u7D22...",
      cls: "accounting-search-input"
    });
    keywordInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.filter.keyword = e.target.value;
        this.applyFilter();
        this.render();
      }
    });
    const keywordClear = searchWrap.createEl("button", {
      text: "\xD7",
      cls: `accounting-search-clear${this.filter.keyword ? "" : " accounting-search-clear-hidden"}`
    });
    keywordClear.setAttribute("aria-label", "\u6E05\u9664\u5907\u6CE8\u641C\u7D22");
    keywordClear.onclick = () => {
      keywordInput.value = "";
      this.filter.keyword = "";
      this.applyFilter();
      this.render();
    };
    if (this.hasActiveFilter()) {
      const clearAllBtn = comboControls.createEl("button", {
        text: "\u6E05\u9664",
        cls: "accounting-filter-clear-all"
      });
      clearAllBtn.setAttribute("aria-label", "\u6E05\u9664\u6240\u6709\u7B5B\u9009");
      clearAllBtn.onclick = () => {
        this.resetFilter();
        this.applyFilter();
        this.render();
      };
    }
    if (this.filter.recurringRuleId) {
      const ruleName = this.recurringRules.find((r) => r.id === this.filter.recurringRuleId)?.name ?? "\u5468\u671F\u8D26\u89C4\u5219";
      filterBox.createDiv({
        text: `\u{1F4CB} \u5468\u671F\u8D26\uFF1A${ruleName} \xB7 ${this.filteredTransactions.length} \u7B14`,
        cls: "accounting-recurring-stats"
      });
    }
    if (this.filter.category || this.filter.uncategorized) {
      const catName = this.filter.uncategorized ? "(\u672A\u5206\u7C7B)" : this.filter.category;
      filterBox.createDiv({
        text: `\u{1F3F7}\uFE0F \u5206\u7C7B\uFF1A${catName} \xB7 ${this.filteredTransactions.length} \u7B14`,
        cls: "accounting-recurring-stats"
      });
    }
  }
  /** 排序栏：独立于筛选卡片（排序是 ordering 而非筛选维度），置于卡片下方、「排序」+下拉同一行；弱化样式。 */
  renderSortBar(container) {
    const bar = container.createDiv({ cls: "accounting-sort-bar" });
    bar.createSpan({ text: "\u6392\u5E8F", cls: "accounting-sort-label" });
    const cur = SORT_OPTIONS.find((o) => o.value === this.filter.sort)?.label ?? "";
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
      text: this.selectMode ? "\u5B8C\u6210" : "\u9009\u62E9",
      cls: "accounting-batch-toggle"
    });
    selectBtn.onclick = () => {
      this.selectMode = !this.selectMode;
      if (!this.selectMode) this.selectedIds.clear();
      this.render();
    };
  }
  /** 多选操作栏：全选（覆盖全部 filtered）· 取消 · 已选 N 条 · 批量修改/删除；操作组 margin-left:auto 固定靠右。 */
  renderBatchBar(container) {
    const bar = container.createDiv({ cls: "accounting-batch-bar" });
    const selected = this.selectedTxs();
    const typeSet = new Set(selected.map((t) => t.type));
    const canBatch = selected.length > 0 && typeSet.size === 1;
    const allBtn = bar.createEl("button", { text: "\u5168\u9009", cls: "accounting-batch-sec" });
    allBtn.onclick = () => {
      this.selectedIds = new Set(this.filteredTransactions.map((t) => t.id));
      this.render();
    };
    const clearBtn = bar.createEl("button", { text: "\u53D6\u6D88", cls: "accounting-batch-sec" });
    clearBtn.onclick = () => {
      this.selectedIds.clear();
      this.render();
    };
    bar.createSpan({ text: `\u5DF2\u9009 ${selected.length} \u6761`, cls: "accounting-batch-count" });
    const batchBtn = bar.createEl("button", {
      text: "\u6279\u91CF\u4FEE\u6539",
      cls: `accounting-batch-go${canBatch ? "" : " accounting-batch-go-disabled"}`
    });
    if (!canBatch) {
      batchBtn.setAttribute("disabled", "true");
      batchBtn.setAttribute("title", typeSet.size > 1 ? "\u6279\u91CF\u4FEE\u6539\u4EC5\u652F\u6301\u540C\u7C7B\u578B\u8BB0\u5F55" : "\u8BF7\u5148\u9009\u62E9\u8BB0\u5F55");
    } else {
      batchBtn.onclick = () => this.openBatchModify();
    }
    const delDisabled = selected.length === 0;
    const delBtn = bar.createEl("button", {
      text: "\u6279\u91CF\u5220\u9664",
      cls: delDisabled ? "accounting-batch-go accounting-batch-go-disabled" : "accounting-batch-go accounting-batch-go-danger"
    });
    if (delDisabled) {
      delBtn.setAttribute("disabled", "true");
      delBtn.setAttribute("title", "\u8BF7\u5148\u9009\u62E9\u8BB0\u5F55");
    } else {
      delBtn.onclick = () => this.openBatchDelete();
    }
  }
  /** 选中集合对应的 Transaction[]（按 filteredTransactions 顺序，保证稳定）。 */
  selectedTxs() {
    if (this.selectedIds.size === 0) return [];
    return this.filteredTransactions.filter((t) => this.selectedIds.has(t.id));
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
    const selected = this.selectedTxs();
    if (selected.length === 0) return;
    const ids = /* @__PURE__ */ new Set();
    let partnerExtra = 0;
    for (const t of selected) {
      ids.add(t.id);
      if (t.linkId) {
        const partner = this.transactions.find((x) => x.linkId === t.linkId && x.id !== t.id);
        if (partner && !ids.has(partner.id)) {
          ids.add(partner.id);
          partnerExtra++;
        }
      }
    }
    const total = ids.size;
    const msg = partnerExtra > 0 ? `\u5C06\u5220\u9664\u9009\u4E2D\u7684 ${selected.length} \u7B14\u6D41\u6C34\uFF08\u542B\u7ED3\u6E05\u6D41\u6C34\uFF0C\u8FDE\u540C\u5BF9\u7AEF\u5171\u5220\u9664 ${total} \u7B14\uFF09\u3002\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF0C\u786E\u5B9A\uFF1F` : `\u5C06\u5220\u9664\u9009\u4E2D\u7684 ${selected.length} \u7B14\u6D41\u6C34\u3002\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF0C\u786E\u5B9A\uFF1F`;
    if (!confirm(msg)) return;
    try {
      await this.adapter.backup("pre-batch-delete");
      const fresh = await this.adapter.loadLog();
      const latestUpdatedAt = latestUpdatedAtById(fresh);
      for (const id of ids) {
        if (hasUpdatedSince(latestUpdatedAt.get(id), this.updatedAtById.get(id) ?? "")) {
          new import_obsidian7.Notice("\u6240\u9009\u8BB0\u5F55\u5DF2\u88AB\u53E6\u4E00\u7AEF\u66F4\u65B0\uFF0C\u5DF2\u5237\u65B0\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u5E76\u91CD\u8BD5");
          await this.reloadAndRender();
          return;
        }
      }
      const now = nowISO();
      const events = [...ids].map((id) => ({ op: "delete", targetId: id, updatedAt: now, source: "manual" }));
      await this.adapter.appendEvents(events);
      new import_obsidian7.Notice(`\u5DF2\u5220\u9664 ${events.length} \u6761`);
      await this.onBatchDone();
    } catch (e) {
      const m = "\u6279\u91CF\u5220\u9664\u5931\u8D25\uFF1A" + (e instanceof Error ? e.message : String(e));
      new import_obsidian7.Notice(m);
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
        text: opt.label
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
        text: this.filter.recurringRuleId ? "\u8BE5\u89C4\u5219\u6682\u672A\u751F\u6210\u4EA4\u6613" : "\u6CA1\u6709\u7B26\u5408\u6761\u4EF6\u7684\u6D41\u6C34\u3002",
        cls: "accounting-empty"
      });
      return;
    }
    this.renderedCount = 0;
    this.appendChunk();
    if (this.renderedCount < this.filteredTransactions.length) {
      this.setupInfiniteScroll();
    }
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
    const sentinel = listEl.createDiv({ cls: "accounting-load-more", text: "\u52A0\u8F7D\u66F4\u591A\u2026" });
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
    this.sentinelEl = null;
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
    left.createEl("div", {
      text: this.formatTime(tx.ts),
      cls: "accounting-tx-time"
    });
    const middle = row.createDiv({ cls: "accounting-tx-middle" });
    middle.createEl("div", { text: this.formatDetail(tx), cls: "accounting-tx-detail" });
    if (tx.tags && tx.tags.length > 0) {
      middle.createEl("div", { text: tx.tags.map((t) => `#${t}`).join(" "), cls: "accounting-tx-note" });
    }
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
    return f.types.length > 0 || !!f.accountId || !!f.keyword || !!f.recurringRuleId || !!f.category || f.uncategorized || f.quickActive !== "month" || f.start !== monthsAgoDateInput(1) || f.end !== todayDateInput();
  }
  /** 重置所有筛选项到默认（近1月 + 全部类型/账户 + 无关键词 + 无周期账；对齐桌面 clearAll）。 */
  resetFilter() {
    this.filter = {
      start: monthsAgoDateInput(1),
      end: todayDateInput(),
      types: [],
      keyword: "",
      accountId: "",
      recurringRuleId: "",
      category: "",
      uncategorized: false,
      quickActive: "month",
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
  async reloadAndRender() {
    try {
      const events = await this.adapter.loadLog();
      this.updatedAtById = latestUpdatedAtById(events);
      this.transactions = foldEvents(events);
      const meta = await this.adapter.readMeta();
      this.accounts = meta.accounts;
      this.categories = meta.categories;
      this.recurringRules = await this.adapter.readRecurringRules();
      const storedTypes = await this.adapter.readAccountTypeSettings();
      this.accountTypeSettings = storedTypes ? normalizeAccountTypeSettings(storedTypes) : defaultAccountTypeSettings();
      this.applyFilter();
      this.render();
      this.onDataChanged?.();
    } catch (err) {
      console.error("\u91CD\u65B0\u52A0\u8F7D\u6D41\u6C34\u5931\u8D25:", err);
    }
  }
  typeLabel(type) {
    const labels = {
      expense: "\u652F\u51FA",
      income: "\u6536\u5165",
      transfer: "\u8F6C\u8D26",
      loan: "\u501F\u8D37"
    };
    return labels[type];
  }
  formatTime(iso) {
    const d = new Date(iso);
    const pad = (x) => String(x).padStart(2, "0");
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  formatDetail(tx) {
    const accountName = (id) => {
      if (!id) return "";
      const acc = this.accounts.find((a) => a.id === id);
      return acc ? acc.name : id;
    };
    switch (tx.type) {
      case "expense":
      case "income":
        return `${accountName(tx.account)} \xB7 ${tx.category || ""}`;
      case "transfer":
        return `${accountName(tx.fromAccount)} \u2192 ${accountName(tx.toAccount)}`;
      case "loan": {
        const dir = tx.direction === "lend" ? "\u501F\u51FA" : tx.direction === "borrow" ? "\u501F\u5165" : tx.direction === "collect" ? "\u6536\u6B3E" : "\u8FD8\u6B3E";
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
    const cashIn = tx.direction === "borrow" || tx.direction === "collect";
    return cashIn ? "accounting-amount-positive" : "accounting-amount-negative";
  }
  /** 直接移除弹窗，绕过 Obsidian 默认关闭动画（与 Entry/Detail 一致），保证导航切换即时无动画。 */
  close() {
    if (this.closing) return;
    this.closing = true;
    if (this.opened) {
      try {
        this.onClose();
      } catch (e) {
        console.error(e);
      }
      this.containerEl.detach();
    } else {
      super.close();
    }
  }
  onClose() {
    this.closeSortMenu();
    this.teardownObserver();
    this.contentEl.empty();
  }
};

// src/balanceModal.ts
var import_obsidian13 = require("obsidian");

// src/adjustBalanceModal.ts
var import_obsidian8 = require("obsidian");
var AdjustBalanceModal = class extends import_obsidian8.Modal {
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
  selectedCategory = ADJUST_CATEGORY;
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian8.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.addClass("accounting-adjust-modal");
    const titleRow = contentEl.createDiv({ cls: "accounting-adjust-title-row" });
    titleRow.createEl("div", {
      text: `\u8C03\u6574\u300C${this.account.name}\u300D\u4F59\u989D`,
      cls: "accounting-adjust-title"
    });
    appendHeaderHelp(titleRow, {
      detail: "\u63D0\u4EA4\u540E\u6309\u300C\u76EE\u6807\u4F59\u989D \u2212 \u5F53\u524D\u4F59\u989D\u300D\u8BB0\u4E00\u6761\u5DEE\u989D\u6D41\u6C34\uFF08\u6536\u5165\u6216\u652F\u51FA\uFF09\uFF1B\u53EF\u5728\u4E0B\u65B9\u6539\u9009\u5206\u7C7B\u3002",
      ariaLabel: "\u67E5\u770B\u8C03\u6574\u4F59\u989D\u8BF4\u660E"
    });
    contentEl.createEl("div", {
      text: `\u5F53\u524D\u4F59\u989D\uFF1A${formatMoney(this.currentBalance, this.account.currency)}`,
      cls: "accounting-adjust-current"
    });
    const targetRow = contentEl.createDiv({ cls: "accounting-adjust-row" });
    targetRow.createEl("label", { text: "\u76EE\u6807\u4F59\u989D", cls: "accounting-adjust-label" });
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
    const noteRow = contentEl.createDiv({ cls: "accounting-adjust-row" });
    noteRow.createEl("label", { text: "\u5907\u6CE8", cls: "accounting-adjust-label" });
    this.noteEl = noteRow.createEl("input", { cls: "accounting-adjust-input" });
    this.noteEl.type = "text";
    this.noteEl.placeholder = "\u53EF\u9009";
    this.noteEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.submit();
      if (e.key === "Escape") this.close();
    });
    const categoryRow = contentEl.createDiv({ cls: "accounting-adjust-row" });
    categoryRow.createEl("label", { text: "\u5206\u7C7B", cls: "accounting-adjust-label" });
    this.categoryEl = categoryRow.createEl("select", { cls: "accounting-adjust-input" });
    this.categoryEl.addEventListener("change", () => {
      this.selectedCategory = this.categoryEl.value;
    });
    this.renderCategoryOptions();
    this.errorEl = contentEl.createDiv();
    const footer = contentEl.createDiv({ cls: "accounting-adjust-footer" });
    const cancel = footer.createEl("button", { text: "\u53D6\u6D88", cls: "accounting-btn-secondary" });
    cancel.onclick = () => this.close();
    const submit = footer.createEl("button", { text: "\u786E\u8BA4\u8C03\u6574", cls: "accounting-btn-primary" });
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
      this.deltaEl.setText("\u5DEE\u989D\u4E3A 0\uFF0C\u65E0\u9700\u8C03\u6574");
    } else if (delta > 0) {
      this.deltaEl.setText(`\u5C06\u8BB0\u4E00\u7B14\u6536\u5165 +${formatMoney(delta, this.account.currency)}`);
    } else {
      this.deltaEl.setText(`\u5C06\u8BB0\u4E00\u7B14\u652F\u51FA ${formatMoney(delta, this.account.currency)}`);
    }
    this.renderCategoryOptions();
  }
  /** 按当前差额方向重算分类下拉可选项；方向翻转时把所选分类回落到「余额调整」 */
  renderCategoryOptions() {
    if (!this.categoryEl) return;
    const res = evaluateAmount(this.targetEl.value);
    const delta = res.ok ? round2(res.value - this.currentBalance) : 0;
    const flow = delta > 0 ? "income" : "expense";
    const opts = adjustCategoryOptions(this.categories, flow);
    this.categoryEl.empty();
    for (const c of opts) {
      const o = this.categoryEl.createEl("option", { text: c.name });
      o.value = c.name;
    }
    this.selectedCategory = resolveAdjustCategory(this.selectedCategory, this.categories, flow);
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
      const existing = next.find((c) => c.flow === f && c.name === ADJUST_CATEGORY);
      if (!existing) {
        next = [...next, { id: newCategoryId(), flow: f, name: ADJUST_CATEGORY }];
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
    if (!targetRaw) return this.showError("\u8BF7\u8F93\u5165\u76EE\u6807\u4F59\u989D");
    const targetRes = evaluateAmount(targetRaw);
    const target = targetRes.ok ? round2(targetRes.value) : Number.NaN;
    if (Number.isNaN(target)) return this.showError("\u8BF7\u8F93\u5165\u6709\u6548\u7684\u4F59\u989D");
    const delta = round2(target - this.currentBalance);
    if (delta === 0) {
      this.close();
      return;
    }
    const category = resolveAdjustCategory(this.selectedCategory, this.categories, delta > 0 ? "income" : "expense");
    if (category === ADJUST_CATEGORY) {
      await this.ensureCategory();
    }
    const userNote = this.noteEl.value.trim();
    const noteText = `${ADJUST_CATEGORY} ${this.currentBalance.toFixed(2)}\u2192${target.toFixed(2)}${userNote ? "\uFF5C" + userNote : ""}`;
    const now = nowISO();
    const ev = {
      op: "upsert",
      id: newTxId(),
      type: delta > 0 ? "income" : "expense",
      ts: nowLocalISO(),
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
      this.showError("\u5199\u5165\u5931\u8D25\uFF1A" + (err instanceof Error ? err.message : String(err)));
    }
  }
  onClose() {
    this.keyboardAvoidance?.dispose();
    this.keyboardAvoidance = void 0;
    this.contentEl.empty();
  }
};

// src/accountActionModal.ts
var import_obsidian11 = require("obsidian");

// src/accountPropertiesModal.ts
var import_obsidian9 = require("obsidian");
var AccountPropertiesModal = class extends import_obsidian9.Modal {
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
    if (!import_obsidian9.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.addClass("accounting-adjust-modal");
    contentEl.createEl("div", { text: `\u8D26\u6237\u5C5E\u6027 \xB7 ${this.account.name}`, cls: "accounting-adjust-title" });
    const nameRow = this.row("\u540D\u79F0");
    this.nameEl = this.input(nameRow, "text");
    const typeRow = this.row("\u7C7B\u578B");
    this.typeEl = this.select(typeRow);
    this.typeEl.onchange = () => this.toggleCredit();
    const openRow = this.row("\u521D\u59CB\u4F59\u989D");
    this.openingEl = this.input(openRow, "number", "0.01");
    const curRow = this.row("\u5E01\u79CD\uFF08\u521B\u5EFA\u540E\u4E0D\u53EF\u6539\uFF09");
    this.currencyEl = this.currencySelect(curRow);
    this.currencyEl.title = "\u5E01\u79CD\u521B\u5EFA\u540E\u4E0D\u53EF\u53D8\u66F4\uFF1B\u5982\u9700\u4FEE\u6B63\u8BF7\u5728\u65E0\u6D41\u6C34\u65F6\u5220\u9664\u8D26\u6237\u91CD\u5EFA";
    const noteRow = this.row("\u5907\u6CE8");
    this.noteEl = this.input(noteRow, "text");
    this.creditBlockEl = contentEl.createDiv({ cls: "accounting-credit-block" });
    const clRow = this.row("\u4FE1\u7528\u989D\u5EA6", this.creditBlockEl);
    this.creditLimitEl = this.input(clRow, "number", "0.01");
    const bdRow = this.row("\u8D26\u5355\u65E5", this.creditBlockEl);
    this.billingDayEl = this.input(bdRow, "number");
    this.billingDayEl.min = "1";
    this.billingDayEl.max = "31";
    this.billingDayEl.placeholder = "1-31";
    const rdRow = this.row("\u8FD8\u6B3E\u65E5", this.creditBlockEl);
    this.repaymentEl = this.input(rdRow, "number");
    this.repaymentEl.min = "1";
    this.repaymentEl.max = "31";
    this.repaymentEl.placeholder = "1-31";
    contentEl.createEl("div", {
      text: `\u521B\u5EFA\uFF1A${fmtTime(this.account.createdAt)}\u3000\xB7\u3000\u4FEE\u6539\uFF1A${fmtTime(this.account.updatedAt)}`,
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
    for (const t of this.accountTypeSettings.types) {
      el.createEl("option", { text: t.label, value: t.type });
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
      const cancel = this.footerEl.createEl("button", { text: "\u53D6\u6D88", cls: "accounting-btn-secondary" });
      cancel.onclick = () => this.cancelEdit();
      const save = this.footerEl.createEl("button", { text: "\u4FDD\u5B58", cls: "accounting-btn-primary" });
      save.onclick = () => void this.submit();
    } else {
      const close = this.footerEl.createEl("button", { text: "\u5173\u95ED", cls: "accounting-btn-secondary" });
      close.onclick = () => this.close();
      const edit = this.footerEl.createEl("button", { text: "\u7F16\u8F91", cls: "accounting-btn-primary" });
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
      new import_obsidian9.Notice("\u5DF2\u4FDD\u5B58\u8D26\u6237\u5C5E\u6027");
      this.account = updated;
      this.onSaved();
      this.refillFrom(this.account);
      this.setEditable(false);
      this.renderFooter();
      this.keyboardAvoidance?.reset();
    } catch (err) {
      new import_obsidian9.Notice("\u4FDD\u5B58\u5931\u8D25\uFF1A" + (err instanceof Error ? err.message : String(err)));
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
var import_obsidian10 = require("obsidian");
var AccountMergeModal = class extends import_obsidian10.Modal {
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
    if (!import_obsidian10.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: "\u5408\u5E76\u8D26\u6237" });
    contentEl.createEl("div", {
      text: `\u5C06\u300C${this.source.name}\u300D\u7684\u5168\u90E8\u5386\u53F2\u5E76\u5165\u76EE\u6807\u8D26\u6237\uFF0C\u6E90\u8D26\u6237\u5C06\u88AB\u5220\u9664\uFF08\u4E0D\u53EF\u64A4\u9500\uFF09`,
      cls: "accounting-ledger-folder"
    });
    const targets = this.allAccounts.filter((a) => a.id !== this.source.id);
    this.targetSelect = contentEl.createEl("select", { cls: "accounting-ledger-input" });
    this.targetSelect.createEl("option", { value: "", text: "\u9009\u62E9\u76EE\u6807\u8D26\u6237\u2026" });
    for (const t of targets) {
      this.targetSelect.createEl("option", {
        value: t.id,
        text: t.active === false ? `${t.name}\uFF08\u5DF2\u9690\u85CF\uFF09` : t.name
      });
    }
    this.errorEl = contentEl.createEl("div", { cls: "accounting-ledger-error" });
    const actions = contentEl.createDiv("accounting-modal-actions");
    const cancelBtn = actions.createEl("button", { text: "\u53D6\u6D88", cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
    const submitBtn = actions.createEl("button", { text: "\u786E\u8BA4\u5408\u5E76", cls: "accounting-btn-primary" });
    submitBtn.onclick = () => void this.submit();
    setTimeout(() => this.targetSelect.focus(), 0);
  }
  async submit() {
    if (this.submitting) return;
    const toId = this.targetSelect.value;
    if (!toId) {
      this.errorEl.setText("\u8BF7\u9009\u62E9\u76EE\u6807\u8D26\u6237");
      return;
    }
    const target = this.allAccounts.find((a) => a.id === toId);
    const targetName = target?.name ?? toId;
    if (!confirm(
      `\u5C06\u628A\u300C${this.source.name}\u300D\u7684\u5168\u90E8\u5386\u53F2\u5E76\u5165\u300C${targetName}\u300D\uFF0C\u6E90\u8D26\u6237\u300C${this.source.name}\u300D\u5C06\u88AB\u5220\u9664\u3002\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF08\u5DF2\u81EA\u52A8\u5907\u4EFD\uFF09\u3002`
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
      const parts = [`\u5DF2\u6539\u5199 ${plan.rewritten} \u6761\u6D41\u6C34`];
      if (plan.deleted > 0) parts.push(`\u5220\u9664 ${plan.deleted} \u6761\u8F6C\u8D26\uFF08\u4E24\u7AEF\u8D26\u6237\u76F8\u540C\uFF09`);
      parts.push(`\u300C${this.source.name}\u300D\u5DF2\u5408\u5E76\u5230\u300C${targetName}\u300D`);
      new import_obsidian10.Notice(parts.join("\uFF0C"));
      this.close();
      this.onDone();
    } catch (err) {
      this.submitting = false;
      console.error("\u5408\u5E76\u8D26\u6237\u5931\u8D25:", err);
      this.errorEl.setText(`\u5408\u5E76\u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/accountActionModal.ts
var AccountActionModal = class extends import_obsidian11.Modal {
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
    if (!import_obsidian11.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("div", { text: this.account.name, cls: "accounting-action-title" });
    const list = contentEl.createDiv({ cls: "accounting-action-list" });
    const txItem = list.createEl("button", { cls: "accounting-action-item" });
    txItem.createEl("span", { text: "\u67E5\u770B\u6D41\u6C34\u660E\u7EC6", cls: "accounting-action-item-text" });
    txItem.title = "\u67E5\u770B\u8BE5\u8D26\u6237\u6D41\u6C34";
    txItem.onclick = () => {
      this.close();
      this.navCtx.openList(this.account.id, void 0, true, void 0, this.onSaved);
    };
    const propItem = list.createEl("button", { cls: "accounting-action-item" });
    propItem.createEl("span", { text: "\u67E5\u770B\u5C5E\u6027", cls: "accounting-action-item-text" });
    propItem.title = "\u67E5\u770B\u5E76\u7F16\u8F91\u8D26\u6237\u5C5E\u6027";
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
    const label = nextActive ? "\u542F\u7528\u8D26\u6237" : "\u9690\u85CF\u8D26\u6237";
    toggleActiveItem.createEl("span", { text: label, cls: "accounting-action-item-text" });
    toggleActiveItem.title = nextActive ? "\u5C06\u8BE5\u8D26\u6237\u6062\u590D\u5230\u6D3B\u52A8\u5206\u7EC4" : "\u5C06\u8BE5\u8D26\u6237\u79FB\u5165\u9690\u85CF\u8D26\u6237\u5206\u533A";
    toggleActiveItem.onclick = () => {
      void this.toggleAccountActive(nextActive);
    };
    if (this.accounts.filter((a) => a.id !== this.account.id).length > 0) {
      const mergeItem = list.createEl("button", { cls: "accounting-action-item" });
      mergeItem.createEl("span", { text: "\u5408\u5E76\u8D26\u6237", cls: "accounting-action-item-text" });
      mergeItem.title = "\u628A\u8BE5\u8D26\u6237\u5168\u90E8\u5386\u53F2\u5E76\u5165\u5176\u5B83\u8D26\u6237\uFF0C\u6E90\u8D26\u6237\u5C06\u88AB\u5220\u9664";
      mergeItem.onclick = () => {
        this.close();
        new AccountMergeModal(this.app, this.adapter, this.account, this.accounts, this.onSaved).open();
      };
    }
    const closeWrap = contentEl.createDiv({ cls: "accounting-modal-close" });
    const closeBtn = closeWrap.createEl("button", { text: "\u5173\u95ED", cls: "accounting-btn-secondary" });
    closeBtn.onclick = () => this.close();
  }
  async toggleAccountActive(active) {
    try {
      const meta = await this.adapter.readMeta();
      const target = meta.accounts.find((a) => a.id === this.account.id);
      if (!target) {
        new import_obsidian11.Notice("\u8D26\u6237\u4E0D\u5B58\u5728\uFF0C\u5DF2\u5237\u65B0");
        this.close();
        this.onSaved();
        return;
      }
      await this.adapter.writeMeta({
        accounts: meta.accounts.map((a) => a.id === this.account.id ? { ...a, active } : a),
        categories: meta.categories
      });
      new import_obsidian11.Notice(active ? `\u5DF2\u542F\u7528\u8D26\u6237\u300C${target.name}\u300D` : `\u5DF2\u9690\u85CF\u8D26\u6237\u300C${target.name}\u300D\uFF0C\u53EF\u5728\u9690\u85CF\u8D26\u6237\u4E2D\u6062\u590D`);
      this.close();
      this.onSaved();
    } catch (err) {
      new import_obsidian11.Notice(`\u66F4\u65B0\u8D26\u6237\u5931\u8D25\uFF1A${err instanceof Error ? err.message : String(err)}`);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/accountCreateModal.ts
var import_obsidian12 = require("obsidian");
var AccountCreateModal = class extends import_obsidian12.Modal {
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
    if (!import_obsidian12.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.addClass("accounting-adjust-modal");
    contentEl.createEl("div", { text: "\u65B0\u5EFA\u8D26\u6237", cls: "accounting-adjust-title" });
    const nameRow = this.row("\u540D\u79F0");
    this.nameEl = this.input(nameRow, "text");
    const typeRow = this.row("\u7C7B\u578B");
    this.typeEl = this.select(typeRow);
    this.typeEl.onchange = () => this.toggleCredit();
    const openRow = this.row("\u521D\u59CB\u4F59\u989D");
    this.openingEl = this.input(openRow, "number", "0.01");
    const curRow = this.row("\u5E01\u79CD");
    this.currencyEl = this.currencySelect(curRow);
    const noteRow = this.row("\u5907\u6CE8");
    this.noteEl = this.input(noteRow, "text");
    this.creditBlockEl = contentEl.createDiv({ cls: "accounting-credit-block" });
    const clRow = this.row("\u4FE1\u7528\u989D\u5EA6", this.creditBlockEl);
    this.creditLimitEl = this.input(clRow, "number", "0.01");
    const bdRow = this.row("\u8D26\u5355\u65E5", this.creditBlockEl);
    this.billingDayEl = this.input(bdRow, "number");
    this.billingDayEl.min = "1";
    this.billingDayEl.max = "31";
    this.billingDayEl.placeholder = "1-31";
    const rdRow = this.row("\u8FD8\u6B3E\u65E5", this.creditBlockEl);
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
    for (const t of this.accountTypeSettings.types) {
      el.createEl("option", { text: t.label, value: t.type });
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
    const firstEnabled = this.accountTypeSettings.types.find((t) => t.active !== false);
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
    const cancel = this.footerEl.createEl("button", { text: "\u53D6\u6D88", cls: "accounting-btn-secondary" });
    cancel.onclick = () => this.close();
    const save = this.footerEl.createEl("button", { text: "\u4FDD\u5B58", cls: "accounting-btn-primary" });
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
      new import_obsidian12.Notice("\u8D26\u5355\u65E5\u5FC5\u987B\u5728 1-31 \u4E4B\u95F4");
      return;
    }
    if (repaymentDay && (parseInt(repaymentDay) < 1 || parseInt(repaymentDay) > 31)) {
      new import_obsidian12.Notice("\u8FD8\u6B3E\u65E5\u5FC5\u987B\u5728 1-31 \u4E4B\u95F4");
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
      new import_obsidian12.Notice(`\u5DF2\u521B\u5EFA\u8D26\u6237\u300C${name}\u300D`);
      this.onSaved();
      this.close();
    } catch (err) {
      new import_obsidian12.Notice("\u521B\u5EFA\u8D26\u6237\u5931\u8D25\uFF1A" + (err instanceof Error ? err.message : String(err)));
    }
  }
  onClose() {
    this.keyboardAvoidance?.dispose();
    this.keyboardAvoidance = void 0;
    this.contentEl.empty();
  }
};

// src/balanceModal.ts
var BalanceModal = class extends import_obsidian13.Modal {
  constructor(app, adapter, navCtx, slide) {
    super(app);
    this.adapter = adapter;
    this.navCtx = navCtx;
    this.slide = slide;
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
    const sc = slideClass(this.slide);
    if (sc) this.contentEl.addClass(sc);
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
        text: "\u8BFB\u53D6\u6570\u636E\u5931\u8D25\uFF1A\u8BF7\u5728\u684C\u9762\u7AEF\u521D\u59CB\u5316\u8D26\u672C\uFF0C\u6216\u68C0\u67E5\u63D2\u4EF6\u8BBE\u7F6E\u7684\u300C\u6570\u636E\u5B50\u76EE\u5F55\u300D\u3002",
        cls: "accounting-empty"
      });
      return;
    }
    if (snap.accounts.length === 0 && snap.transactions.length === 0) {
      contentEl.createEl("div", {
        text: "\u6682\u65E0\u8D26\u6237\uFF0C\u70B9\u300C\uFF0B \u65B0\u5EFA\u8D26\u6237\u300D\u521B\u5EFA",
        cls: "accounting-empty"
      });
      const createAccountEl2 = contentEl.createDiv({ cls: "accounting-create-account-row" });
      const createBtn2 = createAccountEl2.createEl("button", {
        text: "\uFF0B \u65B0\u5EFA\u8D26\u6237",
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
    const nw = computeNetWorth(snap.transactions, snap.accounts, { rates, base: this.baseCurrency });
    const totalRec = nw.receivables.reduce((s, r) => s + r.amount, 0);
    const totalPay = nw.payables.reduce((s, p) => s + p.amount, 0);
    const negative = nw.netWorth < 0;
    const hero = contentEl.createDiv({ cls: `accounting-nw-hero${negative ? " accounting-nw-hero--neg" : ""}` });
    hero.createEl("div", { text: this.baseCurrency !== "CNY" ? `\u51C0\u8D44\u4EA7\uFF08${this.baseCurrency}\uFF09` : "\u51C0\u8D44\u4EA7", cls: "accounting-nw-hero-label" });
    hero.createEl("div", { text: formatMoneyInt(nw.netWorth, this.baseCurrency), cls: "accounting-nw-hero-value" });
    const sub = hero.createDiv({ cls: "accounting-nw-hero-sub" });
    const assetCell = sub.createDiv({ cls: "accounting-nw-hero-cell" });
    assetCell.createEl("div", { text: "\u603B\u8D44\u4EA7", cls: "accounting-nw-hero-cell-label" });
    assetCell.createEl("div", { text: formatMoneyInt(nw.totalAssets, this.baseCurrency), cls: "accounting-nw-hero-cell-value accounting-nw-hero-asset" });
    const liabCell = sub.createDiv({ cls: "accounting-nw-hero-cell accounting-nw-hero-cell--last" });
    liabCell.createEl("div", { text: "\u603B\u8D1F\u503A", cls: "accounting-nw-hero-cell-label" });
    liabCell.createEl("div", { text: formatMoneyInt(nw.totalLiabilities, this.baseCurrency), cls: "accounting-nw-hero-cell-value accounting-nw-hero-liab" });
    const sum = contentEl.createDiv({ cls: "accounting-summary" });
    sum.createEl("span", { text: `\u4FE1\u7528\u5361\u5E94\u8FD8 ${formatMoney(nw.creditPayable, this.baseCurrency)}` });
    sum.createEl("span", { text: `\u5E94\u6536 ${formatMoney(totalRec, this.baseCurrency)} / \u5E94\u4ED8 ${formatMoney(totalPay, this.baseCurrency)}` });
    const active = snap.accounts.filter((a) => a.active);
    const hidden = snap.accounts.filter((a) => !a.active);
    this.renderGroups(contentEl, active, balances, snap);
    if (hidden.length > 0) {
      const h = contentEl.createEl("details", { cls: "accounting-hidden" });
      h.createEl("summary", { text: `\u9690\u85CF\u8D26\u6237\uFF08\u4ECD\u8BA1\u5165\u51C0\u8D44\u4EA7\uFF09`, cls: "accounting-collapsible-head" });
      this.renderGroups(h, hidden, balances, snap);
    }
    const createAccountEl = contentEl.createDiv({ cls: "accounting-create-account-row" });
    const createBtn = createAccountEl.createEl("button", {
      text: "\uFF0B \u65B0\u5EFA\u8D26\u6237",
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
  }
  /** 统一底部导航条（由 CSS 固定到底部，内容区预留 safe-area）。 */
  renderNav() {
    renderNavBar(this.modalEl, "balance", this.navCtx, () => this.close());
  }
  renderGroups(parent, accounts, balances, snap) {
    const typeToGroupId = /* @__PURE__ */ new Map();
    for (const t of this.accountTypeSettings.types) typeToGroupId.set(t.type, t.groupId);
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
      const group = parent.createDiv({ cls: "accounting-group" });
      const head = group.createDiv({ cls: "accounting-group-head" });
      const groupTotal = items.reduce((s, a) => s + (balances.get(a.id) ?? 0), 0);
      const hasLiability = g.types.some((t) => kindOfType(t.type) === "liability");
      head.createEl("span", { text: `${g.label} \xB7 ${hasLiability ? "\u8D1F\u503A" : "\u8D44\u4EA7"}` });
      head.createEl("span", { text: formatMoney(groupTotal) });
      for (const a of items) {
        const row = group.createDiv({ cls: "accounting-row" });
        const name = row.createEl("span", { text: a.name, cls: "accounting-row-name" });
        if (a.note) name.createSpan({ text: ` ${a.note}`, cls: "accounting-muted" });
        name.title = "\u67E5\u770B\u8D26\u6237\u9009\u9879";
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
        amountEl.title = "\u70B9\u51FB\u8C03\u6574\u4F59\u989D";
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
  /** 直接移除弹窗，绕过 Obsidian 默认关闭动画（与流水/记一笔/详情一致），保证导航切换即时无动画。 */
  close() {
    if (this.closing) return;
    this.closing = true;
    if (this.opened) {
      try {
        this.onClose();
      } catch (e) {
        console.error(e);
      }
      this.containerEl.detach();
    } else {
      super.close();
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/reportModal.ts
var import_obsidian14 = require("obsidian");
var RANGE_OPTIONS = [
  { key: "thisMonth", label: "\u672C\u6708" },
  { key: "last1m", label: "\u8FD11\u6708" },
  { key: "last3m", label: "\u8FD13\u6708" },
  { key: "thisYear", label: "\u672C\u5E74" },
  { key: "last6y", label: "\u8FD16\u5E74" },
  { key: "all", label: "\u5168\u90E8" }
];
var TOP_N = 5;
var TREND_MONTHS = 6;
function startIso(dateStr) {
  const parts = dateStr.split("-").map(Number);
  return localDateStartISO(parts[0] ?? 0, parts[1] ?? 1, parts[2] ?? 1);
}
function endExclusiveIso(dateStr) {
  const parts = dateStr.split("-").map(Number);
  return localDateStartISO(parts[0] ?? 0, parts[1] ?? 1, (parts[2] ?? 1) + 1);
}
function firstOfMonth() {
  const d = /* @__PURE__ */ new Date();
  const pad = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}
function firstOfYear() {
  return `${(/* @__PURE__ */ new Date()).getFullYear()}-01-01`;
}
function yearsAgoDateInput(n) {
  const d = /* @__PURE__ */ new Date();
  d.setFullYear(d.getFullYear() - n);
  const pad = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function trendStartYM() {
  const d = /* @__PURE__ */ new Date();
  d.setMonth(d.getMonth() - (TREND_MONTHS - 1));
  const pad = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}
function rangeStartDateOnly(key) {
  switch (key) {
    case "thisMonth":
      return firstOfMonth();
    case "last1m":
      return monthsAgoDateInput(1);
    // 与流水筛选同源（裸 setMonth、不钳制月末）
    case "last3m":
      return monthsAgoDateInput(3);
    case "thisYear":
      return firstOfYear();
    case "last6y":
      return yearsAgoDateInput(6);
    // 滚动 6 年（setFullYear 钳制闰年 2/29→2/28）
    case "all":
      return "1970-01-01";
  }
}
function rangeBounds(key) {
  return { start: startIso(rangeStartDateOnly(key)), end: endExclusiveIso(todayDateInput()) };
}
function rangeDateBounds(key) {
  return { start: rangeStartDateOnly(key), end: todayDateInput() };
}
var ReportModal = class extends import_obsidian14.Modal {
  constructor(app, adapter, navCtx, slide) {
    super(app);
    this.adapter = adapter;
    this.navCtx = navCtx;
    this.slide = slide;
  }
  opened = false;
  closing = false;
  transactions = [];
  range = "thisMonth";
  /** 支出/收入分类是否展开全部（默认折叠到 TOP_N，点「展开其他」逐项显示，不再合并为「其他」） */
  expandedExpense = false;
  expandedIncome = false;
  /** 在挂载到 DOM 前就预设全屏类与禁用 Obsidian 默认 modal-pop 动画，避免「先上跳再滑入」。 */
  open() {
    presetModalChrome(this.modalEl, this.containerEl);
    super.open();
  }
  async onOpen() {
    this.opened = true;
    prepareModalContainer(this.containerEl);
    this.modalEl.addClass("accounting-fullscreen");
    const sc = slideClass(this.slide);
    if (sc) this.contentEl.addClass(sc);
    await this.refresh();
  }
  async refresh() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("accounting-report-modal");
    this.renderNav();
    try {
      const events = await this.adapter.loadLog();
      this.transactions = foldEvents(events);
    } catch {
      contentEl.createEl("div", {
        text: "\u8BFB\u53D6\u6570\u636E\u5931\u8D25\uFF1A\u8BF7\u5728\u684C\u9762\u7AEF\u521D\u59CB\u5316\u8D26\u672C\uFF0C\u6216\u68C0\u67E5\u63D2\u4EF6\u8BBE\u7F6E\u7684\u300C\u6570\u636E\u5B50\u76EE\u5F55\u300D\u3002",
        cls: "accounting-empty"
      });
      return;
    }
    if (this.transactions.length === 0) {
      contentEl.createEl("div", {
        text: "\u6682\u65E0\u6D41\u6C34\u8BB0\u5F55\uFF0C\u65E0\u6CD5\u751F\u6210\u7EDF\u8BA1\u3002",
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
    const { start, end } = rangeBounds(this.range);
    this.renderRangeSelector(container);
    const totals = periodTotals(this.transactions, start, end);
    this.renderTotals(container, totals);
    const incomeSlices = categoryBreakdown(this.transactions, { flow: "income", start, end });
    this.renderCategoryBars(container, "\u6536\u5165\u5206\u7C7B", incomeSlices, "income", this.expandedIncome);
    const expenseSlices = categoryBreakdown(this.transactions, { flow: "expense", start, end });
    this.renderCategoryBars(container, "\u652F\u51FA\u5206\u7C7B", expenseSlices, "expense", this.expandedExpense);
    const { points: trendPoints, gran: trendGran } = this.computeTrend();
    this.renderTrend(container, trendPoints, trendGran);
  }
  renderRangeSelector(container) {
    const box = container.createDiv({ cls: "accounting-filter-box" });
    const row = box.createDiv({ cls: "accounting-filter-row" });
    row.createSpan({ text: "\u65F6\u95F4\u6BB5", cls: "accounting-filter-label" });
    const controls = row.createDiv({ cls: "accounting-filter-controls" });
    for (const opt of RANGE_OPTIONS) {
      const active = this.range === opt.key;
      const btn = controls.createEl("button", {
        text: opt.label,
        cls: `accounting-filter-quick-btn${active ? " accounting-filter-btn-active" : ""}`
      });
      btn.onclick = () => {
        this.range = opt.key;
        this.refresh();
      };
    }
  }
  renderTotals(container, totals) {
    const cards = container.createDiv({ cls: "accounting-stat-cards" });
    this.statCard(cards, "\u6536\u5165", formatMoneyInt(totals.income), "accounting-stat-income");
    this.statCard(cards, "\u652F\u51FA", formatMoneyInt(totals.expense), "accounting-stat-expense");
    const surplusCls = totals.surplus < 0 ? "accounting-stat-expense" : "accounting-stat-income";
    this.statCard(cards, "\u7ED3\u4F59", formatMoneyInt(totals.surplus), surplusCls);
  }
  statCard(parent, label, value, valueCls) {
    const card = parent.createDiv({ cls: "accounting-stat-card" });
    card.createEl("div", { text: label, cls: "accounting-stat-card-label" });
    card.createEl("div", { text: value, cls: `accounting-stat-card-value ${valueCls}` });
  }
  renderCategoryBars(container, title, slices, flow, expanded) {
    const section = container.createDiv({ cls: "accounting-section" });
    const head = section.createDiv({ cls: "accounting-group-head" });
    head.createEl("span", { text: title });
    const total = slices.reduce((s, x) => s + x.amount, 0);
    head.createEl("span", { text: formatMoney(total) });
    if (slices.length === 0) {
      section.createEl("div", { text: "\u65E0\u6570\u636E", cls: "accounting-empty-mini" });
      return;
    }
    const fillCls = flow === "expense" ? "accounting-bar-fill-expense" : "accounting-bar-fill-income";
    const shown = expanded ? slices : slices.slice(0, TOP_N);
    const { start, end } = rangeDateBounds(this.range);
    for (const s of shown) {
      const uncategorized = s.category === "(\u672A\u5206\u7C7B)";
      this.renderBar(section, s.category, s.amount, s.percent, fillCls, () => {
        this.navCtx.openList(void 0, void 0, true, {
          category: uncategorized ? "" : s.category,
          uncategorized,
          flow,
          start,
          end
        }, () => this.refresh());
      });
    }
    if (slices.length > TOP_N) {
      const restCount = slices.length - TOP_N;
      const toggle = section.createEl("button", {
        text: expanded ? "\u6536\u8D77 \u25B4" : `\u5C55\u5F00\u5176\u4ED6 ${restCount} \u9879 \u25BE`,
        cls: "accounting-bar-toggle"
      });
      toggle.onclick = () => {
        if (flow === "expense") this.expandedExpense = !this.expandedExpense;
        else this.expandedIncome = !this.expandedIncome;
        this.refresh();
      };
    }
  }
  renderBar(parent, label, amount, percent, fillCls, onClick) {
    const row = parent.createDiv({ cls: "accounting-bar-row" });
    if (onClick) {
      row.addClass("accounting-bar-clickable");
      row.setAttribute("title", "\u70B9\u51FB\u67E5\u770B\u6D41\u6C34\u660E\u7EC6");
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
    amountEl.createSpan({ text: formatMoney(amount) });
    if (percent > 0) {
      amountEl.createSpan({ text: ` ${(percent * 100).toFixed(0)}%`, cls: "accounting-bar-percent" });
    }
    const track = row.createDiv({ cls: "accounting-bar-track" });
    const fill = track.createDiv({ cls: `accounting-bar-fill ${fillCls}` });
    const widthPct = percent > 0 ? Math.max(percent * 100, 2) : 0;
    fill.style.width = `${widthPct.toFixed(2)}%`;
  }
  /**
   * 按 range 时间跨度自适应决定趋势粒度与窗口（跨度 = startDate 所在月~当前月的含首尾月数）：
   *  - 跨度 < 6 月   → 近 6 月保底（按月；短时段列数太少无趋势意义）
   *  - 6 ≤ 跨度 < 24 → 实际月数（按月，startDate 所在月~当前月）
   *  - 跨度 ≥ 24 月  → 切换按年；近6年=含今年共 6 年（最少 6 年保底），全部=最早数据年到今年（按实际年数，数据不足 6 年按实际）
   */
  computeTrend() {
    const now = /* @__PURE__ */ new Date();
    const cy = now.getFullYear();
    const cm = now.getMonth() + 1;
    const pad = (x) => String(x).padStart(2, "0");
    if (this.range === "last6y") {
      return { points: yearlyTrend(this.transactions, cy - 5, 6), gran: "year" };
    }
    const startDate = this.rangeStartDate();
    const startYear = Number(startDate.slice(0, 4));
    const startMonth = Number(startDate.slice(5, 7));
    const spanMonths = (cy - startYear) * 12 + (cm - startMonth) + 1;
    if (spanMonths >= 24) {
      const yearCount = Math.max(cy - startYear + 1, 1);
      return { points: yearlyTrend(this.transactions, startYear, yearCount), gran: "year" };
    }
    if (spanMonths < 6) {
      return { points: monthlyTrend(this.transactions, trendStartYM(), TREND_MONTHS), gran: "month" };
    }
    return { points: monthlyTrend(this.transactions, `${startYear}-${pad(startMonth)}`, spanMonths), gran: "month" };
  }
  /** range 起点 date-only（趋势窗口用）；全部 range 取最早有数据月（其余与三数字卡 rangeBounds 同源）。 */
  rangeStartDate() {
    switch (this.range) {
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
        return this.earliestDataDate();
    }
  }
  /** 最早有数据月 date-only（YYYY-MM-01）；无数据回退当前月。 */
  earliestDataDate() {
    const now = /* @__PURE__ */ new Date();
    let ey = now.getFullYear();
    let em = now.getMonth() + 1;
    for (const t of this.transactions) {
      const ym = isoToMonthStr(t.ts);
      if (!ym) continue;
      const y = Number(ym.slice(0, 4));
      const m = Number(ym.slice(5, 7));
      if (y < ey || y === ey && m < em) {
        ey = y;
        em = m;
      }
    }
    const pad = (x) => String(x).padStart(2, "0");
    return `${ey}-${pad(em)}-01`;
  }
  renderTrend(container, points, gran) {
    const section = container.createDiv({ cls: "accounting-section" });
    const head = section.createDiv({ cls: "accounting-group-head" });
    head.createEl("span", { text: gran === "year" ? "\u6536\u652F\u8D8B\u52BF\uFF08\u6309\u5E74\uFF09" : "\u6536\u652F\u8D8B\u52BF\uFF08\u6309\u6708\uFF09" });
    const legend = head.createEl("span", { cls: "accounting-trend-legend" });
    legend.createSpan({ text: "\u7ED3\u4F59", cls: "accounting-trend-leg-surplus" });
    legend.createSpan({ text: "\u6536\u5165", cls: "accounting-trend-leg-income" });
    legend.createSpan({ text: "\u652F\u51FA", cls: "accounting-trend-leg-expense" });
    if (points.length === 0) {
      section.createEl("div", { text: "\u65E0\u6570\u636E", cls: "accounting-empty-mini" });
      return;
    }
    const wrap = section.createDiv({ cls: "accounting-trend-chart-wrap" });
    const info = section.createDiv({ cls: "accounting-trend-info" });
    info.createEl("span", { text: "\u70B9\u51FB\u67F1\u5B50\u67E5\u770B\u6536\u652F\u660E\u7EC6", cls: "accounting-trend-info-hint" });
    this.renderTrendSvg(wrap, points, gran, container.clientWidth, (i) => {
      const p = points[i];
      if (!p) return;
      info.empty();
      const bucket = info.createEl("span", { cls: "accounting-trend-info-bucket" });
      bucket.textContent = gran === "year" ? p.bucket : `${p.bucket.slice(5)} \u6708`;
      const cells = info.createDiv({ cls: "accounting-trend-info-cells" });
      this.appendTrendInfoCell(cells, "\u6536\u5165", p.income, "income");
      this.appendTrendInfoCell(cells, "\u652F\u51FA", p.expense, "expense");
      this.appendTrendInfoCell(cells, "\u7ED3\u4F59", p.surplus, p.surplus < 0 ? "expense" : "income");
    });
  }
  /** 趋势明细行单个数字格（点击柱子后填充）。结余随正负上色（正=收入绿、负=支出红）。 */
  appendTrendInfoCell(parent, label, amount, cls) {
    const cell = parent.createDiv({ cls: `accounting-trend-info-cell accounting-trend-info-${cls}` });
    cell.createEl("span", { text: label, cls: "accounting-trend-info-cell-label" });
    cell.createEl("span", { text: formatMoney(amount), cls: "accounting-trend-info-cell-value" });
  }
  /**
   * SVG 绘制趋势：结余柱（正=蓝向上、负=红向下，柱端标金额）+ 收入虚线 + 支出实线。
   * 零基线居中分隔正负区；用 SVG 而非 CSS div 是因为折线（polyline）无法用纯 CSS 连接。
   * 手动 createElementNS 构建（Obsidian createEl 不支持 svg 命名空间）。
   */
  renderTrendSvg(parent, points, gran, availWidth, onSelect) {
    const NS = "http://www.w3.org/2000/svg";
    const minColW = 50;
    const maxColW = 80;
    const padL = 4;
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
    axis.setAttribute("x1", "0");
    axis.setAttribute("x2", String(W));
    axis.setAttribute("y1", String(baselineY));
    axis.setAttribute("y2", String(baselineY));
    axis.setAttribute("class", "accounting-trend-axis");
    svg.appendChild(axis);
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
          const t = el("text");
          t.setAttribute("x", String(cx));
          t.setAttribute("y", String(baselineY - h - 3));
          t.setAttribute("text-anchor", "middle");
          t.setAttribute("class", "accounting-trend-value");
          t.textContent = formatMoneyInt(p.surplus);
          svg.appendChild(t);
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
        const t = el("text");
        t.setAttribute("x", String(cx));
        t.setAttribute("y", String(baselineY + h + 11));
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("class", "accounting-trend-value accounting-trend-value-neg");
        t.textContent = formatMoneyInt(p.surplus);
        svg.appendChild(t);
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
  /** 直接移除弹窗，绕过 Obsidian 默认关闭动画（与流水/记一笔/余额一致），保证导航切换即时无动画。 */
  close() {
    if (this.closing) return;
    this.closing = true;
    if (this.opened) {
      try {
        this.onClose();
      } catch (e) {
        console.error(e);
      }
      this.containerEl.detach();
    } else {
      super.close();
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/settingsModal.ts
var import_obsidian15 = require("obsidian");
var SettingsModal = class extends import_obsidian15.Modal {
  constructor(app, settingsTab, navCtx, slide, onSwitchLedger) {
    super(app);
    this.settingsTab = settingsTab;
    this.navCtx = navCtx;
    this.slide = slide;
    this.onSwitchLedger = onSwitchLedger;
  }
  opened = false;
  closing = false;
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
    const sc = slideClass(this.slide);
    if (sc) this.contentEl.addClass(sc);
    this.contentEl.addClass("accounting-settings-modal");
    renderNavBar(this.modalEl, "settings", this.navCtx, () => this.close());
    const onSwitch = this.onSwitchLedger ? (newSubdir) => {
      this.close();
      this.onSwitchLedger(newSubdir);
    } : void 0;
    this.settingsTab.renderInto(this.contentEl, onSwitch);
  }
  /** 直接移除弹窗，绕过 Obsidian 默认关闭动画（与流水 / 余额 / 记一笔 / 详情一致），保证导航切换即时无动画。 */
  close() {
    if (this.closing) return;
    this.closing = true;
    if (this.opened) {
      try {
        this.onClose();
      } catch (e) {
        console.error(e);
      }
      this.containerEl.detach();
    } else {
      super.close();
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/navActions.ts
function openList(app, adapter, navCtx, presetAccountId, slide, presetRecurringRuleId, drillDown, drill, onDataChanged) {
  new TransactionListModal(app, adapter, presetAccountId, navCtx, slide, presetRecurringRuleId, drillDown, drill, onDataChanged).open();
}
async function openEntry(app, adapter, afterSubmit, navCtx, slide, onSwitchLedger, onRecurringSaved) {
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
    onRecurringSaved
  ).open();
}
function openBalance(app, adapter, navCtx, slide) {
  new BalanceModal(app, adapter, navCtx, slide).open();
}
function openReport(app, adapter, navCtx, slide) {
  new ReportModal(app, adapter, navCtx, slide).open();
}
function openSettings(app, settingsTab, navCtx, slide, onSwitchLedger) {
  const modal = new SettingsModal(app, settingsTab, navCtx, slide, onSwitchLedger);
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

// src/settings.ts
var FEEDBACK_EMAIL = "honeyledger@163.com";
var AccountingSettings = class {
  constructor(app, plugin, adapter) {
    this.app = app;
    this.plugin = plugin;
    this.injectedAdapter = adapter;
  }
  injectedAdapter;
  /** 当前激活的 tab；实例级，跨设置页开关/切账本保持（同一实例），App 重启回默认 'ledger'。 */
  activeTab = "ledger";
  /** 优先用最新的 dataSubdir 重建 adapter（切换账本后立即生效），
   *  无 vault（测试环境）则回退到构造时注入的 adapter。 */
  currentAdapter() {
    const vault = this.app?.vault;
    if (vault) {
      return new ObsidianDataAdapter(vault, this.plugin.settings.dataSubdir);
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
    const TABS = [
      { key: "ledger", label: "\u901A\u7528" },
      { key: "recurring", label: "\u5468\u671F\u8D26" },
      { key: "category", label: "\u5206\u7C7B" },
      { key: "currency", label: "\u5E01\u79CD" },
      { key: "about", label: "\u5173\u4E8E" }
    ];
    for (const { key, label } of TABS) {
      const tabBtn = tabsEl.createEl("button", { text: label, cls: "accounting-settings-tab" });
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
    headEl.createEl("span", { text: "\u542F\u52A8\u8BBE\u7F6E", cls: "accounting-ledger-card-title" });
    const bodyEl = cardEl.createDiv("accounting-ledger-list");
    const row = bodyEl.createDiv("accounting-settings-row accounting-startup-toggle");
    const cb = row.createEl("input", { cls: "accounting-checkbox" });
    cb.type = "checkbox";
    cb.checked = !!this.plugin.settings.autoOpenOnStartup;
    cb.onchange = async () => {
      this.plugin.settings.autoOpenOnStartup = cb.checked;
      try {
        await this.plugin.saveSettings();
        new import_obsidian16.Notice(cb.checked ? "\u5DF2\u5F00\u542F\uFF1A\u4E0B\u6B21\u6253\u5F00 Obsidian \u81EA\u52A8\u8FDB\u5165\u8BB0\u8D26" : "\u5DF2\u5173\u95ED\uFF1A\u4E0B\u6B21\u6253\u5F00 Obsidian \u751F\u6548");
      } catch (e) {
        new import_obsidian16.Notice(`\u4FDD\u5B58\u5931\u8D25\uFF1A${e}`);
      }
    };
    row.createEl("span", { text: "\u5F00 Obsidian \u81EA\u52A8\u8FDB\u5165", cls: "accounting-currency-online-label accounting-startup-toggle-label" });
    const resetBtn = row.createEl("button", {
      text: "\u21BB \u91CD\u8FD0\u884C\u5F15\u5BFC",
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
    headEl.createEl("span", { text: "\u5173\u4E8E", cls: "accounting-ledger-card-title" });
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
    row("\u5E94\u7528", "\u5B8F\u5229\u8BB0\u8D26 \xB7 Honey Ledger \xB7 Obsidian \u63D2\u4EF6");
    row("\u7248\u672C", `v${this.plugin.manifest.version}`);
    row("\u53CD\u9988", FEEDBACK_EMAIL, true);
    const recentCardEl = panel.createDiv("accounting-ledger-card");
    const recentHeadEl = recentCardEl.createDiv("accounting-ledger-card-head");
    recentHeadEl.createEl("span", { text: "\u6700\u8FD1\u66F4\u65B0", cls: "accounting-ledger-card-title" });
    const recentBodyEl = recentCardEl.createDiv("accounting-ledger-list");
    MOBILE_RECENT_UPDATES.forEach((text, i) => {
      const item = recentBodyEl.createDiv("accounting-about-row");
      item.createEl("span", { text: `${i + 1}.`, cls: "accounting-about-label" });
      item.createEl("span", { text, cls: "accounting-about-value" });
    });
  }
  /** 账本管理 panel：账本卡片（新建/刷新/切换/改名/删除）。 */
  renderLedgerPanel(panel, onSwitchLedger) {
    const ledgerCardEl = panel.createDiv("accounting-ledger-card");
    const ledgerHeadEl = ledgerCardEl.createDiv("accounting-ledger-card-head");
    ledgerHeadEl.createEl("span", { text: "\u8D26\u672C", cls: "accounting-ledger-card-title" });
    const ledgerHeadActions = ledgerHeadEl.createDiv("accounting-ledger-head-actions");
    const createLedgerBtn = ledgerHeadActions.createEl("button", { text: "+ \u65B0\u5EFA\u8D26\u672C", cls: "accounting-ledger-create" });
    const refreshLedgerBtn = ledgerHeadActions.createEl("button", { text: "\u21BB \u5237\u65B0", cls: "accounting-ledger-refresh" });
    const ledgerListEl = ledgerCardEl.createDiv("accounting-ledger-list");
    const refreshLedgerList = async () => {
      const adapter = this.currentAdapter();
      try {
        const ledgers = await adapter.listLedgers();
        const ledgerWithAliases = await Promise.all(
          ledgers.map(async (name) => ({
            name,
            alias: await adapter.readLedgerAlias(name)
          }))
        );
        ledgerListEl.empty();
        if (ledgerWithAliases.length === 0) {
          ledgerListEl.createEl("p", {
            text: "\u5C1A\u65E0\u8D26\u672C",
            cls: "accounting-ledger-empty"
          });
          return;
        }
        for (const { name, alias } of ledgerWithAliases) {
          const isCurrent = name === this.plugin.settings.dataSubdir;
          const item = ledgerListEl.createDiv("accounting-ledger-item");
          if (isCurrent) item.classList.add("accounting-ledger-current");
          const info = item.createDiv("accounting-ledger-info");
          info.createEl("div", { text: alias, cls: "accounting-ledger-name" });
          info.createEl("div", { text: name, cls: "accounting-ledger-folder" });
          const actions = item.createDiv("accounting-ledger-actions");
          if (isCurrent) {
            actions.createEl("span", { text: "\u5F53\u524D", cls: "accounting-ledger-badge" });
          } else {
            const switchBtn = actions.createEl("button", { text: "\u21C4 \u5207\u6362", cls: "accounting-ledger-switch" });
            switchBtn.onclick = async () => {
              try {
                if (onSwitchLedger) {
                  onSwitchLedger(name);
                } else {
                  this.plugin.settings.dataSubdir = name;
                  await this.plugin.saveSettings();
                  new import_obsidian16.Notice(`\u5DF2\u5207\u6362\u5230\u300C${alias}\u300D\uFF0C\u8BF7\u5173\u95ED\u5E76\u91CD\u65B0\u6253\u5F00\u8BB0\u8D26\u754C\u9762`);
                  void refreshLedgerList();
                }
              } catch (error) {
                new import_obsidian16.Notice(`\u5207\u6362\u8D26\u672C\u5931\u8D25\uFF1A${error}`);
              }
            };
          }
          const renameBtn = actions.createEl("button", { text: "\u270E \u6539\u540D", cls: "accounting-ledger-rename" });
          renameBtn.onclick = () => {
            void this.openRenameAliasModal(name, alias, refreshLedgerList);
          };
          if (!isCurrent) {
            const deleteBtn = actions.createEl("button", { text: "\u{1F5D1} \u5220\u9664", cls: "accounting-ledger-delete" });
            deleteBtn.onclick = () => {
              void this.handleDeleteLedger(name, alias, refreshLedgerList);
            };
          }
        }
      } catch (error) {
        ledgerListEl.empty();
        ledgerListEl.createEl("p", {
          text: `\u52A0\u8F7D\u8D26\u672C\u5217\u8868\u5931\u8D25\uFF1A${error}`,
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
          new import_obsidian16.Notice(`\u5DF2\u65B0\u5EFA\u5E76\u5207\u6362\u5230\u300C${alias || name}\u300D\uFF0C\u8BF7\u5173\u95ED\u5E76\u91CD\u65B0\u6253\u5F00\u8BB0\u8D26\u754C\u9762`);
          await refreshLedgerList();
        }
      });
    };
    refreshLedgerBtn.onclick = async () => {
      await refreshLedgerList();
      new import_obsidian16.Notice("\u8D26\u672C\u5217\u8868\u5DF2\u5237\u65B0");
    };
    void refreshLedgerList();
  }
  /** 备份管理 panel：备份卡片（立即备份 / 查看备份）。 */
  renderBackupPanel(panel) {
    const backupCardEl = panel.createDiv("accounting-ledger-card");
    const backupHeadEl = backupCardEl.createDiv("accounting-ledger-card-head");
    backupHeadEl.createEl("span", { text: "\u5907\u4EFD", cls: "accounting-ledger-card-title" });
    appendHeaderHelp(backupHeadEl, {
      detail: "\u5907\u4EFD\u5B58\u50A8\u5728\u8D26\u672C\u76EE\u5F55\u7684 backups/<label>-<timestamp> \u5B50\u76EE\u5F55\u3002\u6062\u590D\u524D\u4F1A\u81EA\u52A8\u521B\u5EFA pre-restore \u515C\u5E95\u5907\u4EFD\u3002"
    });
    const backupBodyEl = backupCardEl.createDiv("accounting-ledger-list accounting-backup-card-body");
    const backupActionsEl = backupBodyEl.createDiv("accounting-ledger-card-actions accounting-backup-card-actions");
    const createBackupBtn = backupActionsEl.createEl("button", { text: "\u2913 \u7ACB\u5373\u5907\u4EFD", cls: "accounting-ledger-create" });
    const listBackupBtn = backupActionsEl.createEl("button", { text: "\u21A9 \u67E5\u770B\u5907\u4EFD", cls: "accounting-ledger-refresh" });
    createBackupBtn.onclick = async () => {
      try {
        const backupPath = await this.currentAdapter().backup("manual");
        new import_obsidian16.Notice(`\u5DF2\u521B\u5EFA\u5907\u4EFD\uFF1A${backupPath}`);
      } catch (error) {
        new import_obsidian16.Notice(`\u5907\u4EFD\u5931\u8D25\uFF1A${error}`);
      }
    };
    listBackupBtn.onclick = () => {
      void this.showBackupList();
    };
  }
  /** 币种 panel：本位币下拉 + 汇率表编辑器（手动维护「1 外币 = rate 本位币」，随 iCloud 与桌面端同步）。 */
  renderCurrencyPanel(panel) {
    const cardEl = panel.createDiv("accounting-ledger-card");
    const headEl = cardEl.createDiv("accounting-ledger-card-head");
    headEl.createEl("span", { text: "\u5E01\u79CD\u4E0E\u6C47\u7387", cls: "accounting-ledger-card-title" });
    appendHeaderHelp(headEl, {
      detail: "\u672C\u4F4D\u5E01\u7528\u4E8E\u51C0\u8D44\u4EA7\u4E0E\u62A5\u8868\u6298\u7B97\uFF0C\u9ED8\u8BA4 CNY\u3002\u6C47\u7387\u8868\u4E0E\u672C\u4F4D\u5E01\u5B58\u50A8\u5728\u8D26\u672C\u76EE\u5F55\uFF08rates.json / ledger.json\uFF09\uFF0C\u968F iCloud \u4E0E\u684C\u9762\u7AEF\u540C\u6B65\u3002"
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
        bodyEl.createEl("p", { text: `\u52A0\u8F7D\u5E01\u79CD\u8BBE\u7F6E\u5931\u8D25\uFF1A${error}`, cls: "accounting-ledger-empty" });
      }
    };
    void refresh();
  }
  renderCurrencyBody(bodyEl, adapter, baseCurrency, rates, accountCurrencies, refresh) {
    bodyEl.empty();
    const baseOptions = Array.from(/* @__PURE__ */ new Set([baseCurrency, ...Object.keys(rates), ...accountCurrencies])).sort();
    const baseRow = bodyEl.createDiv({ cls: "accounting-currency-base" });
    baseRow.createEl("span", { text: "\u672C\u4F4D\u5E01", cls: "accounting-ledger-card-title" });
    const baseSel = baseRow.createEl("select", { cls: "accounting-ledger-input accounting-currency-base-sel" });
    for (const c of baseOptions) {
      const o = baseSel.createEl("option", { text: c });
      o.value = c;
      if (c === baseCurrency) o.selected = true;
    }
    baseSel.onchange = async () => {
      try {
        await adapter.writeBaseCurrency(baseSel.value);
        new import_obsidian16.Notice(`\u672C\u4F4D\u5E01\u5DF2\u8BBE\u4E3A ${baseSel.value}`);
        await refresh();
      } catch (error) {
        new import_obsidian16.Notice(`\u8BBE\u7F6E\u5931\u8D25\uFF1A${error}`);
      }
    };
    bodyEl.createEl("div", { text: `\u5E01\u79CD\u4E0E\u6C47\u7387\u8868\uFF08\u2192 ${baseCurrency}\uFF09`, cls: "accounting-currency-section-title" });
    const rows = rateRowsFromTable(rates);
    const listEl = bodyEl.createDiv({ cls: "accounting-currency-rates" });
    let dirty = false;
    const setDirty = (d) => {
      dirty = d;
      saveBtn.setText(d ? "\u4FDD\u5B58\u6C47\u7387\u8868" : "\u5DF2\u4FDD\u5B58");
      saveBtn.disabled = !d;
      cancelBtn.style.display = d ? "" : "none";
    };
    const renderList = () => {
      listEl.empty();
      if (rows.length === 0) {
        listEl.createEl("p", { text: "\u6682\u65E0\u5E01\u79CD", cls: "accounting-ledger-empty" });
      }
      for (const [i, r] of rows.entries()) {
        const isNew = !!r.isNew;
        const row = listEl.createDiv({ cls: "accounting-currency-rate-row" });
        if (isNew) {
          const curIn = row.createEl("input", { cls: "accounting-ledger-input accounting-currency-cur" });
          curIn.type = "text";
          curIn.value = r.currency;
          curIn.placeholder = "\u5E01\u79CD";
          curIn.addEventListener("input", () => {
            r.currency = curIn.value.toUpperCase();
            setDirty(true);
          });
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
          const dateIn = row.createEl("input", { cls: "accounting-ledger-input accounting-currency-date" });
          dateIn.type = "date";
          dateIn.value = r.asOf;
          dateIn.addEventListener("input", () => {
            r.asOf = dateIn.value;
            setDirty(true);
          });
          row.createEl("span", { text: "\u5220\u9664", cls: "accounting-currency-btn-spacer" });
        } else {
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
          const dateIn = row.createEl("input", { cls: "accounting-ledger-input accounting-currency-date" });
          dateIn.type = "date";
          dateIn.value = r.asOf;
          dateIn.addEventListener("input", () => {
            r.asOf = dateIn.value;
            setDirty(true);
          });
          const delBtn = row.createEl("button", { text: "\u5220\u9664", cls: "accounting-ledger-delete" });
          delBtn.onclick = () => {
            rows.splice(i, 1);
            setDirty(true);
            renderList();
          };
        }
      }
    };
    renderList();
    const actions = bodyEl.createDiv({ cls: "accounting-ledger-card-actions" });
    const addBtn = actions.createEl("button", { text: "\uFF0B \u6DFB\u52A0\u5E01\u79CD", cls: "accounting-ledger-create" });
    addBtn.onclick = () => {
      rows.push({ id: crypto.randomUUID(), currency: "", rate: "", asOf: todayDateStr(), isNew: true });
      setDirty(true);
      renderList();
    };
    const saveBtn = actions.createEl("button", { text: "\u5DF2\u4FDD\u5B58", cls: "accounting-currency-save" });
    saveBtn.disabled = true;
    const cancelBtn = actions.createEl("button", { text: "\u53D6\u6D88", cls: "accounting-currency-cancel" });
    cancelBtn.style.display = "none";
    cancelBtn.onclick = () => {
      void refresh();
    };
    saveBtn.onclick = async () => {
      const { invalid, duplicates, missingRate, emptyRows, baseRows } = validateRateRows(rows, baseCurrency);
      if (emptyRows > 0) {
        new import_obsidian16.Notice(`\u6709 ${emptyRows} \u884C\u5E01\u79CD\u672A\u586B\u5199\uFF0C\u8BF7\u586B\u5199\u6216\u5220\u9664`, 5e3);
        return;
      }
      if (invalid.length > 0) {
        new import_obsidian16.Notice(`\u65E0\u6548\u5E01\u79CD\uFF08\u975E ISO 4217 \u5E01\u79CD\u4EE3\u7801\uFF09\uFF1A${invalid.join(", ")}`, 5e3);
        return;
      }
      if (baseRows.length > 0) {
        new import_obsidian16.Notice(`\u672C\u4F4D\u5E01 ${baseCurrency} \u65E0\u9700\u5728\u6C47\u7387\u8868\u4E2D\u7EF4\u62A4\uFF0C\u8BF7\u5220\u9664\u8BE5\u884C`, 5e3);
        return;
      }
      if (missingRate.length > 0) {
        new import_obsidian16.Notice(`\u4EE5\u4E0B\u5E01\u79CD\u7F3A\u5C11\u6709\u6548\u6C47\u7387\uFF1A${missingRate.join(", ")}`, 5e3);
        return;
      }
      if (duplicates.length > 0) {
        new import_obsidian16.Notice(`\u91CD\u590D\u5E01\u79CD\uFF1A${duplicates.join(", ")}`, 5e3);
        return;
      }
      try {
        await adapter.writeRates(rateRowsToTable(rows, baseCurrency));
        new import_obsidian16.Notice("\u5DF2\u4FDD\u5B58\u6C47\u7387\u8868");
        setDirty(false);
        await refresh();
      } catch (error) {
        new import_obsidian16.Notice(`\u4FDD\u5B58\u5931\u8D25\uFF1A${error}`, 5e3);
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
          new import_obsidian16.Notice(`\u4FDD\u5B58\u5931\u8D25\uFF1A${e}`);
        }
      };
      btnRow.createEl("span", { text: "\u81EA\u52A8\u5237\u65B0\u6C47\u7387\uFF08\u6BCF\u5929\uFF09", cls: "accounting-currency-online-label" });
      const btn = btnRow.createEl("button", { text: "\u5237\u65B0\u6C47\u7387", cls: "accounting-ledger-refresh" });
      btn.onclick = async () => {
        btn.disabled = true;
        btn.setText("\u5237\u65B0\u4E2D\u2026");
        try {
          const url = `https://api.frankfurter.app/latest?from=${baseCurrency.toUpperCase()}`;
          const resp = await (0, import_obsidian16.requestUrl)({ url, method: "GET" });
          const fetched = parseRateResponse(resp.json, baseCurrency, nowISO());
          if (!fetched) {
            new import_obsidian16.Notice("\u54CD\u5E94\u89E3\u6790\u5931\u8D25\uFF0C\u5DF2\u4FDD\u7559\u65E2\u6709\u6C47\u7387\u8868");
            return;
          }
          const currentVisible = rows.map((r) => r.currency.trim().toUpperCase()).filter((c) => c && c !== baseCurrency);
          const { merged, updated } = mergeRatesByVisible(rates, fetched, currentVisible);
          if (updated === 0) {
            new import_obsidian16.Notice("\u54CD\u5E94\u4E2D\u6CA1\u6709\u5173\u5FC3\u7684\u5E01\u79CD\uFF0C\u5DF2\u4FDD\u7559\u65E2\u6709\u6C47\u7387\u8868");
            return;
          }
          await adapter.writeRates(merged);
          const next = { ...cfg, lastSuccess: nowISO() };
          await adapter.writeRateConfig(next);
          new import_obsidian16.Notice(`\u5DF2\u5237\u65B0 ${updated} \u4E2A\u5E01\u79CD\u6C47\u7387`);
          await refresh();
        } catch (e) {
          new import_obsidian16.Notice(`\u5237\u65B0\u5931\u8D25\uFF1A${e}`);
        } finally {
          btn.disabled = false;
          btn.setText("\u5237\u65B0\u6C47\u7387");
        }
      };
      if (cfg.lastSuccess) {
        const timeRow = onlineEl.createDiv({ cls: "accounting-currency-online-row" });
        timeRow.createEl("span", { text: formatLocalTimestamp(cfg.lastSuccess), cls: "accounting-currency-online-label" });
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
        await adapter.createLedger(name, alias || void 0);
        await onDone(name, alias);
      } catch (error) {
        new import_obsidian16.Notice(`\u65B0\u5EFA\u8D26\u672C\u5931\u8D25\uFF1A${error}`);
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
        new import_obsidian16.Notice(`\u5DF2\u66F4\u65B0\u522B\u540D\uFF1A${alias || folder}`);
        await onDone();
      } catch (error) {
        new import_obsidian16.Notice(`\u6539\u540D\u5931\u8D25\uFF1A${error}`);
      }
    });
    modal.open();
  }
  /** 重新运行账本引导：清除 onboardingCompleted 标记，下次启动时重新显示引导 */
  async handleResetOnboarding() {
    if (!confirm("\u786E\u8BA4\u91CD\u65B0\u8FD0\u884C\u8D26\u672C\u5F15\u5BFC\uFF1F\u8FD9\u5C06\u6E05\u9664\u5F15\u5BFC\u5B8C\u6210\u6807\u8BB0\uFF0C\u4E0B\u6B21\u542F\u52A8\u63D2\u4EF6\u65F6\u5C06\u91CD\u65B0\u663E\u793A\u5F15\u5BFC\u3002")) return;
    try {
      this.plugin.settings.onboardingCompleted = false;
      await this.plugin.saveSettings();
      new import_obsidian16.Notice("\u5DF2\u6E05\u9664\u5F15\u5BFC\u6807\u8BB0\uFF0C\u4E0B\u6B21\u542F\u52A8\u63D2\u4EF6\u65F6\u5C06\u91CD\u65B0\u663E\u793A\u5F15\u5BFC");
    } catch (error) {
      new import_obsidian16.Notice(`\u64CD\u4F5C\u5931\u8D25\uFF1A${error}`);
    }
  }
  /** 删除账本：两步 confirm，递归删整目录 */
  async handleDeleteLedger(folder, alias, onDone) {
    if (!confirm(`\u786E\u8BA4\u5220\u9664\u8D26\u672C\u300C${alias}\u300D\uFF1F\u6574\u76EE\u5F55\u542B backups \u5C06\u6C38\u4E45\u5220\u9664\u3002`)) return;
    if (!confirm(`\u6700\u540E\u786E\u8BA4\uFF1A\u6C38\u4E45\u5220\u9664\u300C${alias}\u300D\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002`)) return;
    const adapter = this.currentAdapter();
    try {
      await adapter.deleteLedger(folder);
      new import_obsidian16.Notice(`\u5DF2\u5220\u9664\u8D26\u672C\uFF1A${alias}`);
      await onDone();
    } catch (error) {
      new import_obsidian16.Notice(`\u5220\u9664\u5931\u8D25\uFF1A${error}`);
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
      new import_obsidian16.Notice(`\u52A0\u8F7D\u5907\u4EFD\u5217\u8868\u5931\u8D25\uFF1A${error}`);
    }
  }
  /** 处理恢复备份（两步确认；adapter.restoreBackup 内部自动创建 pre-restore 兜底） */
  async handleRestoreBackup(adapter, backupName) {
    if (!confirm(`\u6062\u590D\u5907\u4EFD\u300C${backupName}\u300D\uFF1F

\u6062\u590D\u5C06\u66FF\u6362\u5F53\u524D\u6570\u636E\uFF0C\u662F\u5426\u7EE7\u7EED\uFF1F`)) return;
    if (!confirm(`\u6700\u540E\u786E\u8BA4\uFF1A\u6062\u590D\u300C${backupName}\u300D\uFF1F

\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\uFF08\u6062\u590D\u524D\u4F1A\u81EA\u52A8\u521B\u5EFA pre-restore \u515C\u5E95\u5907\u4EFD\uFF09\u3002`)) return;
    try {
      await adapter.restoreBackup(backupName);
      new import_obsidian16.Notice(`\u5DF2\u6062\u590D\u5907\u4EFD\uFF1A${backupName}\uFF0C\u8BF7\u5173\u95ED\u5E76\u91CD\u65B0\u6253\u5F00\u8BB0\u8D26\u754C\u9762`);
    } catch (error) {
      new import_obsidian16.Notice(`\u6062\u590D\u5931\u8D25\uFF1A${error}`);
    }
  }
  /** 处理删除备份（单步确认） */
  async handleDeleteBackup(adapter, backupName) {
    if (!confirm(`\u5220\u9664\u5907\u4EFD\u300C${backupName}\u300D\uFF1F`)) return false;
    try {
      await adapter.deleteBackup(backupName);
      new import_obsidian16.Notice(`\u5DF2\u5220\u9664\u5907\u4EFD\uFF1A${backupName}`);
      return true;
    } catch (error) {
      new import_obsidian16.Notice(`\u5220\u9664\u5931\u8D25\uFF1A${error}`);
      return false;
    }
  }
  /** 渲染周期账列表视图 */
  renderRecurringListView(containerEl) {
    const cardEl = containerEl.createDiv("accounting-ledger-card");
    const headEl = cardEl.createDiv("accounting-ledger-card-head");
    headEl.createEl("span", { text: "\u5468\u671F\u8D26\u89C4\u5219", cls: "accounting-ledger-card-title" });
    const headActions = headEl.createDiv("accounting-ledger-head-actions");
    const createBtn = headActions.createEl("button", { text: "+ \u65B0\u5EFA\u89C4\u5219", cls: "accounting-ledger-create" });
    const refreshBtn = headActions.createEl("button", { text: "\u21BB \u5237\u65B0", cls: "accounting-ledger-refresh" });
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
            text: "\u6682\u65E0\u5468\u671F\u8D26\u89C4\u5219",
            cls: "accounting-ledger-empty"
          });
          return;
        }
        if (active.length > 0) {
          const sectionEl = listEl.createDiv("accounting-recurring-section");
          sectionEl.createEl("h3", { text: `\u8FDB\u884C\u4E2D (${active.length})` });
          for (const rule of active) {
            await this.renderRuleItem(sectionEl, rule, adapter, refreshRules);
          }
        }
        if (inactive.length > 0) {
          const sectionEl = listEl.createDiv("accounting-recurring-section");
          const details = sectionEl.createEl("details", { cls: "accounting-details" });
          details.createEl("summary", { text: `\u5DF2\u6682\u505C (${inactive.length})`, cls: "accounting-collapsible-head" });
          for (const rule of inactive) {
            await this.renderRuleItem(details, rule, adapter, refreshRules);
          }
        }
      } catch (error) {
        listEl.empty();
        listEl.createEl("p", {
          text: `\u52A0\u8F7D\u5931\u8D25\uFF1A${error}`,
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
      new import_obsidian16.Notice("\u5468\u671F\u8D26\u89C4\u5219\u5DF2\u5237\u65B0");
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
      titleEl.createEl("span", { text: "\u5DF2\u6682\u505C", cls: "accounting-ledger-badge accounting-ledger-badge-muted" });
    }
    const detailEl = infoEl.createDiv("accounting-ledger-folder");
    detailEl.createEl("span", { text: `${this.periodText(rule)} \xB7 \xA5${this.formatMoney(rule.amount)}` });
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
        bottomEl.createEl("span", { text: "\u4E0B\u4E00\u671F\uFF1A" });
        bottomEl.createEl("span", { text: formatDateOnly(next), cls: "accounting-ledger-next-date" });
      }
    }
    const actionsEl = bottomEl.createDiv("accounting-ledger-actions");
    const viewBtn = actionsEl.createEl("button", {
      text: "\u{1F441}",
      cls: "accounting-ledger-switch"
    });
    viewBtn.setAttribute("aria-label", "\u67E5\u770B\u8BE5\u89C4\u5219\u751F\u6210\u7684\u6D41\u6C34");
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
        new import_obsidian16.Notice(rule.active ? "\u5DF2\u6682\u505C" : "\u5DF2\u542F\u7528");
        void refreshRules();
      } catch (error) {
        new import_obsidian16.Notice(`\u64CD\u4F5C\u5931\u8D25\uFF1A${error}`);
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
      if (!confirm(`\u786E\u5B9A\u5220\u9664\u5468\u671F\u8D26\u89C4\u5219\u300C${rule.name}\u300D\uFF1F\u5DF2\u751F\u6210\u7684\u4EA4\u6613\u4E0D\u4F1A\u88AB\u5220\u9664\u3002`)) return;
      try {
        const rules = await adapter.readRecurringRules();
        await adapter.writeRecurringRules(rules.filter((r) => r.id !== rule.id));
        new import_obsidian16.Notice("\u5DF2\u5220\u9664");
        void refreshRules();
      } catch (error) {
        new import_obsidian16.Notice(`\u5220\u9664\u5931\u8D25\uFF1A${error}`);
      }
    };
  }
  typeLabel(type) {
    switch (type) {
      case "expense":
        return "\u652F\u51FA";
      case "income":
        return "\u6536\u5165";
      case "transfer":
        return "\u8F6C\u8D26";
      case "loan":
        return "\u501F\u8D37";
    }
  }
  periodText(rule) {
    if (rule.period === "monthly") {
      return `\u6BCF\u6708 ${rule.dayOfMonth} \u65E5`;
    } else if (rule.period === "weekly") {
      const weekdays = ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"];
      return `\u6BCF\u5468 ${weekdays[rule.dayOfWeek ?? 0]}`;
    } else if (rule.period === "yearly") {
      return `\u6BCF\u5E74 ${rule.monthOfYear} \u6708 ${rule.dayOfYear} \u65E5`;
    }
    return "";
  }
  formatMoney(amount) {
    return amount.toFixed(2);
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
        const refCountOf = (name) => folded.filter((t) => t.category === name).length;
        rootEl.empty();
        this.renderCategoryFlowBlock(rootEl, {
          flow: "expense",
          title: "\u652F\u51FA\u5206\u7C7B",
          placeholder: "\u4F8B\u5982\uFF1A\u9910\u996E",
          addLabel: "+ \u65B0\u5EFA\u652F\u51FA",
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
          title: "\u6536\u5165\u5206\u7C7B",
          placeholder: "\u4F8B\u5982\uFF1A\u5DE5\u8D44",
          addLabel: "+ \u65B0\u5EFA\u6536\u5165",
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
        rootEl.createEl("p", { text: `\u52A0\u8F7D\u5931\u8D25\uFF1A${error}`, cls: "accounting-ledger-empty" });
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
    const refreshBtn = headActions.createEl("button", { text: "\u21BB \u5237\u65B0", cls: "accounting-ledger-refresh" });
    headEl.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      const next = !cardEl.classList.contains("accounting-cat-collapsed");
      cardEl.classList.toggle("accounting-cat-collapsed", next);
      onToggleCollapse(next);
    });
    const listEl = cardEl.createDiv("accounting-ledger-list");
    if (visible.length === 0) {
      listEl.createEl("div", { text: `\u6682\u65E0${title}`, cls: "accounting-cat-group-empty" });
    }
    for (const c of visible) this.renderCategoryItem(listEl, c, refCountOf(c.name), categories, refreshCategories);
    if (hidden.length > 0) {
      const details = cardEl.createEl("details", { cls: "accounting-cat-hidden-section" });
      const summary = details.createEl("summary", { cls: "accounting-cat-hidden-head accounting-collapsible-head" });
      summary.createEl("span", { text: "\u5DF2\u9690\u85CF" });
      summary.createEl("span", { text: String(hidden.length), cls: "accounting-ledger-badge accounting-ledger-badge-muted" });
      summary.createEl("span", {
        text: "\u4E0D\u51FA\u73B0\u5728\u8BB0\u8D26\u4E0B\u62C9\uFF0C\u4F46\u4FDD\u7559\u5386\u53F2\u4EA4\u6613\u5F15\u7528",
        cls: "accounting-cat-hidden-note"
      });
      for (const c of hidden) this.renderHiddenCategoryItem(details, c, refCountOf(c.name), refreshCategories);
    }
    createBtn.onclick = () => {
      new CreateCategoryModal(this.app, flow, title, placeholder, async (name) => {
        try {
          await this.handleAddCategory(name, flow);
          new import_obsidian16.Notice(`\u5DF2\u6DFB\u52A0\u5206\u7C7B\u300C${name}\u300D`);
          await refreshCategories();
        } catch (error) {
          new import_obsidian16.Notice(`\u6DFB\u52A0\u5931\u8D25\uFF1A${error}`);
        }
      }).open();
    };
    refreshBtn.onclick = async () => {
      await refreshCategories();
      new import_obsidian16.Notice(`${title}\u5DF2\u5237\u65B0`);
    };
  }
  /** 可见分类行：重命名 / 合并 / 删除（删除双态：被引用→隐藏，未引用→物理删） */
  renderCategoryItem(containerEl, cat, refCount, allCategories, refresh) {
    const itemEl = containerEl.createDiv("accounting-ledger-item");
    const infoEl = itemEl.createDiv("accounting-ledger-info");
    infoEl.createEl("div", { text: cat.name, cls: "accounting-ledger-name" });
    const actionsEl = itemEl.createDiv("accounting-ledger-actions accounting-cat-actions");
    const renameBtn = actionsEl.createEl("button", { text: "\u270E", cls: "accounting-ledger-rename" });
    renameBtn.setAttribute("aria-label", "\u91CD\u547D\u540D");
    renameBtn.onclick = () => {
      new RenameCategoryModal(this.app, cat, async (newName) => {
        try {
          const { rewritten } = await this.handleRenameCategory(cat.id, newName);
          new import_obsidian16.Notice(rewritten > 0 ? `\u5DF2\u6539\u540D\uFF0C\u91CD\u5199 ${rewritten} \u6761\u5386\u53F2\u4EA4\u6613` : `\u5DF2\u6539\u540D`);
          await refresh();
        } catch (error) {
          new import_obsidian16.Notice(`\u6539\u540D\u5931\u8D25\uFF1A${error}`);
        }
      }).open();
    };
    const targets = allCategories.filter((x) => x.flow === cat.flow && x.id !== cat.id).sort((a, b) => a.name.localeCompare(b.name, "zh"));
    const mergeBtn = actionsEl.createEl("button", { text: "\u2934", cls: "accounting-ledger-merge" });
    mergeBtn.setAttribute("aria-label", "\u5408\u5E76\u5230\u5176\u4ED6\u5206\u7C7B");
    mergeBtn.onclick = () => {
      if (targets.length === 0) {
        new import_obsidian16.Notice("\u6CA1\u6709\u540C\u7C7B\u578B\uFF08\u652F\u51FA/\u6536\u5165\uFF09\u7684\u5176\u4ED6\u5206\u7C7B\u53EF\u5408\u5E76");
        return;
      }
      new MergeCategoryModal(this.app, cat, targets, refCount, async (toId) => {
        try {
          const { rewritten } = await this.handleMergeCategory(cat.id, toId);
          new import_obsidian16.Notice(rewritten > 0 ? `\u5DF2\u5408\u5E76\uFF0C\u6539\u5199 ${rewritten} \u6761\u5386\u53F2\u4EA4\u6613` : `\u5DF2\u5408\u5E76`);
          await refresh();
        } catch (error) {
          new import_obsidian16.Notice(`\u5408\u5E76\u5931\u8D25\uFF1A${error}`);
        }
      }).open();
    };
    const deleteBtn = actionsEl.createEl("button", { text: "\u{1F5D1}", cls: "accounting-ledger-delete" });
    deleteBtn.setAttribute("aria-label", "\u5220\u9664\u5206\u7C7B");
    deleteBtn.onclick = async () => {
      try {
        await this.handleDeleteCategory(cat, refCount);
        await refresh();
      } catch (error) {
        new import_obsidian16.Notice(`\u5220\u9664\u5931\u8D25\uFF1A${error}`);
      }
    };
  }
  /** 已隐藏分类行：恢复；未被引用时允许彻底删除 */
  renderHiddenCategoryItem(containerEl, cat, refCount, refresh) {
    const itemEl = containerEl.createDiv("accounting-ledger-item");
    const infoEl = itemEl.createDiv("accounting-ledger-info");
    infoEl.createEl("div", { text: cat.name, cls: "accounting-ledger-folder" });
    const actionsEl = itemEl.createDiv("accounting-ledger-actions accounting-cat-actions");
    const restoreBtn = actionsEl.createEl("button", { text: "\u6062\u590D", cls: "accounting-ledger-restore" });
    restoreBtn.onclick = async () => {
      try {
        await this.handleRestoreCategory(cat);
        new import_obsidian16.Notice(`\u5DF2\u6062\u590D\u300C${cat.name}\u300D`);
        await refresh();
      } catch (error) {
        new import_obsidian16.Notice(`\u6062\u590D\u5931\u8D25\uFF1A${error}`);
      }
    };
    if (refCount === 0) {
      const delBtn = actionsEl.createEl("button", { text: "\u{1F5D1}", cls: "accounting-ledger-delete" });
      delBtn.setAttribute("aria-label", "\u5F7B\u5E95\u5220\u9664\u5206\u7C7B");
      delBtn.onclick = async () => {
        try {
          await this.handleDeleteCategory(cat, 0);
          await refresh();
        } catch (error) {
          new import_obsidian16.Notice(`\u5220\u9664\u5931\u8D25\uFF1A${error}`);
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
      if (!confirm(`\u5206\u7C7B\u300C${cat.name}\u300D\u5DF2\u88AB ${refCount} \u6761\u4EA4\u6613\u4F7F\u7528\uFF0C\u5C06\u9690\u85CF\uFF08\u4E0D\u5F71\u54CD\u5386\u53F2\u4EA4\u6613\uFF09\uFF0C\u662F\u5426\u7EE7\u7EED\uFF1F`)) return;
      const next = categories.map((c) => c.id === cat.id ? { ...c, active: false } : c);
      await adapter.writeMeta({ accounts, categories: next });
      new import_obsidian16.Notice(`\u5DF2\u9690\u85CF\u300C${cat.name}\u300D`);
    } else {
      if (!confirm(`\u5F7B\u5E95\u5220\u9664\u5206\u7C7B\u300C${cat.name}\u300D\uFF1F`)) return;
      const next = categories.filter((c) => c.id !== cat.id);
      await adapter.writeMeta({ accounts, categories: next });
      new import_obsidian16.Notice(`\u5DF2\u5220\u9664\u300C${cat.name}\u300D`);
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
   * 渲染账户类型管理卡片。tap-based 编辑（不拖拽）：分组/类型排序用上移/下移按钮，类型换组用分组下拉。
   * 本地 draft + dirty 跟踪；保存走 saveAccountTypeDraft（含备份），取消重新读入丢弃草稿。
   * 复用 core 默认值/归一化与既有 adapter 读写方法，不重新实现归一化、不新增 adapter 方法。
   */
  renderAccountTypeView(containerEl) {
    const cardEl = containerEl.createDiv("accounting-ledger-card accounting-cat-flow-card accounting-cat-collapsed");
    const headEl = cardEl.createDiv("accounting-ledger-card-head");
    headEl.createEl("span", { cls: "accounting-cat-toggle" });
    headEl.createEl("span", { text: "\u8D26\u6237\u7C7B\u578B", cls: "accounting-ledger-card-title" });
    const badgeEl = headEl.createEl("span", { cls: "accounting-ledger-badge accounting-ledger-badge-muted" });
    const headActions = headEl.createDiv("accounting-ledger-head-actions");
    const resetBtn = headActions.createEl("button", { text: "\u6062\u590D\u9ED8\u8BA4", cls: "accounting-ledger-refresh" });
    const refreshBtn = headActions.createEl("button", { text: "\u21BB \u5237\u65B0", cls: "accounting-ledger-refresh" });
    const bodyEl = cardEl.createDiv("accounting-ledger-list");
    headEl.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      cardEl.classList.toggle("accounting-cat-collapsed");
    });
    let draft = defaultAccountTypeSettings();
    let baseline = JSON.stringify(draft);
    let footerEl = null;
    let saveBtn = null;
    let cancelBtn = null;
    const dirty = () => JSON.stringify(draft) !== baseline;
    const syncFooter = () => {
      if (!footerEl || !saveBtn || !cancelBtn) return;
      const d = dirty();
      saveBtn.disabled = !d;
      cancelBtn.style.display = d ? "" : "none";
    };
    const renderList = () => {
      bodyEl.empty();
      badgeEl.setText(String(draft.types.filter((t) => t.active !== false).length));
      for (const group of draft.groups) {
        this.renderAccountTypeGroup(bodyEl, group, draft, {
          onGroupLabel: (label) => {
            draft = setGroupLabel(draft, group.id, label);
            syncFooter();
          },
          onMoveGroup: (dir) => {
            draft = moveGroup(draft, group.id, dir);
            renderList();
          },
          onRemoveGroup: () => {
            if (draft.groups.length <= 1) return;
            const fallback = draft.groups.find((g) => g.id !== group.id);
            if (!confirm(`\u5220\u9664\u5206\u7EC4\u300C${group.label}\u300D\uFF1F\u5176\u4E0B\u7C7B\u578B\u5C06\u8FC1\u79FB\u5230\u300C${fallback?.label ?? "\u9996\u4E2A\u5269\u4F59\u5206\u7EC4"}\u300D\u3002`)) return;
            draft = removeGroup(draft, group.id);
            renderList();
          },
          onTypeLabel: (type, label) => {
            draft = setTypeLabel(draft, type, label);
            syncFooter();
          },
          onRegroup: (type, label) => {
            new RegroupTypeModal(this.app, label, group.id, draft.groups, async (groupId) => {
              draft = setTypeGroup(draft, type, groupId);
              renderList();
            }).open();
          },
          onMoveType: (type, dir) => {
            draft = moveType(draft, type, dir);
            renderList();
          },
          onToggleActive: (type) => {
            draft = setTypeActive(draft, type, false);
            renderList();
          }
        });
      }
      const addRow = bodyEl.createDiv("accounting-at-add-group");
      const nameInput = addRow.createEl("input", { cls: "accounting-ledger-input" });
      nameInput.type = "text";
      nameInput.placeholder = "\u65B0\u5206\u7EC4\u540D\u79F0";
      const addBtn = addRow.createEl("button", { text: "\uFF0B \u65B0\u589E\u5206\u7EC4", cls: "accounting-ledger-create" });
      addBtn.disabled = true;
      nameInput.addEventListener("input", () => {
        addBtn.disabled = !nameInput.value.trim();
      });
      addBtn.onclick = () => {
        const label = nameInput.value.trim();
        if (!label) return;
        draft = addGroup(draft, label);
        nameInput.value = "";
        addBtn.disabled = true;
        renderList();
      };
      const inactive = draft.types.filter((t) => t.active === false);
      if (inactive.length > 0) {
        const details = bodyEl.createEl("details");
        details.createEl("summary", { text: `\u5DF2\u505C\u7528\uFF08${inactive.length}\uFF09`, cls: "accounting-collapsible-head" });
        for (const t of inactive) {
          const row = details.createDiv("accounting-at-type");
          const info = row.createDiv("accounting-at-type-info");
          const labelIn = info.createEl("input", { cls: "accounting-ledger-input" });
          labelIn.value = t.label;
          labelIn.addEventListener("input", () => {
            draft = setTypeLabel(draft, t.type, labelIn.value);
            syncFooter();
          });
          const actions = row.createDiv("accounting-ledger-actions");
          const enableBtn = actions.createEl("button", { text: "\u542F\u7528", cls: "accounting-ledger-create" });
          enableBtn.onclick = () => {
            draft = setTypeActive(draft, t.type, true);
            renderList();
          };
        }
      }
      footerEl = bodyEl.createDiv("accounting-ledger-card-actions");
      const saveBtnEl = footerEl.createEl("button", { text: "\u4FDD\u5B58", cls: "accounting-currency-save" });
      const cancelBtnEl = footerEl.createEl("button", { text: "\u53D6\u6D88", cls: "accounting-currency-cancel" });
      saveBtn = saveBtnEl;
      cancelBtn = cancelBtnEl;
      saveBtnEl.onclick = async () => {
        if (saveBtnEl.disabled) return;
        saveBtnEl.disabled = true;
        try {
          await this.saveAccountTypeDraft(draft);
          baseline = JSON.stringify(draft);
          new import_obsidian16.Notice("\u5DF2\u4FDD\u5B58\u8D26\u6237\u7C7B\u578B");
        } catch (error) {
          new import_obsidian16.Notice(`\u4FDD\u5B58\u5931\u8D25\uFF1A${error}`);
        } finally {
          renderList();
        }
      };
      cancelBtnEl.onclick = () => {
        void refresh();
      };
      syncFooter();
    };
    const refresh = async () => {
      try {
        draft = await this.loadAccountTypeDraft();
        baseline = JSON.stringify(draft);
        renderList();
      } catch (error) {
        bodyEl.empty();
        bodyEl.createEl("p", { text: `\u52A0\u8F7D\u8D26\u6237\u7C7B\u578B\u5931\u8D25\uFF1A${error}`, cls: "accounting-ledger-empty" });
      }
    };
    refreshBtn.onclick = async () => {
      await refresh();
      new import_obsidian16.Notice("\u8D26\u6237\u7C7B\u578B\u5DF2\u5237\u65B0");
    };
    resetBtn.onclick = () => {
      if (!confirm("\u6062\u590D\u4E3A\u9ED8\u8BA4\u8D26\u6237\u7C7B\u578B\u914D\u7F6E\uFF1F\u5F53\u524D\u7684\u81EA\u5B9A\u4E49\u5206\u7EC4\u3001\u6807\u7B7E\u4E0E\u987A\u5E8F\u5C06\u88AB\u8986\u76D6\u3002")) return;
      draft = defaultAccountTypeSettings();
      renderList();
    };
    void refresh();
  }
  /** 渲染单个类型分组区块：改名 + 类型计数 + 上移/下移 + 删除分组，组内类型行（label + 重分组/上移/下移/停用）。 */
  renderAccountTypeGroup(parent, group, draft, cb) {
    const groupIdx = draft.groups.findIndex((g) => g.id === group.id);
    const groupTypes = draft.types.filter((t) => t.groupId === group.id && t.active !== false);
    const block = parent.createDiv("accounting-at-group");
    const head = block.createDiv("accounting-at-group-head");
    const nameInput = head.createEl("input", { cls: "accounting-ledger-input accounting-at-group-name" });
    nameInput.type = "text";
    nameInput.value = group.label;
    nameInput.addEventListener("input", () => cb.onGroupLabel(nameInput.value));
    head.createEl("span", { text: String(groupTypes.length), cls: "accounting-ledger-badge accounting-ledger-badge-muted" });
    const actions = head.createDiv("accounting-ledger-actions");
    const upBtn = actions.createEl("button", { text: "\u2191" });
    upBtn.disabled = groupIdx <= 0;
    upBtn.setAttribute("aria-label", "\u4E0A\u79FB\u5206\u7EC4");
    upBtn.onclick = () => cb.onMoveGroup(-1);
    const downBtn = actions.createEl("button", { text: "\u2193" });
    downBtn.disabled = groupIdx >= draft.groups.length - 1;
    downBtn.setAttribute("aria-label", "\u4E0B\u79FB\u5206\u7EC4");
    downBtn.onclick = () => cb.onMoveGroup(1);
    const delBtn = actions.createEl("button", { text: "\u5220\u9664\u5206\u7EC4", cls: "accounting-ledger-delete" });
    delBtn.disabled = draft.groups.length <= 1;
    delBtn.onclick = () => cb.onRemoveGroup();
    const typesEl = block.createDiv("accounting-at-types");
    if (groupTypes.length === 0) {
      typesEl.createEl("div", { text: "\uFF08\u7A7A\u5206\u7EC4\uFF0C\u53EF\u628A\u7C7B\u578B\u8C03\u5230\u6B64\u7EC4\u6216\u5220\u9664\uFF09", cls: "accounting-at-empty" });
    }
    groupTypes.forEach((t, i) => {
      const row = typesEl.createDiv("accounting-at-type");
      const moveActions = row.createDiv("accounting-ledger-actions");
      const tUp = moveActions.createEl("button", { text: "\u2191" });
      tUp.disabled = i <= 0;
      tUp.setAttribute("aria-label", "\u4E0A\u79FB\u7C7B\u578B");
      tUp.onclick = () => cb.onMoveType(t.type, -1);
      const tDown = moveActions.createEl("button", { text: "\u2193" });
      tDown.disabled = i >= groupTypes.length - 1;
      tDown.setAttribute("aria-label", "\u4E0B\u79FB\u7C7B\u578B");
      tDown.onclick = () => cb.onMoveType(t.type, 1);
      const info = row.createDiv("accounting-at-type-info");
      const labelIn = info.createEl("input", { cls: "accounting-ledger-input" });
      labelIn.value = t.label;
      labelIn.addEventListener("input", () => cb.onTypeLabel(t.type, labelIn.value));
      const rowActions = row.createDiv("accounting-ledger-actions");
      const regroupBtn = rowActions.createEl("button", { text: "\u91CD\u5206\u7EC4" });
      regroupBtn.disabled = draft.groups.length <= 1;
      regroupBtn.setAttribute("aria-label", "\u79FB\u52A8\u5230\u5176\u5B83\u5206\u7EC4");
      regroupBtn.onclick = () => cb.onRegroup(t.type, t.label);
      const stopBtn = rowActions.createEl("button", { text: "\u505C\u7528" });
      stopBtn.onclick = () => cb.onToggleActive(t.type);
    });
  }
};
var CreateLedgerModal = class extends import_obsidian16.Modal {
  constructor(app, existing, onSubmit) {
    super(app);
    this.existing = existing;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian16.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
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
var RenameLedgerAliasModal = class extends import_obsidian16.Modal {
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
    if (!import_obsidian16.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: "\u6539\u8D26\u672C\u522B\u540D" });
    this.input = contentEl.createEl("input", { type: "text", cls: "accounting-ledger-input" });
    this.input.value = this.currentAlias;
    this.input.placeholder = this.folder;
    const actions = contentEl.createDiv("accounting-modal-actions");
    const cancelBtn = actions.createEl("button", { text: "\u53D6\u6D88", cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
    const submitBtn = actions.createEl("button", { text: "\u4FDD\u5B58", cls: "accounting-btn-primary" });
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
var BackupModal = class extends import_obsidian16.Modal {
  constructor(app, backups, onAction) {
    super(app);
    this.backups = backups;
    this.onAction = onAction;
  }
  onOpen() {
    this.modalEl.addClass("accounting-sub-modal");
    if (!import_obsidian16.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
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
    contentEl.createEl("h2", { text: "\u9009\u62E9\u5907\u4EFD\u6062\u590D" });
    if (this.backups.length === 0) {
      contentEl.createEl("p", { text: "\u6682\u65E0\u5907\u4EFD" });
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
        const restoreBtn = actions.createEl("button", { text: "\u6062\u590D" });
        restoreBtn.onclick = () => {
          void this.onAction(backup.name, "restore");
        };
        const deleteBtn = actions.createEl("button", { text: "\u5220\u9664", cls: "accounting-ledger-delete" });
        deleteBtn.onclick = () => {
          void this.onAction(backup.name, "delete");
        };
      }
    }
    const closeWrap = contentEl.createDiv("accounting-modal-close");
    const closeBtn = closeWrap.createEl("button", { text: "\u5173\u95ED", cls: "accounting-btn-secondary" });
    closeBtn.onclick = () => this.close();
  }
};
var CreateCategoryModal = class extends import_obsidian16.Modal {
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
    if (!import_obsidian16.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: `\u65B0\u5EFA${this.flowTitle}` });
    this.nameInput = contentEl.createEl("input", { type: "text", cls: "accounting-ledger-input" });
    this.nameInput.placeholder = this.placeholder;
    const actions = contentEl.createDiv("accounting-modal-actions");
    const cancelBtn = actions.createEl("button", { text: "\u53D6\u6D88", cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
    this.submitBtn = actions.createEl("button", { text: "\u65B0\u5EFA", cls: "accounting-btn-primary" });
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
var RenameCategoryModal = class extends import_obsidian16.Modal {
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
    if (!import_obsidian16.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: "\u91CD\u547D\u540D\u5206\u7C7B" });
    this.input = contentEl.createEl("input", { type: "text", cls: "accounting-ledger-input" });
    this.input.value = this.cat.name;
    const actions = contentEl.createDiv("accounting-modal-actions");
    const cancelBtn = actions.createEl("button", { text: "\u53D6\u6D88", cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
    const submitBtn = actions.createEl("button", { text: "\u4FDD\u5B58", cls: "accounting-btn-primary" });
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
var MergeCategoryModal = class extends import_obsidian16.Modal {
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
    if (!import_obsidian16.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: "\u5408\u5E76\u5206\u7C7B" });
    contentEl.createEl("div", {
      text: `\u5C06\u300C${this.from.name}\u300D\u7684\u5168\u90E8\u5386\u53F2\u6539\u5199\u5E76\u5165\u76EE\u6807\u5206\u7C7B\uFF0C\u539F\u5206\u7C7B\u5C06\u88AB\u5220\u9664\uFF08\u4E0D\u53EF\u64A4\u9500\uFF09`,
      cls: "accounting-ledger-folder"
    });
    this.targetSelect = contentEl.createEl("select", { cls: "accounting-ledger-input" });
    this.targetSelect.createEl("option", { value: "", text: "\u9009\u62E9\u76EE\u6807\u2026" });
    for (const t of this.targets) {
      this.targetSelect.createEl("option", {
        value: t.id,
        text: t.active === false ? `${t.name}\uFF08\u5DF2\u9690\u85CF\uFF09` : t.name
      });
    }
    this.errorEl = contentEl.createEl("div", { cls: "accounting-ledger-error" });
    const actions = contentEl.createDiv("accounting-modal-actions");
    const cancelBtn = actions.createEl("button", { text: "\u53D6\u6D88", cls: "accounting-btn-secondary" });
    cancelBtn.onclick = () => this.close();
    const submitBtn = actions.createEl("button", { text: "\u786E\u8BA4\u5408\u5E76", cls: "accounting-btn-primary" });
    submitBtn.onclick = async () => {
      const toId = this.targetSelect.value;
      if (!toId) {
        this.errorEl.setText("\u8BF7\u9009\u62E9\u76EE\u6807\u5206\u7C7B");
        return;
      }
      const target = this.targets.find((t) => t.id === toId);
      const note = this.refCount > 0 ? `\u5C06\u628A ${this.refCount} \u6761\u5386\u53F2\u4EA4\u6613\u6539\u5199\u4E3A\u300C${target?.name}\u300D\u3001\u6E90\u5206\u7C7B\u300C${this.from.name}\u300D\u5C06\u88AB\u5220\u9664\uFF0C\u4E0D\u53EF\u64A4\u9500\uFF08\u5DF2\u81EA\u52A8\u5907\u4EFD\uFF09` : `\u5C06\u5220\u9664\u6E90\u5206\u7C7B\u300C${this.from.name}\u300D\uFF08\u65E0\u5386\u53F2\u4EA4\u6613\u9700\u6539\u5199\uFF09\uFF0C\u4E0D\u53EF\u64A4\u9500`;
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
var RegroupTypeModal = class extends import_obsidian16.Modal {
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
    if (!import_obsidian16.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
    contentEl.createEl("h2", { text: "\u91CD\u5206\u7EC4" });
    contentEl.createEl("div", { text: `\u5C06\u300C${this.typeLabel}\u300D\u79FB\u52A8\u5230\uFF1A`, cls: "accounting-ledger-folder" });
    const list = contentEl.createDiv("accounting-backup-list");
    for (const g of this.groups) {
      const isCurrent = g.id === this.currentGroupId;
      const item = list.createDiv("accounting-backup-item");
      item.createEl("div", { text: g.label || g.id, cls: "accounting-backup-name" });
      if (isCurrent) {
        item.createEl("span", { text: "\u5F53\u524D", cls: "accounting-ledger-badge accounting-ledger-badge-muted" });
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
    const closeBtn = closeWrap.createEl("button", { text: "\u5173\u95ED", cls: "accounting-btn-secondary" });
    closeBtn.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/onboardingModal.ts
var import_obsidian17 = require("obsidian");
var OnboardingModal = class extends import_obsidian17.Modal {
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
    if (!import_obsidian17.Platform.isMobile) this.modalEl.addClass("accounting-desktop");
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
      this.renderLedgerSelection(existing);
    }
  }
  /** 无账本时：提供示例账本创建和手动创建两个选项 */
  renderEmptyState() {
    const { contentEl } = this;
    contentEl.empty();
    this.currentStep = "main";
    const titleEl = contentEl.createEl("h2", { text: "\u6B22\u8FCE" });
    titleEl.addClass("accounting-modal-title");
    contentEl.createEl("p", {
      text: "\u8BE5\u4F4D\u7F6E\u8FD8\u6CA1\u6709\u8D26\u672C\u3002\u60A8\u53EF\u4EE5\u5148\u6253\u5F00\u793A\u4F8B\u8D26\u672C\u5B66\u4E60\uFF0C\u6216\u521B\u5EFA\u81EA\u5DF1\u7684\u8D26\u672C\u3002",
      cls: "accounting-onboarding-desc"
    });
    const sampleBtn = contentEl.createEl("button", {
      text: "\u521B\u5EFA\u793A\u4F8B\u8D26\u672C\uFF08\u542B\u793A\u4F8B\u6570\u636E\uFF09",
      cls: "accounting-btn accounting-btn-primary accounting-btn-block"
    });
    sampleBtn.onclick = async () => {
      try {
        await this.adapter.createSampleLedger(SAMPLE_LEDGER_NAME, SAMPLE_LEDGER_ALIAS);
        this.result = { action: "selected", ledger: SAMPLE_LEDGER_NAME };
        this.close();
      } catch (e) {
        new import_obsidian17.Notice(`\u521B\u5EFA\u793A\u4F8B\u8D26\u672C\u5931\u8D25\uFF1A${e}`);
      }
    };
    contentEl.createEl("p", { text: "\u2014 \u6216 \u2014", cls: "accounting-onboarding-sep" });
    const createBtn = contentEl.createEl("button", {
      text: "\u521B\u5EFA\u65B0\u8D26\u672C",
      cls: "accounting-btn accounting-btn-secondary accounting-btn-block"
    });
    createBtn.onclick = () => this.renderCreateForm();
  }
  /** 渲染现有账本选择列表 */
  renderLedgerSelection(existing) {
    const { contentEl } = this;
    contentEl.empty();
    this.currentStep = "main";
    const titleEl = contentEl.createEl("h2", { text: "\u9009\u62E9\u8D26\u672C" });
    titleEl.addClass("accounting-modal-title");
    const listEl = contentEl.createDiv("accounting-onboarding-folder-list");
    for (const folder of existing.sort()) {
      const itemEl = listEl.createEl("button", {
        text: folder,
        cls: "accounting-btn accounting-btn-secondary accounting-btn-block"
      });
      itemEl.onclick = () => {
        this.result = { action: "selected", ledger: folder };
        this.close();
      };
    }
    const createBtn = contentEl.createEl("button", {
      text: "+ \u521B\u5EFA\u65B0\u8D26\u672C",
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
            await this.adapter.createLedger(name, alias || void 0);
            new import_obsidian17.Notice(`\u5DF2\u521B\u5EFA\u8D26\u672C\u300C${alias || name}\u300D`);
            this.result = { action: "created", ledger: name };
            this.close();
            return true;
          } catch (e) {
            new import_obsidian17.Notice(`\u521B\u5EFA\u5931\u8D25\uFF1A${e}`);
            return false;
          }
        },
        onCancel: () => void this.renderMainStep()
      },
      { title: "\u521B\u5EFA\u65B0\u8D26\u672C", cancelText: "\u8FD4\u56DE", submitText: "\u521B\u5EFA" }
    );
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    this.onComplete(this.result ?? { action: "skipped" });
  }
};

// src/main.ts
var DEFAULT_SETTINGS = { dataSubdir: "data", autoOpenOnStartup: true, onboardingCompleted: false };
var DEFAULT_LEDGER_NAME = "myledger";
var DEFAULT_LEDGER_ALIAS = "\u4E2A\u4EBA\u8D26\u672C";
var AccountingPlugin = class extends import_obsidian18.Plugin {
  settingsTab;
  /** 引导期间的背景设置页（应用主界面）；引导完成后按需刷新/关闭，避免双 Modal 堆叠。 */
  onboardingBackdrop = null;
  async onload() {
    await this.loadSettings();
    this.addCommand({
      id: "open",
      name: "\u5B8F\u5229\u8BB0\u8D26",
      callback: () => this.openEntry()
    });
    this.addRibbonIcon("coins", "\u5B8F\u5229\u8BB0\u8D26", () => this.openEntry());
    this.app.workspace.onLayoutReady(() => {
      if (!this.settings.onboardingCompleted) {
        this.showOnboardingModal();
      } else if (this.settings.autoOpenOnStartup) {
        void this.openEntry();
      }
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
      console.error("\u663E\u793A\u5F15\u5BFC Modal \u5931\u8D25:", error);
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
          await adapter.createLedger(DEFAULT_LEDGER_NAME, DEFAULT_LEDGER_ALIAS);
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
      console.error("\u5F15\u5BFC\u5B8C\u6210\u5904\u7406\u5931\u8D25:", error);
    }
    if (ledgerChanged) {
      this.openSettings();
      this.onboardingBackdrop?.close();
    }
    this.onboardingBackdrop = null;
  }
  /** 导航上下文：三个目标的打开回调，注入到各 Modal 使其底部导航条可用。public 供设置页「查看」跳转复用。 */
  navCtx(adapter) {
    return {
      openList: (accountId, slide, drillDown, drill, onDataChanged) => openList(this.app, adapter, this.navCtx(adapter), accountId, slide, void 0, drillDown, drill, onDataChanged),
      openEntry: (slide) => {
        void openEntry(this.app, adapter, void 0, this.navCtx(adapter), slide, this.switchLedgerAndReopen, () => this.settingsTab.showRecurring());
      },
      openBalance: (slide) => openBalance(this.app, adapter, this.navCtx(adapter), slide),
      openReport: (slide) => openReport(this.app, adapter, this.navCtx(adapter), slide),
      openSettings: (slide) => openSettings(this.app, this.settingsTab, this.navCtx(adapter), slide, this.switchLedgerAndReopenSettings)
    };
  }
  async openEntry() {
    const adapter = this.adapter();
    await openEntry(this.app, adapter, void 0, this.navCtx(adapter), void 0, this.switchLedgerAndReopen, () => this.settingsTab.showRecurring());
    void this.tryAutoRefreshRates(adapter);
    await this.runStartupBackfill(adapter);
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
      const resp = await (0, import_obsidian19.requestUrl)({ url, method: "GET" });
      const fetched = parseRateResponse(resp.json, baseCurrency, nowISO());
      if (!fetched) return;
      const rates = await adapter.readRates();
      const { merged, updated } = mergeRatesByVisible(rates, fetched, Object.keys(rates));
      if (updated === 0) return;
      await adapter.writeRates(merged);
      await adapter.writeRateConfig({ ...cfg, lastSuccess: nowISO() });
      console.log(`\u81EA\u52A8\u5237\u65B0\u6C47\u7387\uFF1A\u5DF2\u66F4\u65B0 ${updated} \u4E2A\u5E01\u79CD`);
    } catch (e) {
      console.warn("\u81EA\u52A8\u5237\u65B0\u6C47\u7387\u5931\u8D25", e);
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
        console.log(`\u542F\u52A8\u56DE\u586B\uFF1A\u81EA\u52A8\u751F\u6210 ${generated.length} \u7B14\u5468\u671F\u8D26\u4EA4\u6613`);
      }
    } catch (error) {
      console.error("\u542F\u52A8\u56DE\u586B\u5468\u671F\u8D26\u5931\u8D25", error);
    }
  }
  /** 切换账本：更新当前 dataSubdir 并落盘。目标页的重开由各调用方用新 adapter 完成（重建 navCtx），与记账页切换同一根基。 */
  switchLedger(newSubdir) {
    this.settings.dataSubdir = newSubdir;
    void this.saveSettings();
  }
  /** 记一笔顶部切换账本：用新 dataSubdir 重开记一笔（新 adapter、新 navCtx）。 */
  switchLedgerAndReopen = (newSubdir) => {
    this.switchLedger(newSubdir);
    void this.openEntry();
  };
  /** 设置页切换账本：用新 dataSubdir 重开设置页（新 adapter、新 navCtx），整个记账界面上下文立即刷新到新账本。
   *  关旧设置页由 SettingsModal 在切换回调里先 this.close() 负责（与记账页 LedgerSwitchModal→close 同模式）。 */
  switchLedgerAndReopenSettings = (newSubdir) => {
    this.switchLedger(newSubdir);
    this.openSettings();
  };
  /** 打开设置页（全屏 Modal）：每次用最新 dataSubdir 重建 adapter，导航条与切换账本回调均绑定到该新 adapter。
   *  返回实例，供引导背景页按需 close。 */
  openSettings() {
    const adapter = this.adapter();
    return openSettings(this.app, this.settingsTab, this.navCtx(adapter), void 0, this.switchLedgerAndReopenSettings);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    const adapter = new ObsidianDataAdapter(this.app.vault, this.settings.dataSubdir, this);
    this.settingsTab = new AccountingSettings(this.app, this, adapter);
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
