// src/pages/LogViewer.tsx
import React, { useState, useEffect } from "react";
import { getLogs, clearLogs } from "../lib/logger";
import { Box, Typography, Button, Paper, List, ListItem, ListItemText } from "@mui/material";

export default function LogViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(()=> setLogs(getLogs()), []);
  const refresh = () => setLogs(getLogs());
  const clearAll = () => { clearLogs(); refresh(); };

  return (
    <Box>
      <Typography variant="h5">Logs</Typography>
      <Box sx={{ my: 1 }}>
        <Button variant="contained" onClick={refresh}>Refresh</Button>
        <Button variant="outlined" color="error" sx={{ ml: 1 }} onClick={clearAll}>Clear logs</Button>
      </Box>
      <Paper sx={{ p: 1, maxHeight: 400, overflow: "auto" }}>
        <List dense>
          {logs.map(l => (
            <ListItem key={l.id}>
              <ListItemText
                primary={`${l.timestamp} [${l.level}] ${l.event}`}
                secondary={JSON.stringify(l.data)}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
