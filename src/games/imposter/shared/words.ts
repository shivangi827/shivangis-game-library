export interface WordEntry {
  word: string;
  hint: string;
}

// ── People ──────────────────────────────────────────────

const actors: string[] = [
  'Tom Cruise', 'Tom Hanks', 'Brad Pitt', 'Leonardo DiCaprio', 'Will Smith',
  'Robert Downey Jr.', 'Dwayne Johnson', 'Denzel Washington', 'Morgan Freeman',
  'Samuel L. Jackson', 'Keanu Reeves', 'Hugh Jackman', 'Ryan Reynolds',
  'Chris Hemsworth', 'Chris Evans', 'Chris Pratt', 'Robert De Niro', 'Al Pacino',
  'Jack Nicholson', 'Johnny Depp', 'Matt Damon', 'Ben Affleck', 'Jim Carrey',
  'Adam Sandler', 'Kevin Hart', 'Eddie Murphy', 'Jackie Chan', 'Bruce Lee',
  'Meryl Streep', 'Jennifer Lawrence', 'Scarlett Johansson', 'Zendaya',
  'Margot Robbie', 'Emma Stone', 'Emma Watson', 'Natalie Portman', 'Angelina Jolie',
  'Sandra Bullock', 'Julia Roberts', 'Nicole Kidman', 'Cate Blanchett',
  'Anne Hathaway', 'Jennifer Aniston', 'Reese Witherspoon', 'Kristen Stewart',
  'Gal Gadot', 'Anya Taylor-Joy', 'Florence Pugh',
];

const musicians: string[] = [
  'Taylor Swift', 'Beyoncé', 'Drake', 'Ed Sheeran', 'Bruno Mars', 'Lady Gaga',
  'Rihanna', 'Justin Bieber', 'Ariana Grande', 'Billie Eilish', 'Olivia Rodrigo',
  'Harry Styles', 'Dua Lipa', 'The Weeknd', 'Sabrina Carpenter', 'Bad Bunny',
  'Michael Jackson', 'Elvis Presley', 'Freddie Mercury', 'Bob Dylan', 'Bob Marley',
  'David Bowie', 'Prince', 'Madonna', 'Whitney Houston', 'Mariah Carey',
  'Adele', 'Shakira', 'Kanye West', 'Eminem', 'Snoop Dogg', 'Jay-Z',
  'Kendrick Lamar', 'Post Malone', 'Travis Scott', 'Paul McCartney', 'John Lennon',
  'Stevie Wonder', 'Frank Sinatra', 'Johnny Cash', 'Dolly Parton',
];

const athletes: string[] = [
  'LeBron James', 'Michael Jordan', 'Kobe Bryant', 'Stephen Curry', 'Shaquille O\'Neal',
  'Tiger Woods', 'Serena Williams', 'Venus Williams', 'Roger Federer', 'Rafael Nadal',
  'Novak Djokovic', 'Cristiano Ronaldo', 'Lionel Messi', 'Pelé', 'Diego Maradona',
  'Tom Brady', 'Peyton Manning', 'Patrick Mahomes', 'Usain Bolt', 'Michael Phelps',
  'Simone Biles', 'Muhammad Ali', 'Mike Tyson', 'Floyd Mayweather', 'Wayne Gretzky',
  'Babe Ruth', 'Derek Jeter',
];

const historicalFigures: string[] = [
  'Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'Benjamin Franklin',
  'Albert Einstein', 'Isaac Newton', 'Galileo', 'Nikola Tesla', 'Thomas Edison',
  'Charles Darwin', 'Marie Curie', 'Leonardo da Vinci', 'Michelangelo',
  'William Shakespeare', 'Mark Twain', 'Ernest Hemingway', 'Napoleon',
  'Winston Churchill', 'Queen Elizabeth II', 'Martin Luther King Jr.',
  'Mahatma Gandhi', 'Nelson Mandela', 'Mother Teresa', 'Joan of Arc', 'Cleopatra',
  'Julius Caesar', 'Christopher Columbus', 'Amelia Earhart', 'Rosa Parks',
  'Anne Frank', 'Helen Keller', 'Florence Nightingale', 'Marco Polo',
];

