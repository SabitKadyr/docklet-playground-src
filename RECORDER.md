# How to test Docklet gestures with Docklet Recorder

Docklet Recorder runs the Docklet dock prototype and records how you use it. It logs every touch, what gesture it was, and what that gesture changed in the prototype. Record a session, then send us the file.

## 1. Install
1. On your Android phone, download the APK from the latest Docklet Recorder release:
   https://github.com/SabitKadyr/docklet-playground-src/releases/tag/recorder-v0.6
2. Open it and allow installing apps from this source when asked. It installs over any older Recorder.
3. Open **Docklet Recorder**. You'll see the prototype with a small red dot in the top-right corner.

## 2. Record a session
This is the default mode, and the one we need most.

1. Tap the **red dot**. Recording starts. There's no red frame or finger trail, so the prototype looks and feels exactly as usual.
2. Use the prototype normally for a few minutes. Try the gestures in the list below, in any order, as many times as you like.
3. Tap **Stop** (or the red dot with the timer). The recorder says "Building report…" and saves **Session 01**.

A session records every gesture you make, how fast and far your finger moved, and what each gesture did. For example "dock hidden to the right", "launcher opened", or nothing at all. Gestures that did nothing are exactly what we're looking for.

Tips:
- The recorder's own toolbar isn't recorded, only the prototype under it.
- Swipes that start right at the screen edge next to the dock are recorded. Android's Back gesture is switched off there.
- Back never closes the app. It closes whatever is open in the prototype. Use the Home gesture to leave.

## 3. What to try
Switch the gesture mode in **Tweak Docklet → Hide gesture → Gesture mode**, then close the panel. It's fine to switch modes during one session: the log records which mode each gesture was made in. For each of the 4 modes (Slide, Reverse Park, Boom gate, Pivot Turn), try:

| Gesture | What should happen |
|---|---|
| Slowly drag the dock about 40% of the way to hide it, then let go | It goes back to where it was, no bounce |
| Slowly drag it about 60% of the way, then let go | It hides |
| Short fast flick | It hides |
| Drag the hidden dock back out, starting right at the screen edge | It follows your finger and comes back |
| Tap the hidden dock's edge | It comes back |
| Grab the dock while it's still moving | It stops under your finger, no jump |

Also, in any mode:
- Swipe up on the dock: the app launcher opens with your finger.
- Swipe down on the open launcher or the open dock: it closes with your finger.
- Long-press an empty part of the dock: a "Hide left / Hide right" menu appears.

When something feels wrong, note roughly when it happened ("about 2 minutes in, Pivot Turn, the dock didn't come back").

## 4. Send the log
1. Tap **Takes** in the toolbar to see your sessions.
2. On your session, tap **JSON** (or **Share**). You can also tap **All JSON** to export everything.
3. The file is saved on your phone in **Downloads → Docklet Recorder**.
4. Open the **Files** app, go to that folder and share the file with us in Telegram, WhatsApp or email, together with your notes.

You don't need to add your phone model: the file already includes the screen size, device info and prototype settings.

## Take mode: one gesture at a time
If we ask you to record a specific gesture, use Take mode instead:
1. Open the recorder settings (the sliders icon in the toolbar) and choose **Take** under Recording.
2. Tap the red dot. A red frame shows recording is on. Do one gesture, then tap **Stop**.
3. Each take gets its own replay, a PNG of the finger trace, and JSON/CSV export.

Opening the toolbar in Take mode always starts a new recording. To just look at your takes, tap Stop straight away, then Takes. This leaves an empty "No touches" take, which you can delete.
