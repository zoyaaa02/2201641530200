// src/pages/ShortenerPage.tsx
import React, { useState } from "react";
import {
  Box, Grid, TextField, Button, Typography, Paper, IconButton, Snackbar, Alert
} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { isValidUrl, isValidShortcode, generateShortcode, minutesFromNowToISO } from "../lib/utils";
import { addShortLink, findByShortcode } from "../lib/storage";
import { ShortLink } from "../types";
import { logEvent } from "../lib/logger";

type Row = { id: string; longUrl: string; validity?: string; shortcode?: string; error?: string };

function genId() { return Math.random().toString(36).slice(2, 9); }

const DEFAULT_VALIDITY_MIN = 30;

export default function ShortenerPage() {
  const [rows, setRows] = useState<Row[]>([{ id: genId(), longUrl: "", validity: "", shortcode: "" }]);
  const [created, setCreated] = useState<ShortLink[]>([]);
  const [snack, setSnack] = useState<{open:boolean, message:string, severity:"success"|"error"}>({open:false, message:"", severity:"success"});

  const addRow = () => {
    if (rows.length >= 5) {
      setSnack({open:true,message:"Max 5 URLs at once",severity:"error"});
      return;
    }
    setRows([...rows, { id: genId(), longUrl: "", validity: "", shortcode: "" }]);
  };

  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows(rows.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const onSubmit = async () => {
    const newLinks: ShortLink[] = [];
    for (const r of rows) {
      if (!r.longUrl || !isValidUrl(r.longUrl)) {
        logEvent("ERROR", "INVALID_URL_INPUT", { input: r.longUrl });
        setSnack({open:true,message:"One or more URLs are invalid",severity:"error"});
        return;
      }
      let validity = Number(r.validity || DEFAULT_VALIDITY_MIN);
      if (Number.isNaN(validity) || validity <= 0) { validity = DEFAULT_VALIDITY_MIN; }
      // shortcode
      let shortcode = r.shortcode?.trim() || "";
      if (shortcode) {
        if (!isValidShortcode(shortcode)) {
          logEvent("ERROR", "INVALID_SHORTCODE_FORMAT", { shortcode });
          setSnack({open:true,message:`Shortcode "${shortcode}" invalid (alphanumeric 4-12)`,severity:"error"});
          return;
        }
        if (findByShortcode(shortcode)) {
          logEvent("ERROR", "SHORTCODE_COLLISION", { shortcode });
          setSnack({open:true,message:`Shortcode "${shortcode}" already exists`,severity:"error"});
          return;
        }
      } else {
        // generate until unique
        let candidate = generateShortcode(6);
        while (findByShortcode(candidate)) candidate = generateShortcode(6);
        shortcode = candidate;
      }

      const link: ShortLink = {
        id: Math.random().toString(36).slice(2, 10),
        shortcode,
        longUrl: r.longUrl.trim(),
        createdAt: new Date().toISOString(),
        expiresAt: minutesFromNowToISO(validity),
        clicks: [],
        custom: !!r.shortcode
      };

      addShortLink(link);
      logEvent("INFO", "SHORT_URL_CREATED", { shortcode: link.shortcode, longUrl: link.longUrl, expiresAt: link.expiresAt });
      newLinks.push(link);
    }

    setCreated(newLinks);
    setSnack({open:true,message:`${newLinks.length} short link(s) created`,severity:"success"});
    // reset inputs
    setRows([{ id: genId(), longUrl: "", validity: "", shortcode: "" }]);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnack({open:true,message:"Copied",severity:"success"});
      logEvent("INFO","SHORT_URL_COPIED",{shortUrl:text});
    } catch {
      setSnack({open:true,message:"Copy failed",severity:"error"});
      logEvent("WARN","COPY_FAILED",{shortUrl:text});
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>URL Shortener</Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        {rows.map((r, idx) => (
          <Grid container spacing={2} key={r.id} sx={{ mb: 1 }}>
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                label={`Long URL #${idx+1}`}
                value={r.longUrl}
                onChange={(e)=> updateRow(r.id, { longUrl: e.target.value })}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                fullWidth
                label="Validity (min)"
                value={r.validity}
                onChange={(e)=> updateRow(r.id, { validity: e.target.value })}
                placeholder={`${DEFAULT_VALIDITY_MIN}`}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Preferred shortcode (optional)"
                value={r.shortcode}
                onChange={(e)=> updateRow(r.id, { shortcode: e.target.value })}
                placeholder="alphanumeric 4-12"
              />
            </Grid>
          </Grid>
        ))}

        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <Button variant="contained" onClick={addRow}>Add another (max 5)</Button>
          <Button variant="contained" color="primary" onClick={onSubmit}>Create Short Links</Button>
        </Box>
      </Paper>

      {created.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Results</Typography>
          {created.map(c => {
            const shortFull = `${window.location.origin}/${c.shortcode}`;
            return (
              <Box key={c.id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p:1 }}>
                <Box>
                  <Typography><strong>{shortFull}</strong></Typography>
                  <Typography variant="caption">Expires at: {new Date(c.expiresAt).toLocaleString()}</Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => copyToClipboard(shortFull)}><ContentCopyIcon /></IconButton>
                </Box>
              </Box>
            );
          })}
        </Paper>
      )}

      <Snackbar open={snack.open} onClose={()=> setSnack({...snack,open:false})} autoHideDuration={3000}>
        <Alert severity={snack.severity} sx={{ width: '100%' }}>{snack.message}</Alert>
      </Snackbar>

    </Box>
  );
}
