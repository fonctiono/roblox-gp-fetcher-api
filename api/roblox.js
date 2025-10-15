import pLimit from "p-limit";
import { fetchData } from "./utils.js";

const concurrencyLimit = pLimit(5);

const fetchUserGames = async (userId, accessFilter) => {
  let cursor = "",
    games = [];
  do {
    const url = `https://games.roblox.com/v2/users/${userId}/games?accessFilter=${accessFilter}&limit=50&cursor=${cursor}`;
    const result = await fetchData(url);
    if (result?.data?.length) games.push(...result.data);
    cursor = result?.nextPageCursor || "";
  } while (cursor);
  return games;
};

const fetchGamePasses = async (universeId) => {
  let cursor = "",
    passes = [];
  do {
    const url = `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=100&cursor=${cursor}`;
    const result = await fetchData(url);
    if (result?.data?.length) passes.push(...result.data);
    cursor = result?.nextPageCursor || "";
  } while (cursor);
  return passes.filter((pass) => pass.price != null);
};

export const fetchAllUserGamePasses = async (userId) => {
  const games = await fetchUserGames(userId, 2);

  let results = [],
    batchSize = 5;
  for (let i = 0; i < games.length; i += batchSize) {
    const batch = games.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((game) => concurrencyLimit(() => fetchGamePasses(game.id)))
    );
    results.push(...batchResults.flat());
    await new Promise((r) => setTimeout(r, 300));
  }

  const uniquePasses = {};
  results.forEach((pass) => (uniquePasses[pass.id] = pass));

  return {
    totalGamesCount: games.length,
    totalGamePassesCount: Object.keys(uniquePasses).length,
    gamePasses: Object.values(uniquePasses),
  };
};
