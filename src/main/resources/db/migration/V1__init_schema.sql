-- ============================================================
-- V1__init_schema.sql
-- Initial schema, generated to match the current JPA entities.
-- Order matters: parent tables (referenced by foreign keys) come first.
-- ============================================================

-- ---------------------------------------------
-- tenants
-- ---------------------------------------------
CREATE TABLE tenants (
                         id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
                         tenant_id           VARCHAR(50)  NOT NULL,
                         company_name        VARCHAR(50)  NOT NULL,
                         subscription_plan   VARCHAR(50)  NOT NULL,
                         email               VARCHAR(50)  NOT NULL,
                         is_active           BOOLEAN      NOT NULL,
                         json_config         TEXT,
                         created_at          DATETIME     NOT NULL,
                         updated_at          DATETIME,
                         CONSTRAINT uk_tenants_tenant_id UNIQUE (tenant_id),
                         CONSTRAINT uk_tenants_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_tenant-id` ON tenants (tenant_id);
CREATE INDEX idx_email ON tenants (email);

-- ---------------------------------------------
-- users  (tenant_id is NULL for SUPER_ADMIN)
-- ---------------------------------------------
CREATE TABLE users (
                       id          BIGINT AUTO_INCREMENT PRIMARY KEY,
                       tenant_id   VARCHAR(50),
                       user_name   VARCHAR(32)   NOT NULL,
                       password    VARCHAR(255)  NOT NULL,
                       email       VARCHAR(255)  NOT NULL,
                       phone_no    VARCHAR(10),
                       role        VARCHAR(20)   NOT NULL,
                       is_active   BOOLEAN       NOT NULL,
                       created_at  DATETIME      NOT NULL,
                       updated_at  DATETIME,
                       CONSTRAINT uk_tenant_name UNIQUE (tenant_id, user_name),
                       CONSTRAINT uk_email UNIQUE (email),
                       CONSTRAINT uk_users_phone_no UNIQUE (phone_no),
                       CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_tenant_id ON users (tenant_id);
CREATE INDEX idx_users_tenant_name ON users (tenant_id, user_name);

-- ---------------------------------------------
-- categories
-- ---------------------------------------------
CREATE TABLE categories (
                            id           BIGINT AUTO_INCREMENT PRIMARY KEY,
                            name         VARCHAR(255)  NOT NULL,
                            description  TEXT          NOT NULL,
                            tenant_id    VARCHAR(50)   NOT NULL,
                            created_at   DATETIME      NOT NULL,
                            updated_at   DATETIME,
                            CONSTRAINT idx_tenant_category_name UNIQUE (tenant_id, name),
                            CONSTRAINT fk_categories_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_categories_tenant_id ON categories (tenant_id);

-- ---------------------------------------------
-- suppliers
-- ---------------------------------------------
CREATE TABLE suppliers (
                           id             BIGINT AUTO_INCREMENT PRIMARY KEY,
                           name           VARCHAR(255)  NOT NULL,
                           tenant_id      VARCHAR(50)   NOT NULL,
                           contact_email  VARCHAR(255)  NOT NULL,
                           phone          VARCHAR(255)  NOT NULL,
                           address        VARCHAR(50)   NOT NULL,
                           created_at     DATETIME      NOT NULL,
                           updated_at     DATETIME,
                           CONSTRAINT uk_tenant_supplier_name UNIQUE (tenant_id, name),
                           CONSTRAINT fk_suppliers_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tenant_name ON suppliers (tenant_id);

-- ---------------------------------------------
-- products
-- ---------------------------------------------
CREATE TABLE products (
                          id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
                          name                  VARCHAR(255)    NOT NULL,
                          tenant_id             VARCHAR(50)     NOT NULL,
                          sku                   VARCHAR(255)    NOT NULL,
                          description           TEXT,
                          price                 DECIMAL(10,2),
                          current_stock         INT DEFAULT 0,
                          min_stock_threhold    INT DEFAULT 10,
                          version               BIGINT          NOT NULL DEFAULT 0,
                          category_id           BIGINT,
                          supplier_id           BIGINT,
                          created_at            DATETIME        NOT NULL,
                          updated_at            DATETIME,
                          CONSTRAINT uk_tenant_sku UNIQUE (tenant_id, sku),
                          CONSTRAINT fk_products_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id),
                          CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id),
                          CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_tenant_Id` ON products (tenant_id);
CREATE INDEX idx_tenant_current_stock ON products (tenant_id, current_stock);
CREATE INDEX idx_category_id ON products (category_id);
CREATE INDEX idx_supplier_id ON products (supplier_id);

-- ---------------------------------------------
-- stock_transaction  (immutable audit log, no BaseEntity audit columns)
-- ---------------------------------------------
CREATE TABLE stock_transaction (
                                   id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
                                   tenant_id           VARCHAR(50)   NOT NULL,
                                   product_id          BIGINT,
                                   transaction_type    VARCHAR(20)   NOT NULL,
                                   reason              VARCHAR(30),
                                   quantity            INT           NOT NULL,
                                   stock_after         INT,
                                   transaction_date    DATETIME,
                                   user_id             BIGINT,
                                   note                TEXT,
                                   CONSTRAINT fk_stocktx_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id),
                                   CONSTRAINT fk_stocktx_product FOREIGN KEY (product_id) REFERENCES products (id),
                                   CONSTRAINT fk_stocktx_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_stocktx_tenant_id ON stock_transaction (tenant_id);
CREATE INDEX idx_tenant_transaction_date ON stock_transaction (tenant_id, transaction_date);
CREATE INDEX idx_stocktx_product_id ON stock_transaction (product_id);
CREATE INDEX idx_stocktx_user_id ON stock_transaction (user_id);

-- ---------------------------------------------
-- tenant_metrics  (no BaseEntity audit columns)
-- ---------------------------------------------
CREATE TABLE tenant_metrics (
                                id                       BIGINT AUTO_INCREMENT PRIMARY KEY,
                                tenant_id                VARCHAR(50)     NOT NULL,
                                date                     DATE            NOT NULL,
                                total_sells              DECIMAL(12,2)   DEFAULT 0,
                                total_inventory_value    DECIMAL(12,2)   DEFAULT 0,
                                api_calls                BIGINT          DEFAULT 0,
                                storage_used             BIGINT          NOT NULL DEFAULT 0,
                                CONSTRAINT uk_tenant_date UNIQUE (tenant_id, date),
                                CONSTRAINT fk_metrics_tenant FOREIGN KEY (tenant_id) REFERENCES tenants (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_metrics_tenant_id ON tenant_metrics (tenant_id);
CREATE INDEX idx_date ON tenant_metrics (date);