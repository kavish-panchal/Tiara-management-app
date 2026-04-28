const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve dist directory relative to this file, not the process working directory
const distPath = path.resolve(__dirname, 'dist');

// Serve static files from dist directory
app.use(express.static(distPath));

// All routes serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
