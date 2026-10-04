BEGIN;

CREATE TEMP TABLE demo_seed_author AS
SELECT "AuthorId" AS id
FROM "Ideas"
ORDER BY "CreatedAt"
LIMIT 1;

UPDATE "Ideas" SET "DuplicateOfId" = NULL WHERE "DuplicateOfId" IS NOT NULL;
DELETE FROM "Comments";
DELETE FROM "IdeaCategories";
DELETE FROM "Ideas";

WITH demo_author AS (
    SELECT id FROM demo_seed_author
)
INSERT INTO "Ideas" (
    "Id", "Title", "Description", "ImageUrl", "DuplicateOfId",
    "CreatedAt", "LastUpdatedAt", "DistrictId", "StatusId", "AuthorId"
)
SELECT
    'd3000000-0000-4000-8000-000000000001'::uuid,
    'Bezpieczne przejście przy ul. Długiej',
    'Przy szkole na ul. Długiej brakuje dobrze widocznego przejścia dla pieszych. Potrzebne są doświetlenie, oznakowanie i próg zwalniający.',
    '/ideas/pedestrian-crossing.png',
    NULL,
    CURRENT_TIMESTAMP - INTERVAL '18 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    (SELECT "Id" FROM "Districts" WHERE "Name" = 'I Stare Miasto' LIMIT 1),
    (SELECT "Id" FROM "Statuses" WHERE "Name" = 'under_review' LIMIT 1),
    demo_author.id
FROM demo_author
ON CONFLICT ("Id") DO NOTHING;

WITH demo_author AS (
    SELECT id FROM demo_seed_author
), demo_data(id, title, description, image_url, duplicate_of, district, status, created_ago, updated_ago) AS (
    VALUES
        (
            'd3000000-0000-4000-8000-000000000002'::uuid,
            'Doświetlenie przejścia przy ul. Długiej',
            'Przejście obok szkoły przy ul. Długiej jest po zmroku słabo widoczne. Proszę o montaż dodatkowych lamp nad pasami.',
            '/ideas/pedestrian-crossing.png',
            'd3000000-0000-4000-8000-000000000001'::uuid,
            'I Stare Miasto', 'submitted', INTERVAL '3 days', INTERVAL '3 days'
        ),
        (
            'd3000000-0000-4000-8000-000000000003'::uuid,
            'Próg zwalniający przed szkołą na ul. Długiej',
            'Kierowcy jadą zbyt szybko przed przejściem przy szkole. Wyniesione przejście lub próg poprawi bezpieczeństwo dzieci.',
            '/ideas/pedestrian-crossing.png',
            'd3000000-0000-4000-8000-000000000001'::uuid,
            'I Stare Miasto', 'accepted', INTERVAL '32 days', INTERVAL '5 days'
        ),
        (
            'd3000000-0000-4000-8000-000000000004'::uuid,
            'Stojaki rowerowe przy Hali Targowej',
            'Przy Hali Targowej brakuje bezpiecznych stojaków rowerowych. Proponuję montaż zadaszonych stojaków typu U przy wejściu i przystanku.',
            '/ideas/bike-racks.png',
            NULL,
            'II Grzegórzki', 'completed', INTERVAL '110 days', INTERVAL '12 days'
        ),
        (
            'd3000000-0000-4000-8000-000000000005'::uuid,
            'Częstsze kursy autobusu 194 wieczorami',
            'Po godzinie 21 autobus 194 kursuje zbyt rzadko. Mieszkańcy Ruczaju proszą o dodatkowe kursy co 20 minut w dni robocze.',
            '/ideas/evening-bus.png',
            NULL,
            'VIII Dębniki', 'rejected', INTERVAL '95 days', INTERVAL '40 days'
        ),
        (
            'd3000000-0000-4000-8000-000000000006'::uuid,
            'Więcej zieleni przy Szkole Podstawowej nr 25',
            'Plac przed szkołą mocno nagrzewa się latem. Proponuję posadzenie drzew, założenie rabat deszczowych i ustawienie ławek w cieniu.',
            '/ideas/school-greenery.png',
            NULL,
            'V Krowodrza', 'in_progress', INTERVAL '70 days', INTERVAL '1 day'
        ),
        (
            'd3000000-0000-4000-8000-000000000007'::uuid,
            'Ławki i cień na Rynku Podgórskim',
            'Na Rynku Podgórskim brakuje miejsc odpoczynku osłoniętych od słońca. Przydadzą się ławki z oparciami oraz dwa duże drzewa.',
            '/ideas/school-greenery.png',
            NULL,
            'XIII Podgórze', 'completed', INTERVAL '160 days', INTERVAL '20 days'
        ),
        (
            'd3000000-0000-4000-8000-000000000008'::uuid,
            'Naprawa chodnika przy alei Róż',
            'Nierówne płyty chodnikowe przy alei Róż utrudniają przejazd wózkiem i są niebezpieczne dla seniorów. Potrzebna jest wymiana nawierzchni.',
            '/ideas/damaged-sidewalk.png',
            NULL,
            'XVIII Nowa Huta', 'submitted', INTERVAL '6 days', INTERVAL '6 days'
        )
)
INSERT INTO "Ideas" (
    "Id", "Title", "Description", "ImageUrl", "DuplicateOfId",
    "CreatedAt", "LastUpdatedAt", "DistrictId", "StatusId", "AuthorId"
)
SELECT
    demo_data.id,
    demo_data.title,
    demo_data.description,
    demo_data.image_url,
    demo_data.duplicate_of,
    CURRENT_TIMESTAMP - demo_data.created_ago,
    CURRENT_TIMESTAMP - demo_data.updated_ago,
    district."Id",
    status."Id",
    demo_author.id
FROM demo_data
CROSS JOIN demo_author
JOIN "Districts" district ON district."Name" = demo_data.district
JOIN "Statuses" status ON status."Name" = demo_data.status
ON CONFLICT ("Id") DO NOTHING;

WITH category_mapping(idea_id, category_name) AS (
    VALUES
        ('d3000000-0000-4000-8000-000000000001'::uuid, 'Bezpieczeństwo'),
        ('d3000000-0000-4000-8000-000000000002'::uuid, 'Bezpieczeństwo'),
        ('d3000000-0000-4000-8000-000000000003'::uuid, 'Bezpieczeństwo'),
        ('d3000000-0000-4000-8000-000000000004'::uuid, 'Infrastruktura rowerowa'),
        ('d3000000-0000-4000-8000-000000000005'::uuid, 'Transport publiczny'),
        ('d3000000-0000-4000-8000-000000000006'::uuid, 'Tereny zielone'),
        ('d3000000-0000-4000-8000-000000000007'::uuid, 'Tereny zielone'),
        ('d3000000-0000-4000-8000-000000000008'::uuid, 'Infrastruktura drogowa')
)
INSERT INTO "IdeaCategories" ("IdeaId", "CategoryId")
SELECT category_mapping.idea_id, category."Id"
FROM category_mapping
JOIN "Categories" category ON category."Name" = category_mapping.category_name
ON CONFLICT ("CategoryId", "IdeaId") DO NOTHING;

COMMIT;
