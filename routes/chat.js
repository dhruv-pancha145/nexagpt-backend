


// it is route used for new msg in any thread and that is msg gone into database((msg + reply from backend)-> store both in database)
/**
 * ============================================
 * POST /chat — FLOW DIAGRAM
 * ============================================
 *
 * [Frontend]                         [Backend]                         [Groq API]
 *     |                                  |                                  |
 *     |--- POST /api/chat -------------->|                                  |
 *     |    { threadId, message }         |                                  |
 *     |                                  |                                  |
 *     |                                  |--- 1. VALIDATE -------|          |
 *     |                                  |    check threadId,    |          |
 *     |                                  |    message present    |          |
 *     |                                  |<----------------------|          |
 *     |                                  |                                  |
 *     |                                  |--- 2. THREAD CHECK ---|          |
 *     |                                  |    if threadId not    |          |
 *     |                                  |    in DB -> create    |          |
 *     |                                  |    new thread          |          |
 *     |                                  |<----------------------|          |
 *     |                                  |                                  |
 *     |                                  |--- 3. SAVE & REPLY ----|         |
 *     |                                  |    a) save user msg   |          |
 *     |                                  |       in thread (DB)  |          |
 *     |                                  |                                  |
 *     |                                  |--- send message ---------------->|
 *     |                                  |                                  |
 *     |                                  |<------- AI reply ----------------|
 *     |                                  |                                  |
 *     |                                  |    b) save assistant   |         |
 *     |                                  |       reply in thread  |         |
 *     |                                  |       (DB)             |         |
 *     |                                  |<------------------------|        |
 *     |                                  |                                  |
 *     |<--- response ---------------------|                                  |
 *     |     { threadId, reply }          |                                  |
 *     |                                  |                                  |
 *
 * STEPS RECAP:
 * 1. Validate threadId & message in request body
 * 2. If threadId missing/not found in DB -> create new thread
 * 3. Save user message -> call AI API -> save assistant reply -> send response back
 */

// router.post("/chat", async(req,res) => {




import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/groqai.js";
import authMiddleware from "../utils/authMiddleware.js";

const router = express.Router();


// Get all threads for logged-in user
router.get("/thread", authMiddleware, async (req, res) => {
    try {
        const threads = await Thread.find({ userId: req.userId }).sort({ updatedAt: -1 });
        res.json(threads);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});

// Get one specific thread messages
router.get("/thread/:threadId", authMiddleware, async (req, res) => {
  try {
    const { threadId } = req.params; 
    const thread = await Thread.findOne({ threadId, userId: req.userId });  
    if (!thread) {
      return res.status(404).json({ error: "Thread not found or unauthorized" });
    }
    res.json(thread.messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

// Delete a thread
router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
   const { threadId } = req.params;
   try {
     const deleteThread = await Thread.findOneAndDelete({ threadId, userId: req.userId });

     if (!deleteThread) {
       return res.status(404).json({ error: "Thread not found or unauthorized" });
     }
     res.status(200).json({ success: "Thread deleted successfully" });
   } catch (err) {
     console.log(err);
     res.status(500).json({ error: "Failed to delete thread" });
   }
});

// Post a new message in a thread
router.post("/chat", authMiddleware, async (req, res) => {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }  

  try {
    let thread = await Thread.findOne({ threadId, userId: req.userId });

    if (!thread) {
         thread = new Thread({
            userId: req.userId, 
            threadId,
            title: message.length > 30 ? message.substring(0, 30) + "..." : message,
            messages: [{ role: "user", content: message }]
         });
    } else {
        thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getOpenAIAPIResponse(message);
    thread.messages.push({ role: "assistant", content: assistantReply });
    
    await thread.save();
    res.json({ reply: assistantReply });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;