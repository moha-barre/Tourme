# Professional UI Components

## Overview
This document describes the professional UI components that have been added to enhance the visual appeal and user experience of the Tourme platform.

## Components

### 1. Logo Component (`app/components/Logo.tsx`)
A professional logo component with gradient text and trophy icon.

**Usage:**
```tsx
import { Logo } from './components/Logo'

<Logo size="md" />
<Logo size="lg" className="text-blue-600" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' - Controls the size of the logo
- `className`: string - Additional CSS classes

### 2. LoadingSpinner Component (`app/components/LoadingSpinner.tsx`)
A branded loading spinner with animated trophy icon.

**Usage:**
```tsx
import { LoadingSpinner } from './components/LoadingSpinner'

<LoadingSpinner size="md" text="Loading tournaments..." />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' - Controls the spinner size
- `text`: string - Optional loading text
- `className`: string - Additional CSS classes

### 3. EmptyState Component (`app/components/EmptyState.tsx`)
A professional empty state for when there's no data to display.

**Usage:**
```tsx
import { EmptyState } from './components/EmptyState'
import { Trophy } from 'lucide-react'

<EmptyState
  icon={Trophy}
  title="No tournaments found"
  description="Create your first tournament to get started"
  action={{
    label: "Create Tournament",
    href: "/tournaments/create"
  }}
/>
```

**Props:**
- `icon`: LucideIcon - Icon to display
- `title`: string - Empty state title
- `description`: string - Empty state description
- `action`: object - Optional action button
- `className`: string - Additional CSS classes

### 4. StatsCard Component (`app/components/StatsCard.tsx`)
A professional stats card for displaying metrics and statistics.

**Usage:**
```tsx
import { StatsCard } from './components/StatsCard'
import { Users } from 'lucide-react'

<StatsCard
  title="Total Participants"
  value="1,234"
  icon={Users}
  change={{ value: "12%", type: "increase" }}
/>
```

**Props:**
- `title`: string - Card title
- `value`: string | number - Main value to display
- `icon`: LucideIcon - Icon for the card
- `change`: object - Optional change indicator
- `className`: string - Additional CSS classes

### 5. Button Component (`app/components/Button.tsx`)
A comprehensive button component with multiple variants and states.

**Usage:**
```tsx
import { Button } from './components/Button'
import { Plus } from 'lucide-react'

<Button variant="primary" icon={Plus} loading={false}>
  Create Tournament
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: LucideIcon - Optional icon
- `loading`: boolean - Shows loading spinner
- `disabled`: boolean - Disables the button
- `children`: React.ReactNode - Button content

### 6. Input Component (`app/components/Input.tsx`)
A professional input component with validation and icons.

**Usage:**
```tsx
import { Input } from './components/Input'
import { Search } from 'lucide-react'

<Input
  label="Search tournaments"
  icon={Search}
  placeholder="Enter search term..."
  error="This field is required"
/>
```

**Props:**
- `label`: string - Input label
- `error`: string - Error message
- `icon`: LucideIcon - Optional icon
- `className`: string - Additional CSS classes
- All standard input props

### 7. Card Component (`app/components/Card.tsx`)
A flexible card component for content organization.

**Usage:**
```tsx
import { Card, CardHeader, CardContent, CardFooter } from './components/Card'

<Card>
  <CardHeader>
    <h3>Tournament Details</h3>
  </CardHeader>
  <CardContent>
    <p>Tournament information...</p>
  </CardContent>
  <CardFooter>
    <button>Action</button>
  </CardFooter>
</Card>
```

**Props:**
- `padding`: 'sm' | 'md' | 'lg' - Card padding
- `shadow`: 'sm' | 'md' | 'lg' - Card shadow
- `className`: string - Additional CSS classes

### 8. Badge Component (`app/components/Badge.tsx`)
A badge component for status indicators and labels.

**Usage:**
```tsx
import { Badge } from './components/Badge'

<Badge variant="success" size="md">
  Active
</Badge>
```

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `className`: string - Additional CSS classes

## Professional Enhancements

### Favicon Setup
- **SVG Favicon**: Modern vector favicon with gradient design
- **Multiple Sizes**: 16x16, 32x32, 180x180 (Apple), 192x192, 512x512
- **Web App Manifest**: PWA support for mobile devices
- **Theme Colors**: Consistent branding across platforms

### Branding Elements
- **Logo Design**: Trophy icon with gradient text
- **Color Scheme**: Blue (#2563eb) primary with supporting colors
- **Typography**: Inter font family for modern readability
- **Icons**: Lucide React icons for consistency

### Professional Features
- **Loading States**: Branded loading spinners
- **Empty States**: Helpful empty state messages
- **Error Handling**: Professional error displays
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Proper ARIA labels and focus management

## Usage Guidelines

### Color Palette
- **Primary**: Blue (#2563eb)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)
- **Info**: Blue (#3b82f6)

### Spacing
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)

### Typography
- **Font Family**: Inter
- **Weights**: 100-900
- **Sizes**: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl

## Best Practices

1. **Consistency**: Use the same components throughout the app
2. **Accessibility**: Always include proper labels and ARIA attributes
3. **Responsive**: Test components on different screen sizes
4. **Performance**: Use proper loading states and error boundaries
5. **Branding**: Maintain consistent colors and typography

## Future Enhancements

- **Dark Mode**: Add dark theme support
- **Animations**: Add micro-interactions and transitions
- **Themes**: Support for custom color schemes
- **Internationalization**: Multi-language support
- **Advanced Components**: Data tables, modals, tooltips 