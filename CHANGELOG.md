# Changelog

Changes after v0.2. App versions come from `versions.json`. Downloads are on the [releases page](https://github.com/SabitKadyr/docklet-playground-src/releases).

## Docklet Liquid

A separate app (`com.docklet.liquid.design`) for the Liquid search flow: the centre Pill flows into a search card, and tapping the field opens text input with a keyboard. Three keyboard layouts can be switched in Tweak Docklet → Centre button → Keyboard layout. Source: `Docklet Liquid.dc.html` with `docklet-liquid.js`, built by `build_liquid.py`.

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