const publicFigures: string[] = [
  'Elon Musk', 'Steve Jobs', 'Bill Gates', 'Mark Zuckerberg', 'Jeff Bezos',
  'Warren Buffett', 'Oprah Winfrey', 'Walt Disney', 'Henry Ford',
];

const fictionalCharacters: string[] = [
  'Harry Potter', 'Hermione Granger', 'Ron Weasley', 'Dumbledore', 'Voldemort',
  'Sherlock Holmes', 'James Bond', 'Indiana Jones', 'Rocky Balboa',
  'Katniss Everdeen', 'Gandalf', 'Frodo Baggins', 'Bilbo Baggins', 'Aragorn',
  'Legolas', 'Luke Skywalker', 'Darth Vader', 'Princess Leia', 'Han Solo', 'Yoda',
  'Obi-Wan Kenobi', 'Spider-Man', 'Batman', 'Superman', 'Wonder Woman',
  'Captain America', 'Iron Man', 'Thor', 'Hulk', 'Black Widow', 'Deadpool',
  'Wolverine', 'Joker', 'Catwoman', 'Mario', 'Luigi', 'Princess Peach',
  'Sonic the Hedgehog', 'Pikachu', 'Link', 'Kratos', 'Lara Croft', 'Master Chief',
  'Homer Simpson', 'Bart Simpson', 'SpongeBob', 'Mickey Mouse', 'Donald Duck',
  'Bugs Bunny', 'Scooby-Doo', 'Shrek', 'Woody', 'Buzz Lightyear', 'Elsa', 'Moana',
  'Simba', 'Aladdin', 'Cinderella', 'Snow White', 'Peter Pan', 'Winnie the Pooh',
];

// ── Places ──────────────────────────────────────────────

const countries: string[] = [
  'France', 'Japan', 'Italy', 'Brazil', 'Egypt', 'Australia', 'Canada', 'Mexico',
  'Germany', 'Spain', 'Greece', 'India', 'China', 'Russia', 'South Korea',
  'Thailand', 'Vietnam', 'Indonesia', 'Turkey', 'Morocco', 'Kenya', 'Nigeria',
  'Argentina', 'Chile', 'Peru', 'Colombia', 'Cuba', 'Jamaica', 'Iceland', 'Ireland',
  'Scotland', 'Portugal', 'Netherlands', 'Switzerland', 'Norway', 'Sweden',
  'Finland', 'Denmark', 'Poland', 'United States', 'United Kingdom',
];

const cities: string[] = [
  'Paris', 'Tokyo', 'New York', 'London', 'Rome', 'Sydney', 'Dubai', 'Hong Kong',
  'Barcelona', 'Amsterdam', 'Venice', 'Istanbul', 'Bangkok', 'Singapore',
  'Los Angeles', 'Las Vegas', 'Miami', 'Chicago', 'Berlin', 'Moscow', 'Mumbai',
  'Seoul', 'Cairo', 'Athens', 'Dublin', 'Prague', 'Vienna', 'Budapest', 'Lisbon',
  'Madrid', 'Munich', 'Rio de Janeiro', 'Buenos Aires', 'Toronto', 'Vancouver',
  'San Francisco', 'Boston', 'Seattle', 'Austin', 'Nashville', 'New Orleans',
  'Honolulu', 'Kyoto',
];

