import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/*
 * Tablo ve sütun adları İngilizce (CLAUDE.md). Müşteriye görünen enum değerleri
 * docs/PLAN.md'deki gibi Türkçe kalır. Tüm zaman damgaları UTC, para birimi kuruş (integer).
 */

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// ---------- Enum'lar ----------

export const roleEnum = pgEnum("role", ["customer", "admin"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "pending",
  "active",
  "payment_failed",
  "cancel_requested",
  "cancelled",
  "expired",
]);

export const paymentStatusEnum = pgEnum("payment_status", ["success", "failed", "pending", "refunded"]);

export const commitmentStatusEnum = pgEnum("commitment_status", [
  "bekliyor",
  "yuklendi",
  "onaylandi",
  "reddedildi",
]);

export const onboardingStatusEnum = pgEnum("onboarding_status", ["taslak", "gonderildi"]);

export const projectStageEnum = pgEnum("project_stage", [
  "bilgi_bekleniyor",
  "taahhutname_bekleniyor",
  "tasarim",
  "musteri_onayi",
  "gelistirme",
  "yayinda",
  "sonlandirildi",
]);

export const ticketCategoryEnum = pgEnum("ticket_category", [
  "teknik",
  "icerik",
  "fatura",
  "reklam",
  "iptal",
  "diger",
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", ["dusuk", "normal", "yuksek"]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "acik",
  "yanit_bekliyor",
  "cevaplandi",
  "kapandi",
]);

export const agreementTypeEnum = pgEnum("agreement_type", [
  "mesafeli_satis",
  "on_bilgilendirme",
  "kvkk",
  "taahhutname",
]);

// ---------- Better Auth tabloları ----------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: roleEnum("role").notNull().default("customer"),
  ...timestamps,
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
});

// ---------- İş tabloları ----------

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    legalName: text("legal_name").notNull(), // unvan
    taxOffice: text("tax_office").notNull(), // vergi dairesi
    taxNumber: text("tax_number").notNull(), // vergi no
    address: text("address").notNull(),
    city: text("city").notNull(), // il
    contactName: text("contact_name").notNull(), // yetkili ad
    contactPhone: text("contact_phone").notNull(),
    ...timestamps,
  },
  (t) => [index("companies_user_id_idx").on(t.userId)],
);

export const packages = pgTable("packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // web | web-ads
  name: text("name").notNull(),
  description: text("description").notNull().default(""), // kısa özet (kartlarda ve sözleşmede)
  features: jsonb("features").$type<string[]>().notNull().default([]), // "Pakete dahil" maddeleri, yönetimden düzenlenir
  // "subscription": 12 ay taahhütlü aylık abonelik (iyzico Abonelik). "one_time": tek seferlik ödeme; abonelik akışı
  // bu paketler için kapalıdır, satın alma şimdilik teklif/iletişim üzerinden yürür.
  billingType: text("billing_type").$type<"subscription" | "one_time">().notNull().default("subscription"),
  includesAds: boolean("includes_ads").notNull().default(false), // Google Ads yönetimi içerir: başlangıç formunda reklam adımı açılır
  featured: boolean("featured").notNull().default(false), // sitede öne çıkarılır
  sortOrder: integer("sort_order").notNull().default(0),
  domainFeeExtra: boolean("domain_fee_extra").notNull().default(true), // sitede "+ alan adı ücreti" gösterilir
  domainFeeKurus: integer("domain_fee_kurus"), // yıllık alan adı ücreti; null = tutar yazılmaz (kayıttan önce bildirilir)
  monthlyPriceKurus: integer("monthly_price_kurus"), // null = fiyat henüz belirlenmedi
  active: boolean("active").notNull().default(true),
  iyzicoProductRef: text("iyzico_product_ref"),
  iyzicoPlanRef: text("iyzico_plan_ref"),
  ...timestamps,
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "restrict" }),
    packageId: uuid("package_id")
      .notNull()
      .references(() => packages.id, { onDelete: "restrict" }),
    iyzicoSubscriptionRef: text("iyzico_subscription_ref").unique(),
    iyzicoCustomerRef: text("iyzico_customer_ref"),
    // Callback'te hangi aboneliğe ait olduğunu bulmak için; tahmin edilemez, tek kullanımlık değil
    // ama sonuç her zaman iyzico'dan sorgulanır.
    iyzicoCheckoutToken: text("iyzico_checkout_token").unique(),
    status: subscriptionStatusEnum("status").notNull().default("pending"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    commitmentEndsAt: timestamp("commitment_ends_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("subscriptions_company_id_idx").on(t.companyId)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriptionId: uuid("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "restrict" }),
    iyzicoOrderRef: text("iyzico_order_ref").notNull(),
    amountKurus: integer("amount_kurus").notNull(),
    status: paymentStatusEnum("status").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    invoiceUrl: text("invoice_url"), // admin yükler (Aşama 7)
    rawData: jsonb("raw_data"),
    ...timestamps,
  },
  // Webhook idempotency: aynı iyzico siparişi iki kez kaydedilmez
  (t) => [uniqueIndex("payments_iyzico_order_ref_uidx").on(t.iyzicoOrderRef)],
);

