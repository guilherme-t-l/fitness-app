# 🏋️‍♂️ Fitness App Development Rules

This document consolidates all rules, guidelines, and standards for the fitness app development. **This is the single source of truth for all development decisions.**

---

## 📋 Table of Contents

1. [Design Rules](#design-rules)
2. [Frontend Development Rules](#frontend-development-rules)
3. [Testing Rules](#testing-rules)
4. [Database Rules](#database-rules)
5. [Performance Rules](#performance-rules)
6. [User Experience Rules](#user-experience-rules)

---

## 🎨 Design Rules

### Visual Style
- **Dark Mode by default:** Sleek, modern, and edgy — think high-end nightclub or luxury fitness studio
- **Inspiration:** Structure and polish from Airbnb, clean typography from Apple, and the dark, rebellious energy of Gymshark Blackout or Nike Training Club's dark mode
- **Layout:** Clean, spacious, with generous padding and clear visual hierarchy
- **Micro-interactions:** Smooth, subtle, and refined — never childish or over-the-top
- **Mood:** Confident, sleek, unapologetically bold. Visual emphasis on strength, exclusivity, and a premium feel

### Tone & Brand
- **Voice:** Confident, sleek, and bold
- **Animation:** Elegant and modern, never childish or excessive
- **Brand Feel:** Strong, exclusive, premium

### Mobile & Responsive
- **Fully responsive:** Works flawlessly on all devices, from small phones to ultrawide monitors
- **Mobile-first:** Layouts, touch targets, and readability optimized for handheld devices
- **No hidden/broken mobile functionality:** No "desktop-only" elements
- **Navigation & CTAs:** Always obvious and accessible on all screen sizes

### Accessibility
- **Best practices:** Maintain contrast, logical focus order, and readable text
- **Dark ≠ hard to read:** Everything must be easy on the eyes and inclusive
- **Keyboard navigation:** Full keyboard support for all interactive elements
- **Touch targets:** Minimum 44px for mobile interactions

### Design Priorities
- **Visual hierarchy:** Information is scannable at a glance
- **Breathing room:** Space is strength — don't crowd, but don't leave too much empty space (Airbnb/Apple inspired)
- **Consistency:** Layouts, button styles, spacing, and interactions are cohesive throughout
- **Scalability:** Components and layout are easy to expand as new features are added

### Color System
- **Primary:** Green (success, progress)
- **Secondary:** Purple (accent, premium)
- **Neon accents:** Cyan, purple, green for highlights
- **Background:** Dark grays with subtle gradients
- **Text:** High contrast white/gray for readability

---

## 💻 Frontend Development Rules

### Tech Stack
- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** TailwindCSS with custom design system
- **Components:** shadcn/ui + custom components
- **State Management:** React hooks (useState, useEffect, custom hooks)
- **Database:** Supabase with real-time capabilities

### Code Organization
- **File Structure:**
  ```
  app/           # Next.js app router pages
  components/    # Reusable UI components
  hooks/         # Custom React hooks
  lib/           # Utilities and services
  public/        # Static assets
  ```

### Component Standards
- **Custom components must follow design principles**
- **Props interfaces for all components**
- **Error boundaries for async operations**
- **Loading states for all async operations**

### State Management
- **Use custom hooks for complex state**
- **Auto-save all user input**
- **Optimistic updates for better UX**
- **Proper error handling and user feedback**

### Code Quality
- **No any types without explicit justification**
- **Meaningful variable and function names**
- **Comments for most logics**
- **Non-technical person (Product Manager) should be able to understand**

### Performance
- **Lazy loading for non-critical components**
- **Optimized images and assets**
- **Minimal bundle size**
- **Efficient re-renders with proper dependencies**

---

## 🧪 Testing Rules

### AI Tester Agent Framework
- **Perspective:** Product Manager / End User
- **Focus:** Real-world user workflows and scenarios
- **Approach:** User-focused testing, not technical testing

### Test Categories
1. **UI/UX Testing** - Interface usability and user experience
2. **Functionality Testing** - Core feature validation
3. **Workflow Testing** - End-to-end user journeys
4. **Edge Case Testing** - Error handling and boundary conditions

### Test Report Format
Each test report must include:
1. **Test Definition** - What functionality is being tested
2. **Test List** - Specific tests to be executed
3. **Test Execution** - Results of each test
4. **Summary** - Overall verdict and recommendations

### Testing Standards
- **All new features require AI Tester Agent validation**
- **Test on mobile devices first**
- **Verify timer accuracy across devices**
- **Test workout editing workflows end-to-end**
- **Maintain 100% test pass rate**
- **Test accessibility features**

### Success Metrics
- **Total Tests Executed:** Track all tests
- **Success Rate:** Target 100%
- **User Experience Score:** Excellent rating required
- **Mobile Compatibility:** Full functionality on all devices

---

## 🗄️ Database Rules

### Schema Standards
- **All tables use UUID primary keys**
- **Proper foreign key relationships**
- **Consistent naming conventions**
- **JSONB for flexible data structures**
- **Timestamps for all records**

### Data Integrity
- **Proper validation at database level**
- **Cascade deletes where appropriate**
- **Unique constraints where needed**
- **Check constraints for data validation**


### Error Handling
- **Robust error handling for all database operations**
- **User-friendly error messages**
- **Proper logging for debugging**

### Future Multi-User Support
- **user_id field in all tables**
- **Row Level Security (RLS) policies**
- **Scalable architecture for multiple users**
- **Data isolation between users**

---

## ⚡ Performance Rules

### Load Times
- **Page load times < 2 seconds**
- **First Contentful Paint < 1.5 seconds**
- **Largest Contentful Paint < 2.5 seconds**

### Timer Accuracy
- **Timer accuracy within 1 second on all devices**
- **Timestamp-based calculations, not interval-based**
- **Handle mobile browser throttling**
- **Page visibility API for background tabs**

### Mobile Performance
- **Touch response < 100ms**
- **Smooth scrolling on all devices**

---

## 👥 User Experience Rules

### Auto-Save
- **Auto-save all user input**
- **Visual feedback for save status**
- **Conflict resolution for concurrent edits**
- **No data loss on page refresh**

### Feedback & Notifications
- **Immediate feedback for all actions**
- **Toast notifications for important events**
- **Loading states for async operations**
- **Error messages with actionable solutions**

### Navigation
- **Intuitive navigation patterns**
- **Breadcrumbs for complex workflows**
- **Back button functionality**
- **Keyboard shortcuts for power users**

### Mobile Experience
- **Touch-friendly interface**
- **Swipe gestures where appropriate**
- **Portrait and landscape support**
- **Offline capability for core features**

### Accessibility
- **WCAG 2.1 AA compliance**
- **Screen reader support**
- **Keyboard navigation**
- **High contrast mode support**
- **Focus indicators**

---

## 🔄 Development Workflow Rules

### Git & Version Control
- **Auto-sync with GitHub enabled**
- **Meaningful commit messages**
- **Feature branches for major changes**
- **Pull request reviews for all changes**
- **NEVER commit and push to main, always to staging.**

### Code Review Checklist
- [ ] Follows design principles
- [ ] Passes all tests
- [ ] Mobile responsive
- [ ] Accessibility compliant
- [ ] Performance optimized
- [ ] TypeScript strict mode
- [ ] Error handling implemented

### Deployment
- **Environment variables properly configured**
- **Database migrations tested**
- **Performance monitoring enabled**
- **Error tracking implemented**

---

## 📊 Success Metrics

### Quality Gates
- **100% test pass rate**
- **No accessibility violations**
- **Performance benchmarks met**
- **Mobile compatibility verified**
- **Design principles followed**

### Monitoring
- **User engagement metrics**
- **Performance monitoring**
- **Error tracking and resolution**
- **Feature usage analytics**

---

## 🚨 Breaking Changes

**Any changes that violate these rules require:**
1. **Explicit justification**
2. **Team review and approval**
3. **Documentation of the exception**
4. **Plan to bring back into compliance**

---

**Last Updated:** July 07, 2025
**Version:** 1.0  
**Next Review:** 