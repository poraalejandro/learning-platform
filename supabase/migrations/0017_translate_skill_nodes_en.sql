-- English migration, step 1: skill_nodes titles. Descriptions are all null,
-- nothing to translate there. Idempotent (plain updates by id).

update skill_nodes set title = 'Python basics' where id = 'm1-python-basics';
update skill_nodes set title = 'Data structures in depth' where id = 'm2-data-structures';
update skill_nodes set title = 'OOP in Python' where id = 'm3-oop';
update skill_nodes set title = 'Errors and basic testing' where id = 'm4-testing-errors';
update skill_nodes set title = 'Concurrency (async/await)' where id = 'm5-async';
update skill_nodes set title = 'Embeddings, RAG, vector DBs' where id = 'm6-rag-vectors';
update skill_nodes set title = 'Dynamic prompting + tool calling' where id = 'm7-prompting-tools';
update skill_nodes set title = 'Agents with LangGraph + memory' where id = 'm8-agents-langgraph';
update skill_nodes set title = 'Capstone project' where id = 'm9-capstone';
update skill_nodes set title = 'Clean code & refactoring' where id = 's1-clean-code';
update skill_nodes set title = 'SOLID principles' where id = 's2-solid';
update skill_nodes set title = 'Unit vs integration testing' where id = 's3-testing-types';
update skill_nodes set title = 'Patterns: Factory, Strategy, Observer' where id = 's4-design-patterns';
update skill_nodes set title = 'Monolith vs microservices, Clean Architecture' where id = 's5-architecture';
update skill_nodes set title = 'Docker for developers' where id = 's6-docker';
