const { User } = require("../models/userModel");
const { HttpError } = require("../helpers/HttpError");

const getAllUsers = async (req, res) => {
  const users = await User.find({});
  if (!users || users.length === 0) {
    return [];
  }
  res.json(users);
};

const getUserByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    return res.status(500).json({ message: `Failed to retrieve user ${error.message}` });
  //  HttpError(500, `Failed to retrieve user ${error.message}`);
  }
};

// const searchUsersByName = async (req, res) => {
//   const { name } = req.query;
//   if (!name) {
//     return res.status(400).json({ message: "Name query parameter is required" });
//   }
//   try {
//     const user = await User.find({
//       name: { $regex: name, $options: "i" }
//     });
//     if (!user) {
//       HttpError(404, "Group not found");
//     }
//     res.json(user);
//   } catch (error) {
//     HttpError(500, `Failed to retrieve user ${error.message}`);
//   }
// };
const searchUsersByName = async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ message: "Name query parameter is required" });
  }
  try {
    const users = await User.find({
      name: { $regex: name, $options: "i" }
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json(users);
  } catch (error) {
    console.error('Failed to retrieve user:', error.message);
    return res.status(500).json({ message: `Failed to retrieve user ${error.message}` });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10); // Хешируем пароль перед сохранением
    }

    // Обновляем данные пользователя
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true, // возврат обновленных данных пользователя
      runValidators: true, // валидаторы для новых данных
    });

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      phone: updatedUser.phone,
      groups: updatedUser.groups,
      balance: updatedUser.balance,
      telegramId: updatedUser.telegramId,
      verify: updatedUser.verify,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User successfully deleted" });
  } catch (error) {
    next(error);
  }
};

const addVisit = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const newVisit = {
      date: req.body.date,
      groupId: req.body.groupId,
      eventId: req.body.eventId,
    };

    user.visits.push(newVisit);

    await user.save();

    res.status(201).json(user.visits);
  } catch (error) {
    next(error);
  }
};

// {
//   "date": "2024-08-19T08:11:00.000Z",
//   "groupId": "group2",
//   "eventId": "yzlX33MxSxSJGDHjo09G7"
// }

const updateUserBalance = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { balance } = req.body;
    if (balance === undefined || typeof balance !== "number") {
      throw new BadRequestError("Invalid balance value");
    }

    user.balance = balance;

    await user.save();

    res
      .status(200)
      .json({ message: "Balance updated successfully", balance: user.balance });
  } catch (error) {
    next(error);
  }
};

// {
//   "balance": 150
// }

const getUserGroups = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const userGroups = user.groups;

    res.status(200).json(userGroups);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserByUserId,
  updateUser,
  deleteUser,
  addVisit,
  updateUserBalance,
  getUserGroups,
  searchUsersByName,
};
