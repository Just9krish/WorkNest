# WorkNest

A Notion-style project management application for organizing pages, notes, and tasks.

## What is WorkNest?

WorkNest is a web application that lets you create and organize content in a block-based editor. You can create pages, add different types of content blocks, and use templates for calendars and roadmaps.

## Features

- **Block-based Editor**: Create text, headings, todos, images, code blocks, and more
- **Pages**: Organize content in nested pages with icons
- **Templates**: Calendar and Roadmap templates for project planning
- **Slash Commands**: Type "/" to quickly insert different block types
- **Dark/Light Mode**: Switch between themes
- **Auto-save**: Changes are automatically saved

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Appwrite (backend)
- shadcn/ui components

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file with your Appwrite credentials:
```
VITE_APPWRITE_ENDPOINT=your_appwrite_endpoint
VITE_APPWRITE_PROJECT_ID=your_project_id
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
