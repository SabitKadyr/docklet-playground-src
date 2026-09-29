# How to test Docklet gestures with Docklet Recorder

Docklet Recorder runs the Docklet dock prototype and records every touch you make. Record a few takes for each gesture, then send us the files.

## 1. Install
1. On your Android phone, download the APK from the latest Docklet Recorder release:
   https://github.com/SabitKadyr/docklet-playground-src/releases/tag/recorder-v0.5
2. Open it and allow installing apps from this source when asked.
3. Open **Docklet Recorder**. You'll see the prototype with a small red dot in the top-right corner.

## 2. Record a take
1. Tap the **red dot**. Recording starts right away: a red frame appears around the screen and the timer runs.
2. Do **one gesture**, for example hide the dock with a swipe.
3. Tap **Stop**. The take is saved as "Take 01", "Take 02" and so on, with the gesture it recognised, e.g. "Swipe →" or "drag left, tap".

Tips:
- Keep one gesture per take. It makes the logs much easier to read.
- The toolbar at the top is not recorded, only the prototype under it.
- Opening the toolbar always starts a new recording. To just look at your takes, tap Stop straight away, then Takes. This leaves an empty "No touches" take, which you can delete.
- Swipes that start right at the screen edge next to the dock are recorded. Android's Back gesture is switched off there.
- Back never closes the app. It closes whatever is open in the prototype. Use the Home gesture to leave.

## 3. What to test
Switch the gesture mode in **Tweak Docklet → Hide gesture → Gesture mode**, then close the panel. For each of the 4 modes (Slide, Reverse Park, Boom gate, Pivot Turn), record:

| # | Gesture | What should happen |
|---|---|---|
| 1 | Slowly drag the dock about 40% of the way to hide it, then let go | It goes back to where it was, no bounce |
| 2 | Slowly drag it about 60% of the way, then let go | It hides |
| 3 | Short fast flick | It hides |
| 4 | Drag the hidden dock back out, starting right at the screen edge | It follows your finger and comes back |
| 5 | Tap the hidden dock's edge | It comes back |
| 6 | Grab the dock while it's still moving | It stops under your finger, no jump |

Also once in any mode:
- Swipe up on the dock: the app launcher opens with your finger.
- Swipe down on the open launcher or the open dock: it closes with your finger.
- Long-press an empty part of the dock: a "Hide left / Hide right" menu appears.

If something feels wrong, record it again and note the take number and what you expected.

## 4. Send the logs
1. Tap **Takes** in the toolbar to see your list.
2. Tap **All JSON** (and **All PNGs** if you like). Or, on a single take, tap **Share**.
3. The files are saved on your phone in **Downloads → Docklet Recorder**.
4. Open the **Files** app, go to that folder, select the files and share them to us in Telegram, WhatsApp or email. Add a line per take, e.g. "Take 03: Pivot Turn, 40% drag, it hid instead of coming back".

You don't need to add your phone model: every file already includes the screen size and device info.
