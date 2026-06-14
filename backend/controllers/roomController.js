import asyncHandler from 'express-async-handler';
import Room from '../models/Room.js';

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private (Admin, Nurse, Receptionist)
const getRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find({});
  res.json(rooms);
});

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Private (Admin, Nurse, Receptionist)
const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (room) {
    res.json(room);
  } else {
    res.status(404);
    throw new Error('Room not found');
  }
});

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private (Super Admin, Hospital Admin)
const createRoom = asyncHandler(async (req, res) => {
  const { roomNumber, ward, bedCount, pricePerDay } = req.body;

  const roomExists = await Room.findOne({ roomNumber });
  if (roomExists) {
    res.status(400);
    throw new Error('Room number already exists');
  }

  const room = await Room.create({
    roomNumber,
    ward,
    bedCount,
    pricePerDay,
  });

  if (room) {
    res.status(201).json(room);
  } else {
    res.status(400);
    throw new Error('Invalid room data');
  }
});

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private (Super Admin, Hospital Admin)
const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (room) {
    room.roomNumber = req.body.roomNumber || room.roomNumber;
    room.ward = req.body.ward || room.ward;
    room.bedCount = req.body.bedCount || room.bedCount;
    room.pricePerDay = req.body.pricePerDay || room.pricePerDay;
    room.status = req.body.status || room.status;

    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } else {
    res.status(404);
    throw new Error('Room not found');
  }
});

export { getRooms, getRoomById, createRoom, updateRoom };
