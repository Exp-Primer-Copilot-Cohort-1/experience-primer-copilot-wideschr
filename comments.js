// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { randomBytes } = require('crypto');
const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Data
const commentsByPostId = {};

// Routes
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// Create comment
app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  // Get comments for post
  const comments = commentsByPostId[req.params.id] || [];

  // Add new comment to list
  comments.push({ id: commentId, content, status: 'pending' });

  // Save comments
  commentsByPostId[req.params.id] = comments;

  // Emit event
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending',
    },
  });

  // Send response
  res.status(201).send(comments);
});

// Event handler
app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  // Comment moderation
  if (type === 'CommentModerated') {
    const { id, postId, status, content } = data;

    // Get comments for post
    const comments = commentsByPostId[postId];

    // Find comment
    const comment = comments.find((comment) => comment.id === id);

    // Update comment
    comment.status = status;

    // Emit event
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: {
        id,
        postId,
        status,
        content,
      },
    });
  }

  // Send response
  res.send({});
});

// Start server
app.listen(4001, () => {
  console.log('Listening on port 4001');
});