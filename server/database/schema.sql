-- DOTS Daily relational schema (normalized person names)

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    middle_name     VARCHAR(100),
    last_name       VARCHAR(100) NOT NULL,
    name_suffix     VARCHAR(20),
    role            VARCHAR(20) NOT NULL DEFAULT 'user'
                    CHECK (role IN ('user', 'admin')),
    status          VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'inactive')),
    avatar_url      TEXT,
    phone           VARCHAR(30),
    date_of_birth   DATE,
    emergency_contact VARCHAR(30),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ
);

CREATE INDEX idx_users_last_name ON users (last_name);
CREATE INDEX idx_users_status ON users (status);

CREATE TABLE auth_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(30) NOT NULL
                    CHECK (type IN (
                        'login',
                        'logout',
                        'signup',
                        'user-created',
                        'user-updated',
                        'user-deleted'
                    )),
    user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    display_name    VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL,
    performed_by    VARCHAR(255),
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_logs_user_id ON auth_logs (user_id);
CREATE INDEX idx_auth_logs_created_at ON auth_logs (created_at DESC);
