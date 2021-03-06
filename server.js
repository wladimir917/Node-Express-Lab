// import your node modules
const express = require('express');
const cors = require('cors');
const db = require('./data/db.js');

// add your server code starting here

const port = 5000;
const server = express();
server.use(express.json());
server.use(cors({ origin: 'http://localhost:3000' }));


const sendUserError = (status, message, res) => {
    res.status(status).json({ errorMessage: message });
    return;
};

server.get('/', (req, res) => {
    // 1st arg: route where a resource can be interacted with
    // 2nd arg: callback to deal with sending responses, and handling incoming data.
    res.send('Welcome to my server');
});

server.post('/api/posts', (req, res) => {
    const { title, contents } = req.body;
    if (!title || !contents) {
      sendUserError(400, 'Must provide title and contents', res);
      return;
    }
    db
        .insert(
            {
                title, 
                contents
            })
        .then(response => {
            db
                .findById(response.id)
                .then(post => {
                    if(post.length === 0) {
                        sendUserError(404, "The post with the specified ID does not exist.", res);
                        return;
                    }
                    res.status(201).json(post);
                })
                .catch(error => {
                    sendUserError(500, "The post information could not be retrieved.", res)
                })
        })
        .catch(error => {
            sendUserError(500, '"There was an error while saving the post to the database" ', res);
        })
})

server.listen(port, () => console.log(`Server running on port ${port}`));

server.get("/api/posts", (req, res) => {
    db
        .find()
        .then(posts => {
            res.json(posts);
        })
        .catch(error => {
            sendUserError(500, "The posts information could not be retrieved.", res)
        })
})

server.get("/api/posts/:id", (req, res) => {
    const { id } = req.params;
    db
        .findById(id)
        .then(post => {
            if(post.length === 0) {
                sendUserError(404,"The post with the specified ID does not exist.", res);
                return;
            }
            res.json(post);
        })
        .catch(error => {
            sendUserError(500, "The post information could not be retrieved.", res)
        })
})

server.delete("/api/posts/:id", (req, res) => {
    const { id } = req.params;
    db
        .findById(id)
        .then(post => {
            if(post.length === 0) {
                sendUserError(404,"The post with the specified ID does not exist.", res);
                return;
            }
            const postRemoved = post;
            db
                .remove(id)
                .then(isRemoved => {
                    if(isRemoved === 0) {
                        sendUserError(404, "The post with the specified ID does not exist.", res);
                        return;
                    }
                    res.json(post);
                })
                .catch(error => {
                    sendUserError(500, "The post could not be removed", res);
                })
        .catch(error => {
            sendUserError(500, "The post information could not be retrieved.", res)
        }) 
    })   
})

server.put("/api/posts/:id", (req, res) => {
    const { id } = req.params;
    const { title, contents } = req.body;
    if(!title || !contents) {
        sendUserError(400, "Please provide title and contents for the post.", res);
        return;
    }
    db
        .update(id, {title, contents})
        .then(updated => {
            if(!updated) {
                sendUserError(404, "The post with the specified ID does not exist.", res);
                return;
            }
            db
                .findById(id)
                .then(post => {
                    if(post.length === 0) {
                        sendUserError(404,"The post with the specified ID does not exist.", res);
                        return;
                    }
                    res.json(post);
                })
                .catch(error => {
                    sendUserError(500, "The post information could not be retrieved.", res)
                })
        })
        .catch(error => {
            sendUserError(500, "The post information could not be modified.", res);
        })
})