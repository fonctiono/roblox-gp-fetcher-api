import express from "express";
import { fetchAllUserGamePasses } from "./api/roblox.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/gamepasses/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await fetchAllUserGamePasses(userId);
    if (!result.gamePasses.length) {
      return res.status(404).json({ message: "No game passes found." });
    }
    res.json(result);
  } catch (error) {
    console.error("Error fetching game passes:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running clearly on port ${PORT}`);
});
