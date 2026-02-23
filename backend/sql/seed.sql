-- Seed data for Campus Cravings MVP
-- Requires schema.sql to be executed first.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (password: Password123!)
INSERT INTO users (id, name, email, password_hash, role)
VALUES
  (gen_random_uuid(), 'Student Demo', 'student@uconn.edu', crypt('Password123!', gen_salt('bf')), 'student'),
  (gen_random_uuid(), 'Restaurant Demo', 'restaurant@uconn.edu', crypt('Password123!', gen_salt('bf')), 'restaurant'),
  (gen_random_uuid(), 'Admin Demo', 'admin@uconn.edu', crypt('Password123!', gen_salt('bf')), 'admin')
ON CONFLICT (email) DO NOTHING;

-- Restaurants
INSERT INTO restaurants (id, name, description, location, estimated_time, is_active)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'The Coop', 'Gluten-free & halal tenders and wraps', 'Student Union', '15-25 min', true),
  ('22222222-2222-4222-8222-222222222222', 'Earth Wok and Fire', 'Bowls, entrees and sides', 'Student Union', '15-25 min', true),
  ('33333333-3333-4333-8333-333333333333', 'Sambazon Acai Bowls', 'Small and regular acai bowls', 'Student Union', '10-20 min', true),
  ('44444444-4444-4444-8444-444444444444', 'Pompeii Oven', 'Pizza, subs and pasta', 'Union Street Market', '15-30 min', true),
  ('55555555-5555-4555-8555-555555555555', 'Tostada Grill', 'Burritos, salads and bowls', 'Union Street Market', '15-30 min', true),
  ('66666666-6666-4666-8666-666666666666', 'Soup & Mac', 'Soups and mac and cheese', 'Union Street Market', '10-20 min', true)
ON CONFLICT (id) DO NOTHING;

