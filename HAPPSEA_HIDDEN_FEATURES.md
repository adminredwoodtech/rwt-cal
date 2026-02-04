# HappSea AI - Cal.com Hidden Features Documentation

**Date**: February 4, 2026  
**Purpose**: Document all Cal.com features hidden for MVP to maintain clarity on what's available if future requirements arise.

---

## Overview

For the HappSea AI MVP, several Cal.com features were hidden (not deleted) to simplify the user interface and focus on core booking functionality. All code remains intact and can be re-enabled by uncommenting the relevant sections.

---

## Hidden Features

### 1. **Apps / Integrations** ❌

**Location**: `apps/web/modules/shell/navigation/Navigation.tsx` (lines 59-90)

**What it does**:
- **App Store**: Browse and install third-party integrations
  - Google Calendar sync
  - Zoom meetings
  - Microsoft Teams
  - Stripe payments
  - Salesforce CRM
  - 100+ other integrations
- **Installed Apps**: Manage connected applications
  - Calendar integrations
  - Video conferencing
  - Payment processors
  - Analytics tools

**Why hidden for MVP**:
- **Claude AI accesses Cal.com directly via API** - no need for calendar sync
- No video calls needed (boat rentals are in-person)
- Payment handled separately through Wompi
- Reduces complexity and setup time

**When to re-enable**:
- If you want to sync bookings with Google Calendar
- If you need video conferencing for virtual consultations
- If you want to integrate with CRM systems
- For advanced payment processing through Cal.com
- If you need analytics integrations

**How to re-enable**:
Uncomment lines 59-90 in `Navigation.tsx`

**Potential use cases**:
- Sync boat availability with owner's personal calendar
- Integrate with accounting software
- Connect to marketing automation tools
- Add payment processing directly in Cal.com

---

### 2. **Routing Forms** ❌

**Location**: `apps/web/modules/shell/navigation/Navigation.tsx` (lines 96-103)

**What it does**:
- **Conditional routing**: Direct customers to different booking types based on their answers
- **Multi-step forms**: Collect information before showing booking options
- **Smart qualification**: Route to appropriate event types based on criteria
- **Custom questions**: Ask questions to determine best booking option

**Example use case**:
```
Question: "How many people?" 
- 1-6 people → Small boat booking
- 7-12 people → Medium boat booking  
- 13+ people → Large yacht booking
```

**Why hidden for MVP**:
- **Claude AI handles all routing** through natural conversation
- AI can ask questions and route intelligently
- No need for static form-based routing
- More flexible than pre-defined routing forms

**When to re-enable**:
- If you want deterministic routing (not AI-based)
- If you need to collect specific data before booking
- For compliance requirements that need structured forms
- If you want customers to self-select without AI
- For A/B testing different booking flows

**How to re-enable**:
Uncomment lines 96-103 in `Navigation.tsx`

**Potential use cases**:
- Qualify customers before showing prices
- Route to different calendars based on boat type
- Collect special requirements before booking
- Implement multi-step booking wizard

---

### 3. **Workflows** ❌

**Location**: `apps/web/modules/shell/navigation/Navigation.tsx` (lines 104-110)

**What it does**:
- **Automated reminders**: Send SMS/Email before bookings
- **Follow-ups**: Automatic messages after bookings
- **Custom triggers**: Actions based on booking events
  - Booking created
  - Booking cancelled
  - Booking rescheduled
  - No-show detected
- **Multi-channel**: Email, SMS, WhatsApp notifications
- **Templates**: Customizable message templates

**Example workflows**:
- Send reminder 24 hours before booking
- Send thank you message after booking
- Request review 2 days after booking
- Send cancellation confirmation

**Why hidden for MVP**:
- **Claude AI handles all notifications** through Chatwoot
- AI can send contextual, personalized messages
- More flexible than template-based workflows
- Reduces configuration complexity

**When to re-enable**:
- If you want scheduled reminders independent of AI
- If you need guaranteed delivery of notifications
- For compliance (e.g., legal notices that must be sent)
- If you want to reduce AI API costs for simple notifications
- For high-volume automated messaging

**How to re-enable**:
Uncomment lines 104-110 in `Navigation.tsx`

**Potential use cases**:
- Automated payment reminders
- Weather alerts before booking date
- Maintenance notifications
- Upsell messages (e.g., "Add catering?")
- Review requests after trip

---

### 4. **Insights / Analytics** ❌

**Location**: `apps/web/modules/shell/navigation/Navigation.tsx` (lines 111-143)

**What it does**:
- **Booking Analytics**: 
  - Total bookings over time
  - Conversion rates
  - Popular time slots
  - Revenue tracking
- **Routing Analytics**: Performance of routing forms
- **Router Position**: Geographic data of bookings
- **Call History**: Video call analytics (if using video)
- **Charts and Reports**: Visual dashboards
- **Export Data**: Download analytics for external analysis

**Why hidden for MVP**:
- **Basic booking list is sufficient** for MVP
- Can see all bookings in the Bookings tab
- Advanced analytics not needed initially
- Reduces cognitive load for owner

**When to re-enable**:
- When you need business intelligence
- For data-driven decision making
- To optimize pricing and availability
- For seasonal trend analysis
- When scaling operations
- For investor/stakeholder reporting

**How to re-enable**:
Uncomment lines 111-143 in `Navigation.tsx`

**Potential use cases**:
- Identify most popular boats
- Optimize pricing based on demand
- Understand peak booking times
- Track revenue trends
- Measure marketing campaign effectiveness
- Forecast demand for capacity planning