const landmarks: string[] = [
  'Eiffel Tower', 'Statue of Liberty', 'Great Wall of China', 'Pyramids of Giza',
  'Taj Mahal', 'Colosseum', 'Stonehenge', 'Mount Everest', 'Niagara Falls',
  'Grand Canyon', 'Big Ben', 'Sydney Opera House', 'Mount Rushmore', 'Machu Picchu',
  'Leaning Tower of Pisa', 'Hollywood Sign', 'Golden Gate Bridge', 'Brooklyn Bridge',
  'Empire State Building', 'Burj Khalifa', 'Christ the Redeemer', 'Sagrada Familia',
  'Louvre', 'Buckingham Palace', 'White House',
];

const naturalPlaces: string[] = [
  'Amazon Rainforest', 'Sahara Desert', 'Mount Fuji', 'Mount Kilimanjaro',
  'Victoria Falls', 'Great Barrier Reef', 'Galapagos Islands', 'Serengeti',
  'Antarctica', 'Bermuda Triangle',
];

const famousPlaces: string[] = [
  'Atlantis', 'Area 51', 'Times Square', 'Central Park',
];

// ── Things ──────────────────────────────────────────────

const electronics: string[] = [
  'iPhone', 'Laptop', 'Headphones', 'Camera', 'Smartwatch', 'Tablet', 'Television',
  'Drone', 'VR Headset', 'Printer', 'Keyboard', 'Computer Mouse', 'Charger',
  'USB Drive', 'Robot', 'Speaker', 'Microphone', 'Remote Control', 'Router',
  'Game Console', 'Selfie Stick',
];

const furniture: string[] = [
  'Sofa', 'Bed', 'Table', 'Chair', 'Bookshelf',
];

const appliances: string[] = [
  'Refrigerator', 'Microwave', 'Oven', 'Dishwasher', 'Toaster', 'Blender',
  'Vacuum Cleaner', 'Washing Machine', 'Kettle', 'Fan',
];

const householdItems: string[] = [
  'Lamp', 'Mirror', 'Clock', 'Curtains', 'Rug', 'Pillow', 'Blanket',
  'Towel', 'Broom', 'Candle', 'Bathtub', 'Shower', 'Toilet', 'Sink',
  'Faucet', 'Door', 'Window', 'Stairs', 'Fireplace', 'Chimney',
];

const tools: string[] = [
  'Hammer', 'Screwdriver', 'Wrench', 'Saw', 'Drill', 'Pliers', 'Ladder',
  'Measuring Tape', 'Paintbrush', 'Level', 'Axe', 'Shovel', 'Rake', 'Chainsaw',
  'Flashlight', 'Duct Tape', 'Nails', 'Rope',
];

const vehicles: string[] = [
  'Car', 'Bicycle', 'Motorcycle', 'Airplane', 'Helicopter', 'Boat', 'Submarine',
  'Train', 'Bus', 'Scooter', 'Truck', 'Taxi', 'Ambulance', 'Fire Truck',
  'Police Car', 'Spaceship', 'Hot Air Balloon', 'Sailboat', 'Canoe', 'Skateboard',
  'Rollerblades', 'Unicycle',
];

const accessories: string[] = [
  'Wallet', 'Keys', 'Sunglasses', 'Wristwatch', 'Backpack', 'Umbrella', 'Necklace',
  'Ring', 'Hat', 'Scarf', 'Glasses', 'Belt', 'Shoes', 'Jacket', 'Gloves',
  'Handbag', 'Suitcase', 'Bracelet', 'Earrings', 'Tie',
];

const officeSupplies: string[] = [
  'Pen', 'Pencil', 'Notebook', 'Stapler', 'Scissors', 'Tape', 'Calculator',
  'Whiteboard', 'Marker', 'Eraser', 'Paper', 'Envelope', 'Folder', 'Ruler',
  'Clipboard', 'Textbook',
];

const toysAndGames: string[] = [
  'Lego', 'Rubik\'s Cube', 'Yo-Yo', 'Kite', 'Board Game', 'Jigsaw Puzzle',
  'Deck of Cards', 'Dice', 'Chess Set', 'Frisbee', 'Jump Rope', 'Trampoline',
  'Water Gun', 'Teddy Bear', 'Action Figure', 'Sandcastle',
];

