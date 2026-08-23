import Note from "../models/Note.js";
import User from "../models/User.js";

// Get all notes for the user's house
export const getNotes = async (req, res) => {
  try {
    if (!req.user.house) {
      return res
        .status(400)
        .json({ message: "You must be in a house to view notes" });
    }

    const notes = await Note.find({ house: req.user.house })
      .sort({ date: -1 })
      .lean();

    // Batch-fetch all referenced authors in a single query (replaces per-path populate)
    const authorIds = new Set();
    for (const note of notes) {
      if (note.createdBy) authorIds.add(note.createdBy.toString());
      for (const reply of note.replies || []) {
        if (reply.createdBy) authorIds.add(reply.createdBy.toString());
      }
    }

    const authors = authorIds.size
      ? await User.find({ _id: { $in: [...authorIds] } })
          .select("name username")
          .lean()
      : [];
    const authorById = new Map(authors.map((u) => [u._id.toString(), u]));

    const populated = notes.map((note) => ({
      ...note,
      createdBy: authorById.get(note.createdBy?.toString()) || null,
      replies: (note.replies || []).map((reply) => ({
        ...reply,
        createdBy: authorById.get(reply.createdBy?.toString()) || null,
      })),
    }));

    res.json(populated);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new note
export const createNote = async (req, res) => {
  try {
    const { content } = req.body;

    if (!req.user.house) {
      return res
        .status(400)
        .json({ message: "You must be in a house to create notes" });
    }

    const note = await Note.create({
      content,
      createdBy: req.user.id,
      house: req.user.house,
    });

    // Build the populated response directly - the creator is the authenticated user
    // and a new note never has replies, so no extra round-trips are needed.
    res.status(201).json({
      ...note.toObject(),
      createdBy: {
        _id: req.user.id,
        name: req.user.name,
        username: req.user.username,
      },
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check if user is authorized to delete (admin or creator)
    if (
      req.user.role !== "admin" &&
      note.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await note.deleteOne();
    res.json({ message: "Note deleted" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add a reply to a note
export const addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const reply = {
      content,
      createdBy: req.user.id,
    };

    note.replies.push(reply);
    await note.save();

    const populatedNote = await Note.findById(note._id)
      .populate("createdBy", "name username")
      .populate("replies.createdBy", "name username");

    res.json(populatedNote);
  } catch (error) {
    console.error("Add reply error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
