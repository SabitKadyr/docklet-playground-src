# Changelog

Changes after v0.2. App versions come from `versions.json`. Downloads are on the [releases page](https://github.com/SabitKadyr/docklet-playground-src/releases).

## Docklet Liquid

A separate app (`com.docklet.liquid.design`) for the Liquid search flow: the centre Pill flows into a search card, and tapping the field opens text input with a keyboard. Three keyboard layouts can be switched in Tweak Docklet → Centre button → Keyboard layout. Source: `Docklet Liquid.dc.html` with `docklet-liquid.js`, built by `build_liquid.py`.

### v0.2.15
Compared to v0.2.7, so this includes v0.2.8 to v0.2.14. Measured on a Galaxy A26:

Speed
- **The app launcher opens even more smoothly:** 120–128 frames in 1.4 s instead of 89–97, longest frame 25–33 ms; closing runs at 152–153. The cause was not the icon blur. The hidden dock glass of Playground v0.5 sat under the launcher at opacity 0, and its 18 px blur was still computed every frame. It is now hidden properly.
- **Auto-hide fades the dock by opacity only.** A blur on every element made the first frame of each auto-hide take 75–117 ms; now 33–75 ms.

Gestures
- **Launcher and hide no longer get mixed up.** On the dock, a swipe up steeper than 30° opens the launcher (on the Pill: text input). A near-horizontal swipe to the right, from 30° up to 45° down, hides the dock. Left and down do nothing.
- **Hide from anywhere on the dock.** From the last tabs there was too little room to the edge, so the dock didn't hide. The swipe needed now shrinks with the room left: about 34 px from the last tab, 150 px from the first.
- **Android's Back gesture is off where the dock is.** Android lets an app take 200 dp of each screen edge from its Back gesture (any 200 dp, not only the bottom). While the dock is shown, that is the bottom 200 dp across the full width. While it is hidden, the 200 dp go to the edge glow instead (new in v0.2.11).
- **Letting go midway settles in one motion.** When you pulled a hidden dock about halfway out and let go, the dock jumped back to the edge and slid in over the whole way (554 ms). Now there is one animation, and it is faster: 90% of the way in 205–215 ms instead of 239–244.
- **A quick flick off the edge glow brings the dock back**, even a short one (about 50–70 px).
- **The edge glow shows only the part you can grab: the top 200 dp of the hidden dock** (new in v0.2.11). Back is off there, so you pull the dock straight from the glow, with no Back arrow. Before, the glow ran the whole length of the hidden dock, and above the bottom 200 dp it could not be pulled. The grab zone is about 47 px from the edge (it was a 24 px strip), and the glow brightens only when a touch lands there; before, any touch on the screen brightened it.
- **Below the glow, a Back swipe also pulls the dock out** (Predictive Back, new in v0.2.10). From the glow down to where the dock was, the app takes the Back swipe: the dock follows the finger, and when Android commits the gesture the dock comes back; if it cancels, the dock tucks away again. Samsung draws its own Back arrow at the finger there.
- **A swipe from the very edge of the screen reaches the glow** (new in v0.2.11). The prototype's screen is scaled to the height and is about 0.7 px narrower than the window. A swipe often starts in that sliver, where Chrome cancelled the touch.
- **Quick swipes there and back no longer trigger Android's Back** (new in v0.2.13). While the dock was still flying to the edge, the app treated it as shown, so a fast swipe back from the edge went to the system. Now the glow, its grab zone and the Back pull switch over as soon as the dock leaves, and a swipe back catches the dock where it is.
- **A Back swipe from the other edge leaves the hidden dock hidden** (new in v0.2.10). It is a plain Back. The Back key still brings the dock back when nothing else is open.
- **A rainbow shimmer runs along the edge glow while you hold it.** Blue, violet, pink, orange, yellow, green and cyan flow along the glow, one cycle every 1.4 s, with a white core left at the screen edge. In v0.2.10 the colours are richer: the white under them is fainter and the colour reaches 24 px in from the edge. The app stays at 120 frames per second while you hold the glow.

Menus and taps
- **The right slot is a hotseat, and a menu opens from the highlighted icon** (new in v0.2.15, the default). A tap on the highlighted icon, the current product, opens its context menu. The right slot holds the open app, or the last one you opened unless it is pinned; a tap takes you back to it. With no app there (on first start, or after you pin the app from it) it is an Apps button that opens the launcher; nothing is filled in on its own. With the launcher open, the hotseat app stays in the slot and is left out of the grid. The other modes are in Tweak Docklet → Tabs → Right slot: Always menu (••• is always the current product's context menu and never opens the launcher; Chats and Pocket have placeholder menus) and Keep last app (no menu for Chats and Pocket; an app you leave for them stays in the slot).
- **Choose an app to pin** (the empty Pin slot's menu) now pins the app you tap and opens it (new in v0.2.15). Before, it just opened the launcher and the app landed in the right slot.
- **The Hide left / Hide right menu is gone** (new in v0.2.11). It opened on a long press on the dock. Hiding is a swipe only.
- **The highlight stays on the current product** (new in v0.2.10). With the launcher open it moved to •••; now it stays on Chats, Pocket or the open pinned app. ••• is never highlighted. With the launcher open, an open app that is not pinned stays highlighted in the hotseat (in the other Right slot modes, in the launcher).
- **A pinned app has the full menu**: Unpin from the dock, favourites, Refresh, but no Close. Before, it had only Unpin.
- **Context menus open above the Pill** and above the highlighted app in the launcher.
- **A tap on ••• right after a fast swipe opened the launcher did nothing.** Chrome sometimes delivers such a tap without a click. A short, still tap on a dock tab or a launcher app now acts even then.

Launcher, search and Tweak
- **Favourites are part of the grid** (new in v0.2.15): no separate box any more, they come first, top left, with their heart.
- **More air in the launcher** (new in v0.2.15): the grid keeps 12 px below the handle at the top and 12 px above the Pill (was 4).
- **The search card has the same handle** on both steps, camera and text input (new in v0.2.15).
- **Tweak is redrawn** (new in v0.2.14). The category rail stays at the top with a line on what the category is for, and only the settings below scroll. Calmer rows on one grid, thinner sliders that fill up to the thumb with a mark at the default, iOS-style segments, and explanations under the cards. The header reads Tweak and Done. Motion groups its curves into House & Material, iOS spring and Other systems; in Dock, Version is now Keyboard layout. Same categories in the same order.

From the new Claude Design version
- **Auto-hide:** the dock hides 2 s after you tap outside it and after 10 s of no touches (Tweak Docklet → Hide gesture → Behaviour: a switch and both times). New in v0.2.14: the 2 s count from the first tap outside the Docklet; more taps no longer push it back. The first time the dock hides on its own, a tip says so: "Docklet tucked itself away" (once).
- **Hiding the dock with the launcher open** folds the launcher away with it.
- The Boom gate hide gesture is now called **Drawbridge**.
- App data moved to `docklet-data.js`.

### v0.2.14
Compared to v0.2.7, so this includes v0.2.8 to v0.2.13. Measured on a Galaxy A26:

Speed
- **The app launcher opens even more smoothly:** 120–128 frames in 1.4 s instead of 89–97, longest frame 25–33 ms; closing runs at 152–153. The cause was not the icon blur. The hidden dock glass of Playground v0.5 sat under the launcher at opacity 0, and its 18 px blur was still computed every frame. It is now hidden properly.
- **Auto-hide fades the dock by opacity only.** A blur on every element made the first frame of each auto-hide take 75–117 ms; now 33–75 ms.

Gestures
- **Launcher and hide no longer get mixed up.** On the dock, a swipe up steeper than 30° opens the launcher (on the Pill: text input). A near-horizontal swipe to the right, from 30° up to 45° down, hides the dock. Left and down do nothing.
- **Hide from anywhere on the dock.** From the last tabs there was too little room to the edge, so the dock didn't hide. The swipe needed now shrinks with the room left: about 34 px from the last tab, 150 px from the first.
- **Android's Back gesture is off where the dock is.** Android lets an app take 200 dp of each screen edge from its Back gesture (any 200 dp, not only the bottom). While the dock is shown, that is the bottom 200 dp across the full width. While it is hidden, the 200 dp go to the edge glow instead (new in v0.2.11).
- **Letting go midway settles in one motion.** When you pulled a hidden dock about halfway out and let go, the dock jumped back to the edge and slid in over the whole way (554 ms). Now there is one animation, and it is faster: 90% of the way in 205–215 ms instead of 239–244.
- **A quick flick off the edge glow brings the dock back**, even a short one (about 50–70 px).
- **The edge glow shows only the part you can grab: the top 200 dp of the hidden dock** (new in v0.2.11). Back is off there, so you pull the dock straight from the glow, with no Back arrow. Before, the glow ran the whole length of the hidden dock, and above the bottom 200 dp it could not be pulled. The grab zone is about 47 px from the edge (it was a 24 px strip), and the glow brightens only when a touch lands there; before, any touch on the screen brightened it.
- **Below the glow, a Back swipe also pulls the dock out** (Predictive Back, new in v0.2.10). From the glow down to where the dock was, the app takes the Back swipe: the dock follows the finger, and when Android commits the gesture the dock comes back; if it cancels, the dock tucks away again. Samsung draws its own Back arrow at the finger there.
- **A swipe from the very edge of the screen reaches the glow** (new in v0.2.11). The prototype's screen is scaled to the height and is about 0.7 px narrower than the window. A swipe often starts in that sliver, where Chrome cancelled the touch.
- **Quick swipes there and back no longer trigger Android's Back** (new in v0.2.13). While the dock was still flying to the edge, the app treated it as shown, so a fast swipe back from the edge went to the system. Now the glow, its grab zone and the Back pull switch over as soon as the dock leaves, and a swipe back catches the dock where it is.
- **A Back swipe from the other edge leaves the hidden dock hidden** (new in v0.2.10). It is a plain Back. The Back key still brings the dock back when nothing else is open.
- **A rainbow shimmer runs along the edge glow while you hold it.** Blue, violet, pink, orange, yellow, green and cyan flow along the glow, one cycle every 1.4 s, with a white core left at the screen edge. In v0.2.10 the colours are richer: the white under them is fainter and the colour reaches 24 px in from the edge. The app stays at 120 frames per second while you hold the glow.

Menus and taps
- **Tweak is redrawn** (new in v0.2.14). The category rail stays at the top with a line on what the category is for, and only the settings below scroll. Calmer rows on one grid, thinner sliders that fill up to the thumb with a mark at the default, iOS-style segments, and explanations under the cards. The header reads Tweak and Done. Motion groups its curves into House & Material, iOS spring and Other systems; in Dock, Version is now Keyboard layout. Same categories in the same order.
- **••• is always the context menu of the current product** (new in v0.2.11). It never opens the launcher, by tap or long press; the launcher opens only with a swipe up. The right slot shows the current product's icon when it is nowhere else in the Docklet (an open app that is not pinned, launcher closed), otherwise •••. Chats and Pocket have placeholder menus for now (Chat settings, Pocket settings). The slot no longer keeps the last app you left.
- **Two ways for the right slot to compare** (new in v0.2.12), in Tweak Docklet → Tabs → Right slot. Always menu (the default) is the behaviour above. Keep last app: Chats and Pocket have no menu, and an app you leave for Chats or Pocket stays in the slot, not highlighted; a tap takes you back to it. Inside an app both work the same. In Keep last app, before any app was opened or with the launcher open, ••• in Chats or Pocket does nothing for now.
- **The Hide left / Hide right menu is gone** (new in v0.2.11). It opened on a long press on the dock. Hiding is a swipe only.
- **The highlight stays on the current product** (new in v0.2.10). With the launcher open it moved to •••; now it stays on Chats, Pocket or the open pinned app. ••• is never highlighted. An open app that is not pinned is highlighted in the launcher instead.
- **A pinned app has the full menu**: Unpin from the dock, favourites, Refresh, but no Close. Before, it had only Unpin.
- **Context menus open above the Pill** and above the highlighted app in the launcher.
- **A tap on ••• right after a fast swipe opened the launcher did nothing.** Chrome sometimes delivers such a tap without a click. A short, still tap on a dock tab or a launcher app now acts even then.

From the new Claude Design version
- **Auto-hide:** the dock hides 2 s after you tap outside it and after 10 s of no touches (Tweak Docklet → Hide gesture → Behaviour: a switch and both times). New in v0.2.14: the 2 s count from the first tap outside the Docklet; more taps no longer push it back. The first time the dock hides on its own, a tip says so: "Docklet tucked itself away" (once).
- **Hiding the dock with the launcher open** folds the launcher away with it.
- The Boom gate hide gesture is now called **Drawbridge**.
- App data moved to `docklet-data.js`.

### v0.2.13
Compared to v0.2.7, so this includes v0.2.8 to v0.2.12. Measured on a Galaxy A26:

Speed
- **The app launcher opens even more smoothly:** 120–128 frames in 1.4 s instead of 89–97, longest frame 25–33 ms; closing runs at 152–153. The cause was not the icon blur. The hidden dock glass of Playground v0.5 sat under the launcher at opacity 0, and its 18 px blur was still computed every frame. It is now hidden properly.
- **Auto-hide fades the dock by opacity only.** A blur on every element made the first frame of each auto-hide take 75–117 ms; now 33–75 ms.

Gestures
- **Launcher and hide no longer get mixed up.** On the dock, a swipe up steeper than 30° opens the launcher (on the Pill: text input). A near-horizontal swipe to the right, from 30° up to 45° down, hides the dock. Left and down do nothing.
- **Hide from anywhere on the dock.** From the last tabs there was too little room to the edge, so the dock didn't hide. The swipe needed now shrinks with the room left: about 34 px from the last tab, 150 px from the first.
- **Android's Back gesture is off where the dock is.** Android lets an app take 200 dp of each screen edge from its Back gesture (any 200 dp, not only the bottom). While the dock is shown, that is the bottom 200 dp across the full width. While it is hidden, the 200 dp go to the edge glow instead (new in v0.2.11).
- **Letting go midway settles in one motion.** When you pulled a hidden dock about halfway out and let go, the dock jumped back to the edge and slid in over the whole way (554 ms). Now there is one animation, and it is faster: 90% of the way in 205–215 ms instead of 239–244.
- **A quick flick off the edge glow brings the dock back**, even a short one (about 50–70 px).
- **The edge glow shows only the part you can grab: the top 200 dp of the hidden dock** (new in v0.2.11). Back is off there, so you pull the dock straight from the glow, with no Back arrow. Before, the glow ran the whole length of the hidden dock, and above the bottom 200 dp it could not be pulled. The grab zone is about 47 px from the edge (it was a 24 px strip), and the glow brightens only when a touch lands there; before, any touch on the screen brightened it.
- **Below the glow, a Back swipe also pulls the dock out** (Predictive Back, new in v0.2.10). From the glow down to where the dock was, the app takes the Back swipe: the dock follows the finger, and when Android commits the gesture the dock comes back; if it cancels, the dock tucks away again. Samsung draws its own Back arrow at the finger there.
- **A swipe from the very edge of the screen reaches the glow** (new in v0.2.11). The prototype's screen is scaled to the height and is about 0.7 px narrower than the window. A swipe often starts in that sliver, where Chrome cancelled the touch.
- **Quick swipes there and back no longer trigger Android's Back** (new in v0.2.13). While the dock was still flying to the edge, the app treated it as shown, so a fast swipe back from the edge went to the system. Now the glow, its grab zone and the Back pull switch over as soon as the dock leaves, and a swipe back catches the dock where it is.
- **A Back swipe from the other edge leaves the hidden dock hidden** (new in v0.2.10). It is a plain Back. The Back key still brings the dock back when nothing else is open.
- **A rainbow shimmer runs along the edge glow while you hold it.** Blue, violet, pink, orange, yellow, green and cyan flow along the glow, one cycle every 1.4 s, with a white core left at the screen edge. In v0.2.10 the colours are richer: the white under them is fainter and the colour reaches 24 px in from the edge. The app stays at 120 frames per second while you hold the glow.

Menus and taps
- **••• is always the context menu of the current product** (new in v0.2.11). It never opens the launcher, by tap or long press; the launcher opens only with a swipe up. The right slot shows the current product's icon when it is nowhere else in the Docklet (an open app that is not pinned, launcher closed), otherwise •••. Chats and Pocket have placeholder menus for now (Chat settings, Pocket settings). The slot no longer keeps the last app you left.
- **Two ways for the right slot to compare** (new in v0.2.12), in Tweak Docklet → Tabs → Right slot. Always menu (the default) is the behaviour above. Keep last app: Chats and Pocket have no menu, and an app you leave for Chats or Pocket stays in the slot, not highlighted; a tap takes you back to it. Inside an app both work the same. In Keep last app, before any app was opened or with the launcher open, ••• in Chats or Pocket does nothing for now.
- **The Hide left / Hide right menu is gone** (new in v0.2.11). It opened on a long press on the dock. Hiding is a swipe only.
- **The highlight stays on the current product** (new in v0.2.10). With the launcher open it moved to •••; now it stays on Chats, Pocket or the open pinned app. ••• is never highlighted. An open app that is not pinned is highlighted in the launcher instead.
- **A pinned app has the full menu**: Unpin from the dock, favourites, Refresh, but no Close. Before, it had only Unpin.
- **Context menus open above the Pill** and above the highlighted app in the launcher.
- **A tap on ••• right after a fast swipe opened the launcher did nothing.** Chrome sometimes delivers such a tap without a click. A short, still tap on a dock tab or a launcher app now acts even then.

From the new Claude Design version
- **Auto-hide:** the dock hides 2 s after you tap outside it and after 10 s of no touches (Tweak Docklet → Hide gesture → Behaviour: a switch and both times).
- **Hiding the dock with the launcher open** folds the launcher away with it.
- The Boom gate hide gesture is now called **Drawbridge**.
- App data moved to `docklet-data.js`.

### v0.2.12
Compared to v0.2.7, so this includes v0.2.8 to v0.2.11. Measured on a Galaxy A26:

Speed
- **The app launcher opens even more smoothly:** 120–128 frames in 1.4 s instead of 89–97, longest frame 25–33 ms; closing runs at 152–153. The cause was not the icon blur. The hidden dock glass of Playground v0.5 sat under the launcher at opacity 0, and its 18 px blur was still computed every frame. It is now hidden properly.
- **Auto-hide fades the dock by opacity only.** A blur on every element made the first frame of each auto-hide take 75–117 ms; now 33–75 ms.

Gestures
- **Launcher and hide no longer get mixed up.** On the dock, a swipe up steeper than 30° opens the launcher (on the Pill: text input). A near-horizontal swipe to the right, from 30° up to 45° down, hides the dock. Left and down do nothing.
- **Hide from anywhere on the dock.** From the last tabs there was too little room to the edge, so the dock didn't hide. The swipe needed now shrinks with the room left: about 34 px from the last tab, 150 px from the first.
- **Android's Back gesture is off where the dock is.** Android lets an app take 200 dp of each screen edge from its Back gesture (any 200 dp, not only the bottom). While the dock is shown, that is the bottom 200 dp across the full width. While it is hidden, the 200 dp go to the edge glow instead (new in v0.2.11).
- **Letting go midway settles in one motion.** When you pulled a hidden dock about halfway out and let go, the dock jumped back to the edge and slid in over the whole way (554 ms). Now there is one animation, and it is faster: 90% of the way in 205–215 ms instead of 239–244.
- **A quick flick off the edge glow brings the dock back**, even a short one (about 50–70 px).
- **The edge glow shows only the part you can grab: the top 200 dp of the hidden dock** (new in v0.2.11). Back is off there, so you pull the dock straight from the glow, with no Back arrow. Before, the glow ran the whole length of the hidden dock, and above the bottom 200 dp it could not be pulled. The grab zone is about 47 px from the edge (it was a 24 px strip), and the glow brightens only when a touch lands there; before, any touch on the screen brightened it.
- **Below the glow, a Back swipe also pulls the dock out** (Predictive Back, new in v0.2.10). From the glow down to where the dock was, the app takes the Back swipe: the dock follows the finger, and when Android commits the gesture the dock comes back; if it cancels, the dock tucks away again. Samsung draws its own Back arrow at the finger there.
- **A swipe from the very edge of the screen reaches the glow** (new in v0.2.11). The prototype's screen is scaled to the height and is about 0.7 px narrower than the window. A swipe often starts in that sliver, where Chrome cancelled the touch.
- **A Back swipe from the other edge leaves the hidden dock hidden** (new in v0.2.10). It is a plain Back. The Back key still brings the dock back when nothing else is open.
- **A rainbow shimmer runs along the edge glow while you hold it.** Blue, violet, pink, orange, yellow, green and cyan flow along the glow, one cycle every 1.4 s, with a white core left at the screen edge. In v0.2.10 the colours are richer: the white under them is fainter and the colour reaches 24 px in from the edge. The app stays at 120 frames per second while you hold the glow.

Menus and taps
- **••• is always the context menu of the current product** (new in v0.2.11). It never opens the launcher, by tap or long press; the launcher opens only with a swipe up. The right slot shows the current product's icon when it is nowhere else in the Docklet (an open app that is not pinned, launcher closed), otherwise •••. Chats and Pocket have placeholder menus for now (Chat settings, Pocket settings). The slot no longer keeps the last app you left.
- **Two ways for the right slot to compare** (new in v0.2.12), in Tweak Docklet → Tabs → Right slot. Always menu (the default) is the behaviour above. Keep last app: Chats and Pocket have no menu, and an app you leave for Chats or Pocket stays in the slot, not highlighted; a tap takes you back to it. Inside an app both work the same. In Keep last app, before any app was opened or with the launcher open, ••• in Chats or Pocket does nothing for now.
- **The Hide left / Hide right menu is gone** (new in v0.2.11). It opened on a long press on the dock. Hiding is a swipe only.
- **The highlight stays on the current product** (new in v0.2.10). With the launcher open it moved to •••; now it stays on Chats, Pocket or the open pinned app. ••• is never highlighted. An open app that is not pinned is highlighted in the launcher instead.
- **A pinned app has the full menu**: Unpin from the dock, favourites, Refresh, but no Close. Before, it had only Unpin.
- **Context menus open above the Pill** and above the highlighted app in the launcher.
- **A tap on ••• right after a fast swipe opened the launcher did nothing.** Chrome sometimes delivers such a tap without a click. A short, still tap on a dock tab or a launcher app now acts even then.

From the new Claude Design version
- **Auto-hide:** the dock hides 2 s after you tap outside it and after 10 s of no touches (Tweak Docklet → Hide gesture → Behaviour: a switch and both times).
- **Hiding the dock with the launcher open** folds the launcher away with it.
- The Boom gate hide gesture is now called **Drawbridge**.
- App data moved to `docklet-data.js`.

### v0.2.11
Compared to v0.2.7, so this includes v0.2.8, v0.2.9 and v0.2.10. Measured on a Galaxy A26:

Speed
- **The app launcher opens even more smoothly:** 120–128 frames in 1.4 s instead of 89–97, longest frame 25–33 ms; closing runs at 152–153. The cause was not the icon blur. The hidden dock glass of Playground v0.5 sat under the launcher at opacity 0, and its 18 px blur was still computed every frame. It is now hidden properly.
- **Auto-hide fades the dock by opacity only.** A blur on every element made the first frame of each auto-hide take 75–117 ms; now 33–75 ms.

Gestures
- **Launcher and hide no longer get mixed up.** On the dock, a swipe up steeper than 30° opens the launcher (on the Pill: text input). A near-horizontal swipe to the right, from 30° up to 45° down, hides the dock. Left and down do nothing.
- **Hide from anywhere on the dock.** From the last tabs there was too little room to the edge, so the dock didn't hide. The swipe needed now shrinks with the room left: about 34 px from the last tab, 150 px from the first.
- **Android's Back gesture is off where the dock is.** Android lets an app take 200 dp of each screen edge from its Back gesture (any 200 dp, not only the bottom). While the dock is shown, that is the bottom 200 dp across the full width. While it is hidden, the 200 dp go to the edge glow instead (new in v0.2.11).
- **Letting go midway settles in one motion.** When you pulled a hidden dock about halfway out and let go, the dock jumped back to the edge and slid in over the whole way (554 ms). Now there is one animation, and it is faster: 90% of the way in 205–215 ms instead of 239–244.
- **A quick flick off the edge glow brings the dock back**, even a short one (about 50–70 px).
- **The edge glow shows only the part you can grab: the top 200 dp of the hidden dock** (new in v0.2.11). Back is off there, so you pull the dock straight from the glow, with no Back arrow. Before, the glow ran the whole length of the hidden dock, and above the bottom 200 dp it could not be pulled. The grab zone is about 47 px from the edge (it was a 24 px strip), and the glow brightens only when a touch lands there; before, any touch on the screen brightened it.
- **Below the glow, a Back swipe also pulls the dock out** (Predictive Back, new in v0.2.10). From the glow down to where the dock was, the app takes the Back swipe: the dock follows the finger, and when Android commits the gesture the dock comes back; if it cancels, the dock tucks away again. Samsung draws its own Back arrow at the finger there.
- **A swipe from the very edge of the screen reaches the glow** (new in v0.2.11). The prototype's screen is scaled to the height and is about 0.7 px narrower than the window. A swipe often starts in that sliver, where Chrome cancelled the touch.
- **A Back swipe from the other edge leaves the hidden dock hidden** (new in v0.2.10). It is a plain Back. The Back key still brings the dock back when nothing else is open.
- **A rainbow shimmer runs along the edge glow while you hold it.** Blue, violet, pink, orange, yellow, green and cyan flow along the glow, one cycle every 1.4 s, with a white core left at the screen edge. In v0.2.10 the colours are richer: the white under them is fainter and the colour reaches 24 px in from the edge. The app stays at 120 frames per second while you hold the glow.

Menus and taps
- **••• is always the context menu of the current product** (new in v0.2.11). It never opens the launcher, by tap or long press; the launcher opens only with a swipe up. The right slot shows the current product's icon when it is nowhere else in the Docklet (an open app that is not pinned, launcher closed), otherwise •••. Chats and Pocket have placeholder menus for now (Chat settings, Pocket settings). The slot no longer keeps the last app you left.
- **The Hide left / Hide right menu is gone** (new in v0.2.11). It opened on a long press on the dock. Hiding is a swipe only.
- **The highlight stays on the current product** (new in v0.2.10). With the launcher open it moved to •••; now it stays on Chats, Pocket or the open pinned app. ••• is never highlighted. An open app that is not pinned is highlighted in the launcher instead.
- **A pinned app has the full menu**: Unpin from the dock, favourites, Refresh, but no Close. Before, it had only Unpin.
- **Context menus open above the Pill** and above the highlighted app in the launcher.
- **A tap on ••• right after a fast swipe opened the launcher did nothing.** Chrome sometimes delivers such a tap without a click. A short, still tap on a dock tab or a launcher app now acts even then.

From the new Claude Design version
- **Auto-hide:** the dock hides 2 s after you tap outside it and after 10 s of no touches (Tweak Docklet → Hide gesture → Behaviour: a switch and both times).
- **Hiding the dock with the launcher open** folds the launcher away with it.
- The Boom gate hide gesture is now called **Drawbridge**.
- App data moved to `docklet-data.js`.

### v0.2.10
Compared to v0.2.7, so this includes v0.2.8 and v0.2.9. Measured on a Galaxy A26:

Speed
- **The app launcher opens even more smoothly:** 120–128 frames in 1.4 s instead of 89–97, longest frame 25–33 ms; closing runs at 152–153. The cause was not the icon blur. The hidden dock glass of Playground v0.5 sat under the launcher at opacity 0, and its 18 px blur was still computed every frame. It is now hidden properly.
- **Auto-hide fades the dock by opacity only.** A blur on every element made the first frame of each auto-hide take 75–117 ms; now 33–75 ms.

Gestures
- **Launcher and hide no longer get mixed up.** On the dock, a swipe up steeper than 30° opens the launcher (on the Pill: text input). A near-horizontal swipe to the right, from 30° up to 45° down, hides the dock. Left and down do nothing.
- **Hide from anywhere on the dock.** From the last tabs there was too little room to the edge, so the dock didn't hide. The swipe needed now shrinks with the room left: about 34 px from the last tab, 150 px from the first.
- **Android's Back gesture is off in the bottom 200 dp** across the full width, the most Android allows. Above that, Back can't be turned off.
- **Letting go midway settles in one motion.** When you pulled a hidden dock about halfway out and let go, the dock jumped back to the edge and slid in over the whole way (554 ms). Now there is one animation, and it is faster: 90% of the way in 205–215 ms instead of 239–244.
- **A quick flick off the edge glow brings the dock back**, even a short one (about 50–70 px).
- **The edge glow is easier to grab:** the grab zone is now about 47 px from the edge along the whole glow, instead of the 24 px strip. The glow brightens only when a touch lands there; before, any touch on the screen brightened it.
- **Pull the hidden dock out from anywhere along the edge glow** (new in v0.2.10). Above the bottom 200 dp Android keeps edge swipes for its Back gesture, so the upper part of the glow could not be pulled. Now, while the dock is hidden, the app takes the Back swipe that starts at the glow (Predictive Back): the dock follows the finger, and when Android commits the gesture the dock comes back; if it cancels, the dock tucks away again. Samsung draws its own Back arrow at the finger meanwhile.
- **A Back swipe from the other edge leaves the hidden dock hidden** (new in v0.2.10). It is a plain Back. The Back key still brings the dock back when nothing else is open.
- **A rainbow shimmer runs along the edge glow while you hold it.** Blue, violet, pink, orange, yellow, green and cyan flow along the glow, one cycle every 1.4 s, with a white core left at the screen edge. In v0.2.10 the colours are richer: the white under them is fainter and the colour reaches 24 px in from the edge. The app stays at 120 frames per second while you hold the glow.

Menus and taps
- **The highlight stays on the current product** (new in v0.2.10). With the launcher open it moved to •••; now it stays on Chats, Pocket or the open pinned app. ••• is never highlighted, as the app menu or as More. An open app that is not pinned is highlighted in the launcher instead.
- **A pinned app has the full menu**: Unpin from the dock, favourites, Refresh, but no Close. Before, it had only Unpin.
- **Context menus open above the Pill** and above the highlighted app in the launcher.
- **A tap on ••• right after a fast swipe opened the launcher did nothing.** Chrome sometimes delivers such a tap without a click. A short, still tap on a dock tab or a launcher app now acts even then.

From the new Claude Design version
- **Auto-hide:** the dock hides 2 s after you tap outside it and after 10 s of no touches (Tweak Docklet → Hide gesture → Behaviour: a switch and both times).
- **Hiding the dock with the launcher open** folds the launcher away with it.
- The Boom gate hide gesture is now called **Drawbridge**.
- App data moved to `docklet-data.js`.

### v0.2.9
Compared to v0.2.7, so this includes v0.2.8. Measured on a Galaxy A26:

Speed
- **The app launcher opens even more smoothly:** 120–128 frames in 1.4 s instead of 89–97, longest frame 25–33 ms; closing runs at 152–153. The cause was not the icon blur. The hidden dock glass of Playground v0.5 sat under the launcher at opacity 0, and its 18 px blur was still computed every frame. It is now hidden properly.
- **Auto-hide fades the dock by opacity only.** A blur on every element made the first frame of each auto-hide take 75–117 ms; now 33–75 ms.

Gestures
- **Launcher and hide no longer get mixed up.** On the dock, a swipe up steeper than 30° opens the launcher (on the Pill: text input). A near-horizontal swipe to the right, from 30° up to 45° down, hides the dock. Left and down do nothing.
- **Hide from anywhere on the dock.** From the last tabs there was too little room to the edge, so the dock didn't hide. The swipe needed now shrinks with the room left: about 34 px from the last tab, 150 px from the first.
- **Android's Back gesture is off in the bottom 200 dp** across the full width, the most Android allows. Above that, Back can't be turned off.
- **Letting go midway settles in one motion.** When you pulled a hidden dock about halfway out and let go, the dock jumped back to the edge and slid in over the whole way (554 ms). Now there is one animation, and it is faster: 90% of the way in 205–215 ms instead of 239–244.
- **A quick flick off the edge glow brings the dock back**, even a short one (about 50–70 px).
- **The edge glow is easier to grab:** the grab zone is now about 47 px from the edge along the whole glow, instead of the 24 px strip. The glow brightens only when a touch lands there; before, any touch on the screen brightened it.
- **A rainbow shimmer runs along the edge glow while you hold it** (new in v0.2.9). Blue, violet, pink, orange, yellow, green and cyan flow along the glow, one cycle every 1.4 s. They brighten the white glow instead of covering it, are strongest at the screen edge and fade in over 22 px. On release the shimmer fades out over 320 ms. From the new Claude Design version. The app stays at 120 frames per second while you hold the glow.

Menus and taps
- **A pinned app has the full menu**: Unpin from the dock, favourites, Refresh, but no Close. Before, it had only Unpin.
- **Context menus open above the Pill** and above the highlighted app in the launcher.
- **A tap on ••• right after a fast swipe opened the launcher did nothing.** Chrome sometimes delivers such a tap without a click. A short, still tap on a dock tab or a launcher app now acts even then.

From the new Claude Design version
- **Auto-hide:** the dock hides 2 s after you tap outside it and after 10 s of no touches (Tweak Docklet → Hide gesture → Behaviour: a switch and both times).
- **Hiding the dock with the launcher open** folds the launcher away with it.
- The Boom gate hide gesture is now called **Drawbridge**.
- App data moved to `docklet-data.js`.

### v0.2.8
Compared to v0.2.7. Measured on a Galaxy A26:

Speed
- **The app launcher opens even more smoothly:** 120–128 frames in 1.4 s instead of 89–97, longest frame 25–33 ms; closing runs at 152–153. The cause was not the icon blur. The hidden dock glass of Playground v0.5 sat under the launcher at opacity 0, and its 18 px blur was still computed every frame. It is now hidden properly.
- **Auto-hide fades the dock by opacity only.** A blur on every element made the first frame of each auto-hide take 75–117 ms; now 33–75 ms.

Gestures
- **Launcher and hide no longer get mixed up.** On the dock, a swipe up steeper than 30° opens the launcher (on the Pill: text input). A near-horizontal swipe to the right, from 30° up to 45° down, hides the dock. Left and down do nothing.
- **Hide from anywhere on the dock.** From the last tabs there was too little room to the edge, so the dock didn't hide. The swipe needed now shrinks with the room left: about 34 px from the last tab, 150 px from the first.
- **Android's Back gesture is off in the bottom 200 dp** across the full width, the most Android allows. Above that, Back can't be turned off.
- **Letting go midway settles in one motion.** When you pulled a hidden dock about halfway out and let go, the dock jumped back to the edge and slid in over the whole way (554 ms). Now there is one animation, and it is faster: 90% of the way in 205–215 ms instead of 239–244.
- **A quick flick off the edge glow brings the dock back**, even a short one (about 50–70 px).
- **The edge glow is easier to grab:** the grab zone is now about 47 px from the edge along the whole glow, instead of the 24 px strip. The glow brightens only when a touch lands there; before, any touch on the screen brightened it.

Menus and taps
- **A pinned app has the full menu**: Unpin from the dock, favourites, Refresh, but no Close. Before, it had only Unpin.
- **Context menus open above the Pill** and above the highlighted app in the launcher.
- **A tap on ••• right after a fast swipe opened the launcher did nothing.** Chrome sometimes delivers such a tap without a click. A short, still tap on a dock tab or a launcher app now acts even then.

From the new Claude Design version
- **Auto-hide:** the dock hides 2 s after you tap outside it and after 10 s of no touches (Tweak Docklet → Hide gesture → Behaviour: a switch and both times).
- **Hiding the dock with the launcher open** folds the launcher away with it.
- The Boom gate hide gesture is now called **Drawbridge**.
- App data moved to `docklet-data.js`.

### v0.2.7
Compared to v0.2.5:
- **The app launcher opens smoothly.** Measured on a Galaxy A26: 98–100 frames in 1.4 s instead of 56–75, longest frame 42–50 ms instead of up to 100 ms (Playground v0.5: 108–117). The notched dock glass that grows into the launcher panel was resized, re-clipped and had its rim SVG rebuilt every frame. Now, once the Pill hole closes, the glass moves as one piece with a fixed mask for the bottom corners and the hole, and the rim is drawn on a canvas with the same paths and gradients.
- **One dock all the way.** The launcher panel stays the same notched glass as the dock, with the same rim and the glint around the Pill hole.
- **No glass outside the corners, no dark crescent under the Pill** in the last moments before the dock settles. On this WebView `clip-path` doesn't clip the blur, so that stretch is now masked to the exact shape.
- **The notch glint no longer jumps** when the dock comes to rest: while the dock grows it is drawn only along the notch, as at rest. After opening and closing the launcher the dock rim is back exactly as on first load; before, the notch glint spread over the whole outline.
- **The edge glow of a hidden dock fades smoothly** when you bring the dock back. It follows the dock while you pull and fades over 320 ms after you let go. Before, the tap feedback held it bright and it vanished in one frame.

Known: the first launcher open after starting the app still has one frame of about 100 ms.

### v0.2.5
First release. Docklet Liquid is a separate app; Docklet Playground v0.5 stays as it was.

**Compared to Docklet Playground v0.5:**

Search (the centre Pill)
- **The Pill turns into search.** Tapping it no longer expands the dock into search with a live camera. The Pill itself stretches up into a search card that floats above the dock, with a camera tile and a search field, and a ✕ in a small lobe under the card.
- **Text input is a second step.** Tap the field: the card grows into recent contacts, a scan button, the field and a keyboard. Swiping up on the Pill goes straight there.
- **Three keyboard layouts** (Tweak Docklet → Centre button → Keyboard layout): v1 Overlap, v2 Sink, v3 Hide.
- **Pill morph style:** Liquid, Shape or Fade. The "Pill morphs while typing" switch is gone.
- **Closing:** ✕ closes everything, Back goes one step back (text input → search card → closed), or swipe down from ✕.
- **No live camera:** the camera tile shows a still photo.
- **Shape check:** an overlay of the Figma outlines, to compare shapes on the phone.

Dock
- 382 pt wide instead of 378, and 27 pt from the bottom instead of 22.
- Tab labels: Off, Launcher only (default) or Everywhere, instead of an on/off switch. By default the dock shows icons without labels.
- The last tab is More (•••) by default instead of Apps; Apps icon can be More, Lines or Grid.
- The dock Shape setting (Rounded / Organic) is gone.

Hiding the dock
- Default hide gesture is Drawbridge (then called Boom gate) instead of Slide.
- New: how a hidden dock shows at the edge: Edge glow (default), Short glow, Bar or None.
- New: Hide dock when an app opens (on by default).
- New: Tester mode (Off / Tester 1). Tester 1 is tuned from the first tester's recorded sessions: a quick flick hides or brings back the dock even when it is short, more diagonal swipes count as sideways, Slide hides to whichever side you swipe, and pressing still on the dock for 0.4 s counts as a hold, not a swipe.
- Finger tracking reads every touch sample between frames, not only one per frame.

Kept from v0.5: Back closes one layer at a time and never the app, edge swipes don't trigger Android Back, the grabber on the open dock, swipe down to close follows the finger, no first-run onboarding.

**Fixes on top of the Claude Design export:**
- **✕ closes everything.** In text input, tapping ✕ on a phone used to stop at the camera step: the tap's click landed on the dock Pill that had moved under the finger and reopened it.
- **No live camera.** On the phone the live camera dropped the screen from 120 Hz to 60 Hz and stalled opening the Pill.
- **Smooth step into text input.** Measured on a Galaxy A26: 136–144 frames in 1.4 s instead of 103–117, longest frame 25–33 ms instead of up to 92 ms. Once the shape is a card, its glass is a rounded body plus a small lobe moved by transform, instead of a full-screen mask rebuilt every frame, and the rim is drawn only as large as the card.
- **Closing is one motion.** Swiping down from ✕ or tapping it no longer jumps the card up first and pauses before it shrinks. The card leaves at speed, lands in the dock together with it, and its content fades with the finger.
- The camera placeholder image never showed in the APK (`build.py` left `./` in front of inlined images).

Known: a swipe down that starts on the card body is taken by the browser as a scroll; start it from ✕.

## Docklet Playground

### v0.5
- **No first-run onboarding.** The 4 coach marks (Your apps live here, Tap to search or scan, Swipe up for all apps, the hide gesture) no longer appear. In the Tweak panel, "Replay onboarding" is now "Show tips again" and only brings back the small in-context tips.
- **Fix:** moving your finger back down during the swipe up that opens the app launcher no longer turns it into a close gesture.

### v0.4
- **Grabber on the open dock.** The expanded dock and the app launcher show a small handle at the top.
- **Swipe down to close follows your finger.** Closing the expanded dock or the launcher tracks the finger, like opening does. On release it snaps open or shut depending on where it would end up.

### v0.3
- **Edge swipes on the dock no longer trigger Android's system Back.** The prototype tells the app where the dock and its hidden edge are, and the app keeps the system Back gesture out of that area. A hidden dock can be pulled back in starting right at the screen edge.
- **Back never closes the app.** Back and the Back gesture close one layer at a time: menu, search, the expanded Pill, the app launcher, a card, a chat or mini app, then the Tweak panel. With nothing open, Back brings a hidden dock back. The Home gesture still leaves the app.

## Docklet Recorder

### v0.6
- **Session recording, now the default.** Tap the red dot once and use the prototype normally, for as long as you like, then tap Stop. There's no red border or finger trail while recording. The result is one "Session" in Takes: how many gestures of each kind you made, what each gesture changed in the prototype (for example the dock hiding or the launcher opening), and which gestures did nothing.
- **Take mode is still there.** Switch to it in the recorder settings, under Recording, to record one gesture per take with a snapshot and replay, as before.
- **Proper version numbers.** The app now reports version 0.6.0 (code 600) instead of 1.0, and installs as an update over older builds.

### v0.5
- Uses the Playground v0.5 prototype: no first-run onboarding, and the swipe-up fix.

### v0.4
- Uses the Playground v0.4 prototype: grabber on the open dock, and swipe down to close follows the finger.

### v0.3
- Uses the Playground v0.3 prototype.
- Edge swipes on the dock no longer trigger Android's system Back, so gestures that start at the screen edge are recorded instead of closing the app.
- Back never closes the app. It closes the prototype's layers one at a time, and with nothing open it brings a hidden dock back.
