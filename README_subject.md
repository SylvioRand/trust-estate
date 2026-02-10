*This project has been created as part of the 42 curriculum by
aelison, tolrandr, rarakoto, srandria, mravelon*

## Description

A real estate marketplace adapted to the Malagasy market, built on the need to find or sell real estate. Users can view all real estate listings posted by other users. Logged-in users can continue with visiting the listing, and maybe close the deal. AI is integrated to help users find their dream property. The website covers both sales and rental listing for the following type of real estate : land, house, apartment.

## Instructions

### Prerequisites

You need to have at least 20gb spaces on your machine. 
Then you need to install 'docker'. If you did not take it with 'docker compose', then you need to install  'docker compose' too.
You also have to install 'git' to get the repository
Finally you need to install 'make' to launch the the project.

### Execution

First you have to read the '.env_example' file located at the root, and create your own from that model. 
Use the command 'make' to launch the project. Enjoy !

### Resources

#### AI Documentations
http://routeway.ai/
https://www.geeksforgeeks.org/nlp/groq-api-with-llama-3/
https://www.datacamp.com/tutorial/chromadb-tutorial-step-by-step-guide
https://docs.trychroma.com/guides/deploy/docker
https://www.youtube.com/watch?v=cm2Ze2n9lxw&t=156s
https://testcontainers.com/modules/chroma/?language=java
https://netnut.io/httpx-vs-requests/
https://fastapi.tiangolo.com/advanced/events/
https://docs.pydantic.dev/latest/concepts/models/
https://docs.trychroma.com/guides/deploy/python-thin-client
https://docs.trychroma.com/docs/run-chroma/client-server
https://www.geeksforgeeks.org/python/constructors-in-python/
https://pypi.org/project/sentence-transformers/
https://docs.trychroma.com/docs/collections/manage-collections
https://routeway.ai/mistral/devstral-2512%3Afree
https://medium.com/@firatmelih/what-is-jwt-8f570fa2470e
https://stackoverflow.com/questions/402504/how-can-i-determine-a-python-variables-type
https://www.w3schools.com/python/python_json.asp
https://www.w3schools.com/python/python_lists.asp
https://www.youtube.com/watch?v=sHCRglj6qtA&start=1
https://www.python-httpx.org/quickstart/#streaming-responses
https://www.w3schools.com/python/ref_module_asyncio.asp
https://docs.python.org/3/howto/a-conceptual-overview-of-asyncio.html#a-conceptual-overview-of-asyncio
https://www.npmjs.com/package/react-markdown
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
https://console.groq.com/home


## Team Information

aelison:
	role: Developer
	responsibilities: 
		- Integrate the AI to the project.
		- Use chromadb for the context of the AI.
		- Create appropriate system prompt in addition of chromadb to make the RAG system.
		- Testing everything works well, follow subject rules in the project.
tolrandr:
rarakoto:
srandria:
mravelon:

## Project Management

We assigned roles from what each of use wanted to try, to learn, or just to do because the member already know about it.
We used github tools: creating a project on github, create an issue for each task, assign someone to it with the appropriate flags depending on the case.
We used slack to communicate with the team.

## Technical stack

Frontend technogies: 

Backend technologies: 

Database system: 


## Database schema

???

## Features list

?????

## Modules

#### Major modules

1.  A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints:
	◦ GET /api/{something}
	◦ POST /api/{something}
	◦ PUT /api/{something}
	◦ DELETE /api/{something}

2. Advanced permissions system:
	◦ View, edit, and delete users (CRUD).
	◦ Roles management (admin, user, guest, moderator, etc.).
	◦ Different views and actions based on user role.

3. Implement a complete RAG (Retrieval-Augmented Generation) system.
	◦ Interact with a large dataset of information.
	◦ Users can ask questions and get relevant answers.
	◦ Implement proper context retrieval and response generation.
	=> Assign to aelison. I used chromadb and try different system prompt.

4. Implement a complete LLM system interface.
	◦ Generate text and/or images based on user input.
	◦ Handle streaming responses properly.
	◦ Implement error handling and rate limiting
	=> Assign to aelison. I used LLM's API from Groq provider using free models to generate text in streaming.
	
5. Backend as microservices.
	◦ Design loosely-coupled services with clear interfaces.
	◦ Use REST APIs or message queues for communication.
	◦ Each service should have a single responsibility.

#### Minor modules

1. Use a frontend framework => React
2. Use a backend framework => Express
3. Use an ORM for the database => Prisma ORM for PostgresSQL
4. A complete notification system for all creation, update, and deletion actions.
5. User activity analytics and insights dashboard.
6. Implement advanced search functionality with filters, sorting, and pagination.
7. Implement remote authentication with OAuth 2.0 (Google, GitHub, 42, etc.).
8. GDPR compliance features.
	◦ Allow users to request their data.
	◦ Data deletion with confirmation.
	◦ Export user data in a readable format.
	◦ Confirmation emails for data operations.
9. Support for additional browsers
10. Support for multiple languages
#### Total points: 20


## Individuals contributions

??????