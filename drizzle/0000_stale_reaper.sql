CREATE TABLE "game_states" (
	"code" text PRIMARY KEY NOT NULL,
	"state" jsonb NOT NULL,
	"current_player" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
