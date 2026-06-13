# InsureAgent - Insurance Policy Management System

A modern, user-friendly insurance policy management application for insurance agents to efficiently manage clients, policies, and reminders with integrated QR code support for quick payments.

## Key Features

### 🎯 Interactive Dashboard
- Real-time statistics with clickable tiles
- Quick action buttons (Add Client, Add Policy, Manage Providers)
- Reminders hub showing upcoming payments and renewals
- Smart filtering for urgent reminders

### 👥 Client Management
- Search clients by name, phone, or email
- View complete client profiles
- See all associated policies
- Edit and delete functionality
- Real-time search results

### 📋 Policy Management
- Search and filter policies by name, number, or client
- Filter by insurance type (Health, Auto, Home, Life, Travel, Business)
- View detailed policy information
- Policy status indicators (Active, Expiring, Expired)
- Insurance type icons for quick identification

### 🏢 Insurance Provider Management
- Maintain database of 10+ insurance providers
- Add new providers easily
- Upload company and agent QR codes
- Integration with policy creation
- Quick provider lookup

### 📱 Smart Reminders
- Professional payment reminders with QR codes
- Renewal notifications
- WhatsApp-ready message formatting
- Email templates with policy details
- Customizable agent information

## Getting Started

### Login
- **Email**: agent@insurance.com
- **Password**: Agent@2024

### Main Pages
1. **Dashboard** (`/dashboard`) - Overview and navigation hub
2. **All Clients** (`/clients-manage`) - Search and manage all clients
3. **All Policies** (`/policies-manage`) - Search, filter, and manage policies
4. **Insurance Providers** (`/providers`) - Manage insurance companies
5. **Reminders Hub** - View and send reminders (on dashboard)

## User Guide

### Finding a Client
1. Click "Total Clients" on the dashboard (shows 5)
2. Use the search box to find by name, phone, or email
3. Click the client to view their profile and policies
4. View all their insurance policies in one place
5. Delete or edit as needed

### Checking Policies
1. Click "Active Policies" on the dashboard (shows 9)
2. Use the search box to find policies
3. Use the type dropdown to filter by insurance category
4. Click a policy to see complete details
5. View linked client and provider information

### Managing Providers
1. Click the "Providers" button in the dashboard
2. View all 10 pre-configured providers
3. Click "Add Provider" to add a new insurance company
4. Upload provider details and QR codes
5. Providers are immediately available in Add Policy form

### Sending Reminders
1. See upcoming reminders in Reminders Hub (dashboard)
2. Click on a reminder to see the full message
3. Messages include:
   - Client details
   - Policy information
   - Provider details
   - QR code reference for instant payment
4. Copy the message and send via WhatsApp or email

### Adding a New Policy
1. Click "Add Policy" button
2. Select client from dropdown
3. Fill in policy details
4. **Select provider from dropdown** (no more free text!)
5. Set reminder intervals
6. Choose notification channels (Email, SMS, WhatsApp)
7. Save policy

## Features Overview

### Search Capabilities
| Page | Search By |
|------|-----------|
| Clients | Name, Phone, Email |
| Policies | Name, Client, Number |

### Filters Available
| Page | Filter Options |
|------|-----------------|
| Policies | Insurance Type (6 types) |
| Reminders | Time period (1 day to 2 months) |

### Insurance Types Supported
- 💚 Health Insurance
- 🚗 Auto Insurance
- 🏠 Home Insurance
- 🛡️ Life Insurance
- ✈️ Travel Insurance
- 🏢 Business Insurance

## Data Persistence

All data is saved to your browser's localStorage:
- Clients
- Policies
- Insurance Providers
- User Session

**Note**: Data persists across browser sessions but is local to your browser.

## Data Included

The system comes pre-loaded with:
- **5 Sample Clients** - Real Indian names and contact info
- **10 Sample Policies** - Across all insurance types
- **10 Insurance Providers**:
  - HDFC Ergo
  - ICICI Lombard
  - Bajaj Allianz
  - LIC
  - Tata AIG
  - Star Health
  - New India Assurance
  - Royal Sundaram
  - Max Bupa
  - SBI General

## Tips & Tricks

### Quick Payment Links
When sending reminders, QR codes are included for:
- Direct payment processing
- Policy renewals
- Premium installments
- Instant payment verification

### Status Indicators
- 🟢 **Active** - Policy is current
- 🟡 **Expiring Soon** - Within 30 days
- 🔴 **Expired** - Past expiry date

### Search Tips
- **Start typing** to see instant results
- **Case doesn't matter** - searches are flexible
- **Partial matches work** - search "raj" to find "Rajesh"
- **Clear search** to see all records

### Bulk Actions (Prepared)
- Edit multiple clients
- Export policy lists
- Generate bulk reminders
- Commission calculations

## Production Ready Features

✓ User Authentication
✓ Session Management
✓ Data Validation
✓ Confirmation Dialogs
✓ Error Handling
✓ Responsive Design
✓ Secure Operations
✓ Real-time Search
✓ Smart Filtering
✓ Professional Messages

## Future Enhancements

The following are prepared for implementation:
- Email API integration for automated reminders
- WhatsApp Business API for instant messaging
- QR code generation and scanning
- Advanced analytics and reporting
- Payment gateway integration
- Policy automation workflows
- Commission tracking
- Multi-agent support

## Technical Stack

- **Frontend Framework**: Next.js 16
- **UI Library**: React with shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Icons**: Lucide React
- **Data Storage**: Browser localStorage
- **Type Safety**: TypeScript

## Browser Support

- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## Troubleshooting

### Data Not Persisting
- Check if localStorage is enabled in browser settings
- Clear browser cache and try again

### Search Not Working
- Ensure you've typed complete information
- Try searching with partial matches

### Reminders Not Showing
- Verify reminders are enabled in policy settings
- Check reminder intervals are configured

### QR Code Issues
- Ensure QR codes are uploaded as image files
- Check file size is under 5MB

## Support & Documentation

For detailed features, see:
- `FEATURES_SUMMARY.md` - Complete feature list
- `ENHANCEMENTS.md` - Recent improvements

## Version History

### v2.0 - Production Ready (Current)
- Advanced search and filtering
- Insurance provider management
- QR code integration (prepared)
- Enhanced reminder messages
- Professional UI/UX

### v1.0 - Initial Release
- Basic client and policy management
- Reminders hub
- Dashboard overview

---

**Start managing insurance policies like a pro!** 🚀

For questions or issues, please refer to the features documentation or contact support.