const sportsGear: string[] = [
  'Basketball', 'Soccer Ball', 'Baseball Bat', 'Tennis Racket', 'Golf Club',
  'Bowling Ball', 'Fishing Rod', 'Surfboard', 'Snowboard', 'Skis', 'Ice Skates',
];

const instruments: string[] = [
  'Piano', 'Guitar', 'Violin', 'Drums', 'Flute', 'Trumpet', 'Saxophone', 'Harp',
  'Accordion', 'Harmonica',
];

const nature: string[] = [
  'Rainbow', 'Snowflake',
];

// ── Food & Drink ────────────────────────────────────────

const fruits: string[] = [
  'Apple', 'Banana', 'Strawberry', 'Watermelon', 'Mango', 'Pineapple', 'Grapes',
  'Orange', 'Avocado', 'Peach', 'Blueberry', 'Raspberry', 'Kiwi', 'Pear', 'Cherry',
  'Lemon', 'Lime', 'Coconut', 'Pomegranate', 'Papaya',
];

const vegetables: string[] = [
  'Carrot', 'Broccoli', 'Onion', 'Potato', 'Tomato', 'Cucumber', 'Spinach', 'Corn',
  'Lettuce', 'Mushroom', 'Garlic', 'Pumpkin', 'Eggplant', 'Asparagus', 'Cabbage',
  'Celery',
];

const meats: string[] = [
  'Chicken', 'Beef', 'Bacon', 'Salmon', 'Tuna', 'Shrimp', 'Eggs',
  'Meatballs', 'Sausage',
];

const meals: string[] = [
  'Pizza', 'Cheeseburger', 'Hot Dog', 'Taco', 'Sushi', 'Spaghetti', 'Lasagna',
  'Ramen', 'Pad Thai', 'Burrito', 'Sandwich', 'Salad', 'Steak', 'Soup', 'Curry',
  'Dumplings', 'Fried Rice', 'Mac and Cheese', 'Pancakes', 'Waffles', 'Omelette',
  'French Fries', 'Pretzel', 'Bagel', 'Croissant', 'Nachos', 'Quesadilla',
  'Fish and Chips', 'Peking Duck', 'Paella', 'Risotto', 'Gyro',
];

const desserts: string[] = [
  'Ice Cream', 'Chocolate', 'Birthday Cake', 'Cookies', 'Donut', 'Cupcake',
  'Brownie', 'Cheesecake', 'Apple Pie', 'Pudding', 'Marshmallow', 'Cotton Candy',
  'Tiramisu', 'Gingerbread', 'Lollipop', 'Macaron',
];

const drinks: string[] = [
  'Coffee', 'Tea', 'Smoothie', 'Soda', 'Lemonade', 'Milkshake', 'Orange Juice',
  'Hot Chocolate', 'Beer', 'Wine', 'Champagne', 'Cocktail', 'Boba Tea', 'Milk',
  'Water',
];

const condiments: string[] = [
  'Ketchup', 'Mustard', 'Salt', 'Sugar', 'Honey', 'Syrup',
  'Peanut Butter', 'Jam', 'Butter',
];

const snacks: string[] = [
  'Popcorn', 'Potato Chips', 'Cereal', 'Bread', 'Cheese',
];

// ── Animals ─────────────────────────────────────────────

const mammals: string[] = [
  'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra', 'Bear', 'Polar Bear', 'Wolf',
  'Fox', 'Dog', 'Cat', 'Horse', 'Cow', 'Pig', 'Sheep', 'Goat', 'Rabbit',
  'Squirrel', 'Deer', 'Moose', 'Kangaroo', 'Koala', 'Panda', 'Monkey', 'Gorilla',
  'Chimpanzee', 'Dolphin', 'Whale', 'Otter', 'Beaver', 'Raccoon', 'Skunk',
  'Hedgehog', 'Bat', 'Camel', 'Hippo', 'Rhinoceros', 'Cheetah', 'Leopard',
  'Jaguar', 'Llama', 'Hamster', 'Mouse',
];

