*This project has been created as part of the 42 curriculum by
aelison, tolrandr, rarakoto, srandria, mravelon*

## Description

A real estate marketplace tailored to the Malagasy market, designed to make buying, selling, and renting property simple and accessible. Users can browse listings published by other members, view detailed property information, and connect to move forward with a transaction.

The platform integrates AI-powered tools to help users discover properties that match their needs and preferences. It supports both sales and rentals across multiple property types, including land, houses, and apartments.

## Instructions
### Prerequisites

Ensure your machine has at least **20 GB of free disk space**.

You will need the following tools installed:

- **Docker** (including **Docker Compose**; if it’s not included with your Docker installation, install it separately)
- **Git**, to clone the repository
- **Make**, to build and run the project

Once all prerequisites are installed, you can launch the project using `make`.

### Execution

First, review the `.env_example` file located at the root of the project and create your own `.env` file based on it.  

Then, simply run the command:

```bash
make
```

### Resources

## Front-End

- **Documentation**
  - https://react.dev/learn
  - https://tailwindcss.com/docs/installation/using-vite
  - https://developer.mozilla.org/fr/docs/Web/CSS
  - https://react.i18next.com/

- **Video Resources**
  - https://www.youtube.com/watch?v=NTmh8l-Xl4c
  - https://www.youtube.com/watch?v=E8lXC2mR6-k&t=550s
  - https://www.youtube.com/watch?v=-O1ds-kPUZg
  - https://www.youtube.com/@whosajid

- **AI Utilization**
  - Translate all JSON values used by i18n to ensure accurate and consistent localization.
## AI Service

- **LLMs & AI Platforms**
  - http://routeway.ai/
  - https://routeway.ai/mistral/devstral-2512%3Afree
  - https://console.groq.com/home
  - https://www.geeksforgeeks.org/nlp/groq-api-with-llama-3/

- **Vector Databases (ChromaDB)**
  - https://www.datacamp.com/tutorial/chromadb-tutorial-step-by-step-guide
  - https://docs.trychroma.com/guides/deploy/docker
  - https://docs.trychroma.com/guides/deploy/python-thin-client
  - https://docs.trychroma.com/docs/run-chroma/client-server
  - https://docs.trychroma.com/docs/collections/manage-collections
  - https://testcontainers.com/modules/chroma/?language=java

- **Backend & APIs (Python / FastAPI)**
  - https://fastapi.tiangolo.com/advanced/events/
  - https://docs.pydantic.dev/latest/concepts/models/
  - https://www.python-httpx.org/quickstart/#streaming-responses
  - https://www.w3schools.com/python/ref_module_asyncio.asp
  - https://docs.python.org/3/howto/a-conceptual-overview-of-asyncio.html#a-conceptual-overview-of-asyncio

- **Python Fundamentals**
  - https://www.geeksforgeeks.org/python/constructors-in-python/
  - https://stackoverflow.com/questions/402504/how-can-i-determine-a-python-variables-type
  - https://www.w3schools.com/python/python_json.asp
  - https://www.w3schools.com/python/python_lists.asp

- **NLP & Embeddings**
  - https://pypi.org/project/sentence-transformers/

- **Security & Auth**
  - https://medium.com/@firatmelih/what-is-jwt-8f570fa2470e

- **HTTP & Networking**
  - https://netnut.io/httpx-vs-requests/

- **Frontend / JS Integration**
  - https://www.npmjs.com/package/react-markdown
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax

- **Video Resources**
  - https://www.youtube.com/watch?v=cm2Ze2n9lxw&t=156s
  - https://www.youtube.com/watch?v=sHCRglj6qtA&start=1



## Team Information

## aelison
- **Role**: Back-End Developer
- **Responsibilities**:
	- Integrated AI capabilities into the project backend.
	- Implemented ChromaDB to manage contextual data for AI interactions.
	- Designed and maintained system prompts combined with ChromaDB to build a robust RAG pipeline.
	- Ensured AI features complied with project requirements through thorough testing and validation.

## mravelon
- **Role**: Product Owner & Back-End Developer
- **Responsibilities**:
	- Defined product vision, features, and priorities in alignment with business objectives.
	- Acted as the primary liaison between stakeholders and the development team.
	- Prioritized and validated backlog items to ensure maximum value delivery per sprint.
	- Approved completed features by verifying functional and business requirements.
	- Designed and maintained the credit management service and related APIs.

## tolrandr
- **Role**: Back-End Developer
- **Responsibilities**:
	- Developed the authentication and authorization APIs.
	- Implemented the User API to handle all user-related operations.
	- Integrated OAuth flows for secure third-party authentication.
	- Designed and maintained the reservation API.

## srandria
- **Role**: Technical Lead & Full-Stack Developer
- **Responsibilities**:
	- Designed and oversaw the overall system architecture of the project.
	- Implemented the listings API.
	- Developed the reservation interface and related frontend–backend interactions.
	- Reviewed and validated backlog items to ensure technical and functional completeness.

## rarakoto
- **Role**: Project Manager, Front-End Developer & Integration Lead
- **Responsibilities**:
	- Designed and implemented the complete user interface of the application.
	- Defined the project roadmap on GitHub and coordinated task distribution across the team.
	- Led frontend–backend integration to ensure seamless data flow and functionality.
	- Evaluated feature feasibility and scope, deciding which features to implement or defer.
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

## Major Modules

### 1. Public API
A secured public API for interacting with the database.

**Requirements**
- API key–based authentication
- Rate limiting
- Public documentation
- At least 5 endpoints, including:
	- `GET    /api/{resource}`
	- `POST   /api/{resource}`
	- `PUT    /api/{resource}`
	- `DELETE /api/{resource}`

---

### 2. Advanced Permission System
A role-based access control (RBAC) system.

**Features**
- Full user management (CRUD operations)
- Role management (admin, user, guest, moderator, etc.)
- Conditional views and actions based on user roles

---

### 3. Retrieval-Augmented Generation (RAG) System
An AI-powered question–answering system built on contextual retrieval.

**Capabilities**
- Interaction with a large, indexed dataset
- User-driven question answering
- Accurate context retrieval and response generation

**Implementation**
- Assigned to **aelison**
- Implemented using **ChromaDB**
- Experimentation with multiple system prompts for optimal RAG behavior

---

### 4. LLM System Interface
A unified interface for interacting with Large Language Models.

**Capabilities**
- Text (and/or image) generation from user input
- Streaming response handling
- Robust error handling and rate limiting

**Implementation**
- Assigned to **aelison**
- Implemented using **Groq LLM APIs**
- Uses free models with real-time streaming support

---

### 5. Microservices-Based Backend
A scalable backend architecture built with independent services.

**Principles**
- Loosely coupled services with clear responsibilities
- Communication via REST APIs and/or message queues
- Each service follows the single-responsibility principle

---

## Minor Modules

### Frontend & Backend Stack
- Frontend framework: **React**
- Backend framework: **Express**
- Database ORM: **Prisma ORM** with **PostgreSQL**

### Platform Features
- Notification system for all create, update, and delete operations
- User activity analytics and insights dashboard
- Advanced search with filtering, sorting, and pagination

### Authentication & Compliance
- Remote authentication using **OAuth 2.0** (Google, GitHub, 42, etc.)
- GDPR compliance features:
	- User data access requests
	- Data deletion with confirmation
	- Export of user data in a readable format
	- Confirmation emails for sensitive data operations

### Accessibility & Internationalization
- Support for additional web browsers
- Multi-language support (i18n)

---

## Evaluation
**Total Points: 20**

## Individuals contributions

??????