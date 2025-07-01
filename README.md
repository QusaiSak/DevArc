# DevArc - AI-Powered Code Analysis and Documentation

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

DevArc is an intelligent code analysis and documentation tool that leverages AI to help developers understand, document, and maintain their codebases more effectively. It provides comprehensive documentation generation, code analysis, and architectural insights for your projects.

## ✨ Features

- **AI-Powered Documentation**: Automatically generate comprehensive documentation for your codebase using OpenRouter's AI models
- **Code Analysis**: Get detailed insights into your project's architecture and patterns
- **Interactive UI**: Modern, responsive interface built with React and Tailwind CSS
- **GitHub Integration**: Seamlessly analyze repositories directly from GitHub
- **Mermaid.js Integration**: Visualize architecture and data flows with interactive diagrams
- **Real-time Collaboration**: Share and collaborate on documentation with your team

## 🚀 Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **AI Integration**: OpenRouter API, AI-SDK
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Context API
- **Visualization**: Mermaid.js
- **Build Tool**: Vite

## 📦 Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- GitHub Personal Access Token (for GitHub integration)
- PostgreSQL database (for production)

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/QusaiSak/DevArc.git
   cd devarc
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```env
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   VITE_GITHUB_TOKEN=your_github_token
   DATABASE_URL=your_database_url
   ```

4. Run database migrations (if applicable):
   ```bash
   npx drizzle-kit push:pg
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🚀 Usage

1. **Import a Repository**:
   - Click on "Import Repository" and enter the GitHub repository URL
   - Or clone a repository locally and open it in DevArc

2. **Generate Documentation**:
   - Navigate to the "Documentation" tab
   - Click "Generate Documentation" to start the analysis
   - View the automatically generated documentation

3. **Explore Codebase**:
   - Browse through the file structure
   - View detailed information about components, functions, and APIs
   - See visual representations of your architecture

## 📚 Documentation Structure

DevArc generates comprehensive documentation including:

- **Project Overview**: High-level description of the project
- **Architecture**: Detailed breakdown of the system architecture
- **API Documentation**: Endpoints, methods, and parameters
- **Component Library**: Reusable UI components
- **Data Models**: Database schemas and relationships
- **Code Examples**: Usage examples and snippets

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for providing access to multiple AI models
- [Vite](https://vitejs.dev/) for the excellent development experience
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives

---

Built with ❤️ by [Qusai Sakerwala](https://github.com/QusaiSak)