const birds: string[] = [
  'Eagle', 'Owl', 'Penguin', 'Parrot', 'Duck', 'Swan', 'Flamingo',
  'Peacock', 'Ostrich', 'Pigeon', 'Seagull', 'Hummingbird', 'Woodpecker',
];

const reptiles: string[] = [
  'Snake', 'Crocodile', 'Turtle', 'Lizard', 'Frog', 'Chameleon', 'T-Rex',
  'Velociraptor',
];

const seaCreatures: string[] = [
  'Shark', 'Octopus', 'Jellyfish', 'Crab', 'Lobster', 'Seahorse', 'Starfish',
  'Clownfish', 'Stingray', 'Walrus', 'Seal',
];

const insects: string[] = [
  'Butterfly', 'Bee', 'Spider', 'Ant', 'Ladybug', 'Dragonfly', 'Caterpillar',
  'Scorpion', 'Snail', 'Worm', 'Grasshopper', 'Mosquito',
];

// ── Media ───────────────────────────────────────────────

const movies: string[] = [
  'Titanic', 'Avatar', 'Jurassic Park', 'The Lion King', 'Forrest Gump',
  'The Godfather', 'Pulp Fiction', 'Jaws', 'Star Wars', 'The Matrix',
  'The Shawshank Redemption', 'Goodfellas', 'Schindler\'s List', 'Casablanca',
  'Gone with the Wind', 'The Wizard of Oz', 'Psycho', 'Rocky', 'Back to the Future',
  'E.T.', 'Ghostbusters', 'Die Hard', 'The Terminator', 'Alien', 'Gladiator',
  'Braveheart', 'Saving Private Ryan', 'Fight Club', 'The Silence of the Lambs',
  'Blade Runner', 'Pretty Woman', 'The Notebook', 'Dirty Dancing', 'Grease',
  'The Avengers', 'The Dark Knight', 'Black Panther', 'Guardians of the Galaxy',
  'Spider-Verse', 'The Hunger Games', 'Twilight', 'The Hobbit',
  'The Lord of the Rings', 'Pirates of the Caribbean', 'Mission Impossible',
  'Fast and Furious', 'John Wick', 'Barbie', 'Oppenheimer', 'Dune',
  'Everything Everywhere All at Once', 'Top Gun', 'Inception', 'Interstellar',
  'Toy Story', 'Finding Nemo', 'Frozen', 'Encanto', 'Inside Out',
  'Up', 'Wall-E', 'Ratatouille', 'Coco', 'Zootopia', 'Tangled',
  'Beauty and the Beast', 'The Little Mermaid', 'Mulan', 'Kung Fu Panda',
  'How to Train Your Dragon', 'Despicable Me', 'Ice Age', 'Madagascar',
  'The Incredibles', 'Monsters Inc.', 'Bambi', 'Dumbo', 'Pinocchio',
  'Sleeping Beauty',
];

const tvShows: string[] = [
  'Friends', 'The Office', 'Breaking Bad', 'Stranger Things', 'Game of Thrones',
  'The Simpsons', 'SpongeBob SquarePants', 'Seinfeld', 'Family Guy',
  'Peaky Blinders', 'Squid Game', 'Wednesday', 'The Mandalorian', 'The Crown',
  'Ted Lasso', 'The Bear', 'Succession', 'Euphoria', 'House of the Dragon',
  'Bridgerton', 'The Walking Dead', 'Lost', 'How I Met Your Mother',
  'Big Bang Theory', 'Grey\'s Anatomy', 'CSI', 'Law and Order', 'Star Trek',
  'Doctor Who', 'Sherlock', 'Black Mirror', 'House of Cards', 'Narcos',
  'Better Call Saul', 'Sex and the City', 'Modern Family', 'Parks and Recreation',
  'Arrested Development', 'Scrubs', 'South Park', 'Rick and Morty',
  'Avatar the Last Airbender',
];

