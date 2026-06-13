# Insurance Reminder App - Deployment & Data Management Guide

## 1. DATA PERSISTENCE

### Current Implementation: Browser Local Storage
- **Location**: Data is stored in your browser's `localStorage`
- **Storage Keys**:
  - `insurance_policies` - All policies data
  - `insurance_clients` - All clients data
- **Persistence**: Data persists across browser sessions (survives page refresh, browser close, etc.)
- **Storage Limit**: ~5-10MB per domain (sufficient for thousands of policies)

### Data File Location
- File: `/vercel/share/v0-project/lib/storage.ts`
- This handles all localStorage read/write operations

## 2. RESET TO DAY 0 (Fresh Start for End Users)

### Option A: Clear All Data
1. Click **Settings** (gear icon in top-right)
2. Click **"Manage Data"** button
3. Click **"Clear All Data"** (red button)
4. Confirm - all clients and policies will be deleted

### Option B: Load Demo Data
1. Click **Settings** (gear icon in top-right)
2. Click **"Manage Data"** button
3. Click **"Load Demo Data"**
- This will populate 10 sample policies and 5 sample clients for demonstration

### Option C: Manual Reset (Browser DevTools)
```javascript
// Open browser Console (F12 → Console tab) and run:
localStorage.removeItem('insurance_policies');
localStorage.removeItem('insurance_clients');
location.reload();
```

## 3. AUTOMATIC DATA MANAGEMENT

The app now:
- ✅ Starts empty on first load (Day 0 ready)
- ✅ Loads any previously saved data on subsequent visits
- ✅ Automatically saves all changes to localStorage
- ✅ Shows loading state while initializing data
- ✅ Includes data management options in Settings

## 4. PUBLIC URL & DEPLOYMENT

### Current Setup
- **Repository**: `https://github.com/skalamkar7/spark`
- **Branch**: `v0/skalamkar7-8004-75c53bc7`
- **Vercel Project ID**: `prj_N6y3V75NdSXlGh9EUSHLHjM8BpFZ`
- **Team ID**: `team_S5StEkPfE80crFhuvwTfMaeS`

### To Deploy & Get Public URL

#### Step 1: Deploy to Vercel
```bash
# Option A: Using Vercel CLI
vercel --scope team_S5StEkPfE80crFhuvwTfMaeS

# Option B: Via UI
# Click "Publish" button in v0 Preview (top-right)
# or visit https://vercel.com/dashboard
```

#### Step 2: Find Your Public URL
After deployment, your app will be at:
- **Production**: `https://spark-<random>.vercel.app`
- **Preview (Current Branch)**: Check Vercel deployment status

#### Step 3: Share with Others
Once deployed, anyone can access your app from any device using:
```
https://your-domain.vercel.app
```

## 5. USING FROM OTHER DEVICES

### Requirements
- ✅ Internet connection
- ✅ Any modern browser (Chrome, Firefox, Safari, Edge)
- ✅ No installation needed

### Access from Another Device
1. **On New Device**: Open browser and go to: `https://spark-<your-domain>.vercel.app`
2. **First Time**: App starts empty (Day 0)
3. **Add Clients & Policies**: Use the "+ Add New" dropdown
4. **Data is Saved**: Automatically saved to that browser's localStorage

### Important Notes
- ⚠️ Each device/browser maintains its own separate data
- ⚠️ Agent A's data on Device 1 ≠ Agent B's data on Device 2
- 💡 To share data between devices: Use "Export" feature (coming soon) or sync via cloud

## 6. SWITCHING BETWEEN DEMO & LIVE DATA

### As an Agent

**To Test/Demo:**
1. Go to Settings → Manage Data
2. Click "Load Demo Data"
3. Explore all features with sample data
4. See how reminders work across different timeframes

**To Go Live:**
1. Settings → Manage Data
2. Click "Clear All Data"
3. Start adding your real clients and policies
4. Your data is automatically saved

## 7. TECHNICAL DETAILS

### Storage Implementation
```typescript
// useLocalStorage hook in lib/storage.ts handles:
- Getting policies/clients from localStorage
- Saving policies/clients to localStorage
- Clearing all data
- Error handling for storage quota issues
```

### Page State Management
```typescript
// In app/page.tsx:
- useEffect: Loads data from localStorage on mount
- useEffect: Saves policies whenever they change
- useEffect: Saves clients whenever they change
- useState: Manages local state for UI
```

### Auto-Save Features
- ✅ Adding a client → Auto-saved
- ✅ Adding a policy → Auto-saved
- ✅ Marking reminder sent → Auto-saved
- ✅ Marking payment received → Auto-saved
- ✅ Agent settings → Auto-saved on click "Save Settings"

## 8. NEXT STEPS FOR PRODUCTION

### Future Enhancements
- [ ] Cloud database (Firebase, Supabase, or Neon)
- [ ] Multi-user authentication
- [ ] Data sync across devices
- [ ] Backup & export functionality
- [ ] Automated reminder scheduling
- [ ] WhatsApp integration via API
- [ ] Email integration via SMTP

### For Now (Current Setup is Perfect For)
- ✅ Single agent managing multiple clients
- ✅ Local testing and demos
- ✅ Personal use within organization
- ✅ Prototype and MVP validation

---

## Quick Reference

| Feature | Status | Details |
|---------|--------|---------|
| Add Clients | ✅ Ready | "+ Add New" → Add Client |
| Add Policies | ✅ Ready | "+ Add New" → Add Policy |
| Send Reminders | ✅ Ready | Copy WhatsApp/Email messages |
| Mark Sent | ✅ Ready | Click "Mark as Sent" on reminder |
| Mark Payment | ✅ Ready | Click "Mark Payment Received" |
| Data Persistence | ✅ Ready | localStorage (automatic) |
| Public Access | ✅ Ready | Deploy to Vercel via "Publish" |
| Reset to Day 0 | ✅ Ready | Settings → Manage Data |
| Demo Data | ✅ Ready | Settings → Manage Data → Load Demo |