---

## Features Kept Visible (Core MVP Requirements)

### ✅ **Event Types**
**CRITICAL FOR MVP**
- Each boat is configured as an Event Type
- Set duration (4 hours, 8 hours, full day)
- Set pricing
- Configure availability
- Add descriptions and photos
- **Cannot function without this**

### ✅ **Bookings**
- View all confirmed bookings
- See upcoming reservations
- Manage booking details
- Cancel/reschedule bookings
- Essential for operations

### ✅ **Availability**
- Set working hours
- Block dates for maintenance
- Configure boat-specific availability
- Set buffer times between bookings
- Essential for preventing double-bookings

### ✅ **Teams**
**Kept for future scalability**
- Add team members (captains, staff)
- Assign permissions
- Manage multiple users
- Not needed for MVP but easy to use later

### ✅ **Settings**
- Account configuration
- Profile settings
- Notification preferences
- Timezone settings
- Basic customization

---

## Implementation Details

### File Modified
- `apps/web/modules/shell/navigation/Navigation.tsx`

### Approach
- Features are **commented out**, not deleted
- All code remains in the codebase
- Easy to re-enable by uncommenting
- Maintains compatibility with upstream Cal.com updates
- TypeScript types remain intact

### Comments Format
```typescript
// HAPPSEA: [Feature Name] hidden for MVP - [Reason]
// {
//   ... commented code ...
// },
```

---

## Architecture Notes

### Cal.com's Role in HappSea AI
```
Customer (WhatsApp) 
    ↓
Claude AI (understands intent)
    ↓
Cal.com API (checks availability, creates booking)
    ↓
Database (stores booking)
    ↓
Owner sees booking in Cal.com UI
```

### What Cal.com Provides
1. **Availability Management**: Prevents double-bookings
2. **Booking Storage**: Reliable database of reservations
3. **Calendar UI**: Visual interface for owner
4. **API Access**: Claude AI can query and create bookings

### What Cal.com Does NOT Need to Provide (for MVP)
1. ❌ Customer-facing booking page (Claude handles this)
2. ❌ Email notifications (Claude handles this)
3. ❌ Payment processing (Wompi handles this)
4. ❌ Integrations (Claude accesses directly)

---

## Testing Checklist

After hiding features, verify:
- ✅ Cal.com loads without errors
- ✅ Sidebar shows only intended features
- ✅ Event Types can be created and edited
- ✅ Bookings can be viewed and managed
- ✅ Availability can be configured
- ✅ Teams functionality works (even if not used)
- ✅ No broken links or navigation issues
- ✅ API endpoints still work for Claude AI

---

## Future Considerations

### If Customer Wants Calendar Sync
→ Re-enable **Apps** module → Install Google Calendar integration

### If Customer Wants Automated Reminders
→ Re-enable **Workflows** module → Configure reminder workflows

### If Customer Wants Self-Service Booking
→ Re-enable **Routing Forms** → Create qualification forms

### If Customer Wants Business Analytics
→ Re-enable **Insights** module → Access dashboards

### If Customer Wants Video Consultations
→ Re-enable **Apps** module → Install Zoom/Teams integration

---

## Performance Notes

### Bundle Size Impact
- Hidden features: ~15% of Cal.com codebase
- Actual performance gain: ~5-10% (code still loads)
- Main benefit: **UX simplicity**, not speed

### If Performance Becomes Critical
Consider true code-splitting:
```typescript
// Lazy load features only when needed
const Apps = lazy(() => import('./Apps'));
const Workflows = lazy(() => import('./Workflows'));
```

---

## Maintenance Notes

1. **Upstream Updates**: When merging from upstream Cal.com, check if new features were added to the navigation and decide if they should be hidden.

2. **Feature Requests**: Before building custom features, check if a hidden Cal.com feature already provides the functionality.

3. **API Compatibility**: Hidden UI features don't affect API endpoints - Claude AI can still access all functionality.

4. **Documentation**: Keep this document updated if you hide/unhide features.

---

## Comparison: Hidden vs Visible Features

| Feature | Status | Reason |
|---------|--------|--------|
| Event Types | ✅ Visible | **CRITICAL** - Defines boats |
| Bookings | ✅ Visible | **CRITICAL** - View reservations |
| Availability | ✅ Visible | **CRITICAL** - Prevent conflicts |
| Teams | ✅ Visible | Future scalability |
| Settings | ✅ Visible | Basic configuration |
| Apps | ❌ Hidden | Claude AI handles integrations |
| Routing | ❌ Hidden | Claude AI handles routing |
| Workflows | ❌ Hidden | Claude AI handles notifications |
| Insights | ❌ Hidden | Not needed for MVP |

---

## Contact

For questions about hidden features or to request re-enabling:
1. Review this document first
2. Check if the feature solves the requirement
3. Uncomment the relevant section in `Navigation.tsx`
4. Test thoroughly in development
5. Deploy to production

---

## Related Documentation

- **Chatwoot Hidden Features**: `/rwt-chatwoot/HAPPSEA_HIDDEN_FEATURES.md`
- **HappSea MVP Proposal**: `/rwt-happsea/docs/HappySea_AI_MVP_Propuesta.md`
- **Technical Design**: `/rwt-happsea/docs/TECHNICAL_DESIGN.md`

---

**Last Updated**: February 4, 2026  
**Modified By**: Cascade AI  
**Cal.com Version**: Fork based on upstream main branch
