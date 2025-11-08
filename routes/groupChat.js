import express from "express";
import mysql from "mysql2/promise";

const router = express.Router();

// Database connection (adjust based on your config)
const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "nibash",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) next();
    else res.status(401).json({ error: "Not authenticated" });
};

// Check authentication status
router.get("/auth/check", (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            authenticated: true,
            userId: req.session.userId,
            userName: req.session.userName || "User",
        });
    } else res.json({ authenticated: false });
});

// Logout
router.post("/auth/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Create a new group
router.post("/groups", isAuthenticated, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { name, description, members } = req.body;
        const userId = req.session.userId;

        await connection.beginTransaction();

        const [groupResult] = await connection.query(
            "INSERT INTO group_chats (name, description, created_by) VALUES (?, ?, ?)",
            [name, description, userId]
        );

        const groupId = groupResult.insertId;

        await connection.query(
            "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)",
            [groupId, userId, "admin"]
        );

        if (members && members.length > 0) {
            for (const member of members) {
                await connection.query(
                    "INSERT INTO group_members (group_id, user_id, profession) VALUES (?, ?, ?)",
                    [groupId, member.userId, member.profession]
                );
            }
        }

        await connection.commit();

        res.json({
            success: true,
            groupId,
            message: "Group created successfully",
        });
    } catch (error) {
        await connection.rollback();
        console.error("Error creating group:", error);
        res.status(500).json({ error: "Failed to create group" });
    } finally {
        connection.release();
    }
});

// Get all groups for current user
router.get("/groups", isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;

        const [groups] = await pool.query(
            `
      SELECT DISTINCT 
          gc.id, gc.name, gc.description, gc.created_at, gc.created_by,
          u.name as creator_name,
          (SELECT COUNT(*) FROM group_members WHERE group_id = gc.id AND is_active = TRUE) as member_count,
          (SELECT message FROM group_messages WHERE group_id = gc.id ORDER BY created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM group_messages WHERE group_id = gc.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
          (SELECT COUNT(*) FROM group_messages gm 
           WHERE gm.group_id = gc.id 
           AND gm.sender_id != ? 
           AND NOT EXISTS (
               SELECT 1 FROM message_read_status mrs 
               WHERE mrs.message_id = gm.id AND mrs.user_id = ?
           )) as unread_count
      FROM group_chats gc
      INNER JOIN group_members gm ON gc.id = gm.group_id
      INNER JOIN users u ON gc.created_by = u.id
      WHERE gm.user_id = ? AND gc.is_active = TRUE AND gm.is_active = TRUE
      ORDER BY COALESCE(last_message_time, gc.created_at) DESC
    `,
            [userId, userId, userId]
        );

        res.json({ success: true, groups });
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ error: "Failed to fetch groups" });
    }
});

// ... (rest of your routes remain same)

export default router;
