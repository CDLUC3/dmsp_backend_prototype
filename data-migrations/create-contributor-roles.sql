
CREATE TABLE contributor_roles (
    id          varchar(24),
    label       varchar(255) UNIQUE NOT NULL,
    url         varchar(255) UNIQUE NOT NULL,
    description text,
    created     timestamp DEFAULT current_timestamp NOT NULL,
    modified    timestamp DEFAULT current_timestamp NOT NULL,
    PRIMARY KEY(id)
);
