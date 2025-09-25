USE slsldb;

/* Insert sample cards data */
INSERT INTO cards (video_url, question, option_1, option_2, option_3, option_4, correct_answer, chapter, difficulty) VALUES
-- Basics Chapter
('https://vimeo.com/347119375', 'What does this sign mean?', 'Hello', 'Goodbye', 'Thank you', 'Please', 'Hello', 'Basics', 0.3),
('https://vimeo.com/347119375', 'What does this sign mean?', 'Hello', 'Goodbye', 'Thank you', 'Please', 'Goodbye', 'Basics', 0.3),
('https://vimeo.com/347119375', 'What does this sign mean?', 'Hello', 'Goodbye', 'Thank you', 'Please', 'Please', 'Basics', 0.4),
('https://vimeo.com/347119375', 'What does this sign mean?', 'Hello', 'Goodbye', 'Thank you', 'Please', 'Thank you', 'Basics', 0.4),
('https://vimeo.com/347119375', 'What does this sign mean?', 'Yes', 'No', 'Maybe', 'I don''t know', 'Yes', 'Basics', 0.3),
('https://vimeo.com/347119375', 'What does this sign mean?', 'Yes', 'No', 'Maybe', 'I don''t know', 'No', 'Basics', 0.3),
('https://vimeo.com/347119375', 'What does this sign mean?', 'Yes', 'No', 'Maybe', 'I don''t know', 'Maybe', 'Basics', 0.5),
('https://vimeo.com/347119375', 'What does this sign mean?', 'Yes', 'No', 'Maybe', 'I don''t know', 'I don''t know', 'Basics', 0.5),
('https://vimeo.com/347119375', 'What does this sign mean?', 'How', 'What', 'When', 'Where', 'How', 'Basics', 0.4),
('https://vimeo.com/347119375', 'What does this sign mean?', 'How', 'What', 'When', 'Where', 'What', 'Basics', 0.4),

-- Greetings Chapter
('https://example.com/sign/goodmorning.mp4', 'What does this sign mean?', 'Good morning', 'Good afternoon', 'Good evening', 'Good night', 'Good morning', 'Greetings', 0.5),
('https://example.com/sign/goodafternoon.mp4', 'What does this sign mean?', 'Good morning', 'Good afternoon', 'Good evening', 'Good night', 'Good afternoon', 'Greetings', 0.5),
('https://example.com/sign/goodevening.mp4', 'What does this sign mean?', 'Good morning', 'Good afternoon', 'Good evening', 'Good night', 'Good evening', 'Greetings', 0.5),
('https://example.com/sign/goodnight.mp4', 'What does this sign mean?', 'Good morning', 'Good afternoon', 'Good evening', 'Good night', 'Good night', 'Greetings', 0.5),
('https://example.com/sign/howareyou.mp4', 'What does this sign mean?', 'How are you?', 'Nice to meet you', 'See you later', 'Take care', 'How are you?', 'Greetings', 0.6),

-- Food Signs Chapter
('https://example.com/sign/water.mp4', 'What does this sign mean?', 'Water', 'Coffee', 'Tea', 'Juice', 'Water', 'Food Signs', 0.4),
('https://example.com/sign/coffee.mp4', 'What does this sign mean?', 'Water', 'Coffee', 'Tea', 'Juice', 'Coffee', 'Food Signs', 0.4),
('https://example.com/sign/tea.mp4', 'What does this sign mean?', 'Water', 'Coffee', 'Tea', 'Juice', 'Tea', 'Food Signs', 0.4),
('https://example.com/sign/juice.mp4', 'What does this sign mean?', 'Water', 'Coffee', 'Tea', 'Juice', 'Juice', 'Food Signs', 0.4),
('https://example.com/sign/bread.mp4', 'What does this sign mean?', 'Bread', 'Rice', 'Pasta', 'Pizza', 'Bread', 'Food Signs', 0.5),

-- Family Chapter
('https://example.com/sign/mother.mp4', 'What does this sign mean?', 'Mother', 'Father', 'Sister', 'Brother', 'Mother', 'Family', 0.4),
('https://example.com/sign/father.mp4', 'What does this sign mean?', 'Mother', 'Father', 'Sister', 'Brother', 'Father', 'Family', 0.4),
('https://example.com/sign/sister.mp4', 'What does this sign mean?', 'Mother', 'Father', 'Sister', 'Brother', 'Sister', 'Family', 0.4),
('https://example.com/sign/brother.mp4', 'What does this sign mean?', 'Mother', 'Father', 'Sister', 'Brother', 'Brother', 'Family', 0.4),
('https://example.com/sign/grandmother.mp4', 'What does this sign mean?', 'Grandmother', 'Grandfather', 'Aunt', 'Uncle', 'Grandmother', 'Family', 0.5),

-- Numbers Chapter
('https://example.com/sign/one.mp4', 'What does this sign mean?', 'One', 'Two', 'Three', 'Four', 'One', 'Numbers', 0.3),
('https://example.com/sign/two.mp4', 'What does this sign mean?', 'One', 'Two', 'Three', 'Four', 'Two', 'Numbers', 0.3),
('https://example.com/sign/three.mp4', 'What does this sign mean?', 'One', 'Two', 'Three', 'Four', 'Three', 'Numbers', 0.3),
('https://example.com/sign/four.mp4', 'What does this sign mean?', 'One', 'Two', 'Three', 'Four', 'Four', 'Numbers', 0.3),
('https://example.com/sign/five.mp4', 'What does this sign mean?', 'Five', 'Six', 'Seven', 'Eight', 'Five', 'Numbers', 0.4);