-- Menu items (complete menu set from static site)
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, image_url, is_available)
VALUES
  -- The Coop
  ('a1111111-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', 'Small Tenders (3)', 'Crispy halal chicken with gluten-free breading.', 6.00, 'Tenders', null, true),
  ('a1111111-1111-4111-8111-111111111112', '11111111-1111-4111-8111-111111111111', 'Small Tenders w/ Fries', 'Three tenders with seasoned fries.', 8.00, 'Tenders', null, true),
  ('a1111111-1111-4111-8111-111111111113', '11111111-1111-4111-8111-111111111111', 'Large Tenders (6)', 'Double portion tenders.', 11.00, 'Tenders', null, true),
  ('a1111111-1111-4111-8111-111111111114', '11111111-1111-4111-8111-111111111111', 'Large Tenders w/ Fries', 'Six tenders paired with fries.', 13.00, 'Tenders', null, true),
  ('a1111111-1111-4111-8111-111111111115', '11111111-1111-4111-8111-111111111111', 'Fries', 'Crispy straight-cut fries.', 3.00, 'Tenders', null, true),
  ('a1111111-1111-4111-8111-111111111116', '11111111-1111-4111-8111-111111111111', 'Chicken Wrap', 'Grilled chicken wrap.', 9.00, 'Wraps', null, true),
  ('a1111111-1111-4111-8111-111111111117', '11111111-1111-4111-8111-111111111111', 'Wrap w/ Fries', 'Wrap served with fries.', 10.50, 'Wraps', null, true),
  ('a1111111-1111-4111-8111-111111111118', '11111111-1111-4111-8111-111111111111', 'Gluten Free Wrap', 'Chicken and veggies in gluten-free wrap.', 10.00, 'Wraps', null, true),
  ('a1111111-1111-4111-8111-111111111119', '11111111-1111-4111-8111-111111111111', 'GF Wrap w/ Fries', 'Gluten-free wrap and fries.', 11.50, 'Wraps', null, true),
  ('a1111111-1111-4111-8111-11111111111a', '11111111-1111-4111-8111-111111111111', 'Fountain Drink', 'Choose Coke, Sprite, lemonade, or more.', 1.95, 'Drinks', null, true),
  ('a1111111-1111-4111-8111-11111111111b', '11111111-1111-4111-8111-111111111111', 'Dasani Water', 'Chilled bottled water.', 2.25, 'Drinks', null, true),

  -- Earth Wok and Fire
  ('a2222222-2222-4222-8222-222222222221', '22222222-2222-4222-8222-222222222222', 'General Tso Chicken', 'Crispy chicken in spicy-sweet sauce.', 9.75, 'Entrees', null, true),
  ('a2222222-2222-4222-8222-222222222222', '22222222-2222-4222-8222-222222222222', 'Teriyaki Beef', 'Savory teriyaki glazed beef.', 11.25, 'Entrees', null, true),
  ('a2222222-2222-4222-8222-222222222223', '22222222-2222-4222-8222-222222222222', 'Sriracha Chicken', 'Chicken with sriracha glaze.', 10.75, 'Entrees', null, true),
  ('a2222222-2222-4222-8222-222222222224', '22222222-2222-4222-8222-222222222222', 'Vegetable Lo Mein', 'Lo mein noodles and vegetables.', 9.50, 'Entrees', null, true),
  ('a2222222-2222-4222-8222-222222222225', '22222222-2222-4222-8222-222222222222', 'General Tso''s Chicken Bowl', 'Lunch bowl.', 7.00, 'Lunch bowls', null, true),
  ('a2222222-2222-4222-8222-222222222226', '22222222-2222-4222-8222-222222222222', 'Sriracha Chicken Bowl', 'Lunch bowl.', 7.50, 'Lunch bowls', null, true),
  ('a2222222-2222-4222-8222-222222222227', '22222222-2222-4222-8222-222222222222', 'Teriyaki Beef Bowl', 'Lunch bowl.', 7.50, 'Lunch bowls', null, true),
  ('a2222222-2222-4222-8222-222222222228', '22222222-2222-4222-8222-222222222222', 'White Sticky Rice', 'Side.', 2.95, 'Sides & extras', null, true),
  ('a2222222-2222-4222-8222-222222222229', '22222222-2222-4222-8222-222222222222', 'Vegetable Fried Rice', 'Side.', 3.60, 'Sides & extras', null, true),
  ('a2222222-2222-4222-8222-22222222222a', '22222222-2222-4222-8222-222222222222', 'Vegetable Lo Mein (side)', 'Side.', 4.50, 'Sides & extras', null, true),
  ('a2222222-2222-4222-8222-22222222222b', '22222222-2222-4222-8222-222222222222', 'Egg Roll (1)', 'Side.', 2.75, 'Sides & extras', null, true),
  ('a2222222-2222-4222-8222-22222222222c', '22222222-2222-4222-8222-222222222222', 'Egg Roll (2)', 'Side.', 4.75, 'Sides & extras', null, true),
  ('a2222222-2222-4222-8222-22222222222d', '22222222-2222-4222-8222-222222222222', 'Fountain Drink', 'Coke, Diet Coke, Sprite, tea and more.', 1.95, 'Drinks', null, true),

  -- Sambazon (small + regular variants as separate items)
  ('a3333333-3333-4333-8333-333333333331', '33333333-3333-4333-8333-333333333333', 'Berry Acai Bowl (Small)', 'Granola, banana, strawberries & blueberries.', 10.00, 'Bowls', null, true),
  ('a3333333-3333-4333-8333-333333333332', '33333333-3333-4333-8333-333333333333', 'Berry Acai Bowl (Regular)', 'Granola, banana, strawberries & blueberries.', 13.00, 'Bowls', null, true),
  ('a3333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333333', 'Protein Acai Bowl (Small)', 'Peanut butter, granola, banana, almonds.', 11.50, 'Bowls', null, true),
  ('a3333333-3333-4333-8333-333333333334', '33333333-3333-4333-8333-333333333333', 'Protein Acai Bowl (Regular)', 'Peanut butter, granola, banana, almonds.', 13.50, 'Bowls', null, true),
  ('a3333333-3333-4333-8333-333333333335', '33333333-3333-4333-8333-333333333333', 'Coconut Mango Acai Bowl (Small)', 'Granola, banana, mango & coconut.', 8.00, 'Bowls', null, true),
  ('a3333333-3333-4333-8333-333333333336', '33333333-3333-4333-8333-333333333333', 'Coconut Mango Acai Bowl (Regular)', 'Granola, banana, mango & coconut.', 11.00, 'Bowls', null, true),
  ('a3333333-3333-4333-8333-333333333337', '33333333-3333-4333-8333-333333333333', 'Strawberry Sunrise Acai Bowl (Small)', 'Granola, strawberries, mango & honey.', 8.00, 'Bowls', null, true),
  ('a3333333-3333-4333-8333-333333333338', '33333333-3333-4333-8333-333333333333', 'Strawberry Sunrise Acai Bowl (Regular)', 'Granola, strawberries, mango & honey.', 11.00, 'Bowls', null, true),
  ('a3333333-3333-4333-8333-333333333339', '33333333-3333-4333-8333-333333333333', 'Chocolate PB Acai Bowl (Small)', 'Granola, banana, peanut butter, chocolate.', 9.00, 'Bowls', null, true),
  ('a3333333-3333-4333-8333-33333333333a', '33333333-3333-4333-8333-333333333333', 'Chocolate PB Acai Bowl (Regular)', 'Granola, banana, peanut butter, chocolate.', 12.00, 'Bowls', null, true),
  ('a3333333-3333-4333-8333-33333333333b', '33333333-3333-4333-8333-333333333333', 'Create Your Own Acai Bowl (Small)', 'Granola & banana base.', 7.00, 'Bowls', null, true),
  ('a3333333-3333-4333-8333-33333333333c', '33333333-3333-4333-8333-333333333333', 'Create Your Own Acai Bowl (Regular)', 'Granola & banana base.', 10.00, 'Bowls', null, true),

  -- Pompeii Oven
  ('a4444444-4444-4444-8444-444444444441', '44444444-4444-4444-8444-444444444444', 'Cheese Pizza', 'Classic slice with mozzarella.', 3.50, 'Pizza', null, true),
  ('a4444444-4444-4444-8444-444444444442', '44444444-4444-4444-8444-444444444444', 'Pepperoni Pizza', 'Pepperoni slice with mozzarella.', 4.00, 'Pizza', null, true),
  ('a4444444-4444-4444-8444-444444444443', '44444444-4444-4444-8444-444444444444', 'Gluten Free Pizza', 'Gluten free option.', 7.50, 'Pizza', null, true),
  ('a4444444-4444-4444-8444-444444444444', '44444444-4444-4444-8444-444444444444', '3 Garlic Knots with Dipping Sauce', 'Sides.', 7.95, 'Subs & pasta', null, true),
  ('a4444444-4444-4444-8444-444444444445', '44444444-4444-4444-8444-444444444444', 'Chicken Parm Sub', 'Sub.', 7.50, 'Subs & pasta', null, true),
  ('a4444444-4444-4444-8444-444444444446', '44444444-4444-4444-8444-444444444444', 'Chicken Parmesan', 'Entree.', 3.30, 'Subs & pasta', null, true),
  ('a4444444-4444-4444-8444-444444444447', '44444444-4444-4444-8444-444444444444', 'Gluten Free Pasta w/ Marinara', 'Pasta.', 8.25, 'Subs & pasta', null, true),
  ('a4444444-4444-4444-8444-444444444448', '44444444-4444-4444-8444-444444444444', 'Pasta & Alfredo Sauce', 'Pasta.', 6.50, 'Subs & pasta', null, true),
  ('a4444444-4444-4444-8444-444444444449', '44444444-4444-4444-8444-444444444444', 'Pasta and Marinara', 'Pasta.', 6.50, 'Subs & pasta', null, true),
  ('a4444444-4444-4444-8444-44444444444a', '44444444-4444-4444-8444-444444444444', 'Pasta and Grinder Extras', 'Extras.', 0.95, 'Subs & pasta', null, true),

  -- Tostada Grill
  ('a5555555-5555-4555-8555-555555555551', '55555555-5555-4555-8555-555555555555', 'Beef Burrito', 'Burrito.', 8.25, 'Burritos', null, true),
  ('a5555555-5555-4555-8555-555555555552', '55555555-5555-4555-8555-555555555555', 'Chicken Burrito', 'Burrito.', 8.25, 'Burritos', null, true),
  ('a5555555-5555-4555-8555-555555555553', '55555555-5555-4555-8555-555555555555', 'Veggie Bean Burrito', 'Burrito.', 7.99, 'Burritos', null, true),
  ('a5555555-5555-4555-8555-555555555554', '55555555-5555-4555-8555-555555555555', 'Beef Taco Salad', 'Salad.', 8.25, 'Taco salads', null, true),
  ('a5555555-5555-4555-8555-555555555555', '55555555-5555-4555-8555-555555555555', 'Chicken Taco Salad', 'Salad.', 8.25, 'Taco salads', null, true),
  ('a5555555-5555-4555-8555-555555555556', '55555555-5555-4555-8555-555555555555', 'Vegetarian Taco Salad', 'Salad.', 7.99, 'Taco salads', null, true),
  ('a5555555-5555-4555-8555-555555555557', '55555555-5555-4555-8555-555555555555', 'Veggie Bean Taco Salad', 'Salad.', 7.99, 'Taco salads', null, true),
  ('a5555555-5555-4555-8555-555555555558', '55555555-5555-4555-8555-555555555555', 'Naked Beef Bowl', 'Bowl.', 8.25, 'Naked bowls', null, true),
  ('a5555555-5555-4555-8555-555555555559', '55555555-5555-4555-8555-555555555555', 'Naked Chicken Bowl', 'Bowl.', 8.25, 'Naked bowls', null, true),
  ('a5555555-5555-4555-8555-55555555555a', '55555555-5555-4555-8555-555555555555', 'Naked Vegetarian Tex Mex Bowl', 'Bowl.', 7.99, 'Naked bowls', null, true),
  ('a5555555-5555-4555-8555-55555555555b', '55555555-5555-4555-8555-555555555555', 'Naked Veggie Bean Bowl', 'Bowl.', 7.99, 'Naked bowls', null, true),
  ('a5555555-5555-4555-8555-55555555555c', '55555555-5555-4555-8555-555555555555', 'Chips and Guacamole', 'Side.', 4.95, 'Sides & extras', null, true),
  ('a5555555-5555-4555-8555-55555555555d', '55555555-5555-4555-8555-555555555555', 'Chips and Salsa', 'Side.', 4.65, 'Sides & extras', null, true),
  ('a5555555-5555-4555-8555-55555555555e', '55555555-5555-4555-8555-555555555555', 'Queso & Chips', 'Side.', 4.25, 'Sides & extras', null, true),
  ('a5555555-5555-4555-8555-55555555555f', '55555555-5555-4555-8555-555555555555', 'Tortilla Chips (Side)', 'Side.', 2.75, 'Sides & extras', null, true),
  ('a5555555-5555-4555-8555-555555555560', '55555555-5555-4555-8555-555555555555', 'Extra Guacamole', 'Side.', 2.00, 'Sides & extras', null, true),

  -- Soup & Mac
  ('a6666666-6666-4666-8666-666666666661', '66666666-6666-4666-8666-666666666666', 'Large Chef Choice Soup', 'Daily rotating soup selection.', 7.75, 'Soups & mac and cheese', null, true),
  ('a6666666-6666-4666-8666-666666666662', '66666666-6666-4666-8666-666666666666', 'Small Chef Choice Soup', 'Daily rotating soup selection.', 5.75, 'Soups & mac and cheese', null, true),
  ('a6666666-6666-4666-8666-666666666663', '66666666-6666-4666-8666-666666666666', 'Large Three Cheese Cavatappi', 'Creamy three-cheese pasta.', 7.75, 'Soups & mac and cheese', null, true),
  ('a6666666-6666-4666-8666-666666666664', '66666666-6666-4666-8666-666666666666', 'Small Three Cheese Cavatappi', 'Creamy three-cheese pasta.', 5.75, 'Soups & mac and cheese', null, true)
ON CONFLICT (id) DO NOTHING;
