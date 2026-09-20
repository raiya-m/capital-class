import { capitalClassIndex } from "./market";
import { studentContext } from "./queries";
import { buildTrendData, previousClose, trendMovers } from "./trends";
import { formatMoneyExact, formatPct, formatTokens } from "./utils";

function impactLine(impacts: Record<string, number | undefined>) {
  return Object.entries(impacts)
    .filter(([, v]) => typeof v === "number")
    .map(([slug, v]) => `${slug} ${formatPct(v ?? 0)}`)
    .join(", ");
}

export async function liveCoachBriefing() {
  const ctx = await studentContext();
  const {
    profile,
    rank,
    wallet,
    invested,
    news,
    holdings,
    data,
    stats,
    classroom,
    question,
    myAnswer,
    powerups,
    history,
    prices,
  } = ctx;

  const trend = buildTrendData(history, data.sectors);
  const movers = trendMovers(trend, data.sectors);
  const index = capitalClassIndex(prices);
  const indexOpen = trend[0]?.INDEX ?? index;
  const indexTrend = indexOpen ? (index - indexOpen) / indexOpen : 0;
  const total = wallet.investmentCash + invested;
  const convertibleTokens = Math.floor(wallet.investmentCash / classroom.tokenCashRate);
  const target = classroom.baselineClassValue * (1 + classroom.goalReturnPct);

  const tape = data.sectors.map((sector) => {
    const close = previousClose(history, sector.slug, sector.price);
    const vsYesterday = close ? (sector.price - close) / close : 0;
    const start = trend[0]?.[sector.ticker];
    const vsStart = start ? (sector.price - start) / start : 0;
    return `${sector.name} (${sector.ticker}): ${formatMoneyExact(sector.price)}, vs yesterday ${formatPct(vsYesterday)}, vs chart start ${formatPct(vsStart)}`;
  });

  const book = holdings.length
    ? holdings.map((h) => {
        const sector = data.sectors.find((s) => s.slug === h.sectorSlug);
        const px = prices[h.sectorSlug] ?? 0;
        return `${sector?.name ?? h.sectorSlug} ${h.shares.toFixed(1)} shares at ${formatMoneyExact(px)} = ${formatMoneyExact(h.shares * px)}`;
      })
    : ["No shares. Cash only."];

  const bulletin = news.length
    ? news.map((item) => {
        const hits = impactLine(item.impacts);
        return `Session ${item.day}: ${item.headline}. ${item.body}${hits ? ` Impacts: ${hits}.` : ""}`;
      })
    : ["No incident bulletin yet."];

  const archive = data.news
    .filter((n) => n.classroomId === classroom.id)
    .sort((a, b) => b.day - a.day)
    .slice(0, 8)
    .map((item) => `Day ${item.day}: ${item.headline} (${impactLine(item.impacts) || "no priced move"})`);

  const recentTrades = data.trades
    .filter((t) => t.studentId === profile.id)
    .slice(0, 6)
    .map((t) => `${t.side} ${t.shares} ${t.sectorSlug} at ${formatMoneyExact(t.price)}`);

  const ownedPower = powerups.map((p) => {
    const def = data.powerupCatalog.find((c) => c.id === p.powerupId);
    return `${def?.name ?? p.powerupId} (${p.charges} charge${p.charges === 1 ? "" : "s"})`;
  });

  const leaderboard = stats.students
    .slice(0, 6)
    .map((row, i) => `#${i + 1} ${row.student.displayName} ${formatMoneyExact(row.value)}`);

  const recap = wallet.lastTickSummary
    ? `Last session recap: day ${wallet.lastTickSummary.day}, portfolio change ${formatMoneyExact(wallet.lastTickSummary.portfolioDelta)}, rank ${wallet.lastTickSummary.rank} of ${wallet.lastTickSummary.classmateCount}.${wallet.lastTickSummary.powerupNotes?.length ? ` Notes: ${wallet.lastTickSummary.powerupNotes.join("; ")}.` : ""}`
    : "No session recap yet.";

  const qotd = question
    ? `Prediction window: "${question.prompt}" Correct sector is ${question.correctSector}, reward ${formatMoneyExact(question.rewardCash)}. Student guess: ${
        myAnswer ? `${myAnswer.sector} (${myAnswer.correct ? "correct" : "incorrect"})` : "not answered yet"
      }.`
    : "No prediction question this session.";

  return [
    `Student: ${profile.displayName}. Classroom ${classroom.name}, session ${classroom.marketDay}. Rank ${rank} of ${stats.students.length}.`,
    `Wallet: ${formatTokens(wallet.unspentTokens)} unspent, ${formatTokens(wallet.savingsTokens)} savings, cash ${formatMoneyExact(wallet.investmentCash)}, holdings ${formatMoneyExact(invested)}, total ${formatMoneyExact(total)}.`,
    `Cash they could move back to savings right now: ${formatTokens(convertibleTokens)} (${formatMoneyExact(classroom.tokenCashRate)} per token, whole tokens only, free cash only).`,
    `Class field trip fund: ${formatMoneyExact(stats.classValue)} of ${formatMoneyExact(target)} target (${(classroom.goalReturnPct * 100).toFixed(0)}% goal).`,
    `CapitalClass Index: ${formatMoneyExact(index)}, vs chart start ${formatPct(indexTrend)}.`,
    `Live tape: ${tape.join(" | ")}`,
    `Chart movers: ${movers.map((m) => `${m.ticker} ${formatPct(m.change)}`).join(", ") || "none"}`,
    `This student's book: ${book.join("; ")}`,
    `Today's incident bulletin: ${bulletin.join(" ")}`,
    `Recent classroom news: ${archive.join(" ")}`,
    qotd,
    recap,
    `Power-ups: ${ownedPower.join(", ") || "none"}`,
    `Recent trades: ${recentTrades.join("; ") || "none"}`,
    `Leaderboard: ${leaderboard.join("; ")}`,
    `Rules: unspent tokens become savings tokens one for one, or market cash at ${formatMoneyExact(classroom.tokenCashRate)} each. Spare market cash can also go back the other way into savings tokens at the same rate, whole tokens only, and only cash that is not tied up in shares. Savings tokens buy rewards. Only investment cash and shares count for rank and the class goal, so moving cash into savings tokens lowers both their rank and the class field trip fund. News impacts move sector prices. Practice money only.`,
  ].join("\n");
}
