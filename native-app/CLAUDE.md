# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build, Test & Lint Commands
- Start app: `npm start` or `npx expo start`
- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`
- Run tests: `npm test` (Jest in watch mode)
- Run single test: `npx jest path/to/test.ts`
- Lint: `npm run lint`

## Code Style Guidelines
- TypeScript with strict mode enabled
- Use path aliases: `@/*` for root imports
- Redux pattern: use typed hooks (`useAppSelector`, `useAppDispatch`)
- Components: React functional components with named exports
- Styles: StyleSheet.create for component styles
- Comments: JSDoc style for interfaces and functions
- State management: Redux slices with typed actions
- Error handling: Try/catch with appropriate logging
- File structure: File-based routing (Expo Router)
- Imports: Group by external/internal, sort alphabetically