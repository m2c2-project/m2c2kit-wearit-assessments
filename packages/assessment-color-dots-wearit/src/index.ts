import { Session } from "@m2c2kit/core";
import { Embedding } from "@m2c2kit/embedding";
import { ColorDots } from "@m2c2kit/assessment-color-dots";

const session = new Session({
  activities: [new ColorDots()],
  canvasKitWasmUrl: "canvaskit.wasm",
});
Embedding.initialize(session, { host: "MobileWebView" });
/**
 * Make session also available on window in case we want to control
 * the session through another means, such as other javascript or
 * browser code, or a mobile WebView.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as unknown as any).session = session;
session.initialize();
