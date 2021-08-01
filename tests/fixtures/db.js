const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Task = require("../../src/models/task");

const userOneId = mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: "Kabir-1",
  email: "kabir1@abc.com",
  password: "somepass",
  tokens: [
    {
      token: jwt.sign(
        { _id: userOneId.toString() },
        `${process.env.JWT_SECRET}`
      ),
    },
  ],
};

const userTwoId = mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: "Kabir-2",
  email: "kabir2@abc.com",
  password: "somepass",
  tokens: [
    {
      token: jwt.sign(
        { _id: userTwoId.toString() },
        `${process.env.JWT_SECRET}`
      ),
    },
  ],
};

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: "Task-1 test",
  completed: false,
  owner: userOne._id,
};

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: "Task-2 test",
  completed: true,
  owner: userOne._id,
};

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: "Task-3 test",
  completed: true,
  owner: userTwo._id,
};

const setupDb = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

const stopDb = () => {
  mongoose.disconnect();
};

module.exports = {
  userOneId,
  userTwoId,
  userOne,
  userTwo,
  setupDb,
  stopDb,
  taskOne,
  taskTwo,
  taskThree,
};