export const agreementAcceptances = pgTable(
  "agreement_acceptances",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    documentType: agreementTypeEnum("document_type").notNull(),
    documentVersion: text("document_version").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("agreement_acceptances_user_id_idx").on(t.userId)],
);

export const commitmentDocuments = pgTable("commitment_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "restrict" }),
  generatedPdfUrl: text("generated_pdf_url"),
  signedUploadUrl: text("signed_upload_url"),
  status: commitmentStatusEnum("status").notNull().default("bekliyor"),
  rejectionReason: text("rejection_reason"),
  approvedByAdminId: text("approved_by_admin_id").references(() => user.id, {
    onDelete: "set null",
  }),
  ...timestamps,
});

export const onboardingForms = pgTable("onboarding_forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .unique()
    .references(() => companies.id, { onDelete: "restrict" }),
  data: jsonb("data").notNull().default({}),
  status: onboardingStatusEnum("status").notNull().default("taslak"),
  ...timestamps,
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "restrict" }),
  stage: projectStageEnum("stage").notNull().default("bilgi_bekleniyor"),
  notes: text("notes"),
  previewUrl: text("preview_url"), // "musteri_onayi" aşamasında müşterinin göreceği önizleme adresi (admin girer)
  ...timestamps,
});

export const projectEvents = pgTable(
  "project_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    stage: projectStageEnum("stage").notNull(),
    description: text("description").notNull(), // müşteriye görünen
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("project_events_project_id_idx").on(t.projectId)],
);

export const tickets = pgTable(
  "tickets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "restrict" }),
    category: ticketCategoryEnum("category").notNull(),
    priority: ticketPriorityEnum("priority").notNull().default("normal"),
    subject: text("subject").notNull(),
    status: ticketStatusEnum("status").notNull().default("acik"),
    ...timestamps,
  },
  (t) => [index("tickets_company_id_idx").on(t.companyId)],
);

export const ticketMessages = pgTable(
  "ticket_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    authorUserId: text("author_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    message: text("message").notNull(),
    attachments: jsonb("attachments").notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ticket_messages_ticket_id_idx").on(t.ticketId)],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: text("actor_user_id").references(() => user.id, { onDelete: "set null" }), // null = sistem/webhook
    action: text("action").notNull(),
    targetTable: text("target_table").notNull(),
    targetId: text("target_id"),
    details: jsonb("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_log_target_idx").on(t.targetTable, t.targetId)],
);

// Better Auth'un veritabanı tabanlı hız sınırı tablosu. lib/rate-limit.ts de aynı tabloyu "rl:" önekli
// anahtarlarla kullanır. lastRequest milisaniye; bizde pencere başlangıcıdır.
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

// Blog yazıları. Gövde Markdown'dır; yönetim panelinden yazılır ve yayınlanır.
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""), // liste ve arama sonuçlarındaki açıklama
    body: text("body").notNull().default(""), // Markdown
    category: text("category").notNull().default("Genel"),
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    authorUserId: text("author_user_id").references(() => user.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("posts_published_idx").on(t.published, t.publishedAt)],
);
