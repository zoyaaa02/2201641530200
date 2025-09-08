// src/pages/RedirectHandler.tsx
import React, { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { findByShortcode, updateShortLink } from "../lib/storage";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { logEvent } from "../lib/logger";

export default function RedirectHandler() {
  const { shortcode } = useParams<{ shortcode: string }>();
  const [status, setStatus] = useState<"checking"|"redirecting"|"notfound"|"expired">("checking");

  useEffect(() => {
    async function doRedirect() {
      if (!shortcode) return setStatus("notfound");
      const link = findByShortcode(shortcode);
      if (!link) {
        logEvent("warn", "REDIRECT_NOT_FOUND", { shortcode });
        return setStatus("notfound");
      }
      const now = new Date();
      if (new Date(link.expiresAt) <= now) {
        logEvent("info", "REDIRECT_EXPIRED", { shortcode });
        return setStatus("expired");
      }

      // Build click record
      const click = {
        timestamp: new Date().toISOString(),
        referrer: document.referrer || null,
        geo: null as null | { lat?: number; lon?: number; accuracy?: number }
      };

      // try getting coarse geo but don't block long
      const getGeo = new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        const timer = setTimeout(()=> resolve(null), 800); // 800ms timeout
        navigator.geolocation.getCurrentPosition(pos => {
          clearTimeout(timer);
          resolve({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
        }, ()=> {
          clearTimeout(timer);
          resolve(null);
        }, { maximumAge: 60_000, timeout: 700 });
      });

      // wait small time to get geo
      const geo = await getGeo;
      if (geo) click.geo = geo as any;

      // update storage before redirect
      link.clicks.push(click);
      updateShortLink(link);
      logEvent("info", "REDIRECT", { shortcode, longUrl: link.longUrl, click });

      // finally redirect
      setStatus("redirecting");
      window.location.assign(link.longUrl);
    }

    doRedirect();
  }, [shortcode]);

  if (status === "checking") return <Box sx={{ mt: 4, textAlign: "center" }}><CircularProgress /> <Typography>Checking link...</Typography></Box>;
  if (status === "redirecting") return <Box sx={{ mt: 4, textAlign: "center" }}><Typography>Redirecting…</Typography></Box>;
  if (status === "notfound") return <Box sx={{ mt: 4 }}>
    <Typography variant="h6">404 — Short link not found</Typography>
    <Button to="/" component={RouterLink}>Go back</Button>
  </Box>;
  if (status === "expired") return <Box sx={{ mt: 4 }}>
    <Typography variant="h6">Link expired</Typography>
    <Button to="/" component={RouterLink}>Create a new one</Button>
  </Box>;

  return null;
}
