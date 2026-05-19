export interface WikiPage {
  id: string
  title: string
  slug: string
  description: string
}

export const mockPages: WikiPage[] = [
  { id: '1', title: 'Getting Started', slug: 'getting-started', description: 'Introduction to build-wiki-ui' },
  { id: '2', title: 'Page List', slug: 'page-list', description: 'Browse and search pages' },
  { id: '3', title: 'Curator Dashboard', slug: 'curator-dashboard', description: 'Manage wiki content' },
  { id: '4', title: 'Assets Management', slug: 'assets', description: 'Upload and organize assets' },
  { id: '5', title: 'Settings', slug: 'settings', description: 'Configure your wiki' },
  { id: '6', title: 'Search Guide', slug: 'search-guide', description: 'How to search across pages' },
  { id: '7', title: 'API Reference', slug: 'api-reference', description: 'Tauri and mock API bridges' },
  { id: '8', title: 'Component Library', slug: 'component-library', description: 'UI components reference' },
  { id: '9', title: 'Theme Customization', slug: 'theme-customization', description: 'Light and dark themes' },
  { id: '10', title: 'Command Palette', slug: 'command-palette', description: 'Quick navigation with ⌘K' },
]
