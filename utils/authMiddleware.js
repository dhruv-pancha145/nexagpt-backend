import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  // फ्रंटएंड से Headers में Authorization टोकन आएगा: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // टोकन को वेरीफाई करें
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // रिक्वेस्ट ऑब्जेक्ट में userId जोड़ दें ताकि आगे के राउट्स इसका इस्तेमाल कर सकें
    req.userId = decoded.userId;
    
    next(); // सब सही है, अगले फंक्शन पर जाओ
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

export default authMiddleware;