BEGIN;

CREATE TABLE IF NOT EXISTS client (
	id 				UUID 					PRIMARY KEY,
	cpf 			CHAR(11)	 		NULL,
	name 			VARCHAR(50)		NULL,
	email 		VARCHAR(100) 	NULL
);

CREATE TABLE IF NOT EXISTS restaurant (
	id			UUID					PRIMARY KEY,
	name		VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS ingredient (
	id					UUID					PRIMARY KEY,
	name				VARCHAR(50)		NOT NULL,
	price				FLOAT					NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'food_category') THEN
        CREATE TYPE food_category AS ENUM (
					'Lanche',
					'Acompanhamento',
					'Bebida',
					'Sobremesa'
				);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS food (
	id					UUID					PRIMARY KEY,
	name				VARCHAR(50)		NOT NULL,
	price				FLOAT					NOT NULL,
	category		food_category	NOT NULL,
	visible			BOOLEAN NOT NULL DEFAULT(TRUE)
);

CREATE TABLE IF NOT EXISTS food_ingredient (
	food_id					UUID NOT NULL REFERENCES food(id) ON UPDATE CASCADE ON DELETE CASCADE,
	ingredient_id		UUID NOT NULL REFERENCES ingredient(id) ON UPDATE CASCADE ON DELETE CASCADE,
	PRIMARY KEY(food_id, ingredient_id)
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM (
					'Recebido',
					'Em Preparação',
					'Pronto',
					'Finalizado'
				);
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "order" (
	id								UUID PRIMARY KEY,
	client_id					UUID NULL REFERENCES client(id) ON UPDATE CASCADE ON DELETE SET NULL,
	restaurant_id			UUID NOT NULL REFERENCES restaurant(id) ON UPDATE CASCADE ON DELETE CASCADE,
	createdDate				TIMESTAMP NOT NULL DEFAULT NOW(),
	closedDate				TIMESTAMP NULL DEFAULT NOW(),
	totalPrice				FLOAT NOT NULL,
	status 						order_status NOT NULL
);

CREATE TABLE IF NOT EXISTS order_food (
	id						UUID PRIMARY KEY,
	order_id			UUID NOT NULL REFERENCES "order"(id) ON UPDATE CASCADE ON DELETE CASCADE,
	food_id				UUID NOT NULL REFERENCES food(id) ON UPDATE CASCADE ON DELETE CASCADE,
	quantity			INT NOT NULL,
	price					FLOAT,
	comments			VARCHAR(1000) NULL
);

CREATE TABLE IF NOT EXISTS order_food_ingredient (
	order_food_id			UUID NOT NULL REFERENCES order_food(id) ON UPDATE CASCADE ON DELETE CASCADE,
	ingredient_id			UUID NOT NULL REFERENCES ingredient(id) ON UPDATE CASCADE ON DELETE CASCADE,
	PRIMARY KEY(order_food_id, ingredient_id)
);

COMMIT;