# SmartAgriSys Responsive Design Guide

## 📱 Overview
This guide outlines the responsive design system implemented across the SmartAgriSys platform to ensure optimal user experience on all devices.

## 🎯 Breakpoints
We use Tailwind CSS's default breakpoint system:

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| `default` | 0px | Mobile phones (portrait) |
| `sm` | 640px | Mobile phones (landscape), small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops, large tablets |
| `xl` | 1280px | Laptops, desktops |
| `2xl` | 1536px | Large desktops |

## 🏗️ Layout Structure

### Container Sizes
- **Mobile**: Full width with 16px padding (`p-4`)
- **Tablet**: 24px padding (`sm:p-6`)
- **Desktop**: 32px padding (`lg:p-8`)
- **Max Width**: 7xl (1280px) for content areas

### Grid Systems
```tsx
// Responsive grid example
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
  {/* Content */}
</div>
```

## 🎨 Typography Scale

### Headings
| Element | Mobile | Desktop | Classes |
|---------|--------|---------|---------|
| H1 | 24px | 30px | `text-2xl sm:text-3xl` |
| H2 | 20px | 24px | `text-xl sm:text-2xl` |
| H3 | 18px | 20px | `text-lg sm:text-xl` |
| Body | 14px | 16px | `text-sm sm:text-base` |
| Small | 12px | 14px | `text-xs sm:text-sm` |

## 📦 Component Patterns

### Cards
```tsx
<Card className="shadow-sm">
  <CardHeader className="p-4 sm:p-6">
    <CardTitle className="text-lg sm:text-xl">Title</CardTitle>
    <CardDescription className="text-sm">Description</CardDescription>
  </CardHeader>
  <CardContent className="p-4 sm:p-6">
    {/* Content */}
  </CardContent>
</Card>
```

### Buttons
```tsx
// Responsive button with adaptive text
<Button className="w-full sm:w-auto">
  <Icon className="mr-2 h-4 w-4" />
  <span className="hidden sm:inline">Full Text</span>
  <span className="sm:hidden">Short</span>
</Button>
```

### Navigation
```tsx
// Responsive sidebar with collapsible content
<div className="flex items-center gap-2 min-w-0">
  <Icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
  <span className="text-base sm:text-lg truncate">Text</span>
</div>
```

## 🖼️ Image Handling

### Responsive Images
```tsx
<img 
  className="w-full h-48 sm:h-64 object-contain rounded-lg" 
  alt="Description"
/>
```

### Image Upload Areas
```tsx
<div className="h-48 sm:h-64 border-2 border-dashed rounded-lg p-4 sm:p-6">
  <Icon className="h-8 w-8 sm:h-10 sm:w-10 mx-auto" />
  <p className="text-xs sm:text-sm text-center">
    <span className="hidden sm:inline">Desktop text</span>
    <span className="sm:hidden">Mobile text</span>
  </p>
</div>
```

## 💬 Chat Interface Patterns

### Message Bubbles
```tsx
<div className="flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%]">
  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
  <div className="rounded-lg px-3 py-2 sm:px-4 sm:py-2 min-w-0">
    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
      {message}
    </p>
  </div>
</div>
```

### Input Areas
```tsx
<div className="flex gap-2 p-3 sm:p-4">
  <Button size="sm" className="flex-shrink-0">
    <Icon className="h-4 w-4" />
    <span className="sr-only sm:not-sr-only sm:ml-1 hidden sm:inline">
      Label
    </span>
  </Button>
  <Textarea className="flex-1 min-h-[40px] max-h-[100px] sm:max-h-[120px]" />
  <Button size="sm" className="flex-shrink-0">
    <Send className="h-4 w-4" />
  </Button>
</div>
```

## 📊 Data Display

### Tables (Mobile-First)
```tsx
// Stack on mobile, table on desktop
<div className="space-y-4 sm:space-y-0">
  <div className="sm:hidden">
    {/* Mobile card layout */}
  </div>
  <div className="hidden sm:block">
    {/* Desktop table layout */}
  </div>
</div>
```

### Charts
```tsx
// Responsive chart container
<ResponsiveContainer width="100%" height="100%">
  <BarChart 
    margin={{ 
      right: window.innerWidth < 640 ? 10 : 30,
      left: window.innerWidth < 640 ? 0 : 10 
    }}
  >
    <XAxis tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }} />
  </BarChart>
</ResponsiveContainer>
```

## 🎛️ Form Patterns

### Form Layout
```tsx
<form className="space-y-4 sm:space-y-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label className="text-sm">Label</Label>
      <Input className="text-sm" />
    </div>
  </div>
  <Button className="w-full sm:w-auto">Submit</Button>
</form>
```

## 🚀 Performance Considerations

### Image Optimization
- Use `next/image` for automatic optimization
- Implement lazy loading for images below the fold
- Use appropriate image formats (WebP, AVIF)

### Bundle Splitting
- Lazy load heavy components
- Use dynamic imports for mobile-specific features
- Implement code splitting by route

### Touch Targets
- Minimum 44px touch targets on mobile
- Adequate spacing between interactive elements
- Use `touch-action` CSS property appropriately

## 🧪 Testing Strategy

### Device Testing
- Test on actual devices when possible
- Use browser dev tools for responsive testing
- Test with slow network connections

### Breakpoint Testing
- Test all major breakpoints
- Ensure smooth transitions between breakpoints
- Verify content doesn't break at edge cases

### Accessibility
- Ensure proper focus management
- Test with screen readers
- Verify keyboard navigation works on all devices

## 📝 Best Practices

### Mobile-First Approach
1. Design for mobile first
2. Progressive enhancement for larger screens
3. Use `min-width` media queries

### Content Strategy
1. Prioritize essential content on mobile
2. Use progressive disclosure
3. Implement smart content hiding/showing

### Performance
1. Optimize images for different screen densities
2. Use appropriate font loading strategies
3. Minimize layout shifts

### Touch Interactions
1. Design for thumb-friendly navigation
2. Implement swipe gestures where appropriate
3. Provide visual feedback for touch interactions

## 🔧 Utility Classes

### Common Responsive Patterns
```css
/* Responsive spacing */
.responsive-padding { @apply p-4 sm:p-6 lg:p-8; }
.responsive-margin { @apply m-4 sm:m-6 lg:m-8; }

/* Responsive text */
.responsive-title { @apply text-2xl sm:text-3xl lg:text-4xl; }
.responsive-body { @apply text-sm sm:text-base; }

/* Responsive grid */
.responsive-grid { @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3; }
.responsive-gap { @apply gap-4 sm:gap-6 lg:gap-8; }
```

## 🎯 Component Checklist

When creating responsive components, ensure:

- [ ] Mobile-first design approach
- [ ] Appropriate touch targets (min 44px)
- [ ] Readable text sizes on all devices
- [ ] Proper spacing and padding
- [ ] Images scale appropriately
- [ ] Navigation works on touch devices
- [ ] Forms are easy to fill on mobile
- [ ] Content is accessible at all breakpoints
- [ ] Performance is optimized for mobile networks

## 📱 Platform-Specific Considerations

### iOS
- Respect safe areas
- Handle notch and home indicator
- Use appropriate haptic feedback

### Android
- Support different screen densities
- Handle back button behavior
- Respect system navigation

### Web
- Progressive Web App features
- Responsive images with srcset
- Touch and mouse interaction support

This responsive design system ensures that SmartAgriSys provides an excellent user experience across all devices and screen sizes.
