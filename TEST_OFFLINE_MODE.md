# Testing Offline Mode - Quick Guide

## 🧪 How to Test Offline Mode

### Method 1: Browser DevTools (Recommended)

1. **Open the application**
   ```
   http://localhost:5173
   ```

2. **Open Chrome DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
   - Press `Cmd+Option+I` (Mac)

3. **Go to Network Tab**
   - Click on "Network" tab in DevTools

4. **Enable Offline Mode**
   - Check the "Offline" checkbox at the top
   - OR use the throttling dropdown and select "Offline"

5. **Observe Changes**
   - Red banner appears: "Offline Mode Active"
   - Chatbot shows "Offline" badge
   - Suggested questions change

6. **Test Chatbot**
   - Click chatbot button (💬)
   - Try these questions:
     - "water shortage help"
     - "emergency contacts"
     - "lpg gas shortage"
     - "how to prepare"

7. **Go Back Online**
   - Uncheck "Offline" in DevTools
   - Banner disappears
   - Chatbot returns to AI mode

---

### Method 2: Actual Network Disconnect

1. **Disconnect Network**
   - Turn off WiFi
   - Unplug Ethernet cable
   - Disable mobile data

2. **Refresh Page**
   - Press `F5` or `Ctrl+R`
   - Should see offline.html if not cached
   - Or see offline banner if cached

3. **Test Functionality**
   - Navigate the app
   - Use chatbot
   - Check emergency contacts

4. **Reconnect**
   - Turn WiFi back on
   - App automatically detects connection
   - Banner disappears

---

## ✅ Expected Behavior Checklist

### When Going Offline:
- [ ] Red banner slides down from top
- [ ] Banner text: "Offline Mode Active"
- [ ] Chatbot header shows "Offline" badge
- [ ] Chatbot subtitle: "Emergency Guides Available"
- [ ] Chatbot icon changes to 📡
- [ ] Suggested questions change to offline topics
- [ ] Console logs: "[Network] Connection lost - Offline"

### Chatbot in Offline Mode:
- [ ] Responds to "water shortage" with water guide
- [ ] Responds to "lpg" with LPG guide
- [ ] Responds to "emergency" with emergency contacts
- [ ] Adds disclaimer: "⚠️ Offline mode: Responses are pre-programmed"
- [ ] Response appears after ~500ms delay
- [ ] No network requests made

### When Going Online:
- [ ] Banner slides up and disappears
- [ ] "Offline" badge removed from chatbot
- [ ] Chatbot returns to AI mode
- [ ] Suggested questions return to normal
- [ ] Console logs: "[Network] Connection restored - Online"

---

## 🎯 Test Scenarios

### Scenario 1: Water Shortage Query (Offline)
```
User: "water shortage help"

Expected Response:
"For water shortages: Store 3L per person daily, boil uncertain 
water for 1 min, collect rainwater, reduce usage. Emergency: Call 1916.

⚠️ Offline mode: Responses are pre-programmed. Reconnect for 
AI-powered answers."
```

### Scenario 2: Emergency Help (Offline)
```
User: "emergency help"

Expected Response:
"Emergency contacts: 112 (All), 100 (Police), 101 (Fire), 
102 (Ambulance), 108 (Disaster). Stay calm and provide clear 
information when calling.

⚠️ Offline mode: Responses are pre-programmed. Reconnect for 
AI-powered answers."
```

### Scenario 3: LPG Shortage (Offline)
```
User: "lpg gas shortage"

Expected Response:
"For LPG shortage: Stock alternative fuels, use pressure cooker, 
keep cylinder 50% full, register with multiple distributors. 
Emergency: Call 1906.

⚠️ Offline mode: Responses are pre-programmed. Reconnect for 
AI-powered answers."
```

### Scenario 4: Unknown Query (Offline)
```
User: "tell me a joke"

Expected Response:
"I'm in offline mode with limited responses. For emergencies, 
call 112. I can help with: water, LPG, fuel, electricity, food 
shortages, safety, and emergency contacts.

⚠️ Offline mode: Responses are pre-programmed. Reconnect for 
AI-powered answers."
```

---

## 🔍 Debugging

### Check Service Worker Status:
1. Open DevTools → Application tab
2. Click "Service Workers" in left sidebar
3. Should see: `/service-worker.js` with status "activated"

### Check Console Logs:
```
[ServiceWorker] Registered successfully: http://localhost:5173/
[Network] Connection lost - Offline
[Frontend] Offline mode - using local responses
[Network] Connection restored - Online
```

### Check Network Tab:
- When offline: All requests should show "(failed) net::ERR_INTERNET_DISCONNECTED"
- Chatbot should NOT make any API calls when offline

---

## 📸 Visual Verification

### Offline Banner:
- Position: Fixed at top of screen
- Color: Red gradient (#ff6b6b to #ee5a6f)
- Icon: 📡 (pulsing animation)
- Text: "Offline Mode Active"
- Subtitle: "Limited functionality • Emergency guides available • Reconnect for live data"

### Chatbot Offline Badge:
- Position: Next to "Ask CivicShield" title
- Color: Red background with red border
- Text: "OFFLINE"
- Font: Small, uppercase, bold

---

## 🎬 Demo Script

**For Judges/Presentations:**

1. **Show Normal Operation**
   - "Here's CivicShield running normally with live AI responses"
   - Ask chatbot: "Is my state safe?"
   - Show AI-powered response

2. **Simulate Network Outage**
   - "Now let's simulate a network outage, which is common during disasters"
   - Enable offline mode in DevTools
   - Point out the red banner

3. **Demonstrate Offline Functionality**
   - "Even offline, the app remains functional"
   - Open chatbot, show "Offline" badge
   - Ask: "water shortage help"
   - Show rule-based response with emergency contacts

4. **Highlight Emergency Contacts**
   - "Critical emergency numbers are always accessible"
   - Show 112, 100, 101, 102, 108 in responses

5. **Restore Connection**
   - "When connection is restored, the app automatically switches back"
   - Disable offline mode
   - Show banner disappearing
   - Show AI responses working again

6. **Emphasize Value**
   - "This ensures CivicShield is useful even during network failures"
   - "Emergency information is always available when needed most"

---

## 🐛 Common Issues

### Issue: Banner doesn't appear
**Solution:** Check browser console for errors, verify `useOnlineStatus` hook is imported

### Issue: Chatbot still tries to call API
**Solution:** Check `isOnline` condition in `handleSendMessage`, verify offline detection

### Issue: Service Worker not registering
**Solution:** Check browser console, ensure service-worker.js is in public folder, try hard refresh (Ctrl+Shift+R)

### Issue: Offline responses not working
**Solution:** Verify `offlineData.js` is imported, check keyword matching logic

---

## ✨ Success Criteria

Offline mode is working correctly if:
- ✅ Banner appears/disappears based on network status
- ✅ Chatbot shows offline badge when disconnected
- ✅ Chatbot provides rule-based responses offline
- ✅ No API calls made when offline
- ✅ Emergency contacts accessible
- ✅ Smooth transition between online/offline modes
- ✅ Service worker caches assets
- ✅ App remains functional without internet

---

**Ready to Test!** 🚀

Open http://localhost:5173 and follow the steps above.
