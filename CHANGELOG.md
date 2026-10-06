# Changelog

Changes after v0.2. App versions come from `versions.json`. Downloads are on the [releases page](https://github.com/SabitKadyr/docklet-playground-src/releases).

## Docklet Liquid

A separate app (`com.docklet.liquid.design`) for the Liquid search flow: the centre Pill flows into a search card, and tapping the field opens text input with a keyboard. Three keyboard layouts can be switched in Tweak Docklet → Centre button → Keyboard layout. Source: `Docklet Liquid.dc.html` with `docklet-liquid.js`, built by `build_liquid.py`.

### v0.2.5
First release. Changes on top of the Claude Design export:
- **✕ closes everything.** In text input, tapping ✕ on a phone used to stop at the camera step: the tap's click landed on the dock Pill that had moved under the finger and reopened it. It now closes all the way.
- **No live camera.** The camera tile shows a still photo. On the phone the live camera dropped the screen from 120 Hz to 60 Hz and stalled opening the Pill.
- **Smooth step into text input.** Measured on a Galaxy A26: 136–144 frames in 1.4 s instead of 103–117, longest frame 25–33 ms instead of up to 92 ms. Once the shape is a card, its glass is a rounded body plus a small lobe moved by transform, instead of a full-screen mask rebuilt every frame, and the rim is drawn only as large as the card.
- **Closing is one motion.** Swiping down from ✕ or tapping it no longer jumps the card up first and pauses before it shrinks. The card leaves at speed, lands in the dock together with it, and its content fades with the finger.
- **Fix:** the camera placeholder image never showed in the APK (`build.py` left `./` in front of inlined images).

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
