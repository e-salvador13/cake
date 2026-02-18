# 🎂 Cake - Weekly Task Tracker

Complete your tasks, earn your cake! A delightful weekly task tracker for "Cake Meetings."

## Concept

Eduardo and his colleague do weekly "Cake Meetings" where they draw a cake on a postcard and write tasks on the back. If they complete tasks, they get cake. This app digitizes that beautiful ritual.

## Features

- **Flip Card UI** - Front shows a cake emoji + date range, back shows tasks
- **Task Management** - Add, complete, and delete tasks
- **Voice Input** - Tap the mic icon to add tasks by speaking (Web Speech API)
- **Week Archive** - Grid of past week cards, scroll through history
- **Progress Tracking** - See completion percentage, get celebration when 100% done
- **Warm Design** - Cream/postcard aesthetic, minimal and delightful

## Tech Stack

- Next.js 14+ with App Router
- Tailwind CSS
- TypeScript
- localStorage for persistence

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Data Structure

```typescript
{
  weeks: [{
    id: string,
    startDate: string,     // YYYY-MM-DD
    endDate: string,       // YYYY-MM-DD  
    cakeEmoji: string,     // 🎂, 🍰, 🧁, etc.
    tasks: [{
      id: string,
      text: string,
      completed: boolean
    }]
  }]
}
```

## Future Ideas

- AI-generated cake illustrations
- Supabase backend for sync across devices
- Team collaboration features
- Actual cake ordering integration 🍰

---

Made with 🍰 for weekly cake meetings
