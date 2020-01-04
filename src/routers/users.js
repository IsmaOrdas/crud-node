const express = require('express');
const auth = require('../middleware/auth')
const router = new express.Router();
const User = require('../models/users');

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send(users);
  } catch (e) {
    res.status(500).send();
  }
})

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.name, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => { return token.token !== req.token })
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send();
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
})

router.patch('/users/:id', async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'password'];
  console.log(updates)
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));
  const _id = req.params.id;

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid operation' });
  }

  try {
    const user = await User.findById(_id);

    updates.forEach(update => user[update] = req.body[update])
    await user.save();

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (e) {
    res.status(400).send();
  }
})

module.exports = router;