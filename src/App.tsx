// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ShortenerPage from "./pages/ShortenerPage";
import StatsPage from "./pages/StatsPage";
import RedirectHandler from "./pages/RedirectHandler";
import LogViewer from "./pages/LogViewer";
import { Container, AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>URL Shortener</Typography>
          <Button color="inherit" component={RouterLink} to="/">Shorten</Button>
          <Button color="inherit" component={RouterLink} to="/stats">Stats</Button>
          <Button color="inherit" component={RouterLink} to="/logs">Logs</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 4 }}>
        <Container maxWidth="md">
          <Routes>
            <Route path="/" element={<ShortenerPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/logs" element={<LogViewer />} />
            <Route path="/:shortcode" element={<RedirectHandler />} />
          </Routes>
        </Container>
      </Box>
    </BrowserRouter>
  );
}

export default App;
