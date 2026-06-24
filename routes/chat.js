// import express from "express";
// import Thread from "../models/Thread.js";
// import getOpenAIAPIResponse from "../utils/groqai.js";

// const router = express.Router();

//test
// router.post("/test", async(req,res) => {
//     try {
//         const thread = new Thread ({
//             threadId: "xyz-" + Date.now(),
//             title:"Testing New Thread",
//         });
//         const response = await thread.save();
//         res.status(201).json(response);
//     } catch(err){
//         console.log(err);
//         res.status(500).json({error: "Failed to save in DB"});
//     }
// });

//Get all threads
// router.get("/thread", async(req,res) => {
//     try{
// const threads = await Thread.find({}).sort({updatedAt: -1});
//         //descending order of updateAt..most recent data on top
//         res.json(threads)
//     } catch(err) {
//         console.log(err);
//         res.status(500).json({error: "Failed to fetch threads"});
//     }
// });


// its return one spacific thread message's
// its return one spacific thread message's
// router.get("/thread/:threadId", async(req,res) => {
//   try {
//     const { threadId } = req.params; 
//     const thread = await Thread.findOne({threadId});  
//     if(!thread) {
//       return res.status(404).json({error:"Thread not found"});
//     }
//     res.json(thread.messages);
//   } catch(err) {
//     console.log(err);
//     res.status(500).json({error: "Failed to fetch chat"});
//   }
// });

//that is route useful Delete any thread on the bases of threadId
// router.delete("/thread/:threadId", async(req,res) => {
//        const {threadId} = req.params;
//    try {
//   const deleteThread = await Thread.findOneAndDelete({threadId});

//   if(!deleteThread) {
//     res.status(404).json({error:"Thread not found"});
//   }
//       res.status(200).json({success:"Thread deleted successfully"});

//    }catch(err) {
//     console.log(err);
//         res.status(500).json({error: "Failed to delete thread"});
//    }
// });


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


//   const { threadId, message } = req.body;
//     console.log("Received threadId:", threadId);  // ✅ add karo


//     // step 1 validate from thread id and message
//      if(!threadId || !message) {
//        return res.status(404).json({error:"missing require fields"})
//      }  

//      try{
//         let thread = await Thread.findOne({threadId});
// console.log("Thread found:", thread);  // ✅ add karo temporarily

//         if(!thread){
//             //create a new thread in Db
//              thread = new Thread({
//                 threadId,
//                 title: message,
//                 messages: [{role: "user", content: message}]
//              });
//         } else {
//             thread.messages.push({role: "user", content: message})
//         }

//        const assistantReply = await getOpenAIAPIResponse(message);
//             thread.messages.push({role: "assistant", content: assistantReply})
//             thread.updateAt = new Date();
//             await thread.save();
//              res.json({reply:assistantReply});
//      }catch(err) {
//         console.log(err);
//                 res.status(500).json({error: "Something went wrong"});

//      }

// });

// export default router;

import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/groqai.js";
// 1. Middleware इम्पोर्ट करें
import authMiddleware from "../utils/authMiddleware.js";

const router = express.Router();

// ==========================================
// सभी राउट्स में `authMiddleware` को पास किया गया है
// ==========================================

// Get all threads for logged-in user
router.get("/thread", authMiddleware, async (req, res) => {
    try {
        // 2. सिर्फ उसी यूजर के थ्रेड ढूंढें जो लॉग इन है (req.userId middleware से आ रहा है)
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
    // यूज़र केवल खुद का थ्रेड एक्सेस कर पाए, यह सुरक्षा सुनिश्चित की
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
         // 3. नया थ्रेड बनाते समय `userId` अटैच करें
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