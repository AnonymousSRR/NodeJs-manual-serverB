const express = require('express');
const app = express();
const port = 5000; // Ensure this port is different from Server A
const { init, logMessage, logError, logException, requestHandler } = require('zipy-node-sdk');

// Initialize Zipy SDK
init('4cf11ce5');

app.use(express.json());

// Add Zipy request handler middleware
app.use(requestHandler);

// Define the /data route
app.get('/data', (req, res) => {
    console.log("Reached here")
    const shouldFail = req.query.fail;
    if (shouldFail === 'true') {
        res.status(500).send({ error: 'Intentional failure from Server B' });
    } else {
        res.send({ data: 'Successful response from Server B' });
    }
});

// Error-triggering route
app.post('/error', (req, res) => {
  const { unhandled, errorType } = req.body;
  if (unhandled) {
    switch (errorType) {
      case 'typeError':
        (42)(); // Trigger a TypeError
        break;
      case 'referenceError':
        nonExistentFunction(); // Trigger a ReferenceError
        break;
      case 'syntaxError':
        eval("abc def"); // Trigger a SyntaxError
        break;
      case 'rangeError':
        new Array(-1); // Trigger a RangeError
        break;
      case 'uriError':
        decodeURIComponent('%'); // Trigger a URIError
        break;
      case 'evalError':
        throw new EvalError('EvalError triggered'); // Trigger an EvalError
        break;
      default:
        throw new Error('Default Uncaught Exception'); // Trigger a generic Error
    }
    return;
  }

  if (req.body.shouldThrow) {
    res.status(500).send({ error: 'Manual error triggered.' });
  } else {
    res.send('No error triggered.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Global uncaught exceptions handler
process.on('uncaughtException', () => {
  console.error('There was an uncaught error:', err);
  process.exit(1); // Exit the process after logging the error
});
