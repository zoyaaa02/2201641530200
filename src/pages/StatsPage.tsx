// src/pages/StatsPage.tsx
import React, { useEffect, useState } from "react";
import { getAllShortLinks, saveAllShortLinks } from "../lib/storage";
import { ShortLink } from "../types";
import {
  Typography, Box, Paper, Accordion, AccordionSummary, AccordionDetails, Table, TableHead,
  TableRow, TableCell, TableBody, Button
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { logEvent } from "../lib/logger";

export default function StatsPage() {
  const [links, setLinks] = useState<ShortLink[]>([]);

  useEffect(() => {
    setLinks(getAllShortLinks());
  }, []);

  const clearAll = () => {
    saveAllShortLinks([]);
    setLinks([]);
    logEvent("WARN","STORAGE_CLEARED", {});
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>URL Shortener Statistics</Typography>
      <Button variant="outlined" color="error" onClick={clearAll}>Clear All</Button>
      <Box sx={{ mt: 2 }}>
        {links.length === 0 ? <Typography>No short links yet</Typography> :
          links.map(link => (
            <Paper key={link.id} sx={{ mb: 2, p: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <Typography><strong>{`${window.location.origin}/${link.shortcode}`}</strong></Typography>
                  <Typography variant="caption">Created: {new Date(link.createdAt).toLocaleString()}</Typography>
                  <br/>
                  <Typography variant="caption">Expires: {new Date(link.expiresAt).toLocaleString()}</Typography>
                  <br/>
                  <Typography variant="caption">Clicks: {link.clicks.length}</Typography>
                </div>
              </Box>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Click details</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {link.clicks.length === 0 ? <Typography>No clicks yet</Typography> :
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Referrer</TableCell>
                          <TableCell>Geo (lat,lon)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {link.clicks.map((c, i) => (
                          <TableRow key={i}>
                            <TableCell>{new Date(c.timestamp).toLocaleString()}</TableCell>
                            <TableCell>{c.referrer || 'Direct / unknown'}</TableCell>
                            <TableCell>{c.geo ? `${c.geo.lat?.toFixed(3)}, ${c.geo.lon?.toFixed(3)}` : 'unknown'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  }
                </AccordionDetails>
              </Accordion>
            </Paper>
          ))
        }
      </Box>
    </Box>
  );
}
