import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://1e90c59053b9f77c766a90f2cd157fd1@o4511004370731008.ingest.de.sentry.io/4511004378071120",
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
