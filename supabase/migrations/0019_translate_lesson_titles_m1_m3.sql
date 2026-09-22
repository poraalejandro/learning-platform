-- Fix: 0018 translated content_md but missed the `title` column. Idempotent.

update lessons set title = 'Basic Python syntax' where id = 'm1-lesson-basics';
update lessons set title = 'Lists: aliases, copies, and mutable arguments' where id = 'm2-l1';
update lessons set title = 'Comprehensions and generators: when to materialize' where id = 'm2-l2';
update lessons set title = 'Classes: what self is and what __init__ is for' where id = 'm3-l1';
update lessons set title = 'Inheritance and composition: ''is-a'' vs ''has-a''' where id = 'm3-l2';