const videoGames: string[] = [
  'Minecraft', 'Fortnite', 'Super Mario', 'The Legend of Zelda', 'Pokemon',
  'Call of Duty', 'Grand Theft Auto', 'Tetris', 'Pac-Man',
  'Halo', 'Overwatch', 'League of Legends', 'Counter-Strike', 'FIFA', 'Roblox',
  'Among Us', 'Elden Ring', 'The Sims', 'Animal Crossing', 'Candy Crush',
  'Angry Birds', 'Street Fighter', 'Mortal Kombat', 'Resident Evil', 'Silent Hill',
  'Final Fantasy', 'Red Dead Redemption', 'Assassin\'s Creed', 'Skyrim',
  'World of Warcraft', 'Doom', 'Metroid', 'Mega Man', 'Donkey Kong',
];

const books: string[] = [
  'Narnia', 'Percy Jackson', 'Diary of a Wimpy Kid',
  'Charlotte\'s Web', 'Where the Wild Things Are', 'Goosebumps', 'Captain Underpants',
  'The Cat in the Hat', 'Green Eggs and Ham', 'Romeo and Juliet', 'Hamlet',
  'Moby Dick', 'Pride and Prejudice', 'The Great Gatsby', '1984', 'Dracula',
  'Frankenstein',
];

// ── Build list ──────────────────────────────────────────

function toEntries(words: string[], hint: string): WordEntry[] {
  return words.map((word) => ({ word, hint }));
}

export const WORD_LIST: WordEntry[] = [
  ...toEntries(actors, 'Actor'),
  ...toEntries(musicians, 'Musician'),
  ...toEntries(athletes, 'Athlete'),
  ...toEntries(historicalFigures, 'Historical Figure'),
  ...toEntries(publicFigures, 'Public Figure'),
  ...toEntries(fictionalCharacters, 'Fictional Character'),
  ...toEntries(countries, 'Country'),
  ...toEntries(cities, 'City'),
  ...toEntries(landmarks, 'Landmark'),
  ...toEntries(naturalPlaces, 'Natural Wonder'),
  ...toEntries(famousPlaces, 'Famous Place'),
  ...toEntries(electronics, 'Electronics'),
  ...toEntries(furniture, 'Furniture'),
  ...toEntries(appliances, 'Appliance'),
  ...toEntries(householdItems, 'Household Item'),
  ...toEntries(tools, 'Tool'),
  ...toEntries(vehicles, 'Vehicle'),
  ...toEntries(accessories, 'Accessory'),
  ...toEntries(officeSupplies, 'Office Supply'),
  ...toEntries(toysAndGames, 'Toy'),
  ...toEntries(sportsGear, 'Sports Equipment'),
  ...toEntries(instruments, 'Instrument'),
  ...toEntries(nature, 'Nature'),
  ...toEntries(fruits, 'Fruit'),
  ...toEntries(vegetables, 'Vegetable'),
  ...toEntries(meats, 'Meat'),
  ...toEntries(meals, 'Dish'),
  ...toEntries(desserts, 'Dessert'),
  ...toEntries(drinks, 'Drink'),
  ...toEntries(condiments, 'Condiment'),
  ...toEntries(snacks, 'Snack'),
  ...toEntries(mammals, 'Animal'),
  ...toEntries(birds, 'Bird'),
  ...toEntries(reptiles, 'Reptile'),
  ...toEntries(seaCreatures, 'Sea Creature'),
  ...toEntries(insects, 'Bug'),
  ...toEntries(movies, 'Movie'),
  ...toEntries(tvShows, 'TV Show'),
  ...toEntries(videoGames, 'Video Game'),
  ...toEntries(books, 'Book'),
];
